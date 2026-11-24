import asyncio
import json
import os
import pandas as pd
from typing import List, Dict, Any, Optional
from fastapi import WebSocket
from app.core.database import SessionLocal
from app.services.ml_service import MLService
from app.services.incident_service import IncidentService
from app.services.alert_service import AlertDispatcher
from app.models.incident import IncidentSeverity

class TrafficStreamManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.is_running: bool = False
        self.speed: float = 1.0 # 1.0s interval
        self.dataset_type: str = "CIC-IDS2017"
        self._df: Optional[pd.DataFrame] = None
        self._current_index: int = 0
        self._task: Optional[asyncio.Task] = None

    def load_dataset(self, dataset_type: str = "CIC-IDS2017"):
        self.dataset_type = dataset_type
        sample_file = "cic_ids2017_sample.csv" if dataset_type == "CIC-IDS2017" else "unsw_nb15_sample.csv"
        path = os.path.join("c:/CyberShield/datasets/samples", sample_file)
        if os.path.exists(path):
            self._df = pd.read_csv(path)
            self._current_index = 0

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Ensure simulator is loaded
        if self._df is None:
            self.load_dataset(self.dataset_type)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            self.disconnect(dead)

    async def start(self):
        if not self.is_running:
            self.is_running = True
            if self._task is None or self._task.done():
                self._task = asyncio.create_task(self._run_loop())

    async def pause(self):
        self.is_running = False

    def set_speed(self, speed_multiplier: float):
        # speed_multiplier: 1x (1.0s), 2x (0.5s), 5x (0.2s)
        self.speed = max(0.1, 1.0 / max(0.2, speed_multiplier))

    async def _run_loop(self):
        if self._df is None:
            self.load_dataset(self.dataset_type)

        while self.is_running:
            if self._df is not None and len(self._df) > 0:
                row = self._df.iloc[self._current_index % len(self._df)].to_dict()
                self._current_index += 1
                
                # ML inference
                prediction = MLService.predict_flow(row, self.dataset_type)
                
                source_ip = str(row.get("Source IP", "192.168.1.100"))
                dest_ip = str(row.get("Destination IP", "10.0.0.1"))
                dest_port = int(row.get("Destination Port", 80) if not pd.isna(row.get("Destination Port")) else 80)
                
                incident_data = None
                # Agar hujum bo'lsa, DB ga insident sifatida yozamiz
                if prediction["is_attack"]:
                    db = SessionLocal()
                    try:
                        sev_enum = getattr(IncidentSeverity, prediction["severity"], IncidentSeverity.MEDIUM)
                        incident = IncidentService.create_incident(
                            db=db,
                            source_ip=source_ip,
                            dest_ip=dest_ip,
                            dest_port=dest_port,
                            attack_type=prediction["attack_type"],
                            severity=sev_enum,
                            confidence=prediction["confidence"],
                            protocol="TCP"
                        )
                        incident_data = {
                            "id": incident.id,
                            "attack_type": incident.attack_type,
                            "severity": incident.severity.value,
                            "confidence": incident.confidence
                        }
                        # Agar High yoki Critical bo'lsa, alert jo'natamiz
                        if incident.severity in [IncidentSeverity.CRITICAL, IncidentSeverity.HIGH]:
                            asyncio.create_task(AlertDispatcher.dispatch_telegram_alert(incident))
                    finally:
                        db.close()

                packet_event = {
                    "type": "flow_packet",
                    "timestamp": pd.Timestamp.now().isoformat(),
                    "source_ip": source_ip,
                    "dest_ip": dest_ip,
                    "dest_port": dest_port,
                    "flow_bytes": float(row.get("Flow Bytes/s", 1024.0) if not pd.isna(row.get("Flow Bytes/s")) else 1024.0),
                    "is_attack": prediction["is_attack"],
                    "attack_type": prediction["attack_type"],
                    "severity": prediction["severity"],
                    "confidence": prediction["confidence"],
                    "incident": incident_data
                }
                
                await self.broadcast(packet_event)
                
            await asyncio.sleep(self.speed)

stream_manager = TrafficStreamManager()
