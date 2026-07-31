import React, { useState, useEffect } from 'react';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { PhoneFrame } from './components/PhoneFrame';
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
import { INITIAL_WALLET_STATE, INITIAL_SYSTEM_USERS } from './data/mockData';
import { WalletState, Transaction, Contact, Currency, UserAccount } from './types';
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

  // Active Current User State (Default: null)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Biometric Security Policy Settings
  const [biometricThreshold, setBiometricThreshold] = useState<number>(1000);
  const [biometricRequired, setBiometricRequired] = useState<boolean>(true);

  // Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  useInactivityLogout(handleLogout, 5 * 60 * 1000);

  // Current View: 'home' | 'send' | 'add_money' | 'cash_out' | 'bill_pay' | 'transactions' | 'contacts' | 'profile' | 'notifications' | 'admin' | 'login' | 'signup' | 'forgot'
  const [currentView, setCurrentView] = useState<string>('login');
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [selectedRecipientForSend, setSelectedRecipientForSend] = useState<{
    name: string;
    phone: string;
    avatar?: string;
  } | null>(null);

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

  const handleBoostBalance = () => {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + 100, // or some amount to increase
    }));
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

  const handleRegisterUser = (newUser: UserAccount) => {
    setSystemUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUserCredentials = (emailOrPhone: string, newPass: string, newPin: string) => {
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

  const handleUpdatePin = (newPin: string) => {
    setWallet((prev) => ({
      ...prev,
      user: { ...prev.user, pin: newPin },
    }));
  };

  const handleUpdateCurrency = (curr: Currency) => {
    setWallet((prev) => ({ ...prev, currency: curr }));
  };

  const handleResetWallet = () => {
    setWallet(INITIAL_WALLET_STATE);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCurrentView('home');
  };

  const handleQuickAction = (key: string) => {
    if (key === 'send') {
      setSelectedRecipientForSend(null);
      setCurrentView('send');
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
    <PhoneFrame activeTabTitle={currentView}>
      <div className="flex-1 flex flex-col justify-between">
        {/* VIEW ROUTING */}
        {currentView === 'home' && (
          <div className="space-y-4 pb-4">
            {/* Top User Header & Balance */}
            <Header
              wallet={wallet}
              onToggleHideBalance={handleToggleHideBalance}
              onOpenNotifications={() => setCurrentView('notifications')}
              onOpenProfile={() => setCurrentView('profile')}
              onQuickSend={() => setCurrentView('send')}
              onBoostBalance={handleBoostBalance}
            />

            {/* Core Services Grid */}
            <QuickActions onAction={handleQuickAction} />

            {/* Quick Send Money Contact Avatars Banner */}
            <div className="px-4 py-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Quick Send
                </h3>
                <button
                  onClick={() => setCurrentView('contacts')}
                  className="text-[11px] text-emerald-400 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {wallet.contacts.map((contact) => (
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
                    className="flex flex-col items-center shrink-0 cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-emerald-400 transition"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-sm">
                        <Send className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-300 font-medium mt-1 truncate max-w-[64px] text-center">
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
            onLogout={() => {
              const defaultUser = systemUsers.find((u) => u.email === 'alex@gmail.com') || systemUsers[1];
              if (defaultUser) setCurrentUser(defaultUser);
              setCurrentView('home');
            }}
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
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            wallet={wallet}
            currentUser={currentUser}
            onUpdatePin={handleUpdatePin}
            onUpdateCurrency={handleUpdateCurrency}
            onResetWallet={handleResetWallet}
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
      </div>
    </PhoneFrame>
  );
}
