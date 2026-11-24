from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.incident_service import IncidentService
from app.schemas.incident import IncidentResponse, IncidentStatusUpdate

router = APIRouter(prefix="/incidents", tags=["Incidents & SIEM"])

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    attack_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Barcha aniqlangan insidentlar ro'yxatini filtrlar bilan olish."""
    return IncidentService.list_incidents(db, status=status, severity=severity, attack_type=attack_type, limit=limit, offset=offset)

@router.get("/summary")
def get_incident_summary(db: Session = Depends(get_db)):
    """KPI ko'rsatkichlari: yangi, ko'rib chiqilmoqda, hal qilingan, soxta signallar."""
    return IncidentService.get_summary_stats(db)

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int,
    status_in: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    """Insident holatini yangilash (Resolve, In Review, False Positive)."""
    try:
        return IncidentService.update_status(
            db=db,
            incident_id=incident_id,
            new_status=status_in.status,
            reviewer=status_in.reviewer,
            notes=status_in.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
