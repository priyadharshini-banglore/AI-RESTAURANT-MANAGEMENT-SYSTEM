import React from 'react';
import { Star, Quote } from 'lucide-react';

export const CoffeeTestimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Dr. Aarav Mehta',
      title: 'Architect & Espresso Enthusiast',
      avatar: 'AM',
      stars: 5,
      quote:
        'The Classic Espresso completely recalibrated what I expect from coffee at home. Thick crema, zero harsh bitterness, and notes of dark chocolate that linger for hours.',
      roastEnjoyed: 'Classic Espresso',
    },
    {
      name: 'Priya Sundaram',
      title: 'Specialty Cafe Owner, Bengaluru',
      avatar: 'PS',
      stars: 5,
      quote:
        'Our cafe uses the Caramel Blend for all milk drinks. Customers constantly ask which roaster we source from. The balance, sweetness, and consistency are truly world-class.',
      roastEnjoyed: 'Caramel Blend',
    },
    {
      name: 'Rohan Sen',
      title: 'Author & Daily Drip Brewer',
      avatar: 'RS',
      stars: 5,
      quote:
        'Morning Bliss is the cleanest pour-over I have ever made. Floral jasmine aroma fills the room as soon as water touches the grounds. It has become my indispensable writing companion.',
      roastEnjoyed: 'Morning Bliss',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#F5F1E9] text-[#2D211B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-2 text-[#C87552] text-xs uppercase tracking-[0.25em] font-bold mb-3">
            <span className="w-6 h-[2px] bg-[#C87552]" />
            <span>Community Stories</span>
            <span className="w-6 h-[2px] bg-[#C87552]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#2D211B]">
            GOOD COFFEE. GOOD WORDS.
          </h2>
          <p className="mt-3 text-base text-[#593A2C] font-light max-w-md mx-auto">
            Honest reflections from passionate brewers, baristas, and daily coffee drinkers.
          </p>
        </div>

        {/* 3 Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#EAE2D5]/60 hover:bg-white rounded-3xl p-8 border border-[#2D211B]/10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-2 group"
            >
              <div className="space-y-4">
                {/* Star rating & quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#B77A4B]/40 group-hover:text-[#B77A4B] transition-colors" />
                </div>

                <p className="text-sm sm:text-base text-[#2D211B] font-light leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-6 mt-6 border-t border-[#2D211B]/10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#2D211B] text-[#F5F1E9] flex items-center justify-center font-bold text-xs">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#2D211B]">{rev.name}</h4>
                  <p className="text-[11px] text-[#593A2C] font-medium">{rev.title}</p>
                  <span className="text-[10px] text-[#B77A4B] font-semibold">
                    Brewed: {rev.roastEnjoyed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

