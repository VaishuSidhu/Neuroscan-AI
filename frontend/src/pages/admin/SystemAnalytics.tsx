import React, { useState, useEffect } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, ShieldAlert, Cpu, Layers, Database, HardDrive, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export const SystemAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminApi.getSystemMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load system metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    // Poll telemetry every 10 seconds for real-time responsiveness
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-24 text-center bg-white border border-slate-200 rounded-xl space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Reading server telemetry and database latency...</p>
      </div>
    );
  }

  const dailyAnalyses = metrics?.daily_analyses || [];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">System Operational Diagnostics</h2>
        <p className="text-[10px] text-slate-400">Live operational telemetry from active server runtime and database engine.</p>
      </div>

      {/* Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Database Latency</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{metrics?.db_latency_ms ?? 0} ms</span>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">Live SQL query execution time</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Server CPU Load</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{metrics?.cpu_percent ?? 0}%</span>
          <span className="text-[10px] text-blue-500 font-semibold block">Active processor utilization</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Process Memory</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{metrics?.process_memory_mb ?? 0} MB</span>
          <span className="text-[10px] text-slate-500 font-semibold block">Backend resident set size (RSS)</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System RAM Load</span>
          <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{metrics?.memory_percent ?? 0}%</span>
          <span className="text-[10px] text-emerald-500 font-semibold block">Host memory pool usage</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Scan volumes throughput */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Authentic Daily Scan Ingestion Rates (Last 7 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyAnalyses}
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
