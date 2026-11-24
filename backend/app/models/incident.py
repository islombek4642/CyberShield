import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from datetime import datetime, timezone
from app.core.database import Base

class IncidentSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class IncidentStatus(str, enum.Enum):
    NEW = "NEW"
    IN_REVIEW = "IN_REVIEW"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    source_ip = Column(String(45), nullable=False)
    dest_ip = Column(String(45), nullable=False)
    dest_port = Column(Integer, nullable=False)
    protocol = Column(String(20), default="TCP")
    attack_type = Column(String(50), index=True, nullable=False)
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM, index=True)
    confidence = Column(Float, default=1.0)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.NEW, index=True)
    reviewed_by = Column(String(50), nullable=True)
    resolution_notes = Column(Text, nullable=True)
