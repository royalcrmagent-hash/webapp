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
  onGoToForgotPasskey: () => void;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  systemUsers,
  onLoginSuccess,
  onGoToSignup,
  onGoToForgotPasskey,
  onClose,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const target = identifier.trim() || passkey.trim();
      if (!target) {
        openPopup('Input Required', 'Please enter your Username, Email, Phone, Profile ID, or Passkey.', 'warning');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: target, passkey: passkey })
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        openPopup('Login Failed', data.error || 'Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      openPopup('Login Error', 'An error occurred while communicating with the authentication server.');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-base font-bold text-slate-950 tracking-tight">PulseTracker</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
              Digital App
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
            Sign in to access your secure app.
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
              <span className="text-[10px] text-slate-500 font-medium">Optional if passkey used</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username, Email, Number, or Profile ID"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-950 rounded-2xl px-5 py-4 text-sm placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          {/* Passkey Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Passkey
              </label>
              <button
                type="button"
                onClick={onGoToForgotPasskey}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPasskey ? 'text' : 'passkey'}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter account passkey"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-950 rounded-2xl px-5 py-4 text-sm placeholder-slate-400 transition outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-900"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Login using your registered account <strong>Passkey</strong>.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-scode"></span>
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
