import React, { useState } from 'react';
import { Search, X, Globe, Check, ArrowRight } from 'lucide-react';
import { ALL_COUNTRIES, CountryCurrency } from '../../data/countries';

interface CountrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrencySymbol: string;
  onSelectCountry: (country: CountryCurrency) => void;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCurrencySymbol,
  onSelectCountry,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredCountries = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const topCountries = ALL_COUNTRIES.slice(0, 10);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Select Country & Currency</h3>
              <p className="text-[11px] text-slate-400">All World Countries & Currencies ({ALL_COUNTRIES.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 bg-slate-900/50 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country, currency code (e.g. SAR, USD, BDT)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              autoFocus
            />
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Top Featured Countries (If search is empty) */}
          {!search && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Popular Countries
              </label>
              <div className="grid grid-cols-2 gap-2">
                {topCountries.map((c) => {
                  const isSelected = selectedCurrencySymbol === c.symbol || selectedCurrencySymbol === c.code;
                  return (
                    <button
                      key={`top-${c.code}`}
                      onClick={() => {
                        onSelectCountry(c);
                        onClose();
                      }}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xl">{c.flag}</span>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {c.code} ({c.symbol})
                          </p>
                          <p className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                            1 {c.code} = ৳{c.rateToBDT}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Countries List */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              All World Countries ({filteredCountries.length})
            </label>
            {filteredCountries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No matching country or currency found.
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredCountries.map((c) => {
                  const isSelected = selectedCurrencySymbol === c.symbol || selectedCurrencySymbol === c.code;
                  return (
                    <div
                      key={c.code}
                      onClick={() => {
                        onSelectCountry(c);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800/60 hover:bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{c.name}</h4>
                            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {c.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>Symbol: <strong className="text-white font-mono">{c.symbol}</strong></span>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                              1 {c.code} = ৳{c.rateToBDT} BDT
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Selected
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1">
                            Select <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
