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

// Initial mock patients
export const mockPatients: Patient[] = [
  { id: 'p1', patient_id: 'PT-9821', name: 'Eleanor Vance', age: 42, gender: 'Female', created_at: '2026-03-12', notes: 'Patient presenting with chronic headaches and light sensitivity.' },
  { id: 'p2', patient_id: 'PT-4512', name: 'Marcus Brody', age: 58, gender: 'Male', created_at: '2026-04-20', notes: 'Follow-up scan after partial resection of pituitary microadenoma.' },
  { id: 'p3', patient_id: 'PT-2290', name: 'Sophia Chen', age: 31, gender: 'Female', created_at: '2026-06-05', notes: 'Routine checkup. History of familial meningioma.' },
  { id: 'p4', patient_id: 'PT-8831', name: 'David Miller', age: 67, gender: 'Male', created_at: '2026-07-18', notes: 'Referred from neurology. Cognitive lapses and motor weakness.' },
  { id: 'p5', patient_id: 'PT-1049', name: 'Clara Oswald', age: 26, gender: 'Female', created_at: '2026-08-01', notes: 'Baseline scan requested for research cohort control.' }
];

// Initial mock scans
export const mockScans: Scan[] = [
  { id: 's1', patient_id: 'PT-9821', file_url: 'scan_glioma.png', upload_date: '2026-08-10 10:14', scan_type: 'FLAIR', status: 'Completed' },
  { id: 's2', patient_id: 'PT-4512', file_url: 'scan_pituitary.png', upload_date: '2026-08-12 14:30', scan_type: 'Coronal T1c', status: 'Completed' },
  { id: 's3', patient_id: 'PT-2290', file_url: 'scan_meningioma.png', upload_date: '2026-08-15 09:12', scan_type: 'Axial T2', status: 'Completed' },
  { id: 's4', patient_id: 'PT-8831', file_url: 'scan_normal.png', upload_date: '2026-08-20 16:45', scan_type: 'Axial T2', status: 'Completed' }
];

// Mock predictions matching the scans above
export const mockPredictions: Prediction[] = [
  {
    id: 'pr1',
    scan_id: 's1',
    predicted_class: 'Glioma',
    confidence: 0.942,
    probabilities: { glioma: 0.942, meningioma: 0.031, pituitary: 0.018, no_tumor: 0.009 },
    tumor_area_mm2: 452,
    model_name: 'DenseNet121',
    model_version: 'v1.2',
    created_at: '2026-08-10 10:15',
    notes: 'Hyperintense signal on FLAIR located in the right frontal lobe with surrounding vasogenic edema. Findings consistent with high-grade glioma. Explainable maps highlight key voxel clusters in the right prefrontal cortex.'
  },
  {
    id: 'pr2',
    scan_id: 's2',
    predicted_class: 'Pituitary Tumor',
    confidence: 0.895,
    probabilities: { glioma: 0.015, meningioma: 0.042, pituitary: 0.895, no_tumor: 0.048 },
    tumor_area_mm2: 128,
    model_name: 'DenseNet121',
    model_version: 'v1.2',
    created_at: '2026-08-12 14:32',
    notes: 'Sellar mass measuring 11mm, causing minor indentation of the optic chiasm. AI localization highlights expansion of the pituitary gland.'
  },
  {
    id: 'pr3',
    scan_id: 's3',
    predicted_class: 'Meningioma',
    confidence: 0.917,
    probabilities: { glioma: 0.021, meningioma: 0.917, pituitary: 0.012, no_tumor: 0.050 },
    tumor_area_mm2: 310,
    model_name: 'DenseNet121',
    model_version: 'v1.2',
    created_at: '2026-08-15 09:14',
    notes: 'Extra-axial, dural-based mass in the left parietal region. Displays typical dural tail sign. Grad-CAM shows major influence around the dural boundary.'
  },
  {
    id: 'pr4',
    scan_id: 's4',
    predicted_class: 'No Tumor',
    confidence: 0.985,
    probabilities: { glioma: 0.004, meningioma: 0.006, pituitary: 0.005, no_tumor: 0.985 },
    tumor_area_mm2: 0,
    model_name: 'DenseNet121',
    model_version: 'v1.2',
    created_at: '2026-08-20 16:46',
    notes: 'No abnormal tissue expansion, midline shift, or mass effect detected. Brain structures are symmetric and within normal limits.'
  }
];

