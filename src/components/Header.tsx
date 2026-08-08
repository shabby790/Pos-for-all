import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { t } from '../utils/i18n';
import {
  Store,
  Wifi,
  WifiOff,
  CloudUpload,
  Bell,
  Globe,
  UserCheck,
  Moon,
  Sun,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Language, User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openNotifications }) => {
  const {
    language,
    setLanguage,
    currentUser,
    setCurrentUser,
    usersList,
    settings,
    updateSettings,
    isOnline,
    setIsOnline,
    syncQueueCount,
    triggerCloudSync,
    notifications,
    userPermissions
  } = usePOS();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ur_roman', label: 'Roman Urdu (اردو)', flag: '🇵🇰' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ur', label: 'اردو (Urdu Script)', flag: '🇵🇰' },
    { code: 'sd', label: 'سنڌي (Sindhi)', flag: '🇵🇰' },
    { code: 'ps', label: 'پښتو (Pashto)', flag: '🇦🇫' },
  ];

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await triggerCloudSync();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const navItems = [
    { id: 'pos', label: t('pos_terminal', language), icon: 'Store', permission: true },
    { id: 'inventory', label: t('inventory', language), icon: 'Package', permission: userPermissions.canManageInventory },
    { id: 'analytics', label: t('analytics', language), icon: 'BarChart3', permission: userPermissions.canViewAnalytics },
    { id: 'customers', label: t('customers', language), icon: 'Users', permission: userPermissions.canManageCustomers },
    { id: 'roles', label: t('roles', language), icon: 'Shield', permission: userPermissions.canManageRoles },
    { id: 'settings', label: t('settings', language), icon: 'Settings', permission: userPermissions.canSettings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-100 truncate max-w-[160px] sm:max-w-xs">
                  {settings.storeName}
                </h1>
                <span className="hidden md:inline-block text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  POS PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-[200px]">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {navItems.filter(item => item.permission).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Controls Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Online / Offline status badge */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              title="Click to toggle online/offline mode for testing"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/80'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/50 hover:bg-amber-900/80'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </button>

            {/* Cloud Sync Status / Action Button */}
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              title={isOnline ? "Cloud Sync Active & Connected (Click to sync)" : "Offline Mode (Sync paused)"}
              className={`relative p-2 rounded-lg border transition-all flex items-center justify-center ${
                isSyncing
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/50'
                  : syncQueueCount > 0
                  ? 'bg-amber-950/40 text-amber-300 border-amber-600/60'
                  : 'bg-slate-800 text-emerald-400 border-emerald-500/40 hover:bg-slate-700 hover:border-emerald-400'
              }`}
            >
              <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
              
              {/* Green online sync status dot when queue is clear */}
              {syncQueueCount === 0 && !isSyncing && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
              )}

              {syncQueueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                  {syncQueueCount}
                </span>
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">
                  {languages.find(l => l.code === language)?.flag}{' '}
                  {languages.find(l => l.code === language)?.label.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors ${
                        language === l.code ? 'text-emerald-400 font-semibold bg-slate-700/50' : 'text-slate-200'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <button
              onClick={openNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Active User Avatar / Switch User */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-2 px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-200 leading-tight truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-emerald-400 capitalize font-medium">
                  {currentUser.role}
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800 scrollbar-none">
          {navItems.filter(item => item.permission).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* User / Role Switcher Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <UserCheck className="w-5 h-5" /> Switch Cashier / Role
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select an authorized store member account to switch permissions and terminal access.
            </p>

            <div className="space-y-3 mb-6">
              {usersList.filter(u => u.active).map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setShowRoleModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    currentUser.id === user.id
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user.role} • PIN: {user.pin}</p>
                    </div>
                  </div>
                  {currentUser.id === user.id && (
                    <span className="text-xs bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
