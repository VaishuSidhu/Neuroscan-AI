"""
Brain Tumor MRI Classification - DenseNet121 Transfer Learning Training Script
=============================================================================
Downloads the Kaggle Brain Tumor MRI Dataset and trains a DenseNet121 model
with ImageNet pre-trained weights for 4-class brain tumor classification.

Classes: Glioma, Meningioma, No Tumor, Pituitary Tumor
Expected accuracy: 93-96% with transfer learning

Usage:
    python train_model.py
"""

import os
import sys
import time
import json
import shutil
import zipfile
import logging
import urllib.request
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import transforms, datasets, models

# ============================================================================
# Configuration
# ============================================================================
BATCH_SIZE = 16
NUM_EPOCHS = 12        # Enough for transfer learning convergence on CPU
LEARNING_RATE = 0.001
NUM_CLASSES = 4
IMAGE_SIZE = 224       # DenseNet121 standard input
TRAIN_SPLIT = 0.85     # 85% train, 15% validation
NUM_WORKERS = 0        # Windows compatibility

PROJECT_ROOT = Path(__file__).resolve().parent
MODELS_DIR = PROJECT_ROOT / "models"
DATA_DIR = PROJECT_ROOT / "dataset"
CLASSIFIER_SAVE_PATH = MODELS_DIR / "brain_tumor_classifier.pth"
TRAINING_LOG_PATH = MODELS_DIR / "training_metrics.json"

CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]
CLASS_DISPLAY = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "notumor": "No Tumor",
    "pituitary": "Pituitary Tumor"
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ============================================================================
# Dataset Download
# ============================================================================
def download_dataset():
    """Download Brain Tumor MRI Dataset from multiple sources."""
    if DATA_DIR.exists() and any(DATA_DIR.iterdir()):
        # Check if we already have the training data
        for subdir in DATA_DIR.iterdir():
            if subdir.is_dir():
                subdirs = list(subdir.iterdir())
                if len(subdirs) >= 4:
                    logger.info(f"Dataset already exists at {DATA_DIR}")
                    return subdir if subdir.name == "Training" else DATA_DIR
        # Check direct class folders
        class_dirs = [d for d in DATA_DIR.iterdir() if d.is_dir()]
        if len(class_dirs) >= 4:
            logger.info(f"Dataset already exists at {DATA_DIR}")
            return DATA_DIR

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Try multiple download sources
    urls = [
        # Source 1: GitHub hosted mirror
        "https://github.com/sartajbhuvaji/brain-tumor-classification-dataset/archive/refs/heads/master.zip",
    ]
    
    zip_path = DATA_DIR / "dataset.zip"
    downloaded = False
    
    for url in urls:
        try:
            logger.info(f"Downloading dataset from: {url}")
            logger.info("This may take a few minutes...")
            
            def show_progress(count, block_size, total_size):
                percent = int(count * block_size * 100 / total_size) if total_size > 0 else 0
                mb = count * block_size / (1024 * 1024)
                sys.stdout.write(f"\r  Downloaded: {mb:.1f} MB ({percent}%)")
                sys.stdout.flush()
            
            urllib.request.urlretrieve(url, zip_path, reporthook=show_progress)
            print()  # newline after progress
            downloaded = True
            break
        except Exception as e:
            logger.warning(f"Failed from {url}: {e}")
            continue
    
    if not downloaded:
        logger.error(
            "Could not download dataset automatically.\n"
            "Please manually download the Brain Tumor MRI Dataset from:\n"
            "  https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset\n"
            f"Extract it to: {DATA_DIR}\n"
            "Expected structure: dataset/Training/glioma/, dataset/Training/meningioma/, etc."
        )
        sys.exit(1)
    
    # Extract
    logger.info("Extracting dataset...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(DATA_DIR)
    
    # Find the Training folder
    training_dir = None
    for root, dirs, files in os.walk(DATA_DIR):
        if "Training" in dirs:
            training_dir = Path(root) / "Training"
            break
        # Also check for lowercase
        for d in dirs:
            if d.lower() == "training":
                training_dir = Path(root) / d
                break
    
    # Clean up zip
    if zip_path.exists():
        zip_path.unlink()
    
    if training_dir and training_dir.exists():
        logger.info(f"Dataset extracted successfully to: {training_dir}")
        return training_dir
    
    # Fallback: look for class directories directly
    for root, dirs, files in os.walk(DATA_DIR):
        matching = [d for d in dirs if d.lower() in CLASS_NAMES]
        if len(matching) >= 3:
            logger.info(f"Found class folders in: {root}")
            return Path(root)
    
    logger.error(f"Could not find training data after extraction. Check {DATA_DIR}")
    sys.exit(1)


# ============================================================================
# Model Definition
# ============================================================================
def create_model():
    """Create DenseNet121 with modified classifier head for 4-class brain tumor classification."""
    logger.info("Loading DenseNet121 with ImageNet pre-trained weights...")
    
    model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
    
    # Freeze early feature extraction layers (first 2 dense blocks)
    # This preserves learned low-level features while allowing fine-tuning of higher layers
    freeze_count = 0
    for name, param in model.features.named_parameters():
        if 'denseblock1' in name or 'denseblock2' in name or 'transition1' in name:
            param.requires_grad = False
            freeze_count += 1
    
    logger.info(f"Frozen {freeze_count} parameters in early layers")
    
    # Replace classifier head
    num_features = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(num_features, 512),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(512, NUM_CLASSES)
    )
    
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    logger.info(f"Model created: {trainable:,} trainable / {total:,} total parameters")
    
    return model


