import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.incident import Incident, IncidentStatus, IncidentSeverity
from app.services.incident_service import IncidentService

client = TestClient(app)

@pytest.fixture
def test_incident():
    db = SessionLocal()
    incident = IncidentService.create_incident(
        db=db,
        source_ip="192.168.10.20",
        dest_ip="10.0.0.1",
        dest_port=443,
        attack_type="PortScan",
        severity=IncidentSeverity.MEDIUM,
        confidence=0.92
    )
    yield incident
    db.close()

def test_bot_summary_report(test_incident):
    response = client.get("/api/v1/bot/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_incidents" in data
    assert "status_breakdown" in data
    assert "latest_incidents" in data
    assert len(data["latest_incidents"]) > 0

def test_bot_update_incident_status(test_incident):
    payload = {
        "status": "RESOLVED",
        "reviewer": "TelegramAnalyst",
        "notes": "Bot inline tugmasi orqali tekshirildi"
    }
    response = client.post(f"/api/v1/bot/incidents/{test_incident.id}/status", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "RESOLVED"
    assert data["reviewed_by"] == "TelegramAnalyst"
