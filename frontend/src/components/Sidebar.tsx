import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Brain, 
  Users, 
  History, 
  FileText, 
  GitCompare, 
  BarChart3, 
  Settings, 
  UserSquare2, 
  FolderLock, 
  Cpu, 
  LineChart,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  setPath: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, setPath }) => {
  const { currentUser } = useApp();

  const doctorLinks = [
    { name: 'Dashboard', path: '#/dashboard', icon: Activity },
    { name: 'MRI Analysis', path: '#/analysis', icon: Brain },
    { name: 'Patients', path: '#/patients', icon: Users },
    { name: 'Analysis History', path: '#/history', icon: History },
    { name: 'Diagnostic Reports', path: '#/reports', icon: FileText },
    { name: 'Model Comparison', path: '#/comparison', icon: GitCompare },
    { name: 'Model Performance', path: '#/performance', icon: BarChart3 },
    { name: 'Settings', path: '#/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '#/admin', icon: FolderLock },
    { name: 'User Management', path: '#/admin/users', icon: UserSquare2 },
    { name: 'Patient Directory', path: '#/admin/patients', icon: Users },
    { name: 'Model Releases', path: '#/admin/models', icon: Cpu },
    { name: 'System Analytics', path: '#/admin/analytics', icon: LineChart },
    { name: 'Settings', path: '#/settings', icon: Settings },
  ];

  const isLinkActive = (path: string) => {
    if (path === '#/dashboard' && (currentPath === '' || currentPath === '#/')) return true;
    return currentPath === path;
  };

  const renderLink = (link: typeof doctorLinks[0]) => {
    const Icon = link.icon;
    const active = isLinkActive(link.path);
    return (
      <button
        key={link.path}
        onClick={() => setPath(link.path)}
        className={`flex items-center w-full px-4 py-2.5 my-0.5 text-xs font-medium rounded-lg transition-all text-left ${
          active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Icon className={`w-4 h-4 mr-3 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{link.name}</span>
      </button>
    );
  };

  return (
    <aside className="no-print hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200/80 shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 h-16 px-6 border-b border-slate-200/80">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <Brain className="w-5 h-5" />
        </div>
        <span className="font-semibold text-[15px] text-slate-800 tracking-tight">
          NeuroScan <span className="text-blue-600 font-bold">AI</span>
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-grow overflow-y-auto px-4 py-4 scrollbar-thin">
        {currentUser?.role === 'Admin' ? (
          /* System Administration Section - Exclusively shown for Admins */
          <div className="mb-6">
            <div className="flex items-center px-4 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Administrator
              </p>
            </div>
            <nav className="space-y-0.5">
              {adminLinks.map(renderLink)}
            </nav>
          </div>
        ) : (
          /* Clinician Section - Exclusively shown for Doctors/Researchers */
          <div className="mb-6">
            <p className="px-4 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Diagnostic Modules
            </p>
            <nav className="space-y-0.5">
              {doctorLinks.map(renderLink)}
            </nav>
          </div>
        )}
      </div>

      {/* Sidebar Footer Safety Disclaimer */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50">
        <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-yellow-800 text-[10px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Decision Support Tool</span>
            <p className="text-yellow-700/90 mt-0.5">
              For research demonstration only. Not for standalone clinical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
