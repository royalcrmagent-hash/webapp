import React, { useState } from 'react';
import {
  Send,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  Receipt,
  Smartphone,
  QrCode,
  Building2,
  HandCoins,
  Sparkles,
  CreditCard,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (actionKey: string) => void;
  isBoosting?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, isBoosting }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'transfer' | 'bills' | 'finance'>('all');

  const actions = [
    {
      key: 'send',
      label: 'Send Money',
      icon: Send,
      category: 'transfer',
      gradient: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      highlight: true,
      desc: 'Instant P2P Transfer',
    },
    {
      key: 'boost',
      label: isBoosting ? 'Boosting...' : 'Boost Rate',
      icon: TrendingUp,
      category: 'finance',
      gradient: isBoosting ? 'from-amber-400 to-orange-500' : 'from-emerald-600 to-teal-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      highlight: true,
      desc: isBoosting ? 'Rate Active' : 'Compound Balance',
    },
    {
      key: 'add_money',
      label: 'Add Money',
      icon: PlusCircle,
      category: 'finance',
      gradient: 'from-indigo-500 to-blue-600',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      desc: 'Top up balance',
    },
    {
      key: 'cash_out',
      label: 'Cash Out',
      icon: ArrowUpRight,
      category: 'transfer',
      gradient: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: 'Agent & ATM withdrawal',
    },
    {
      key: 'bill_pay',
      label: 'Bill Pay',
      icon: Receipt,
      category: 'bills',
      gradient: 'from-sky-500 to-cyan-600',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      desc: 'Utilities & Internet',
    },
    {
      key: 'recharge',
      label: 'Recharge',
      icon: Smartphone,
      category: 'bills',
      gradient: 'from-purple-500 to-pink-600',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: 'Mobile top-up',
    },
    {
      key: 'qr_code',
      label: 'QR Pay',
      icon: QrCode,
      category: 'transfer',
      gradient: 'from-rose-500 to-red-600',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      desc: 'Scan merchant QR',
    },
    {
      key: 'bank_transfer',
      label: 'Bank Transfer',
      icon: Building2,
      category: 'finance',
      gradient: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      desc: 'Direct to bank account',
    },
  ];

  const filteredActions = activeCategory === 'all'
    ? actions
    : actions.filter(a => a.category === activeCategory);

  return (
    <div className="px-4 py-3">
      {/* Header & Category Pills */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            Quick Services
          </h3>
          <p className="text-[10px] text-slate-400">Secure & lightning fast</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'transfer', label: 'Transfer' },
            { id: 'bills', label: 'Bills' },
            { id: 'finance', label: 'Finance' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {filteredActions.map((act) => {
          const Icon = act.icon;
          const isBoostAct = act.key === 'boost';
          return (
            <button
              key={act.key}
              onClick={() => onAction(act.key)}
              className="flex flex-col items-center group cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-2.5 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-emerald-500/10"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${act.gradient} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${
                  isBoostAct && isBoosting ? 'animate-pulse ring-2 ring-amber-400' : ''
                }`}
              >
                <Icon className="w-5 h-5 drop-shadow" />
              </div>
              <span className={`text-[11px] font-bold mt-2 text-center leading-tight tracking-tight ${
                isBoostAct && isBoosting ? 'text-amber-400' : 'text-slate-200'
              }`}>
                {act.label}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full text-center">
                {act.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