// Deep learning models info
export const mockModels: ModelInfo[] = [
  { id: 'm1', name: 'CNN (Baseline)', version: 'v1.0', accuracy: 0.914, precision: 0.908, recall: 0.899, f1: 0.903, auc: 0.921, status: 'Inactive', dataset: 'BraTS 2021', params: '2.5M', lastUpdated: '2025-10-14' },
  { id: 'm2', name: 'ResNet50', version: 'v2.1', accuracy: 0.941, precision: 0.937, recall: 0.932, f1: 0.934, auc: 0.950, status: 'Inactive', dataset: 'BraTS 2021 + Private Hospital Subset', params: '23.5M', lastUpdated: '2026-01-20' },
  { id: 'm3', name: 'DenseNet121', version: 'v1.2', accuracy: 0.952, precision: 0.948, recall: 0.945, f1: 0.946, auc: 0.961, status: 'Active', dataset: 'BraTS 2021 + Hospital MRI Cohort', params: '7.2M', lastUpdated: '2026-05-18' },
  { id: 'm4', name: 'EfficientNet-B4', version: 'v1.0', accuracy: 0.960, precision: 0.956, recall: 0.951, f1: 0.953, auc: 0.970, status: 'Inactive', dataset: 'BraTS 2021 + Hospital MRI Cohort', params: '11.8M', lastUpdated: '2026-07-02' }
];

// Training vs Validation Epoch Metrics (For DenseNet121 - Active Model)
export const mockEpochMetrics = Array.from({ length: 30 }, (_, i) => {
  const epoch = i + 1;
  // Simulating typical curves
  const trAcc = 0.65 + (0.958 - 0.65) * (1 - Math.exp(-epoch / 6)) + (Math.random() * 0.008);
  const valAcc = 0.63 + (0.952 - 0.63) * (1 - Math.exp(-epoch / 6.5)) + (Math.random() * 0.015 - 0.005);
  const trLoss = 0.8 * Math.exp(-epoch / 6) + 0.08 + (Math.random() * 0.01);
  const valLoss = 0.95 * Math.exp(-epoch / 5.5) + 0.095 + (Math.random() * 0.02 - 0.005);
  
  return {
    epoch,
    trainingAccuracy: parseFloat((trAcc * 100).toFixed(2)),
    validationAccuracy: parseFloat((valAcc * 100).toFixed(2)),
    trainingLoss: parseFloat(trLoss.toFixed(4)),
    validationLoss: parseFloat(valLoss.toFixed(4))
  };
});

// ROC Curve data
export const mockRocData = [
  { fpr: 0, cnn: 0, resnet: 0, densenet: 0, efficientnet: 0 },
  { fpr: 0.05, cnn: 0.65, resnet: 0.82, densenet: 0.88, efficientnet: 0.91 },
  { fpr: 0.1, cnn: 0.80, resnet: 0.90, densenet: 0.93, efficientnet: 0.95 },
  { fpr: 0.15, cnn: 0.87, resnet: 0.93, densenet: 0.96, efficientnet: 0.97 },
  { fpr: 0.2, cnn: 0.91, resnet: 0.95, densenet: 0.97, efficientnet: 0.98 },
  { fpr: 0.3, cnn: 0.94, resnet: 0.97, densenet: 0.985, efficientnet: 0.99 },
  { fpr: 0.5, cnn: 0.97, resnet: 0.99, densenet: 0.995, efficientnet: 0.998 },
  { fpr: 0.8, cnn: 0.99, resnet: 0.998, densenet: 1.0, efficientnet: 1.0 },
  { fpr: 1.0, cnn: 1.0, resnet: 1.0, densenet: 1.0, efficientnet: 1.0 }
];

