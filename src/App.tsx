import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { POSTerminal } from './components/POS/POSTerminal';
import { InventoryManager } from './components/Inventory/InventoryManager';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { CustomerManager } from './components/Customers/CustomerManager';
import { RoleManager } from './components/Users/RoleManager';
import { SettingsDashboard } from './components/Settings/SettingsDashboard';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { ProfileSwitcherModal } from './components/ProfileSwitcherModal';
import { Store, Package, BarChart3, Users, Settings, Shield } from 'lucide-react';
import { t } from './utils/i18n';
import { sounds } from './utils/sound';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { userPermissions, isLoading, language, settings } = usePOS();

  const isNanShop = settings.businessType === 'nan_shop';

  const mobileNavItems = [
    { id: 'pos', label: t('pos_terminal', language), icon: Store, permission: true },
    { id: 'inventory', label: t('inventory', language), icon: Package, permission: userPermissions.canManageInventory },
    { id: 'analytics', label: t('analytics', language), icon: BarChart3, permission: userPermissions.canViewAnalytics && !isNanShop },
    { id: 'customers', label: t('customers', language), icon: Users, permission: userPermissions.canManageCustomers },
    { id: 'roles', label: t('roles', language), icon: Shield, permission: userPermissions.canManageRoles && !isNanShop },
    { id: 'settings', label: t('settings', language), icon: Settings, permission: userPermissions.canSettings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Syncing with Cloud Storage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex antialiased selection:bg-emerald-500 selection:text-slate-950 overflow-hidden max-w-full w-full">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openProfileModal={() => setIsProfileModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openNotifications={() => setIsNotifOpen(true)}
          openProfileModal={() => setIsProfileModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden max-w-full w-full bg-slate-950/50 pb-16 lg:pb-0">
          {activeTab === 'pos' && <POSTerminal />}
          {activeTab === 'inventory' && userPermissions.canManageInventory && <InventoryManager />}
          {activeTab === 'analytics' && userPermissions.canViewAnalytics && <AnalyticsDashboard />}
          {activeTab === 'customers' && userPermissions.canManageCustomers && <CustomerManager />}
          {activeTab === 'roles' && userPermissions.canManageRoles && <RoleManager />}
          {activeTab === 'settings' && userPermissions.canSettings && <SettingsDashboard />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-1 py-1.5 flex items-center justify-around shadow-2xl">
          {mobileNavItems.filter(item => item.permission).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-100 active:scale-90 ${
                activeTab === item.id
                  ? 'text-emerald-400 font-bold bg-emerald-500/10 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none truncate max-w-[55px] text-center">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <ProfileSwitcherModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
