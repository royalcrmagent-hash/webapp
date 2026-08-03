import React, { useState, useMemo } from 'react';
import {
  UserAccount,
  Transaction,
  AppNotification,
  AuditLogEntry,
  SystemFeeConfig,
  SystemLimits,
  UserDevice,
  LoginHistoryEntry,
  SecurityAlert,
  UserCustomRule,
  AdminNote,
  SupportTicket,
} from '../../types';
import {
  Users,
  ShieldAlert,
  Wallet,
  Activity,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Sliders,
  X,
  CreditCard,
  Receipt,
  Download,
  Bell,
  Eye,
  Key,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  History,
  AlertTriangle,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  Tag,
  Filter,
  FileText,
  LifeBuoy,
  Plus,
  Trash2,
  Cpu,
  Database,
  Radio,
  Check,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PopupDialog, DialogType } from '../ui/PopupDialog';

interface AdminPanelProps {
  currentUser: UserAccount;
  systemUsers: UserAccount[];
  transactions: Transaction[];
  notifications?: AppNotification[];
  auditLogs?: AuditLogEntry[];
  biometricThreshold: number;
  biometricRequired: boolean;
  recaptchaEnabled: boolean;
  onUpdateUsers: (users: UserAccount[]) => void;
  onUpdateTransactions?: (transactions: Transaction[]) => void;
  onUpdateNotifications?: (notifications: AppNotification[]) => void;
  onAddAuditLog?: (log: AuditLogEntry) => void;
  onUpdateBiometricSettings: (threshold: number, required: boolean) => void;
  onUpdateRecaptchaSettings: (enabled: boolean) => void;
  onSwitchToUserApp: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  systemUsers,
  transactions,
  notifications = [],
  auditLogs = [],
  biometricThreshold,
  biometricRequired,
  recaptchaEnabled,
  onUpdateUsers,
  onUpdateTransactions,
  onUpdateNotifications,
  onAddAuditLog,
  onUpdateBiometricSettings,
  onUpdateRecaptchaSettings,
  onSwitchToUserApp,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'transactions'
    | 'fraud'
    | 'devices'
    | 'rules'
    | 'tickets'
    | 'settings'
    | 'audit'
    | 'notifications'
  >('dashboard');

  // Popup Dialog State
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

