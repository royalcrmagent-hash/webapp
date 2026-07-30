import React from 'react';
import {
  Send,
  PlusCircle,
  ArrowUpRight,
  Receipt,
  Smartphone,
  QrCode,
  Building2,
  HandCoins,
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (actionKey: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      key: 'send',
      label: 'Send Money',
      icon: Send,
      color: 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 ring-2 ring-emerald-400',
      highlight: true,
    },
    {
      key: 'add_money',
      label: 'Add Money',
      icon: PlusCircle,
      color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    },
    {
      key: 'cash_out',
      label: 'Cash Out',
      icon: ArrowUpRight,
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'bill_pay',
      label: 'Bill Pay',
      icon: Receipt,
      color: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
    },
    {
      key: 'recharge',
      label: 'Recharge',
      icon: Smartphone,
      color: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    },
    {
      key: 'qr_code',
      label: 'QR Pay',
      icon: QrCode,
      color: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    },
    {
      key: 'bank_transfer',
      label: 'Bank Transfer',
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    },
    {
      key: 'request_money',
      label: 'Request',
      icon: HandCoins,
      color: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Services
        </h3>
        <span className="text-[11px] text-emerald-400 font-semibold">Fast Transactions</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.key}
              onClick={() => onAction(act.key)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform group-hover:scale-105 group-active:scale-95 shadow-md ${act.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 text-center leading-tight ${act.highlight ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
