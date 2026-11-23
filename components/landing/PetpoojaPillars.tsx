import React from 'react';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Monitor, 
  ChefHat, 
  MapPin, 
  BellRing, 
  CreditCard, 
  Layers, 
  Cpu, 
  Clock, 
  CheckCircle2,
  Smartphone,
  Receipt
} from 'lucide-react';
import { Reveal3DText, Reveal3DCard } from './Scroll3DAnimation';

export const PetpoojaPillars: React.FC = () => {
  return (
    <section id="about-us" className="py-20 sm:py-28 bg-[#0D1624] text-white scroll-mt-16 relative">
      {/* Anchor alias for compatibility */}
      <span id="why-us" className="absolute -top-16 opacity-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Pill & Centered Titles */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-[#E22637] text-xs font-bold uppercase tracking-wider">
            ABOUT RESTRO • WHAT WE DO
          </div>

          <div className="flex justify-center">
            <Reveal3DText
              tag="h2"
              text="A Modern Web Operating System Built Specifically for Restaurants"
              highlightWords={['Modern', 'Restaurants']}
              highlightClass="text-[#E22637]"
              align="center"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.2] text-center"
            />
          </div>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            We don't do complex payroll or bloated corporate ERP. Restro is a fast, web-native dining platform crafted to streamline what actually matters: <strong className="text-white">3D table ordering</strong>, <strong className="text-white">3-click POS billing</strong>, <strong className="text-white">live kitchen routing</strong>, and <strong className="text-white">architectural floor management</strong>.
          </p>
        </div>

        {/* 4 Navy Cards (2x2 Grid with 3D Tilt Entrance) */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

          {/* Card 1: 3D Table Ordering */}
          <Reveal3DCard delay={0}>
            <div className="h-full bg-[#131F33] rounded-2xl p-7 sm:p-9 border border-slate-800/80 flex flex-col justify-between hover:border-red-500/40 transition-all group shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#E22637]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Guest Experience</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                  Interactive 3D QR Table Ordering
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Guests scan their table QR code from their smartphone to explore photorealistic 3D dish models in 360°. They can customize portions, select spice levels, check allergen tags, and place orders directly to the kitchen.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center">
                <div className="relative w-full max-w-sm bg-[#0E1726] rounded-xl p-4 flex items-center justify-between border border-slate-800">
                  <div className="flex flex-col items-center space-y-2 pr-3 border-r border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#E22637]">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 text-center">3D WebGL Menu</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 pl-2 flex-1">
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-slate-200">360° Food Rotation &amp; Zoom</span>
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-slate-200">Dietary &amp; Allergen Tags</span>
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span className="text-slate-200">One-Tap Waiter Call Bell</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal3DCard>

          {/* Card 2: 3-Click POS & Multi-Split Billing */}
          <Reveal3DCard delay={100}>
            <div className="h-full bg-[#131F33] rounded-2xl p-7 sm:p-9 border border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/40 transition-all group shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Speed &amp; Checkout</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Superfast 3-Click POS &amp; Split Billing
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Created for busy service hours. Waiters punch dine-in, takeaway, or delivery tickets in 3 clicks. Supports flexible bill splitting (equal split, custom amount, or item-by-item) and instant thermal receipt printing.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center">
                <div className="relative w-full max-w-sm bg-[#0E1726] rounded-xl p-4 flex items-center justify-between border border-slate-800">
                  <div className="flex flex-col items-center space-y-2 pr-3 border-r border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                      3-Click
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 text-center">Fast Checkout</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 pl-2 flex-1">
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-emerald-300 font-medium">
                      ✓ Equal &amp; Item-Wise Split Bills
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-200">
                      ✓ Instant GST (CGST + SGST) Auto-Math
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-200">
                      ✓ Cash, Card, &amp; Dynamic UPI QR
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal3DCard>

          {/* Card 3: Live Kitchen KDS */}
          <Reveal3DCard delay={150}>
            <div className="h-full bg-[#131F33] rounded-2xl p-7 sm:p-9 border border-slate-800/80 flex flex-col justify-between hover:border-blue-500/40 transition-all group shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Kitchen Operations</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Live Kitchen Display System (KDS)
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Say goodbye to lost paper tickets. Orders route directly to kitchen displays with color-coded preparation timers, order stages (Pending, In Cooking, Ready, Served), and audible audio notifications for kitchen staff.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center">
                <div className="relative w-full max-w-sm bg-[#0E1726] rounded-xl p-4 flex items-center justify-between border border-slate-800">
                  <div className="flex flex-col items-center space-y-2 pr-3 border-r border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 text-center">Zero Paper Waste</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 pl-2 flex-1">
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-amber-300">
                      • Live Prep Countdown Timer
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-200">
                      • Color-Coded Urgency Statuses
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-emerald-400 font-medium">
                      • Sound Chime When Order Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal3DCard>

          {/* Card 4: Floor Map & Waiter Call Bell */}
          <Reveal3DCard delay={200}>
            <div className="h-full bg-[#131F33] rounded-2xl p-7 sm:p-9 border border-slate-800/80 flex flex-col justify-between hover:border-purple-500/40 transition-all group shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Floor Coordination</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  Architectural Floor Map &amp; Call Bell
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  A visual architectural blueprint of your dining room. Hostesses and servers monitor table availability in real time, see who has ordered, and receive immediate waiter call-bell alerts triggered from guest tables.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center">
                <div className="relative w-full max-w-sm bg-[#0E1726] rounded-xl p-4 flex items-center justify-between border border-slate-800">
                  <div className="flex flex-col items-center space-y-2 pr-3 border-r border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 text-center">Live Table Map</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 pl-2 flex-1">
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-200">
                      • Vacant, Occupied &amp; Billed Colors
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-purple-300 font-medium">
                      • Instant Waiter Assistance Alert
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1 rounded text-emerald-400 font-medium">
                      • Dedicated Staff Servant Portal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal3DCard>

        </div>

        {/* Bottom Platform Feature Highlights */}
        <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-5 rounded-xl bg-[#131F33]/50 border border-slate-800 flex flex-col items-center space-y-2">
            <Smartphone className="w-6 h-6 text-[#E22637]" />
            <h4 className="font-bold text-white text-base">100% Web-Based</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No expensive terminal hardware required. Runs smoothly in any browser on iPads, Android tablets, phones, and PCs.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#131F33]/50 border border-slate-800 flex flex-col items-center space-y-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-base">Real-Time State Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a customer orders or a chef updates an order status, the cashier POS and floor map update instantly.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#131F33]/50 border border-slate-800 flex flex-col items-center space-y-2">
            <Receipt className="w-6 h-6 text-blue-400" />
            <h4 className="font-bold text-white text-base">Zero Bloatware</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly focused on high-speed restaurant operations: tables, menu, kitchen tickets, split bills, and guest satisfaction.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
