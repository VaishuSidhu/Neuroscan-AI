import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Check, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser, theme, setTheme, language, setLanguage } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Dr. Sarah Jenkins');
  const [email, setEmail] = useState(currentUser?.email || 's.jenkins@neuroscan.ai');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  
  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Profile settings updated successfully.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setFeedback('Security password successfully updated.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      <div className="flex flex-col space-y-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">System & Account Settings</h2>
        <p className="text-[10px] text-slate-400">Configure your professional profile, security password, and notifications.</p>
      </div>

      {feedback && (
        <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
          <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Navigation Quicklinks */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col space-y-2.5 h-fit">
          <button className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg text-left">
            <User className="w-4 h-4 text-blue-600" />
            <span>Profile Details</span>
          </button>
          <button className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg text-left">
            <Bell className="w-4 h-4 text-slate-400" />
            <span>Clinical Alerts</span>
          </button>
          <button className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg text-left">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Security Options</span>
          </button>
          <button className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg text-left">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Language & Localization</span>
          </button>
        </div>

        {/* Right Side Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
              <User className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinician Profile</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professional Title</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.role === 'Admin' ? 'System Administrator' : 'Lead Neuro-Radiologist'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
              />
            </div>

            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm">
              Save Profile Changes
            </button>
          </form>

          {/* Clinical Alerts Preferences */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
              <Bell className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Alerts</h3>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-600">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-700">Email Notifications</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Send automated PDF report copies to my registered email address.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="accent-blue-600 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-700">In-App Critical Findings</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Trigger instant push warnings for positive tumor localizations.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="accent-blue-600 w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>

          {/* Security Password Change */}
          <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
              <Shield className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Change Password</h3>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Security Code</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Security Code</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-slate-700"
                />
              </div>
            </div>

            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm">
              Change Security Password
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
