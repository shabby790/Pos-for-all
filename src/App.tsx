import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/Header';
import { POSTerminal } from './components/POS/POSTerminal';
import { InventoryManager } from './components/Inventory/InventoryManager';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { CustomerManager } from './components/Customers/CustomerManager';
import { RoleManager } from './components/Users/RoleManager';
import { SettingsDashboard } from './components/Settings/SettingsDashboard';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { userPermissions, isLoading } = usePOS();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Syncing with Cloud Storage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden max-w-full w-full">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNotifications={() => setIsNotifOpen(true)}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden max-w-full w-full">
        {activeTab === 'pos' && <POSTerminal />}
        {activeTab === 'inventory' && userPermissions.canManageInventory && <InventoryManager />}
        {activeTab === 'analytics' && userPermissions.canViewAnalytics && <AnalyticsDashboard />}
        {activeTab === 'customers' && userPermissions.canManageCustomers && <CustomerManager />}
        {activeTab === 'roles' && userPermissions.canManageRoles && <RoleManager />}
        {activeTab === 'settings' && userPermissions.canSettings && <SettingsDashboard />}
      </main>

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
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
