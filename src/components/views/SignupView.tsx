import React, { useState, useRef } from 'react';
import { UserAccount } from '../../types';
import { ALL_COUNTRIES, CountryCurrency } from '../../data/countries';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Globe,
  ChevronDown,
  Search,
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
  const [passkey, setPasskey] = useState('');
  const [code, setPin] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCurrency>(ALL_COUNTRIES[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Filter countries for modal search
  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q)
    );
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly allow ONLY numeric digits (0-9)
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPhone(digitsOnly);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly allow ONLY numeric digits (0-9)
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPin(digitsOnly);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Please enter a valid mobile number.');
      return;
    }

    if (!agreedTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError('Security Code must be exactly 4 numeric digits.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const fullPhone = `${selectedCountry.dialCode} ${cleanDigits}`;
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate phone or email
    const exists = systemUsers.some(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.phone.replace(/\D/g, '') === cleanDigits ||
        u.phone === fullPhone
    );

    if (exists) {
      setError('An account with this Email or Mobile Number already exists.');
      return;
    }

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    setIsLoading(true);

    try {
      const generatedAccountNo = `10928374${Math.floor(100 + Math.random() * 900)}`;
      const newUser: UserAccount = {
        id: `u_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        phone: fullPhone,
        profileId: generatedAccountNo,
        code: code.trim(),
        passkey: passkey.trim(),
        balance: 0,
        role: 'user',
        isFrozen: false,
        createdAt: new Date().toISOString(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      };

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          recaptchaToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        onRegisterUser(data.user || newUser);
        setIsSuccess(true);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while communicating with the registration server.');
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
        {isSuccess ? (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Registration Successful!</h3>
              <p className="text-xs text-slate-300">
                Your digital app account has been successfully created and saved.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Account Name:</span>
                <span className="text-white font-bold">{name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Country & Mobile:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedCountry.flag} {selectedCountry.dialCode} {phone}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Email:</span>
                <span className="text-emerald-400 font-bold">{email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>4-Digit Code:</span>
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
                Select your Country & enter mobile number (digits only)
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

              {/* Country Selection Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
                  <span>Country / Region</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {ALL_COUNTRIES.length} Countries Available
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCountryModal(true)}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-white rounded-2xl px-3.5 py-2.5 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{selectedCountry.flag}</span>
                    <span className="font-bold text-white">{selectedCountry.name}</span>
                    <span className="text-slate-400 font-mono">({selectedCountry.code})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <span>{selectedCountry.dialCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition" />
                  </div>
                </button>
              </div>

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
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs placeholder-slate-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs placeholder-slate-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number (Digits Only + Dial Code) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
                  <span>Mobile Number</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Digits Only (0-9)</span>
                </label>
                <div className="relative flex items-center">
                  {/* Country Dial Code Badge */}
                  <button
                    type="button"
                    onClick={() => setShowCountryModal(true)}
                    className="absolute left-1.5 inset-y-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl flex items-center gap-1 font-mono text-xs font-bold border border-slate-700 transition"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="1712000222"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-24 pr-4 py-2.5 text-xs placeholder-slate-500 transition outline-none font-mono font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Passkey & Code Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Passkey</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="passkey"
                      required
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-8 pr-2 py-2.5 text-xs placeholder-slate-500 transition outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
                    <span>4-Digit Code</span>
                    <span className="text-[10px] text-emerald-400 font-mono">0-9 Only</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="passkey"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      required
                      value={code}
                      onChange={handlePinChange}
                      placeholder="1234"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-2xl pl-8 pr-2 py-2.5 text-xs placeholder-slate-500 transition outline-none font-mono text-center tracking-widest font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreedTerms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                />
                <label htmlFor="agreedTerms" className="text-[11px] text-slate-400 select-none cursor-pointer">
                  I agree to PulseTracker <span className="text-emerald-400 underline">Terms of Service</span> & Privacy Policy.
                </label>
              </div>

              {siteKey && (
                <div className="flex justify-center py-1">
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
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create App Account</span>
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

      {/* ALL COUNTRIES SELECTOR MODAL */}
      {showCountryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">Select Country & Dial Code</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCountryModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-800 bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country, code, or dial code (+880, USA)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      setShowCountryModal(false);
                      setCountrySearch('');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition text-left ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-200 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({c.code})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Currency: {c.symbol}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {c.dialCode}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}

              {filteredCountries.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No country found matching "{countrySearch}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="mt-auto pt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Instant KYC Verification & Encrypted Storage</span>
      </div>
    </div>
  );
};
