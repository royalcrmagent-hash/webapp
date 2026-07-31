import { WalletState, UserAccount } from '../types';

export const INITIAL_SYSTEM_USERS: UserAccount[] = [
  {
    id: 'usr_admin',
    name: 'System Admin',
    email: 'admin@gmail.com',
    phone: '01700000000',
    accountNo: 'ADM-0000-999',
    pin: '1234',
    password: '123456',
    role: 'admin',
    balance: 0,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    biometricEnabled: true,
  },
];

export const INITIAL_WALLET_STATE: WalletState = {
  balance: 0.0,
  currency: '৳',
  hideBalance: false,
  user: {
    name: 'Account Holder',
    phone: '01700000000',
    accountNo: 'WAL-1000-001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    pin: '1234',
  },
  contacts: [
    {
      id: 'c1',
      name: 'Rahim Ahmed',
      phone: '01712345678',
      username: 'rahim',
      email: 'rahim@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c2',
      name: 'Nusrat Jahan',
      phone: '01898765432',
      username: 'nusrat',
      email: 'nusrat@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c3',
      name: 'Tanvir Hossain',
      phone: '01712000222',
      username: 'tanvir',
      email: 'tanvir@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c4',
      name: 'Sadia Islam',
      phone: '01911223344',
      username: 'sadia',
      email: 'sadia@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c5',
      name: 'Karim Khan',
      phone: '01822334455',
      username: 'karim',
      email: 'karim@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
  ],
  transactions: [],
  notifications: [
    {
      id: 'n1',
      title: 'Welcome to Wallet',
      message: 'Your real account is now active. You can Add Money or receive funds to begin.',
      time: 'Just now',
      read: false,
      type: 'system',
    },
  ],
};

