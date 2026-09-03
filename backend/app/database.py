import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# For SQLite, check_same_thread is required to allow multiple request threads
connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if db_url.startswith("sqlite:///"):
        raw_path = db_url.replace("sqlite:///", "")
        # Resolve to real project database folder
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        project_dir = os.path.dirname(backend_dir)
        
        target_dir = os.path.join(project_dir, "database")
        if not os.path.exists(target_dir):
            target_dir = os.path.join(backend_dir, "..", "database")
        target_dir = os.path.abspath(target_dir)
        os.makedirs(target_dir, exist_ok=True)
        
        db_file = os.path.join(target_dir, "brain_tumor.db")
        db_url = f"sqlite:///{db_file.replace(os.sep, '/')}"

# Render uses postgres:// but SQLAlchemy requires postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure postgres URLs have sslmode=require for Render
if db_url.startswith("postgresql") and "sslmode" not in db_url:
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
