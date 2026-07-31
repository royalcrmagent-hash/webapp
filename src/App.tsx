import React, { useState, useEffect } from 'react';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { Header } from './components/Header';
import { QuickActions } from './components/QuickActions';
import { BottomNav } from './components/BottomNav';

import { SendMoneyView } from './components/views/SendMoneyView';
import { AddMoneyView } from './components/views/AddMoneyView';
import { CashOutView } from './components/views/CashOutView';
import { BillPayView } from './components/views/BillPayView';
import { TransactionHistoryView } from './components/views/TransactionHistoryView';
import { ContactsList } from './components/views/ContactsList';
import { ProfileView } from './components/views/ProfileView';
import { NotificationsView } from './components/views/NotificationsView';
import { QRScannerModal } from './components/views/QRScannerModal';
import { AuthModal } from './components/views/AuthModal';
import { LoginView } from './components/views/LoginView';
import { SignupView } from './components/views/SignupView';
import { ForgotPasswordView } from './components/views/ForgotPasswordView';
import { AdminPanel } from './components/views/AdminPanel';
import { VirtualCardsView } from './components/views/VirtualCardsView';
import { PopupDialog, DialogType } from './components/ui/PopupDialog';
import { INITIAL_WALLET_STATE, INITIAL_SYSTEM_USERS, INITIAL_VIRTUAL_CARDS } from './data/initialData';
import { WalletState, Transaction, Contact, Currency, UserAccount, VirtualCard, VirtualCardType } from './types';
import {
  Send,
  Sparkles,
  ChevronRight,
  History,
  ShieldCheck,
  PlusCircle,
  ArrowUpRight,
  Receipt,
  Smartphone,
  ShieldAlert,
  LogIn,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mobile_wallet_app_state_v1';
const LOCAL_STORAGE_USERS_KEY = 'mobile_wallet_system_users_v1';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'mobile_wallet_current_user_v1';
const LOCAL_STORAGE_VIRTUAL_CARDS_KEY = 'mobile_wallet_virtual_cards_v1';

export default function App() {
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local state:', e);
    }
    return INITIAL_WALLET_STATE;
  });

  // System Accounts State
  const [systemUsers, setSystemUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load system users:', e);
    }
    return INITIAL_SYSTEM_USERS;
  });

  // Active Current User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load current user:', e);
    }
    return null;
  });

  const [isBoosting, setIsBoosting] = useState<boolean>(false);
  const [boostMultiplier, setBoostMultiplier] = useState<number>(1);
  const [balanceHistory, setBalanceHistory] = useState<{ time: number; balance: number }[]>(() => [
    { time: Date.now() - 3000, balance: wallet.balance },
    { time: Date.now(), balance: wallet.balance },
  ]);

  useEffect(() => {
    if (wallet.balance <= 0 && isBoosting) {
      setIsBoosting(false);
    }
  }, [wallet.balance, isBoosting]);

  // Continuous boost effect based on nanosecond rate (approx 0.00000000000026746% per ns * multiplier)
  useEffect(() => {
    if (!isBoosting) return;
    if (wallet.balance <= 0) {
      setIsBoosting(false);
      return;
    }
    const interval = setInterval(() => {
      setWallet((prev) => {
        if (prev.balance <= 0) {
          setIsBoosting(false);
          return prev;
        }
        // Rate per ns: 2.6746e-13 % * multiplier
        const growthRatePerInterval = prev.balance * 0.00000013373 * boostMultiplier;
        const addAmount = prev.balance > 0 ? Math.max(0.01 * boostMultiplier, growthRatePerInterval) : 0;
        if (addAmount <= 0 || prev.balance <= 0) {
          setIsBoosting(false);
          return prev;
        }
        const newBalance = prev.balance + addAmount;

        setBalanceHistory((hist) => {
          const updated = [...hist, { time: Date.now(), balance: newBalance }];
          if (updated.length > 50) updated.shift();
          return updated;
        });

        return {
          ...prev,
          balance: newBalance,
        };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isBoosting, boostMultiplier, wallet.balance]);

  // Biometric Security Policy Settings
  const [biometricThreshold, setBiometricThreshold] = useState<number>(1000);
  const [biometricRequired, setBiometricRequired] = useState<boolean>(true);

  // Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    try {
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    setCurrentView('login');
  };

  useInactivityLogout(handleLogout, 5 * 60 * 1000);

  // Current View: 'home' | 'send' | 'add_money' | 'cash_out' | 'bill_pay' | 'transactions' | 'contacts' | 'profile' | 'notifications' | 'admin' | 'login' | 'signup' | 'forgot'
  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.role === 'admin' ? 'admin' : 'home';
      }
    } catch (e) {
      // ignore
    }
    return 'login';
  });
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [selectedRecipientForSend, setSelectedRecipientForSend] = useState<{
    name: string;
    phone: string;
    avatar?: string;
  } | null>(null);

  // Virtual Cards State
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VIRTUAL_CARDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_VIRTUAL_CARDS;
  });

  const [selectedCardTypeFilter, setSelectedCardTypeFilter] = useState<VirtualCardType | 'all'>('all');

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

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_VIRTUAL_CARDS_KEY, JSON.stringify(virtualCards));
    } catch (e) {
      // ignore
    }
  }, [virtualCards]);

  const handleIssueVirtualCard = (newCard: VirtualCard, initialDeposit: number) => {
    setVirtualCards((prev) => [newCard, ...prev]);

    if (initialDeposit > 0) {
      const newTx: Transaction = {
        id: `TX-VC-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'bill_pay',
        title: `Issued ${newCard.cardName}`,
        recipientName: newCard.cardName,
        recipientPhone: newCard.cardNumber.slice(-4),
        amount: initialDeposit,
        fee: 0,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        category: 'Cards',
      };

      setWallet((prev) => ({
        ...prev,
        balance: prev.balance - initialDeposit,
        transactions: [newTx, ...prev.transactions],
      }));
    }
  };

  const handleTopUpVirtualCard = (cardId: string, amount: number) => {
    setVirtualCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, balance: c.balance + amount } : c))
    );

    const card = virtualCards.find((c) => c.id === cardId);
    const newTx: Transaction = {
      id: `TX-VC-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'sent',
      title: `Top-Up ${card?.cardName || 'Virtual Card'}`,
      recipientName: card?.cardName || 'Virtual Card',
      recipientPhone: card?.cardNumber.slice(-4) || 'CARD',
      amount: amount,
      fee: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      category: 'Cards',
    };

    setWallet((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const handleWithdrawVirtualCard = (cardId: string, amount: number) => {
    setVirtualCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, balance: c.balance - amount } : c))
    );

    const card = virtualCards.find((c) => c.id === cardId);
    const newTx: Transaction = {
      id: `TX-VC-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'cash_in',
      title: `Refund from ${card?.cardName || 'Virtual Card'}`,
      recipientName: card?.cardName || 'Virtual Card',
      recipientPhone: card?.cardNumber.slice(-4) || 'CARD',
      amount: amount,
      fee: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      category: 'Cards',
    };

    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const handleToggleFreezeVirtualCard = (cardId: string) => {
    setVirtualCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  const handleDeleteVirtualCard = (cardId: string) => {
    setVirtualCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Load database from Vercel Cloud Server API
  useEffect(() => {
    async function loadServerDB() {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.db) {
            if (Array.isArray(data.db.systemUsers) && data.db.systemUsers.length > 0) {
              setSystemUsers(data.db.systemUsers);
            }
            if (Array.isArray(data.db.contacts)) {
              setWallet((prev) => ({ ...prev, contacts: data.db.contacts }));
            }
            if (Array.isArray(data.db.transactions)) {
              setWallet((prev) => ({ ...prev, transactions: data.db.transactions }));
            }
            if (Array.isArray(data.db.notifications)) {
              setWallet((prev) => ({ ...prev, notifications: data.db.notifications }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load DB from Vercel server:', err);
      }
    }
    loadServerDB();
  }, []);

  // Save wallet state on updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallet));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [wallet]);

  // Save system users on updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(systemUsers));
    } catch (e) {
      console.error('Failed to save system users:', e);
    }
  }, [systemUsers]);

  // Sync to Vercel Server Database whenever users, contacts, transactions change
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemUsers,
            contacts: wallet.contacts,
            transactions: wallet.transactions,
            notifications: wallet.notifications,
          }),
        });
      } catch (e) {
        console.error('Error syncing data with Vercel server:', e);
      }
    };
    syncWithServer();
  }, [systemUsers, wallet.contacts, wallet.transactions, wallet.notifications]);

  // Save current user on updates
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save current user:', e);
    }
  }, [currentUser]);

  const handleBoostBalance = () => {
    if (wallet.balance <= 0) {
      setIsBoosting(false);
      openPopup('Insufficient Balance', "You don't have sufficient balance", 'warning');
      return;
    }
    setIsBoosting((prev) => !prev);
  };

  // Handlers
  const handleToggleHideBalance = () => {
    setWallet((prev) => ({ ...prev, hideBalance: !prev.hideBalance }));
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setWallet((prev) => ({
        ...prev,
        balance: user.balance,
        user: {
          name: user.name,
          phone: user.phone,
          accountNo: user.accountNo,
          avatar: user.avatar || prev.user.avatar,
          pin: user.pin,
        },
      }));
      setCurrentView('home');
    }
  };

  const handleRegisterUser = async (newUser: UserAccount) => {
    setSystemUsers((prev) => [newUser, ...prev]);
    try {
      await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    } catch (e) {
      console.error('Failed to register user on server:', e);
    }
  };

  const handleUpdateUserCredentials = async (emailOrPhone: string, newPass: string, newPin: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (
          u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          u.phone === emailOrPhone
        ) {
          return { ...u, password: newPass, pin: newPin };
        }
        return u;
      })
    );

    try {
      await fetch('/api/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, newPass, newPin }),
      });
    } catch (e) {
      console.error('Failed to update credentials on server:', e);
    }
  };

  const handleSendMoneySuccess = (txn: Transaction, newBalance: number) => {
    const newNotif = {
      id: `n_${Date.now()}`,
      title: 'Send Money Successful',
      message: `Sent ${wallet.currency}${txn.amount.toLocaleString()} to ${txn.recipientName} (${txn.recipientPhone}). ID: ${txn.id}`,
      time: 'Just now',
      read: false,
      type: 'transaction' as const,
    };

    setWallet((prev) => ({
      ...prev,
      balance: newBalance,
      transactions: [txn, ...prev.transactions],
      notifications: [newNotif, ...prev.notifications],
    }));

    // Update balance in system users list
    setSystemUsers((prev) =>
      prev.map((u) => {
        if ((currentUser && u.id === currentUser.id) || u.phone === wallet.user.phone) {
          return { ...u, balance: newBalance };
        }
        return u;
      })
    );
  };

  const handleAddMoneySuccess = (txn: Transaction, newBalance: number) => {
    const newNotif = {
      id: `n_${Date.now()}`,
      title: 'Add Money Successful',
      message: `Added ${wallet.currency}${txn.amount.toLocaleString()} to your wallet.`,
      time: 'Just now',
      read: false,
      type: 'transaction' as const,
    };

    setWallet((prev) => ({
      ...prev,
      balance: newBalance,
      transactions: [txn, ...prev.transactions],
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  const handleCashOutSuccess = (txn: Transaction, newBalance: number) => {
    setWallet((prev) => ({
      ...prev,
      balance: newBalance,
      transactions: [txn, ...prev.transactions],
    }));
  };

  const handleUpdateTransactionCategory = (txnId: string, newCategory: string) => {
    setWallet((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === txnId ? { ...t, category: newCategory } : t
      ),
    }));
  };

  const handleBillPaySuccess = (txn: Transaction, newBalance: number) => {
    setWallet((prev) => ({
      ...prev,
      balance: newBalance,
      transactions: [txn, ...prev.transactions],
    }));
  };

  const handleAddContact = (newContact: Contact) => {
    setWallet((prev) => ({
      ...prev,
      contacts: [newContact, ...prev.contacts],
    }));
  };

  const handleDeleteContact = (contactId: string) => {
    setWallet((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== contactId),
    }));
  };

  const handleUpdatePin = (newPin: string) => {
    setWallet((prev) => ({
      ...prev,
      user: { ...prev.user, pin: newPin },
    }));
  };

  const handleUpdateCurrency = (curr: Currency) => {
    setWallet((prev) => ({ ...prev, currency: curr }));
  };

  const handleQuickAction = (key: string) => {
    if (key === 'send') {
      setSelectedRecipientForSend(null);
      setCurrentView('send');
    }
    else if (key === 'virtual_visa') {
      setSelectedCardTypeFilter('visa');
      setCurrentView('virtual_cards');
    }
    else if (key === 'mastercard') {
      setSelectedCardTypeFilter('mastercard');
      setCurrentView('virtual_cards');
    }
    else if (key === 'amex_card') {
      setSelectedCardTypeFilter('amex');
      setCurrentView('virtual_cards');
    }
    else if (key === 'virtual_cards') {
      setSelectedCardTypeFilter('all');
      setCurrentView('virtual_cards');
    }
    else if (key === 'boost') {
      if (wallet.balance <= 0) {
        openPopup('Insufficient Balance', "You don't have sufficient balance", 'warning');
        return;
      }
      handleBoostBalance();
    }
    else if (key === 'add_money') setCurrentView('add_money');
    else if (key === 'cash_out') setCurrentView('cash_out');
    else if (key === 'bill_pay') setCurrentView('bill_pay');
    else if (key === 'qr_code') setShowQRScanner(true);
    else if (key === 'recharge' || key === 'bank_transfer' || key === 'request_money') {
      setSelectedRecipientForSend(null);
      setCurrentView('send');
    }
  };

  const handleBottomTabChange = (tab: string) => {
    if (tab === 'qr') {
      setShowQRScanner(true);
    } else {
      setCurrentView(tab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-2xl mx-auto shadow-2xl relative">
      <div className="flex-1 flex flex-col justify-between pb-4">
        {/* VIEW ROUTING */}
        {currentView === 'home' && (
          <div className="space-y-4 pb-4">
            {/* Top User Header & Balance */}
            <Header
              wallet={wallet}
              onToggleHideBalance={handleToggleHideBalance}
              onOpenNotifications={() => setCurrentView('notifications')}
              onOpenProfile={() => setCurrentView('profile')}
            />

            {/* Core Services Grid */}
            <QuickActions onAction={handleQuickAction} isBoosting={isBoosting} />

            {/* Quick Send Money Contact Avatars Banner */}
            <div className="px-4 py-3 my-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl mx-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QUICK SEND</span>
                </h3>
                <button
                  onClick={() => setCurrentView('contacts')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 items-center justify-items-center">
                {wallet.contacts.slice(0, 5).map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedRecipientForSend({
                        name: contact.name,
                        phone: contact.phone,
                        avatar: contact.avatar,
                      });
                      setCurrentView('send');
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=10b981&color=020617&font-size=0.45&bold=true`;
                        }}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-emerald-400 group-hover:scale-105 transition-all shadow-md"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-sm ring-2 ring-slate-950">
                        <Send className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 mt-1.5 truncate max-w-[64px] text-center">
                      {contact.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Feed */}
            <div className="px-4 py-1">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Recent Activity
                </h3>
                <button
                  onClick={() => setCurrentView('transactions')}
                  className="text-[11px] text-emerald-400 font-semibold hover:underline"
                >
                  See History
                </button>
              </div>

              <div className="space-y-2">
                {wallet.transactions.slice(0, 4).map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => setCurrentView('transactions')}
                    className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {txn.type === 'sent' ? (
                          <Send className="w-4 h-4 text-emerald-400" />
                        ) : txn.type === 'received' ? (
                          <PlusCircle className="w-4 h-4 text-indigo-400" />
                        ) : txn.type === 'cash_in' ? (
                          <PlusCircle className="w-4 h-4 text-teal-400" />
                        ) : txn.type === 'cash_out' ? (
                          <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Receipt className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{txn.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          {txn.recipientName} • <span className="font-mono">{txn.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold ${
                          txn.type === 'sent' || txn.type === 'cash_out' || txn.type === 'bill_pay'
                            ? 'text-slate-100'
                            : 'text-emerald-400'
                        }`}
                      >
                        {txn.type === 'sent' || txn.type === 'cash_out' || txn.type === 'bill_pay'
                          ? '-'
                          : '+'}
                        {wallet.currency}
                        {txn.amount.toLocaleString()}
                      </span>
                      <p className="text-[10px] font-mono text-slate-500">{txn.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'send' && (
          <SendMoneyView
            wallet={wallet}
            systemUsers={systemUsers}
            onBack={() => {
              setSelectedRecipientForSend(null);
              setCurrentView('home');
            }}
            onSendSuccess={handleSendMoneySuccess}
            initialRecipient={selectedRecipientForSend}
            biometricThreshold={biometricThreshold}
            biometricRequired={biometricRequired}
          />
        )}

        {currentView === 'admin' && currentUser && (
          <AdminPanel
            currentUser={currentUser}
            systemUsers={systemUsers}
            transactions={wallet.transactions}
            biometricThreshold={biometricThreshold}
            biometricRequired={biometricRequired}
            onUpdateUsers={(updated) => setSystemUsers(updated)}
            onUpdateBiometricSettings={(threshold, required) => {
              setBiometricThreshold(threshold);
              setBiometricRequired(required);
            }}
            onSwitchToUserWallet={() => setCurrentView('home')}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'add_money' && (
          <AddMoneyView
            wallet={wallet}
            onBack={() => setCurrentView('home')}
            onAddMoneySuccess={handleAddMoneySuccess}
          />
        )}

        {currentView === 'cash_out' && (
          <CashOutView
            wallet={wallet}
            onBack={() => setCurrentView('home')}
            onCashOutSuccess={handleCashOutSuccess}
          />
        )}

        {currentView === 'bill_pay' && (
          <BillPayView
            wallet={wallet}
            onBack={() => setCurrentView('home')}
            onBillPaySuccess={handleBillPaySuccess}
          />
        )}

        {currentView === 'virtual_cards' && (
          <VirtualCardsView
            wallet={wallet}
            cards={virtualCards}
            initialSelectedType={selectedCardTypeFilter}
            onBack={() => setCurrentView('home')}
            onIssueCard={handleIssueVirtualCard}
            onTopUpCard={handleTopUpVirtualCard}
            onWithdrawCard={handleWithdrawVirtualCard}
            onToggleFreezeCard={handleToggleFreezeVirtualCard}
            onDeleteCard={handleDeleteVirtualCard}
          />
        )}

        {currentView === 'transactions' && (
          <TransactionHistoryView
            wallet={wallet}
            onUpdateCategory={handleUpdateTransactionCategory}
          />
        )}

        {currentView === 'contacts' && (
          <ContactsList
            wallet={wallet}
            onSelectContactForSend={(c) => {
              setSelectedRecipientForSend({
                name: c.name,
                phone: c.phone,
                avatar: c.avatar,
              });
              setCurrentView('send');
            }}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            wallet={wallet}
            currentUser={currentUser}
            onUpdatePin={handleUpdatePin}
            onUpdateCurrency={handleUpdateCurrency}
            onLogout={handleLogout}
            onOpenAuthModal={(mode) => {
              setAuthInitialMode(mode || 'login');
              setShowAuthModal(true);
            }}
            onNavigateToView={(view) => setCurrentView(view)}
            onOpenAdminPanel={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'login' && (
          <LoginView
            systemUsers={systemUsers}
            onLoginSuccess={handleLoginSuccess}
            onGoToSignup={() => setCurrentView('signup')}
            onGoToForgotPassword={() => setCurrentView('forgot')}
          />
        )}

        {currentView === 'signup' && (
          <SignupView
            systemUsers={systemUsers}
            onRegisterUser={handleRegisterUser}
            onGoToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'forgot' && (
          <ForgotPasswordView
            systemUsers={systemUsers}
            onUpdateUserCredentials={handleUpdateUserCredentials}
            onGoToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsView
            notifications={wallet.notifications}
            onBack={() => setCurrentView('home')}
            onMarkAllRead={() => {
              setWallet((prev) => ({
                ...prev,
                notifications: prev.notifications.map((n) => ({ ...n, read: true })),
              }));
            }}
          />
        )}

        {/* BOTTOM NAVIGATION BAR */}
        {!['admin', 'login', 'signup', 'forgot'].includes(currentView) && (
          <BottomNav activeTab={currentView} onTabChange={handleBottomTabChange} />
        )}

        {/* QR SCANNER MODAL */}
        {showQRScanner && (
          <QRScannerModal
            onClose={() => setShowQRScanner(false)}
            onScanSuccess={(merchantName, merchantPhone) => {
              setShowQRScanner(false);
              setSelectedRecipientForSend({
                name: merchantName,
                phone: merchantPhone,
              });
              setCurrentView('send');
            }}
          />
        )}

        {/* AUTHENTICATION MODAL (LOGIN / SIGNUP / FORGOT PASSWORD) */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          systemUsers={systemUsers}
          onLoginSuccess={handleLoginSuccess}
          onRegisterUser={handleRegisterUser}
          onUpdateUserCredentials={handleUpdateUserCredentials}
          initialMode={authInitialMode}
        />

        <PopupDialog
          isOpen={dialogState.isOpen}
          type={dialogState.type}
          title={dialogState.title}
          message={dialogState.message}
          onClose={closePopup}
        />
      </div>
    </div>
  );
}
