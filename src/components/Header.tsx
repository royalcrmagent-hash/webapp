import React from 'react';
import { Bell, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { WalletState } from '../types';

interface HeaderProps {
  wallet: WalletState;
  onToggleHideBalance: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onQuickSend: () => void;
  onBoostBalance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onToggleHideBalance,
  onOpenNotifications,
  onOpenProfile,
  onQuickSend,
  onBoostBalance,
}) => {
  const unreadCount = wallet.notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-3 px-4 pt-2 pb-1">
      {/* Top User Greeting Bar */}
      <div className="flex items-center justify-between">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={wallet.user.avatar}
              alt={wallet.user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                {wallet.user.name}
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{wallet.user.phone}</p>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Main Interactive Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-4 shadow-xl border border-emerald-500/30 text-white">
        {/* Background Graphic Accents */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-400/10 blur-xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-lg pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span className="flex items-center gap-1.5">
              <span>Mobile Wallet Balance</span>
            </span>
            <span className="bg-emerald-900/60 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] text-emerald-200 font-mono">
              {wallet.user.accountNo}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                {wallet.hideBalance ? (
                  <span className="tracking-widest text-slate-300">••••••••</span>
                ) : (
                  `${wallet.currency}${wallet.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </span>
              <button
                onClick={onToggleHideBalance}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-emerald-200 transition"
                title={wallet.hideBalance ? 'Show Balance' : 'Hide Balance'}
              >
                {wallet.hideBalance ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBoostBalance}
                className="bg-teal-500 text-white hover:bg-teal-400 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center shadow-md active:scale-95"
              >
                Boost
              </button>
              <button
                onClick={onQuickSend}
                className="bg-white text-slate-950 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md active:scale-95"
              >
                <span>Send</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
