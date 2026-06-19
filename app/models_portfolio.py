from sqlalchemy import Column, Integer, String, ForeignKey
from .db import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    status = Column(String, default="active")

    account_id = Column(Integer, ForeignKey("accounts.id"))