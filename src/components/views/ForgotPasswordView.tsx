import React, { useState } from 'react';
import { UserAccount } from '../../types';
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';

interface ForgotPasswordViewProps {
  systemUsers: UserAccount[];
  onUpdateUserCredentials: (emailOrPhone: string, newPass: string, newPin: string) => void;
  onGoToLogin: () => void;
  onClose?: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  systemUsers,
  onUpdateUserCredentials,
  onGoToLogin,
  onClose,
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<UserAccount | null>(null);

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const target = identifier.trim().toLowerCase();
    const targetCleanDigits = identifier.replace(/\D/g, '');
    const user = systemUsers.find((u) => {
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
      setError('Account not found with this Username, Email, Phone, or Account Number.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setFoundUser(user);
    setStep('verify');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpInput.trim() !== generatedOtp) {
      setError('Invalid verification code. Please check code or click auto-fill.');
      return;
    }

    setStep('reset');
  };

  // Step 3: Reset Password & PIN
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin.length !== 4 || !/^\d{4}$/.exec(newPin)) {
      setError('Security PIN must be exactly 4 numeric digits.');
      return;
    }

    if (foundUser) {
      onUpdateUserCredentials(foundUser.email, newPassword, newPin);
      setStep('success');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-5 relative overflow-y-auto">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <button
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="my-auto z-10 max-w-sm mx-auto w-full space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Recover Credentials</h2>
          <p className="text-xs text-slate-400">
            {step === 'request' && 'Enter your registered Email or Mobile number to reset PIN'}
            {step === 'verify' && 'Enter 6-digit SMS / Email security verification code'}
            {step === 'reset' && 'Create your new password and 4-digit security PIN'}
            {step === 'success' && 'Your account security credentials have been updated'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Username, Email, Phone, or Account Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username, email, mobile, or acc#"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-3 text-sm placeholder-slate-500 transition outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Send Verification Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Security Verification Code:</span>
                <span className="font-mono text-emerald-400 font-extrabold tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                  {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpInput(generatedOtp)}
                className="w-full text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold py-1.5 rounded-xl transition"
              >
                ⚡ Auto-fill Verification Code
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl py-3 text-center text-lg font-mono tracking-widest outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Verify Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: RESET CREDENTIALS */}
        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                New Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-3 text-sm placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                New 4-Digit Security PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Save & Update Credentials</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Password & PIN Updated!</h3>
              <p className="text-xs text-slate-300">
                You can now log in using your updated security credentials.
              </p>
            </div>
            <button
              onClick={onGoToLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="mt-auto pt-6 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Secure Identity Verification Powered by PayPulse</span>
      </div>
    </div>
  );
};
