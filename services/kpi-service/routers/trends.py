from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import structlog

from cds_shared.database import get_db
from models.kpi import KPIValue, KPIDefinition

router = APIRouter(prefix="/v1/kpis", tags=["trends"])
logger = structlog.get_logger(__name__)


@router.get("/{kpi_id}/history")
def get_kpi_history(
    kpi_id: int,
    from_dt: Optional[datetime] = Query(None, alias="from"),
    to_dt: Optional[datetime] = Query(None, alias="to"),
    limit: int = Query(500, le=2000),
    db: Session = Depends(get_db)
):
    """
    Return time-series history for a KPI.
    TASK-3.3.1: Supports from/to filtering.
    """
    kpi = db.query(KPIDefinition).filter(KPIDefinition.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")

    query = db.query(KPIValue).filter(KPIValue.kpi_id == kpi_id)
    if from_dt:
        query = query.filter(KPIValue.computed_at >= from_dt)
    if to_dt:
        query = query.filter(KPIValue.computed_at <= to_dt)

    results = query.order_by(KPIValue.computed_at.desc()).limit(limit).all()

    return {
        "kpi_id": kpi_id,
        "kpi_name": kpi.name,
        "unit": kpi.unit,
        "count": len(results),
        "data": [
            {
                "value": r.value,
                "status": r.status,
                "computed_at": r.computed_at.isoformat()
            } for r in results
        ]
    }


@router.get("/{kpi_id}/latest")
def get_kpi_latest(kpi_id: int, db: Session = Depends(get_db)):
    """Return the most recent computed value for a KPI."""
    kpi = db.query(KPIDefinition).filter(KPIDefinition.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")

    latest = (
        db.query(KPIValue)
        .filter(KPIValue.kpi_id == kpi_id)
        .order_by(KPIValue.computed_at.desc())
        .first()
    )

    if not latest:
        return {
            "kpi_id": kpi_id,
            "kpi_name": kpi.name,
            "value": None,
            "status": "STALE",
            "computed_at": None
        }

    return {
        "kpi_id": kpi_id,
        "kpi_name": kpi.name,
        "unit": kpi.unit,
        "value": latest.value,
        "status": latest.status,
        "computed_at": latest.computed_at.isoformat()
    }
