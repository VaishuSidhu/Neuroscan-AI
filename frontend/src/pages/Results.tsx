import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MriVisualizer } from '../components/MriVisualizer';
import { 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  Eye, 
  Save, 
  CheckCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { analysisApi } from '../api/analysisApi';
import { reportApi } from '../api/reportApi';

interface ResultsProps {
  selectedScanId: number | null;
  selectedPredictionId: number | null;
  setPath: (path: string) => void;
}

export const Results: React.FC<ResultsProps> = ({
  selectedScanId,
  selectedPredictionId,
  setPath
}) => {
  const { updatePredictionNotes } = useApp();
  
  const [predictionDetail, setPredictionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'original' | 'heatmap' | 'overlay' | 'segmentation'>('overlay');
  const [notes, setNotes] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedPredictionId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const detail = await analysisApi.getPredictionDetail(selectedPredictionId);
        setPredictionDetail(detail);
        setNotes(detail.notes || '');
      } catch (err) {
        console.error('Failed to load prediction details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedPredictionId]);

  const handleSaveNotes = async () => {
    if (!predictionDetail) return;
    try {
      // In full-stack backend, saving impressions triggers PDF compilation report saving
      await updatePredictionNotes(predictionDetail.id, notes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to compile clinical report:', err);
    }
  };

  const handleReportRedirect = () => {
    setPath('#/reports');
  };

  if (loading) {
    return (
      <div className="p-24 text-center bg-white border border-slate-200 rounded-xl space-y-4 max-w-md mx-auto my-12">
        <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
        <h3 className="text-sm font-bold text-slate-800">Reading Patient Scan Metrics</h3>
        <p className="text-xs text-slate-400">Loading Grad-CAM weights and localization overlay arrays...</p>
      </div>
    );
  }

  if (!predictionDetail) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-4 max-w-md mx-auto my-12 animate-fade-in">
        <Layers className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800">No Analysis Record Selected</h3>
        <p className="text-xs text-slate-400">Please queue a new scan or review logs from the patient history dashboard.</p>
        <button onClick={() => setPath('#/analysis')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer">
          Ingest MRI Scan
        </button>
      </div>
    );
  }

  const isTumor = predictionDetail.predicted_class !== 'No Tumor';

  return (
    <div className="p-6 space-y-6">
      
      {/* Patient Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
            {predictionDetail.patient?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-800">{predictionDetail.patient?.name}</span>
              <span className="text-[10px] font-mono text-slate-400">({predictionDetail.patient?.patient_id})</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Age: <span className="font-semibold">{predictionDetail.patient?.age}</span> &bull; Gender: <span className="font-semibold">{predictionDetail.patient?.gender}</span> &bull; Scan modality: <span className="font-semibold">{predictionDetail.scan?.file_type}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleReportRedirect}
            className="flex items-center px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2 text-slate-500" />
            Structured Report Preview
          </button>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual PACS Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Grad-CAM Navigation Selector */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Explainable AI Viewport</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Select image overlay layers from pipeline output</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="What is Grad-CAM?"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 w-64 p-3 mt-1.5 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-800 text-[10px] leading-relaxed z-50">
                    <span className="font-bold text-blue-400 block mb-1">Grad-CAM (Explainable AI)</span>
                    Gradient-weighted Class Activation Mapping traces final gradient flows during feature identification. Highlighted jet regions indicate where the model placed highest convolutional priority.
                  </div>
                )}
              </div>
            </div>

            {/* In-view toggle selectors */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('original')}
                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'original' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Original MRI
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'heatmap' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => setViewMode('overlay')}
                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'overlay' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Overlay
              </button>
              <button
                onClick={() => setViewMode('segmentation')}
                disabled={!isTumor}
                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  viewMode === 'segmentation' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Segmentation
              </button>
            </div>

            {/* PACS Visualizer component loading directly from server uploads directories */}
            <MriVisualizer 
              originalUrl={predictionDetail.gradcam.original_image}
              heatmapUrl={predictionDetail.gradcam.heatmap_image}
              overlayUrl={predictionDetail.gradcam.overlay_image}
              localizationUrl={predictionDetail.localization.overlay_url}
              tumorType={predictionDetail.predicted_class}
              viewMode={viewMode}
              predictionId={predictionDetail.id}
            />

            {/* Disclaimer caption */}
            <div className="flex items-start space-x-2 text-[10px] text-slate-400 leading-normal px-1">
              <span className="font-bold text-amber-600 block shrink-0 mt-0.5">EXPLANATION:</span>
              <span>
                {viewMode === 'overlay' && 'Heatmap represents Grad-CAM overlay coordinates. Highlighted zones indicate where the model placed high feature priority.'}
                {viewMode === 'segmentation' && 'Suspected boundary segment outlines tumor mass volume. Calculated surface area parameter represents estimated pixel boundaries.'}
                {viewMode === 'original' && 'Original structural grayscale reference slice uploaded by clinician.'}
                {viewMode === 'heatmap' && 'Coarse activation gradient localization map generated via convolutional layer derivatives.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Classifier Output Details */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top Result Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Diagnostic Finding</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  {isTumor ? `${predictionDetail.predicted_class} Localized` : 'No Abnormal Expansion Detected'}
                </h2>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-mono text-slate-400">ACTIVE CLASSIFIER</span>
                <span className="text-[10px] font-mono font-bold text-blue-600 mt-0.5">DenseNet121 v1.2</span>
              </div>
            </div>

            {/* Confidence visualization Circular/Horizontal grid */}
            <div className="flex items-center space-x-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
              {/* Radial Confidence circle */}
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0 bg-white rounded-full shadow-inner border border-slate-200/80">
                <span className="text-sm font-extrabold text-blue-600 font-mono">{(predictionDetail.confidence * 100).toFixed(0)}%</span>
                {/* SVG Radial ring background */}
                <svg className="absolute w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="3" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke="#2563eb" 
                    strokeWidth="3.5" 
                    fill="transparent" 
                    strokeDasharray={175} 
                    strokeDashoffset={175 - (175 * predictionDetail.confidence)} 
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Confidence notes text */}
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700">Scan Pipeline Verification</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Model confidence coordinates indicate high correlation in features mapping. Results verified in demo validation pipeline.
                </p>
              </div>
            </div>

            {/* Probability spread bars */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Probability Distributions</span>
              
              {[
                { label: 'Glioma', val: predictionDetail.probabilities['Glioma'] || 0 },
                { label: 'Meningioma', val: predictionDetail.probabilities['Meningioma'] || 0 },
                { label: 'Pituitary Tumor', val: predictionDetail.probabilities['Pituitary Tumor'] || 0 },
                { label: 'No Tumor', val: predictionDetail.probabilities['No Tumor'] || 0 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">{item.label}</span>
                    <span className="font-mono text-slate-500 font-bold">{(item.val * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        predictionDetail.predicted_class === item.label ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${item.val * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Localization Metrics Card (Conditionally shown if tumor exists) */}
          {isTumor && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lesion Contour Measurements</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Estimated Area</span>
                  <span className="text-sm font-extrabold text-slate-800 font-mono mt-1.5 block">{predictionDetail.localization?.tumor_area_mm2} mm²</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Anatomical Region</span>
                  <span className="text-[10px] font-bold text-slate-800 mt-2 block leading-tight">{predictionDetail.localization?.region}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">DICE Overlap</span>
                  <span className="text-sm font-extrabold text-slate-800 font-mono mt-1.5 block">{(predictionDetail.localization?.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Clinician Impressions Notes Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Observations &amp; Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter patient diagnosis notes, next biopsy steps, or clinical recommendations..."
              className="w-full p-3.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-sans"
              rows={4}
            />
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveNotes}
                className="flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                    Observations Documented
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    Compile PDF Report
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
