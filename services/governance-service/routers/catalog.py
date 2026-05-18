"""
Data Catalog API — governance-service
FEAT-9.1: Browse, register, and manage data assets.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
import structlog

from cds_shared.database import get_db
from models.governance import CatalogEntry, DataClassification

router = APIRouter(prefix="/v1/catalog", tags=["data_catalog"])
logger = structlog.get_logger(__name__)


class CatalogEntryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    asset_type: str
    location: str
    owner_dept_id: Optional[str] = None
    owner_name: Optional[str] = None
    classification: str = "INTERNAL"
    tags: list = []
    schema_definition: Optional[dict] = None
    freshness_sla_seconds: int = 3600


class CatalogEntryResponse(CatalogEntryCreate):
    id: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.post("/", status_code=status.HTTP_201_CREATED)
def register_asset(entry: CatalogEntryCreate, db: Session = Depends(get_db)):
    """Register a new data asset in the catalog."""
    db_entry = CatalogEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    logger.info("catalog_entry_created", asset=entry.name, type=entry.asset_type)
    return db_entry


@router.get("/")
def list_assets(
    asset_type: Optional[str] = None,
    classification: Optional[str] = None,
    dept_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Browse the data catalog with optional filters."""
    query = db.query(CatalogEntry)
    if asset_type:
        query = query.filter(CatalogEntry.asset_type == asset_type)
    if classification:
        query = query.filter(CatalogEntry.classification == classification)
    if dept_id:
        query = query.filter(CatalogEntry.owner_dept_id == dept_id)
    if search:
        query = query.filter(CatalogEntry.name.ilike(f"%{search}%"))
    return query.all()


@router.get("/{entry_id}")
def get_asset(entry_id: int, db: Session = Depends(get_db)):
    """Get a specific catalog entry."""
    entry = db.query(CatalogEntry).filter(CatalogEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Catalog entry not found")
    return entry


@router.put("/{entry_id}/classification")
def update_classification(
    entry_id: int,
    classification: str,
    db: Session = Depends(get_db)
):
    """Update the data classification tag on a catalog entry."""
    entry = db.query(CatalogEntry).filter(CatalogEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Catalog entry not found")
    entry.classification = classification
    db.commit()
    logger.info("classification_updated", entry_id=entry_id, classification=classification)
    return entry
