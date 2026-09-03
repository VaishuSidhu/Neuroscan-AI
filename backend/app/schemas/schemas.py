from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Doctor/Researcher"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserOut(UserBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Patient Schemas
class PatientBase(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# MRI Scan Schemas
class MRIScanBase(BaseModel):
    patient_id: str
    file_type: str

class MRIScanOut(BaseModel):
    id: int
    patient_id: str
    file_path: str
    original_filename: str
    file_type: str
    upload_date: datetime
    status: str

    class Config:
        from_attributes = True

# Class Probability
class ClassProbabilityOut(BaseModel):
    class_name: str
    probability: float

    class Config:
        from_attributes = True

# Explainability Result
class ExplainabilityOut(BaseModel):
    gradcam_path: Optional[str] = None
    localization_path: Optional[str] = None
    explanation_text: str

    class Config:
        from_attributes = True

# ML Model Schemas
class MLModelOut(BaseModel):
    id: int
    name: str
    version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionOut(BaseModel):
    id: int
    scan_id: int
    predicted_class: str
    confidence: float
    created_at: datetime
    notes: Optional[str] = None
    probabilities: List[ClassProbabilityOut]
    explainability: Optional[ExplainabilityOut] = None
    model: Optional[MLModelOut] = None

    class Config:
        from_attributes = True

# Complete Analysis Pipeline Output Schema
class CompleteAnalysisOut(BaseModel):
    scan_id: int
    prediction: dict
    gradcam: dict
    localization: dict
    explanation: str
    mode: str

# Report Schema
class ReportOut(BaseModel):
    id: int
    patient_id: str
    prediction_id: int
    report_path: str
    created_at: datetime

    class Config:
        from_attributes = True
