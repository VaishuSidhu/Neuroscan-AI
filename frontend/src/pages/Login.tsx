import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Brain, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  setPath: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setPath }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Doctor/Researcher' | 'Admin'>('Doctor/Researcher');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(async () => {
      try {
        const loggedUser = await login(email, password);
        setLoading(false);
        if (loggedUser) {
          if (loggedUser.role === 'Admin') {
            setPath('#/admin');
          } else {
            setPath('#/dashboard');
          }
        } else {
          setError('Login failed. Verify your credentials and try again.');
        }
      } catch (err) {
        setLoading(false);
        setError('Login failed. Check server connection.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden p-8 flex flex-col space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Brain className="w-6.5 h-6.5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">NeuroScan AI Portal</h2>
          <p className="text-xs text-slate-400">Clinical-grade Brain MRI diagnostic platform.</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs">
            <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector form field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Portal Access Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('Doctor/Researcher')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'Doctor/Researcher'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Doctor / Researcher
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'Admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Email field */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Clinical Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white rounded-xl text-xs text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="pass" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Security Password</span>
              <a href="#/login" className="text-blue-600 hover:underline capitalize font-normal">Forgot?</a>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white rounded-xl text-xs text-slate-800 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input type="checkbox" className="accent-blue-600 rounded border-slate-300" />
              <span>Remember secure session</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            ) : 'Sign In To Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          New system user?{' '}
          <button onClick={() => setPath('#/register')} className="text-blue-600 hover:underline font-semibold">
            Create clinician account
          </button>
        </div>
      </div>
    </div>
  );
};
