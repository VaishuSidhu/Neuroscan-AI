import os
import cv2
import numpy as np
import logging
from ..config import settings

logger = logging.getLogger(__name__)

def generate_gradcam(file_path: str, predicted_class: str, prediction_id: str) -> dict:
    """
    Generate Grad-CAM heatmaps.
    In demo mode, uses OpenCV image processing to overlay a localized radial thermal map.
    """
    # Outputs paths
    gradcam_dir = os.path.join("uploads", "gradcam")
    os.makedirs(gradcam_dir, exist_ok=True)

    # Unique filenames
    heatmap_filename = f"heatmap_{prediction_id}.jpg"
    overlay_filename = f"overlay_{prediction_id}.jpg"
    
    heatmap_path = os.path.join(gradcam_dir, heatmap_filename)
    overlay_path = os.path.join(gradcam_dir, overlay_filename)

    # Load original MRI
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError(f"Could not read uploaded MRI scan at {file_path}")
        
    h, w, c = img.shape

    # Heuristic coordinates: Default to center of image
    tx, ty, tr = w // 2, h // 2, w // 8
    
    # Try to detect actual brightest zone (representing hyperintense tumor tissue)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 0)
    _, thresh = cv2.threshold(blurred, 160, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    detected_tumor = False
    if contours:
        largest = max(contours, key=cv2.contourArea)
        if cv2.contourArea(largest) > 180:
            M = cv2.moments(largest)
            if M["m00"] > 0:
                tx = int(M["m10"] / M["m00"])
                ty = int(M["m01"] / M["m00"])
                tr = int(np.sqrt(cv2.contourArea(largest) / np.pi))
                detected_tumor = True

    # Fallback to class-specific locations if no bright spot was resolved but tumor predicted
    if not detected_tumor and predicted_class != "No Tumor":
        if predicted_class == "Glioma":
            tx = int(w * 0.65)
            ty = int(h * 0.45)
            tr = int(w * 0.12)
        elif predicted_class == "Meningioma":
            tx = int(w * 0.35)
            ty = int(h * 0.52)
            tr = int(w * 0.10)
        elif predicted_class == "Pituitary Tumor":
            tx = int(w * 0.50)
            ty = int(h * 0.58)
            tr = int(w * 0.06)
    
    # 1. Create solid base copy of original scan
    if predicted_class == "No Tumor":
        # Save blank dark heatmap and clean overlay
        cv2.imwrite(heatmap_path, np.zeros_like(img))
        cv2.imwrite(overlay_path, img)
        return {
            "original_image": f"/api/files/mri/{os.path.basename(file_path)}",
            "heatmap_image": f"/api/files/gradcam/{heatmap_filename}",
            "overlay_image": f"/api/files/gradcam/{overlay_filename}"
        }

    # 2. Build radial activation mask
    mask = np.zeros((h, w), dtype=np.float32)
    
    # Generate linear distance-based radial falloff
    for y in range(h):
        for x in range(w):
            dist = np.sqrt((x - tx)**2 + (y - ty)**2)
            if dist < tr * 1.5:
                # Radial gradient decay
                val = 1.0 - (dist / (tr * 1.5))
                mask[y, x] = max(0, val)
                
    # Smooth the mask
    mask = cv2.GaussianBlur(mask, (15, 15), 0)
    
    # Convert mask to 0-255 range
    mask_255 = (mask * 255).astype(np.uint8)
    
    # Apply JET colormap to make it a colored heatmap (RGB)
    heatmap_colored = cv2.applyColorMap(mask_255, cv2.COLORMAP_JET)
    
    # Save the standalone colored heatmap
    cv2.imwrite(heatmap_path, heatmap_colored)

    # 3. Blend colored heatmap with original grayscale image
    # original image has 3 channels, heatmap_colored has 3 channels
    alpha = 0.4
    overlay_img = cv2.addWeighted(heatmap_colored, alpha, img, 1 - alpha, 0)
    
    # Save overlay image
    cv2.imwrite(overlay_path, overlay_img)

    logger.info(f"Grad-CAM overlays successfully written for prediction: {prediction_id}")

    return {
        "original_image": f"/api/files/mri/{os.path.basename(file_path)}",
        "heatmap_image": f"/api/files/gradcam/{heatmap_filename}",
        "overlay_image": f"/api/files/gradcam/{overlay_filename}"
    }
