import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserSquare2, Search, UserPlus, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUserStatus, deleteUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'Admin' | 'Doctor/Researcher'>('all');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Doctor/Researcher'>('Doctor/Researcher');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    addUser({
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Active'
    });

    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Clinician & Researcher User Management</h2>
          <p className="text-[10px] text-slate-400">Search credentials, audit system accounts, and set role boundaries.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Provision New Account
        </button>
      </div>

      {/* Add User Modal inline form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4 max-w-xl">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure New Clinician Account</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Clinician Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Dr. Sarah Jenkins"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Clinical Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="s.jenkins@neuroscan.ai"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">System Role Access</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="Doctor/Researcher">Doctor / Researcher (Read/Write diagnostics)</option>
              <option value="Admin">System Administrator (Full release permissions)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all"
            >
              Provision Account
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs max-w-xl">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none rounded-lg text-xs"
          />
        </div>
        <div className="h-6 border-r border-slate-200"></div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="Doctor/Researcher">Doctors / Researchers</option>
          <option value="Admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">User Details</th>
                <th className="pb-3 font-semibold">Portal Role</th>
                <th className="pb-3 font-semibold">Joined Date</th>
                <th className="pb-3 font-semibold">Account Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-850">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-slate-600">{u.role}</span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-500">
                    {u.created_at ? u.created_at.split('T')[0] : '2026-08-30'}
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span>{u.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => updateUserStatus(u.id, u.status === 'Active' ? 'Inactive' : 'Active')}
                      className={`px-2 py-1 text-[10px] font-semibold border rounded transition-colors ${
                        u.status === 'Active' 
                          ? 'border-red-200 text-red-600 hover:bg-red-50' 
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-1 text-slate-400 hover:text-red-650 rounded hover:bg-slate-50 transition-colors inline-flex items-center"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
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
