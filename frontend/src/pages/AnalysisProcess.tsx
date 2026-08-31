import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Loader2, CheckCircle2, Circle, Brain } from 'lucide-react';

interface AnalysisProcessProps {
  selectedScanId: number | null;
  setSelectedPredictionId: (id: number | null) => void;
  setPath: (path: string) => void;
}

export const AnalysisProcess: React.FC<AnalysisProcessProps> = ({
  selectedScanId,
  setSelectedPredictionId,
  setPath
}) => {
  const { isAnalyzing, analysisProgress, analysisStep, activePredictionId } = useApp();

  // Reactive Observer: Redirection is handled automatically when pipeline completes
  useEffect(() => {
    if (!isAnalyzing && activePredictionId) {
      setSelectedPredictionId(activePredictionId);
      setPath('#/results');
    }
  }, [isAnalyzing, activePredictionId]);

  // Safety check: if no scan is running and activePredictionId is missing, redirect back
  useEffect(() => {
    if (!isAnalyzing && !activePredictionId && !selectedScanId) {
      setPath('#/analysis');
    }
  }, [isAnalyzing, activePredictionId, selectedScanId]);

  const pipelineSteps = [
    { title: 'MRI Preprocessing', desc: 'Rescaling voxel spacing, noise filtering, and skull-stripping alignment.' },
    { title: 'Convolutional Feature Extraction', desc: 'Running DenseNet block convolutions to capture structural vectors.' },
    { title: 'Structural Tumor Detection', desc: 'Confirming anomalies vs normal brain anatomy bounds.' },
    { title: 'Multi-Class Tumor Classification', desc: 'Predicting class mapping: Glioma, Meningioma, Pituitary, or Normal.' },
    { title: 'Voxel-Level Segmentation', desc: 'Fusing UNet-style lateral connections to trace tumor boundaries.' },
    { title: 'Grad-CAM Gradient Backpropagation', desc: 'Computing gradient activations mapping region weights.' },
    { title: 'Diagnostic Report Compilation', desc: 'Synthesizing metrics and notes into printable Clinical report format.' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-8">
        
        {/* Large Spinner and Logo */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
          <Brain className="w-10 h-10 text-blue-600 animate-pulse" />
        </div>

        {/* Diagnostic Heading */}
        <div className="text-center space-y-1.5 w-full">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">AI Diagnostics Pipeline Active</h2>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest pt-1 px-4">
            <span>Progress Status</span>
            <span className="font-mono text-blue-600">{analysisProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden px-4">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }}></div>
          </div>
        </div>

        {/* Pipeline Steps Tracker */}
        <div className="w-full space-y-4 pt-2">
          {pipelineSteps.map((step, idx) => {
            const active = idx === analysisStep;
            const completed = idx < analysisStep;

            return (
              <div 
                key={idx} 
                className={`flex items-start space-x-3.5 p-3 rounded-xl border transition-all ${
                  active 
                    ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                    : completed
                    ? 'bg-slate-50/50 border-slate-100'
                    : 'bg-white border-transparent opacity-50'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : active ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold block ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                    Step {idx + 1}: {step.title}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
