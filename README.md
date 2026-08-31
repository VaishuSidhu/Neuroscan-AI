# Explainable Deep Learning-Based Brain Tumor Detection and Diagnostic Support System Using MRI

NeuroScan AI is a state-of-the-art clinical decision support system designed to assist neuro-radiologists and medical researchers. The platform leverages Deep Learning classifiers (DenseNet121, ResNet50) and U-Net segmentations to detect brain tumors from MRI scans, overlaying Grad-CAM gradient attention zones to satisfy explainability (XAI) requirements.

---

## ⚕️ Important Medical Safety Disclaimer
This system provides AI-assisted analysis for research and decision-support purposes. AI predictions should not be interpreted as a standalone medical diagnosis and should be reviewed by a qualified healthcare professional.

---

## 🚀 Key Features

* **Ingestion Portal**: Secure DICOM-compatible upload interface supporting image validation (size limits, file extensions check).
* **Radiology PACS Viewport**: HTML5 Canvas layout supporting contrast, brightness, zoom scale, and pan adjustments.
* **Explainable AI (Grad-CAM)**: Thermal color overlays highlighting voxel dimensions that most strongly influenced model outputs.
* **Lesion Segmentation Contour**: Tracing boundaries of suspected masses and computing volumetric area parameters (in mm²).
* **Relational Clinic Database**: Persisting user accounts, patient directories, scan records, classifications, and signature logs.
* **ReportLab PDF Compiler**: Assembling printable A4 PDF summaries containing demographics, scan overlays, signature fields, and clinical notes.
* **Admin Deployer Hub**: Toggling active classifier versions globally, managing user credentials, and tracking latency operational logs.

---

## 📂 Project Architecture

```text
NeuroScan AI/
├── frontend/             # React + TypeScript + Vite Client Application
│   ├── src/
│   │   ├── api/          # Axios API gateway modules
│   │   ├── components/   # PACS Viewport and HTML Report templates
│   │   ├── context/      # JWT auth and pipeline state providers
│   │   └── pages/        # Clinician/Admin dashboard pages
│   ├── package.json
│   └── Dockerfile
├── backend/              # FastAPI Python Web Framework
│   ├── app/
│   │   ├── main.py       # ASGI entrypoint and database seeder
│   │   ├── config.py     # Environment parameters loader
│   │   ├── database.py   # SQLAlchemy session engine
│   │   ├── models/       # Relational database mappings
│   │   ├── schemas/      # Pydantic schemas (data validations)
│   │   ├── routers/      # API endpoints (Auth, Patient, Ingestion, Reports)
│   │   ├── services/     # Business logic (ReportLab PDF compiling)
│   │   └── ml/           # Preprocessing, Grad-CAM, & UNet segmentation
│   ├── requirements.txt
│   └── Dockerfile
├── models/               # Checkpoint directory for .pth model weights
├── database/             # Relational database binary folder
├── uploads/              # Storage folder for scans, Grad-CAMs, and reports
└── docker-compose.yml    # Docker services orchestration config
```

---

## 🛠️ Installation & Setup

### 1. Requirements
Ensure you have the following installed on your machine:
* Python 3.11+
* Node.js 18+
* npm

---

### 2. Backend Deployment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows (PowerShell)
   .venv\Scripts\Activate.ps1
   # macOS / Linux
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create the environment config file (`.env`):
   ```bash
   # Copy template
   copy .env.example .env
   ```
5. Run database seeding and boot the ASGI server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The database is automatically created (`database/brain_tumor.db`) and seeded with default clinician accounts.*

---

### 3. Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   👉 **http://localhost:5173**

---

## 🔐 Credentials Presets (Autofill Supported)

The database seeds with the following credential profiles for demonstration reviews:

| Clinical Role | Email Username | Default Password | Dashboard Interface |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@neuroscan.ai` | `admin123` | Clinician directory, active model releases, operational logs. |
| **Doctor / Researcher** | `s.jenkins@neuroscan.ai` | `demo1234` | Ingestion scanner, PACS overlays, PDF compiler impressions. |

---

## 🧠 Real ML Model Weights Integration

By default, the server runs in **`AI_MODE=demo`**. 

To connect real Deep Learning models:
1. Place your trained PyTorch weights inside the `models/` directory:
   * Classifer model: `models/brain_tumor_classifier.pth`
   * U-Net model: `models/brain_tumor_unet.pth`
2. Update the backend `.env` configuration:
   ```env
   AI_MODE=production
   ```
3. Ensure PyTorch (`torch`) and `torchvision` packages are installed in your virtual environment:
   ```bash
   pip install torch torchvision
   ```

---

## 🐳 Docker Deployment (Single Command)

To run the entire full-stack application instantly in containerized modules:
```bash
docker-compose up --build
```
* Access Frontend: http://localhost
* Access Backend API Documentation: http://localhost:8000/docs
