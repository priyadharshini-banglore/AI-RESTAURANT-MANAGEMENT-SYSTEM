import React from 'react';
import { ArrowRight, UtensilsCrossed, Monitor, ChefHat, MapPin, QrCode, CreditCard, Bell, Sparkles } from 'lucide-react';
import { Reveal3DText, Reveal3DCard } from './Scroll3DAnimation';

interface PetpoojaEcosystemProps {
  onSelectProduct?: (prodName: string) => void;
}

export const PetpoojaEcosystem: React.FC<PetpoojaEcosystemProps> = ({ onSelectProduct }) => {
  return (
    <section id="products" className="py-20 sm:py-28 bg-white text-slate-900 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Pill & Titles */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-red-50 text-[#E22637] border border-red-200 text-xs font-bold uppercase tracking-wider">
            WHAT WE DO
          </div>

          <div className="flex justify-center">
            <Reveal3DText
              tag="h2"
              text="Our ecosystem - empowering restaurants through integrated dining solutions"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.2] text-center"
            />
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            We provide a complete culinary operating system: interactive 3D table ordering, superfast POS billing, live kitchen routing, and real-time floor management.
          </p>
        </div>

        {/* 4 Core Pillars with 3D Entrance & Cursor Tilt */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Interactive 3D QR Table Ordering */}
          <Reveal3DCard delay={0}>
            <div className="h-full bg-[#FAFBFD] rounded-3xl p-7 sm:p-9 border border-slate-200/80 hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E22637] flex items-center justify-center font-black">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">CONTACTLESS DINING</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">3D Table Ordering</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                  Guests scan the QR code on their table to open a cinematic 3D food menu, customize crusts and spice levels, and order directly from their phone.
                </p>
                <a href="#demo" className="text-xs font-bold text-[#E22637] hover:underline inline-flex items-center space-x-1">
                  <span>Explore Table Menu</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* UI Mockup */}
              <div className="mt-8 bg-amber-50/50 rounded-2xl p-5 border border-amber-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-2 text-[11px]">
                  <div className="font-bold text-slate-800 text-xs border-b pb-1 flex justify-between">
                    <span>Table #3 Dine-In</span>
                    <span className="text-emerald-600 font-bold">Active Cart</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>1x Stone-Fired Pizza</span>
                    <span className="font-bold text-slate-900">₹399</span>
                  </div>
                  <div className="text-[9px] text-slate-400 pl-2">Extra Mozzarella · Basil</div>
                  <div className="flex justify-between text-slate-700">
                    <span>2x Thick Cold Coffee</span>
                    <span className="font-bold text-slate-900">₹358</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 border-t pt-1">
                    <span>Cart Total:</span>
                    <span>₹757</span>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-[#E22637] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-slate-800">3D Interactive Models</div>
                  <div className="text-[10px] text-slate-500">
                    Visual rotating dish showcase with dietary and allergen badges.
                  </div>
                </div>
              </div>
            </div>
          </Reveal3DCard>

          {/* 2. Fast 3-Click POS & Dynamic Billing */}
          <Reveal3DCard delay={100}>
            <div className="h-full bg-[#FAFBFD] rounded-3xl p-7 sm:p-9 border border-slate-200/80 hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">CASHIER &amp; BILLING</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">Smart Restaurant POS</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                  Blazing fast 3-click checkout. Bill by table or takeaway, split checks across friends, generate dynamic UPI payment QRs, and print thermal KOT tickets.
                </p>
                <a href="#demo" className="text-xs font-bold text-[#E22637] hover:underline inline-flex items-center space-x-1">
                  <span>Explore POS Terminal</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* UI Mockup */}
              <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-800 text-xs border-b pb-1 flex justify-between">
                    <span>Bill Breakdown</span>
                    <span className="text-blue-600 font-bold">#1042</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">₹877</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%):</span>
                    <span className="font-bold text-slate-900">₹44</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#E22637] border-t pt-1">
                    <span>Total Payable:</span>
                    <span>₹921</span>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 bg-slate-900 text-white rounded-xl p-3 text-[11px] space-y-2">
                  <div className="font-bold text-slate-200">Dynamic Payment Gateway</div>
                  <div className="bg-slate-800 p-2 rounded text-[10px] space-y-1">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>✓ UPI Instant QR</span>
                      <span>Razorpay Synced</span>
                    </div>
                    <div className="text-slate-300">GPay, PhonePe, Paytm, Cards</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal3DCard>

          {/* 3. Live Kitchen Display System (KDS) */}
          <Reveal3DCard delay={150}>
            <div className="h-full bg-[#FAFBFD] rounded-3xl p-7 sm:p-9 border border-slate-200/80 hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">KITCHEN TELEMETRY</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">Smart Kitchen KDS</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                  Eliminate paper ticket errors. Orders route automatically to designated stations (Pizza Oven, Beverage Bar, Main Grill) with live cooking timers.
                </p>
                <a href="#demo" className="text-xs font-bold text-[#E22637] hover:underline inline-flex items-center space-x-1">
                  <span>Explore Kitchen KDS</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* UI Mockup */}
              <div className="mt-8 bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 space-y-2 text-[11px]">
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                    <div className="font-bold text-slate-900 text-[10px] flex justify-between">
                      <span>KOT #18 · Table 3</span>
                      <span className="text-[#E22637] font-bold">Cooking · 4m left</span>
                    </div>
                    <div className="font-semibold text-xs mt-1 text-slate-800">1x Stone-Fired Pepperoni</div>
                    <div className="text-[9px] text-emerald-600 font-bold">Station: Wood Oven</div>
                  </div>

                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                    <div className="font-bold text-slate-900 text-[10px] flex justify-between">
                      <span>KOT #19 · Table 5</span>
                      <span className="text-blue-600 font-bold">Ready to Serve</span>
                    </div>
                    <div className="font-semibold text-xs mt-1 text-slate-800">2x Chilled Frappes</div>
                    <div className="text-[9px] text-blue-600 font-bold">Station: Beverage Bar</div>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center space-y-1.5">
                  <div className="text-2xl font-black text-emerald-600">0s Delay</div>
                  <div className="text-xs font-bold text-slate-800">Instant Kitchen Sync</div>
                  <p className="text-[10px] text-slate-500">Waiters receive instant alerts when a dish is ready on the pass counter.</p>
                </div>
              </div>
            </div>
          </Reveal3DCard>

          {/* 4. Architectural Floorplan & Waiter Call Bell */}
          <Reveal3DCard delay={200}>
            <div className="h-full bg-[#FAFBFD] rounded-3xl p-7 sm:p-9 border border-slate-200/80 hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">FLOOR OPERATIONS</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">Floor Map &amp; Waiter Bell</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                  Interactive bird's-eye architectural table map. Monitor table vacancies, handle reservations, and respond instantly when a customer rings the digital servant call bell.
                </p>
                <a href="#demo" className="text-xs font-bold text-[#E22637] hover:underline inline-flex items-center space-x-1">
                  <span>Explore Floor Manager</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* UI Mockup */}
              <div className="mt-8 bg-purple-50/50 rounded-2xl p-5 border border-purple-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-[11px] space-y-1.5">
                  <div className="font-bold text-slate-800 text-xs border-b pb-1 flex justify-between">
                    <span>Live Floor Status</span>
                    <span className="text-emerald-600 font-bold">12 Tables</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span>🟢 Available Tables</span>
                    <span className="font-bold text-slate-900">7</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span>🟠 Booked &amp; Dining</span>
                    <span className="font-bold text-slate-900">4</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span>🔵 Needs Cleaning</span>
                    <span className="font-bold text-slate-900">1</span>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="font-bold text-xs text-slate-800">Digital Waiter Call Bell</div>
                  <p className="text-[10px] text-slate-500">Customers tap "Ring Waiter" on their phone to request water or billing assistance.</p>
                </div>
              </div>
            </div>
          </Reveal3DCard>

        </div>

      </div>
    </section>
  );
};
