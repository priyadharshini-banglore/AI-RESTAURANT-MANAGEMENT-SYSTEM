import React from 'react';
import { ShowcaseCup3D } from './three/ShowcaseCup3D';
import { ArrowDown, Sparkles } from 'lucide-react';

interface CoffeeFinalCTAProps {
  onConnectClick?: () => void;
}

export const CoffeeFinalCTA: React.FC<CoffeeFinalCTAProps> = ({ onConnectClick }) => {
  const handleScrollToDemo = () => {
    const el = document.getElementById('demo-booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    onConnectClick?.();
  };

  return (
    <section className="py-24 sm:py-32 bg-[#EAE2D5] text-[#2D211B] relative overflow-hidden">
      {/* Radial soft background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        {/* Subtitle tag */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F5F1E9] border border-[#2D211B]/15 text-xs font-bold uppercase tracking-[0.2em] text-[#593A2C] shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#B77A4B]" />
          <span>Elevate Your Daily Ritual</span>
        </div>

        {/* Central 3D Cup Visualizer */}
        <div className="relative w-full max-w-sm mx-auto h-72 sm:h-80 flex items-center justify-center">
          <ShowcaseCup3D className="w-full h-full" />
        </div>

        {/* Big Editorial Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D211B] leading-tight">
            MAKE EVERY MOMENT <br />
            <span className="italic font-serif text-[#B77A4B] font-normal">A COFFEE MOMENT.</span>
          </h2>
          <p className="text-base sm:text-xl text-[#593A2C] font-light max-w-xl mx-auto">
            Your perfect coffee experience starts here. Explore our wholesale, cafe subscriptions,
            and restaurant management solutions.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleScrollToDemo}
            className="px-10 py-4 rounded-full bg-[#2D211B] hover:bg-[#593A2C] text-[#F5F1E9] font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center space-x-3 cursor-pointer"
          >
            <span>LET'S CONNECT</span>
            <ArrowDown className="w-4 h-4 text-[#B77A4B] animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

