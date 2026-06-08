from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import time
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = None

# ✅ STRONG RETRY LOGIC
for i in range(15):
    try:
        print(f"⏳ Attempting DB connection ({i+1}/15)...")
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True
        )
        connection = engine.connect()
        connection.close()
        print("✅ Database connected")
        break
    except Exception as e:
        print(f"❌ DB not ready yet: {e}")
        time.sleep(2)

if engine is None:
    raise Exception("Database not available after retries")

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()