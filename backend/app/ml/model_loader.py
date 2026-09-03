import os
import logging
from ..config import settings

logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self):
        self.classifier = None
        self.segmentation = None
        self.device = "cpu"
        self.class_names = ["glioma_tumor", "meningioma_tumor", "no_tumor", "pituitary_tumor"]
        self.class_display = {
            "glioma": "Glioma",
            "glioma_tumor": "Glioma",
            "meningioma": "Meningioma",
            "meningioma_tumor": "Meningioma",
            "notumor": "No Tumor",
            "no_tumor": "No Tumor",
            "pituitary": "Pituitary Tumor",
            "pituitary_tumor": "Pituitary Tumor"
        }
        self.initialized = False
        
    def load_models(self):
        if self.initialized:
            return
            
        if settings.AI_MODE == "production":
            logger.info("Initializing AI system in PRODUCTION mode...")
            
            c_path = settings.CLASSIFIER_MODEL_PATH
            if not os.path.isabs(c_path):
                # Try relative to current working directory, then relative to backend root
                backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                candidate_paths = [
                    os.path.abspath(c_path),
                    os.path.join(backend_dir, c_path.lstrip("./\\").replace("../", ""))
                ]
                for p in candidate_paths:
                    if os.path.exists(p):
                        c_path = p
                        break

            if not os.path.exists(c_path):
                raise FileNotFoundError(
                    f"Production model weight file missing at: {c_path}. "
                    f"Please place 'brain_tumor_classifier.pth' in the backend/models directory."
                )
                
            try:
                import torch
                import torch.nn as nn
                from torchvision import models
                logger.info(f"PyTorch loaded successfully. Reading neural weight file from {c_path}...")
                
                device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
                torch.set_num_threads(1)

                # Reconstruct DenseNet121 architecture matching training script
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
                
                if "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                    self.class_names = checkpoint.get("class_names", ["glioma_tumor", "meningioma_tumor", "no_tumor", "pituitary_tumor"])
                else:
                    model.load_state_dict(checkpoint)
                    self.class_names = ["glioma_tumor", "meningioma_tumor", "no_tumor", "pituitary_tumor"]

                # Free checkpoint dictionary memory immediately
                del checkpoint
                import gc
                gc.collect()

                # Canonical display mapping covering various naming conventions
                self.class_display = {
                    "glioma": "Glioma",
                    "glioma_tumor": "Glioma",
                    "meningioma": "Meningioma",
                    "meningioma_tumor": "Meningioma",
                    "notumor": "No Tumor",
                    "no_tumor": "No Tumor",
                    "pituitary": "Pituitary Tumor",
                    "pituitary_tumor": "Pituitary Tumor"
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
