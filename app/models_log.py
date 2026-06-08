from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .db import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    actor = Column(String)
    action = Column(String)
    target = Column(String)

    timestamp = Column(DateTime, default=datetime.utcnow)