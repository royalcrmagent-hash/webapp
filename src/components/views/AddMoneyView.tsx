import React, { useState } from 'react';
import { ArrowLeft, Building2, CreditCard, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { WalletState, Transaction } from '../../types';
import { getCountryBySymbolOrCode } from '../../data/countries';

interface AddMoneyViewProps {
  wallet: WalletState;
  onBack: () => void;
  onAddMoneySuccess: (txn: Transaction, newBalance: number) => void;
}

export const AddMoneyView: React.FC<AddMoneyViewProps> = ({
  wallet,
  onBack,
  onAddMoneySuccess,
}) => {
  const [method, setMethod] = useState<'card' | 'bank'>('card');
  const [sourceName, setSourceName] = useState('BRAC Bank Visa (*4092)');
  const [amount, setAmount] = useState('2000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const bankOptions = [
    'BRAC Bank Visa (*4092)',
    'City Bank Mastercard (*8812)',
    'Islami Bank Account (*9921)',
    'Dutch-Bangla Bank (*1102)',
  ];

  const [category, setCategory] = useState<string>('Deposit');
  const [customCategory, setCustomCategory] = useState<string>('');

  const handleAddMoney = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const catTag = category === 'Custom' ? (customCategory.trim() || 'Deposit') : category;

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const newBalance = wallet.balance + numAmount;
      const txn: Transaction = {
        id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'cash_in',
        title: `Add Money (${method === 'card' ? 'Card' : 'Bank'})`,
        recipientName: sourceName,
        recipientPhone: 'Deposit to Wallet',
        amount: numAmount,
        fee: 0,
        date: 'Today',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        reference: 'Wallet Deposit',
        category: catTag,
      };

      onAddMoneySuccess(txn, newBalance);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-white">Add Money to Wallet</h2>
        <div className="w-9 h-9"></div>
      </div>

      {!isSuccess ? (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Method Selection */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setMethod('card')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                method === 'card'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card Deposit</span>
            </button>
            <button
              onClick={() => setMethod('bank')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                method === 'bank'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank Transfer</span>
            </button>
          </div>

          {/* Select Account */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Select Payment Source</label>
            <select
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {bankOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Enter Amount */}
          {(() => {
            const currentCountry = getCountryBySymbolOrCode(wallet.currency);
            const numAmount = parseFloat(amount || '0');
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
                <label className="text-xs text-slate-400 font-medium">Deposit Amount</label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-emerald-400">{wallet.currency}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-40 text-3xl font-extrabold text-white text-center bg-transparent focus:outline-none"
                  />
                </div>

                {/* Exchange Rate Indicator */}
                <div className="text-[11px] font-mono text-emerald-400 bg-slate-950/80 border border-emerald-500/20 py-1 px-3 rounded-xl inline-block mx-auto">
                  <span>Rate: 1 USD = {currentCountry.symbol}{currentCountry.rateToUSD} {currentCountry.code}</span>
                  {currentCountry.code !== 'USD' && numAmount > 0 && (
                    <span className="block text-slate-300 font-sans text-[10px] mt-0.5">
                      ≈ ${(numAmount / (currentCountry.rateToUSD || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  )}
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  {[1000, 2000, 5000, 10000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v.toString())}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium"
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Category Label</label>
            <div className="flex flex-wrap gap-1.5">
              {['Deposit', 'Salary', 'Bonus', 'Refund', 'Groceries', 'Custom'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                    category === c
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
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
                className="w-full mt-1.5 bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Encrypted payment. Funds arrive instantly in your wallet balance.</span>
          </div>

          <div className="mt-auto pt-4">
            <button
              onClick={handleAddMoney}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isProcessing ? (
                <span>Adding Funds...</span>
              ) : (
                <>
                  <span>Add {wallet.currency}{parseFloat(amount || '0').toLocaleString()}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Money Added Successfully!</h2>
          <p className="text-xs text-slate-400">
            {wallet.currency}{parseFloat(amount).toLocaleString()} deposited from {sourceName}.
          </p>
          <button
            onClick={onBack}
            className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
