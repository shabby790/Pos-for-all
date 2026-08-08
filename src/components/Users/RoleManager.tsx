import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ShieldCheck, UserCheck, Plus, Lock, Key, CheckCircle, XCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const RoleManager: React.FC = () => {
  const { usersList, addUser, toggleUserActive, currentUser } = usePOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [pin, setPin] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && pin.trim().length === 4) {
      addUser({
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@pos.com`,
        role,
        pin: pin.trim(),
        active: true
      });
      setName('');
      setEmail('');
      setPin('');
      setIsModalOpen(false);
    } else {
      alert('PIN must be exactly 4 digits!');
    }
  };

  const permissionsMatrix = [
    { feature: 'POS Terminal Billing', admin: true, manager: true, cashier: true },
    { feature: 'Hold / Restore Pending Carts', admin: true, manager: true, cashier: true },
    { feature: 'Quick Add Customer', admin: true, manager: true, cashier: true },
    { feature: 'Apply Cart / Item Discounts', admin: true, manager: true, cashier: false },
    { feature: 'Manage Inventory & Prices', admin: true, manager: true, cashier: false },
    { feature: 'Sales Analytics & Reports', admin: true, manager: true, cashier: false },
    { feature: 'Store Settings & Tax Config', admin: true, manager: false, cashier: false },
    { feature: 'Staff & Role Management', admin: true, manager: false, cashier: false },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-6 h-6" /> Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-400">Manage cashier, store manager, and administrator staff accounts with security PINs</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Staff Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-sm text-slate-100">Authorized Staff Members ({usersList.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Login PIN</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-bold text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p>{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'admin'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : u.role === 'manager'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-slate-300">
                    <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded font-bold tracking-widest text-emerald-400">
                      {u.pin}
                    </span>
                  </td>

                  <td className="p-3">
                    {u.active ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Disabled
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg"
                      >
                        {u.active ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-emerald-400">Role Permissions Reference Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">System Feature</th>
                <th className="p-3 text-center">Admin</th>
                <th className="p-3 text-center">Manager</th>
                <th className="p-3 text-center">Cashier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-semibold text-slate-200">{row.feature}</td>
                  <td className="p-3 text-center">{row.admin ? '✅' : '❌'}</td>
                  <td className="p-3 text-center">{row.manager ? '✅' : '❌'}</td>
                  <td className="p-3 text-center">{row.cashier ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-emerald-400">Add Authorized Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Hassan Raza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign System Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="cashier">Cashier (POS Billing Only)</option>
                  <option value="manager">Store Manager (POS + Inventory + Reports)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">4-Digit Terminal PIN Code *</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="e.g. 7890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-widest text-center text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
