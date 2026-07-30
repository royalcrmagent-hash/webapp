import React from 'react';
import { ArrowLeft, Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onBack,
  onMarkAllRead,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-emerald-400" />
          Notifications
        </h2>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-emerald-400 font-semibold hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 custom-scrollbar">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-3.5 rounded-2xl border transition ${
              !n.read
                ? 'bg-slate-900 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="text-xs font-bold text-white">{n.title}</h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 pl-6 leading-relaxed">{n.message}</p>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">No notifications yet.</div>
        )}
      </div>
    </div>
  );
};
