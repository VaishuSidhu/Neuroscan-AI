from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.database_models import MLModel
from ..schemas.schemas import MLModelOut
from ..auth.auth_handler import get_current_user, RoleChecker

router = APIRouter(prefix="/models", tags=["models"])

@router.get("", response_model=List[MLModelOut])
def get_models(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return db.query(MLModel).all()

@router.get("/comparison")
def get_comparison(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    models = db.query(MLModel).all()
    # Simple list mapping
    return [
        {
            "id": m.id,
            "name": m.name,
            "version": m.version,
            "accuracy": m.accuracy,
            "precision": m.precision,
            "recall": m.recall,
            "f1_score": m.f1_score,
            "auc": m.auc,
            "status": m.status
        }
        for m in models
    ]

@router.post("/{id}/toggle", response_model=MLModelOut)
def toggle_model_status(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user) # Only doctors or admins can toggle models
):
    # Retrieve target
    model = db.query(MLModel).filter(MLModel.id == id).first()
    if not model:
        raise HTTPException(status_code=404, detail="ML model not found.")

    if model.status == "Active":
        model.status = "Inactive"
    else:
        # Enforce that only ONE model is Active at a time
        db.query(MLModel).update({MLModel.status: "Inactive"})
        model.status = "Active"
        
    db.commit()
    db.refresh(model)
    return model
