import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Brain, 
  FileCheck2, 
  Percent, 
  ArrowUpRight, 
  ShieldAlert, 
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analysisApi } from '../api/analysisApi';
import { adminApi } from '../api/adminApi';

interface DashboardProps {
  setPath: (path: string) => void;
  setSelectedScanId: (id: number | null) => void;
  setSelectedPredictionId: (id: number | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setPath,
  setSelectedScanId,
  setSelectedPredictionId
}) => {
  const { currentUser, models } = useApp();
  const [historyRows, setHistoryRows] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    totalTumors: 0,
    totalReports: 0,
    avgConfidence: 0.0
  });
  const [dailyAnalyses, setDailyAnalyses] = useState<{ date: string; scans: number }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [hist, backendStats] = await Promise.all([
          analysisApi.getHistory(),
          analysisApi.getStats()
        ]);
        setHistoryRows(hist);
        
        if (backendStats) {
          setStats({
            totalScans: backendStats.total_scans,
            totalTumors: backendStats.total_tumors,
            totalReports: backendStats.total_reports,
            avgConfidence: backendStats.avg_confidence
          });
          if (backendStats.daily_analyses) {
            setDailyAnalyses(backendStats.daily_analyses);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard logs:', err);
      }
    };
    fetchDashboardData();
  }, []);

  const handleViewDetails = (scanId: number, predId: number | null) => {
    setSelectedScanId(scanId);
    setSelectedPredictionId(predId);
    setPath('#/results');
  };

  const positiveRate = stats.totalScans > 0 
    ? `${((stats.totalTumors / stats.totalScans) * 100).toFixed(1)}%`
    : '0%';

  return (
    <div className="p-6 space-y-6">
      
      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Scans Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total MRI Scans</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{stats.totalScans.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center">
              Active Registry <span className="text-slate-400 font-normal ml-1">in database</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Brain className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Tumors Detected Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tumors Localized</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{stats.totalTumors}</span>
            <span className="text-[10px] text-red-500 font-semibold flex items-center">
              {positiveRate} <span className="text-slate-400 font-normal ml-1">positive detection rate</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Activity className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Average Confidence Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avg Confidence</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{stats.avgConfidence}%</span>
            <span className="text-[10px] text-blue-500 font-semibold flex items-center">
              {models.find(m => m.status === 'Active')?.name || 'DenseNet121'} <span className="text-slate-400 font-normal ml-1">active</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Percent className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Reports Generated Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reports Generated</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{stats.totalReports}</span>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center">
              100% <span className="text-slate-400 font-normal ml-1">clinician-reviewed</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* Main Charts & Notifications section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Analysis Throughput Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI Scan Processing Throughput</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Scans completed over the last 7 calendar days</p>
            </div>
            <span className="text-[10px] font-medium text-slate-500 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Past 7 Days
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyAnalyses}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 11, color: '#f8fafc' }}
                  labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Safety Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-white tracking-tight">Clinical Decision Notice</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              This system provides AI-assisted analysis for research and decision-support purposes. AI predictions should not be interpreted as a standalone medical diagnosis and should be reviewed by a qualified healthcare professional.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[10px] text-amber-500 font-mono flex items-start space-x-2">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>
                All classifications, tumor localization areas, and Grad-CAM voxel maps must be confirmed by an authorized neurologist.
              </span>
            </div>
          </div>
          <button 
            onClick={() => setPath('#/analysis')}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-md shadow-blue-600/10"
          >
            Start New MRI Scan
            <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>

      </div>

      {/* Recent Scan Analysis Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Diagnostic Pipeline Runs</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time status of scans in the AI ingestion queue</p>
          </div>
          <button 
            onClick={() => setPath('#/history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center"
          >
            View historical log
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Patient Name</th>
                <th className="pb-3 font-semibold">Patient ID</th>
                <th className="pb-3 font-semibold">Date of Scan</th>
                <th className="pb-3 font-semibold">AI Prediction Outcome</th>
                <th className="pb-3 font-semibold">Classifier Confidence</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyRows.slice(0, 5).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 font-semibold text-slate-800">{row.patient_name}</td>
                  <td className="py-3.5 font-mono text-slate-400">{row.patient_id}</td>
                  <td className="py-3.5 font-mono text-slate-500">{row.date}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      row.prediction === 'No Tumor'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {row.prediction}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800 font-mono">{row.confidence}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      row.status === 'Completed' ? 'text-emerald-600 bg-emerald-50/50' : 'text-amber-600 bg-amber-50/50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`}></span>
                      <span>{row.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleViewDetails(row.scan_id, row.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold border border-slate-200 rounded hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                      Open PACS Review
                    </button>
                  </td>
                </tr>
              ))}
              {historyRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">No active analyses. Click "Start New MRI Scan" above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
