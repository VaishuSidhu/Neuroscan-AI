import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.database_models import MRIScan, Patient
from ..auth.auth_handler import get_current_user

router = APIRouter(prefix="/mri", tags=["mri"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/upload")
async def upload_mri_file(
    patient_id: str = Form(...),
    scan_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Validate Patient
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404, 
            detail=f"Patient reference ID {patient_id} does not exist. Create patient first."
        )

    # 2. Validate File Extension
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PNG, JPG, or JPEG MRI scans are accepted."
        )

    # 3. Secure file destination path
    upload_dir = os.path.join("uploads", "mri")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save with unique timestamped filename to prevent collisions
    filename = f"scan_{int(os.urandom(4).hex(), 16)}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)

    # 4. Save file chunk-by-chunk to enforce size limit dynamically
    file_size = 0
    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(8192):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    buffer.close()
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="MRI scan file size exceeds the 10MB clinical ingestion limit."
                    )
                buffer.write(chunk)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file to local disk: {str(e)}"
        )

    # 5. Insert MRIScan Row in DB
    new_scan = MRIScan(
        patient_id=patient_id,
        file_path=file_path,
        original_filename=file.filename,
        file_type=scan_type,
        status="Pending"
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    return {
        "scan_id": new_scan.id,
        "filename": filename,
        "status": "uploaded"
    }
