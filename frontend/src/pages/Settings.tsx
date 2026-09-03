import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Bell, Shield, Globe, Check, AlertCircle, Loader2, KeyRound, ShieldCheck, Mail } from 'lucide-react';
import { authApi } from '../api/authApi';

type SettingsTab = 'profile' | 'alerts' | 'security' | 'language';

export const Settings: React.FC = () => {
  const { currentUser, updateCurrentUser, language, setLanguage, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile states
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Alert preferences states (loaded from localStorage or defaults)
  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('neuro_pref_email_alerts');
    return saved !== null ? saved === 'true' : true;
  });
  const [pushAlerts, setPushAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('neuro_pref_push_alerts');
    return saved !== null ? saved === 'true' : true;
  });
  const [auditAlerts, setAuditAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('neuro_pref_audit_alerts');
    return saved !== null ? saved === 'true' : false;
  });

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Localization states
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language || 'en-US');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    return localStorage.getItem('neuro_pref_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  });
  const [dateFormat, setDateFormat] = useState<string>(() => {
    return localStorage.getItem('neuro_pref_date_format') || 'YYYY-MM-DD';
  });

  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  // Keep fields synced when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Clear messages when tab changes
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setFeedback('');
    setError('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email cannot be empty.');
      return;
    }
    setError('');
    setSavingProfile(true);

    try {
      const res = await authApi.updateProfile({ name: name.trim(), email: email.trim() });
      if (res.access_token) {
        localStorage.setItem('neuro_token', res.access_token);
      }
      if (res.user) {
        updateCurrentUser(res.user);
      }
      setFeedback('Profile details saved to database successfully.');
      addNotification('Profile settings updated.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update profile. Check email availability.';
      setError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('neuro_pref_email_alerts', String(emailAlerts));
    localStorage.setItem('neuro_pref_push_alerts', String(pushAlerts));
    localStorage.setItem('neuro_pref_audit_alerts', String(auditAlerts));
    setFeedback('Clinical alert preferences saved.');
    addNotification('Alert preferences updated.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError('Please provide your current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setError('');
    setSavingPassword(true);

    try {
      await authApi.changePassword({
        current_password: oldPassword,
        new_password: newPassword
      });
      setFeedback('Security password successfully updated in database.');
      addNotification('Security password updated.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to change password. Verify your current password.';
      setError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdateLocalization = (e: React.FormEvent) => {
    e.preventDefault();
    setLanguage(selectedLanguage);
    localStorage.setItem('neuro_pref_language', selectedLanguage);
    localStorage.setItem('neuro_pref_timezone', selectedTimezone);
    localStorage.setItem('neuro_pref_date_format', dateFormat);
    setFeedback('Localization and region preferences saved.');
    addNotification('Localization preferences updated.');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">System & Account Settings</h2>
          <p className="text-xs text-slate-400">Configure your professional profile, security password, alerts, and localization.</p>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          {currentUser?.role === 'Admin' ? 'Administrator Account' : 'Clinical Account'}
        </span>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs shadow-sm">
          <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs shadow-sm">
          <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Dynamic Navigation Tabs */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col space-y-1.5 h-fit">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => handleTabChange('alerts')}
            className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
              activeTab === 'alerts'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Bell className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Clinical Alerts</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
              activeTab === 'security'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Security Options</span>
          </button>

          <button
            onClick={() => handleTabChange('language')}
            className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
              activeTab === 'language'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Globe className={`w-4 h-4 ${activeTab === 'language' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Language & Localization</span>
          </button>
        </div>

        {/* Right Side: Active Dynamic Tab Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* TAB 1: Profile Details */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {currentUser?.role === 'Admin' ? 'Administrator Profile' : 'Clinician Profile'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Manage your clinical identity and registered email.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Role</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.role === 'Admin' ? 'System Administrator' : 'Doctor / Researcher'}
                    className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@neuroscan.ai"
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingProfile}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Clinical Alerts */}
          {activeTab === 'alerts' && (
            <form onSubmit={handleUpdateAlerts} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Clinical Alert Preferences</h3>
                  <p className="text-[11px] text-slate-400">Configure how you receive diagnostic updates and safety findings.</p>
                </div>
              </div>
              
              <div className="space-y-4 text-xs">
                <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 cursor-pointer select-none transition-all">
                  <div className="space-y-1 pr-4">
                    <span className="font-semibold text-slate-800 block">Automated Email Reports</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Send PDF copies of finalized clinical diagnostics to your registered email address.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded mt-1"
                  />
                </label>

                <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 cursor-pointer select-none transition-all">
                  <div className="space-y-1 pr-4">
                    <span className="font-semibold text-slate-800 block">Critical Tumor Findings Alert</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Trigger urgent in-app push warnings immediately when an MRI scan indicates positive tumor localization.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded mt-1"
                  />
                </label>

                <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 cursor-pointer select-none transition-all">
                  <div className="space-y-1 pr-4">
                    <span className="font-semibold text-slate-800 block">Neural Telemetry & Audit Logs</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Receive weekly notifications summarizing system throughput and model version releases.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditAlerts}
                    onChange={(e) => setAuditAlerts(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded mt-1"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  Save Alert Preferences
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Security Options */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              {/* Password Change Form */}
              <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Update Security Password</h3>
                    <p className="text-[11px] text-slate-400">Change your portal security key to protect patient MRI datasets.</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingPassword}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                  >
                    {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Security Password</span>
                  </button>
                </div>
              </form>

              {/* Protocol Specs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Architecture</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Token Encryption:</strong> JWT HS256 Standard</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Password Hashing:</strong> PBKDF2 SHA-256</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Language & Localization */}
          {activeTab === 'language' && (
            <form onSubmit={handleUpdateLocalization} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Language & Regional Preferences</h3>
                  <p className="text-[11px] text-slate-400">Set system language, timezone, and clinical timestamps.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interface Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800 font-medium"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="es-ES">Español (Spanish)</option>
                    <option value="fr-FR">Français (French)</option>
                    <option value="de-DE">Deutsch (German)</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Timezone</label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800 font-medium"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-xs text-slate-800 font-medium"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601 Clinical standard)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (EU Format)</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Measurement Units</label>
                  <input
                    type="text"
                    disabled
                    value="Metric (mm² for Tumor Area, Celsius)"
                    className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  Save Regional Preferences
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
