import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShieldAlert, Cpu, FileCheck2, Activity, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { adminApi } from '../../api/adminApi';
import { mockSystemStats } from '../../data/mockData';

interface AdminDashboardProps {
  setPath: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setPath }) => {
  const { users, patients, models } = useApp();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res);
      } catch (err) {
        console.error('Failed to load administrator dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#10b981'];

  const monthlyVolumeData = [
    { month: 'Mar', analyses: 142 },
    { month: 'Apr', analyses: 195 },
    { month: 'May', analyses: 248 },
    { month: 'Jun', analyses: 312 },
    { month: 'Jul', analyses: 280 },
    { month: 'Aug', analyses: 345 }
  ];

  // Mock distributions matching historical averages
  const tumorDistribution = [
    { name: 'Glioma', value: 45 },
    { name: 'Meningioma', value: 31 },
    { name: 'Pituitary Tumor', value: 18 },
    { name: 'No Tumor', value: 54 }
  ];

  if (loading) {
    return (
      <div className="p-24 text-center bg-white border border-slate-200 rounded-xl space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Retrieving system diagnostics statistics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Admin Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Total Users */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Clinicians</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight font-mono">{stats?.total_users || users.length}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block">{stats?.active_users || users.length} active sessions</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Patients</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight font-mono">{stats?.total_patients || patients.length}</span>
            <span className="text-[10px] text-slate-500 font-semibold block">Registry database</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Total MRI Analyses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">MRI Analyses</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight font-mono">{stats?.total_scans || 12}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block">100% processed</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Reports Generated */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reports Generated</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight font-mono">{stats?.total_reports || 4}</span>
            <span className="text-[10px] text-slate-500 font-semibold block">Clinician signed</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Active Releases */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Classifier</span>
            <span className="text-sm font-extrabold text-blue-600 truncate block mt-2 max-w-[120px]">
              {stats?.active_model || 'DenseNet121 v1.2'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Status: Operational</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tumor Distribution (Pie) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pathology Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tumorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tumorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Ingestion Volume (Bar) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Monthly Analysis Processing Load</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyVolumeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="analyses" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
