import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { PopupDialog, DialogType } from '../ui/PopupDialog';
import {
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';

interface LoginViewProps {
  systemUsers: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  systemUsers,
  onLoginSuccess,
  onGoToSignup,
  onGoToForgotPassword,
  onClose,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const openPopup = (title: string, message: React.ReactNode, type: DialogType = 'error') => {
    setDialogState({ isOpen: true, title, message, type });
  };

  const closePopup = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const target = identifier.trim().toLowerCase();
      const targetCleanDigits = identifier.replace(/\D/g, '');

      let user: UserAccount | undefined;

      // CASE A: Identifier is provided
      if (target) {
        user = systemUsers.find((u) => {
          const emailMatch = u.email.toLowerCase() === target;

          const phoneDigits = u.phone.replace(/\D/g, '');
          const phoneMatch =
            (targetCleanDigits.length > 2 && phoneDigits.includes(targetCleanDigits)) ||
            u.phone.toLowerCase() === target ||
            u.phone.replaceAll(' ', '') === target;

          const accMatch = u.accountNo.toLowerCase() === target;

          const nameMatch =
            u.name.toLowerCase() === target ||
            u.name.replaceAll(' ', '').toLowerCase() === target;

          const usernameMatch = (u as any).username?.toLowerCase() === target;

          return emailMatch || phoneMatch || accMatch || nameMatch || usernameMatch;
        });

        if (!user) {
          openPopup('Login Failed', 'Account not found. Please check your Username, Email, Phone, or Account Number.');
          setIsLoading(false);
          return;
        }

        if (user.isFrozen) {
          openPopup('Account Frozen', 'This account has been frozen by the System Admin. Please contact support.', 'warning');
          setIsLoading(false);
          return;
        }

        // Require password
        if (!password.trim()) {
          openPopup('Password Required', 'Please enter your account password.', 'warning');
          setIsLoading(false);
          return;
        }

        const matchPassword = user.password && user.password === password.trim();
        if (!matchPassword) {
          openPopup('Login Failed', 'Invalid account password.');
          setIsLoading(false);
          return;
        }
      } else if (password.trim()) {
        // CASE B: ONLY Password provided (Identifier is empty)
        const inputPass = password.trim();
        user = systemUsers.find((u) => u.password && u.password === inputPass);

        if (!user) {
          openPopup('Login Failed', 'No account found matching this password.');
          setIsLoading(false);
          return;
        }

        if (user.isFrozen) {
          openPopup('Account Frozen', 'This account has been frozen by the System Admin. Please contact support.', 'warning');
          setIsLoading(false);
          return;
        }
      } else {
        openPopup('Input Required', 'Please enter your Username, Email, Phone, Account Number, or Password.', 'warning');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 p-6 relative overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-950 tracking-tight">PayPulse</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
              Digital Wallet
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Form Container */}
      <div className="my-auto max-w-sm mx-auto w-full space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Welcome back.</h2>
          <p className="text-sm text-slate-500">
            Sign in to access your secure wallet.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Username / Email / Mobile / Acc#
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Optional if password used</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username, Email, Number, or Account No"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-950 rounded-2xl px-5 py-4 text-sm placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={onGoToForgotPassword}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-950 rounded-2xl px-5 py-4 text-sm placeholder-slate-400 transition outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Login using your registered account <strong>Password</strong>.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        {/* Signup Link */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Need an account?{' '}
            <button
              type="button"
              onClick={onGoToSignup}
              className="text-slate-950 hover:text-slate-700 font-bold underline underline-offset-4 transition"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      <PopupDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onClose={closePopup}
      />
    </div>
  );
};
