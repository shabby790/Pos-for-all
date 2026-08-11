import React from 'react';
import { usePOS } from '../context/POSContext';
import { t } from '../utils/i18n';
import { sounds } from '../utils/sound';
import {
  Store,
  Package,
  BarChart3,
  Users,
  Shield,
  Settings,
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openProfileModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openProfileModal }) => {
  const { language, userPermissions, currentUser, settings } = usePOS();

  // For Nan Shop, we might want to emphasize the POS
  const isNanShop = settings.businessType === 'nan_shop';

  const navItems = [
    { id: 'pos', label: t('pos_terminal', language), icon: Store, color: 'text-emerald-400', bg: 'bg-emerald-500/10', permission: true },
    { id: 'inventory', label: t('inventory', language), icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', permission: userPermissions.canManageInventory },
    { id: 'analytics', label: t('analytics', language), icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10', permission: userPermissions.canViewAnalytics && !isNanShop },
    { id: 'customers', label: t('customers', language), icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10', permission: userPermissions.canManageCustomers },
    { id: 'roles', label: t('roles', language), icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10', permission: userPermissions.canManageRoles && !isNanShop },
    { id: 'settings', label: t('settings', language), icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10', permission: userPermissions.canSettings },
  ];

  const handleNavClick = (id: string) => {
    sounds.playClick();
    setActiveTab(id);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shrink-0 z-40 shadow-xl">
      {/* Brand Section */}
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-slate-100 uppercase leading-none">
              Smart POS
            </h1>
            <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">
              {isNanShop ? 'Nan Center Edition' : 'Studio Pro'}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Store Profile</p>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h2 className="text-xs font-bold text-emerald-300 truncate">{settings.storeName}</h2>
          
          <button
            onClick={() => {
              sounds.playClick();
              openProfileModal();
            }}
            className="w-full py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span>⚡ Switch / Store Profile</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
        
        {navItems.filter(item => item.permission).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 active:scale-95 group ${
              activeTab === item.id
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold scale-[1.02]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-slate-950' : item.color}`} />
              <span className="text-sm">{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate leading-none mb-1">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
