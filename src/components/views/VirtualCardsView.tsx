import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  PlusCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Snowflake,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Trash2,
  Wifi,
} from 'lucide-react';
import { AppState, VirtualCard, VirtualCardType } from '../../types';
import { PopupDialog, DialogType } from '../ui/PopupDialog';

interface VirtualCardsViewProps {
  app: AppState;
  cards: VirtualCard[];
  initialSelectedType?: VirtualCardType | 'all' | null;
  onBack: () => void;
  onIssueCard: (newCard: VirtualCard, initialDeposit: number) => void;
  onTopUpCard: (cardId: string, amount: number) => void;
  onWithdrawCard: (cardId: string, amount: number) => void;
  onToggleFreezeCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const VirtualCardsView: React.FC<VirtualCardsViewProps> = ({
  app,
  cards,
  initialSelectedType = 'all',
  onBack,
  onIssueCard,
  onTopUpCard,
  onWithdrawCard,
  onToggleFreezeCard,
  onDeleteCard,
}) => {
  const [filterType, setFilterType] = useState<VirtualCardType | 'all'>(
    initialSelectedType && initialSelectedType !== 'all' ? initialSelectedType : 'all'
  );
  const [showCardNumbers, setShowCardNumbers] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueCardType, setIssueCardType] = useState<VirtualCardType>('visa');
  const [issueCardName, setIssueCardName] = useState('');
  const [issueAmount, setIssueAmount] = useState('10');

