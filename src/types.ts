export type Currency = string;

export type VirtualCardType = 'visa' | 'mastercard' | 'amex';

export interface VirtualCard {
  id: string;
  userId?: string;
  type: VirtualCardType;
  cardName: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  isFrozen: boolean;
  colorGradient: string;
  createdAt: string;
}

export type TransactionType = 'sent' | 'received' | 'cash_in' | 'cash_out' | 'bill_pay' | 'recharge';

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  title: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  fee: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  isSuspicious?: boolean;
  reference?: string;
  category?: string;
}

export interface Contact {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  username?: string;
  email?: string;
  avatar: string;
  favorite?: boolean;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'transaction' | 'system' | 'promo';
}

export interface UserProfile {
  name: string;
  phone: string;
  profileId: string;
  avatar: string;
  code: string;
}

export interface UserAccount {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  profileId: string;
  code: string;
  passkey?: string;
  role: 'user' | 'admin';
  balance: number;
  isFrozen?: boolean;
  kycStatus?: 'approved' | 'pending' | 'rejected' | 'unverified';
  avatar?: string;
  biometricEnabled?: boolean;
  createdAt?: string;
}

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  adminName: string;
  action: string;
  details: string;
  targetUserId?: string;
  targetUserName?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemFeeConfig {
  sendMoneyFeePercent: number;
  cashOutFeePercent: number;
  billPayFeeFlat: number;
  minFee: number;
  maxFee: number;
}

export interface SystemLimits {
  dailyTxLimit: number;
  maxTxAmount: number;
  minTxAmount: number;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceModel: string;
  os: string;
  browser: string;
  ip: string;
  lastSeen: string;
  isTrusted: boolean;
  isRooted?: boolean;
  isEmulator?: boolean;
  isBlocked?: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  ip: string;
  city: string;
  country: string;
  isp: string;
  deviceName: string;
  isSuspicious: boolean;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  userName?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'VOLUME_SPIKE' | 'IMPOSSIBLE_TRAVEL' | 'NIGHT_TRANSACTION' | 'RAPID_TRANSACTIONS' | 'SUSPICIOUS_IP' | 'FAILED_PIN';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface UserCustomRule {
  id: string;
  userId: string;
  userName?: string;
  ruleName: string;
  ruleType: 'LIMIT' | 'BLOCK' | 'REQUIRE_APPROVAL' | 'REQUIRE_OTP';
  conditionSummary: string;
  actionSummary: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminNote {
  id: string;
  userId: string;
  adminName: string;
  note: string;
  noteType: 'GENERAL' | 'SECURITY' | 'VIP' | 'WARNING';
  isPinned?: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  lastUpdated: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  systemUsers: UserAccount[];
  biometricThreshold: number;
  biometricRequired: boolean;
}

export interface AppState {
  balance: number;
  currency: Currency;
  hideBalance: boolean;
  user: UserProfile;
  transactions: Transaction[];
  contacts: Contact[];
  notifications: AppNotification[];
}
