import React, { useState } from 'react';
import {
  Search,
  Send,
  PlusCircle,
  ArrowUpRight,
  Receipt,
  Smartphone,
  X,
  Download,
  Share2,
  CheckCircle2,
  Filter,
  Tag,
  Edit2,
  Check,
} from 'lucide-react';
import { WalletState, Transaction, TransactionType } from '../../types';
import { PopupDialog, DialogType } from '../ui/PopupDialog';

interface TransactionHistoryViewProps {
  wallet: WalletState;
  onBack?: () => void;
  onUpdateCategory?: (txnId: string, newCategory: string) => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  wallet,
  onUpdateCategory,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

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

  const openPopup = (title: string, message: React.ReactNode, type: DialogType = 'info') => {
    setDialogState({ isOpen: true, title, message, type });
  };

  const closePopup = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  // Editing Category state inside Receipt Modal
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editedCategoryInput, setEditedCategoryInput] = useState('');

  // Extract unique categories from existing transactions + default options
  const defaultCategories = [
    'Groceries',
    'Rent',
    'Entertainment',
    'Shopping',
    'Bills',
    'Food & Dining',
    'Transfer',
    'Deposit',
    'Withdrawal',
  ];

  const existingCategories = Array.from(
    new Set(wallet.transactions.map((t) => t.category).filter(Boolean))
  ) as string[];

  const allCategoryOptions = Array.from(
    new Set([...defaultCategories, ...existingCategories])
  );

  const getTxnIcon = (type: TransactionType) => {
    switch (type) {
      case 'sent':
        return { icon: Send, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'received':
        return { icon: PlusCircle, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'cash_in':
        return { icon: PlusCircle, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
      case 'cash_out':
        return { icon: ArrowUpRight, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'bill_pay':
        return { icon: Receipt, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'recharge':
        return { icon: Smartphone, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      default:
        return { icon: Send, color: 'text-slate-400 bg-slate-800' };
    }
  };

  const filteredTransactions = wallet.transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory =
      selectedCategory === 'all' ||
      (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipientPhone.includes(searchQuery) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.reference && t.reference.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesCategory && matchesSearch;
  });

  const handleSaveEditedCategory = () => {
    if (!selectedTxn) return;
    const cat = editedCategoryInput.trim() || 'General';
    if (onUpdateCategory) {
      onUpdateCategory(selectedTxn.id, cat);
    }
    setSelectedTxn({ ...selectedTxn, category: cat });
    setIsEditingCategory(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-emerald-400" />
          Transaction History
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          {filteredTransactions.length} records
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ID, name, category (e.g. Groceries, Rent)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2 custom-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Types' },
          { id: 'sent', label: 'Sent' },
          { id: 'received', label: 'Received' },
          { id: 'cash_in', label: 'Add Money' },
          { id: 'cash_out', label: 'Cash Out' },
          { id: 'bill_pay', label: 'Bills' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition ${
              filterType === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar text-[11px]">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Tag className="w-3 h-3 text-emerald-400" /> Category:
        </span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-lg shrink-0 font-bold border transition ${
            selectedCategory === 'all'
              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All
        </button>
        {allCategoryOptions.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-bold border transition ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 custom-scrollbar">
        {filteredTransactions.map((txn) => {
          const { icon: Icon, color } = getTxnIcon(txn.type);
          const isDebit =
            txn.type === 'sent' ||
            txn.type === 'cash_out' ||
            txn.type === 'bill_pay' ||
            txn.type === 'recharge';

          return (
            <div
              key={txn.id}
              onClick={() => {
                setSelectedTxn(txn);
                setEditedCategoryInput(txn.category || 'General');
                setIsEditingCategory(false);
              }}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{txn.title}</h4>
                    {txn.category && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                        {txn.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {txn.recipientName} • <span className="font-mono text-[10px]">{txn.date}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-extrabold ${
                    isDebit ? 'text-slate-100' : 'text-emerald-400'
                  }`}
                >
                  {isDebit ? '-' : '+'}{wallet.currency}
                  {txn.amount.toLocaleString()}
                </span>
                <p className="text-[10px] font-mono text-slate-500">{txn.id}</p>
              </div>
            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-xs space-y-4 shadow-2xl relative animate-in fade-in zoom-in">
            <button
              onClick={() => setSelectedTxn(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">{selectedTxn.title}</h3>
              <p className="text-2xl font-extrabold text-emerald-400">
                {wallet.currency}{selectedTxn.amount.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
              {/* Category Row with Inline Edit */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" /> Category:
                </span>
                {!isEditingCategory ? (
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {selectedTxn.category || 'General'}
                    </span>
                    <button
                      onClick={() => setIsEditingCategory(true)}
                      className="text-slate-400 hover:text-emerald-400 p-1"
                      title="Edit Category Label"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editedCategoryInput}
                      onChange={(e) => setEditedCategoryInput(e.target.value)}
                      placeholder="e.g. Groceries"
                      className="w-24 bg-slate-900 border border-emerald-500 text-white text-[11px] rounded-md px-1.5 py-0.5 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveEditedCategory}
                      className="bg-emerald-500 text-slate-950 p-1 rounded-md hover:bg-emerald-400"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Txn ID:</span>
                <span className="font-mono text-white font-bold">{selectedTxn.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Recipient / Party:</span>
                <span className="text-slate-200">{selectedTxn.recipientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Contact / Acc:</span>
                <span className="font-mono text-slate-200">{selectedTxn.recipientPhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-slate-200">
                  {selectedTxn.date} {selectedTxn.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="text-slate-200">{selectedTxn.reference || 'N/A'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openPopup('Receipt Downloaded', `Receipt downloaded for ${selectedTxn.id}`, 'success')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => openPopup('Sharing Receipt', `Sharing receipt ${selectedTxn.id}`, 'info')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
