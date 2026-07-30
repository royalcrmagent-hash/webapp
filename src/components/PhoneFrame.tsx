import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeTabTitle?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [frameColor, setFrameColor] = useState<'dark' | 'silver' | 'titanium'>('dark');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const borderClasses = {
    dark: 'border-slate-800 bg-slate-900 shadow-2xl shadow-slate-900/60 ring-1 ring-slate-700/50',
    silver: 'border-slate-300 bg-slate-100 shadow-2xl shadow-slate-400/40 ring-1 ring-slate-300/80',
    titanium: 'border-zinc-700 bg-zinc-800 shadow-2xl shadow-zinc-900/60 ring-1 ring-amber-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none font-sans antialiased overflow-x-hidden">
      
      {/* Top Banner for Desktop Viewers explaining Mobile-Only Design */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[420px] mb-3 px-2 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Only Experience</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5">
          <span className="text-[11px] text-slate-500">Theme:</span>
          <button
            onClick={() => setFrameColor('dark')}
            className={`w-3.5 h-3.5 rounded-full bg-slate-900 border ${frameColor === 'dark' ? 'border-emerald-400 scale-110' : 'border-slate-600'}`}
            title="Midnight"
          />
          <button
            onClick={() => setFrameColor('silver')}
            className={`w-3.5 h-3.5 rounded-full bg-slate-200 border ${frameColor === 'silver' ? 'border-emerald-400 scale-110' : 'border-slate-400'}`}
            title="Silver"
          />
          <button
            onClick={() => setFrameColor('titanium')}
            className={`w-3.5 h-3.5 rounded-full bg-zinc-700 border ${frameColor === 'titanium' ? 'border-emerald-400 scale-110' : 'border-zinc-500'}`}
            title="Titanium"
          />
        </div>
      </div>

      {/* Main Mobile Device Container */}
      <div
        className={`w-full sm:w-[412px] h-screen sm:h-[844px] sm:max-h-[92vh] sm:rounded-[48px] border-0 sm:border-[10px] ${borderClasses[frameColor]} flex flex-col relative overflow-hidden transition-all duration-300`}
      >
        {/* Dynamic Island / Top Notch (Desktop & Tablet Frame) */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-2 pb-1 bg-slate-950/80 backdrop-blur-md text-slate-100 text-xs font-semibold tracking-tight">
          {/* Mobile Status Bar Time */}
          <span className="text-[13px] font-bold tracking-tight text-white pl-1">{currentTime || '10:42 AM'}</span>

          {/* Dynamic Island Cutout */}
          <div className="hidden sm:flex items-center gap-2 bg-black px-3 py-1 rounded-full border border-slate-800/80 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-indigo-500/80"></div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>

          {/* Network & Battery Status Icons */}
          <div className="flex items-center gap-2 pr-1 text-slate-200">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">98%</span>
              <Battery className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile Content Viewport */}
        <div className="flex-1 flex flex-col pt-9 pb-2 overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 custom-scrollbar relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full bg-slate-950/90 backdrop-blur-sm py-1.5 flex justify-center items-center shrink-0 border-t border-slate-900/50">
          <div className="w-32 h-1 bg-slate-600/80 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
