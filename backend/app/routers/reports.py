from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.database_models import Report, Prediction, Patient, MRIScan, ExplainabilityResult
from ..schemas.schemas import ReportOut
from ..auth.auth_handler import get_current_user
from ..services.report_generator import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("", response_model=List[ReportOut])
def get_reports(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return db.query(Report).order_by(Report.created_at.desc()).all()

@router.post("/{prediction_id}", response_model=ReportOut)
def create_report(
    prediction_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # 1. Fetch prediction details
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    # 2. Fetch associated scan
    scan = db.query(MRIScan).filter(MRIScan.id == prediction.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    # 3. Fetch patient
    patient = db.query(Patient).filter(Patient.patient_id == scan.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found.")

    # 4. Fetch explainability
    explainability = db.query(ExplainabilityResult).filter(ExplainabilityResult.prediction_id == prediction_id).first()

    try:
        # Check if report already exists for this prediction to prevent duplicate files
        existing = db.query(Report).filter(Report.prediction_id == prediction_id).first()
        if existing:
            return existing

        # 5. Compile PDF
        report_url = generate_pdf_report(prediction_id, patient, scan, prediction, explainability)

        # 6. Save Report row in DB
        new_report = Report(
            patient_id=patient.patient_id,
            prediction_id=prediction_id,
            report_path=report_url
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Structured PDF compilation failed: {str(e)}"
        )

@router.get("/{id}", response_model=ReportOut)
def get_report(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    r = db.query(Report).filter(Report.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report log not found.")
    return r
