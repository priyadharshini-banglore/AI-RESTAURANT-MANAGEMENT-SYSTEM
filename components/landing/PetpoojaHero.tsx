import React, { useState } from 'react';
import { ArrowRight, Phone, Laptop, Smartphone, Check, Sparkles, UtensilsCrossed, Monitor, ChefHat, MapPin } from 'lucide-react';
import { Reveal3DText, Reveal3DCard } from './Scroll3DAnimation';

interface PetpoojaHeroProps {
  onBookDemoClick: () => void;
  onExploreSystemClick: () => void;
}

export const PetpoojaHero: React.FC<PetpoojaHeroProps> = ({
  onBookDemoClick,
  onExploreSystemClick,
}) => {
  const [activeProductTab, setActiveProductTab] = useState<'Smart POS' | '3D Table Menu' | 'Kitchen KDS' | 'Floor Map'>('Smart POS');
  const [selectedTable, setSelectedTable] = useState<number>(3);

  // Status mapping for tables matching POS screenshot
  const tables = [
    { id: 1, name: 'Table 1', status: 'blank' },
    { id: 2, name: 'Table 2', status: 'running' },
    { id: 3, name: 'Table 3', status: 'running-kot' },
    { id: 4, name: 'Table 4', status: 'blank' },
    { id: 5, name: 'Table 5', status: 'running' },
    { id: 6, name: 'Table 6', status: 'blank' },
    { id: 7, name: 'Table 7', status: 'blank' },
    { id: 8, name: 'Table 8', status: 'running' },
    { id: 9, name: 'Table 9', status: 'printed' },
    { id: 10, name: 'Table 10', status: 'blank' },
    { id: 11, name: 'Table 11', status: 'blank' },
    { id: 12, name: 'Table 12', status: 'blank' },
    { id: 13, name: 'Table 13', status: 'running' },
    { id: 14, name: 'Table 14', status: 'paid' },
    { id: 15, name: 'Table 15', status: 'blank' },
    { id: 16, name: 'Table 16', status: 'blank' },
    { id: 17, name: 'Table 17', status: 'blank' },
    { id: 18, name: 'Table 18', status: 'printed' },
    { id: 19, name: 'Table 19', status: 'blank' },
    { id: 20, name: 'Table 20', status: 'blank' },
  ];

  return (
    <section className="bg-[#0D1624] text-white pt-28 sm:pt-36 pb-0 overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />


      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Main Hero Headline with 3D Word-by-Word Reveal */}
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <Reveal3DText
            tag="h1"
            text="All-in-One Software Powering Restaurant Growth At Every Step"
            align="center"
            highlightWords={['Restaurant', 'Growth']}
            highlightClass="text-[#E22637]"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-white leading-[1.15] justify-center text-center"
          />
        </div>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
          Delight diners with interactive 3D table ordering, superfast 3-click POS billing, live kitchen KDS routing, and real-time floor map management.
        </p>

        {/* Call to action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBookDemoClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#E22637] hover:bg-[#C82032] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer"
          >
            Book Free Demo
          </button>
          <button
            onClick={onExploreSystemClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base tracking-wide transition-all border border-slate-700 cursor-pointer"
          >
            Explore Live Restaurant OS
          </button>
        </div>

        {/* 3D Laptop + Mobile Mockup Frame */}
        <Reveal3DCard className="mt-14 sm:mt-16 max-w-5xl mx-auto" tiltMax={5}>
          <div className="relative mx-auto rounded-t-2xl sm:rounded-t-3xl bg-[#1E293B] p-2.5 sm:p-3 pb-0 shadow-2xl border border-slate-700/80">
            {/* Webcam dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mx-auto mb-2 border border-slate-700" />
            
            {/* Screen Content: Restro POS Table View */}
            <div className="rounded-t-xl bg-white text-slate-800 text-left overflow-hidden border border-slate-200 select-none shadow-inner">
              
              {/* POS Top Bar */}
              <div className="bg-[#FAFBFD] border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-[#E22637] text-white font-black rounded text-[11px] tracking-wide flex items-center space-x-1">
                    <span>RESTRO</span>
                    <span className="text-[9px] bg-white/20 px-1 rounded">POS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-[#E22637] font-bold text-[11px]">
                    + New Table Order
                  </span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">Q Bill #1042</span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-slate-600">
                  <span className="hidden md:inline">Kitchen KDS: 3 Active</span>
                  <span className="hidden md:inline">Servant Bell: 0 Pending</span>
                  <div className="flex items-center space-x-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    <span>● Offline Sync Active</span>
                  </div>
                  <button
                    onClick={onExploreSystemClick}
                    className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold hover:bg-black transition-colors"
                  >
                    Open Live POS
                  </button>
                </div>
              </div>

              {/* Floor Plan & Filters */}
              <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-800 text-sm">Table Floor Map</h3>
                  <button className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E22637] text-white">
                    + Table Reservation
                  </button>
                  <button className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    + QR Standee
                  </button>
                </div>

                {/* Legend matching screenshot */}
                <div className="flex items-center space-x-3 text-[10px] text-slate-500 overflow-x-auto py-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300" />
                    <span>Blank Table</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#BAE6FD]" />
                    <span>Running Table</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#FEF08A]" />
                    <span>Printed Table</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#BBF7D0]" />
                    <span>Paid Table</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#FECDD3]" />
                    <span>Running KOT</span>
                  </div>
                </div>
              </div>

              {/* Table Grid Floor Map */}
              <div className="p-3 sm:p-5 bg-slate-50/50">
                <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Dine-In Main Patio</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
                  {tables.map((t) => {
                    const isSelected = selectedTable === t.id;
                    let bg = 'bg-white border-slate-200 text-slate-700';
                    if (t.status === 'running') bg = 'bg-[#BAE6FD] border-blue-300 text-blue-900';
                    if (t.status === 'running-kot') bg = 'bg-[#FECDD3] border-red-300 text-red-900';
                    if (t.status === 'printed') bg = 'bg-[#FEF08A] border-amber-300 text-amber-900';
                    if (t.status === 'paid') bg = 'bg-[#BBF7D0] border-emerald-300 text-emerald-900';

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTable(t.id)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer shadow-xs ${bg} ${
                          isSelected ? 'ring-2 ring-[#E22637] scale-105' : 'hover:scale-[1.02]'
                        }`}
                      >
                        <div className="font-bold text-[11px] sm:text-xs">{t.name}</div>
                        <div className="text-[9px] opacity-75 mt-0.5">
                          {t.status === 'blank' ? 'Available' : 'Occupied'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base Stand */}
          <div className="h-3 sm:h-4 bg-slate-400 rounded-b-xl mx-auto w-[98%] shadow-lg border-t border-slate-300 flex items-center justify-center">
            <div className="w-20 h-1 bg-slate-600 rounded-full" />
          </div>

          {/* Mobile Mockup positioned next to laptop */}
          <div className="hidden lg:block absolute -right-6 bottom-4 w-44 bg-slate-900 rounded-[28px] p-2 shadow-2xl border-2 border-slate-700">
            <div className="w-12 h-3.5 bg-slate-950 rounded-full mx-auto mb-1.5" />
            <div className="rounded-2xl bg-white p-2.5 text-left text-slate-800 text-[10px] space-y-2">
              <div className="flex items-center justify-between border-b pb-1">
                <span className="font-bold text-[11px]">3D Table Menu</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="bg-red-50 text-[#E22637] p-1.5 rounded font-bold text-[9px]">
                Table #3 Ordering Live
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>1x Stone-Fired Pizza</span>
                  <span>₹399</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>2x Cold Coffee w/ Cream</span>
                  <span>₹358</span>
                </div>
              </div>
              <button
                onClick={onExploreSystemClick}
                className="w-full py-1 bg-[#E22637] text-white font-bold rounded text-[9px] text-center"
              >
                Send KOT to Kitchen
              </button>
            </div>
          </div>
        </Reveal3DCard>

        {/* Product Switcher Pills */}
        <div className="mt-8 mb-16 flex justify-center items-center flex-wrap gap-2 sm:gap-3">
          {(['Smart POS', '3D Table Menu', 'Kitchen KDS', 'Floor Map'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveProductTab(tab)}
              className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeProductTab === tab
                  ? 'bg-red-500/15 text-[#E22637] border border-red-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Transition to White Section */}
      <div className="bg-white text-slate-900 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-3">
          <Reveal3DText
            tag="h2"
            text="Restaurant POS and dining software made simple!"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
          />
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Manage table orders, kitchen display tickets, bill splitting, and floor service seamlessly from a single unified platform.
          </p>
          <div className="pt-2">
            <a
              href="#products"
              className="inline-flex items-center space-x-1.5 text-[#E22637] font-bold text-sm hover:underline cursor-pointer"
            >
              <span>Explore All System Modules</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
