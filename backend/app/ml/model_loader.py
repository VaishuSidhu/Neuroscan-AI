import os
import logging
from ..config import settings

logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self):
        self.classifier = None
        self.segmentation = None
        self.initialized = False
        
    def load_models(self):
        if self.initialized:
            return
            
        if settings.AI_MODE == "production":
            logger.info("Initializing AI system in PRODUCTION mode...")
            
            c_path = settings.CLASSIFIER_MODEL_PATH
            if not os.path.exists(c_path):
                raise FileNotFoundError(
                    f"Production model weight file missing: {c_path}. "
                    f"Please place the trained models in the models directory, or "
                    f"change AI_MODE=demo in your .env file to enable demo mode."
                )
                
            try:
                import torch
                import torch.nn as nn
                from torchvision import models
                logger.info("PyTorch loaded successfully. Reading neural weight files...")
                
                device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
                
                # Reconstruct DenseNet121 architecture to match training setup
                model = models.densenet121(weights=None)
                num_features = model.classifier.in_features
                model.classifier = nn.Sequential(
                    nn.Dropout(p=0.3),
                    nn.Linear(num_features, 512),
                    nn.ReLU(inplace=True),
                    nn.Dropout(p=0.2),
                    nn.Linear(512, 4) # 4 Classes
                )
                
                # Load state dict
                checkpoint = torch.load(c_path, map_location=device, weights_only=False)
                
                # Handle nested model_state_dict from our training script
                if "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                    self.class_names = checkpoint.get("class_names", ["glioma", "meningioma", "notumor", "pituitary"])
                    self.class_display = checkpoint.get("class_display", {
                        "glioma": "Glioma",
                        "meningioma": "Meningioma",
                        "notumor": "No Tumor",
                        "pituitary": "Pituitary Tumor"
                    })
                else:
                    model.load_state_dict(checkpoint)
                    self.class_names = ["glioma", "meningioma", "notumor", "pituitary"]
                    self.class_display = {
                        "glioma": "Glioma",
                        "meningioma": "Meningioma",
                        "notumor": "No Tumor",
                        "pituitary": "Pituitary Tumor"
                    }
                    
                model.eval()
                model = model.to(device)
                self.classifier = model
                self.device = device
                
                # Fallback for segmentation since we don't have a trained UNet in the repo
                self.segmentation = "DemoUNetNode"
                
                logger.info("Production models initialized successfully.")
            except ImportError:
                raise ImportError(
                    "PyTorch or torchvision is not installed. To run in production mode, "
                    "install PyTorch or toggle AI_MODE=demo in your .env configuration."
                )
            except Exception as e:
                logger.error(f"Failed to load PyTorch models: {str(e)}")
                raise e
        else:
            logger.info("Initializing AI system in DEMO mode. Bypassing .pth weight files.")
            self.classifier = "DemoClassifierNode"
            self.segmentation = "DemoUNetNode"
            
        self.initialized = True

model_loader = ModelLoader()
