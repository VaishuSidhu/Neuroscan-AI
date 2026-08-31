import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, UserPlus, Activity, ChevronRight, History, Loader2, ArrowRight } from 'lucide-react';
import { patientApi } from '../api/patientApi';

interface PatientsProps {
  setPath: (path: string) => void;
  setSelectedScanId: (id: number | null) => void;
  setSelectedPredictionId: (id: number | null) => void;
}

export const Patients: React.FC<PatientsProps> = ({
  setPath,
  setSelectedScanId,
  setSelectedPredictionId
}) => {
  const { patients, addPatient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // New patient modal inline
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newNotes, setNewNotes] = useState('');

  // Live patient history states
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const activePatient = patients.find(p => p.patient_id === selectedPatientId) || patients[0];

  // Fetch patient history logs dynamically when patient select changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!activePatient) return;
      setLoadingHistory(true);
      try {
        const hist = await patientApi.getPatientHistory(activePatient.patient_id);
        setHistoryList(hist);
      } catch (err) {
        console.error('Failed to load patient history timeline:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedPatientId, patients]);

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAge) return;
    
    const randomId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await addPatient({
        patient_id: randomId,
        name: newName,
        age: parseInt(newAge),
        gender: newGender,
        notes: newNotes
      });
      setSelectedPatientId(randomId);

      // Reset fields
      setNewName('');
      setNewAge('');
      setNewNotes('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to register patient profile:', err);
    }
  };

  const filteredPatients = patients.filter(
    p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         p.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReviewScan = (scanId: number, predId: number | null) => {
    setSelectedScanId(scanId);
    setSelectedPredictionId(predId);
    setPath('#/results');
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Patient Demographics Directory</h2>
          <p className="text-[10px] text-slate-400">Search profiles and review historical MRI progression timelines.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient Profile
        </button>
      </div>

      {/* Add Patient Modal Form overlay */}
      {showAddForm && (
        <form onSubmit={handleAddPatientSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4 max-w-xl animate-fade-in">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create New Demographic Record</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Clinician Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
            <div className="col-span-1 flex flex-col space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Age (Yrs)</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                placeholder="42"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-sans"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Demographic Notes</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Referred from neurology room..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-sans"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-500/10"
            >
              Save Registry Record
            </button>
          </div>
        </form>
      )}

      {/* Main Content: Split Grid Directory and Profile Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Registry List: Directory Search */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-[600px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name or ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-700 transition-all font-sans"
            />
          </div>

          <div className="flex-grow space-y-2 divide-y divide-slate-100 overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No patient records found.</p>
            ) : (
              filteredPatients.map((p) => {
                const active = selectedPatientId === p.patient_id || (!selectedPatientId && activePatient?.patient_id === p.patient_id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.patient_id)}
                    className={`flex items-center justify-between w-full p-3.5 my-1.5 rounded-xl transition-all text-left border cursor-pointer ${
                      active 
                        ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800">{p.name}</span>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                        <span>{p.patient_id}</span>
                        <span>&bull;</span>
                        <span>{p.age} Yrs / {p.gender}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-blue-500 translate-x-1' : 'text-slate-400'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Patient Profile Detail and Timeline */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
          {activePatient ? (
            <>
              {/* Demographic Summary */}
              <div className="pb-4 border-b border-slate-100 space-y-1.5 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{activePatient.name} Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Patient ID</span>
                    <span className="font-semibold text-slate-700 font-mono mt-0.5 block">{activePatient.patient_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Age / Gender</span>
                    <span className="font-semibold text-slate-700 mt-0.5 block">{activePatient.age} Yrs / {activePatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Registered</span>
                    <span className="font-semibold text-slate-700 font-mono mt-0.5 block">
                      {activePatient.created_at.split('T')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Scans Run</span>
                    <span className="font-semibold text-slate-700 font-mono mt-0.5 block">{historyList.length}</span>
                  </div>
                </div>
                {activePatient.notes && (
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-[10px] text-slate-500 leading-normal mt-3 font-sans">
                    <span className="font-bold text-slate-600">Demographic Notes:</span> {activePatient.notes}
                  </p>
                )}
              </div>

              {/* Scans Timeline Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                  <History className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">MRI Progress Timeline</h4>
                </div>

                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-[10px]">Loading timeline parameters...</span>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 space-y-3 animate-fade-in">
                    <p>No MRI scans logged for this patient profile yet.</p>
                    <button 
                      onClick={() => setPath('#/analysis')}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                    >
                      Process First MRI Scan
                    </button>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-slate-100 space-y-8 animate-fade-in">
                    {historyList.map((scan) => {
                      return (
                        <div key={scan.id} className="relative">
                          {/* Timeline node icon indicator */}
                          <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white border-2 border-white ring-4 ring-blue-50">
                            <Activity className="w-2.5 h-2.5" />
                          </span>

                          {/* Timeline content block */}
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-inner grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            
                            <div className="md:col-span-2 space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-slate-800">{scan.scan_type} Scan</span>
                                <span className="text-[9px] font-mono text-slate-400">({scan.id})</span>
                              </div>
                              <span className="text-[9px] text-slate-400 block font-mono">Date Uploaded: {scan.upload_date}</span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase block">AI Prediction</span>
                              <span className={`text-xs font-bold ${scan.prediction === 'No Tumor' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {scan.prediction}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">Conf: {(scan.confidence * 100).toFixed(1)}%</span>
                            </div>

                            <div className="text-right">
                              <button
                                onClick={() => handleReviewScan(scan.id, scan.prediction_id)}
                                className="px-3 py-1.5 text-[10px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
                              >
                                PACS Review
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center py-12 text-xs text-slate-400">Select a patient directory record to view demographics timelines.</p>
          )}
        </div>

      </div>

    </div>
  );
};
