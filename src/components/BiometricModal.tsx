import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, CheckCircle2, AlertTriangle, Lock, RefreshCw, X, Scan } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  amount: number;
  currency: string;
  recipientName: string;
  onSuccess: () => void;
  onCancel: () => void;
  onFallbackToPin: () => void;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  amount,
  currency,
  recipientName,
  onSuccess,
  onCancel,
  onFallbackToPin,
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [authType, setAuthType] = useState<'fingerprint' | 'face_id'>('fingerprint');

  if (!isOpen) return null;

  const handleBiometricScan = () => {
    setStatus('scanning');
    
    // Biometric sensor processing & authentication
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        setStatus('idle');
      }, 900);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl relative overflow-hidden text-center">
        {/* Background Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              High-Value Biometric Protection
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            High-Value Transfer Amount
          </span>
          <div className="text-2xl font-extrabold text-white">
            <span className="text-emerald-400">{currency}</span>
            {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400">
            Recipient: <strong className="text-slate-200">{recipientName}</strong>
          </p>
        </div>

        {/* Biometric Scanner Visualizer */}
        <div className="py-2 flex flex-col items-center justify-center space-y-4">
          <div
            onClick={status === 'idle' ? handleBiometricScan : undefined}
            className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
              status === 'scanning'
                ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/30 scale-105'
                : status === 'success'
                ? 'border-emerald-400 bg-emerald-500/20 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-400/30'
                : 'border-slate-700 bg-slate-950/80 hover:border-emerald-500/60 hover:bg-slate-900'
            }`}
          >
            {/* Animated Laser Scanning Line */}
            {status === 'scanning' && (
              <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-md shadow-emerald-400/80 animate-bounce"></div>
            )}

            {/* Icon depending on mode and status */}
            {status === 'success' ? (
              <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-pulse" />
            ) : authType === 'fingerprint' ? (
              <Fingerprint
                className={`w-14 h-14 transition ${
                  status === 'scanning'
                    ? 'text-emerald-400 animate-pulse'
                    : 'text-slate-400 group-hover:text-emerald-400'
                }`}
              />
            ) : (
              <Scan
                className={`w-14 h-14 transition ${
                  status === 'scanning'
                    ? 'text-emerald-400 animate-pulse'
                    : 'text-slate-400'
                }`}
              />
            )}
          </div>

          {/* Status Message */}
          <div>
            {status === 'idle' && (
              <p className="text-xs font-semibold text-slate-300">
                Tap fingerprint sensor or scan Face ID
              </p>
            )}
            {status === 'scanning' && (
              <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-scode" />
                Verifying Biometric Credentials...
              </p>
            )}
            {status === 'success' && (
              <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Biometric Authentication Success!
              </p>
            )}
          </div>

          {/* Toggle Sensor Mode */}
          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAuthType('fingerprint')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                authType === 'fingerprint'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Touch ID
            </button>
            <button
              type="button"
              onClick={() => setAuthType('face_id')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                authType === 'face_id'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Face ID
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {status === 'idle' && (
            <button
              onClick={handleBiometricScan}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Scan Biometrics Now</span>
            </button>
          )}

          <button
            onClick={onFallbackToPin}
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-700/60 transition flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Use 4-Digit Security Code Instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
