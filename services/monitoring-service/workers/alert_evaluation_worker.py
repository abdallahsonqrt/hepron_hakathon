"""
Alert Evaluation Worker — monitoring-service
Consumes kpi.computed.* events, evaluates alert rules,
and publishes notification events when thresholds are breached.
"""
import json
import structlog
from confluent_kafka import Consumer, Producer, KafkaError
from datetime import datetime, timezone, timedelta

from cds_shared.config import settings
from cds_shared.database import SessionLocal
from cds_shared.schemas.events import EventEnvelope, Topics
from models.alerts import AlertRule, Incident, AlertStatus, AlertSeverity

logger = structlog.get_logger(__name__)


class AlertEvaluationWorker:
    """
    Consumes from kpi.computed.* topics, evaluates active alert rules,
    and creates Incidents + publishes notification events.
    """
    def __init__(self):
        self.consumer = Consumer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'group.id': 'cds-alert-evaluation-group',
            'auto.offset.reset': 'earliest'
        })
        self.producer = Producer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS
        })
        self.consumer.subscribe(['^kpi\.computed\..*'])
        # In-memory cooldown tracker: {rule_id: last_fired_at}
        self._cooldowns: dict = {}

    def _is_in_cooldown(self, rule: AlertRule) -> bool:
        last_fired = self._cooldowns.get(rule.id)
        if last_fired is None:
            return False
        cooldown_expiry = last_fired + timedelta(minutes=rule.cooldown_minutes)
        return datetime.now(timezone.utc) < cooldown_expiry

    def _evaluate_condition(self, condition: dict, value: float) -> bool:
        """
        Evaluate a rule condition against a KPI value.
        Condition: {"operator": ">", "value": 80}
        """
        operator = condition.get('operator', '>')
        threshold = condition.get('value', 0)
        if operator == '>':  return value > threshold
        if operator == '>=': return value >= threshold
        if operator == '<':  return value < threshold
        if operator == '<=': return value <= threshold
        if operator == '==': return value == threshold
        return False

    def process_message(self, msg):
        try:
            data = json.loads(msg.value().decode('utf-8'))
            envelope = EventEnvelope(**data)
            kpi_payload = envelope.payload

            kpi_id = kpi_payload.get('kpi_id')
            value = kpi_payload.get('value')

            if value is None:
                return

            db = SessionLocal()
            try:
                rules = db.query(AlertRule).filter(
                    AlertRule.kpi_id == kpi_id,
                    AlertRule.is_active == True
                ).all()

                for rule in rules:
                    if self._is_in_cooldown(rule):
                        continue

                    if self._evaluate_condition(rule.condition, value):
                        # Breach detected — create Incident
                        incident = Incident(
                            rule_id=rule.id,
                            kpi_id=str(kpi_id),
                            severity=rule.severity,
                            status=AlertStatus.OPEN,
                            message=(
                                f"KPI '{kpi_payload.get('name')}' breached. "
                                f"Value: {value} {kpi_payload.get('unit', '')} "
                                f"(Rule: {rule.name})"
                            ),
                            triggered_at=datetime.now(timezone.utc),
                            metadata_json={
                                'kpi_value': value,
                                'condition': rule.condition,
                                'dept_id': kpi_payload.get('dept_id')
                            }
                        )
                        db.add(incident)
                        db.commit()
                        db.refresh(incident)

                        # Record cooldown
                        self._cooldowns[rule.id] = datetime.now(timezone.utc)

                        # Publish notification event
                        notification_envelope = EventEnvelope(
                            event_type="alert_triggered",
                            source_service=settings.SERVICE_NAME,
                            payload={
                                'incident_id': incident.id,
                                'rule_name': rule.name,
                                'kpi_name': kpi_payload.get('name'),
                                'kpi_value': value,
                                'unit': kpi_payload.get('unit'),
                                'dept_id': kpi_payload.get('dept_id'),
                                'severity': rule.severity,
                                'message': incident.message,
                                'triggered_at': incident.triggered_at.isoformat()
                            }
                        )
                        self.producer.produce(
                            Topics.NOTIFICATION_SEND,
                            json.dumps(notification_envelope.model_dump(mode='json')).encode('utf-8')
                        )
                        self.producer.flush()
                        logger.info("alert_fired", incident_id=incident.id, rule=rule.name, value=value)

            finally:
                db.close()

        except Exception as e:
            logger.error("alert_evaluation_failed", error=str(e))

    def run(self):
        logger.info("alert_evaluation_worker_started")
        try:
            while True:
                msg = self.consumer.poll(1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        logger.error("kafka_error", error=str(msg.error()))
                        break
                self.process_message(msg)
        finally:
            self.consumer.close()
