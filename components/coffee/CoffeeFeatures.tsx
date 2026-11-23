import React from 'react';
import { Compass, Flame, Award, HeartHandshake } from 'lucide-react';

export const CoffeeFeatures: React.FC = () => {
  const features = [
    {
      num: '01',
      title: 'Carefully Selected Beans',
      subtitle: 'Premium beans sourced with care.',
      description:
        'We scout and cup hundreds of micro-lots across altitude estates in Chikmagalur, Yirgacheffe, and Huila, hand-picking only dense Grade-1 ripe cherries.',
      icon: <Compass className="w-6 h-6 text-[#B77A4B]" />,
      pill: 'Top 2% Arabica',
    },
    {
      num: '02',
      title: 'Freshly Roasted',
      subtitle: 'Every batch is roasted to preserve its character.',
      description:
        'Roasting profiles are dialed in per origin on custom drum cast roasters. Never stored on dusty shelves—shipped within 48 hours of degassing.',
      icon: <Flame className="w-6 h-6 text-[#C87552]" />,
      pill: 'Weekly Micro-Roasts',
    },
    {
      num: '03',
      title: 'Exceptional Flavour',
      subtitle: 'Balanced flavours and unforgettable aromas.',
      description:
        'Naturally rich sweetness, velvety mouthfeel, and distinct chocolate-fruit profiles without acidity bite or bitter burnt aftertaste.',
      icon: <Award className="w-6 h-6 text-[#B77A4B]" />,
      pill: 'SCA 87+ Certified',
    },
    {
      num: '04',
      title: 'Sustainable Approach',
      subtitle: 'Quality coffee with thoughtful sourcing.',
      description:
        'Direct-trade relationships pay fair premiums above market index to generational farm families, regenerative soil, and clean water restoration.',
      icon: <HeartHandshake className="w-6 h-6 text-[#C87552]" />,
      pill: 'Direct Trade 100%',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#F5F1E9] text-[#2D211B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-2 text-[#C87552] text-xs uppercase tracking-[0.25em] font-bold mb-3">
            <span className="w-6 h-[2px] bg-[#C87552]" />
            <span>Our Principles</span>
            <span className="w-6 h-[2px] bg-[#C87552]" />
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D211B]">
            CRAFTED WITH PURPOSE.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#593A2C] font-light max-w-xl mx-auto">
            From farm sovereignty to your morning mug, here is how we ensure every pour is memorable.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#2D211B]/10 hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Giant numeral watermark */}
              <span className="absolute top-4 right-4 text-5xl font-black text-[#EAE2D5]/70 select-none group-hover:text-[#B77A4B]/20 transition-colors">
                {item.num}
              </span>

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F1E9] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-[#2D211B] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#B77A4B]">
                    {item.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#593A2C] font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F5F1E9] border border-[#2D211B]/10 text-[11px] font-bold text-[#593A2C] tracking-wide">
                  ✦ {item.pill}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

