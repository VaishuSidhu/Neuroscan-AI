import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, X, Search, AlertCircle, PlayCircle } from 'lucide-react';

interface AnalysisUploadProps {
  setPath: (path: string) => void;
  setSelectedScanId: (id: number | null) => void;
}

export const AnalysisUpload: React.FC<AnalysisUploadProps> = ({ setPath, setSelectedScanId }) => {
  const { patients, addPatient, uploadAndAnalyze } = useApp();

  // Form states
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // New patient fields
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newNotes, setNewNotes] = useState('');
  const [newPatientId, setNewPatientId] = useState(`PT-${Math.floor(1000 + Math.random() * 9000)}`);

  // Scan fields
  const [scanType, setScanType] = useState<'Axial T2' | 'Sagittal T1' | 'Coronal T1c' | 'FLAIR'>('FLAIR');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  // Helper: Convert base64 data to File object for upload
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Raw SVG Brain slice templates for Demo Presets (in base64 format for atob processing)
  const base64Slices = {
    normal: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADdklEQVR4Ae3BAQEAAACCoHrj/4UNSSgQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivRr+4nkBqhimFgAAAABJRU5ErkJggg==',
    glioma: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADdklEQVR4Ae3BAQEAAACCoHrj/4UNSSgQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivRr+4nkBqhimFgAAAABJRU5ErkJggg==',
    meningioma: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADdklEQVR4Ae3BAQEAAACCoHrj/4UNSSgQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivRr+4nkBqhimFgAAAABJRU5ErkJggg==',
    pituitary: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADdklEQVR4Ae3BAQEAAACCoHrj/4UNSSgQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivSoQ6VWBSK8KRHpVINKrApFeFYj0qkCkVwUivRr+4nkBqhimFgAAAABJRU5ErkJggg=='
  };

  // We can write simple gray circles representing slices in base64
  const demoSlices = {
    normal: `data:image/png;base64,${base64Slices.normal}`,
    glioma: `data:image/png;base64,${base64Slices.glioma}`,
    meningioma: `data:image/png;base64,${base64Slices.meningioma}`,
    pituitary: `data:image/png;base64,${base64Slices.pituitary}`
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setActiveFile(file);
      setFileDetails({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'image/png'
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDemoPreset = (type: 'normal' | 'glioma' | 'meningioma' | 'pituitary') => {
    const dataUrl = demoSlices[type];
    const filename = `demo_mri_${type}.png`;
    const fileObj = dataURLtoFile(dataUrl, filename);

    setImagePreview(dataUrl);
    setActiveFile(fileObj);
    setFileDetails({
      name: filename,
      size: '24.5 KB',
      type: 'image/png'
    });
    setError('');
    
    if (type === 'pituitary') setScanType('Coronal T1c');
    else if (type === 'glioma') setScanType('FLAIR');
    else setScanType('Axial T2');
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview(null);
    setActiveFile(null);
    setFileDetails(null);
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Patient Selection / Creation Validation
    let targetPatientId = '';
    if (patientMode === 'existing') {
      if (!selectedPatientId) {
        setError('Please select an active patient from the registry.');
        return;
      }
      targetPatientId = selectedPatientId;
    } else {
      if (!newName || !newAge) {
        setError('Please complete the new patient demographic form.');
        return;
      }
      try {
        const created = await addPatient({
          patient_id: newPatientId,
          name: newName,
          age: parseInt(newAge),
          gender: newGender,
          notes: newNotes
        });
        targetPatientId = created.patient_id;
      } catch (err) {
        setError('Failed to create patient profile in database.');
        return;
      }
    }

    // 2. Image File Validation
    if (!activeFile) {
      setError('Please upload a brain MRI scan or select a demo preset.');
      return;
    }

    // 3. Trigger Ingestion upload & start processing animation
    try {
      setPath('#/analysis/process');
      await uploadAndAnalyze(targetPatientId, scanType, activeFile, (predId) => {
        // Redirection handled by AppContext once completed
      });
    } catch (err) {
      setError('AI diagnostic run failed. Check server connection.');
      setPath('#/analysis');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">AI MRI Diagnostic Pipeline Ingestion</h2>
        <p className="text-[10px] text-slate-400">Initialize a new brain scan processing routine.</p>
      </div>

      {error && (
        <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartAnalysis} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Patient Selector/Creator */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Selection</h3>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPatientMode('existing')}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  patientMode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Select Registry
              </button>
              <button
                type="button"
                onClick={() => {
                  setPatientMode('new');
                  setNewPatientId(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  patientMode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Create Profile
              </button>
            </div>
          </div>

          {patientMode === 'existing' ? (
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Patient Profile</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-700 transition-all appearance-none"
                >
                  <option value="">-- Choose Patient Profile --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.patient_id}>
                      {p.name} ({p.patient_id} - Age {p.age} {p.gender})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient ID</label>
                  <input
                    type="text"
                    disabled
                    value={newPatientId}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinician Registry Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter Patient Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                  />
                </div>
                <div className="col-span-1 flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age (Yrs)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="42"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Clinical History Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Patient medical history and scan reasons..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Scan Type Selection */}
          <div className="flex flex-col space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan Modality Sequence</label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['Axial T2', 'Sagittal T1', 'Coronal T1c', 'FLAIR'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setScanType(type)}
                  className={`py-1.5 text-[9px] font-bold rounded-lg transition-all text-center ${
                    scanType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upload File area */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2.5 border-b border-slate-100">
            MRI Scan Image File
          </h3>

          {!imagePreview ? (
            <div 
              onClick={triggerUpload}
              className="flex-grow border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all duration-200"
            >
              <div className="p-3 rounded-full bg-slate-50 text-slate-400">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <span className="text-xs font-semibold text-blue-600 hover:underline">Click to upload file</span>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG or DICOM support architectural placeholder</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-3 h-52">
              <img src={imagePreview} alt="MRI Preview" className="max-h-full max-w-full object-contain rounded opacity-90" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white hover:bg-red-700 rounded-full transition-colors"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {fileDetails && (
                <div className="absolute bottom-2 left-2 bg-black/75 px-2.5 py-1 rounded text-[9px] font-mono text-emerald-400 select-none">
                  {fileDetails.name} ({fileDetails.size})
                </div>
              )}
            </div>
          )}

          {/* Demo Presets Selector Panel */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-2.5">
              Demonstration MRI Presets (Instantly Fill Workspace)
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleDemoPreset('normal')}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 transition-all flex items-center space-x-2"
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                <span className="truncate">Normal Brain FLAIR</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('glioma')}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 transition-all flex items-center space-x-2"
              >
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block shrink-0"></span>
                <span className="truncate">Glioma Preset Scan</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('meningioma')}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 transition-all flex items-center space-x-2"
              >
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shrink-0"></span>
                <span className="truncate">Meningioma T2</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('pituitary')}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 transition-all flex items-center space-x-2"
              >
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0"></span>
                <span className="truncate">Pituitary Coronal</span>
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* CTA Bottom bar */}
      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={handleStartAnalysis}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Start AI Diagnosis Analysis
        </button>
      </div>

    </div>
  );
};
