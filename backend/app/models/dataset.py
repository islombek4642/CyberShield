from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    dataset_type = Column(String(50), nullable=False) # CIC-IDS2017, UNSW-NB15
    row_count = Column(Integer, default=0)
    status = Column(String(50), default="uploaded") # uploaded, cleaned, analyzed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
