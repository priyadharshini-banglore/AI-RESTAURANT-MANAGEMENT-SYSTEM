import React from 'react';
import { Laptop, Tablet, Smartphone, Printer, Cpu, Wifi } from 'lucide-react';

export const PetpoojaHardware: React.FC = () => {
  const hardwareCards = [
    {
      icon: <Laptop className="w-6 h-6 text-[#C82032]" />,
      title: 'Windows Laptops & Desktop PCs',
      desc: 'Run on your existing Windows 10/11 billing computers. Zero need to discard your old computer or buy proprietary hardware.',
    },
    {
      icon: <Tablet className="w-6 h-6 text-[#C82032]" />,
      title: 'Android & Touch Billing Terminals',
      desc: 'Seamless compatibility with Sunmi, Posiflex, Essae, and commercial Android touchscreen POS machines.',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-[#C82032]" />,
      title: 'Android Phones & Captain Tabs',
      desc: 'Captains can take table orders directly from regular 4G Android smartphones. Reduces front-of-house staff steps by 40%.',
    },
    {
      icon: <Printer className="w-6 h-6 text-[#C82032]" />,
      title: 'Thermal Printers (USB / LAN / Bluetooth)',
      desc: 'Direct USB, Ethernet LAN, and Bluetooth connectivity with 2-inch and 3-inch thermal bill & KOT printers (Epson, TVS, NGX).',
    },
  ];

  return (
    <section id="hardware" className="py-20 sm:py-28 bg-white text-slate-900 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#C82032] block">
            Hardware Agnostic Platform
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Works with the Hardware You Already Own
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            No expensive forced vendor lock-ins. Install Restro on your existing computers, tablets, and thermal printers in under 15 minutes.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hardwareCards.map((h, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-5">
                {h.icon}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mb-2">
                {h.title}
              </h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Banner callout */}
        <div className="mt-12 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-black text-white">
              Need Help With Restaurant Hardware Setup?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light">
              Our 1,000+ on-ground engineers visit your outlet in person to install drivers, configure thermal printers, and train your staff completely free of charge.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('pricing-demo');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3.5 rounded-xl bg-[#C82032] hover:bg-[#B01B2B] text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-md"
          >
            Request On-Site Installation ➔
          </button>
        </div>

      </div>
    </section>
  );
};

