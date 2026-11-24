import pytest
from app.core.database import SessionLocal
from app.models.incident import Incident, IncidentStatus, IncidentSeverity
from app.services.incident_service import IncidentService

@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_incident_creation_and_status_transition(db):
    incident = IncidentService.create_incident(
        db=db,
        source_ip="192.168.1.105",
        dest_ip="10.0.0.1",
        dest_port=80,
        protocol="TCP",
        attack_type="DDoS",
        severity=IncidentSeverity.HIGH,
        confidence=0.98
    )
    assert incident.id is not None
    assert incident.status == IncidentStatus.NEW
    assert incident.attack_type == "DDoS"

    # Status transition to IN_REVIEW
    updated = IncidentService.update_status(
        db=db,
        incident_id=incident.id,
        new_status=IncidentStatus.IN_REVIEW,
        reviewer="analyst_bob",
        notes="Tekshiruv boshlandi"
    )
    assert updated.status == IncidentStatus.IN_REVIEW
    assert updated.reviewed_by == "analyst_bob"

    # Status transition to RESOLVED
    resolved = IncidentService.update_status(
        db=db,
        incident_id=incident.id,
        new_status=IncidentStatus.RESOLVED,
        reviewer="soc_lead",
        notes="Trafik IP darajasida bloklandi"
    )
    assert resolved.status == IncidentStatus.RESOLVED
