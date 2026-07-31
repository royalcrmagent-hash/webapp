import React, { useState } from 'react';
import { UserAccount, Transaction, WalletState } from '../../types';
import {
  Users,
  ShieldAlert,
  Wallet,
  Activity,
  Search,
  PlusCircle,
  MinusCircle,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Fingerprint,
  TrendingUp,
  Sliders,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';
import { PopupDialog, DialogType } from '../ui/PopupDialog';

interface AdminPanelProps {
  currentUser: UserAccount;
  systemUsers: UserAccount[];
  transactions: Transaction[];
  biometricThreshold: number;
  biometricRequired: boolean;
  onUpdateUsers: (users: UserAccount[]) => void;
  onUpdateBiometricSettings: (threshold: number, required: boolean) => void;
  onSwitchToUserWallet: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  systemUsers,
  transactions,
  biometricThreshold,
  biometricRequired,
  onUpdateUsers,
  onUpdateBiometricSettings,
  onSwitchToUserWallet,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Popup Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type?: DialogType;
    title: string;
    message: React.ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const openPopup = (
    title: string,
    message: React.ReactNode,
    type: DialogType = 'info',
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closePopup = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  // Balance adjustment modal state
  const [adjustingUser, setAdjustingUser] = useState<UserAccount | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustNote, setAdjustNote] = useState('');

  // Total metrics calculations
  const totalLiquidity = systemUsers.reduce((sum, u) => sum + u.balance, 0);
  const totalTxnVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Filtered users
  const filteredUsers = systemUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.accountNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered transactions
  const filteredTransactions = transactions.filter(
    (t) =>
      t.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipientPhone.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle freeze status
  const handleToggleFreeze = (userId: string) => {
    const updated = systemUsers.map((u) => {
      if (u.id === userId) {
        return { ...u, isFrozen: !u.isFrozen };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Submit balance adjustment
  const handleExecuteAdjustment = () => {
    if (!adjustingUser) return;
    const val = parseFloat(adjustAmount);
    if (isNaN(val) || val <= 0) {
      openPopup('Invalid Amount', 'Please enter a valid amount.', 'warning');
      return;
    }

    const updated = systemUsers.map((u) => {
      if (u.id === adjustingUser.id) {
        const newBal = adjustType === 'credit' ? u.balance + val : Math.max(0, u.balance - val);
        return { ...u, balance: newBal };
      }
      return u;
    });

    onUpdateUsers(updated);
    openPopup('Balance Adjusted', `Successfully ${adjustType === 'credit' ? 'credited' : 'debited'} ৳${val.toLocaleString()} for ${adjustingUser.name}`, 'success');
    setAdjustingUser(null);
    setAdjustAmount('');
    setAdjustNote('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* Top Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">Super Admin Dashboard</h2>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">
                  Root Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToUserWallet}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>User Wallet</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              title="Logout Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-500/20">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
              Total Liquidity
            </span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              ৳{totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
              System Accounts
            </span>
            <span className="text-base font-extrabold text-purple-300 font-mono">
              {systemUsers.length} Users Registered
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Manage Users</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'transactions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Txn History</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Security & Policy</span>
        </button>
      </div>

      {/* TAB 1: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name, email, or mobile..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* User Cards List */}
          <div className="space-y-2.5">
            {filteredUsers.map((usr) => (
              <div
                key={usr.id}
                className={`bg-slate-900 border rounded-2xl p-3.5 transition space-y-3 ${
                  usr.isFrozen ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={usr.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">{usr.name}</h4>
                        {usr.role === 'admin' ? (
                          <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            ADMIN
                          </span>
                        ) : usr.isFrozen ? (
                          <span className="bg-rose-500/20 text-rose-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            FROZEN
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{usr.email}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {usr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Balance</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      ৳{usr.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Admin Actions Bar */}
                {usr.role !== 'admin' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setAdjustingUser(usr)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-purple-300 py-1.5 rounded-xl text-[11px] font-bold border border-purple-500/30 transition flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Credit / Debit Funds</span>
                    </button>

                    <button
                      onClick={() => handleToggleFreeze(usr.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                        usr.isFrozen
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                    >
                      {usr.isFrozen ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unfreeze</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Freeze Account</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM TRANSACTIONS LOG */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transaction ID, recipient, or category..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{t.title}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {t.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    To/From: <strong className="text-slate-200">{t.recipientName}</strong> ({t.recipientPhone})
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {t.date} • {t.time}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-extrabold font-mono block ${
                      t.type === 'received' || t.type === 'cash_in'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {t.type === 'received' || t.type === 'cash_in' ? '+' : '-'}৳
                    {t.amount.toLocaleString()}
                  </span>
                  <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full mt-1">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & POLICY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Biometric Protection Threshold</h3>
                <p className="text-[11px] text-slate-400">
                  Transfers at or above this amount will trigger mandatory Face ID / Touch ID verification
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">
                Minimum Amount for Biometrics (৳)
              </label>
              <div className="flex items-center gap-2">
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateBiometricSettings(val, biometricRequired)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      biometricThreshold === val
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ৳{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Enforce Biometrics System-Wide</h4>
                <p className="text-[11px] text-slate-400">Require biometric layer on high-value transfers</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateBiometricSettings(biometricThreshold, !biometricRequired)}
                className={`w-12 h-6 rounded-full p-1 transition ${
                  biometricRequired ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition transform ${
                    biometricRequired ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      {adjustingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white">Credit / Debit Account Funds</h3>
              <button
                onClick={() => setAdjustingUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <p className="text-xs font-bold text-white">{adjustingUser.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{adjustingUser.phone}</p>
              <p className="text-xs text-emerald-400 font-extrabold font-mono">
                Current Balance: ৳{adjustingUser.balance.toLocaleString()}
              </p>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustType('credit')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  adjustType === 'credit'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400'
                }`}
              >
                + Credit (Deposit)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('debit')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  adjustType === 'debit' ? 'bg-rose-500 text-white' : 'text-slate-400'
                }`}
              >
                - Debit (Deduct)
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Amount (৳)
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="Enter amount e.g. 5000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustingUser(null)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAdjustment}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-extrabold"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      <PopupDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onClose={closePopup}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.type === 'confirm'}
      />
    </div>
  );
};