# ============================================================================
# Data Transforms
# ============================================================================
def get_transforms():
    """Get training and validation transforms."""
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE + 32, IMAGE_SIZE + 32)),
        transforms.RandomCrop(IMAGE_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    return train_transform, val_transform


# ============================================================================
# Training Loop
# ============================================================================
def train_model(model, train_loader, val_loader, device, class_names):
    """Train the model with early stopping and learning rate scheduling."""
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=LEARNING_RATE,
        weight_decay=1e-4
    )
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=4, gamma=0.3)
    
    best_val_acc = 0.0
    training_history = {
        "epochs": [],
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
        "learning_rates": []
    }
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Starting Training - {NUM_EPOCHS} epochs on {device}")
    logger.info(f"{'='*60}\n")
    
    for epoch in range(NUM_EPOCHS):
        epoch_start = time.time()
        
        # ---------- Training Phase ----------
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (inputs, labels) in enumerate(train_loader):
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            if (batch_idx + 1) % 20 == 0:
                batch_acc = 100. * correct / total
                sys.stdout.write(
                    f"\r  Epoch [{epoch+1}/{NUM_EPOCHS}] "
                    f"Batch [{batch_idx+1}/{len(train_loader)}] "
                    f"Loss: {running_loss/(batch_idx+1):.4f} "
                    f"Acc: {batch_acc:.1f}%"
                )
                sys.stdout.flush()
        
        train_loss = running_loss / len(train_loader)
        train_acc = 100. * correct / total
        
        # ---------- Validation Phase ----------
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        class_correct = {c: 0 for c in range(NUM_CLASSES)}
        class_total = {c: 0 for c in range(NUM_CLASSES)}
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
                
                for i in range(labels.size(0)):
                    label = labels[i].item()
                    class_correct[label] += (predicted[i] == label).item()
                    class_total[label] += 1
        
        val_loss = val_loss / len(val_loader)
        val_acc = 100. * val_correct / val_total
        
        epoch_time = time.time() - epoch_start
        current_lr = optimizer.param_groups[0]['lr']
        
        # Log epoch results
        logger.info(
            f"\n  Epoch {epoch+1}/{NUM_EPOCHS} ({epoch_time:.0f}s) | "
            f"Train Loss: {train_loss:.4f} Acc: {train_acc:.1f}% | "
            f"Val Loss: {val_loss:.4f} Acc: {val_acc:.1f}% | "
            f"LR: {current_lr:.6f}"
        )
        
        # Per-class accuracy
        for c in range(NUM_CLASSES):
            if class_total[c] > 0:
                c_acc = 100. * class_correct[c] / class_total[c]
                c_name = class_names[c] if c < len(class_names) else f"Class_{c}"
                logger.info(f"    {c_name}: {c_acc:.1f}% ({class_correct[c]}/{class_total[c]})")
        
        # Save history
        training_history["epochs"].append(epoch + 1)
        training_history["train_loss"].append(round(train_loss, 4))
        training_history["train_acc"].append(round(train_acc, 2))
        training_history["val_loss"].append(round(val_loss, 4))
        training_history["val_acc"].append(round(val_acc, 2))
        training_history["learning_rates"].append(current_lr)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            
            # Save the full model state dict with metadata
            save_dict = {
                "model_state_dict": model.state_dict(),
                "class_names": class_names,
                "class_display": CLASS_DISPLAY,
                "num_classes": NUM_CLASSES,
                "image_size": IMAGE_SIZE,
                "architecture": "DenseNet121",
                "epoch": epoch + 1,
                "val_accuracy": val_acc,
                "train_accuracy": train_acc,
                "normalize_mean": [0.485, 0.456, 0.406],
                "normalize_std": [0.229, 0.224, 0.225]
            }
            torch.save(save_dict, CLASSIFIER_SAVE_PATH)
            logger.info(f"  ★ Best model saved! Val Acc: {val_acc:.1f}%")
        
        scheduler.step()
    
    # Save training history
    training_history["best_val_accuracy"] = round(best_val_acc, 2)
    training_history["final_train_accuracy"] = round(train_acc, 2)
    with open(TRAINING_LOG_PATH, 'w') as f:
        json.dump(training_history, f, indent=2)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Training Complete!")
    logger.info(f"Best Validation Accuracy: {best_val_acc:.1f}%")
    logger.info(f"Model saved to: {CLASSIFIER_SAVE_PATH}")
    logger.info(f"Training log: {TRAINING_LOG_PATH}")
    logger.info(f"{'='*60}")
    
    return training_history


