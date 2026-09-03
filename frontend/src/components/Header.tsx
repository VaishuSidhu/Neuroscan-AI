import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, User, LogOut, ShieldAlert, ChevronDown, Check, Settings } from 'lucide-react';
// Hash-based routing is used for system modules.

interface HeaderProps {
  currentPath: string;
  setPath: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, setPath }) => {
  const { currentUser, login, logout, notifications, clearNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formattedTitle = () => {
    const path = currentPath.replace('#/', '');
    if (!path || path === 'landing') return 'Overview';
    if (path.startsWith('admin')) return 'Admin Operations';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="no-print sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md">
      {/* Title / Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight capitalize">
          {formattedTitle()}
        </h2>
        <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 rounded-md border border-slate-200">
          {currentUser?.role === 'Admin' ? 'ADMIN CONSOLE' : 'DOCTOR PORTAL'}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
            title="Clinical Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4.5 h-4.5 text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 w-80 mt-2.5 origin-top-right bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 z-50">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <span className="text-xs font-semibold text-slate-700">Clinical Alerts</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={clearNotifications} 
                    className="text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/20' : ''}`}>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.text}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 p-1.5 pr-3 hover:bg-slate-100 rounded-full transition-all text-left"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200">
              {currentUser?.name.charAt(0) || 'D'}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser?.name || 'Dr. Jenkins'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {currentUser?.role === 'Admin' ? 'System Admin' : 'Diagnostic Lead'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 w-56 mt-2.5 origin-top-right bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 z-50">
              <div className="px-4 py-3 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-800 truncate">{currentUser?.name}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setPath('#/settings');
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400 mr-2.5" />
                  Account Settings
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    setPath('#/login');
                  }}
                  className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400 mr-2.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
