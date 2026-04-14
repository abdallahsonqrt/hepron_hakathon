import json
import structlog
from confluent_kafka import Consumer, Producer, KafkaError
from datetime import datetime, timezone

from cds_shared.config import settings
from cds_shared.schemas.events import EventEnvelope, Topics
from cds_shared.schemas.canonical import CanonicalRecord

logger = structlog.get_logger(__name__)

class StandardizationWorker:
    """
    Consumes from raw.* topics, standardizes data into CDM, 
    and publishes to processed.* topics.
    In a full production system, this would be an Apache Flink job.
    """
    def __init__(self):
        self.consumer = Consumer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'group.id': 'cds-processing-group',
            'auto.offset.reset': 'earliest'
        })
        self.producer = Producer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS
        })
        # Subscribe to all raw department topics
        self.consumer.subscribe(['^raw\..*'])

    def process_message(self, msg):
        try:
            data = json.loads(msg.value().decode('utf-8'))
            envelope = EventEnvelope(**data)
            
            payload = envelope.payload
            dept_id = payload.get('dept_id')
            entity_type = payload.get('entity_type')
            
            # 1. Basic Cleaning & Standardization
            # (Example: Ensuring units are standard, timestamps are ISO)
            processed_data = payload.get('data', {})
            
            # 2. Create Canonical Record
            canonical = CanonicalRecord(
                source=envelope.source_service,
                entity_type=entity_type,
                dept_id=dept_id,
                data=processed_data,
                raw_hash=CanonicalRecord.compute_hash(payload.get('data', {})),
                ingested_at=envelope.timestamp,
                processed_at=datetime.now(timezone.utc),
                quality_score=1.0 # In real system, this would be computed by Great Expectations
            )
            
            # 3. Publish to Processed Topic
            target_topic = Topics.processed(dept_id, entity_type)
            result_envelope = EventEnvelope(
                event_type="data_standardized",
                source_service=settings.SERVICE_NAME,
                payload=canonical.model_dump(),
                trace_id=envelope.trace_id,
                correlation_id=envelope.correlation_id
            )
            
            self.producer.produce(
                target_topic, 
                json.dumps(result_envelope.model_dump(mode='json')).encode('utf-8')
            )
            self.producer.flush()
            
            logger.info("message_processed", topic=msg.topic(), target=target_topic, record_id=canonical.record_id)
            
        except Exception as e:
            logger.error("processing_failed", error=str(e), topic=msg.topic())
            # For MVP, we skip. In production, route to DLQ.

    def run(self):
        logger.info("processing_worker_started")
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
