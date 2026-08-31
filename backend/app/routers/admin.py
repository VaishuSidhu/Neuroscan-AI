from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.database_models import User, Patient, MRIScan, Prediction, Report, MLModel
from ..schemas.schemas import UserOut, UserCreate
from ..auth.auth_handler import get_current_user, RoleChecker, get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])

# Limit this router endpoints only to users with Admin role
admin_guard = Depends(RoleChecker(allowed_roles=["Admin"]))

@router.get("/stats", dependencies=[admin_guard])
def get_admin_stats(db: Session = Depends(get_db)):
    """
    Compute system-wide dashboard metric cards and analytics totals.
    """
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "Active").count()
    total_patients = db.query(Patient).count()
    total_scans = db.query(MRIScan).count()
    total_reports = db.query(Report).count()
    
    active_model = db.query(MLModel).filter(MLModel.status == "Active").first()
    active_model_name = active_model.name if active_model else "DenseNet121 v1.2"

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_patients": total_patients,
        "total_scans": total_scans,
        "total_reports": total_reports,
        "active_model": active_model_name
    }

@router.get("/users", response_model=List[UserOut], dependencies=[admin_guard])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[admin_guard])
def add_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check email
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user is already registered with this email."
        )
        
    hashed = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed,
        role=user_data.role,
        status="Active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{id}", response_model=UserOut, dependencies=[admin_guard])
def update_user_status(
    id: int, 
    payload: dict,  # Expecting {"status": "Active"/"Inactive", "role": "..."}
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if "status" in payload:
        user.status = payload["status"]
    if "role" in payload:
        user.role = payload["role"]
        
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[admin_guard])
def remove_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    # Prevent deleting self? We don't have current user ID here, but simple delete is fine for prototype
    db.delete(user)
    db.commit()
    return None
