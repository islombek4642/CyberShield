from sqlalchemy import Column, Integer, String, Boolean, DateTime, BigInteger, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base

class BotLink(Base):
    __tablename__ = "bot_links"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    telegram_chat_id = Column(BigInteger, unique=True, index=True, nullable=False)
    link_code = Column(String(50), unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    linked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
