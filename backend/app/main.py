import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from .config import settings
    from .database import engine, Base, SessionLocal
    from .models.database_models import User, Patient, MLModel
    from .auth.auth_handler import get_password_hash
    from .routers import auth, patients, mri, analysis, reports, models, admin, files, performance
    Base.metadata.create_all(bind=engine)
    
    # Seed database with baseline records
    def seed_database():
        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                logger.info("Seeding baseline user accounts...")
                admin_user = User(name="System Administrator", email="admin@neuroscan.ai", password_hash=get_password_hash("admin123"), role="Admin", status="Active")
                doctor_user = User(name="Dr. Sarah Jenkins", email="s.jenkins@neuroscan.ai", password_hash=get_password_hash("demo1234"), role="Doctor/Researcher", status="Active")
                db.add_all([admin_user, doctor_user])
                db.commit()

            if db.query(MLModel).count() == 0:
                logger.info("Registering active DenseNet121 model release with authentic evaluated metrics...")
                m_densenet = MLModel(
                    name="DenseNet121", 
                    version="v1.2", 
                    accuracy=0.7386, 
                    precision=0.8033, 
                    recall=0.7186, 
                    f1_score=0.7096, 
                    auc=0.801, 
                    status="Active"
                )
                db.add(m_densenet)
                db.commit()
                
        except Exception as e:
            logger.error(f"Failed to seed database: {str(e)}")
        finally:
            db.close()

    seed_database()

    app = FastAPI(title="NeuroScan AI Diagnostic APIs", version="1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api")
    app.include_router(patients.router, prefix="/api")
    app.include_router(mri.router, prefix="/api")
    app.include_router(analysis.router, prefix="/api")
    app.include_router(reports.router, prefix="/api")
    app.include_router(models.router, prefix="/api")
    app.include_router(admin.router, prefix="/api")
    app.include_router(files.router, prefix="/api")
    app.include_router(performance.router, prefix="/api")

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    @app.get("/")
    def read_root():
        return {"status": "online", "mode": settings.AI_MODE}

except Exception as e:
    import traceback
    err_trace = traceback.format_exc()
    logger.error(f"FATAL STARTUP ERROR: {err_trace}")
    
    app = FastAPI(title="NeuroScan AI - ERROR FALLBACK")
    
    @app.get("/{path:path}")
    def fallback_error(path: str):
        return {"error": "Startup failed", "traceback": err_trace}
