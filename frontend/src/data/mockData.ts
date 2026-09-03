export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  created_at: string;
  notes?: string;
}

export interface Scan {
  id: string;
  patient_id: string;
  file_url: string;
  upload_date: string;
  scan_type: 'Axial T2' | 'Sagittal T1' | 'Coronal T1c' | 'FLAIR';
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface Prediction {
  id: string;
  scan_id: string;
  predicted_class: 'Glioma' | 'Meningioma' | 'Pituitary Tumor' | 'No Tumor';
  confidence: number;
  probabilities: {
    glioma: number;
    meningioma: number;
    pituitary: number;
    no_tumor: number;
  };
  tumor_area_mm2?: number;
  model_name: string;
  model_version: string;
  created_at: string;
  notes?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  status: 'Active' | 'Inactive';
  dataset: string;
  params: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Doctor/Researcher';
  status: 'Active' | 'Inactive';
  joined: string;
}
