import pytest
import os
from app.services.ml_service import MLService

def test_train_and_predict_flow():
    # 1. Train sample model on CIC-IDS2017
    sample_path = "c:/CyberShield/datasets/samples/cic_ids2017_sample.csv"
    assert os.path.exists(sample_path)
    
    metrics = MLService.train_model(dataset_path=sample_path, dataset_type="CIC-IDS2017", n_estimators=20)
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1_score" in metrics
    assert "confusion_matrix" in metrics
    assert "feature_importance" in metrics
    assert metrics["accuracy"] > 0.80
    assert metrics["recall"] > 0.80

    # 2. Test single flow inference (Normal flow)
    benign_flow = {
        "Destination Port": 80,
        "Flow Duration": 15000,
        "Total Fwd Packets": 10,
        "Total Backward Packets": 8,
        "Total Length of Fwd Packets": 500,
        "Fwd Packet Length Max": 800,
        "Fwd Packet Length Min": 40,
        "Flow Bytes/s": 47619.0,
        "Flow Packets/s": 1714.0,
        "Flow IAT Mean": 833.0
    }
    pred_benign = MLService.predict_flow(benign_flow, dataset_type="CIC-IDS2017")
    assert "is_attack" in pred_benign
    assert "attack_type" in pred_benign
    assert "confidence" in pred_benign
    assert 0.0 <= pred_benign["confidence"] <= 1.0

    # 3. Test single flow inference (DDoS attack flow)
    ddos_flow = {
        "Destination Port": 80,
        "Flow Duration": 150000,
        "Total Fwd Packets": 300,
        "Total Backward Packets": 1,
        "Total Length of Fwd Packets": 290000,
        "Fwd Packet Length Max": 1400,
        "Fwd Packet Length Min": 40,
        "Flow Bytes/s": 2800000.0,
        "Flow Packets/s": 2000.0,
        "Flow IAT Mean": 500.0
    }
    pred_ddos = MLService.predict_flow(ddos_flow, dataset_type="CIC-IDS2017")
    assert pred_ddos["is_attack"] is True
    assert pred_ddos["attack_type"] in ["DDoS", "PortScan", "Botnet", "Brute Force", "Infiltration"]
