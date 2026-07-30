import React, { useState } from 'react';
import { UserAccount } from '../../types';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const target = identifier.trim().toLowerCase();
      const user = systemUsers.find(
        (u) =>
          u.email.toLowerCase() === target ||
          u.phone.replaceAll(' ', '') === target ||
          u.accountNo.toLowerCase() === target
      );

      if (!user) {
        setError('Account not found. Please check your Email or Phone number.');
        setIsLoading(false);
        return;
      }

      if (user.isFrozen) {
        setError('This account has been frozen by the System Admin. Please contact support.');
        setIsLoading(false);
        return;
      }

      const matchPassword = user.password && user.password === password;
      const matchPin = user.pin === password;

      if (!matchPassword && !matchPin) {
        setError('Invalid password or security PIN.');
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
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Identifier Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Account Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email, Phone, or Acc#"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-950 rounded-2xl px-5 py-4 text-sm placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Password / PIN
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or 4-digit PIN"
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
    </div>
  );
};
