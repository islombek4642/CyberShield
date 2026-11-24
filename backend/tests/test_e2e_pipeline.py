import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_intrusion_detection_flow():
    # 1. Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"

    # 2. Register & Login Analyst
    username = "e2e_analyst"
    reg_res = client.post("/api/v1/auth/register", json={
        "username": username,
        "email": "analyst_e2e@cybershield.local",
        "password": "SecurePassword2026!",
        "role": "analyst"
    })
    assert reg_res.status_code in [200, 400]

    login_res = client.post("/api/v1/auth/login", json={
        "username": username,
        "password": "SecurePassword2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Model Metrics & Evaluation
    metrics_res = client.get("/api/v1/models/metrics?dataset_type=CIC-IDS2017")
    assert metrics_res.status_code == 200
    metrics_data = metrics_res.json()
    assert "accuracy" in metrics_data
    assert "confusion_matrix" in metrics_data

    # 4. Predict malicious NetFlow (DDoS attack)
    flow_payload = {
        "Destination Port": 80,
        "Flow Duration": 180000,
        "Total Fwd Packets": 400,
        "Total Backward Packets": 1,
        "Total Length of Fwd Packets": 500000,
        "Fwd Packet Length Max": 1400,
        "Fwd Packet Length Min": 40,
        "Flow Bytes/s": 3500000.0,
        "Flow Packets/s": 2222.0,
        "Flow IAT Mean": 450.0
    }
    pred_res = client.post("/api/v1/models/predict?dataset_type=CIC-IDS2017", json=flow_payload)
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert pred_data["is_attack"] is True
    assert pred_data["severity"] in ["CRITICAL", "HIGH"]

    # 5. Check Incidents & SIEM list
    inc_res = client.get("/api/v1/incidents/", headers=headers)
    assert inc_res.status_code == 200
    incidents = inc_res.json()
    assert len(incidents) > 0

    first_incident = incidents[0]
    inc_id = first_incident["id"]

    # 6. Resolve Incident via API
    resolve_res = client.patch(f"/api/v1/incidents/{inc_id}/status", json={
        "status": "RESOLVED",
        "reviewer": username,
        "notes": "E2E test verification complete"
    }, headers=headers)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # 7. Verify Telegram Bot Summary reflects incident
    bot_res = client.get("/api/v1/bot/summary")
    assert bot_res.status_code == 200
    bot_data = bot_res.json()
    assert bot_data["total_incidents"] > 0