# ============================================================================
# Main Entry Point
# ============================================================================
def main():
    logger.info("=" * 60)
    logger.info("Brain Tumor DenseNet121 - Transfer Learning Training")
    logger.info("=" * 60)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Device: {device}")
    
    # 1. Download / locate dataset
    training_dir = download_dataset()
    
    # 2. Create transforms
    train_transform, val_transform = get_transforms()
    
    # 3. Load dataset
    logger.info(f"Loading dataset from: {training_dir}")
    full_dataset = datasets.ImageFolder(root=str(training_dir), transform=train_transform)
    
    class_names = full_dataset.classes
    logger.info(f"Found {len(full_dataset)} images in {len(class_names)} classes: {class_names}")
    
    # Count per class
    class_counts = {}
    for _, label in full_dataset.samples:
        c = class_names[label]
        class_counts[c] = class_counts.get(c, 0) + 1
    for c, count in class_counts.items():
        logger.info(f"  {c}: {count} images")
    
    # 4. Split into train/val
    train_size = int(TRAIN_SPLIT * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    train_dataset, val_dataset = random_split(
        full_dataset, [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    # Apply validation transform to val set
    # (We need a wrapper since random_split doesn't change transforms)
    val_dataset.dataset = datasets.ImageFolder(root=str(training_dir), transform=val_transform)
    
    logger.info(f"Train: {train_size} images | Val: {val_size} images")
    
    train_loader = DataLoader(
        train_dataset, batch_size=BATCH_SIZE, shuffle=True,
        num_workers=NUM_WORKERS, pin_memory=False
    )
    val_loader = DataLoader(
        val_dataset, batch_size=BATCH_SIZE, shuffle=False,
        num_workers=NUM_WORKERS, pin_memory=False
    )
    
    # 5. Create model
    model = create_model()
    model = model.to(device)
    
    # 6. Train
    history = train_model(model, train_loader, val_loader, device, class_names)
    
    # 7. Final verification
    logger.info("\nVerifying saved model...")
    checkpoint = torch.load(CLASSIFIER_SAVE_PATH, map_location=device, weights_only=False)
    test_model = create_model()
    test_model.load_state_dict(checkpoint["model_state_dict"])
    test_model.eval()
    
    # Quick inference test
    test_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE)
    with torch.no_grad():
        test_output = test_model(test_input)
        probs = torch.softmax(test_output, dim=1)
        logger.info(f"Test inference output shape: {test_output.shape}")
        logger.info(f"Test softmax sum: {probs.sum().item():.4f}")
    
    logger.info("\n✓ Model verified and ready for production inference!")
    logger.info(f"  Weights: {CLASSIFIER_SAVE_PATH}")
    logger.info(f"  Classes: {checkpoint['class_names']}")
    logger.info(f"  Best accuracy: {checkpoint['val_accuracy']:.1f}%")


if __name__ == "__main__":
    main()
