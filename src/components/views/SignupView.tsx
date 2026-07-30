import React, { useState } from 'react';
import { UserAccount } from '../../types';
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface SignupViewProps {
  systemUsers: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
  onGoToLogin: () => void;
  onClose?: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({
  systemUsers,
  onRegisterUser,
  onGoToLogin,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [initialBalance, setInitialBalance] = useState('15000');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.exec(pin)) {
      setError('Security PIN must be exactly 4 numeric digits.');
      return;
    }

    const cleanPhone = phone.trim().replaceAll(' ', '');
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const exists = systemUsers.some(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.phone.replaceAll(' ', '') === cleanPhone
    );

    if (exists) {
      setError('An account with this Email or Mobile Number already exists.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const generatedAccountNo = `10928374${Math.floor(100 + Math.random() * 900)}`;
      const newUser: UserAccount = {
        id: `u_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone.startsWith('01') ? cleanPhone : `017${cleanPhone}`,
        accountNo: generatedAccountNo,
        pin: pin.trim(),
        password: password.trim(),
        balance: parseFloat(initialBalance) || 10000,
        role: 'user',
        isFrozen: false,
        createdAt: new Date().toISOString(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      };

      onRegisterUser(newUser);
      setIsLoading(false);
      setIsSuccess(true);
    }, 600);
  };

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
            <h1 className="text-base font-black text-white tracking-tight">PayPulse</h1>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
              Digital Wallet
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
        {isSuccess ? (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Registration Successful!</h3>
              <p className="text-xs text-slate-300">
                Your digital wallet account has been created with initial deposit of ৳
                {parseFloat(initialBalance).toLocaleString()}.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Account Name:</span>
                <span className="text-white font-bold">{name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Email:</span>
                <span className="text-emerald-400 font-bold">{email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>4-Digit PIN:</span>
                <span className="text-white font-mono font-bold">****</span>
              </div>
            </div>
            <button
              onClick={onGoToLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Go to Login Screen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400">
                Join PayPulse & enjoy fast, secure, instant money transfers.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs font-medium animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-8 pr-2 py-2.5 text-xs placeholder-slate-500 transition outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Mobile No</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01712000222"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-8 pr-2 py-2.5 text-xs placeholder-slate-500 transition outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password & PIN Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-8 pr-2 py-2.5 text-xs placeholder-slate-500 transition outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">4-Digit PIN</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-8 pr-2 py-2.5 text-xs placeholder-slate-500 transition outline-none font-mono text-center tracking-widest"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Starting Balance */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Initial Starting Balance (Demo Deposit)</span>
                  <span className="text-emerald-400 font-bold">৳{parseFloat(initialBalance || '0').toLocaleString()}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['5000', '15000', '25000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInitialBalance(amt)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                        initialBalance === amt
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ৳{parseFloat(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreedTerms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                />
                <label htmlFor="agreedTerms" className="text-[11px] text-slate-400 select-none cursor-pointer">
                  I agree to PayPulse <span className="text-emerald-400 underline">Terms of Service</span> & Privacy Policy.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create Wallet Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="pt-3 text-center border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-emerald-400 hover:text-emerald-300 font-extrabold underline underline-offset-4 transition"
                >
                  Sign In / Login
                </button>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Security Footer */}
      <div className="mt-auto pt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Instant KYC Verification & Encrypted Storage</span>
      </div>
    </div>
  );
};
