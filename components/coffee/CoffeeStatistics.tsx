import React from 'react';

export const CoffeeStatistics: React.FC = () => {
  const stats = [
    {
      value: '100%',
      label: 'Quality Focus',
      description: 'Single-origin & direct shade-grown Arabica lot certification.',
    },
    {
      value: '25+',
      label: 'Coffee Origins',
      description: 'Hand-selected altitude micro-farms across 4 continents.',
    },
    {
      value: '10K+',
      label: 'Happy Customers',
      description: 'Discerning coffee lovers enjoying their daily morning brew.',
    },
    {
      value: '5-Star',
      label: 'Coffee Experience',
      description: 'Consistently rated highest in roast freshness & aroma delivery.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#2D211B] text-[#F5F1E9] relative overflow-hidden">
      {/* Background glowing aura & texture */}
      <div className="absolute inset-0 bg-radial from-[#593A2C]/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#B77A4B]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C87552]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#B77A4B] block mb-2">
            Measurable Craft & Trust
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F5F1E9]">
            OUR LOVE FOR EVERY CUP.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#D8C8B4] font-light max-w-lg mx-auto">
            Every statistic represents real farmers, patient roasters, and satisfied morning moments.
          </p>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#B77A4B] group-hover:text-[#F5F1E9] transition-colors tracking-tight">
                {s.value}
              </div>
              <h3 className="mt-3 text-base sm:text-lg font-bold text-[#F5F1E9] tracking-wide">
                {s.label}
              </h3>
              <p className="mt-1.5 text-xs text-[#D8C8B4]/80 font-light leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

