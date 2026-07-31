import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  User,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info,
  Download,
  Share2,
  AlertCircle,
  Key,
  Send,
  Zap,
  Fingerprint,
} from 'lucide-react';
import { Contact, Transaction, WalletState } from '../../types';
import { BiometricModal } from '../BiometricModal';

interface SendMoneyViewProps {
  wallet: WalletState;
  onBack: () => void;
  onSendSuccess: (txn: Transaction, newBalance: number) => void;
  initialRecipient?: { name: string; phone: string; avatar?: string } | null;
  biometricThreshold?: number;
  biometricRequired?: boolean;
}

export const SendMoneyView: React.FC<SendMoneyViewProps> = ({
  wallet,
  onBack,
  onSendSuccess,
  initialRecipient = null,
  biometricThreshold = 1000,
  biometricRequired = true,
}) => {
  // Steps: 'select_recipient' | 'enter_amount' | 'enter_pin' | 'confirming' | 'success'
  const [step, setStep] = useState<
    'select_recipient' | 'enter_amount' | 'enter_pin' | 'confirming' | 'success'
  >(initialRecipient ? 'enter_amount' : 'select_recipient');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<{
    name: string;
    phone: string;
    avatar?: string;
  } | null>(initialRecipient);

  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [biometricVerified, setBiometricVerified] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('Transfer');
  const [customCategory, setCustomCategory] = useState<string>('');

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const categoriesList = [
    'Transfer',
    'Groceries',
    'Rent',
    'Entertainment',
    'Shopping',
    'Food & Dining',
    'Bills',
    'Medical',
    'Travel',
    'Custom',
  ];

  // Filter contacts
  const filteredContacts = wallet.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleSelectContact = (contact: Contact) => {
    setSelectedRecipient({
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar,
    });
    setStep('enter_amount');
  };

  const handleCustomPhoneProceed = () => {
    if (!searchQuery || searchQuery.trim().length < 6) {
      alert('Please enter a valid mobile number or account ID.');
      return;
    }
    // Check if matching contact exists
    const match = wallet.contacts.find((c) => c.phone === searchQuery.trim());
    setSelectedRecipient({
      name: match ? match.name : `Account (${searchQuery.trim()})`,
      phone: searchQuery.trim(),
      avatar: match?.avatar,
    });
    setStep('enter_amount');
  };

  const handleProceedToPin = () => {
    setAmountError('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount.');
      return;
    }
    if (numAmount > wallet.balance) {
      setAmountError(
        `Insufficient balance. Available: ${wallet.currency}${wallet.balance.toLocaleString()}`
      );
      return;
    }
    setStep('enter_pin');
  };

  const performFinalTransfer = () => {
    setPinError('');
    setStep('confirming');

    // Process transaction request
    setTimeout(() => {
      const numAmount = parseFloat(amount);
      const newBalance = wallet.balance - numAmount;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = 'Today';

      const categoryTag = selectedCategory === 'Custom' 
        ? (customCategory.trim() || 'Custom') 
        : selectedCategory;

      const txn: Transaction = {
        id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'sent',
        title: 'Send Money',
        recipientName: selectedRecipient?.name || 'Recipient',
        recipientPhone: selectedRecipient?.phone || '',
        amount: numAmount,
        fee: 0,
        date: dateStr,
        time: timeStr,
        status: 'completed',
        reference: reference || 'Send Money',
        category: categoryTag,
      };

      setCompletedTxn(txn);
      onSendSuccess(txn, newBalance);
      setStep('success');
    }, 1200);
  };

  const handleExecuteSendMoney = () => {
    const numAmount = parseFloat(amount) || 0;
    const isHighValue = numAmount >= biometricThreshold;

    // Check if high-value biometric check is required and not done yet
    if (isHighValue && biometricRequired && !biometricVerified) {
      setShowBiometricModal(true);
      return;
    }

    if (pin !== wallet.user.pin) {
      setPinError('Incorrect PIN. Please verify your 4-digit security PIN.');
      return;
    }

    performFinalTransfer();
  };

  const handleBiometricSuccess = () => {
    setBiometricVerified(true);
    setShowBiometricModal(false);
    setPin(wallet.user.pin); // Autofill PIN upon biometric scan
    performFinalTransfer();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
            <Send className="w-4 h-4 text-emerald-400" />
            Send Money
          </h2>
          <p className="text-[11px] text-slate-400">Instant Wallet Transfer</p>
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          {wallet.currency}
        </div>
      </div>

      {/* Available Balance Pill */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 mb-4 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs text-slate-400">Available Balance:</span>
        </div>
        <span className="text-sm font-bold text-emerald-400">
          {wallet.currency}
          {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* STEP 1: SELECT RECIPIENT */}
      {step === 'select_recipient' && (
        <div className="flex-1 flex flex-col space-y-4">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select or Enter Recipient
          </label>

          {/* Search or Phone Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.length >= 6) {
                handleCustomPhoneProceed();
              }
            }}
            className="relative"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or enter mobile number..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery.length >= 6 && (
              <button
                type="submit"
                className="absolute right-2 top-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Favorites / Quick Contacts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Saved Contacts</span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {filteredContacts.length} available
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition transform active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                        {contact.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {contact.name}
                        {contact.favorite && (
                          <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </h4>
                      <p className="text-xs font-mono text-slate-400">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="text-center py-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
                  <User className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">No contact found matching "{searchQuery}"</p>
                  {searchQuery.length >= 6 && (
                    <button
                      onClick={handleCustomPhoneProceed}
                      className="mt-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 transition"
                    >
                      Send to "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ENTER AMOUNT */}
      {step === 'enter_amount' && selectedRecipient && (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Selected Recipient Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedRecipient.avatar ? (
                <img
                  src={selectedRecipient.avatar}
                  alt={selectedRecipient.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                  {selectedRecipient.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Sending To
                </span>
                <h4 className="text-sm font-bold text-white">{selectedRecipient.name}</h4>
                <p className="text-xs font-mono text-slate-400">{selectedRecipient.phone}</p>
              </div>
            </div>
            <button
              onClick={() => setStep('select_recipient')}
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              Change
            </button>
          </div>

          {/* Amount Input */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
            <label className="text-xs text-slate-400 font-medium block mb-2">
              Enter Transfer Amount
            </label>

            <div className="flex items-center justify-center gap-1 my-2">
              <span className="text-2xl font-bold text-emerald-400">{wallet.currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError('');
                }}
                placeholder="0"
                className="w-48 text-3xl font-extrabold text-white text-center bg-transparent focus:outline-none placeholder-slate-600"
                autoFocus
              />
            </div>

            {amountError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {amountError}
              </p>
            )}

            {/* Fast Quick Amount Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setAmount(q.toString());
                    setAmountError('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    amount === q.toString()
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                  }`}
                >
                  +{wallet.currency}
                  {q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category / Label Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Transaction Category / Label
            </label>
            <div className="flex flex-wrap gap-1.5 custom-scrollbar">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'Custom' ? '✏️ Custom' : cat}
                </button>
              ))}
            </div>

            {selectedCategory === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category label (e.g. Groceries, Rent)..."
                className="w-full mt-2 bg-slate-900 border border-emerald-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
          </div>

          {/* Optional Reference */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">
              Reference / Note (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Lunch split, Gift, Bills"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Fee & Limits Notice */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Charge / Fee:
            </span>
            <span className="font-bold text-emerald-400">FREE (৳0.00)</span>
          </div>

          <div className="mt-auto pt-4">
            <button
              onClick={handleProceedToPin}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Proceed to Security PIN</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ENTER SECURITY PIN */}
      {step === 'enter_pin' && selectedRecipient && (
        <div className="flex-1 flex flex-col space-y-4 justify-between">
          <div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Enter 4-Digit Wallet PIN</h3>
              <p className="text-xs text-slate-400">
                Sending{' '}
                <span className="text-emerald-400 font-bold">
                  {wallet.currency}
                  {parseFloat(amount).toLocaleString()}
                </span>{' '}
                to <span className="text-white font-semibold">{selectedRecipient.name}</span>
              </p>
            </div>

            {/* PIN Display Dots */}
            <div className="my-6 flex justify-center items-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                    pin[idx]
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 scale-105'
                      : 'border-slate-800 bg-slate-900 text-slate-600'
                  }`}
                >
                  {pin[idx] ? '●' : ''}
                </div>
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 text-center font-medium mb-2 animate-shake">
                {pinError}
              </p>
            )}

            {/* Onscreen Keypad for PIN */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') {
                      setPin('');
                    } else if (key === '⌫') {
                      setPin((prev) => prev.slice(0, -1));
                    } else if (pin.length < 4) {
                      setPin((prev) => prev + key);
                    }
                  }}
                  className="h-12 bg-slate-900 border border-slate-800/90 rounded-2xl text-base font-bold text-slate-100 hover:bg-slate-800 active:scale-95 transition flex items-center justify-center"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Quick Biometric Verification Button */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowBiometricModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Verify with Touch ID / Face ID</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleExecuteSendMoney}
              disabled={pin.length !== 4 && !biometricVerified}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Send Money</span>
            </button>
            <button
              onClick={() => setStep('enter_amount')}
              className="w-full text-xs text-slate-400 hover:text-white py-2"
            >
              Back to Amount
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PROCESSING / CONFIRMING */}
      {step === 'confirming' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
            <Send className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transferring Funds...</h3>
            <p className="text-xs text-slate-400 mt-1">Please wait while we process your transaction.</p>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS RECEIPT */}
      {step === 'success' && completedTxn && (
        <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
          <div className="space-y-4 text-center">
            {/* Animated Checkmark */}
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
                Transaction Successful
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2">
                {wallet.currency}
                {completedTxn.amount.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400">Sent to {completedTxn.recipientName}</p>
            </div>

            {/* Digital Receipt Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-white">{completedTxn.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Recipient Phone:</span>
                <span className="font-mono text-slate-200">{completedTxn.recipientPhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-slate-200">
                  {completedTxn.date} at {completedTxn.time}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Reference:</span>
                <span className="text-slate-200">{completedTxn.reference || 'None'}</span>
              </div>
              <div className="flex justify-between pt-1 font-semibold">
                <span className="text-slate-400">New Available Balance:</span>
                <span className="text-emerald-400 font-bold">
                  {wallet.currency}
                  {(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => alert(`Receipt ${completedTxn.id} downloaded!`)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Receipt</span>
              </button>
              <button
                onClick={() => alert(`Sharing receipt ${completedTxn.id}`)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <button
              onClick={() => {
                setStep('select_recipient');
                setAmount('');
                setPin('');
                setSelectedRecipient(null);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-2xl text-xs font-bold transition"
            >
              Send Money Again
            </button>

            <button
              onClick={onBack}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition"
            >
              Back to Wallet Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Biometric Verification Modal Overlay */}
      <BiometricModal
        isOpen={showBiometricModal}
        amount={parseFloat(amount) || 0}
        currency={wallet.currency}
        recipientName={selectedRecipient?.name || 'Recipient'}
        onSuccess={handleBiometricSuccess}
        onCancel={() => setShowBiometricModal(false)}
        onFallbackToPin={() => setShowBiometricModal(false)}
      />
    </div>
  );
};
