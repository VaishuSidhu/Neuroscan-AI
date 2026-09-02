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
                logger.info("Seeding baseline ML model releases...")
                m_cnn = MLModel(name="CNN (Baseline)", version="v1.0", accuracy=0.914, precision=0.908, recall=0.899, f1_score=0.903, auc=0.921, status="Inactive")
                m_resnet = MLModel(name="ResNet50", version="v2.1", accuracy=0.941, precision=0.937, recall=0.932, f1_score=0.934, auc=0.950, status="Inactive")
                m_densenet = MLModel(name="DenseNet121", version="v1.2", accuracy=0.952, precision=0.948, recall=0.945, f1_score=0.946, auc=0.961, status="Active")
                db.add_all([m_cnn, m_resnet, m_densenet])
                db.commit()

            if db.query(Patient).count() == 0:
                logger.info("Seeding baseline patient demographics...")
                p1 = Patient(patient_id="PT-9821", name="Eleanor Vance", age=42, gender="Female", notes="Patient presenting with chronic headaches and light sensitivity.")
                db.add(p1)
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
