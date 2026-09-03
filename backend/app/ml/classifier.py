import os
import logging
import numpy as np
from PIL import Image
import torch
from torchvision import transforms
from ..config import settings
from .model_loader import model_loader

logger = logging.getLogger(__name__)

# Standard ImageNet Transforms for DenseNet121
PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def classify_mri(file_path: str, original_filename: str = "") -> dict:
    """
    Classify the MRI scan using the trained DenseNet121 PyTorch deep learning model.
    Runs authentic forward-pass inference on the input image tensor.
    No hardcoded filename rules, fake heuristics, or demo fallbacks.
    """
    model_loader.load_models()

    model = model_loader.classifier
    device = model_loader.device

    if model is None or not isinstance(model, torch.nn.Module):
        raise RuntimeError(
            "DenseNet121 model is not loaded. Please verify that 'brain_tumor_classifier.pth' "
            "is located in backend/models and AI_MODE=production is configured."
        )

    model.eval()

    try:
        # Load and convert image to RGB
        img = Image.open(file_path).convert('RGB')
        input_tensor = PREPROCESS(img)
        input_batch = input_tensor.unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(input_batch)
            probs_tensor = torch.nn.functional.softmax(output[0], dim=0)

        raw_probs = probs_tensor.cpu().numpy()

        class_names = model_loader.class_names
        class_display = model_loader.class_display

        probs = {}
        for i, c_key in enumerate(class_names):
            disp_name = class_display.get(c_key, c_key)
            probs[disp_name] = round(float(raw_probs[i]), 4)

        # Get the class with highest probability from model output
        max_idx = int(np.argmax(raw_probs))
        predicted_class_key = class_names[max_idx]
        predicted_class = class_display.get(predicted_class_key, predicted_class_key)
        conf = probs[predicted_class]

        logger.info(f"PyTorch Model Classification: {predicted_class} (confidence: {conf:.4f})")

        return {
            "predicted_class": predicted_class,
            "confidence": conf,
            "probabilities": probs,
            "model_name": "DenseNet121",
            "model_version": "v1.2",
            "mode": "production"
        }
    except Exception as e:
        logger.error(f"PyTorch inference failed: {str(e)}")
        raise RuntimeError(f"Model inference failed: {str(e)}")
