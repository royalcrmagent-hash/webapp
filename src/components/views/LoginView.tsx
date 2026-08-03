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
  Bug,
  Database,
  RefreshCw,
  Terminal,
  CheckCircle2,
  KeyRound,
  UserCheck
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
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; type: string; rawStatus?: string } | null>(null);
  const [settings, setSettings] = useState<{ recaptchaEnabled: boolean } | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [debugLogs, setDebugLogs] = useState<Array<{ type: 'info' | 'error' | 'success'; message: string; timestamp: string }>>([]);
  const [debugApiResult, setDebugApiResult] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setDebugLogs((prev) => [
      { type, message, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
  };

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
      } else {
        const text = await res.text();
        const shortText = text.replace(/<[^>]*>?/gm, '').trim().slice(0, 150);
        return {
          ok: false,
          status: res.status,
          data: {
            success: false,
            error: `Server Non-JSON Response [${res.status}]: ${shortText || 'Unknown Server Output'}`
          }
        };
      }
    } catch (e: any) {
      return {
        ok: false,
        status: 0,
        data: {
          success: false,
          error: `Network Connection Error: ${e.message || String(e)}`
        }
      };
    }
  };
  
  // Fetch settings and DB Status on mount
  const checkHealth = async () => {
    try {
      addLog('info', 'Checking server health API...');
      const { ok, data } = await safeFetchJson('/api/health');
      if (ok && data.status === 'ok') {
        setDbStatus({ 
          connected: data.database === 'connected' || data.database === 'local_fallback', 
          type: data.storageType || 'Local/Cloud',
          rawStatus: data.database
        });
        addLog('success', `Server health OK (${data.storageType}). DB Status: ${data.database}`);
      } else {
        setDbStatus({ connected: false, type: 'Disconnected' });
        addLog('error', `Server health check failed: ${data?.error || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      setDbStatus({ connected: false, type: 'Error' });
      addLog('error', `Failed to connect to /api/health: ${e.message || String(e)}`);
    }
  };

  React.useEffect(() => {
    checkHealth();

    // Fetch Settings
    safeFetchJson('/api/settings').then(({ data }) => {
      if (data?.success) {
        setSettings(data.settings);
      }
    }).catch(err => {
      console.error('Failed to fetch settings:', err);
      addLog('error', `Settings fetch failed: ${err.message || String(err)}`);
    });
  }, []);

  const runDbDiagnostic = async () => {
    setIsDebugging(true);
    addLog('info', 'Running deep Database Diagnostic (/api/admin/debug-info & /api/admin/test-db)...');
    try {
      const [{ data: debugRes }, { data: testDbRes }] = await Promise.all([
        safeFetchJson('/api/admin/debug-info'),
        safeFetchJson('/api/admin/test-db')
      ]);

      setDebugApiResult({ debugRes, testDbRes });
      if (testDbRes?.success) {
        addLog('success', `DB Connection Test: ${testDbRes.message} (${testDbRes.latency})`);
      } else {
        addLog('error', `DB Connection Test Notice: ${testDbRes?.message || testDbRes?.error || 'Failed'}`);
      }

      if (debugRes?.success) {
        addLog('info', `DB Debug Info: ${debugRes.userCount} users found in DB. Storage: ${debugRes.storageType}`);
      } else if (debugRes?.error) {
        addLog('error', `DB Debug Info Error: ${debugRes.error}`);
      }
    } catch (err: any) {
      addLog('error', `Diagnostic Error: ${err.message || String(err)}`);
    } finally {
      setIsDebugging(false);
    }
  };
  
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

  const fillAdminCredentials = (email: string, pass: string) => {
    setIdentifier(email);
    setPasskey(pass);
    addLog('info', `Auto-filled credentials for ${email}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLastError(null);
    
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
    addLog('info', `Attempting login for identifier: "${target}"...`);

    try {
      const { ok, status, data } = await safeFetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailOrPhone: target, 
          passkey: passkey,
          code: passkey,
          recaptchaToken
        })
      });
      
      if (ok && data.success && data.user) {
        addLog('success', `Login successful for user: ${data.user.name} (${data.user.email})`);
        onLoginSuccess(data.user);
      } else {
        const errorMsg = data.error || `Server returned status ${status}`;
        setLastError(errorMsg);
        addLog('error', `Login Failed [${status}]: ${errorMsg}`);
        
        openPopup(
          'Login Error / DB Notice',
          <div className="space-y-2 text-left text-xs">
            <p className="font-semibold text-red-400">{errorMsg}</p>
            {data.debugDetails && (
              <pre className="p-2 bg-slate-950 rounded text-[10px] text-amber-300 font-mono overflow-x-auto max-h-28 border border-slate-800">
                {data.debugDetails}
              </pre>
            )}
            <p className="text-slate-400 text-[11px] pt-1">
              Need help? Click <strong>🐞 Debugger</strong> to inspect system status.
            </p>
          </div>
        );

        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (err: any) {
      const errMsg = err.message || String(err);
      console.error('Login network error:', err);
      setLastError(errMsg);
      addLog('error', `Network/API Communication Error: ${errMsg}`);
      openPopup(
        'Database Connection Error',
        <div className="space-y-2 text-left text-xs">
          <p className="text-red-400 font-semibold">Failed to connect to backend server or database.</p>
          <pre className="p-2 bg-slate-950 rounded text-[10px] text-red-300 font-mono overflow-x-auto border border-slate-800">
            {errMsg}
          </pre>
          <button
            type="button"
            onClick={() => {
              setShowDebugger(true);
              runDbDiagnostic();
            }}
            className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-lg border border-emerald-500/30 text-center transition mt-2"
          >
            Open DB Debugger & Diagnostics
          </button>
        </div>
      );
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

        <div className="flex items-center gap-2">
          {/* Debugger Button */}
          <button
            type="button"
            onClick={() => {
              setShowDebugger(!showDebugger);
              if (!showDebugger) runDbDiagnostic();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-400 hover:text-amber-300 text-xs font-bold transition shadow-sm"
            title="Open DB & Auth Debugger"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debugger</span>
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
      </div>

      {/* Main Container */}
      <div className="my-auto z-10 max-w-sm mx-auto w-full space-y-5">
        {/* Database Status Indicator */}
        <div className="flex flex-col items-center gap-1 mb-2">
          {dbStatus ? (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
              dbStatus.connected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dbStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span>DB: {dbStatus.type}</span>
              <button 
                onClick={checkHealth}
                className="hover:rotate-180 transition-transform duration-300 p-0.5 ml-1 text-slate-400 hover:text-white"
                title="Refresh Health"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-900/50 border-slate-800 text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              <span>Checking Database...</span>
            </div>
          )}

          {lastError && (
            <div className="w-full bg-red-950/60 border border-red-800/80 rounded-xl p-2.5 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Login Error Detected:</span>
                <span className="text-[11px] text-red-200">{lastError}</span>
              </div>
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

        {/* Quick Admin Credentials Helper Pills */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Login Credentials</span>
            </span>
            <span className="text-[10px] text-slate-500">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillAdminCredentials('admin@gmail.com', '123456')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-left transition"
            >
              <div className="font-bold text-emerald-400 text-[10px]">Admin Account 1</div>
              <div className="text-slate-300 truncate font-mono">admin@gmail.com</div>
              <div className="text-slate-500 text-[9px]">Passkey: 123456</div>
            </button>
            <button
              type="button"
              onClick={() => fillAdminCredentials('admin@paypulse.com', '123456')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-left transition"
            >
              <div className="font-bold text-teal-400 text-[10px]">Admin Account 2</div>
              <div className="text-slate-300 truncate font-mono">admin@paypulse.com</div>
              <div className="text-slate-500 text-[9px]">Passkey: 123456</div>
            </button>
          </div>
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
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
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

      {/* Database Debugger Overlay / Modal */}
      {showDebugger && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black">
                <Bug className="w-5 h-5" />
                <span>Database & System Debugger</span>
              </div>
              <button
                onClick={() => setShowDebugger(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runDbDiagnostic}
                disabled={isDebugging}
                className="flex-1 min-w-[140px] bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDebugging ? 'animate-spin' : ''}`} />
                <span>Test DB & Diagnostics</span>
              </button>
              <button
                onClick={checkHealth}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>Ping /api/health</span>
              </button>
            </div>

            {/* DB Diagnostic Output */}
            {debugApiResult && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>API Diagnostic Results:</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-[11px] space-y-2 max-h-48 overflow-y-auto text-slate-300">
                  <div>
                    <span className="text-slate-500">Storage Type: </span>
                    <span className="text-emerald-400 font-bold">{debugApiResult.debugRes?.storageType || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">PG Database URL Present: </span>
                    <span className={debugApiResult.debugRes?.hasDbUrl ? 'text-emerald-400' : 'text-amber-400'}>
                      {debugApiResult.debugRes?.hasDbUrl ? 'YES (Env Variable Detected)' : 'NO (Using Local Fallback)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Registered Users Count: </span>
                    <span className="text-white font-bold">{debugApiResult.debugRes?.userCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">DB Ping Result: </span>
                    <span className={debugApiResult.testDbRes?.success ? 'text-emerald-400' : 'text-red-400'}>
                      {debugApiResult.testDbRes?.message || 'No response'}
                    </span>
                  </div>

                  {debugApiResult.debugRes?.users?.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 block font-bold mb-1">Users in DB:</span>
                      {debugApiResult.debugRes.users.map((u: any, idx: number) => (
                        <div key={idx} className="text-[10px] text-slate-300 flex items-center justify-between border-b border-slate-900 py-1">
                          <span>{u.name} ({u.email})</span>
                          <span className="text-amber-400 uppercase font-bold">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Debug Logs Console */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400">Live Console Event Logs:</div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-[10px] space-y-1.5 max-h-40 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <span className="text-slate-600 italic">No console logs recorded yet.</span>
                ) : (
                  debugLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-1.5 ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'success'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Helper Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  fillAdminCredentials('admin@gmail.com', '123456');
                  setShowDebugger(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs py-2.5 rounded-xl transition hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Auto-Fill Admin Account & Close Debugger</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
