# CyberShield Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an end-to-end Network Intrusion Detection & SOC Dashboard platform (CyberShield) featuring real-time attack simulation, dual dataset support (CIC-IDS2017 and UNSW-NB15), ML-based classification, PostgreSQL audit storage, and Telegram Serverless incident alerts with interactive response buttons.

**Architecture:** A multi-tier architecture where a Python FastAPI backend cleans and processes network traffic flows, runs high-recall ML intrusion detection models, streams real-time traffic via WebSockets, and dispatches critical security alerts. The React/TypeScript frontend presents a dark-mode SOC dashboard with live metrics, confusion matrices, and incident tables, while an autonomous Telegram Serverless bot (`@tgcloud/cli`) handles mobile alerts and analyst inline responses.

**Tech Stack:** Python 3.14, FastAPI, PostgreSQL 18, SQLAlchemy, Scikit-learn, LightGBM, Pandas, NumPy, React 19, TypeScript, Tailwind CSS, Vite, Chart.js, Telegram Serverless SDK (`@tgcloud/cli`).

**Spec:** [docs/superpowers/specs/2026-11-24-cybershield-network-intrusion-detection-design.md](file:///c:/CyberShield/docs/superpowers/specs/2026-11-24-cybershield-network-intrusion-detection-design.md)

## Global Constraints

- Python 3.14 compatible syntax and typing.
- All secret credentials (tokens, passwords, keys) must strictly reside in `.env` and be git-ignored.
- No direct hardcoded SQL; all database queries must use SQLAlchemy ORM with parameterized execution.
- Strict Pydantic v2 validation for all API inputs and outputs.
- High recall priority in intrusion detection models to prevent undetected security breaches (minimal False Negatives).
- Clean code, DRY, SOLID, and explicit error handling as mandated in `AGENTS.md`.

## Review Focus

1. **Extreme values in NetFlow data:** Handling of `+inf`, `-inf`, and `NaN` flow durations or packet rates without crashing the backend or model inference.
2. **Schema divergence between CIC-IDS2017 and UNSW-NB15:** Robust automatic schema detection without throwing unhandled exceptions on unexpected CSV columns.
3. **Imbalanced dataset classification:** Evaluation ensuring rare attacks (e.g., Infiltration, Botnet) achieve non-zero recall rather than being classified as Benign.
4. **WebSocket stream resilience:** Proper resource cleanup and error trapping when the browser frontend disconnects unexpectedly during high-rate traffic streaming.
5. **Telegram Serverless webhook callback reliability:** Idempotent status transitions for security incidents triggered via bot inline buttons.

---

### Task 1: Dataset Samples & Automatic Schema Detection Engine

**Files:**
- Create: `datasets/samples/generate_samples.py`
- Create: `backend/app/services/dataset_service.py`
- Create: `backend/tests/test_dataset_service.py`

**Interfaces:**
- Produces: `DatasetDetector.detect_schema(columns: list[str]) -> str`
- Produces: `DatasetCleaner.clean_flow_dataframe(df: pd.DataFrame, schema_type: str) -> pd.DataFrame`

- [ ] **Step 1: Write the failing test for schema detection and data cleaning**

```python
# backend/tests/test_dataset_service.py
import pytest
import pandas as pd
import numpy as np
from app.services.dataset_service import DatasetDetector, DatasetCleaner

def test_detect_cic_ids_schema():
    cols = ["Destination Port", "Flow Duration", "Total Fwd Packets", "Label"]
    assert DatasetDetector.detect_schema(cols) == "CIC-IDS2017"

def test_detect_unsw_schema():
    cols = ["dur", "proto", "service", "sbytes", "dbytes", "attack_cat", "label"]
    assert DatasetDetector.detect_schema(cols) == "UNSW-NB15"

def test_detect_unknown_schema():
    cols = ["col1", "col2", "col3"]
    with pytest.raises(ValueError):
        DatasetDetector.detect_schema(cols)

def test_clean_flow_dataframe_handles_inf_and_nan():
    raw_data = {
        "Destination Port": [80, 443, 22],
        "Flow Duration": [1000, np.inf, 500],
        "Total Fwd Packets": [2, np.nan, 10],
        "Label": ["BENIGN", "DDoS", "BENIGN"]
    }
    df = pd.DataFrame(raw_data)
    cleaned_df = DatasetCleaner.clean_flow_dataframe(df, "CIC-IDS2017")
    assert not cleaned_df.isin([np.inf, -np.inf]).any().any()
    assert not cleaned_df.isna().any().any()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest backend/tests/test_dataset_service.py`
Expected: FAIL with `ModuleNotFoundError: No module named 'app'`

- [ ] **Step 3: Implement DatasetDetector and DatasetCleaner in `backend/app/services/dataset_service.py` and generate representative samples in `datasets/samples/`**

Create `backend/app/services/dataset_service.py` with schema signature matching and inf/nan replacement logic, and create `datasets/samples/generate_samples.py` to produce clean representative CSV samples.

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest backend/tests/test_dataset_service.py`
Expected: PASS (4 passed)

- [ ] **Step 5: Commit**

```bash
git add datasets/ backend/app/services/dataset_service.py backend/tests/test_dataset_service.py
git commit -m "feat(dataset): add schema detection, flow data cleaning, and sample datasets"
```

---

### Task 2: Backend Core, Database Models & Authentication

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Create: `backend/app/core/security.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/dataset.py`
- Create: `backend/app/models/incident.py`
- Create: `backend/app/models/ml_model.py`
- Create: `backend/app/models/bot_link.py`
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/api/v1/auth.py`
- Create: `backend/tests/test_auth.py`

**Interfaces:**
- Consumes: `.env` configuration (JWT_SECRET, DB_URL)
- Produces: `get_db() -> Generator[Session]`
- Produces: `create_access_token(data: dict) -> str`
- Produces: `verify_password(plain: str, hashed: str) -> bool`
- Produces: `get_password_hash(password: str) -> str`
- Produces: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`

- [ ] **Step 1: Write the failing test for password hashing and JWT token creation**

```python
# backend/tests/test_auth.py
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pwd = "CyberShieldSecret2026!"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    data = {"sub": "analyst1", "role": "analyst"}
    token = create_access_token(data)
    payload = decode_access_token(token)
    assert payload["sub"] == "analyst1"
    assert payload["role"] == "analyst"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest backend/tests/test_auth.py`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.core.security'`

- [ ] **Step 3: Implement core security, database engine, models, schemas, and auth endpoints**

Implement `backend/app/core/security.py`, `backend/app/core/database.py`, SQLAlchemy models, Pydantic schemas, and auth router with bcrypt and PyJWT.

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest backend/tests/test_auth.py`
Expected: PASS (2 passed)

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): implement database models, core security, and JWT auth"
```

---

### Task 3: Machine Learning Intrusion Detection Pipeline & Analytics API

**Files:**
- Create: `backend/app/services/ml_service.py`
- Create: `backend/app/api/v1/models.py`
- Create: `backend/tests/test_ml_service.py`

**Interfaces:**
- Consumes: `DatasetCleaner.clean_flow_dataframe` from Task 1
- Produces: `MLService.train_model(dataset_path: str, dataset_type: str) -> dict`
- Produces: `MLService.predict_flow(features: dict, dataset_type: str) -> dict`
- Produces: `GET /api/v1/models/metrics`, `POST /api/v1/models/train`

- [ ] **Step 1: Write the failing test for ML training, feature importance, and inference**

```python
# backend/tests/test_ml_service.py
import pytest
from app.services.ml_service import MLService

def test_train_and_predict_flow(tmp_path):
    # Train on sample dataset
    metrics = MLService.train_sample_model(dataset_type="CIC-IDS2017")
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1_score" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["recall"] > 0.85

    # Test single flow inference
    sample_flow = {
        "Destination Port": 80,
        "Flow Duration": 10500,
        "Total Fwd Packets": 10,
        "Total Backward Packets": 8,
        "Total Length of Fwd Packets": 500,
        "Flow Bytes/s": 47619.0,
        "Flow Packets/s": 1714.0
    }
    prediction = MLService.predict_flow(sample_flow, dataset_type="CIC-IDS2017")
    assert "is_attack" in prediction
    assert "attack_type" in prediction
    assert "confidence" in prediction
    assert 0.0 <= prediction["confidence"] <= 1.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest backend/tests/test_ml_service.py`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.services.ml_service'`

- [ ] **Step 3: Implement `MLService` with Random Forest / LightGBM, feature extraction, confusion matrix calculation, and persistence**

Implement training, metrics calculation (accuracy, precision, recall, f1, confusion matrix), and high-throughput real-time inference in `backend/app/services/ml_service.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest backend/tests/test_ml_service.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/ml_service.py backend/app/api/v1/models.py backend/tests/test_ml_service.py
git commit -m "feat(ml): implement intrusion detection pipeline and evaluation metrics"
```

---

### Task 4: Real-time Live Traffic Stream, Alert Dispatcher & Incident Management

**Files:**
- Create: `backend/app/services/stream_service.py`
- Create: `backend/app/services/alert_service.py`
- Create: `backend/app/api/v1/incidents.py`
- Create: `backend/app/api/v1/stream.py`
- Create: `backend/tests/test_incidents.py`

**Interfaces:**
- Consumes: `MLService.predict_flow` from Task 3
- Produces: `IncidentManager.record_incident(db, flow_data, prediction) -> Incident`
- Produces: `AlertDispatcher.dispatch_alert(incident: Incident) -> bool`
- Produces: `WebSocket /api/v1/stream/ws/traffic`
- Produces: `GET /api/v1/incidents/`, `PATCH /api/v1/incidents/{id}/status`

- [ ] **Step 1: Write the failing test for incident recording and status transitions**

```python
# backend/tests/test_incidents.py
from app.services.incident_service import IncidentService
from app.models.incident import IncidentStatus

def test_incident_creation_and_status_transition(db_session):
    incident = IncidentService.create_incident(
        db=db_session,
        source_ip="192.168.1.100",
        dest_ip="10.0.0.1",
        dest_port=80,
        protocol="TCP",
        attack_type="DDoS",
        severity="HIGH",
        confidence=0.98
    )
    assert incident.id is not None
    assert incident.status == IncidentStatus.NEW

    # Transition to IN_REVIEW then RESOLVED
    updated = IncidentService.update_status(db_session, incident.id, IncidentStatus.RESOLVED, reviewer="admin")
    assert updated.status == IncidentStatus.RESOLVED
    assert updated.reviewed_by == "admin"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest backend/tests/test_incidents.py`
Expected: FAIL

- [ ] **Step 3: Implement `IncidentService`, WebSocket stream generator, Telegram alert dispatcher, and incidents router**

Implement real-time incident recording, WebSocket streaming broadcast, and status update endpoints in `backend/app/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest backend/tests/test_incidents.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(stream): implement live traffic stream, incident response and alert dispatcher"
```

---

### Task 5: Telegram Serverless Bot Integration (`Cyber_ShieldUz_Bot`)

**Files:**
- Create: `Cyber_ShieldUz_Bot/tgcloud/handlers/message.js` (update with full commands)
- Create: `Cyber_ShieldUz_Bot/tgcloud/handlers/callback_query.js` (inline buttons)
- Create: `Cyber_ShieldUz_Bot/tgcloud/lib/backendClient.js`
- Create: `backend/app/api/v1/bot.py`
- Create: `backend/tests/test_bot_api.py`

**Interfaces:**
- Consumes: `/api/v1/bot/summary`, `/api/v1/bot/link`, `/api/v1/bot/incidents/{id}/status`
- Produces: `/start`, `/link`, `/status`, `/report`, `/history` Telegram commands
- Produces: Inline button callbacks `action:resolve:<id>`, `action:review:<id>`, `action:false_positive:<id>`

- [ ] **Step 1: Write the failing test for Bot API endpoints in FastAPI**

```python
# backend/tests/test_bot_api.py
def test_bot_summary_report(client, auth_headers):
    response = client.get("/api/v1/bot/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_flows" in data
    assert "total_attacks" in data
    assert "attack_breakdown" in data

def test_bot_update_incident_status(client, test_incident):
    payload = {"status": "RESOLVED", "reviewer": "TelegramBot"}
    response = client.post(f"/api/v1/bot/incidents/{test_incident.id}/status", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "RESOLVED"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest backend/tests/test_bot_api.py`
Expected: FAIL

- [ ] **Step 3: Implement bot API endpoints in FastAPI and Telegram Serverless handlers in `Cyber_ShieldUz_Bot`**

Implement `backend/app/api/v1/bot.py`, `Cyber_ShieldUz_Bot/tgcloud/lib/backendClient.js`, `Cyber_ShieldUz_Bot/tgcloud/handlers/message.js`, and `Cyber_ShieldUz_Bot/tgcloud/handlers/callback_query.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest backend/tests/test_bot_api.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/v1/bot.py backend/tests/test_bot_api.py Cyber_ShieldUz_Bot/
git commit -m "feat(telegram): implement Telegram Serverless bot handlers and incident callback response"
```

---

### Task 6: Frontend SOC Monitoring Dashboard (React + TypeScript + Tailwind)

**Files:**
- Create: `frontend/` scaffolding with Vite, React 19, TypeScript, Tailwind CSS
- Create: `frontend/src/services/api.ts` & `websocket.ts`
- Create: `frontend/src/components/dashboard/KpiCards.tsx`
- Create: `frontend/src/components/dashboard/TrafficChart.tsx`
- Create: `frontend/src/components/dashboard/AttackDistributionChart.tsx`
- Create: `frontend/src/components/incidents/IncidentTable.tsx`
- Create: `frontend/src/components/ml/ConfusionMatrixView.tsx`
- Create: `frontend/src/pages/DashboardPage.tsx`
- Create: `frontend/src/pages/IncidentsPage.tsx`
- Create: `frontend/src/pages/DatasetsPage.tsx`
- Create: `frontend/src/pages/ModelsPage.tsx`
- Create: `frontend/src/pages/LoginPage.tsx`

**Interfaces:**
- Consumes: REST API (`/api/v1/*`) and WebSocket (`/api/v1/stream/ws/traffic`)
- Produces: Interactive SOC Dashboard UI, Live Streaming Controls, Incident SIEM filters

- [ ] **Step 1: Scaffold Frontend application and install dependencies (Tailwind, Lucide-react, Chart.js / Recharts)**

Run: `npm create vite@latest frontend -- --template react-ts` (inside root) and install dependencies.

- [ ] **Step 2: Verify frontend builds without type errors**

Run: `cd frontend && npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 3: Implement SOC components, pages, WebSocket client, and dark cyber-security theme**

Implement all pages: Dashboard, Incidents, Datasets, Models, and Login with dark mode, live stream metrics, and responsive layout.

- [ ] **Step 4: Verify frontend builds and lint/types pass**

Run: `cd frontend && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): build React SOC monitoring dashboard with live charts and SIEM table"
```

---

### Task 7: Full System Verification, Swagger Docs & Operational Guide

**Files:**
- Create: `backend/tests/test_e2e_pipeline.py`
- Create: `README.md`
- Create: `start.ps1` (Single-command launcher for demonstration)

**Interfaces:**
- Consumes: All modules
- Produces: Comprehensive test suite run, Swagger OpenAPI spec at `/docs`, deployment and demo guide

- [ ] **Step 1: Write End-to-End integration test covering Upload -> Clean -> ML Inference -> Alert -> Status Update**

```python
# backend/tests/test_e2e_pipeline.py
def test_full_intrusion_detection_flow(client, auth_headers):
    # 1. Login and get token
    # 2. Trigger stream/analysis of malicious NetFlow
    # 3. Verify incident created with HIGH/CRITICAL severity
    # 4. Verify bot status endpoint reflects incident
    # 5. Resolve incident and verify audit trail
    pass
```

- [ ] **Step 2: Run all backend tests across the suite**

Run: `python -m pytest backend/tests/ -v`
Expected: All tests PASS.

- [ ] **Step 3: Write comprehensive `README.md` with system architecture diagrams, setup instructions, Swagger links, and presentation guide**

Document complete setup, prerequisites, dataset loading, Telegram bot configuration, and university defense instructions.

- [ ] **Step 4: Commit**

```bash
git add backend/tests/test_e2e_pipeline.py README.md start.ps1
git commit -m "docs: add comprehensive operational guide, start script, and e2e verification"
```