  // Internal Audit Logs State
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLogEntry[]>(
    auditLogs.length > 0
      ? auditLogs
      : [
          {
            id: 'log_init',
            adminEmail: currentUser.email || 'admin@paypulse.com',
            adminName: currentUser.name || 'System Admin',
            action: 'SYSTEM_BOOTSTRAP',
            details: 'PayPulse Admin Console active with 360° User Control.',
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        ]
  );

  const recordAuditLog = (
    action: string,
    details: string,
    targetUserId?: string,
    targetUserName?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      adminEmail: currentUser.email || 'admin@paypulse.com',
      adminName: currentUser.name || 'System Admin',
      action,
      details,
      targetUserId,
      targetUserName,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setLocalAuditLogs((prev) => [newEntry, ...prev]);
    if (onAddAuditLog) {
      onAddAuditLog(newEntry);
    }
  };

  // --- MOCK INITIAL SECURITY DATA & MONITORING ---
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: 'alert_1',
      userId: systemUsers[0]?.id || 'usr_1',
      userName: systemUsers[0]?.name || 'Alex Morgan',
      severity: 'HIGH',
      type: 'NIGHT_TRANSACTION',
      message: 'Unusual transaction of $1,500.00 attempted at 02:45 AM.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      resolved: false,
    },
    {
      id: 'alert_2',
      userId: systemUsers[1]?.id || 'usr_2',
      userName: systemUsers[1]?.name || 'Sarah Jenkins',
      severity: 'CRITICAL',
      type: 'IMPOSSIBLE_TRAVEL',
      message: 'Login from Dhaka & Chittagong within 15 minutes. Potential VPN/Proxy.',
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      resolved: false,
    },
    {
      id: 'alert_3',
      userId: systemUsers[2]?.id || 'usr_3',
      userName: systemUsers[2]?.name || 'Michael Chang',
      severity: 'MEDIUM',
      type: 'FAILED_PIN',
      message: '3 consecutive failed PIN attempts detected.',
      timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
      resolved: true,
    },
  ]);

  const [activeDevices, setActiveDevices] = useState<UserDevice[]>([
    {
      id: 'dev_1',
      userId: systemUsers[0]?.id || 'usr_1',
      deviceName: 'Samsung Galaxy S23 Ultra',
      deviceModel: 'SM-S918B',
      os: 'Android 14',
      browser: 'PayPulse App v2.4',
      ip: '103.114.12.88',
      lastSeen: '2 mins ago',
      isTrusted: true,
      isRooted: false,
      isEmulator: false,
    },
    {
      id: 'dev_2',
      userId: systemUsers[1]?.id || 'usr_2',
      deviceName: 'iPhone 15 Pro Max',
      deviceModel: 'A3106',
      os: 'iOS 17.4',
      browser: 'Safari 17.2',
      ip: '203.88.192.4',
      lastSeen: '15 mins ago',
      isTrusted: false,
      isRooted: true,
      isEmulator: false,
    },
    {
      id: 'dev_3',
      userId: systemUsers[2]?.id || 'usr_3',
      deviceName: 'Windows PC (Chrome)',
      deviceModel: 'Custom Workstation',
      os: 'Windows 11',
      browser: 'Chrome 122.0',
      ip: '45.112.8.19',
      lastSeen: '1 hour ago',
      isTrusted: true,
      isRooted: false,
      isEmulator: false,
    },
  ]);

  const [customRules, setCustomRules] = useState<UserCustomRule[]>([
    {
      id: 'rule_1',
      userId: 'global',
      userName: 'Global Rule',
      ruleName: 'Night-time High Amount Hold',
      ruleType: 'REQUIRE_APPROVAL',
      conditionSummary: 'Cash Out / Send > $5,000 between 12:00 AM - 06:00 AM',
      actionSummary: 'Hold transaction for 30 minutes and notify admin',
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    },
    {
      id: 'rule_2',
      userId: systemUsers[0]?.id || 'usr_1',
      userName: systemUsers[0]?.name || 'Alex Morgan',
      ruleName: 'VIP Extended Daily Limit',
      ruleType: 'LIMIT',
      conditionSummary: 'Daily limit increased to $100,000 for VIP account',
      actionSummary: 'Bypass default daily limit checks',
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'TK-1001',
      userId: systemUsers[0]?.id || 'usr_1',
      userName: systemUsers[0]?.name || 'Alex Morgan',
      userPhone: systemUsers[0]?.phone || '01700000000',
      subject: 'Transaction failed but balance deducted',
      category: 'Billing / Wallet',
      priority: 'HIGH',
      status: 'OPEN',
      lastUpdated: '10 mins ago',
      createdAt: new Date().toISOString().slice(0, 10),
    },
    {
      id: 'TK-1002',
      userId: systemUsers[1]?.id || 'usr_2',
      userName: systemUsers[1]?.name || 'Sarah Jenkins',
      userPhone: systemUsers[1]?.phone || '01800000000',
      subject: 'Request to reset PIN after forgotten code',
      category: 'Security / PIN',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      lastUpdated: '1 hour ago',
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ]);

  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([
    {
      id: 'note_1',
      userId: systemUsers[0]?.id || 'usr_1',
      adminName: currentUser.name || 'System Admin',
      note: 'Verified NID manually via video call. High trust client.',
      noteType: 'VIP',
      isPinned: true,
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ]);

  // User Risk Tags state
  const [userTagsMap, setUserTagsMap] = useState<Record<string, string[]>>({
    [systemUsers[0]?.id || 'usr_1']: ['VIP', 'Verified'],
    [systemUsers[1]?.id || 'usr_2']: ['High Risk', 'VPN Suspect'],
  });

  // --- 👥 USER MANAGEMENT STATE ---
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'frozen'>('all');
  const [userKycFilter, setUserKycFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'unverified'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [userTagFilter, setUserTagFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 8;

  // 360° Detailed Modal State
  const [deepUserDetail, setDeepUserDetail] = useState<UserAccount | null>(null);
  const [activeProfileSubTab, setActiveProfileSubTab] = useState<'overview' | 'activity' | 'devices' | 'location' | 'rules' | 'notes'>('overview');
  const [newAdminNoteText, setNewAdminNoteText] = useState('');
  const [newAdminNoteType, setNewAdminNoteType] = useState<'GENERAL' | 'SECURITY' | 'VIP' | 'WARNING'>('GENERAL');
  const [newTagInput, setNewTagInput] = useState('');

  // Balance adjustment modal state
  const [adjustingUser, setAdjustingUser] = useState<UserAccount | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustNote, setAdjustNote] = useState('');

  // Password / PIN reset modal state
  const [resetUser, setResetUser] = useState<UserAccount | null>(null);
  const [newPasskey, setNewPasskey] = useState('123456');
  const [newCode, setNewCode] = useState('1234');

  // --- 💳 TRANSACTION MANAGEMENT STATE ---
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all');
  const [txDateRange, setTxDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // --- ⚙️ SYSTEM SETTINGS STATE ---
  const [feeConfig, setFeeConfig] = useState<SystemFeeConfig>({
    sendMoneyFeePercent: 1.5,
    cashOutFeePercent: 1.85,
    billPayFeeFlat: 5.0,
    minFee: 1.0,
    maxFee: 100.0,
  });

  const [systemLimits, setSystemLimits] = useState<SystemLimits>({
    dailyTxLimit: 50000,
    maxTxAmount: 25000,
    minTxAmount: 10,
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('System is currently undergoing routine maintenance. Please check back shortly.');

  // Database test state
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{
    success: boolean;
    message: string;
    type?: string;
    latency?: string;
  } | null>(null);

  // --- 📢 NOTIFICATION BROADCAST STATE ---
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'system' | 'promo' | 'transaction'>('system');
  const [notifTargetUser, setNotifTargetUser] = useState<string>('all');

  // --- 📊 METRICS & COMPUTATIONS ---
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), []);

  const totalLiquidity = useMemo(() => systemUsers.reduce((sum, u) => sum + (u.balance || 0), 0), [systemUsers]);

  const newUsersToday = useMemo(() => {
    return systemUsers.filter((u) => {
      if (!u.createdAt) return false;
      return u.createdAt.startsWith(new Date().toISOString().slice(0, 10));
    }).length;
  }, [systemUsers]);

  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === todayStr || t.date?.includes(todayStr));
  }, [transactions, todayStr]);

  const todayRevenue = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + (t.fee || 0), 0);
  }, [todayTransactions]);

  // Chart data preparation (Last 7 Days volume & fees)
  const chartData = useMemo(() => {
    const days: { [key: string]: { day: string; volume: number; fees: number; count: number } } = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      days[dayLabel] = { day: dayLabel, volume: 0, fees: 0, count: 0 };
    }

    transactions.forEach((t) => {
      const txDate = new Date(t.date || Date.now());
      const dayLabel = txDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (days[dayLabel]) {
        days[dayLabel].volume += t.amount || 0;
        days[dayLabel].fees += t.fee || 0;
        days[dayLabel].count += 1;
      }
    });

    return Object.values(days);
  }, [transactions]);

  // Dynamic Risk Score Calculator for User
  const computeUserRiskScore = (user: UserAccount) => {
    let score = 85; // Default healthy baseline
    if (user.kycStatus === 'approved') score += 10;
    if (user.kycStatus === 'rejected') score -= 20;
    if (user.isFrozen) score -= 30;

    const userAlerts = securityAlerts.filter((a) => a.userId === user.id && !a.resolved);
    score -= userAlerts.length * 15;

    const tags = userTagsMap[user.id] || [];
    if (tags.includes('VIP')) score += 10;
    if (tags.includes('High Risk')) score -= 25;

    return Math.max(5, Math.min(100, score));
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return systemUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.phone.includes(userSearch) ||
        user.profileId.toLowerCase().includes(userSearch.toLowerCase());

      const matchesStatus =
        userStatusFilter === 'all'
          ? true
          : userStatusFilter === 'frozen'
          ? user.isFrozen
          : !user.isFrozen;

      const matchesKyc =
        userKycFilter === 'all'
          ? true
          : (user.kycStatus || 'unverified') === userKycFilter;

      const matchesRole =
        userRoleFilter === 'all' ? true : user.role === userRoleFilter;

      const tags = userTagsMap[user.id] || [];
      const matchesTag =
        userTagFilter === 'all' ? true : tags.includes(userTagFilter);

      return matchesSearch && matchesStatus && matchesKyc && matchesRole && matchesTag;
    });
  }, [systemUsers, userSearch, userStatusFilter, userKycFilter, userRoleFilter, userTagFilter, userTagsMap]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, userPage]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        (t.id && t.id.toLowerCase().includes(txSearch.toLowerCase())) ||
        (t.recipientName && t.recipientName.toLowerCase().includes(txSearch.toLowerCase())) ||
        (t.recipientPhone && t.recipientPhone.includes(txSearch)) ||
        (t.reference && t.reference.toLowerCase().includes(txSearch.toLowerCase()));

      const matchesType = txTypeFilter === 'all' ? true : t.type === txTypeFilter;
      const matchesStatus = txStatusFilter === 'all' ? true : t.status === txStatusFilter;

      let matchesDate = true;
      if (txDateRange === 'today') {
        matchesDate = t.date === todayStr || t.date?.includes(todayStr);
      } else if (txDateRange === '7days') {
        const txTime = new Date(t.date || Date.now()).getTime();
        matchesDate = Date.now() - txTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (txDateRange === '30days') {
        const txTime = new Date(t.date || Date.now()).getTime();
        matchesDate = Date.now() - txTime <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [transactions, txSearch, txTypeFilter, txStatusFilter, txDateRange, todayStr]);

  // Audit Logs Filtered
  const [auditSearch, setAuditSearch] = useState('');
  const filteredAuditLogs = useMemo(() => {
    return localAuditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.adminName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.targetUserName && log.targetUserName.toLowerCase().includes(auditSearch.toLowerCase()))
    );
  }, [localAuditLogs, auditSearch]);

  // --- HANDLERS ---

  // User Actions
  const handleToggleFreeze = (user: UserAccount) => {
    const updatedUsers = systemUsers.map((u) => {
      if (u.id === user.id || u.profileId === user.profileId) {
        return { ...u, isFrozen: !u.isFrozen };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    const action = !user.isFrozen ? 'USER_BLOCKED' : 'USER_UNBLOCKED';
    recordAuditLog(action, `Account ${!user.isFrozen ? 'frozen/blocked' : 'unfrozen/unblocked'}.`, user.id, user.name);

    openPopup(
      'Account Status Updated',
      `User ${user.name} has been ${!user.isFrozen ? 'Blocked/Frozen' : 'Unblocked/Activated'} successfully.`,
      !user.isFrozen ? 'warning' : 'success'
    );
  };

  const handleUpdateKyc = (user: UserAccount, status: 'approved' | 'rejected' | 'pending') => {
    const updatedUsers = systemUsers.map((u) => {
      if (u.id === user.id || u.profileId === user.profileId) {
        return { ...u, kycStatus: status };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    recordAuditLog('KYC_STATUS_UPDATE', `KYC status set to ${status.toUpperCase()}.`, user.id, user.name);

    if (deepUserDetail && deepUserDetail.id === user.id) {
      setDeepUserDetail((prev) => prev ? ({ ...prev, kycStatus: status }) : null);
    }

    openPopup('KYC Verification Updated', `KYC for ${user.name} is now ${status.toUpperCase()}.`, 'success');
  };

  const handleAddTagToUser = (userId: string, tag: string) => {
    if (!tag.trim()) return;
    const currentTags = userTagsMap[userId] || [];
    if (!currentTags.includes(tag.trim())) {
      const updated = { ...userTagsMap, [userId]: [...currentTags, tag.trim()] };
      setUserTagsMap(updated);
      recordAuditLog('USER_TAG_ADDED', `Added tag "${tag.trim()}" to user.`, userId);
    }
    setNewTagInput('');
  };

  const handleRemoveTagFromUser = (userId: string, tagToRemove: string) => {
    const currentTags = userTagsMap[userId] || [];
    const updated = { ...userTagsMap, [userId]: currentTags.filter((t) => t !== tagToRemove) };
    setUserTagsMap(updated);
    recordAuditLog('USER_TAG_REMOVED', `Removed tag "${tagToRemove}" from user.`, userId);
  };

  const handleAddAdminNote = (userId: string) => {
    if (!newAdminNoteText.trim()) return;
    const newNote: AdminNote = {
      id: `note_${Date.now()}`,
      userId,
      adminName: currentUser.name || 'Admin',
      note: newAdminNoteText,
      noteType: newAdminNoteType,
      isPinned: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAdminNotes((prev) => [newNote, ...prev]);
    recordAuditLog('ADMIN_NOTE_ADDED', `Note added: "${newAdminNoteText.slice(0, 30)}..."`, userId);
    setNewAdminNoteText('');
  };

  const handleForceLogoutSession = (userId: string, devName?: string) => {
    setActiveDevices((prev) => prev.filter((d) => d.userId !== userId || (devName && d.deviceName !== devName)));
    recordAuditLog('FORCE_LOGOUT_EXECUTED', `Terminated active sessions for user device: ${devName || 'All Devices'}`, userId);
    openPopup('Sessions Terminated', `Active device sessions have been killed for user.`, 'success');
  };

  const handleConfirmAdjustBalance = () => {
    if (!adjustingUser) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      openPopup('Invalid Amount', 'Please enter a valid balance adjustment amount.', 'warning');
      return;
    }
    if (!adjustNote.trim()) {
      openPopup('Audit Note Required', 'Please provide a reason/note for this manual balance adjustment.', 'warning');
      return;
    }

    const updatedUsers = systemUsers.map((u) => {
      if (u.id === adjustingUser.id || u.profileId === adjustingUser.profileId) {
        const newBal = adjustType === 'credit' ? u.balance + amountNum : Math.max(0, u.balance - amountNum);
        return { ...u, balance: newBal };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    recordAuditLog(
      `BALANCE_${adjustType.toUpperCase()}`,
      `Manual ${adjustType} of $${amountNum.toFixed(2)}. Note: "${adjustNote}"`,
      adjustingUser.id,
      adjustingUser.name
    );

    setAdjustingUser(null);
    setAdjustAmount('');
    setAdjustNote('');

    openPopup(
      'Balance Adjusted Successfully',
      `Updated balance for ${adjustingUser.name} (${adjustType === 'credit' ? '+' : '-'}$${amountNum.toFixed(2)}).`,
      'success'
    );
  };

  const handleConfirmResetCredentials = () => {
    if (!resetUser) return;
    const updatedUsers = systemUsers.map((u) => {
      if (u.id === resetUser.id || u.profileId === resetUser.profileId) {
        return { ...u, passkey: newPasskey, code: newCode };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    recordAuditLog('SECURITY_RESET', `Passkey/PIN reset for user. Passkey: ${newPasskey}, PIN: ${newCode}`, resetUser.id, resetUser.name);

    setResetUser(null);
    openPopup(
      'Security Credentials Reset',
      `Credentials for ${resetUser.name} reset to Passkey: ${newPasskey} & PIN: ${newCode}.`,
      'success'
    );
  };

  // Transaction Actions
  const handleReverseTransaction = (tx: Transaction) => {
    openPopup(
      'Reverse Transaction Confirmation',
      `Are you sure you want to reverse Transaction ${tx.id} of $${tx.amount.toFixed(2)}? This will refund the amount to the user balance.`,
      'warning',
      () => {
        const updatedTxs = transactions.map((t) => (t.id === tx.id ? { ...t, status: 'reversed' as const } : t));
        if (onUpdateTransactions) {
          onUpdateTransactions(updatedTxs);
        }

        const targetUser = systemUsers.find((u) => u.profileId === tx.userId || u.id === tx.userId);
        if (targetUser) {
          const updatedUsers = systemUsers.map((u) =>
            u.profileId === targetUser.profileId ? { ...u, balance: u.balance + tx.amount } : u
          );
          onUpdateUsers(updatedUsers);
        }

        recordAuditLog('TRANSACTION_REVERSED', `Transaction ${tx.id} reversed and $${tx.amount.toFixed(2)} refunded.`, tx.userId, tx.recipientName);
        openPopup('Transaction Reversed', `Transaction ${tx.id} was successfully reversed and refunded.`, 'success');
      },
      'Confirm Reverse',
      'Cancel'
    );
  };

  const handleToggleSuspicious = (tx: Transaction) => {
    const updatedTxs = transactions.map((t) =>
      t.id === tx.id ? { ...t, isSuspicious: !t.isSuspicious } : t
    );
    if (onUpdateTransactions) {
      onUpdateTransactions(updatedTxs);
    }
    recordAuditLog('SUSPICIOUS_FLAG_TOGGLE', `Transaction ${tx.id} suspicious flag set to ${!tx.isSuspicious}`, tx.userId, tx.recipientName);
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      openPopup('No Data', 'No transactions found to export.', 'warning');
      return;
    }

    const headers = ['Tx ID', 'Date', 'Time', 'Type', 'Amount ($)', 'Fee ($)', 'Status', 'User ID', 'Recipient', 'Reference'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type,
      t.amount.toFixed(2),
      t.fee.toFixed(2),
      t.status,
      t.userId || '',
      `"${t.recipientName || ''}"`,
      `"${t.reference || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayPulse_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordAuditLog('CSV_EXPORT', `Exported ${filteredTransactions.length} transactions to CSV.`);
  };

  // Test DB Diagnostic
  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const response = await fetch('/api/admin/test-db');
      const data = await response.json();
      setDbTestResult(data);
      recordAuditLog('DB_DIAGNOSTIC_RUN', `Database test performed. Result: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (err) {
      setDbTestResult({
        success: false,
        message: 'Failed to communicate with the server diagnostic endpoint.',
      });
    }
    setIsTestingDb(false);
  };

  // Broadcast Notification
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      openPopup('Incomplete Notification', 'Please enter both a title and message for the notification.', 'warning');
      return;
    }

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      time: 'Just now',
      read: false,
      type: notifType,
      userId: notifTargetUser === 'all' ? undefined : notifTargetUser,
    };

    if (onUpdateNotifications) {
      onUpdateNotifications([newNotif, ...notifications]);
    }

    recordAuditLog(
      'BROADCAST_NOTIFICATION_SENT',
      `Broadcast sent: "${notifTitle}". Target: ${notifTargetUser === 'all' ? 'All Users' : notifTargetUser}`
    );

    setNotifTitle('');
    setNotifMessage('');
    openPopup('Broadcast Sent', 'Notification has been broadcasted to target audience.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* POPUP DIALOG */}
      <PopupDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onClose={closePopup}
        onConfirm={dialogState.onConfirm}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">PayPulse Wallet Admin</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                360° Control
              </span>
            </div>
            <p className="text-xs text-slate-400">Logged in as {currentUser.name} ({currentUser.email})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToUserApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            Switch to User App
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: Activity },
            { id: 'users', label: '👥 User 360°', icon: Users, badge: systemUsers.length },
            { id: 'transactions', label: '💳 Transactions', icon: Receipt, badge: transactions.length },
            { id: 'fraud', label: '🛡️ Risk & Fraud', icon: ShieldAlert, badge: securityAlerts.filter((a) => !a.resolved).length },
            { id: 'devices', label: '📱 Devices & Sessions', icon: Smartphone, badge: activeDevices.length },
            { id: 'rules', label: '⚙️ Custom Rules', icon: Sliders, badge: customRules.length },
            { id: 'tickets', label: '🎫 Support Tickets', icon: LifeBuoy, badge: supportTickets.filter((t) => t.status !== 'CLOSED').length },
            { id: 'settings', label: '🛠️ System & Diagnostic', icon: Cpu },
            { id: 'audit', label: '📋 Audit Log', icon: History, badge: localAuditLogs.length },
            { id: 'notifications', label: '📢 Broadcast', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* --- TAB 1: 📊 DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total System Users</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">{systemUsers.length}</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{newUsersToday} Today
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Transactions</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">{transactions.length}</span>
                  <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {todayTransactions.length} Today
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total System Liquidity</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">${totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    User Balances
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Today's Revenue (Fees)</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">${todayRevenue.toFixed(2)}</span>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Collected Fees
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE RECHARTS CHART & REALTIME FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Transaction Volume & Revenue Trend
                    </h3>
                    <p className="text-xs text-slate-400">Daily transaction volume and system fees collected over 7 days</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Volume ($)
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#f8fafc',
                        }}
                      />
                      <Area type="monotone" dataKey="volume" name="Volume ($)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#volumeGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* REALTIME USER ACTIVITY FEED */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Activity Feed
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    Realtime Sync
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-64 scrollbar-thin text-xs">
                  {transactions.slice(0, 6).map((tx) => (
                    <div key={tx.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{tx.title || tx.type}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{tx.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Recipient: {tx.recipientName}</span>
                        <span className="font-bold text-emerald-400 font-mono">${tx.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: 👥 USER 360° MANAGEMENT --- */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            {/* SEARCH & FILTERS BAR */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, phone, profile ID..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value as any);
                    setUserPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Status: All</option>
                  <option value="active">Active</option>
                  <option value="frozen">Frozen / Blocked</option>
                </select>

                <select
                  value={userKycFilter}
                  onChange={(e) => {
                    setUserKycFilter(e.target.value as any);
                    setUserPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">KYC: All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="unverified">Unverified</option>
                </select>

                <select
                  value={userTagFilter}
                  onChange={(e) => {
                    setUserTagFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Tag: All</option>
                  <option value="VIP">VIP</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
            </div>

            {/* USERS TABLE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Trust / Risk</th>
                      <th className="p-4">KYC</th>
                      <th className="p-4">Tags</th>
                      <th className="p-4 text-right">Balance</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Quick Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No matching users found.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => {
                        const riskScore = computeUserRiskScore(u);
                        const tags = userTagsMap[u.id] || [];
                        return (
                          <tr key={u.id || u.profileId} className="hover:bg-slate-800/40 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    {u.name}
                                    {u.role === 'admin' && (
                                      <span className="bg-purple-500/10 text-purple-400 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-purple-500/20">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">{u.email} • {u.phone}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-black px-2 py-0.5 rounded-md border font-mono ${
                                    riskScore >= 80
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : riskScore >= 50
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                                  }`}
                                >
                                  {riskScore}/100
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {riskScore >= 80 ? 'Low Risk' : riskScore >= 50 ? 'Medium Risk' : 'High Risk'}
                                </span>
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                  u.kycStatus === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : u.kycStatus === 'pending'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : u.kycStatus === 'rejected'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {u.kycStatus || 'unverified'}
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {tags.map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[9px] font-bold rounded border border-slate-700"
                                  >
                                    {t}
                                  </span>
                                ))}
                                {tags.length === 0 && <span className="text-slate-600 text-[10px]">-</span>}
                              </div>
                            </td>

                            <td className="p-4 text-right font-bold text-emerald-400 font-mono">
                              ${(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>

                            <td className="p-4 text-center">
                              {u.isFrozen ? (
                                <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3" /> Blocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* 360 Deep Dive Trigger */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeepUserDetail(u);
                                    setActiveProfileSubTab('overview');
                                  }}
                                  title="View 360° Profile & Deep Audit"
                                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> 360° View
                                </button>

                                {/* Adjust Balance Trigger */}
                                <button
                                  type="button"
                                  onClick={() => setAdjustingUser(u)}
                                  title="Adjust Balance"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                >
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                </button>

                                {/* Block / Unblock Trigger */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFreeze(u)}
                                  title={u.isFrozen ? 'Unblock User' : 'Block User'}
                                  className={`p-1.5 rounded-lg transition border ${
                                    u.isFrozen
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}
                                >
                                  {u.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing {paginatedUsers.length} of {filteredUsers.length} Users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => p - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-200">
                    Page {userPage} of {totalUserPages}
                  </span>
                  <button
                    type="button"
                    disabled={userPage >= totalUserPages}
                    onClick={() => setUserPage((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 360° USER PROFILE MODAL */}
            {deepUserDetail && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-scaleUp scrollbar-thin">
                  {/* MODAL HEADER */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={deepUserDetail.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={deepUserDetail.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/40"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white">{deepUserDetail.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              deepUserDetail.isFrozen
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {deepUserDetail.isFrozen ? 'BLOCKED' : 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{deepUserDetail.email} • {deepUserDetail.phone}</p>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                          ID: {deepUserDetail.profileId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFreeze(deepUserDetail)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          deepUserDetail.isFrozen
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {deepUserDetail.isFrozen ? 'Unblock User' : 'Block User'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeepUserDetail(null)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* PROFILE SUB-TABS */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
                    {[
                      { id: 'overview', label: '📊 360° Overview' },
                      { id: 'activity', label: '📍 Activity & Timeline' },
                      { id: 'devices', label: '📱 Devices & Sessions' },
                      { id: 'rules', label: '⚙️ Custom Rules' },
                      { id: 'notes', label: '📝 Admin Notes & Tags' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveProfileSubTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${
                          activeProfileSubTab === tab.id
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* PROFILE SUB-TAB CONTENTS */}
                  {activeProfileSubTab === 'overview' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Trust & Risk Score</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-emerald-400 font-mono">
                              {computeUserRiskScore(deepUserDetail)}/100
                            </span>
                            <span className="text-[10px] text-slate-400">Low Risk Baseline</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Wallet Balance</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-white font-mono">
                              ${(deepUserDetail.balance || 0).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAdjustingUser(deepUserDetail)}
                              className="text-[10px] text-emerald-400 underline font-bold"
                            >
                              Adjust
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">KYC Verification</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-white capitalize">{deepUserDetail.kycStatus || 'unverified'}</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateKyc(deepUserDetail, 'approved')}
                                className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateKyc(deepUserDetail, 'rejected')}
                                className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QUICK TAGGING BAR */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-slate-400 font-bold">Assigned User Tags & Risk Labels</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {(userTagsMap[deepUserDetail.id] || []).map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-700"
                            >
                              {t}
                              <X
                                className="w-3 h-3 text-slate-400 cursor-pointer hover:text-red-400"
                                onClick={() => handleRemoveTagFromUser(deepUserDetail.id, t)}
                              />
                            </span>
                          ))}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Add tag (e.g. VIP, High Risk)..."
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddTagToUser(deepUserDetail.id, newTagInput)}
                              className="px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold text-xs"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProfileSubTab === 'activity' && (
                    <div className="space-y-3 text-xs">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" /> Recent Activity Log & Timeline
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white">Login Successful</span>
                            <p className="text-[10px] text-slate-500">IP: 103.114.12.88 • Chrome / Windows • Dhaka</p>
                          </div>
                          <span className="text-[10px] text-slate-400">10 mins ago</span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white">Send Money - $50.00</span>
                            <p className="text-[10px] text-slate-500">To: Sarah Jenkins • Ref: Lunch Bill</p>
                          </div>
                          <span className="text-[10px] text-slate-400">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProfileSubTab === 'devices' && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white">Active Sessions & Registered Devices</h4>
                        <button
                          type="button"
                          onClick={() => handleForceLogoutSession(deepUserDetail.id)}
                          className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold"
                        >
                          Force Logout All Devices
                        </button>
                      </div>

                      <div className="space-y-2">
                        {activeDevices
                          .filter((d) => d.userId === deepUserDetail.id)
                          .map((dev) => (
                            <div key={dev.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  {dev.deviceName}
                                  {dev.isTrusted && (
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded border border-emerald-500/20">
                                      TRUSTED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500">{dev.os} • {dev.browser} • IP: {dev.ip}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleForceLogoutSession(deepUserDetail.id, dev.deviceName)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                              >
                                Terminate
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {activeProfileSubTab === 'notes' && (
                    <div className="space-y-4 text-xs">
                      <div className="space-y-2">
                        <h4 className="font-bold text-white">Admin Audit Notes</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type internal note for this user..."
                            value={newAdminNoteText}
                            onChange={(e) => setNewAdminNoteText(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none"
                          />
                          <select
                            value={newAdminNoteType}
                            onChange={(e) => setNewAdminNoteType(e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2 py-2"
                          >
                            <option value="GENERAL">General</option>
                            <option value="SECURITY">Security</option>
                            <option value="VIP">VIP</option>
                            <option value="WARNING">Warning</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAddAdminNote(deepUserDetail.id)}
                            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                          >
                            Post Note
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                        {adminNotes
                          .filter((n) => n.userId === deepUserDetail.id)
                          .map((n) => (
                            <div key={n.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-bold text-emerald-400">{n.adminName}</span>
                                <span>{n.createdAt}</span>
                              </div>
                              <p className="text-slate-200 font-medium">{n.note}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BALANCE ADJUSTMENT MODAL */}
            {adjustingUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Manual Balance Adjustment
                    </h3>
                    <button type="button" onClick={() => setAdjustingUser(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs space-y-3">
                    <div>
                      <span className="text-slate-400">Target User:</span>
                      <p className="font-bold text-white">{adjustingUser.name} ({adjustingUser.email})</p>
                      <p className="text-[10px] text-emerald-400 font-mono">Current Balance: ${adjustingUser.balance.toFixed(2)}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjustType('credit')}
                        className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                          adjustType === 'credit'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        + Credit (Add)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustType('debit')}
                        className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                          adjustType === 'debit'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        - Debit (Deduct)
                      </button>
                    </div>

                    <input
                      type="number"
                      placeholder="Amount ($)"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none"
                    />

                    <textarea
                      placeholder="Mandatory reason for audit log..."
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none h-20 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdjustingUser(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAdjustBalance}
                      className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs"
                    >
                      Confirm Adjustment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASSWORD / PIN RESET MODAL */}
            {resetUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-400" /> Reset Passkey / PIN
                    </h3>
                    <button type="button" onClick={() => setResetUser(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs space-y-3">
                    <p className="text-slate-300">Set new security credentials for <strong className="text-white">{resetUser.name}</strong>:</p>

                    <div>
                      <label className="text-slate-400 text-[10px]">New Passkey (Login Code)</label>
                      <input
                        type="text"
                        value={newPasskey}
                        onChange={(e) => setNewPasskey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-[10px]">New 4-Digit Security PIN</label>
                      <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetUser(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetCredentials}
                      className="px-4 py-1.5 bg-blue-500 text-slate-950 font-extrabold rounded-xl text-xs"
                    >
                      Reset Credentials
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: 💳 TRANSACTIONS & DISPUTES --- */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Tx ID, recipient, phone..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2"
                >
                  <option value="all">Type: All</option>
                  <option value="sent">Sent Money</option>
                  <option value="cash_out">Cash Out</option>
                  <option value="bill_pay">Bill Pay</option>
                  <option value="recharge">Mobile Recharge</option>
                </select>

                <select
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2"
                >
                  <option value="all">Status: All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="reversed">Reversed / Refunded</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Tx ID & Date</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Recipient</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-right">Fee</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-white font-mono">{tx.id}</div>
                          <div className="text-[10px] text-slate-500">{tx.date} • {tx.time}</div>
                        </td>
                        <td className="p-4 text-slate-300 capitalize">{tx.type}</td>
                        <td className="p-4 text-slate-200">{tx.recipientName} ({tx.recipientPhone})</td>
                        <td className="p-4 text-right font-bold text-white font-mono">${tx.amount.toFixed(2)}</td>
                        <td className="p-4 text-right text-slate-400 font-mono">${tx.fee.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              tx.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : tx.status === 'reversed'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.status !== 'reversed' && (
                              <button
                                type="button"
                                onClick={() => handleReverseTransaction(tx)}
                                title="Reverse & Refund Transaction"
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold transition"
                              >
                                Refund / Reverse
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: 🛡️ FRAUD DETECTION & RISK CENTER --- */}
        {activeTab === 'fraud' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Active Security Alerts & Suspicious Flags
                </h3>
                <span className="text-xs text-red-400 font-bold bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  {securityAlerts.filter((a) => !a.resolved).length} Unresolved Alerts
                </span>
              </div>

              <div className="space-y-3">
                {securityAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition ${
                      alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                        ? 'bg-red-950/20 border-red-500/30'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{alert.userName}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase border ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-500 text-slate-950 border-red-500'
                              : alert.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{alert.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                    </div>

                    {!alert.resolved ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSecurityAlerts((prev) =>
                            prev.map((a) => (a.id === alert.id ? { ...a, resolved: true } : a))
                          );
                          recordAuditLog('SECURITY_ALERT_RESOLVED', `Resolved alert: ${alert.message}`, alert.userId);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">Resolved ✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: 📱 DEVICES & SESSIONS --- */}
        {activeTab === 'devices' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Active System Sessions & Device Fingerprints
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDevices.map((dev) => (
                  <div key={dev.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{dev.deviceName}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{dev.lastSeen}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{dev.os} • {dev.browser}</p>
                    <p className="text-[10px] text-slate-500 font-mono">IP: {dev.ip}</p>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleForceLogoutSession(dev.userId, dev.deviceName)}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold"
                      >
                        Force Logout Device
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: ⚙️ CUSTOM RULES ENGINE --- */}
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" /> Custom Transaction Rules & Limits
                </h3>
              </div>

              <div className="space-y-3">
                {customRules.map((rule) => (
                  <div key={rule.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{rule.ruleName}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {rule.ruleType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">Condition: {rule.conditionSummary}</p>
                    <p className="text-[11px] text-slate-400">Action: {rule.actionSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 7: 🎫 SUPPORT TICKETS --- */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-emerald-400" /> User Support Tickets & Inquiries
              </h3>

              <div className="space-y-3">
                {supportTickets.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{t.id}: {t.subject}</span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-bold">{t.priority}</span>
                      </div>
                      <p className="text-xs text-slate-400">User: {t.userName} ({t.userPhone}) • Category: {t.category}</p>
                    </div>

                    <select
                      value={t.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as any;
                        setSupportTickets((prev) =>
                          prev.map((item) => (item.id === t.id ? { ...item, status: newStatus } : item))
                        );
                        recordAuditLog('TICKET_STATUS_UPDATED', `Ticket ${t.id} set to ${newStatus}`);
                      }}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 8: 🛠️ SYSTEM SETTINGS & DIAGNOSTIC --- */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Fee Configuration & Limits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-slate-400 font-bold">Send Money Fee (%)</label>
                  <input
                    type="number"
                    value={feeConfig.sendMoneyFeePercent}
                    onChange={(e) => setFeeConfig({ ...feeConfig, sendMoneyFeePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-slate-400 font-bold">Cash Out Fee (%)</label>
                  <input
                    type="number"
                    value={feeConfig.cashOutFeePercent}
                    onChange={(e) => setFeeConfig({ ...feeConfig, cashOutFeePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-slate-400 font-bold">Bill Pay Flat Fee ($)</label>
                  <input
                    type="number"
                    value={feeConfig.billPayFeeFlat}
                    onChange={(e) => setFeeConfig({ ...feeConfig, billPayFeeFlat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* RECAPTCHA & MAINTENANCE MODE */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-white">System Security & Maintenance Mode</h4>

                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-white">reCAPTCHA Verification Bot Protection</span>
                    <p className="text-[10px] text-slate-400">Require reCAPTCHA verification on login & high-value transfers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={recaptchaEnabled}
                    onChange={(e) => {
                      onUpdateRecaptchaSettings(e.target.checked);
                      recordAuditLog('RECAPTCHA_TOGGLED', `reCAPTCHA set to ${e.target.checked}`);
                    }}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </div>
              </div>

              {/* DATABASE DIAGNOSTIC TOOL */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> Server & Database Diagnostic Tool
                </h4>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-xs text-slate-300">Run server connectivity and database persistence health tests.</p>

                  <button
                    type="button"
                    onClick={handleTestDatabase}
                    disabled={isTestingDb}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isTestingDb ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Run Database Health Diagnostic
                  </button>

                  {dbTestResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                        dbTestResult.success ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'
                      }`}
                    >
                      <div className="font-bold">{dbTestResult.success ? '✓ PERSISTENCE OK' : '✕ DIAGNOSTIC FAILED'}</div>
                      <p>{dbTestResult.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 9: 📋 AUDIT LOG --- */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="relative w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit action or details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Admin</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Target User</th>
                      <th className="p-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-4 text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4 text-emerald-400 font-bold">{log.adminName}</td>
                        <td className="p-4 text-white font-bold">{log.action}</td>
                        <td className="p-4 text-slate-300">{log.targetUserName || '-'}</td>
                        <td className="p-4 text-slate-400">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 10: 📢 BROADCAST --- */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" /> System Notification Broadcast
              </h3>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold">Target Audience</label>
                  <select
                    value={notifTargetUser}
                    onChange={(e) => setNotifTargetUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 mt-1"
                  >
                    <option value="all">All System Users</option>
                    {systemUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Scheduled System Maintenance"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold">Notification Message</label>
                  <textarea
                    placeholder="Type message content..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 mt-1 h-24"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Broadcast
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
