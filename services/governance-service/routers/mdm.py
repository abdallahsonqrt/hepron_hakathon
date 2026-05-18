"""
Master Data Management API — governance-service
FEAT-9.3: Entity resolution and golden record management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import structlog

from cds_shared.database import get_db
from models.governance import MasterEntity

router = APIRouter(prefix="/v1/mdm", tags=["master_data"])
logger = structlog.get_logger(__name__)


class MasterEntityCreate(BaseModel):
    entity_type: str
    canonical_name: str
    attributes: dict
    source_records: list = []


@router.post("/entities", status_code=status.HTTP_201_CREATED)
def create_golden_record(entity: MasterEntityCreate, db: Session = Depends(get_db)):
    """Create a new golden record in the master data store."""
    db_entity = MasterEntity(**entity.model_dump())
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    logger.info("golden_record_created", type=entity.entity_type, name=entity.canonical_name)
    return db_entity


@router.get("/entities")
def list_entities(entity_type: Optional[str] = None, db: Session = Depends(get_db)):
    """List all golden records, optionally filtered by entity type."""
    query = db.query(MasterEntity)
    if entity_type:
        query = query.filter(MasterEntity.entity_type == entity_type)
    return query.all()


@router.post("/resolve")
def resolve_entity(
    entity_type: str,
    partial_name: str,
    db: Session = Depends(get_db)
):
    """
    FEAT-9.3.3: Entity resolution — find the canonical master record
    that best matches a partial entity description.
    """
    candidates = db.query(MasterEntity).filter(
        MasterEntity.entity_type == entity_type,
        MasterEntity.canonical_name.ilike(f"%{partial_name}%")
    ).all()

    if not candidates:
        raise HTTPException(status_code=404, detail="No matching master entity found")

    # Return the best match (highest confidence)
    best = max(candidates, key=lambda c: c.confidence_score)
    return {
        "resolved_entity_id": best.id,
        "canonical_name": best.canonical_name,
        "confidence_score": best.confidence_score,
        "source_records": best.source_records,
        "total_candidates": len(candidates)
    }