// Precision-Recall Curve data
export const mockPrData = [
  { recall: 0, cnn: 1.0, resnet: 1.0, densenet: 1.0, efficientnet: 1.0 },
  { recall: 0.2, cnn: 0.98, resnet: 0.99, densenet: 0.995, efficientnet: 0.998 },
  { recall: 0.4, cnn: 0.96, resnet: 0.98, densenet: 0.99, efficientnet: 0.993 },
  { recall: 0.6, cnn: 0.92, resnet: 0.96, densenet: 0.975, efficientnet: 0.982 },
  { recall: 0.8, cnn: 0.86, resnet: 0.91, densenet: 0.945, efficientnet: 0.958 },
  { recall: 0.9, cnn: 0.78, resnet: 0.86, densenet: 0.91, efficientnet: 0.93 },
  { recall: 0.95, cnn: 0.65, resnet: 0.75, densenet: 0.85, efficientnet: 0.88 },
  { recall: 1.0, cnn: 0.45, resnet: 0.55, densenet: 0.62, efficientnet: 0.65 }
];

// Confusion Matrix (For Active Model: DenseNet121)
// True class vs Predicted class counts out of 500 validation cases
export const mockConfusionMatrix = [
  { name: 'Glioma (True)', Glioma: 118, Meningioma: 4, Pituitary: 2, Normal: 1 },
  { name: 'Meningioma (True)', Glioma: 6, Meningioma: 112, Pituitary: 3, Normal: 4 },
  { name: 'Pituitary (True)', Glioma: 1, Meningioma: 2, Pituitary: 122, Normal: 0 },
  { name: 'No Tumor (True)', Glioma: 2, Meningioma: 5, Pituitary: 1, Normal: 117 }
];

// Admin System Performance Stats (API responses per day, system load etc.)
export const mockSystemStats = {
  dailyAnalyses: [
    { date: 'Aug 24', scans: 42 },
    { date: 'Aug 25', scans: 55 },
    { date: 'Aug 26', scans: 38 },
    { date: 'Aug 27', scans: 61 },
    { date: 'Aug 28', scans: 48 },
    { date: 'Aug 29', scans: 34 },
    { date: 'Aug 30', scans: 59 }
  ],
  tumorDistribution: [
    { name: 'Glioma', value: 38 },
    { name: 'Meningioma', value: 29 },
    { name: 'Pituitary Tumor', value: 18 },
    { name: 'No Tumor', value: 15 }
  ],
  userActivity: [
    { id: 'act1', user: 'Dr. Sarah Jenkins', action: 'Uploaded Axial T2 scan for Eleanor Vance', time: '10 mins ago' },
    { id: 'act2', user: 'Admin', action: 'Released DenseNet121 model version v1.2', time: '2 hours ago' },
    { id: 'act3', user: 'Dr. Marcus Brody', action: 'Generated diagnostic report for PT-4512', time: '4 hours ago' },
    { id: 'act4', user: 'Researcher Linus Pauling', action: 'Ran comparison benchmark on EfficientNet-B4', time: '1 day ago' },
    { id: 'act5', user: 'Dr. Sarah Jenkins', action: 'Created new patient record PT-1049', time: '1 day ago' }
  ],
  modelUsage: [
    { name: 'DenseNet121', usage: 780 },
    { name: 'ResNet50', usage: 320 },
    { name: 'CNN (Baseline)', usage: 112 },
    { name: 'EfficientNet-B4', usage: 36 }
  ]
};

// Users data for Admin User Management
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Doctor/Researcher';
  status: 'Active' | 'Inactive';
  joined: string;
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Dr. Sarah Jenkins', email: 's.jenkins@neuroscan.ai', role: 'Doctor/Researcher', status: 'Active', joined: '2025-05-10' },
  { id: 'u2', name: 'Dr. Marcus Brody', email: 'm.brody@neuroscan.ai', role: 'Doctor/Researcher', status: 'Active', joined: '2025-08-14' },
  { id: 'u3', name: 'System Administrator', email: 'admin@neuroscan.ai', role: 'Admin', status: 'Active', joined: '2025-01-01' },
  { id: 'u4', name: 'Dr. Clara Oswald', email: 'c.oswald@neuroscan.ai', role: 'Doctor/Researcher', status: 'Active', joined: '2026-02-18' },
  { id: 'u5', name: 'Dr. John Watson', email: 'j.watson@neuroscan.ai', role: 'Doctor/Researcher', status: 'Inactive', joined: '2025-11-04' }
];
