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
  Lock,
  Zap,
  Info,
  Trash2,
} from 'lucide-react';
import { WalletState, VirtualCard, VirtualCardType } from '../../types';

interface VirtualCardsViewProps {
  wallet: WalletState;
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
  wallet,
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
    showToast(`Card number copied for ${card.cardName}!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Issue Card submit
  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const deposit = parseFloat(issueAmount || '0');
    if (deposit < 0) {
      alert('Amount cannot be negative');
      return;
    }
    if (deposit > wallet.balance) {
      alert(`Insufficient balance in wallet. Available: ${wallet.currency}${wallet.balance}`);
      return;
    }

    let prefix = '4532';
    let gradient = 'from-blue-700 via-indigo-800 to-slate-900';
    let defaultLabel = 'Virtual Visa Card';
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

    // Generate random card digits
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const fullDigits = (prefix + randomDigits).slice(0, cardLen);

    // Format card number with spaces
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
      cardholderName: (wallet.user.name || 'ACCOUNT HOLDER').toUpperCase(),
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
      alert('Please enter a valid amount.');
      return;
    }
    if (amt > wallet.balance) {
      alert(`Insufficient wallet balance. Available: ${wallet.currency}${wallet.balance}`);
      return;
    }

    onTopUpCard(topUpCardTarget.id, amt);
    showToast(`Added ${wallet.currency}${amt} to ${topUpCardTarget.cardName}!`);
    setTopUpCardTarget(null);
    setTopUpAmount('');
  };

  // Withdraw submit
  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawCardTarget) return;
    const amt = parseFloat(withdrawAmount || '0');
    if (amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (amt > withdrawCardTarget.balance) {
      alert(`Cannot withdraw more than card balance (${wallet.currency}${withdrawCardTarget.balance}).`);
      return;
    }

    onWithdrawCard(withdrawCardTarget.id, amt);
    showToast(`Transferred ${wallet.currency}${amt} back to main wallet!`);
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
            Virtual Cards
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

      {/* Wallet Balance Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Main Wallet Balance</p>
          <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
            {wallet.currency}
            {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            className={`flex-1 min-w-[75px] py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
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

      {/* Cards List */}
      {filteredCards.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No {filterType.toUpperCase()} cards found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Create your instant Virtual Visa, MasterCard, or Amex Card in seconds for online purchases & subscriptions.
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
        <div className="space-y-4">
          {filteredCards.map((card) => {
            const isVisible = !!showCardNumbers[card.id];
            return (
              <div
                key={card.id}
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-xl ${
                  card.isFrozen
                    ? 'bg-slate-900 border-slate-800 opacity-80'
                    : `bg-gradient-to-br ${card.colorGradient} border-white/20 hover:border-white/40`
                }`}
              >
                {/* Frozen Overlay Badge */}
                {card.isFrozen && (
                  <div className="absolute top-3 right-3 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 backdrop-blur-md">
                    <Snowflake className="w-3 h-3 animate-spin" />
                    <span>FROZEN</span>
                  </div>
                )}

                <div className="p-5 space-y-4 text-white">
                  {/* Card Top Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block">
                        {card.cardName}
                      </span>
                      <p className="text-xs font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Instant Virtual Card</span>
                      </p>
                    </div>

                    {/* Card Brand Badge */}
                    <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono font-black text-xs tracking-wider flex items-center gap-1">
                      {card.type === 'visa' && (
                        <span className="text-blue-300 font-extrabold italic tracking-tighter text-sm">VISA</span>
                      )}
                      {card.type === 'mastercard' && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-500/90"></div>
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90 -ml-2"></div>
                          <span className="text-[10px] font-bold ml-1">Mastercard</span>
                        </div>
                      )}
                      {card.type === 'amex' && (
                        <span className="text-emerald-300 font-black tracking-widest text-[11px]">AMEX</span>
                      )}
                    </div>
                  </div>

                  {/* Card Number & Copy */}
                  <div className="bg-black/25 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                    <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-100">
                      {isVisible
                        ? card.cardNumber
                        : card.cardNumber.replace(/\d(?=\d{4})/g, '•')}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleShowNumber(card.id)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
                        title={isVisible ? 'Hide Details' : 'Show Details'}
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleCopyCardNumber(card)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
                        title="Copy Card Number"
                      >
                        {copiedId === card.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom Meta (Holder, Expiry, CVV, Balance) */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-[9px] uppercase text-white/60 font-semibold block">Cardholder</span>
                      <p className="font-bold text-white truncate">{card.cardholderName}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-white/60 font-semibold block">Expires / CVV</span>
                      <p className="font-mono font-bold text-white">
                        {card.expiryDate} • {isVisible ? card.cvv : '•••'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase text-white/60 font-semibold block">Card Balance</span>
                      <p className="font-mono font-black text-emerald-300 text-xs">
                        {wallet.currency}
                        {card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Controls Row */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Freeze Button */}
                      <button
                        onClick={() => {
                          onToggleFreezeCard(card.id);
                          showToast(
                            card.isFrozen
                              ? `${card.cardName} Unfrozen!`
                              : `${card.cardName} Frozen for safety!`
                          );
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                          card.isFrozen
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {card.isFrozen ? (
                          <>
                            <Flame className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Unfreeze</span>
                          </>
                        ) : (
                          <>
                            <Snowflake className="w-3.5 h-3.5" />
                            <span>Freeze</span>
                          </>
                        )}
                      </button>

                      {/* Top Up Button */}
                      <button
                        onClick={() => {
                          setTopUpCardTarget(card);
                          setTopUpAmount('');
                        }}
                        disabled={card.isFrozen}
                        className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Top Up</span>
                      </button>

                      {/* Withdraw Button */}
                      <button
                        onClick={() => {
                          setWithdrawCardTarget(card);
                          setWithdrawAmount('');
                        }}
                        disabled={card.isFrozen || card.balance <= 0}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    </div>

                    {/* Delete Card Button */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to close/delete ${card.cardName}? Remaining balance will be refunded.`)) {
                          if (card.balance > 0) {
                            onWithdrawCard(card.id, card.balance);
                          }
                          onDeleteCard(card.id);
                          showToast(`${card.cardName} closed.`);
                        }
                      }}
                      className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-xl transition"
                      title="Close Virtual Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                    { type: 'mastercard', name: 'MasterCard', icon: '🟧', desc: 'Online Shopping' },
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
                    Avail: {wallet.currency}{wallet.balance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold font-mono">
                    {wallet.currency}
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
                <span className="text-slate-400">Available Wallet Balance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {wallet.currency}{wallet.balance.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Enter Top Up Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-mono font-bold">
                    {wallet.currency}
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
                  {wallet.currency}{withdrawCardTarget.balance.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Enter Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-mono font-bold">
                    {wallet.currency}
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
                  Confirm Transfer to Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
