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
  const { userPermissions } = usePOS();

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
