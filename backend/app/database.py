from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# For SQLite, check_same_thread is required to allow multiple request threads
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Ensure postgres URLs have sslmode=require for Render
db_url = settings.DATABASE_URL
if db_url.startswith("postgres") and "sslmode" not in db_url:
    join_char = "&" if "?" in db_url else "?"
    db_url += f"{join_char}sslmode=require"

engine = create_engine(
    db_url,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
