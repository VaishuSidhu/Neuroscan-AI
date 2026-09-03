from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.database_models import MRIScan, Prediction, ExplainabilityResult, Patient
from ..auth.auth_handler import get_current_user
from ..ml.inference import run_ai_pipeline
from ..ml.preprocessing import preprocess_mri_image
from ..ml.gradcam import generate_gradcam
from ..ml.segmentation import generate_segmentation

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/{scan_id}/preprocess")
def preprocess_scan(
    scan_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    scan = db.query(MRIScan).filter(MRIScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
        
    try:
        with open(scan.file_path, "rb") as f:
            image_bytes = f.read()
        # Run preprocess verification
        preprocess_mri_image(image_bytes)
        return {"status": "preprocessed", "dimensions": "512x512", "format": "grayscale"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image preprocessing failed: {str(e)}")

@router.post("/{scan_id}/predict")
def predict_scan(
    scan_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # This runs prediction only. But to be robust and support unified pipeline run,
    # let's execute pipeline prediction logic
    scan = db.query(MRIScan).filter(MRIScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
        
    # Simply trigger the run_ai_pipeline simulation
    try:
        pipeline_res = run_ai_pipeline(db, scan_id)
        return pipeline_res["prediction"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction classification failed: {str(e)}")

@router.post("/{prediction_id}/gradcam")
def run_gradcam(
    prediction_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    
    scan = db.query(MRIScan).filter(MRIScan.id == pred.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record matching prediction not found.")

    try:
        cam = generate_gradcam(scan.file_path, pred.predicted_class, f"pr_{pred.id}")
        return cam
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grad-CAM overlay mapping failed: {str(e)}")

@router.post("/{prediction_id}/localize")
def run_localization(
    prediction_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    
    scan = db.query(MRIScan).filter(MRIScan.id == pred.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record matching prediction not found.")

    try:
        seg = generate_segmentation(scan.file_path, pred.predicted_class, f"pr_{pred.id}")
        return seg
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Segmentation boundary mapping failed: {str(e)}")

@router.post("/{scan_id}/run")
def run_pipeline(
    scan_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Executes the entire diagnostic sequence (Preprocessing, Classification, Grad-CAM, Segmentation, Database save).
    """
    try:
        res = run_ai_pipeline(db, scan_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic pipeline execution failed: {str(e)}")

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Computes authentic dashboard metrics dynamically from the database.
    """
    from ..models.database_models import Report
    from sqlalchemy import func
    from datetime import datetime, timedelta

    total_scans = db.query(MRIScan).count()
    total_tumors = db.query(Prediction).filter(Prediction.predicted_class != "No Tumor").count()
    total_reports = db.query(Report).count()

    avg_conf = db.query(func.avg(Prediction.confidence)).scalar()
    avg_confidence = round(float(avg_conf) * 100, 1) if avg_conf is not None else 0.0

    today = datetime.utcnow().date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    daily_analyses = []
    for d in days:
        d_str = d.strftime("%b %d")
        count = db.query(MRIScan).filter(
            func.date(MRIScan.upload_date) == d.strftime("%Y-%m-%d")
        ).count()
        daily_analyses.append({"date": d_str, "scans": count})

    return {
        "total_scans": total_scans,
        "total_tumors": total_tumors,
        "total_reports": total_reports,
        "avg_confidence": avg_confidence,
        "daily_analyses": daily_analyses
    }

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieves all historic analyses log table run records.
    """
    predictions_list = db.query(Prediction).order_by(Prediction.created_at.desc()).all()
    history = []
    
    for p in predictions_list:
        scan = db.query(MRIScan).filter(MRIScan.id == p.scan_id).first()
        patient = None
        if scan:
            patient = db.query(Patient).filter(Patient.patient_id == scan.patient_id).first()
            
        history.append({
            "id": p.id,
            "scan_id": p.scan_id,
            "patient_name": patient.name if patient else "Unknown Patient",
            "patient_id": scan.patient_id if scan else "PT-XXXX",
            "date": p.created_at.strftime("%Y-%m-%d %H:%M"),
            "prediction": p.predicted_class,
            "confidence": f"{(p.confidence * 100):.1f}%",
            "model": f"{p.model.name if p.model else 'DenseNet121'} ({p.model.version if p.model else 'v1.2'})",
            "status": "Completed"
        })
        
    return history

@router.get("/prediction/{id}")
def get_prediction_detail(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    from ..models.database_models import Patient, MRIScan, Prediction, ClassProbability, ExplainabilityResult
    import os

    p = db.query(Prediction).filter(Prediction.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prediction details not found.")
    
    scan = db.query(MRIScan).filter(MRIScan.id == p.scan_id).first()
    patient = db.query(Patient).filter(Patient.patient_id == scan.patient_id).first() if scan else None
    probs = db.query(ClassProbability).filter(ClassProbability.prediction_id == p.id).all()
    exp = db.query(ExplainabilityResult).filter(ExplainabilityResult.prediction_id == p.id).first()

    region = exp.region if exp and exp.region else "None"
    area = exp.tumor_area_mm2 if exp and exp.tumor_area_mm2 else 0

    # Generate filename references
    orig_fn = os.path.basename(scan.file_path) if scan else ""
    pred_suffix = f"pr_{p.id}.jpg"

    return {
        "id": p.id,
        "scan_id": p.scan_id,
        "patient": {
            "name": patient.name if patient else "Unknown",
            "patient_id": patient.patient_id if patient else "PT-XXXX",
            "age": patient.age if patient else 0,
            "gender": patient.gender if patient else "Other"
        },
        "scan": {
            "file_type": scan.file_type if scan else "FLAIR",
            "original_filename": scan.original_filename if scan else ""
        },
        "predicted_class": p.predicted_class,
        "confidence": p.confidence,
        "notes": p.notes,
        "created_at": p.created_at.strftime("%Y-%m-%d %H:%M"),
        "probabilities": {pr.class_name: pr.probability for pr in probs},
        "gradcam": {
            "original_image": f"/api/files/mri/{orig_fn}" if orig_fn else "",
            "heatmap_image": f"/api/files/gradcam/heatmap_{pred_suffix}",
            "overlay_image": f"/api/files/gradcam/overlay_{pred_suffix}"
        },
        "localization": {
            "mask_url": f"/api/files/localization/mask_{pred_suffix}",
            "overlay_url": f"/api/files/localization/local_overlay_{pred_suffix}",
            "confidence": round(p.confidence, 4) if p.predicted_class != "No Tumor" else 0.0,
            "region": region,
            "tumor_area_mm2": area
        }
    }
