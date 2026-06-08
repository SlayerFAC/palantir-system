from sqlalchemy import Column, Integer, String, DateTime
from .db import Base

class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, index=True)
    token = Column(String, unique=True)

    account_id = Column(Integer)

    status = Column(String, default="PENDING")  # ✅ NEW
    role = Column(String, default="VIEWER")     # ✅ NEW

    expires_at = Column(DateTime)