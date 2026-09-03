import os
import cv2
import numpy as np
import logging
from ..config import settings

logger = logging.getLogger(__name__)

def generate_gradcam(file_path: str, predicted_class: str, prediction_id: str) -> dict:
    """
    Generate authentic Grad-CAM heatmaps using PyTorch hooks on DenseNet121.
    """
    import torch
    import torch.nn.functional as F
    from torchvision import transforms
    from PIL import Image
    from .model_loader import model_loader
    
    gradcam_dir = os.path.join("uploads", "gradcam")
    os.makedirs(gradcam_dir, exist_ok=True)

    heatmap_filename = f"heatmap_{prediction_id}.jpg"
    overlay_filename = f"overlay_{prediction_id}.jpg"
    
    heatmap_path = os.path.join(gradcam_dir, heatmap_filename)
    overlay_path = os.path.join(gradcam_dir, overlay_filename)

    # Load original image for overlay
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError(f"Could not read uploaded MRI scan at {file_path}")
        
    if predicted_class == "No Tumor":
        cv2.imwrite(heatmap_path, np.zeros_like(img))
        cv2.imwrite(overlay_path, img)
        return {
            "original_image": f"/api/files/mri/{os.path.basename(file_path)}",
            "heatmap_image": f"/api/files/gradcam/{heatmap_filename}",
            "overlay_image": f"/api/files/gradcam/{overlay_filename}"
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

        # Hook into DenseNet121 features.norm5
        gradients = []
        activations = []

        def forward_hook(module, input, output):
            activations.append(output)
            output.register_hook(lambda grad: gradients.append(grad))

        target_layer = model.features.norm5
        h1 = target_layer.register_forward_hook(forward_hook)

        # Forward pass
        output = model(input_tensor)
        
        class_names = model_loader.class_names
        class_display = model_loader.class_display
        
        class_idx = 0
        for i, c_key in enumerate(class_names):
            if class_display.get(c_key, c_key) == predicted_class:
                class_idx = i
                break

        # Backward pass
        model.zero_grad()
        target = output[0][class_idx]
        target.backward()

        # Compute Grad-CAM
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
            
        # Clean hooks and memory
        h1.remove()
        model.zero_grad()
        del gradients, activations, output, target, input_tensor
        import gc
        gc.collect()
        
        # Color and Overlay
        cam_255 = np.uint8(255 * cam)
        heatmap_colored = cv2.applyColorMap(cam_255, cv2.COLORMAP_JET)
        cv2.imwrite(heatmap_path, heatmap_colored)
        
        alpha = 0.4
        overlay_img = cv2.addWeighted(heatmap_colored, alpha, img, 1 - alpha, 0)
        cv2.imwrite(overlay_path, overlay_img)
        
        logger.info(f"Authentic Grad-CAM generated for prediction: {prediction_id}")
        
    except Exception as e:
        logger.error(f"Grad-CAM hook failure: {str(e)}")
        # Fallback to copy image if PyTorch hooks fail
        cv2.imwrite(heatmap_path, np.zeros_like(img))
        cv2.imwrite(overlay_path, img)
        cam = np.zeros((img.shape[0], img.shape[1]), dtype=np.float32)

    res = {
        "original_image": f"/api/files/mri/{os.path.basename(file_path)}",
        "heatmap_image": f"/api/files/gradcam/{heatmap_filename}",
        "overlay_image": f"/api/files/gradcam/{overlay_filename}"
    }
    return res, cam
