import React, { useState } from 'react';
import { ShieldCheck, Key, RefreshCw, Smartphone, DollarSign, ArrowLeft, Check, LogIn, ShieldAlert, UserCheck, Globe, ChevronRight, TrendingUp, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { WalletState, Currency, UserAccount } from '../../types';
import { CountrySelectorModal } from './CountrySelectorModal';
import { ALL_COUNTRIES, getCountryBySymbolOrCode, CountryCurrency } from '../../data/countries';

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
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [calcAmount, setCalcAmount] = useState<string>('100');
  const [rateChangedBanner, setRateChangedBanner] = useState<string | null>(null);

  const currentCountry = getCountryBySymbolOrCode(wallet.currency);

  const handleCurrencyChange = (c: CountryCurrency) => {
    onUpdateCurrency(c.symbol as Currency);
    setRateChangedBanner(
      `Currency changed to ${c.flag} ${c.name} (${c.code}). Live Rate: 1 USD = ${c.symbol}${c.rateToUSD} ${c.code}`
    );
    setTimeout(() => {
      setRateChangedBanner(null);
    }, 6000);
  };

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

  const convertedValue = (parseFloat(calcAmount || '0') * currentCountry.rateToUSD).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Rate Change Notification Banner */}
      {rateChangedBanner && (
        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 font-medium">{rateChangedBanner}</div>
        </div>
      )}

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

        {/* Country & Currency Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg">
                {currentCountry.flag}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Country & Currency</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {currentCountry.code} ({currentCountry.symbol})
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {currentCountry.name} ({currentCountry.code})
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCountryModal(true)}
              className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
          </div>

          {/* Live Exchange Rate Card */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Live Exchange Rate</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                Updated Just Now
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="text-slate-300">
                1 <strong className="text-white">USD</strong> ($) =
              </div>
              <div className="text-emerald-400 font-mono font-black text-sm bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {currentCountry.symbol}{currentCountry.rateToUSD} {currentCountry.code}
              </div>
            </div>

            {/* Inverse rate & balance conversion */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
              <div>
                <span>1 {currentCountry.code} ≈ </span>
                <strong className="text-slate-200">
                  ${(1 / (currentCountry.rateToUSD || 1)).toFixed(4)} USD
                </strong>
              </div>
              <div className="text-right">
                <span>Value ({currentCountry.code}): </span>
                <strong className="text-emerald-400">
                  {currentCountry.symbol}{(wallet.balance * currentCountry.rateToUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Country Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 custom-scrollbar">
            {ALL_COUNTRIES.slice(0, 10).map((p) => {
              const isSelected = currentCountry.code === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => handleCurrencyChange(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{p.flag}</span>
                  <span>{p.code}</span>
                </button>
              );
            })}
            <button
              onClick={() => setShowCountryModal(true)}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 bg-slate-950 border border-slate-800 hover:text-white shrink-0 flex items-center gap-1"
            >
              <span>More ({ALL_COUNTRIES.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Live Exchange Rate Converter Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Currency Rate Calculator</h4>
                <p className="text-[10px] text-slate-400">Calculate instant exchange rate from USD</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              USD ➔ {currentCountry.code}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold block">
                Amount in USD ($)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-mono font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-2 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold block">Equivalent in {currentCountry.code} ({currentCountry.symbol})</label>
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-mono font-black text-emerald-400 flex items-center justify-between">
                <span>{currentCountry.symbol}</span>
                <span>{convertedValue}</span>
              </div>
            </div>
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

      {/* Country & Currency Selection Modal */}
      <CountrySelectorModal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCurrencySymbol={wallet.currency}
        onSelectCountry={(country) => {
          handleCurrencyChange(country);
        }}
      />
    </div>
  );
};
