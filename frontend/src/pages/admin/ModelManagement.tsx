import React from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, AlertTriangle, Sparkles } from 'lucide-react';

export const ModelManagement: React.FC = () => {
  const { models, updateModelStatus } = useApp();

  const handleToggle = async (id: number, currentStatus: string) => {
    const nextStatus: 'Active' | 'Inactive' = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateModelStatus(id, nextStatus);
    } catch (err) {
      console.error('Failed to toggle model deployment:', err);
    }
  };

  // Helper to map realistic parameters sizes based on architecture name
  const getParamsSize = (name: string) => {
    if (name.includes('CNN')) return '1.4 Million';
    if (name.includes('ResNet')) return '25.6 Million';
    if (name.includes('DenseNet')) return '8.1 Million';
    if (name.includes('EfficientNet')) return '19.3 Million';
    return '12.2 Million';
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">System AI Neural Network Model Deployment</h2>
        <p className="text-[10px] text-slate-400">Release new model parameter weights and select active classifier nodes.</p>
      </div>

      {/* Safety Notice */}
      <div className="flex items-start space-x-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-white uppercase block tracking-wider">Production Model Deployment Notice</span>
          <p className="text-slate-400 leading-relaxed">
            Changing the active deployment updates the classification nodes globally. Scans currently queued in the preprocessing pipeline will automatically execute inference against the newly set model.
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((m) => {
          const isActive = m.status === 'Active';
          return (
            <div 
              key={m.id} 
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                isActive ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Cpu className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-800">{m.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {isActive ? 'ACTIVE RELEASE' : 'STANDBY'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs bg-slate-50 border border-slate-100/50 rounded-xl p-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Accuracy</span>
                    <span className="font-mono font-semibold text-slate-800 mt-1 block">{(m.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">F1 Score</span>
                    <span className="font-mono font-semibold text-slate-800 mt-1 block">{(m.f1_score * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">ROC-AUC</span>
                    <span className="font-mono font-semibold text-slate-800 mt-1 block">{(m.auc * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <table className="w-full text-xs text-slate-500 border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100/50">
                      <td className="py-1.5 font-medium">Release Version</td>
                      <td className="py-1.5 text-right font-mono font-semibold text-slate-700">{m.version}</td>
                    </tr>
                    <tr className="border-b border-slate-100/50">
                      <td className="py-1.5 font-medium">Model Parameters Size</td>
                      <td className="py-1.5 text-right font-mono text-slate-700">{getParamsSize(m.name)}</td>
                    </tr>
                    <tr className="border-b border-slate-100/50">
                      <td className="py-1.5 font-medium">Dataset Origin</td>
                      <td className="py-1.5 text-right text-slate-700 font-semibold">BraTS 2021 + Private Cohort</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Status</td>
                      <td className="py-1.5 text-right font-mono font-semibold text-blue-600">{m.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 flex items-center font-sans">
                  {isActive && (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1 animate-pulse" />
                      In production pipeline
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle(m.id, m.status)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-500 shadow-sm'
                  }`}
                >
                  {isActive ? 'Deactivate Release' : 'Set Active Production'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
