"""
Notification Delivery Worker — notification-service
Consumes notification.send events and dispatches to Email and In-App channels.
Implements FEAT-14.2.1 (Email) and FEAT-14.2.2 (In-App).
"""
import json
import smtplib
import structlog
from confluent_kafka import Consumer, KafkaError
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

from cds_shared.config import settings
from cds_shared.database import SessionLocal
from cds_shared.schemas.events import EventEnvelope, Topics

logger = structlog.get_logger(__name__)


def _send_email(to_addresses: list, subject: str, body_html: str):
    """Send an HTML email via SMTP."""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USER
        msg['To'] = ', '.join(to_addresses)
        msg.attach(MIMEText(body_html, 'html'))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_addresses, msg.as_string())

        logger.info("email_sent", to=to_addresses, subject=subject)
    except Exception as e:
        logger.error("email_failed", error=str(e), to=to_addresses)


def _persist_in_app_notification(payload: dict, db):
    """Persist notification to DB for in-app delivery via WebSocket."""
    from models.notification import Notification
    notif = Notification(
        event_type=payload.get('event_type'),
        message=payload.get('message'),
        dept_id=payload.get('dept_id'),
        severity=payload.get('severity'),
        metadata_json=payload,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notif)
    db.commit()


class NotificationDeliveryWorker:
    def __init__(self):
        self.consumer = Consumer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'group.id': 'cds-notification-delivery-group',
            'auto.offset.reset': 'earliest'
        })
        self.consumer.subscribe([Topics.NOTIFICATION_SEND])

    def process_message(self, msg):
        try:
            data = json.loads(msg.value().decode('utf-8'))
            envelope = EventEnvelope(**data)
            payload = envelope.payload

            severity = payload.get('severity', 'P3')
            dept_id = payload.get('dept_id', 'unknown')
            kpi_name = payload.get('kpi_name', 'Unknown KPI')
            kpi_value = payload.get('kpi_value')
            unit = payload.get('unit', '')
            message = payload.get('message', '')

            # ── 1. In-App Notification (for all severities) ─────────
            db = SessionLocal()
            try:
                _persist_in_app_notification(
                    {**payload, 'event_type': 'alert_triggered'},
                    db
                )
            finally:
                db.close()

            # ── 2. Email Notification (for P1 and P2) ───────────────
            if severity in ('P1', 'P2'):
                html_body = f"""
                <html><body>
                <h2 style="color: {'red' if severity=='P1' else 'orange'}">
                    [{severity}] CDS Alert: {kpi_name}
                </h2>
                <p><strong>Department:</strong> {dept_id.upper()}</p>
                <p><strong>Current Value:</strong> {kpi_value} {unit}</p>
                <p><strong>Details:</strong> {message}</p>
                <hr>
                <small>City Operating System — Automated Alert</small>
                </body></html>
                """
                # In production, recipients would be fetched from the user/dept DB.
                # For MVP, this logs the intent; SMTP config is environment-driven.
                if settings.SMTP_USER:
                    _send_email(
                        to_addresses=[settings.SMTP_USER],  # placeholdr
                        subject=f"[{severity}] CDS Alert: {kpi_name} breached",
                        body_html=html_body
                    )
                else:
                    logger.info(
                        "email_skipped_no_smtp_configured",
                        severity=severity,
                        kpi_name=kpi_name
                    )

            logger.info("notification_processed", severity=severity, dept_id=dept_id)

        except Exception as e:
            logger.error("notification_delivery_failed", error=str(e))

    def run(self):
        logger.info("notification_worker_started")
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
