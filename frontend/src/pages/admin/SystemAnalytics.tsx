import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { mockSystemStats } from '../../data/mockData';

export const SystemAnalytics: React.FC = () => {
  // Mock API latency data (Aug 24 to Aug 30)
  const apiLatencyData = [
    { date: 'Aug 24', cnn: 310, densenet: 520, resnet: 450 },
    { date: 'Aug 25', cnn: 290, densenet: 550, resnet: 480 },
    { date: 'Aug 26', cnn: 330, densenet: 510, resnet: 440 },
    { date: 'Aug 27', cnn: 300, densenet: 580, resnet: 490 },
    { date: 'Aug 28', cnn: 320, densenet: 530, resnet: 460 },
    { date: 'Aug 29', cnn: 340, densenet: 490, resnet: 430 },
    { date: 'Aug 30', cnn: 315, densenet: 505, resnet: 445 }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">System Operational Diagnostics</h2>
        <p className="text-[10px] text-slate-400">Monitor API processing latency, server memory footprints, and pipeline error thresholds.</p>
      </div>

      {/* Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average API Latency</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">512 ms</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">DenseNet121 convolutional inference</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System CPU Node Core Load</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">24.5%</span>
          <span className="text-[10px] text-emerald-500 font-semibold block">Normal CPU operational margins</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pipeline Network Loss</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">0.02%</span>
          <span className="text-[10px] text-emerald-500 font-semibold block">0 errors logged today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency Curves */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Model Inference Latency (ms)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={apiLatencyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 8, fill: '#94a3b8' } }} tickLine={false} style={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="cnn" name="CNN (Baseline)" stroke="#94a3b8" strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="resnet" name="ResNet50" stroke="#3b82f6" dot={false} />
                <Line type="monotone" dataKey="densenet" name="DenseNet121 (Active)" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scan volumes throughput */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daily Scan Ingestion Rates</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockSystemStats.dailyAnalyses}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tickLine={false} style={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="scans" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
