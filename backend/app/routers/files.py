import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

router = APIRouter(prefix="/files", tags=["files"])

@router.get("/mri/{filename}")
def get_mri_file(filename: str):
    file_path = os.path.join("uploads", "mri", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="MRI file not found.")
    return FileResponse(file_path)

@router.get("/gradcam/{filename}")
def get_gradcam_file(filename: str):
    file_path = os.path.join("uploads", "gradcam", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Grad-CAM overlay file not found.")
    return FileResponse(file_path)

@router.get("/localization/{filename}")
def get_localization_file(filename: str):
    file_path = os.path.join("uploads", "localization", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Localization mask file not found.")
    return FileResponse(file_path)

@router.get("/reports/{filename}")
def get_report_file(filename: str):
    file_path = os.path.join("uploads", "reports", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF report not found.")
    # Set headers to display PDF in browser or force download
    return FileResponse(file_path, media_type="application/pdf", filename=filename)
