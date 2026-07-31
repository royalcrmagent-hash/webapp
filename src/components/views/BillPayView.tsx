import React, { useState } from 'react';
import { ArrowLeft, Receipt, CheckCircle2, Zap, Droplets, Wifi, Flame, ChevronRight } from 'lucide-react';
import { WalletState, Transaction } from '../../types';
import { PopupDialog, DialogType } from '../ui/PopupDialog';

interface BillPayViewProps {
  wallet: WalletState;
  onBack: () => void;
  onBillPaySuccess: (txn: Transaction, newBalance: number) => void;
}

export const BillPayView: React.FC<BillPayViewProps> = ({
  wallet,
  onBack,
  onBillPaySuccess,
}) => {
  const [billerCategory, setBillerCategory] = useState<'electricity' | 'water' | 'internet' | 'gas'>('electricity');
  const [accountNo, setAccountNo] = useState('DESCO-8812920');
  const [amount, setAmount] = useState('1850');
  const [isSuccess, setIsSuccess] = useState(false);

  // Custom Popup Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type?: DialogType;
    title: string;
    message: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const openPopup = (title: string, message: React.ReactNode, type: DialogType = 'info') => {
    setDialogState({ isOpen: true, title, message, type });
  };

  const closePopup = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const [customLabel, setCustomLabel] = useState<string>('Bills');

  const billers = [
    { id: 'electricity', name: 'DESCO Electricity', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { id: 'water', name: 'Dhaka WASA Water', icon: Droplets, color: 'text-sky-400 bg-sky-500/10' },
    { id: 'internet', name: 'AmberIT Fiber', icon: Wifi, color: 'text-purple-400 bg-purple-500/10' },
    { id: 'gas', name: 'Titas Gas', icon: Flame, color: 'text-rose-400 bg-rose-500/10' },
  ];

  const handlePayBill = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      openPopup('Invalid Amount', 'Enter valid amount', 'warning');
      return;
    }
    if (numAmount > wallet.balance) {
      openPopup('Insufficient Balance', 'Insufficient wallet balance', 'error');
      return;
    }

    const selectedBiller = billers.find((b) => b.id === billerCategory);
    const newBalance = wallet.balance - numAmount;
    const now = new Date();

    const txn: Transaction = {
      id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'bill_pay',
      title: `${selectedBiller?.name || 'Bill Payment'}`,
      recipientName: accountNo,
      recipientPhone: `Bill Acc: ${accountNo}`,
      amount: numAmount,
      fee: 0,
      date: 'Today',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: 'Utility Payment',
      category: customLabel.trim() || 'Bills',
    };

    onBillPaySuccess(txn, newBalance);
    setIsSuccess(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-sky-400" />
          Pay Utility Bills
        </h2>
        <div className="w-9 h-9"></div>
      </div>

      {!isSuccess ? (
        <div className="flex-1 flex flex-col space-y-4">
          <label className="text-xs font-semibold text-slate-400">Select Biller Category</label>
          <div className="grid grid-cols-2 gap-2">
            {billers.map((b) => {
              const Icon = b.icon;
              const isSelected = billerCategory === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setBillerCategory(b.id as any);
                    setAccountNo(`${b.name.split(' ')[0]}-${Math.floor(100000 + Math.random() * 900000)}`);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 transition text-left ${
                    isSelected
                      ? 'bg-slate-800 border-sky-400 ring-1 ring-sky-400'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${b.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">{b.name}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Bill Account / Customer ID</label>
            <input
              type="text"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <label className="text-xs text-slate-400 font-medium">Bill Amount</label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-sky-400">{wallet.currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-40 text-3xl font-extrabold text-white text-center bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Category / Label Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Category Label</label>
            <div className="flex flex-wrap gap-1.5">
              {['Bills', 'Electricity', 'Water', 'Internet', 'Gas', 'Rent', 'Groceries'].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setCustomLabel(lbl)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                    customLabel === lbl
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Or type custom category label..."
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="mt-auto pt-4">
            <button
              onClick={handlePayBill}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <span>Pay Bill ({wallet.currency}{amount})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-sky-400 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Bill Paid Successfully!</h2>
          <p className="text-xs text-slate-400">
            {wallet.currency}{parseFloat(amount).toLocaleString()} paid for Account {accountNo}.
          </p>
          <button
            onClick={onBack}
            className="bg-sky-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      <PopupDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onClose={closePopup}
      />
    </div>
  );
};
