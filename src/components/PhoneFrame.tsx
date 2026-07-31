import React from 'react';
import { Monitor } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeTabTitle?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 select-none font-sans antialiased">
      <div className="w-full max-w-5xl bg-slate-950 border border-slate-800/60 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 bg-slate-950 text-slate-100 custom-scrollbar relative min-h-[750px]">
          {children}
        </div>
      </div>
    </div>
  );
};

