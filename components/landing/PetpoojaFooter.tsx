import React from 'react';
import { Phone, Mail, Award, ChevronUp } from 'lucide-react';

export const PetpoojaFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const g2Badges = [
    { title: 'High Performer', season: 'SPRING 2024', color: 'bg-amber-600' },
    { title: 'Best Support', season: 'MID-MARKET', color: 'bg-blue-600' },
    { title: 'Leader', season: 'SPRING 2024', color: 'bg-[#E22637]' },
    { title: 'Easiest To Do Business With', season: 'SPRING 2024', color: 'bg-teal-600' },
    { title: 'Users Love Us', season: 'G2 CROWD', color: 'bg-indigo-600' },
    { title: 'Momentum Leader', season: 'SPRING 2024', color: 'bg-[#E22637]' },
    { title: 'Grid Leader', season: 'INDIA REGION', color: 'bg-amber-700' },
  ];

  return (
    <footer className="bg-[#0D1624] text-white pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Contact Bar (Screenshot 10 & 11) */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-10 border-b border-slate-800/80 gap-6 text-center md:text-left">
          
          {/* Brand Logo with red accent */}
          <div className="flex items-center text-2xl sm:text-[26px] font-black tracking-tight text-white">
            <span>REST</span>
            <span className="text-[#E22637]">RO</span>
          </div>

          {/* Connect Contact info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
            <span>Connect with us:</span>
            <a href="tel:+919876543210" className="font-semibold text-white hover:text-[#E22637] underline">
              (+91) 98765 43210
            </a>
            <span className="text-slate-600">|</span>
            <a href="mailto:inquiry@restro.com" className="font-semibold text-white hover:text-[#E22637] underline">
              inquiry@restro.com
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-3 text-slate-400">
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white transition-colors">
              <span className="font-bold text-xs">in</span>
            </a>
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white transition-colors">
              <span className="font-bold text-xs">ig</span>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white transition-colors">
              <span className="font-bold text-xs">yt</span>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white transition-colors">
              <span className="font-bold text-xs">fb</span>
            </a>
          </div>

        </div>

        {/* G2 Awards Strip (Screenshot 11) */}
        <div className="py-12 text-center">
          <h3 className="text-base sm:text-lg font-bold text-slate-200 mb-8">
            We're the best, we told you already!
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {g2Badges.map((badge, i) => (
              <div
                key={i}
                className="w-24 sm:w-28 bg-white text-slate-900 rounded-md p-2 shadow-md flex flex-col items-center justify-between h-24 border border-slate-200"
              >
                <div className={`w-4 h-4 rounded-full ${badge.color} text-white flex items-center justify-center text-[8px] font-black`}>
                  G
                </div>
                <div className="text-[10px] font-extrabold leading-tight text-center text-slate-800">
                  {badge.title}
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  {badge.season}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Legal bar (Screenshot 11) */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="text-center md:text-left flex flex-wrap gap-x-2 gap-y-1">
            <span>© 2026 Restro Restaurant AI Management Systems Pvt. Ltd., India</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Compliance</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Cancellation & Refund</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Corporate Information</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Security</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">
              <span>🇮🇳</span>
              <span>India</span>
            </div>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
