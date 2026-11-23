import React from 'react';

export const PetpoojaBrands: React.FC = () => {
  const brands = [
    { name: 'Red Bucket Biryani', badge: 'Red Bucket', color: 'bg-red-600 text-white' },
    { name: 'MBA Chaiwala', badge: 'MCD', color: 'bg-black text-amber-400' },
    { name: 'Dr. Sandwich', badge: 'Dr. Sandwich', color: 'bg-stone-900 text-white' },
    { name: "Haldiram's", badge: "Haldiram's", color: 'bg-[#C82032] text-white' },
    { name: 'Zepto', badge: 'zepto', color: 'bg-purple-700 text-white font-extrabold' },
    { name: 'BIRA 91', badge: 'BIRA 91', color: 'bg-slate-900 text-white' },
    { name: 'L&T Realty', badge: 'L&T Realty', color: 'bg-amber-400 text-slate-900 font-black' },
    { name: "La Pino'z Pizza", badge: "La Pino'z", color: 'bg-red-700 text-white' },
    { name: 'Hocco Eatery', badge: 'HOCCO', color: 'bg-black text-white font-serif' },
    { name: 'Wow! Momo', badge: 'Wow! Momo', color: 'bg-amber-500 text-black font-black' },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title matching screenshot 3 */}
        <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-slate-700 uppercase mb-8">
          TRUSTED BY <span className="text-[#E22637] font-extrabold">1,50,000+</span> BUSINESSES ACROSS THE GLOBE
        </p>

        {/* Brand Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
          {brands.map((b, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xs hover:scale-105 transition-all cursor-default ${b.color}`}
            >
              {b.badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
