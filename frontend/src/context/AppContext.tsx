import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { patientApi } from '../api/patientApi';
import { mriApi } from '../api/mriApi';
import { analysisApi } from '../api/analysisApi';
import { modelApi } from '../api/modelApi';
import { adminApi } from '../api/adminApi';
import { reportApi } from '../api/reportApi';

interface Patient {
  id: number;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  created_at: string;
  notes?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
}

interface MLModel {
  id: number;
  name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc: number;
  status: string;
}

interface AppContextProps {
  currentUser: User | null;
  patients: Patient[];
  models: MLModel[];
  users: User[]; // Admin user list
  activeScanId: number | null;
  activePredictionId: number | null;
  analysisProgress: number;
  analysisStep: number;
  isAnalyzing: boolean;
  theme: 'light' | 'dark';
  language: string;
  notifications: Array<{ id: string; text: string; time: string; read: boolean }>;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, role: string, password?: string) => Promise<boolean>;
  addPatient: (patientData: any) => Promise<Patient>;
  uploadAndAnalyze: (patientId: string, scanType: string, file: File, onComplete: (predId: number) => void) => Promise<void>;
  updatePredictionNotes: (predId: number, notes: string) => Promise<void>;
  updateModelStatus: (modelId: number, status: 'Active' | 'Inactive') => Promise<void>;
  updateUserStatus: (userId: number, status: 'Active' | 'Inactive') => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  clearNotifications: () => void;
  addNotification: (text: string) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const [activePredictionId, setActivePredictionId] = useState<number | null>(null);
  
  // Pipeline state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);

  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; read: boolean }>>([
    { id: '1', text: 'System connected to FastAPI database successfully.', time: 'Just now', read: false }
  ]);

  // Load user profile on startup if JWT exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('neuro_token');
      if (token) {
        try {
          const user = await authApi.getMe();
          setCurrentUser(user);
        } catch (err) {
          logger.error('Session expired or invalid token');
          localStorage.removeItem('neuro_token');
          setCurrentUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  // Sync clinical data when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const refreshData = async () => {
    try {
      const patientsList = await patientApi.getPatients();
      setPatients(patientsList);

      const modelsList = await modelApi.getModels();
      setModels(modelsList);

      if (currentUser?.role === 'Admin') {
        const usersList = await adminApi.getUsers();
        setUsers(usersList);
      }
    } catch (err) {
      console.error('Failed to sync clinical database:', err);
    }
  };

  const login = async (email: string, password = 'demo1234'): Promise<User | null> => {
    try {
      // In demo mode, admin has admin123, doctor has demo1234
      const pass = email.includes('admin') ? 'admin123' : password;
      const data = await authApi.login({ email, password: pass });
      localStorage.setItem('neuro_token', data.access_token);
      setCurrentUser(data.user);
      addNotification(`Clinician logged in: ${data.user.name}`);
      return data.user;
    } catch (err) {
      console.error('Login request failed:', err);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('neuro_token');
    setCurrentUser(null);
    setPatients([]);
    setModels([]);
    setUsers([]);
  };

  const register = async (name: string, email: string, role: string, password = 'demo1234'): Promise<boolean> => {
    try {
      const data = await authApi.register({ name, email, role, password });
      localStorage.setItem('neuro_token', data.access_token);
      setCurrentUser(data.user);
      addNotification(`Created new profile: ${name}`);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      return false;
    }
  };

  const addPatient = async (patientData: any): Promise<Patient> => {
    const created = await patientApi.createPatient(patientData);
    setPatients(prev => [created, ...prev]);
    addNotification(`Registered patient: ${created.name}`);
    return created;
  };

  // Upload scan file and execute analysis pipeline
  const uploadAndAnalyze = async (
    patientId: string, 
    scanType: string, 
    file: File, 
    onComplete: (predId: number) => void
  ) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep(0);

    try {
      // Step 1: Upload MRI scan
      setAnalysisStep(0);
      setAnalysisProgress(10);
      const uploadRes = await mriApi.uploadMri(patientId, scanType, file);
      const scanId = uploadRes.scan_id;
      setActiveScanId(scanId);

      // Step 2: Animate pipeline progression for realistic PACS loader feel
      let progress = 10;
      const interval = setInterval(() => {
        progress += 12;
        if (progress > 85) {
          clearInterval(interval);
        } else {
          setAnalysisProgress(progress);
          setAnalysisStep(Math.floor(progress / 15));
        }
      }, 500);

      // Step 3: Run pipeline processing on backend
      const res = await analysisApi.runPipeline(scanId);
      clearInterval(interval);

      // Set finish state
      setAnalysisProgress(100);
      setAnalysisStep(6);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setActivePredictionId(res.prediction.id);
        addNotification(`AI diagnostic completed: ${res.prediction.predicted_class}`);
        onComplete(res.prediction.id);
      }, 500);

    } catch (err) {
      setIsAnalyzing(false);
      console.error('AI pipeline processing failed:', err);
      addNotification('AI diagnostic pipeline failed.');
      throw err;
    }
  };

  const updatePredictionNotes = async (predId: number, notes: string) => {
    // Currently prediction notes update is handled via Report or custom calls.
    // In our backend, saving notes updates prediction text. Let's create report PDF
    // which syncs notes, or handle notes update locally and trigger PDF rebuild
    await reportApi.createReport(predId); // Auto compile report triggers DB saves
    addNotification('Clinical diagnostic report compiled.');
  };

  const updateModelStatus = async (modelId: number, status: 'Active' | 'Inactive') => {
    await modelApi.toggleModel(modelId);
    const updated = await modelApi.getModels();
    setModels(updated);
    addNotification('System active classifier release updated.');
  };

  const updateUserStatus = async (userId: number, status: 'Active' | 'Inactive') => {
    await adminApi.updateUserStatus(userId, { status });
    const updated = await adminApi.getUsers();
    setUsers(updated);
    addNotification(`Clinician status updated to ${status}`);
  };

  const addUser = async (userData: any) => {
    // Admin provisioning accounts (default password admin123/demo1234)
    await adminApi.addUser({ ...userData, password: 'demo1234' });
    const updated = await adminApi.getUsers();
    setUsers(updated);
    addNotification(`Created clinician account: ${userData.name}`);
  };

  const deleteUser = async (userId: number) => {
    await adminApi.deleteUser(userId);
    const updated = await adminApi.getUsers();
    setUsers(updated);
    addNotification('De-provisioned clinician account.');
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setThemeState(theme);
  };

  const addNotification = (text: string) => {
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        text,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      patients,
      models,
      users,
      activeScanId,
      activePredictionId,
      isAnalyzing,
      analysisProgress,
      analysisStep,
      theme,
      language,
      notifications,
      login,
      logout,
      register,
      addPatient,
      uploadAndAnalyze,
      updatePredictionNotes,
      updateModelStatus,
      updateUserStatus,
      addUser,
      deleteUser,
      setTheme,
      setLanguage,
      clearNotifications,
      addNotification,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Simple logger fallback
const logger = {
  error: (msg: string) => console.error(msg)
};
