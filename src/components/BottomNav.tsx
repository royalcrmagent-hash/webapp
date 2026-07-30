import React from 'react';
import { Home, History, QrCode, Users, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'qr', label: 'Scan QR', icon: QrCode, isFab: true },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 px-3 py-2 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isFab) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative -top-5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 w-13 h-13 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-slate-950 hover:scale-105 active:scale-95 transition"
              title="Scan QR Code"
            >
              <Icon className="w-6 h-6 stroke-[2.5]" />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
