from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.models.incident import Incident, IncidentStatus, IncidentSeverity
from app.models.bot_link import BotLink
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/bot", tags=["Telegram Bot API"])

@router.get("/summary")
def get_bot_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Telegram bot uchun umumiy xavfsizlik hisoboti va oxirgi hodisalar."""
    stats = IncidentService.get_summary_stats(db)
    recent_incidents = db.query(Incident).order_by(Incident.timestamp.desc()).limit(5).all()
    
    incident_items = [
        {
            "id": inc.id,
            "attack_type": inc.attack_type,
            "severity": inc.severity.value,
            "source_ip": inc.source_ip,
            "dest_ip": inc.dest_ip,
            "status": inc.status.value,
            "timestamp": inc.timestamp.strftime("%H:%M:%S")
        }
        for inc in recent_incidents
    ]
    
    return {
        "total_incidents": stats["total_incidents"],
        "critical_count": stats["critical"],
        "high_count": stats["high"],
        "status_breakdown": stats,
        "latest_incidents": incident_items
    }

@router.post("/incidents/{incident_id}/status")
def update_incident_from_bot(
    incident_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Telegram bot inline tugmasi orqali insident holatini yangilash."""
    new_status_str = payload.get("status", "RESOLVED")
    reviewer = payload.get("reviewer", "TelegramBot")
    notes = payload.get("notes", "Telegram inline action")
    
    try:
        new_status = getattr(IncidentStatus, new_status_str, IncidentStatus.RESOLVED)
        updated = IncidentService.update_status(
            db=db,
            incident_id=incident_id,
            new_status=new_status,
            reviewer=reviewer,
            notes=notes
        )
        return {
            "status": updated.status.value,
            "incident_id": updated.id,
            "reviewed_by": updated.reviewed_by
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/link")
def link_telegram_account(
    chat_id: int = Body(..., embed=True),
    link_code: str = Body(..., embed=True),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Telegram hisobini CyberShield web-profili bilan bog'lash."""
    link = db.query(BotLink).filter(BotLink.link_code == link_code).first()
    if not link:
        # Yangi ulanish yaratish
        link = BotLink(telegram_chat_id=chat_id, link_code=link_code, is_active=True)
        db.add(link)
    else:
        link.telegram_chat_id = chat_id
        link.is_active = True
    db.commit()
    return {"status": "success", "message": "Telegram hisobi muvaffaqiyatli bog'landi!"}
