"""
Data Governance Models — governance-service
EPIC-9: Data Catalog, Retention Policies, and Master Data Management.
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean, Enum
from datetime import datetime, timezone
import enum

from cds_shared.database import Base


class DataClassification(str, enum.Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    PII = "PII"


class DeletionStrategy(str, enum.Enum):
    HARD = "HARD"
    SOFT = "SOFT"
    ANONYMIZE = "ANONYMIZE"


class CatalogEntry(Base):
    """FEAT-9.1: Data Catalog — registered data assets."""
    __tablename__ = "catalog_entries"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    asset_type = Column(String(100), nullable=False)  # kafka_topic, pg_table, minio_dataset, flink_job
    location = Column(String(500), nullable=False)     # e.g. topic name, table name, bucket path
    owner_dept_id = Column(String(100))
    owner_name = Column(String(255))
    classification = Column(Enum(DataClassification), default=DataClassification.INTERNAL)
    tags = Column(JSON, default=list)                  # ["water", "sensor", "timeseries"]
    schema_definition = Column(JSON)                   # JSON Schema of the asset
    freshness_sla_seconds = Column(Integer, default=3600)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class RetentionPolicy(Base):
    """FEAT-9.2: Data Retention & Deletion Policies."""
    __tablename__ = "retention_policies"

    id = Column(Integer, primary_key=True)
    dataset_id = Column(Integer, nullable=False)  # References catalog_entries.id
    retention_days = Column(Integer, nullable=False)
    deletion_strategy = Column(Enum(DeletionStrategy), default=DeletionStrategy.SOFT)
    legal_hold = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class MasterEntity(Base):
    """FEAT-9.3: Master Data Management — golden records."""
    __tablename__ = "master_entities"

    id = Column(Integer, primary_key=True)
    entity_type = Column(String(50), nullable=False)   # Asset, Department, Location, BudgetLine
    canonical_name = Column(String(255), nullable=False)
    attributes = Column(JSON, nullable=False)
    source_records = Column(JSON, default=list)        # [{source: "water_dept", source_id: "W123"}, ...]
    confidence_score = Column(Integer, default=100)    # 0-100 merge confidence
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
