import React from 'react';
import { Bell, Eye, EyeOff, ShieldCheck, Award } from 'lucide-react';
import { WalletState } from '../types';
import { getCountryBySymbolOrCode, ALL_COUNTRIES } from '../data/countries';

interface HeaderProps {
  wallet: WalletState;
  onToggleHideBalance: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onToggleHideBalance,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const unreadCount = wallet.notifications.filter((n) => !n.read).length;
  const currentCountry = getCountryBySymbolOrCode(wallet.currency) || ALL_COUNTRIES[0];
  const rateToUSD = currentCountry.rateToUSD || 1;
  const displayBalance = wallet.balance;

  return (
    <div className="space-y-3.5 px-4 pt-3 pb-1">
      {/* Top User Greeting & Status Bar */}
      <div className="flex items-center justify-between">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group bg-slate-900/60 hover:bg-slate-800/80 p-1.5 pr-3 rounded-2xl border border-slate-800/80 transition"
        >
          <div className="relative">
            <img
              src={wallet.user.avatar}
              alt={wallet.user.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-pulse"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition tracking-tight">
                {wallet.user.name}
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{wallet.user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Country & Currency Flag Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:text-white transition active:scale-95 shadow-sm text-xs font-bold"
            title={`Active Country: ${currentCountry.name} (${currentCountry.code})`}
          >
            <span className="text-sm leading-none">{currentCountry.flag}</span>
            <span className="font-mono text-[11px] text-emerald-400">{currentCountry.code}</span>
          </button>

          {/* VIP Tier Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>VIP Gold</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition active:scale-95 shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Neo-Fintech Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 rounded-3xl p-5 shadow-2xl border border-emerald-500/40 text-white">
        {/* Dynamic Background Mesh Ornaments */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span className="text-emerald-200/90 text-xs font-semibold tracking-wide">
              Primary Account
            </span>
            <span className="bg-emerald-900/80 border border-emerald-400/40 px-2.5 py-1 rounded-lg text-[10px] text-emerald-200 font-mono tracking-widest shadow-inner">
              {wallet.user.accountNo}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-emerald-200/70 uppercase tracking-wider font-semibold mb-0.5">
                Available Balance ({currentCountry.code})
              </p>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                  {wallet.hideBalance ? (
                    <span className="tracking-widest text-slate-300">••••••••</span>
                  ) : (
                    `${wallet.currency}${displayBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  )}
                </span>
                <button
                  onClick={onToggleHideBalance}
                  className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-emerald-200 transition active:scale-95"
                  title={wallet.hideBalance ? 'Show Balance' : 'Hide Balance'}
                >
                  {wallet.hideBalance ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Exchange Rate Info Pill */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-mono text-emerald-200">
                <span className="text-xs">{currentCountry.flag}</span>
                <span className="font-bold">Rate:</span>
                <span>1 USD = {currentCountry.symbol}{currentCountry.rateToUSD} {currentCountry.code}</span>
                {currentCountry.code !== 'USD' && !wallet.hideBalance && (
                  <span className="text-emerald-300 border-l border-white/20 pl-1.5 font-sans font-semibold">
                    (Base: ${(wallet.balance / rateToUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

