from sqlalchemy import Column, Integer, ForeignKey, String
from .db import Base

class AccountUser(Base):
    __tablename__ = "account_users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))

    role = Column(String, default="OWNER")  # ✅ NEW