  const [topUpCardTarget, setTopUpCardTarget] = useState<VirtualCard | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const [withdrawCardTarget, setWithdrawCardTarget] = useState<VirtualCard | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Custom Popup Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type?: DialogType;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const openPopup = (
    title: string,
    message: React.ReactNode,
    type: DialogType = 'info',
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closePopup = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredCards = filterType === 'all'
    ? cards
    : cards.filter((c) => c.type === filterType);

  const toggleShowNumber = (id: string) => {
    setShowCardNumbers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCardNumber = (card: VirtualCard) => {
    const rawNumber = card.cardNumber.replace(/\s+/g, '');
    navigator.clipboard.writeText(rawNumber);
    setCopiedId(card.id);
    showToast(`Copied card number for ${card.cardName}!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Issue Card submit
  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const deposit = parseFloat(issueAmount || '0');
    if (deposit < 0) {
      openPopup('Invalid Amount', 'Deposit amount cannot be negative.', 'warning');
      return;
    }
    if (deposit > app.balance) {
      openPopup(
        'Insufficient Balance',
        `You do not have enough app balance. Available balance: ${app.currency}${app.balance.toFixed(2)}`,
        'error'
      );
      return;
    }

    let prefix = '4532';
    let gradient = 'from-blue-700 via-indigo-800 to-slate-900';
    let defaultLabel = 'Virtual Visa Platinum';
    let cvvLength = 3;
    let cardLen = 16;

    if (issueCardType === 'mastercard') {
      prefix = '5412';
      gradient = 'from-amber-600 via-orange-600 to-red-800';
      defaultLabel = 'Virtual MasterCard Gold';
    } else if (issueCardType === 'amex') {
      prefix = '3782';
      gradient = 'from-emerald-700 via-teal-800 to-slate-950';
      defaultLabel = 'Virtual Amex Centurion';
      cvvLength = 4;
    }

    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const fullDigits = (prefix + randomDigits).slice(0, cardLen);

    let formattedNum = fullDigits;
    if (issueCardType === 'amex') {
      formattedNum = `${fullDigits.slice(0, 4)} ${fullDigits.slice(4, 10)} ${fullDigits.slice(10, 15)}`;
    } else {
      formattedNum = fullDigits.match(/.{1,4}/g)?.join(' ') || fullDigits;
    }

    const randomCvv = Math.floor(100 + Math.random() * (cvvLength === 4 ? 9000 : 900)).toString();

    const newCard: VirtualCard = {
      id: `vc_${Date.now()}`,
      type: issueCardType,
      cardName: issueCardName.trim() || defaultLabel,
      cardNumber: formattedNum,
      cardholderName: (app.user.name || 'ACCOUNT HOLDER').toUpperCase(),
      expiryDate: '08/30',
      cvv: randomCvv,
      balance: deposit,
      isFrozen: false,
      colorGradient: gradient,
      createdAt: new Date().toISOString(),
    };

    onIssueCard(newCard, deposit);
    setShowIssueModal(false);
    setIssueCardName('');
    setIssueAmount('10');
    showToast(`Successfully issued ${newCard.cardName}!`);
  };

  // Top Up submit
  const handleConfirmTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpCardTarget) return;
    const amt = parseFloat(topUpAmount || '0');
    if (amt <= 0) {
      openPopup('Invalid Amount', 'Please enter a valid top up amount.', 'warning');
      return;
    }
    if (amt > app.balance) {
      openPopup(
        'Insufficient Balance',
        `Insufficient app balance. Available: ${app.currency}${app.balance.toFixed(2)}`,
        'error'
      );
      return;
    }

    onTopUpCard(topUpCardTarget.id, amt);
    showToast(`Added ${app.currency}${amt} to ${topUpCardTarget.cardName}!`);
    setTopUpCardTarget(null);
    setTopUpAmount('');
  };

  // Withdraw submit
  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawCardTarget) return;
    const amt = parseFloat(withdrawAmount || '0');
    if (amt <= 0) {
      openPopup('Invalid Amount', 'Please enter a valid withdrawal amount.', 'warning');
      return;
    }
    if (amt > withdrawCardTarget.balance) {
      openPopup(
        'Card Balance Exceeded',
        `Cannot withdraw more than card balance (${app.currency}${withdrawCardTarget.balance.toFixed(2)}).`,
        'warning'
      );
      return;
    }

    onWithdrawCard(withdrawCardTarget.id, amt);
    showToast(`Transferred ${app.currency}${amt} back to main app!`);
    setWithdrawCardTarget(null);
    setWithdrawAmount('');
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-300 animate-bounce">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Virtual Cards Hub
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">Visa, MasterCard & Amex Cards</p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue Card</span>
        </button>
      </div>

      {/* App Balance Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Main App Balance</p>
          <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
            {app.currency}
            {app.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Virtual Cards</p>
          <span className="inline-block mt-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg">
            {cards.length} Cards
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'all', label: 'All Cards', icon: '💳' },
          { id: 'visa', label: 'Visa', icon: '🟦' },
          { id: 'mastercard', label: 'MasterCard', icon: '🟧' },
          { id: 'amex', label: 'Amex', icon: '🟩' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              filterType === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No {filterType.toUpperCase()} cards found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Create an instant Virtual Visa, MasterCard, or Amex Card in seconds for global online payments.
          </p>
          <button
            onClick={() => {
              if (filterType !== 'all') setIssueCardType(filterType as VirtualCardType);
              setShowIssueModal(true);
            }}
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-2xl font-extrabold text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue Virtual Card Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCards.map((card) => {
            const isVisible = !!showCardNumbers[card.id];

            // Brand style configurations for ultra-realistic rendering
            let bgGradient = 'from-slate-950 via-blue-950 to-indigo-950 border-blue-500/30';
            let chipStyle = 'from-amber-200 via-amber-400 to-yellow-300 border-amber-600/70';

            if (card.type === 'mastercard') {
              bgGradient = 'from-slate-950 via-red-950 to-amber-950 border-orange-500/30';
              chipStyle = 'from-amber-200 via-yellow-400 to-amber-300 border-amber-600/70';
            } else if (card.type === 'amex') {
              bgGradient = 'from-slate-950 via-emerald-950 to-teal-950 border-emerald-500/30';
              chipStyle = 'from-slate-200 via-slate-300 to-slate-100 border-slate-400/80';
            }

            return (
              <div key={card.id} className="space-y-2">
                {/* 3D Realistic Credit Card Face */}
                <div
                  className={`relative w-full aspect-[1.586/1] rounded-[24px] overflow-hidden p-5 sm:p-6 flex flex-col justify-between border shadow-2xl transition-all duration-300 bg-gradient-to-br ${
                    card.isFrozen ? 'from-slate-900 via-slate-950 to-slate-900 border-cyan-500/40 opacity-80' : bgGradient
                  }`}
                >
                  {/* Glossy Diagonal Light Reflection Sheen */}
                  <div className="absolute -inset-full top-0 block w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 pointer-events-none" />

                  {/* Frozen Overlay */}
                  {card.isFrozen && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-2">
                        <Snowflake className="w-5 h-5 animate-scode" />
                      </div>
                      <span className="text-xs font-black tracking-widest text-cyan-300 uppercase">Card Frozen</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Click Unfreeze to reactivate card</p>
                    </div>
                  )}

                  {/* Card Top Row: Nickname & Brand Logo */}
                  <div className="flex items-start justify-between z-10">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-extrabold text-white/70 tracking-widest uppercase">
                          {card.cardName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[9px] font-medium text-white/50 tracking-wide mt-0.5">
                        VIRTUAL INTERNATIONAL DEBIT
                      </p>
                    </div>

                    {/* Brand Realistic Logo */}
                    <div className="flex items-center gap-2">
                      {/* Card Balance Tag */}
                      <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-right">
                        <span className="text-[8px] font-bold text-white/60 block uppercase">Card Balance</span>
                        <span className="text-xs font-black font-mono text-emerald-400">
                          {app.currency}
                          {card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Brand Icon SVG */}
                      {card.type === 'visa' && (
                        <div className="bg-blue-600/30 backdrop-blur-md border border-blue-400/30 px-2.5 py-1 rounded-xl">
                          <span className="font-extrabold italic text-sm text-blue-200 tracking-tighter">VISA</span>
                        </div>
                      )}

                      {card.type === 'mastercard' && (
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-xl flex items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full bg-red-600 shadow-md"></div>
                          <div className="w-4 h-4 rounded-full bg-amber-500 shadow-md -ml-2"></div>
                          <span className="text-[9px] font-black text-white/90 ml-1 font-mono">mastercard</span>
                        </div>
                      )}

                      {card.type === 'amex' && (
                        <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 px-2.5 py-1 rounded-xl">
                          <span className="font-black text-xs text-emerald-300 tracking-widest">AMEX</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Middle Row: EMV Metallic Chip & Contactless Waves */}
                  <div className="flex items-center justify-between z-10 my-1">
                    {/* Golden Metallic Chip */}
                    <div className={`w-11 h-8 rounded-lg bg-gradient-to-tr ${chipStyle} shadow-md relative p-1 flex flex-col justify-between`}>
                      <div className="w-full h-1/2 border-b border-amber-800/40 flex">
                        <div className="w-1/2 border-r border-amber-800/40"></div>
                      </div>
                      <div className="w-full h-1/2 flex">
                        <div className="w-1/2 border-r border-amber-800/40"></div>
                      </div>
                    </div>

                    {/* Contactless Waves Icon */}
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Wifi className="w-5 h-5 rotate-90 drop-shadow" />
                    </div>
                  </div>

                  {/* Card Number Row */}
                  <div className="z-10 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-between">
                    <span className="font-mono text-sm sm:text-base font-black tracking-[0.2em] text-white drop-shadow">
                      {isVisible
                        ? card.cardNumber
                        : card.cardNumber.replace(/\d(?=\d{4})/g, '•')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleShowNumber(card.id)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
                        title={isVisible ? 'Hide Details' : 'Show Details'}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopyCardNumber(card)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
                        title="Copy Card Number"
                      >
                        {copiedId === card.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] z-10 pt-1">
                    <div>
                      <span className="text-[8px] font-bold uppercase text-white/50 block">CARDHOLDER</span>
                      <p className="font-mono font-bold text-white truncate drop-shadow">{card.cardholderName}</p>
                    </div>

                    <div>
                      <span className="text-[8px] font-bold uppercase text-white/50 block">EXPIRES</span>
                      <p className="font-mono font-bold text-white drop-shadow">{card.expiryDate}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] font-bold uppercase text-white/50 block">CVV CODE</span>
                      <p className="font-mono font-bold text-emerald-300 drop-shadow">
                        {isVisible ? card.cvv : '•••'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Control Bar underneath card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-md">
                  <div className="flex items-center gap-2">
                    {/* Freeze / Unfreeze */}
                    <button
                      onClick={() => {
                        onToggleFreezeCard(card.id);
                        showToast(
                          card.isFrozen
                            ? `${card.cardName} Unfrozen!`
                            : `${card.cardName} Frozen safely!`
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        card.isFrozen
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {card.isFrozen ? (
                        <>
                          <Flame className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Unfreeze</span>
                        </>
                      ) : (
                        <>
                          <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Freeze</span>
                        </>
                      )}
                    </button>

                    {/* Top Up */}
                    <button
                      onClick={() => {
                        setTopUpCardTarget(card);
                        setTopUpAmount('');
                      }}
                      disabled={card.isFrozen}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Top Up</span>
                    </button>

                    {/* Withdraw */}
                    <button
                      onClick={() => {
                        setWithdrawCardTarget(card);
                        setWithdrawAmount('');
                      }}
                      disabled={card.isFrozen || card.balance <= 0}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </div>

                  {/* Close Card */}
                  <button
                    onClick={() => {
                      openPopup(
                        'Close Virtual Card',
                        `Are you sure you want to close/delete ${card.cardName}? Remaining balance will be refunded to your app.`,
                        'confirm',
                        () => {
                          if (card.balance > 0) {
                            onWithdrawCard(card.id, card.balance);
                          }
                          onDeleteCard(card.id);
                          showToast(`${card.cardName} closed.`);
                        },
                        'Close Card'
                      );
                    }}
                    className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 rounded-xl transition"
                    title="Close Virtual Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK ISSUE CARD MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Issue Virtual Card</h3>
                  <p className="text-[11px] text-slate-400">Instant activation for global online payments</p>
                </div>
              </div>

              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmIssue} className="space-y-4">
              {/* Select Card Brand */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Select Card Brand</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'visa', name: 'Virtual Visa', icon: '🟦', desc: 'Global Visa' },
                    { type: 'mastercard', name: 'MasterCard', icon: '🟧', desc: 'Online Shopcodeg' },
                    { type: 'amex', name: 'Amex Card', icon: '🟩', desc: 'American Express' },
                  ].map((brand) => (
                    <button
                      key={brand.type}
                      type="button"
                      onClick={() => setIssueCardType(brand.type as VirtualCardType)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        issueCardType === brand.type
                          ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg">{brand.icon}</span>
                      <div className="mt-2">
                        <span className="text-xs font-bold block text-white">{brand.name}</span>
                        <span className="text-[9px] text-slate-400 block">{brand.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Label */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Card Nickname (Optional)</label>
                <input
                  type="text"
                  value={issueCardName}
                  onChange={(e) => setIssueCardName(e.target.value)}
                  placeholder={`e.g. My Virtual ${issueCardType.toUpperCase()} Card`}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3 text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Initial Deposit */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 block">Initial Card Deposit</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Avail: {app.currency}{app.balance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold font-mono">
                    {app.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={issueAmount}
                    onChange={(e) => setIssueAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm rounded-2xl pl-8 pr-4 py-3 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Info box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Your Virtual {issueCardType.toUpperCase()} Card will be issued instantly with a 16-digit card number, CVV, and expiry date.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl text-xs font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition"
                >
                  Issue Card Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP UP CARD MODAL */}
      {topUpCardTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                Top Up {topUpCardTarget.cardName}
              </h3>
              <button onClick={() => setTopUpCardTarget(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleConfirmTopUp} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Available App Balance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {app.currency}{app.balance.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Enter Top Up Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-mono font-bold">
                    {app.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm rounded-2xl pl-8 pr-4 py-3 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopUpCardTarget(null)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl text-xs font-extrabold shadow-lg"
                >
                  Confirm Top Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAW CARD MODAL */}
      {withdrawCardTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Withdraw from {withdrawCardTarget.cardName}
              </h3>
              <button onClick={() => setWithdrawCardTarget(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Card Balance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {app.currency}{withdrawCardTarget.balance.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Enter Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-mono font-bold">
                    {app.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm rounded-2xl pl-8 pr-4 py-3 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawCardTarget(null)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl text-xs font-extrabold shadow-lg"
                >
                  Confirm Transfer to App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PopupDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onClose={closePopup}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
      />
    </div>
  );
};
