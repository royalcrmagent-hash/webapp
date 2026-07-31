import React, { useState } from 'react';
import { Search, UserPlus, Send, Sparkles, Phone, Trash2 } from 'lucide-react';
import { Contact, WalletState } from '../../types';

interface ContactsListProps {
  wallet: WalletState;
  onSelectContactForSend: (contact: Contact) => void;
  onAddContact: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  wallet,
  onSelectContactForSend,
  onAddContact,
  onDeleteContact,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = wallet.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleSaveContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      alert('Please enter both full name and phone number');
      return;
    }
    const newC: Contact = {
      id: `c_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName.trim())}&background=10b981&color=020617&font-size=0.45&bold=true`,
      favorite: true,
    };
    onAddContact(newC);
    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
        <h2 className="text-base font-bold text-white">Wallet Contacts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Contact</span>
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or mobile number..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 custom-scrollbar">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={c.avatar}
                alt={c.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=10b981&color=020617&font-size=0.45&bold=true`;
                }}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  {c.name}
                  {c.favorite && <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </h4>
                <p className="text-[11px] font-mono text-slate-400">{c.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectContactForSend(c)}
                className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>

              {onDeleteContact && (
                <button
                  onClick={() => {
                    if (confirm(`Delete ${c.name} from contacts?`)) {
                      onDeleteContact(c.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-xs space-y-3">
            <h3 className="text-sm font-bold text-white">Add New Contact</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Shakib Al Hasan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Mobile Number</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="01711002233"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                className="flex-1 bg-emerald-500 text-slate-950 py-2 rounded-xl text-xs font-bold"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
