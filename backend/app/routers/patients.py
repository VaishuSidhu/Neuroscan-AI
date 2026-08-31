from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.database_models import Patient, MRIScan, Prediction
from ..schemas.schemas import PatientCreate, PatientOut
from ..auth.auth_handler import get_current_user, RoleChecker

router = APIRouter(prefix="/patients", tags=["patients"])

# In demo and clinical mode, Doctors/Researchers and Admins can access patients
allowed_roles = ["Admin", "Doctor/Researcher"]

@router.get("", response_model=List[PatientOut])
def get_patients(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return db.query(Patient).order_by(Patient.created_at.desc()).all()

@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: PatientCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Check if patient ID exists
    existing = db.query(Patient).filter(Patient.patient_id == patient_data.patient_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient ID {patient_data.patient_id} is already registered."
        )
    
    new_patient = Patient(**patient_data.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@router.get("/{id}", response_model=PatientOut)
def get_patient(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return p

@router.put("/{id}", response_model=PatientOut)
def update_patient(
    id: int, 
    patient_data: PatientCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    
    for key, value in patient_data.dict().items():
        setattr(p, key, value)
        
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    
    db.delete(p)
    db.commit()
    return None

@router.get("/{patient_id}/history")
def get_patient_history(
    patient_id: str, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Fetch scans for patient
    scans_list = db.query(MRIScan).filter(MRIScan.patient_id == patient_id).order_by(MRIScan.upload_date.desc()).all()
    history = []
    
    for s in scans_list:
        pred = db.query(Prediction).filter(Prediction.scan_id == s.id).first()
        history.append({
            "id": s.id,
            "patient_id": s.patient_id,
            "upload_date": s.upload_date.strftime("%Y-%m-%d %H:%M"),
            "scan_type": s.file_type,
            "status": s.status,
            "prediction": pred.predicted_class if pred else "Pending",
            "confidence": pred.confidence if pred else 0.0,
            "prediction_id": pred.id if pred else None
        })
        
    return history
