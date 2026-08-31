from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Doctor/Researcher")  # Admin or Doctor/Researcher
    status = Column(String, nullable=False, default="Active")  # Active or Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)  # e.g., PT-9821
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    scans = relationship("MRIScan", back_populates="patient", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")

class MRIScan(Base):
    __tablename__ = "mri_scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    file_path = Column(String, nullable=False)  # Path to saved uploaded image
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # Modality sequence type: Axial T2, FLAIR, etc.
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False, default="Pending")  # Pending, Completed, Failed

    patient = relationship("Patient", back_populates="scans")
    predictions = relationship("Prediction", back_populates="scan", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("mri_scans.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=True)
    predicted_class = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    scan = relationship("MRIScan", back_populates="predictions")
    model = relationship("MLModel", back_populates="predictions")
    probabilities = relationship("ClassProbability", back_populates="prediction", cascade="all, delete-orphan")
    explainability = relationship("ExplainabilityResult", back_populates="prediction", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="prediction", cascade="all, delete-orphan")

class ClassProbability(Base):
    __tablename__ = "class_probabilities"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    class_name = Column(String, nullable=False)  # Glioma, Meningioma, Pituitary Tumor, No Tumor
    probability = Column(Float, nullable=False)

    prediction = relationship("Prediction", back_populates="probabilities")

class ExplainabilityResult(Base):
    __tablename__ = "explainability_results"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    gradcam_path = Column(String, nullable=True)  # Path to generated Grad-CAM overlay image
    localization_path = Column(String, nullable=True)  # Path to generated segmentation contour image
    explanation_text = Column(Text, nullable=False)
    region = Column(String, nullable=True)
    tumor_area_mm2 = Column(Integer, nullable=True)

    prediction = relationship("Prediction", back_populates="explainability")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    report_path = Column(String, nullable=False)  # Path to saved PDF report file
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="reports")
    prediction = relationship("Prediction", back_populates="reports")

class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    auc = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="Inactive")  # Active or Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="model")
