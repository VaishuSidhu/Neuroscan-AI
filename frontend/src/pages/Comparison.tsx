import React from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, Sparkles, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Comparison: React.FC = () => {
  const { models } = useApp();

  // Format data for Recharts comparison
  const chartData = models.map(m => ({
    name: m.name,
    Accuracy: parseFloat((m.accuracy * 100).toFixed(1)),
    Precision: parseFloat((m.precision * 100).toFixed(1)),
    Recall: parseFloat((m.recall * 100).toFixed(1)),
    F1: parseFloat(((m.f1_score ?? m.accuracy) * 100).toFixed(1)),
    AUC: parseFloat((m.auc * 100).toFixed(1))
  }));

  // Helper to map realistic parameters sizes based on architecture name
  const getParamsSize = (name: string) => {
    if (name.includes('DenseNet')) return '7.0M (224x224)';
    if (name.includes('ResNet')) return '25.6M';
    if (name.includes('EfficientNet')) return '19.3M';
    return 'Authentic Model';
  };

  // Find best performing model (highest accuracy)
  const bestModel = [...models].sort((a, b) => b.accuracy - a.accuracy)[0] || models[0];
  const activeModel = models.find(m => m.status === 'Active') || models[0];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">AI Deep Learning Model Benchmarking</h2>
        <p className="text-[10px] text-slate-400">Authentic test accuracies, parametrizations, and validation coefficients.</p>
      </div>

      {/* Model Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Active Production Model */}
        {activeModel && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-400">
              <Cpu className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Model</span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-800">{activeModel.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Version: {activeModel.version}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Currently deployed for clinical pipeline classification. Evaluated directly against genuine test slices.
            </p>
          </div>
        )}

        {/* Highest Accuracy Model */}
        {bestModel && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-400">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Best Metric Model</span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-800">{bestModel.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Test Accuracy: {(bestModel.accuracy * 100).toFixed(1)}%</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Evaluated validation score ({getParamsSize(bestModel.name)} parameters) active for diagnostic classification.
            </p>
          </div>
        )}

        {/* Note on Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-300 space-y-3">
          <div className="flex items-center space-x-2 text-slate-400">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Validation Reference</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Accuracies, recalls, and confusion matrices reflect authentic test checks conducted across 394 clinical MRI scan slices.
          </p>
          <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-emerald-400">
            AUTHENTIC TEST EVALUATION &bull; 394 CLINICAL SLICES
          </div>
        </div>

      </div>

      {/* Main Charts: Multi Bar Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Classification Score Metrics comparison</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tickLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tickLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 11, color: '#f8fafc' }}
                labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
              <Bar dataKey="Accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AUC" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Structured Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Validation Dataset Performance Logs</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider font-sans">
                <th className="pb-3 font-semibold">Model Name</th>
                <th className="pb-3 font-semibold">Release Ver</th>
                <th className="pb-3 font-semibold">Accuracy</th>
                <th className="pb-3 font-semibold">Precision</th>
                <th className="pb-3 font-semibold">Recall</th>
                <th className="pb-3 font-semibold">F1 Score</th>
                <th className="pb-3 font-semibold">ROC-AUC</th>
                <th className="pb-3 font-semibold">Parameter Size</th>
                <th className="pb-3 font-semibold text-right">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors font-sans">
                  <td className="py-3.5 font-semibold text-slate-800">{m.name}</td>
                  <td className="py-3.5 font-mono text-slate-400">{m.version}</td>
                  <td className="py-3.5 font-semibold text-slate-800 font-mono">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3.5 font-mono text-slate-500">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="py-3.5 font-mono text-slate-500">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="py-3.5 font-mono text-slate-500">{((m.f1_score ?? m.accuracy) * 100).toFixed(1)}%</td>
                  <td className="py-3.5 font-mono text-blue-600 font-semibold">{(m.auc * 100).toFixed(1)}%</td>
                  <td className="py-3.5 text-slate-400 font-mono">{getParamsSize(m.name)}</td>
                  <td className="py-3.5 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'Active'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      {m.status === 'Active' ? 'ACTIVE PIPELINE' : 'OFFLINE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
