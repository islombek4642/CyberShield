from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.models.incident import Incident, IncidentStatus, IncidentSeverity

class IncidentService:
    @staticmethod
    def create_incident(
        db: Session,
        source_ip: str,
        dest_ip: str,
        dest_port: int,
        attack_type: str,
        severity: IncidentSeverity = IncidentSeverity.MEDIUM,
        confidence: float = 1.0,
        protocol: str = "TCP"
    ) -> Incident:
        incident = Incident(
            timestamp=datetime.now(timezone.utc),
            source_ip=source_ip,
            dest_ip=dest_ip,
            dest_port=dest_port,
            protocol=protocol,
            attack_type=attack_type,
            severity=severity,
            confidence=confidence,
            status=IncidentStatus.NEW
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def update_status(
        db: Session,
        incident_id: int,
        new_status: IncidentStatus,
        reviewer: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Incident:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Insident #{incident_id} topilmadi")
            
        incident.status = new_status
        if reviewer:
            incident.reviewed_by = reviewer
        if notes:
            incident.resolution_notes = notes
            
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def list_incidents(
        db: Session,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        attack_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Incident]:
        query = db.query(Incident)
        if status:
            query = query.filter(Incident.status == status)
        if severity:
            query = query.filter(Incident.severity == severity)
        if attack_type:
            query = query.filter(Incident.attack_type == attack_type)
        return query.order_by(Incident.timestamp.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_summary_stats(db: Session) -> dict:
        total = db.query(Incident).count()
        new_cnt = db.query(Incident).filter(Incident.status == IncidentStatus.NEW).count()
        in_review = db.query(Incident).filter(Incident.status == IncidentStatus.IN_REVIEW).count()
        resolved = db.query(Incident).filter(Incident.status == IncidentStatus.RESOLVED).count()
        fp_cnt = db.query(Incident).filter(Incident.status == IncidentStatus.FALSE_POSITIVE).count()
        
        # Severity breakdown
        critical = db.query(Incident).filter(Incident.severity == IncidentSeverity.CRITICAL).count()
        high = db.query(Incident).filter(Incident.severity == IncidentSeverity.HIGH).count()
        
        return {
            "total_incidents": total,
            "new": new_cnt,
            "in_review": in_review,
            "resolved": resolved,
            "false_positive": fp_cnt,
            "critical": critical,
            "high": high
        }
