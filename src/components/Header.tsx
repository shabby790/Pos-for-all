import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { t } from '../utils/i18n';
import { sounds } from '../utils/sound';
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
  ChevronDown,
  Settings,
  Zap,
  X,
  Check
} from 'lucide-react';
import { Language, User } from '../types';

const HEADER_INDUSTRIES = [
  { id: 'supermarket', name: 'Supermarket / Grocery', icon: '🛒', defaultName: 'Bismillah Super Store' },
  { id: 'home_appliances', name: 'Home Appliances', icon: '📺', defaultName: 'Al-Rehman Electronics' },
  { id: 'sanitary_fittings', name: 'Sanitary & Plumbing', icon: '🚰', defaultName: 'Pak Sanitary & Hardware' },
  { id: 'restaurant_cafe', name: 'Restaurant & Cafe', icon: '🍔', defaultName: 'Khyber Shinwari Restaurant' },
  { id: 'fast_food', name: 'Pizza & Fast Food', icon: '🍕', defaultName: 'Cheezious Fast Food' },
  { id: 'nan_shop', name: 'Nan Shop & Tandoor', icon: '🥯', defaultName: 'Al-Madina Tandoor & Nan Shop' },
  { id: 'solar_shop', name: 'Solar Energy Shop', icon: '☀️', defaultName: 'Pak Solar Tech' },
  { id: 'beverages', name: 'Beverages & Water Mart', icon: '🥤', defaultName: 'Cold Corner Water Mart' },
  { id: 'garments', name: 'Garments & Boutique', icon: '👕', defaultName: 'Royal Garments' },
  { id: 'pharmacy', name: 'Pharmacy & Medical', icon: '💊', defaultName: 'Shaheen Pharmacy' },
  { id: 'bakery', name: 'Bakery & Sweets', icon: '🥐', defaultName: 'Gourmet Bakery' },
  { id: 'spare_parts', name: 'Auto Spare Parts', icon: '🔧', defaultName: 'Master Auto Parts' },
  { id: 'jewellery', name: 'Jewellery & Gold', icon: '💍', defaultName: 'Al-Anwar Jewellers' },
  { id: 'electronics', name: 'General Electronics', icon: '⚡', defaultName: 'Galaxy Electronics' },
  { id: 'mobiles_accessories', name: 'Mobiles & Accessories', icon: '📱', defaultName: 'Smart Mobile Zone' },
  { id: 'computers_laptops', name: 'Laptops & Computers', icon: '💻', defaultName: 'TechZone Laptops' },
  { id: 'cosmetics', name: 'Cosmetics & Beauty', icon: '💄', defaultName: 'Glamour Cosmetics' },
];

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openNotifications: () => void;
  openProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openNotifications, openProfileModal }) => {
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
    userPermissions,
    savedIndustryProfiles,
    loadIndustryPreset
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

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand & Store Name */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[120px] sm:max-w-xs leading-tight">
                {settings.storeName}
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold truncate leading-none">
                {settings.tagline || 'Smart POS'}
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                openProfileModal();
              }}
              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ml-1 active:scale-95 transition-all shadow-sm"
              title="1-Click Switch Store Profile"
            >
              <Zap className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
              <span>Switch Profile</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-slate-100 truncate max-w-[200px] leading-tight">
                  {settings.storeName}
                </h1>
                <p className="text-[10px] text-emerald-400 font-semibold truncate leading-none">
                  {settings.tagline || 'Smart POS'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                {activeTab === 'pos' ? 'Terminal Active' : `${activeTab.replace('_', ' ')} Dashboard`}
              </h1>
              <button
                onClick={() => {
                  sounds.playClick();
                  openProfileModal();
                }}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm whitespace-nowrap"
                title="1-Click Switch Saved Store Profile"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current animate-pulse" />
                <span>⚡ Switch Store Profile</span>
              </button>
            </div>
          </div>

          {/* Controls Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Online / Offline status badge */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsOnline(!isOnline);
              }}
              title="Click to toggle online/offline mode for testing"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
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
              onClick={() => {
                sounds.playClick();
                handleSyncClick();
              }}
              disabled={isSyncing}
              title={isOnline ? "Cloud Sync Active & Connected (Click to sync)" : "Offline Mode (Sync paused)"}
              className={`relative p-2 rounded-lg border transition-all flex items-center justify-center active:scale-95 ${
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
                onClick={() => {
                  sounds.playClick();
                  setShowLangDropdown(!showLangDropdown);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 active:scale-95 transition-all"
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
                        sounds.playClick();
                        setLanguage(l.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors active:scale-95 ${
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
              onClick={() => {
                sounds.playClick();
                openNotifications();
              }}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Store & Dashboard Settings Button */}
            {userPermissions.canSettings && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('settings');
                }}
                title="Store & Profile Settings"
                className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 ${
                  activeTab === 'settings'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline text-xs font-semibold">Store Profile Settings</span>
              </button>
            )}

            {/* Active User Avatar / Switch User */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowRoleModal(true);
              }}
              className="flex items-center gap-2 px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl transition-all text-left active:scale-95"
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
