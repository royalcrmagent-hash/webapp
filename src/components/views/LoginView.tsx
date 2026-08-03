import React, { useState, useRef } from 'react';
import { UserAccount } from '../../types';
import { PopupDialog, DialogType } from '../ui/PopupDialog';
import ReCAPTCHA from 'react-google-recaptcha';
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
  ShieldCheck,
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
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; type: string } | null>(null);
  const [settings, setSettings] = useState<{ recaptchaEnabled: boolean } | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // Fetch settings and DB Status on mount
  React.useEffect(() => {
    // Fetch DB Status
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.database === 'connected') {
          setDbStatus({ connected: true, type: data.storageType });
        } else {
          setDbStatus({ connected: false, type: 'Disconnected' });
        }
      })
      .catch(() => setDbStatus({ connected: false, type: 'Error' }));

    // Fetch Settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err));
  }, []);
  
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
    
    const target = identifier.trim();
    if (!target) {
      openPopup('Input Required', 'Please enter your Username, Email, Phone, or Profile ID.', 'warning');
      return;
    }

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (settings?.recaptchaEnabled && siteKey && !recaptchaToken) {
      openPopup('Verification Required', 'Please complete the reCAPTCHA verification.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailOrPhone: target, 
          passkey: passkey,
          code: passkey,
          recaptchaToken
        })
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        openPopup('Login Failed', data.error || 'Invalid credentials.');
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      console.error(err);
      openPopup('Login Error', 'An error occurred while communicating with the authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-5 relative overflow-y-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">PulseTracker</h1>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
              Digital App
            </span>
          </div>
        </div>

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
        {/* Database Status Indicator */}
        <div className="flex justify-center mb-2">
          {dbStatus ? (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
              dbStatus.connected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dbStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span>DB: {dbStatus.type}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-900/50 border-slate-800 text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              <span>Checking Database...</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your secure app account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Username / Email / Mobile / Acc#
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email, number, or profile ID"
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-3 text-sm placeholder-slate-500 transition outline-none"
              />
            </div>
          </div>

          {/* Passkey Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Passkey
              </label>
              <button
                type="button"
                onClick={onGoToForgotPasskey}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPasskey ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter account passkey"
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-12 py-3 text-sm placeholder-slate-500 transition outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-emerald-400"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Login using your registered account <strong>Passkey</strong>.</span>
          </div>

          {siteKey && settings?.recaptchaEnabled && (
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(token) => setRecaptchaToken(token)}
                theme="dark"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-scode"></span>
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In / Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-3 text-center border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Need an account?{' '}
            <button
              type="button"
              onClick={onGoToSignup}
              className="text-emerald-400 hover:text-emerald-300 font-extrabold underline underline-offset-4 transition"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      {/* Security Footer */}
      <div className="mt-auto pt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Instant KYC Verification & Encrypted Storage</span>
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
