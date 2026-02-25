from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parents[1] / ".env"   # backend/.env
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE_URL =", DATABASE_URL)  # debug

if not DATABASE_URL:
    raise RuntimeError(f"DATABASE_URL not set. Expected in {env_path}")
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # verify connections before use
    pool_size=10,             # max persistent connections
    max_overflow=20,          # extra connections under load
    pool_recycle=300,         # recycle connections every 5 min
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
