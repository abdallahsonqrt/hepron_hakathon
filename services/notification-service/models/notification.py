from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from datetime import datetime, timezone

from cds_shared.database import Base


class Notification(Base):
    """Persisted in-app notifications for delivery via WebSocket or polling."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    event_type = Column(String(100), nullable=False)
    message = Column(String(1000), nullable=False)
    dept_id = Column(String(100))
    severity = Column(String(10))
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
