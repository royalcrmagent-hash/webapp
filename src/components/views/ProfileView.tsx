import React, { useState } from 'react';
import { ShieldCheck, Key, RefreshCw, Smartphone, DollarSign, ArrowLeft, Check, LogIn, ShieldAlert, UserCheck } from 'lucide-react';
import { WalletState, Currency, UserAccount } from '../../types';

interface ProfileViewProps {
  wallet: WalletState;
  currentUser?: UserAccount | null;
  onUpdatePin: (newPin: string) => void;
  onUpdateCurrency: (curr: Currency) => void;
  onResetWallet: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'signup') => void;
  onOpenAdminPanel?: () => void;
  onNavigateToView?: (view: string) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  wallet,
  currentUser,
  onUpdatePin,
  onUpdateCurrency,
  onResetWallet,
  onOpenAuthModal,
  onOpenAdminPanel,
  onNavigateToView,
  onLogout,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  const handleSavePin = () => {
    if (newPinInput.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }
    onUpdatePin(newPinInput);
    setShowPinModal(false);
    setNewPinInput('');
    alert('Security PIN updated successfully!');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Profile Card Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center space-y-2">
        <div className="relative w-16 h-16 mx-auto">
          <img
            src={wallet.user.avatar}
            alt={wallet.user.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/30"
          />
          <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-slate-950 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">{wallet.user.name}</h2>
          <p className="text-xs font-mono text-slate-400">{wallet.user.phone}</p>
          <span className="inline-block mt-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
            {wallet.user.accountNo}
          </span>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
          Account & Security
        </label>



        {/* Super Admin Dashboard Button */}
        {currentUser?.role === 'admin' && (
          <div
            onClick={onOpenAdminPanel}
            className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-purple-400 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-purple-300">Super Admin Panel</h4>
                <p className="text-[11px] text-slate-400">Manage users, transactions & security</p>
              </div>
            </div>
            <span className="text-xs bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-lg">
              ADMIN
            </span>
          </div>
        )}

        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1 pt-2">
          Wallet Preferences
        </label>

        {/* Currency Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              {wallet.currency}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Default Currency</h4>
              <p className="text-[11px] text-slate-400">Choose display symbol</p>
            </div>
          </div>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onUpdateCurrency('৳')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                wallet.currency === '৳' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              ৳ BDT
            </button>
            <button
              onClick={() => onUpdateCurrency('$')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                wallet.currency === '$' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Change PIN */}
        <div
          onClick={() => setShowPinModal(true)}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Wallet Security PIN</h4>
              <p className="text-[11px] text-slate-400">
                Current PIN: <span className="font-mono text-emerald-400">{wallet.user.pin}</span>
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-medium">Change</span>
        </div>

        {/* Reset Wallet Data */}
        <div
          onClick={() => {
            if (confirm('Reset wallet balance and transactions to initial values?')) {
              onResetWallet();
            }
          }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Reset Wallet State</h4>
              <p className="text-[11px] text-slate-400">Restore default balance & transaction history</p>
            </div>
          </div>
          <span className="text-xs text-rose-400 font-medium">Reset</span>
        </div>

        {/* Logout Button */}
        <div
          onClick={onLogout}
          className="bg-slate-900 border border-rose-900/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-rose-900/10 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              <LogIn className="w-4 h-4 rotate-180" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-400">Logout</h4>
              <p className="text-[11px] text-slate-500">End your current session</p>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-xs space-y-3">
            <h3 className="text-sm font-bold text-white">Change Security PIN</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Enter New 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="e.g. 5678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-center text-lg font-mono tracking-widest text-white"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 bg-emerald-500 text-slate-950 py-2 rounded-xl text-xs font-bold"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
