import React from 'react';
import { ArrowUpRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface CoffeeStoryIntroProps {
  onExploreMore?: () => void;
}

export const CoffeeStoryIntro: React.FC<CoffeeStoryIntroProps> = ({ onExploreMore }) => {
  return (
    <section id="story" className="relative py-24 sm:py-32 bg-[#F5F1E9] text-[#2D211B] overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#EAE2D5]/70 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -top-12 -left-20 w-80 h-80 bg-[#B77A4B]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Sub-tag */}
        <div className="flex items-center space-x-3 mb-6">
          <span className="w-8 h-[2px] bg-[#C87552]" />
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#593A2C]">
            Our Heritage & Vision
          </span>
        </div>

        {/* Asymmetrical 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Massive Editorial Heading & Story */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2D211B] leading-[1.05]">
              MORE THAN JUST <br />
              <span className="italic font-serif text-[#B77A4B] font-normal">A CUP OF COFFEE.</span>
            </h2>

            <p className="text-lg sm:text-xl text-[#593A2C] leading-relaxed font-light max-w-2xl">
              Every cup tells a story. From carefully selected coffee beans to the perfect brewing
              process, we believe great coffee begins with passion, patience, and uncompromised
              craftsmanship.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => {
                  const target = document.getElementById('journey');
                  target?.scrollIntoView({ behavior: 'smooth' });
                  onExploreMore?.();
                }}
                className="group inline-flex items-center space-x-3 px-7 py-3.5 rounded-full bg-[#2D211B] hover:bg-[#593A2C] text-[#F5F1E9] font-medium text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
              >
                <span>Discover Our Story</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#B77A4B]" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-[#593A2C] font-semibold tracking-wider uppercase pl-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Micro-lot Harvest 2026 Ready</span>
              </div>
            </div>

            {/* Micro Highlights Pill Row */}
            <div className="pt-8 border-t border-[#D8C8B4]/60 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#C87552]">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Single Origin</span>
                </div>
                <p className="text-xs text-[#593A2C]/80 leading-snug">
                  High altitude Shade-grown Arabica from Chikmagalur & Yirgacheffe.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#C87552]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Artisan Roast</span>
                </div>
                <p className="text-xs text-[#593A2C]/80 leading-snug">
                  Drum-roasted in small 5kg micro-batches to seal natural fruit oils.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#C87552]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Direct Trade</span>
                </div>
                <p className="text-xs text-[#593A2C]/80 leading-snug">
                  100% transparent pay to generational smallholder coffee farmers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Layered Editorial Visual Composition */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Main Editorial Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] max-w-md mx-auto group">
              <img
                src="/images/hot_coffee.jpg"
                alt="Artisan Barista Pouring Coffee"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Badge overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-lg text-[#2D211B]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#B77A4B]">Craft Precision</p>
                    <p className="text-sm font-extrabold text-[#2D211B]">92.5°C Optimal Extraction</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#2D211B] text-[#F5F1E9] flex items-center justify-center font-serif italic text-sm">
                    Cc
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Secondary Accent Card */}
            <div className="hidden sm:block absolute -bottom-10 -left-10 w-48 rounded-2xl overflow-hidden shadow-xl border-3 border-white aspect-square group">
              <img
                src="/images/cold_coffee.jpg"
                alt="Cold Coffee Roasted Bean Texture"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-2 left-2 right-2 text-center py-1 rounded bg-[#2D211B]/80 backdrop-blur-sm text-[10px] text-white font-bold tracking-wider uppercase">
                Roasted Yesterday
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

