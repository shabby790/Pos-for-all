import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Lock,
  Key,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  User as UserIcon
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const RoleManager: React.FC = () => {
  const { usersList, addUser, updateUser, deleteUser, toggleUserActive, currentUser } = usePOS();

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('cashier');
  const [addPin, setAddPin] = useState('');

  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('cashier');
  const [editPin, setEditPin] = useState('');
  const [editActive, setEditActive] = useState(true);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addName.trim() && addPin.trim().length === 4) {
      addUser({
        name: addName.trim(),
        email: addEmail.trim() || `${addName.toLowerCase().replace(/\s+/g, '')}@pos.com`,
        role: addRole,
        pin: addPin.trim(),
        active: true
      });
      setAddName('');
      setAddEmail('');
      setAddPin('');
      setIsAddModalOpen(false);
    } else {
      alert('PIN must be exactly 4 digits!');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPin(user.pin);
    setEditActive(user.active);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (editName.trim() && editPin.trim().length === 4) {
      updateUser({
        ...editingUser,
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        pin: editPin.trim(),
        active: editActive
      });
      setEditingUser(null);
    } else {
      alert('PIN must be exactly 4 digits!');
    }
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete the account you are currently logged in with!');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete staff account for "${user.name}"?`)) {
      deleteUser(user.id);
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
            <ShieldCheck className="w-6 h-6" /> Role-Based Access & Staff Management
          </h2>
          <p className="text-xs text-slate-400">
            Admin Owner & Cashier Account Names, Security PINs, Hide / Unhide & Roles Control
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Admin Owner Name Guidance Notice */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-300">
        <div className="flex items-center gap-2.5">
          <Crown className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-slate-100">Store Owner / Admin & Cashier Account Management (اسٹاف اور ایڈمن کنٹرول)</p>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Admin Owner ya Cashier ka naam update karne ke liye table mein <span className="text-emerald-400 font-semibold font-mono">"Edit"</span> click karein. Account hide/unhide karne ke liye <span className="text-amber-400 font-semibold font-mono">"Active / Disabled"</span> toggle karein.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" /> Authorized Accounts ({usersList.length})
          </h3>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Active Accounts show in POS Header Switcher
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Staff / Owner Name</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Login PIN</th>
                <th className="p-3">Visibility / Status</th>
                <th className="p-3 text-right">Actions (Edit / Hide / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-bold text-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0 border ${
                        u.role === 'admin' ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-slate-800 text-emerald-400 border-slate-700'
                      }`}>
                        {u.role === 'admin' ? <Crown className="w-4 h-4 text-amber-400" /> : u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-slate-100">
                          {u.name}
                          {u.id === currentUser.id && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
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
                      {u.role === 'admin' ? '👑 Admin Owner' : u.role}
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
                        <CheckCircle className="w-3.5 h-3.5" /> Active (Visible)
                      </span>
                    ) : (
                      <span className="text-amber-400/80 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Hidden (Disabled)
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-all"
                        title="Edit Name, Email, Role, PIN"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Hide/Unhide Toggle */}
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => toggleUserActive(u.id)}
                          className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg flex items-center gap-1 border transition-all ${
                            u.active
                              ? 'bg-slate-800 hover:bg-amber-950/60 text-amber-300 border-amber-800/60'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                          }`}
                          title={u.active ? 'Hide / Disable account' : 'Unhide / Enable account'}
                        >
                          {u.active ? (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-400" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Unhide</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete Button */}
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-all"
                          title="Delete staff account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-emerald-400">Add Authorized Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff / Account Name *</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  placeholder="e.g. Hassan Raza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="e.g. hassan@store.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign System Role *</label>
                <select
                  value={addRole}
                  onChange={e => setAddRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="cashier">Cashier (POS Billing Only)</option>
                  <option value="manager">Store Manager (POS + Inventory + Reports)</option>
                  <option value="admin">Administrator / Store Owner (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">4-Digit Terminal PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={addPin}
                  onChange={e => setAddPin(e.target.value)}
                  placeholder="e.g. 7890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-widest text-center text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {/* EDIT STAFF / ADMIN OWNER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit Account Details ({editingUser.role === 'admin' ? 'Store Owner / Admin' : 'Staff Member'})
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name (Store Owner / Staff Name) *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="e.g. Muhammad Ali (Owner)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="e.g. owner@store.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Role *</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="admin">Administrator / Store Owner (Full Access)</option>
                  <option value="manager">Store Manager (POS + Inventory + Reports)</option>
                  <option value="cashier">Cashier (POS Billing Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">4-Digit Login PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={editPin}
                  onChange={e => setEditPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-widest text-center text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 mt-1">
                <div>
                  <p className="font-bold text-slate-200">Account Visibility (آن / آف)</p>
                  <p className="text-[10px] text-slate-400">Show in cashier switcher dropdown</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    editActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {editActive ? 'ACTIVE (آن)' : 'HIDDEN (آف)'}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
