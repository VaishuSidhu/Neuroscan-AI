import cv2
import numpy as np
from PIL import Image
import io

def preprocess_mri_image(image_bytes: bytes, target_size=(512, 512), grayscale=True) -> np.ndarray:
    """
    Standard MRI preprocessing pipeline:
    1. Parse raw bytes to OpenCV image matrix
    2. Resize to model expected target dims
    3. Convert to grayscale or RGB
    4. Normalize pixel arrays to [0, 1] range
    """
    # Parse image bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image file format.")

    # Resize
    img_resized = cv2.resize(img, target_size)

    # Grayscale check
    if grayscale:
        img_processed = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        # Normalize
        img_normalized = img_processed.astype(np.float32) / 255.0
    else:
        # RGB
        img_processed = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        img_normalized = img_processed.astype(np.float32) / 255.0

    return img_normalized
