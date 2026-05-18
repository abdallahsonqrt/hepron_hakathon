import json
import structlog
from confluent_kafka import Consumer, Producer, KafkaError
from sqlalchemy.orm import Session
from asteval import Interpreter
from datetime import datetime, timezone

from cds_shared.config import settings
from cds_shared.database import get_db, SessionLocal
from cds_shared.schemas.events import EventEnvelope, Topics
from models.kpi import KPIDefinition, KPIValue, KPIStatus

logger = structlog.get_logger(__name__)

class ComputationWorker:
    """
    Consumes from processed.* topics, evaluates KPI formulas,
    and stores results in the database while publishing to Kafka.
    """
    def __init__(self):
        self.consumer = Consumer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'group.id': 'cds-kpi-computation-group',
            'auto.offset.reset': 'earliest'
        })
        self.producer = Producer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS
        })
        self.aeval = Interpreter()
        # Subscribe to all processed department topics
        self.consumer.subscribe(['^processed\..*'])

    def evaluate_formula(self, formula, data):
        """Safely evaluate formula string using data context."""
        try:
            # Inject data into evaluation context
            # We prefix data keys with 'data.' or just use them directly if safe
            self.aeval.symtable.update(data)
            result = self.aeval(formula)
            return float(result) if result is not None else None
        except Exception as e:
            logger.error("formula_evaluation_failed", formula=formula, error=str(e))
            return None

    def determine_status(self, value, thresholds):
        """Categorize KPI value based on thresholds."""
        if value is None: return KPIStatus.STALE
        
        amber = thresholds.get('amber')
        red = thresholds.get('red')
        
        # This implementation assumes GREEN < AMBER < RED behavior
        # In a real system, the operator (>, <, etc) would be configurable per KPI
        if red is not None and value >= red: return KPIStatus.RED
        if amber is not None and value >= amber: return KPIStatus.AMBER
        return KPIStatus.GREEN

    def process_message(self, msg):
        try:
            data = json.loads(msg.value().decode('utf-8'))
            envelope = EventEnvelope(**data)
            processed_record = envelope.payload
            
            entity_type = processed_record.get('entity_type')
            dept_id = processed_record.get('dept_id')
            
            # 1. Fetch KPIs that depend on this entity_type
            db = SessionLocal()
            try:
                # Optimized: ideally we'd have a mapping table or filter in SQL
                # For MVP, we fetch all and check formula/metadata
                kpis = db.query(KPIDefinition).filter(
                    KPIDefinition.owner_dept_id == dept_id,
                    KPIDefinition.is_active == True
                ).all()
                
                for kpi in kpis:
                    # check if this kpi should be updated by this data
                    # (Simple heuristic for MVP: if formula uses keys present in data)
                    
                    value = self.evaluate_formula(kpi.formula, processed_record.get('data', {}))
                    if value is not None:
                        status = self.determine_status(value, kpi.thresholds)
                        
                        # 2. Store in DB
                        kpi_val = KPIValue(
                            kpi_id=kpi.id,
                            value=value,
                            status=status,
                            computed_at=datetime.now(timezone.utc),
                            formula_version=kpi.version,
                            source_record_ids=[processed_record.get('record_id')]
                        )
                        db.add(kpi_val)
                        db.commit()
                        
                        # 3. Publish computed event
                        topic = Topics.kpi_computed(str(kpi.id))
                        computed_envelope = EventEnvelope(
                            event_type="kpi_computed",
                            source_service=settings.SERVICE_NAME,
                            payload={
                                "kpi_id": kpi.id,
                                "name": kpi.name,
                                "value": value,
                                "unit": kpi.unit,
                                "status": status,
                                "dept_id": dept_id
                            }
                        )
                        self.producer.produce(
                            topic,
                            json.dumps(computed_envelope.model_dump(mode='json')).encode('utf-8')
                        )
                        self.producer.flush()
                        
                        logger.info("kpi_computed", kpi_id=kpi.id, value=value, status=status)
            finally:
                db.close()
                
        except Exception as e:
            logger.error("computation_failed", error=str(e))

    def run(self):
        logger.info("computation_worker_started")
        try:
            while True:
                msg = self.consumer.poll(1.0)
                if msg is None: continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF: continue
                    else:
                        logger.error("kafka_error", error=str(msg.error()))
                        break
                
                self.process_message(msg)
        finally:
            self.consumer.close()
