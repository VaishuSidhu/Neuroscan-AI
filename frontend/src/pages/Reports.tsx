import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DiagnosticReport } from '../components/DiagnosticReport';
import { FileText, Search, ChevronRight, Layers, Download, Loader2 } from 'lucide-react';
import { analysisApi } from '../api/analysisApi';
import { reportApi } from '../api/reportApi';

interface ReportsProps {
  selectedPredictionId: number | null;
  setSelectedPredictionId: (id: number | null) => void;
  setSelectedScanId: (id: number | null) => void;
  setPath: (path: string) => void;
}

export const Reports: React.FC<ReportsProps> = ({
  selectedPredictionId,
  setSelectedPredictionId,
  setSelectedScanId,
  setPath
}) => {
  const { updatePredictionNotes } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [historyRows, setHistoryRows] = useState<any[]>([]);
  const [activePredDetails, setActivePredDetails] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Load history list from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const hist = await analysisApi.getHistory();
        setHistoryRows(hist);
        
        // If a prediction ID is already active, set it. Otherwise choose the first one
        if (hist.length > 0 && !selectedPredictionId) {
          setSelectedPredictionId(hist[0].id);
          setSelectedScanId(hist[0].scan_id);
        }
      } catch (err) {
        console.error('Failed to fetch analysis history:', err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchHistory();
  }, []);

  // Fetch prediction details and backend compiled PDF URL when selection changes
  useEffect(() => {
    const fetchActiveDetails = async () => {
      if (!selectedPredictionId) return;
      setLoadingDetail(true);
      setPdfUrl(null);
      try {
        const details = await analysisApi.getPredictionDetail(selectedPredictionId);
        setActivePredDetails(details);
        
        // Trigger report generation to compile backend PDF
        const r_res = await reportApi.createReport(selectedPredictionId);
        setPdfUrl(r_res.report_path);
      } catch (err) {
        console.error('Failed to load active report details:', err);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchActiveDetails();
  }, [selectedPredictionId]);

  const filteredReports = historyRows.filter(
    r => r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.id.toString().includes(searchTerm.toLowerCase())
  );

  const handleSelectReport = (predId: number, scanId: number) => {
    setSelectedPredictionId(predId);
    setSelectedScanId(scanId);
  };

  const getAbsolutePdfUrl = () => {
    if (!pdfUrl) return '#';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000';
    return `${baseUrl}${pdfUrl}`;
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="no-print flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Structured Diagnostic Report Archive</h2>
        <p className="text-[10px] text-slate-400">Generate, review, and download ReportLab PDF decision sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List of Reports */}
        <div className="no-print lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-[600px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports by patient or ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-700 transition-all"
            />
          </div>

          <div className="flex-grow space-y-2 divide-y divide-slate-100 overflow-y-auto pr-1">
            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-[10px]">Syncing archive...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No diagnostic reports logged.</p>
            ) : (
              filteredReports.map((r) => {
                const active = r.id === selectedPredictionId;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReport(r.id, r.scan_id)}
                    className={`flex items-center justify-between w-full p-3.5 my-1.5 rounded-xl transition-all text-left border ${
                      active
                        ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800">{r.patient_name}</span>
                        <span className="text-[9px] font-mono text-slate-400 font-medium">REP-{r.id}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-blue-600">{r.prediction}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-400">{r.date.split(' ')[0]}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-blue-500 translate-x-1' : 'text-slate-400'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Report Preview and Print Sheet Container */}
        <div className="lg:col-span-8">
          {loadingDetail ? (
            <div className="bg-white border border-slate-200 rounded-xl p-24 text-center text-slate-400 space-y-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs">Compiling patient metrics and generating official ReportLab PDF file...</p>
            </div>
          ) : activePredDetails ? (
            <div className="print:p-0 space-y-4">
              {/* PDF Download Trigger Header */}
              {pdfUrl && (
                <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3 text-slate-300">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">Official ReportLab PDF generated</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">A4 print template is fully assembled on the server</p>
                    </div>
                  </div>
                  <a
                    href={getAbsolutePdfUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Official PDF
                  </a>
                </div>
              )}

              {/* Inline HTML Diagnostic Report component preview */}
              <DiagnosticReport 
                patient={activePredDetails.patient}
                scan={activePredDetails.scan}
                prediction={activePredDetails}
                onSaveNotes={(n) => updatePredictionNotes(activePredDetails.id, n)}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
              <p className="text-xs">Select a patient report record on the left to preview diagnostic details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
