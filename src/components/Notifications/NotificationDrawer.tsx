import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Bell, X, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = usePOS();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 max-w-sm w-full p-6 shadow-2xl text-white flex flex-col h-full animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">Live Notifications</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="p-1 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Bell className="w-8 h-8 stroke-1 opacity-40 mb-2" />
              <p>No notifications right now.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  n.type === 'low_stock'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : n.type === 'sale'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                } ${!n.read ? 'ring-1 ring-emerald-500' : 'opacity-80'}`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <div className="flex items-center gap-1.5">
                    {n.type === 'low_stock' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {n.type === 'sale' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    {n.type === 'system' && <Info className="w-3.5 h-3.5 text-blue-400" />}
                    <span>{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                </div>
                <p className="text-[11px] leading-tight text-slate-300">{n.message}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
