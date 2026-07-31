import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
  HelpCircle,
} from 'lucide-react';

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface PopupDialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  showCancel?: boolean;
}

export const PopupDialog: React.FC<PopupDialogProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  showCancel = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  // Icon & Theme Styling based on type
  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          iconBg: 'bg-emerald-500/15 border-emerald-500/30',
          btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
          titleColor: 'text-emerald-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          iconBg: 'bg-amber-500/15 border-amber-500/30',
          btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
          titleColor: 'text-amber-400',
        };
      case 'error':
        return {
          icon: <XCircle className="w-6 h-6 text-rose-400" />,
          iconBg: 'bg-rose-500/15 border-rose-500/30',
          btnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
          titleColor: 'text-rose-400',
        };
      case 'confirm':
        return {
          icon: <HelpCircle className="w-6 h-6 text-indigo-400" />,
          iconBg: 'bg-indigo-500/15 border-indigo-500/30',
          btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          titleColor: 'text-indigo-300',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-sky-400" />,
          iconBg: 'bg-sky-500/15 border-sky-500/30',
          btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
          titleColor: 'text-white',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 transform transition-all animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${theme.iconBg}`}
          >
            {theme.icon}
          </div>
          <div>
            <h3 className={`text-base font-extrabold tracking-tight ${theme.titleColor}`}>
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Notification Dialog</p>
          </div>
        </div>

        {/* Message Body */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {(showCancel || type === 'confirm') && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 px-4 rounded-2xl text-xs font-bold transition active:scale-95"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold shadow-lg transition active:scale-95 ${theme.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
