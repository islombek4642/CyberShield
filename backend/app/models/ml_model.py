from sqlalchemy import Column, Integer, String, Float, JSON, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    dataset_type = Column(String(50), nullable=False) # CIC-IDS2017, UNSW-NB15
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    confusion_matrix = Column(JSON, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    model_path = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
