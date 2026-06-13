from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=True)  # ✅ added

    role = Column(String, default="USER")
    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ password reset fields
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)