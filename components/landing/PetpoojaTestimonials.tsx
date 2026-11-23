import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Reveal3DText, Reveal3DCard } from './Scroll3DAnimation';

export const PetpoojaTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Viraaj Badhwar',
      role: 'Co-founder @ Burgerama',
      quote:
        'Restro provides detailed financial reports and analytics for sales and profits, along with exceptional customer service for troubleshooting. I highly recommend Restro.',
      initials: 'VB',
      avatarBg: 'bg-amber-600',
    },
    {
      name: 'Aditi Madan',
      role: 'Founder @ Yangkiez Momos',
      quote:
        'Restro simplifies restaurant management by handling online orders, inventory, and menu updates. The user-friendly POS frees up time for brand growth. Invest in automated solutions like Restro for seamless operations.',
      initials: 'AM',
      avatarBg: 'bg-rose-600',
    },
    {
      name: 'Kabir',
      role: "Managing Partner @ Berco's",
      quote:
        'To run multiple outlets, Restro is a reliable solution that provides comprehensive POS reports and is all well-integrated with online aggregators. It gives us total peace of mind.',
      initials: 'KB',
      avatarBg: 'bg-slate-700',
    },
  ];

  return (
    <section id="customers" className="py-20 sm:py-28 bg-[#F8FAFC] text-slate-900 border-b border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with Title & Arrow Controls */}
        <div className="flex items-center justify-between mb-12 sm:mb-14">
          <Reveal3DText
            tag="h2"
            text="Hear from our clients"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900"
          />

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
              className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-black transition-all shadow-xs cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
              className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-black transition-all shadow-xs cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Client Cards Grid with 3D Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <Reveal3DCard key={idx} delay={idx * 80}>
              <div className="h-full bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
                <p className="text-sm sm:text-[14.5px] text-slate-600 font-normal leading-relaxed">
                  "{t.quote}"
                </p>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-full ${t.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal3DCard>
          ))}
        </div>

      </div>
    </section>
  );
};
