import React from 'react';
import { ArrowDown, Sparkles, ArrowRight } from 'lucide-react';
import { HeroGrinder3D } from './three/HeroGrinder3D';

interface CoffeeHeroProps {
  onExploreCollection: () => void;
  onDiscoverStory: () => void;
}

export const CoffeeHero: React.FC<CoffeeHeroProps> = ({
  onExploreCollection,
  onDiscoverStory,
}) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen bg-[#F5F1E9] text-[#2D211B] flex flex-col justify-center pt-24 sm:pt-28 pb-12 overflow-hidden select-none"
    >
      {/* Background radial gradient glow for warm depth */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#EAE2D5]/70 blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] rounded-full bg-[#D8C8B4]/40 blur-3xl pointer-events-none -z-0" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 flex-1">
        
        {/* Left Column: Expressive Editorial Headlines & Actions */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left pt-6 sm:pt-0">
          
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EAE2D5] border border-[#593A2C]/15 text-[#593A2C] text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#B77A4B]" />
            <span>Artisan Specialty Roasted</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-[#2D211B] leading-[1.05] tracking-tight">
            GOOD COFFEE.
            <br />
            <span className="text-[#B77A4B] italic font-serif font-normal">BETTER</span> MOMENTS.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#593A2C]/80 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
            Discover the art of exceptional coffee. Crafted with passion, brewed for unforgettable moments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onExploreCollection}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2D211B] text-[#F5F1E9] text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-[#593A2C] active:scale-95 transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onDiscoverStory}
              className="w-full sm:w-auto px-7 py-4 rounded-full border-2 border-[#593A2C]/30 text-[#2D211B] hover:border-[#2D211B] hover:bg-[#EAE2D5]/50 text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all cursor-pointer"
            >
              Discover Our Story
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 sm:pt-8 border-t border-[#593A2C]/10 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#2D211B]">100%</span>
              <span className="text-[11px] uppercase tracking-wider text-[#593A2C]/70 font-medium">Arabica Single Origin</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#2D211B]">88+</span>
              <span className="text-[11px] uppercase tracking-wider text-[#593A2C]/70 font-medium">SCA Cupping Score</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#2D211B]">24h</span>
              <span className="text-[11px] uppercase tracking-wider text-[#593A2C]/70 font-medium">Fresh Roast Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Coffee Grinder with Floating Beans */}
        <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center">
          {/* Subtle Accent Glow Ring */}
          <div className="absolute inset-0 max-w-[500px] max-h-[500px] m-auto rounded-full border border-[#B77A4B]/20 pointer-events-none scale-90" />
          
          <HeroGrinder3D className="z-10" />

          {/* Floating Feature Pills */}
          <div className="absolute bottom-8 left-4 sm:left-12 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#2D211B]/10 shadow-lg hidden sm:flex items-center space-x-2 animate-bounce-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span className="text-xs font-semibold text-[#2D211B] tracking-wide">
              Ceramic Burr Micro-Grind
            </span>
          </div>

          <div className="absolute top-12 right-4 sm:right-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#2D211B]/10 shadow-lg hidden sm:flex items-center space-x-2">
            <span className="text-base">☕</span>
            <span className="text-xs font-semibold text-[#2D211B] tracking-wide">
              Slow Roasted Perfection
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-4">
        <a
          href="#story"
          onClick={(e) => {
            e.preventDefault();
            onDiscoverStory();
          }}
          className="flex flex-col items-center space-y-1.5 text-[#593A2C]/60 hover:text-[#593A2C] transition-colors group cursor-pointer text-decoration-none"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Scroll to Discover</span>
          <div className="w-6 h-9 rounded-full border-2 border-[#593A2C]/30 flex items-start justify-center p-1 group-hover:border-[#593A2C] transition-colors">
            <div className="w-1.5 h-2.5 bg-[#B77A4B] rounded-full animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
};

