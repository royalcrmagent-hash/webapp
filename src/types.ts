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
  status: 'completed' | 'pending' | 'failed';
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

export interface AppState {
  balance: number;
  currency: Currency;
  hideBalance: boolean;
  user: UserProfile;
  transactions: Transaction[];
  contacts: Contact[];
  notifications: AppNotification[];
}
