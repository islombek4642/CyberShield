from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.incident import IncidentStatus, IncidentSeverity

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    source_ip: str
    dest_ip: str
    dest_port: int
    protocol: str
    attack_type: str
    severity: IncidentSeverity
    confidence: float
    status: IncidentStatus
    reviewed_by: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    reviewer: Optional[str] = "analyst"
    notes: Optional[str] = None
