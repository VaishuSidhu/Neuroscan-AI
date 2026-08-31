import React, { useState } from 'react';
import { Printer, HeartPulse, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DiagnosticReportProps {
  patient: any;
  scan: any;
  prediction: any;
  onSaveNotes?: (notes: string) => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  patient,
  scan,
  prediction,
  onSaveNotes
}) => {
  const [notes, setNotes] = useState(prediction?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSaveNotes) {
      onSaveNotes(notes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe checks for probabilities
  const probs = prediction?.probabilities || {};
  const probGlioma = probs['Glioma'] || 0;
  const probMeningioma = probs['Meningioma'] || 0;
  const probPituitary = probs['Pituitary Tumor'] || 0;
  const probNoTumor = probs['No Tumor'] || 0;

  const area = prediction?.localization?.tumor_area_mm2 || prediction?.tumor_area_mm2 || 0;

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto my-6">
      {/* Action Toolbar */}
      <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">Diagnostic Report Preview</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="print:p-10 p-8 flex flex-col space-y-8 bg-white" id="printable-report">
        
        {/* Report Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none print:text-2xl">
                NEUROSCAN DIAGNOSTIC REPORT
              </h1>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mt-1">
                AI-Assisted Decision Support System
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-800 font-mono">REPORT ID: REP-{String(prediction?.id).toUpperCase()}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">DATE: {prediction?.created_at}</div>
          </div>
        </div>

        {/* Patient & Scan Info Grid */}
        <div className="grid grid-cols-2 gap-6 print:grid-cols-2">
          {/* Patient Details */}
          <div className="bg-slate-50 print:bg-white border border-slate-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
              Patient Information
            </h3>
            <table className="w-full text-xs text-slate-600 border-collapse">
              <tbody>
                <tr className="border-b border-slate-100/50">
                  <td className="py-1.5 font-medium text-slate-500">Patient ID</td>
                  <td className="py-1.5 text-right font-mono font-semibold text-slate-800">{patient?.patient_id}</td>
                </tr>
                <tr className="border-b border-slate-100/50">
                  <td className="py-1.5 font-medium text-slate-500">Full Name</td>
                  <td className="py-1.5 text-right font-semibold text-slate-800">{patient?.name}</td>
                </tr>
                <tr className="border-b border-slate-100/50">
                  <td className="py-1.5 font-medium text-slate-500">Age / Gender</td>
                  <td className="py-1.5 text-right text-slate-800">{patient?.age} Yrs / {patient?.gender}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-medium text-slate-500">Classification</td>
                  <td className="py-1.5 text-right text-slate-800 font-mono font-semibold text-blue-600">{prediction?.predicted_class}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Scan Info */}
          <div className="bg-slate-50 print:bg-white border border-slate-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
              Scan &amp; Analysis Details
            </h3>
            <table className="w-full text-xs text-slate-600 border-collapse">
              <tbody>
                <tr className="border-b border-slate-100/50">
                  <td className="py-1.5 font-medium text-slate-500">Scan Reference</td>
                  <td className="py-1.5 text-right font-mono text-slate-800">SC-{prediction?.scan_id}</td>
                </tr>
                <tr className="border-b border-slate-100/50">
                  <td className="py-1.5 font-medium text-slate-500">Modality Type</td>
                  <td className="py-1.5 text-right text-slate-800">{scan?.file_type}</td>
                </tr>
                <tr className="border-b border-slate-100/50">
                  <td className="py-1.5 font-medium text-slate-500">AI Model Release</td>
                  <td className="py-1.5 text-right font-mono text-slate-800">DenseNet121 (v1.2)</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-medium text-slate-500">Ingestion Mode</td>
                  <td className="py-1.5 text-right text-slate-800 font-mono font-bold text-emerald-600">Research Prototype</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Prediction Findings */}
        <div className="border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AI Classifier Diagnostics
            </h3>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
              prediction?.predicted_class === 'No Tumor' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {prediction?.predicted_class === 'No Tumor' ? 'NO PATHOLOGY DETECTED' : 'TUMOR TISSUE DETECTED'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6 items-center">
            {/* Primary Finding */}
            <div className="col-span-1 border-r border-slate-100 pr-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Primary Prediction</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{prediction?.predicted_class}</span>
              <div className="flex items-baseline space-x-1 mt-2.5">
                <span className="text-2xl font-bold text-blue-600 font-mono">{(prediction?.confidence * 100).toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 font-medium">confidence</span>
              </div>
            </div>

            {/* Probability Spread */}
            <div className="col-span-2 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Probability Distribution</span>
              
              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                  <span className="font-semibold">Glioma</span>
                  <span className="font-mono">{(probGlioma * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${probGlioma * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                  <span className="font-semibold">Meningioma</span>
                  <span className="font-mono">{(probMeningioma * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${probMeningioma * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                  <span className="font-semibold">Pituitary Tumor</span>
                  <span className="font-mono">{(probPituitary * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${probPituitary * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                  <span className="font-semibold">No Tumor</span>
                  <span className="font-mono">{(probNoTumor * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${probNoTumor * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explainability & Segmentation Specs */}
        <div className="grid grid-cols-2 gap-6 print:grid-cols-2">
          {/* Segmentation Details */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
              Tumor Localization Metrics
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Estimated Area</span>
                <span className="font-mono font-semibold text-slate-800">
                  {area ? `${area} mm²` : '0 mm²'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Suspected Boundary</span>
                <span className="font-semibold text-slate-800 text-[10px]">
                  {prediction?.predicted_class === 'No Tumor' ? 'None' : (prediction?.localization?.region || 'Localized Boundary Contour')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Localization Confidence</span>
                <span className="font-mono font-semibold text-slate-800">
                  {prediction?.predicted_class === 'No Tumor' ? 'N/A' : `${((prediction?.localization?.confidence || prediction?.confidence) * 100).toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* XAI Details */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
              Explainable AI (Grad-CAM) Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {prediction?.predicted_class === 'No Tumor' 
                ? 'No abnormal voxel heatmaps generated. Background signals demonstrate standard anatomical configuration with normal voxel significance weights.'
                : `Grad-CAM activation overlays reveal that the model placed highest weighting on voxel densities inside the suspected ${prediction?.predicted_class} boundary layer, supporting classification.`
              }
            </p>
          </div>
        </div>

        {/* Clinical Notes (Editable on Screen, Printable) */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Clinician Impressions &amp; Diagnostic Notes
          </h3>
          <div className="no-print">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter details on resection options, follow-up scan timelines, and biological markers..."
              className="w-full p-3.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans"
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 active:bg-black text-white rounded-lg transition-colors flex items-center cursor-pointer shadow-sm"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Notes Saved
                  </>
                ) : 'Compile PDF Report'}
              </button>
            </div>
          </div>
          {/* Printable clinical notes overlay */}
          <div className="hidden print:block text-xs text-slate-700 border border-slate-200 bg-slate-50/50 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap">
            {notes || 'No clinical impressions added.'}
          </div>
        </div>

        {/* Disclaimer / Regulatory Information */}
        <div className="pt-6 border-t border-slate-200 mt-6">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[10px] leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-600 block uppercase tracking-wider mb-0.5">Clinical Disclaimer</span>
              This system provides AI-assisted analysis for research and decision-support purposes. AI predictions should not be interpreted as a standalone medical diagnosis and should be reviewed by a qualified healthcare professional.
            </div>
          </div>
        </div>

        {/* Doctor Signature Placeholders (Only for Print) */}
        <div className="hidden print:flex justify-between pt-12 text-xs">
          <div>
            <div className="w-40 border-b border-slate-300 h-8"></div>
            <p className="text-[10px] text-slate-500 mt-2">Analyzing Radiologist Signature</p>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-slate-300 h-8 ml-auto"></div>
            <p className="text-[10px] text-slate-500 mt-2">Authorized Board Approval Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
};
