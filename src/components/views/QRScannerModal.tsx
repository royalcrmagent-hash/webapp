import React, { useState } from 'react';
import { QrCode, X, Camera, Zap, CheckCircle2 } from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (merchantName: string, merchantPhone: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onScanSuccess,
}) => {
  const [scanning, setScanning] = useState(false);

  const merchantList = [
    { name: 'Aarong Retail Store', phone: '01700998811' },
    { name: 'Unimart Supershop', phone: '01811223344' },
    { name: 'KFC Restaurant', phone: '01922334455' },
    { name: 'Rahim Ahmed (Personal)', phone: '01712345678' },
  ];

  const handleScanMerchant = (m: { name: string; phone: string }) => {
    setScanning(true);
    setTimeout(() => {
      onScanSuccess(m.name, m.phone);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-xs text-center space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-emerald-400">
          <QrCode className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Scan App QR Code</h3>
        </div>

        {/* Animated Camera Scanner Frame */}
        <div className="relative w-48 h-48 mx-auto bg-slate-950 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
          <div className="absolute inset-x-0 h-1 bg-emerald-400/80 shadow-[0_0_15px_#10b981] animate-bounce"></div>
          <Camera className="w-8 h-8 text-slate-700" />
          <span className="absolute bottom-2 text-[10px] text-slate-500 font-mono">
            Align QR in frame
          </span>
        </div>

        <div className="space-y-2 pt-1 text-left">
          <label className="text-[11px] font-semibold text-slate-400 block">
            Select Merchant QR to Scan:
          </label>
          <div className="space-y-1.5">
            {merchantList.map((m) => (
              <button
                key={m.phone}
                onClick={() => handleScanMerchant(m)}
                disabled={scanning}
                className="w-full bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-left flex items-center justify-between transition border border-slate-700/60"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{m.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400">{m.phone}</p>
                </div>
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
