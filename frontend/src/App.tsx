import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Clinician pages
import { Dashboard } from './pages/Dashboard';
import { AnalysisUpload } from './pages/AnalysisUpload';
import { AnalysisProcess } from './pages/AnalysisProcess';
import { Results } from './pages/Results';
import { Patients } from './pages/Patients';
import { Reports } from './pages/Reports';
import { Comparison } from './pages/Comparison';
import { Performance } from './pages/Performance';
import { Settings } from './pages/Settings';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { PatientManagement } from './pages/admin/PatientManagement';
import { ModelManagement } from './pages/admin/ModelManagement';
import { SystemAnalytics } from './pages/admin/SystemAnalytics';

function App() {
  const { currentUser } = useApp();
  const [path, setPathState] = useState(window.location.hash || '#/landing');
  
  // Selected entities for the active viewports
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [selectedPredictionId, setSelectedPredictionId] = useState<number | null>(null);

  // Set hash wrapper
  const setPath = (newPath: string) => {
    window.location.hash = newPath;
    setPathState(newPath);
  };

  // Hash listener
  useEffect(() => {
    const handleHashChange = () => {
      setPathState(window.location.hash || '#/landing');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route Guard: redirect unauthenticated users trying to access secure routes
  const publicRoutes = ['#/landing', '#/login', '#/register'];
  const isPublic = publicRoutes.includes(path) || path === '';

  useEffect(() => {
    if (!currentUser && !isPublic) {
      setPath('#/login');
    } else if (currentUser && currentUser.role !== 'Admin' && path.startsWith('#/admin')) {
      setPath('#/dashboard');
    }
  }, [currentUser, path, isPublic]);

  // Clean path format for routing
  const route = path.split('?')[0];

  const renderContent = () => {
    switch (route) {
      case '#/landing':
      case '':
        return <Landing setPath={setPath} />;
      case '#/login':
        return <Login setPath={setPath} />;
      case '#/register':
        return <Register setPath={setPath} />;
      
      // Doctor views
      case '#/dashboard':
        return (
          <Dashboard 
            setPath={setPath} 
            setSelectedScanId={setSelectedScanId}
            setSelectedPredictionId={setSelectedPredictionId}
          />
        );
      case '#/analysis':
        return <AnalysisUpload setPath={setPath} setSelectedScanId={setSelectedScanId} />;
      case '#/analysis/process':
        return (
          <AnalysisProcess 
            selectedScanId={selectedScanId} 
            setSelectedPredictionId={setSelectedPredictionId} 
            setPath={setPath} 
          />
        );
      case '#/results':
        return (
          <Results 
            selectedScanId={selectedScanId}
            selectedPredictionId={selectedPredictionId}
            setPath={setPath}
          />
        );
      case '#/patients':
      case '#/history':
        return (
          <Patients 
            setPath={setPath}
            setSelectedScanId={setSelectedScanId}
            setSelectedPredictionId={setSelectedPredictionId}
          />
        );
      case '#/reports':
        return (
          <Reports 
            selectedPredictionId={selectedPredictionId}
            setSelectedPredictionId={setSelectedPredictionId}
            setSelectedScanId={setSelectedScanId}
            setPath={setPath}
          />
        );
      case '#/comparison':
        return <Comparison />;
      case '#/performance':
        return <Performance />;
      case '#/settings':
        return <Settings />;

      // Admin views (guarded for role admin)
      case '#/admin':
        return currentUser?.role === 'Admin' ? <AdminDashboard setPath={setPath} /> : <Dashboard setPath={setPath} setSelectedScanId={setSelectedScanId} setSelectedPredictionId={setSelectedPredictionId} />;
      case '#/admin/users':
        return currentUser?.role === 'Admin' ? <UserManagement /> : <Dashboard setPath={setPath} setSelectedScanId={setSelectedScanId} setSelectedPredictionId={setSelectedPredictionId} />;
      case '#/admin/patients':
        return currentUser?.role === 'Admin' ? (
          <PatientManagement 
            setPath={setPath}
            setSelectedScanId={setSelectedScanId}
            setSelectedPredictionId={setSelectedPredictionId}
          />
        ) : (
          <Dashboard setPath={setPath} setSelectedScanId={setSelectedScanId} setSelectedPredictionId={setSelectedPredictionId} />
        );
      case '#/admin/models':
        return currentUser?.role === 'Admin' ? <ModelManagement /> : <Dashboard setPath={setPath} setSelectedScanId={setSelectedScanId} setSelectedPredictionId={setSelectedPredictionId} />;
      case '#/admin/analytics':
        return currentUser?.role === 'Admin' ? <SystemAnalytics /> : <Dashboard setPath={setPath} setSelectedScanId={setSelectedScanId} setSelectedPredictionId={setSelectedPredictionId} />;

      default:
        return <Landing setPath={setPath} />;
    }
  };

  // If path is a public view, render full screen (no sidebar/header)
  if (isPublic) {
    return <div className="min-h-screen bg-slate-50">{renderContent()}</div>;
  }

  // Secure viewport wrapper layout
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50">
      
      {/* Sidebar Nav */}
      <Sidebar currentPath={path} setPath={setPath} />

      {/* Main viewport area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        <Header currentPath={path} setPath={setPath} />
        <main className="flex-grow">
          {renderContent()}
        </main>
      </div>

    </div>
  );
}

export default App;
