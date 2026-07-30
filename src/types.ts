export type Currency = '৳' | '$';

export type TransactionType = 'sent' | 'received' | 'cash_in' | 'cash_out' | 'bill_pay' | 'recharge';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  fee: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  category?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  favorite?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'transaction' | 'system' | 'promo';
}

export interface UserProfile {
  name: string;
  phone: string;
  accountNo: string;
  avatar: string;
  pin: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNo: string;
  pin: string;
  password?: string;
  role: 'user' | 'admin';
  balance: number;
  isFrozen?: boolean;
  avatar?: string;
  biometricEnabled?: boolean;
  createdAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  systemUsers: UserAccount[];
  biometricThreshold: number;
  biometricRequired: boolean;
}

export interface WalletState {
  balance: number;
  currency: Currency;
  hideBalance: boolean;
  user: UserProfile;
  transactions: Transaction[];
  contacts: Contact[];
  notifications: AppNotification[];
}
