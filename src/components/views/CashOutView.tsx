import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AppState, Transaction } from '../../types';
import { PopupDialog, DialogType } from '../ui/PopupDialog';

interface CashOutViewProps {
  app: AppState;
  onBack: () => void;
  onCashOutSuccess: (txn: Transaction, newBalance: number) => void;
}

export const CashOutView: React.FC<CashOutViewProps> = ({
  app,
  onBack,
  onCashOutSuccess,
}) => {
  const [agentNumber, setAgentNumber] = useState('01712009988');
  const [amount, setAmount] = useState('1000');
  const [code, setPin] = useState('');
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

  const [category, setCategory] = useState<string>('Withdrawal');
  const [customCategory, setCustomCategory] = useState<string>('');

  const handleCashOut = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      openPopup('Invalid Amount', 'Enter valid amount', 'warning');
      return;
    }
    if (numAmount > app.balance) {
      openPopup('Insufficient Balance', 'Insufficient balance', 'error');
      return;
    }
    if (code !== app.user.code) {
      openPopup('Incorrect Code', 'Incorrect Code.', 'error');
      return;
    }

    const catTag = category === 'Custom' ? (customCategory.trim() || 'Withdrawal') : category;

    const newBalance = app.balance - numAmount;
    const now = new Date();
    const txn: Transaction = { userId: app.user.profileId,
      id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'cash_out',
      title: 'Redeem (Agent)',
      recipientName: `Agent ${agentNumber}`,
      recipientPhone: agentNumber,
      amount: numAmount,
      fee: Math.round(numAmount * 0.015), // 1.5% charge
      date: 'Today',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: 'Agent Withdrawal',
      category: catTag,
    };

    onCashOutSuccess(txn, newBalance);
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
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
          Redeem
        </h2>
        <div className="w-9 h-9"></div>
      </div>

      {!isSuccess ? (
        <div className="flex-1 flex flex-col space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Agent Mobile Number</label>
            <input
              type="text"
              value={agentNumber}
              onChange={(e) => setAgentNumber(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <label className="text-xs text-slate-400 font-medium">Redeem Amount</label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-amber-400">{app.currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-40 text-3xl font-extrabold text-white text-center bg-transparent focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">Charge (1.5%): {app.currency}{(parseFloat(amount || '0') * 0.015).toFixed(2)}</p>
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Category Label</label>
            <div className="flex flex-wrap gap-1.5">
              {['Withdrawal', 'Personal', 'Shopcodeg', 'Emergency', 'Rent', 'Custom'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                    category === c
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {category === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Custom category name..."
                className="w-full mt-1.5 bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Enter Code</label>
            <input
              type="passkey"
              value={code}
              onChange={(e) => setPin(e.target.value)}
              placeholder="1234"
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest text-base"
            />
          </div>

          <div className="mt-auto pt-4">
            <button
              onClick={handleCashOut}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>Confirm Redeem</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-amber-400 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Redeem Successful!</h2>
          <p className="text-xs text-slate-400">
            {app.currency}{parseFloat(amount).toLocaleString()} withdrawn from Agent {agentNumber}.
          </p>
          <button
            onClick={onBack}
            className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs shadow-lg"
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
