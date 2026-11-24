import os
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, Literal
from app.services.ml_service import MLService

router = APIRouter(prefix="/models", tags=["Machine Learning"])

@router.get("/metrics")
def get_model_metrics(dataset_type: str = Query("CIC-IDS2017")) -> Dict[str, Any]:
    """Model aniqligi, recall, precision, confusion matrix va feature importance ni qaytaradi."""
    try:
        return MLService.get_metrics(dataset_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train")
def train_model_endpoint(
    dataset_type: str = Query("CIC-IDS2017"),
    n_estimators: int = Query(40, ge=10, le=200)
) -> Dict[str, Any]:
    """Modelni o'qitish va yangilash."""
    sample_file = "cic_ids2017_sample.csv" if dataset_type == "CIC-IDS2017" else "unsw_nb15_sample.csv"
    path = os.path.join("c:/CyberShield/datasets/samples", sample_file)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="O'qitish uchun dataset fayli topilmadi")
        
    try:
        metrics = MLService.train_model(dataset_path=path, dataset_type=dataset_type, n_estimators=n_estimators)
        return {"status": "success", "message": f"{dataset_type} modeli muvaffaqiyatli o'qitildi", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"O'qitishda xatolik: {str(e)}")

@router.post("/predict")
def predict_flow_endpoint(flow_data: Dict[str, Any], dataset_type: str = "CIC-IDS2017") -> Dict[str, Any]:
    """Yagona tarmoq oqimini klassifikatsiya qilish."""
    try:
        return MLService.predict_flow(flow_data, dataset_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
