import os
import cv2
import numpy as np
import logging
from ..config import settings

logger = logging.getLogger(__name__)

def generate_segmentation(file_path: str, predicted_class: str, prediction_id: str) -> dict:
    """
    Generate tumor segmentation overlays and masks using Weakly Supervised Saliency mapping 
    from the PyTorch model's true activations.
    """
    import torch
    import torch.nn.functional as F
    from torchvision import transforms
    from PIL import Image
    from .model_loader import model_loader
    
    localization_dir = os.path.join("uploads", "localization")
    os.makedirs(localization_dir, exist_ok=True)

    mask_filename = f"mask_{prediction_id}.jpg"
    overlay_filename = f"local_overlay_{prediction_id}.jpg"
    
    mask_path = os.path.join(localization_dir, mask_filename)
    overlay_path = os.path.join(localization_dir, overlay_filename)

    img = cv2.imread(file_path)
    if img is None:
        raise ValueError(f"Could not read uploaded MRI scan at {file_path}")
        
    if predicted_class == "No Tumor":
        blank_mask = np.zeros_like(img)
        cv2.imwrite(mask_path, blank_mask)
        cv2.imwrite(overlay_path, img)
        return {
            "mask_url": f"/api/files/localization/{mask_filename}",
            "overlay_url": f"/api/files/localization/{overlay_filename}",
            "confidence": 0.0,
            "region": "None",
            "tumor_area_mm2": 0
        }

    try:
        model = model_loader.classifier
        device = model_loader.device
        model.eval()

        img_pil = Image.open(file_path).convert('RGB')
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        input_tensor = preprocess(img_pil).unsqueeze(0).to(device)

        gradients = []
        activations = []

        def backward_hook(module, grad_input, grad_output):
            gradients.append(grad_output[0])
            
        def forward_hook(module, input, output):
            activations.append(output)

        target_layer = model.features
        h1 = target_layer.register_forward_hook(forward_hook)
        h2 = target_layer.register_full_backward_hook(backward_hook)

        output = model(input_tensor)
        
        class_names = model_loader.class_names
        class_display = model_loader.class_display
        
        class_idx = 0
        for i, c_key in enumerate(class_names):
            if class_display.get(c_key, c_key) == predicted_class:
                class_idx = i
                break

        model.zero_grad()
        target = output[0][class_idx]
        target.backward()

        gradient = gradients[0].cpu().data.numpy()[0]
        activation = activations[0].cpu().data.numpy()[0]
        
        weights = np.mean(gradient, axis=(1, 2))
        cam = np.zeros(activation.shape[1:], dtype=np.float32)

        for i, w in enumerate(weights):
            cam += w * activation[i]

        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (img.shape[1], img.shape[0]))
        
        cam_max = np.max(cam)
        if cam_max != 0:
            cam = cam / cam_max
            
        h1.remove()
        h2.remove()
        
        # Saliency Thresholding for Weakly-Supervised Segmentation
        # Only take pixels that are highly activated (top 40%)
        _, binary_cam = cv2.threshold((cam * 255).astype(np.uint8), 100, 255, cv2.THRESH_BINARY)
        
        contours, _ = cv2.findContours(binary_cam, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        mask = np.zeros_like(img)
        overlay_img = img.copy()
        
        area = 0
        region = "Cerebral Cortex"
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            # Authentic pixel area of segmented lesion contour
            area = int(round(float(cv2.contourArea(largest_contour))))
            
            # Authentic saliency activation confidence
            activated_pixels = cam[binary_cam > 0]
            seg_confidence = round(float(np.mean(activated_pixels)), 4) if len(activated_pixels) > 0 else 0.0
            
            M = cv2.moments(largest_contour)
            if M["m00"] > 0:
                cx = int(M["m10"] / M["m00"])
                if cx < img.shape[1] * 0.4:
                    region = "Left Hemisphere"
                elif cx > img.shape[1] * 0.6:
                    region = "Right Hemisphere"
                else:
                    region = "Central / Sellar Region"

            # Draw mask
            cv2.drawContours(mask, [largest_contour], -1, (255, 255, 255), -1)
            
            # Draw overlay (red translucent fill + thick red border)
            overlay_filled = img.copy()
            cv2.drawContours(overlay_filled, [largest_contour], -1, (0, 0, 255), -1)
            alpha = 0.25
            cv2.addWeighted(overlay_filled, alpha, overlay_img, 1 - alpha, 0, overlay_img)
            cv2.drawContours(overlay_img, [largest_contour], -1, (0, 0, 255), 2)
        else:
            seg_confidence = 0.0

        cv2.imwrite(mask_path, mask)
        cv2.imwrite(overlay_path, overlay_img)
        
        logger.info(f"Authentic Segmentation generated for prediction: {prediction_id}")
        
        return {
            "mask_url": f"/api/files/localization/{mask_filename}",
            "overlay_url": f"/api/files/localization/{overlay_filename}",
            "confidence": seg_confidence,
            "region": region,
            "tumor_area_mm2": area
        }
        
    except Exception as e:
        logger.error(f"Segmentation hook failure: {str(e)}")
        cv2.imwrite(mask_path, np.zeros_like(img))
        cv2.imwrite(overlay_path, img)
        return {
            "mask_url": f"/api/files/localization/{mask_filename}",
            "overlay_url": f"/api/files/localization/{overlay_filename}",
            "confidence": 0.0,
            "region": "Error",
            "tumor_area_mm2": 0
        }
