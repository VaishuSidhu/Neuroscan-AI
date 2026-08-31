import React from 'react';
import { 
  Brain, 
  ChevronRight, 
  Activity, 
  Search, 
  Eye, 
  FileText, 
  ShieldAlert, 
  BarChart3, 
  History, 
  ArrowRight,
  Fingerprint
} from 'lucide-react';

interface LandingProps {
  setPath: (path: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ setPath }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Landing Nav */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white">
            <Brain className="w-5.5 h-5.5" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">
            NeuroScan <span className="text-blue-600">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setPath('#/login')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setPath('#/register')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            Register Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 w-fit">
            <Activity className="w-3.5 h-3.5" />
            <span>Deep Learning Clinical Support</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Explainable AI for <br/>
            <span className="text-blue-600">Brain Tumor Detection</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-lg">
            AI-assisted brain MRI analysis with tumor classification, localization, confidence scoring, and explainable predictions. Built for researchers and clinical decision support.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <button
              onClick={() => setPath('#/login')}
              className="flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              Analyze MRI
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => {
                const featuresEl = document.getElementById('features');
                if (featuresEl) featuresEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm cursor-pointer text-center"
            >
              Explore Features
            </button>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-500 text-[11px] leading-normal max-w-xl">
            <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-600">Research & Clinical Decision Support Demonstration Only</span>
              <p className="mt-0.5">
                This system is designed for research and clinical decision-support demonstration purposes and is not a substitute for professional medical diagnosis.
              </p>
            </div>
          </div>
        </div>

        {/* Sophisticated Medical-AI Visual representation */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[440px] aspect-square rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex items-center justify-center overflow-hidden">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            {/* Visualizer Simulation */}
            <div className="relative w-72 h-72 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center">
              {/* Brain Grayscale Drawing */}
              <div className="absolute inset-4 rounded-full border border-dashed border-slate-800 opacity-60"></div>
              <Brain className="w-40 h-40 text-slate-800 stroke-[1.2]" />

              {/* Suspected Tumor bounding box overlay */}
              <div className="absolute top-[28%] right-[24%] w-24 h-24 rounded-full border-2 border-red-500 border-dashed bg-red-500/10 flex items-center justify-center pulse-ring-active">
                {/* Simulated Heatmap */}
                <div className="w-14 h-14 rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.7)_0%,rgba(249,115,22,0.5)_40%,rgba(59,130,246,0)_100%)]"></div>
              </div>

              {/* Data Overlays */}
              <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-emerald-400">
                <div>WL: 500 / WW: 1200</div>
                <div>XAI: GRAD-CAM</div>
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-emerald-400 text-right">
                <div>CLASS: GLIOMA</div>
                <div>CONF: 94.2%</div>
              </div>
            </div>

            {/* Float Badge */}
            <div className="absolute top-10 right-10 bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm border border-blue-500/30 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>AI Classifier Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section id="features" className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Clinical Grade System Modules
            </h2>
            <p className="text-xs text-slate-500 mt-2.5">
              Designed to optimize neural-radiology interpretation speed and decision confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature card list */}
            {[
              { title: 'MRI Upload & Review', icon: Brain, desc: 'Supports standard DICOM uploads and generic image formats with drag-and-drop PACS preview interface.' },
              { title: 'Pathology Classifier', icon: Activity, desc: 'Scans scans to classify primary brain tumors: Glioma, Meningioma, Pituitary Tumor, or Normal Brain.' },
              { title: 'Explainable AI (Grad-CAM)', icon: Eye, desc: 'Generates gradient weighted activation map overlays showing exactly which voxel configurations drove predictions.' },
              { title: 'Lesion Segmentation', icon: Search, desc: 'Traces suspect structural borders using segmentation overlays and estimates tissue area parameters in mm².' },
              { title: 'Structured Reports', icon: FileText, desc: 'Generates detailed, clinically formatted diagnosis summaries ready for local archiving or printing.' },
              { title: 'Patient File Timelines', icon: History, desc: 'Archives scans in comprehensive patient timelines, enabling visual comparisons of lesion progression.' },
              { title: 'Model Comparison Hub', icon: Fingerprint, desc: 'Compares test metrics across CNN, ResNet50, DenseNet121, and EfficientNet architectures.' },
              { title: 'Model Analytics Metrics', icon: BarChart3, desc: 'Displays clinical validation statistics including ROC curves, Precision-Recall, and confusion matrices.' },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="flex flex-col p-6 rounded-xl border border-slate-200/70 hover:border-blue-500/30 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-slate-200 tracking-tight">
              NeuroScan <span className="text-blue-500 font-bold">AI</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#/login" className="hover:text-slate-200 transition-colors">Client Portal</a>
            <a href="#/register" className="hover:text-slate-200 transition-colors">Create Account</a>
          </div>
          <div className="text-slate-500 text-[10px]">
            &copy; 2026 NeuroScan AI. Clinical Decision Support System.
          </div>
        </div>
      </footer>
    </div>
  );
};
