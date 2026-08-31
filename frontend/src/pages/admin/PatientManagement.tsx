import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Database, ChevronRight } from 'lucide-react';
import { analysisApi } from '../../api/analysisApi';

interface PatientManagementProps {
  setPath: (path: string) => void;
  setSelectedScanId: (id: number | null) => void;
  setSelectedPredictionId: (id: number | null) => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  setPath,
  setSelectedScanId,
  setSelectedPredictionId
}) => {
  const { patients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyRows, setHistoryRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const hist = await analysisApi.getHistory();
        setHistoryRows(hist);
      } catch (err) {
        console.error('Failed to load history for patient management:', err);
      }
    };
    fetchHistory();
  }, []);

  const patientRows = patients.map(p => {
    const pScans = historyRows.filter(s => s.patient_id === p.patient_id);
    return {
      ...p,
      scansCount: pScans.length,
      latestScanDate: pScans[0]?.date || 'No Scans Ingested'
    };
  });

  const filteredPatients = patientRows.filter(
    p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         p.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenTimeline = (patientId: string) => {
    // Redirect to patients registry panel
    setPath('#/patients');
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Active Patient Demographic Database</h2>
        <p className="text-[10px] text-slate-400">Review clinical record densities, ingest ratios, and archive constraints.</p>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs max-w-md">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search database by patient name or ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2 text-slate-700">
            <Database className="w-4.5 h-4.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Patient Table Index</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Total Database Size: {patients.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Patient ID</th>
                <th className="pb-3 font-semibold">Full Registry Name</th>
                <th className="pb-3 font-semibold">Age / Gender</th>
                <th className="pb-3 font-semibold text-center">MRI Scans Logged</th>
                <th className="pb-3 font-semibold">Latest Active Ingestion</th>
                <th className="pb-3 font-semibold text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 font-mono text-slate-800 font-bold">{row.patient_id}</td>
                  <td className="py-3.5 font-semibold text-slate-800">{row.name}</td>
                  <td className="py-3.5 text-slate-500">{row.age} Yrs / {row.gender}</td>
                  <td className="py-3.5 text-center font-mono font-semibold text-blue-600">{row.scansCount}</td>
                  <td className="py-3.5 font-mono text-slate-500">{row.latestScanDate}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleOpenTimeline(row.patient_id)}
                      className="px-2.5 py-1.5 text-[10px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm cursor-pointer"
                    >
                      Open History Profile
                    </button>
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
