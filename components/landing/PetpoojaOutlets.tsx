import React, { useState } from 'react';
import { ArrowRight, Shield, Award, Clock, ChefHat, Users, CheckCircle, BarChart3, QrCode, Monitor, Bell } from 'lucide-react';
import { Reveal3DText, Reveal3DCard } from './Scroll3DAnimation';

export const PetpoojaOutlets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    {
      title: 'Boost Dine-In Table Turnover',
      desc: 'Let customers scan table QR codes to view 3D menus, customize toppings, and order directly',
      linkText: 'Explore 3D Ordering',
      details: [
        'Interactive 3D dish models eliminate ordering confusion',
        'Direct cart-to-kitchen routing cuts table order delay by 70%',
        'Guests can ring the digital waiter call bell with one tap',
        'Add-on suggestions boost average order value by 22%',
      ],
    },
    {
      title: '3-Click Fast POS & Split Billing',
      desc: 'Empower cashiers and floor captains with instant table billing and dynamic UPI payment QR',
      linkText: 'Explore Smart POS',
      details: [
        'Split checks evenly or by ordered items across diners',
        'Automatic 5% GST computation (CGST + SGST)',
        'Dynamic UPI QR code generation on the billing screen',
        'Thermal kitchen KOT ticket printing over local Wi-Fi',
      ],
    },
    {
      title: 'Live Kitchen Display System (KDS)',
      desc: 'Replace noisy lost paper receipts with a clean digital telemetry display for chef stations',
      linkText: 'Explore Kitchen KDS',
      details: [
        'Automatic routing by station (Wood-Fired Oven, Bar, Grill)',
        'Live cooking countdown timers and delayed order alerts',
        'One-touch "Ready to Serve" dispatch notification to floor staff',
      ],
    },
    {
      title: 'Architectural Floor Map Management',
      desc: 'Full visibility over restaurant tables, vacancy status, and guest party sizes',
      linkText: 'Explore Floor Manager',
      details: [
        'Color-coded table indicators (Available, Occupied, Needs Cleaning)',
        'Table reservation booking with guest headcount tracking',
        'Real-time servant call chime notifications with table number',
      ],
    },
  ];

  return (
    <div id="solutions" className="scroll-mt-16">
      
      {/* 1. Dark Navy Trust Metrics Section */}
      <section id="metrics" className="py-20 sm:py-24 bg-[#0D1624] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              How we build trust
            </span>
            <div className="flex justify-center">
              <Reveal3DText
                tag="h2"
                text="Amplifying The Key Dining Metrics That Matter"
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight text-center"
              />
            </div>
          </div>

          {/* 3 Circular Metrics Badges with 3D Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            
            {/* Metric 1 */}
            <Reveal3DCard delay={0}>
              <div className="h-full flex flex-col items-center space-y-3 p-6 rounded-2xl bg-[#131F33]/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-blue-400">
                  <Users className="w-8 h-8" />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  75,000+
                </div>
                <div className="text-sm font-semibold text-slate-400">
                  Tables served daily
                </div>
              </div>
            </Reveal3DCard>

            {/* Metric 2 */}
            <Reveal3DCard delay={100}>
              <div className="h-full flex flex-col items-center space-y-3 p-6 rounded-2xl bg-[#131F33]/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-amber-400">
                  <Award className="w-8 h-8" />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  4.9 ★
                </div>
                <div className="text-sm font-semibold text-slate-400">
                  Guest dining experience rating
                </div>
              </div>
            </Reveal3DCard>

            {/* Metric 3 */}
            <Reveal3DCard delay={150}>
              <div className="h-full flex flex-col items-center space-y-3 p-6 rounded-2xl bg-[#131F33]/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-emerald-400">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  100%
                </div>
                <div className="text-sm font-semibold text-slate-400">
                  Offline billing reliability
                </div>
              </div>
            </Reveal3DCard>

          </div>

        </div>
      </section>

      {/* 2. White Section: Meeting Diverse Needs */}
      <section className="py-20 sm:py-28 bg-white text-slate-900 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-red-50 text-[#E22637] border border-red-200 text-xs font-bold uppercase tracking-wider">
              RESTAURANT WORKFLOW
            </div>

            <div className="flex justify-center">
              <Reveal3DText
                tag="h2"
                text="What our restaurant system does for your operations"
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.2] text-center"
              />
            </div>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Tailored software built specifically for gourmet restaurants, cafes, and bars. Connect front-of-house hospitality with back-of-house kitchen execution.
            </p>
          </div>

          {/* Interactive Accordion Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Tabs List */}
            <div className="lg:col-span-6 space-y-3">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-50 border-slate-300 shadow-md'
                        : 'bg-white border-slate-200/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg sm:text-xl font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {tab.title}
                      </h3>
                      <span className={`text-sm font-bold ${isActive ? 'text-[#E22637]' : 'text-slate-400'}`}>
                        {isActive ? '−' : '+'}
                      </span>
                    </div>

                    {isActive && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-slate-200 text-sm animate-in fade-in duration-200">
                        <p className="text-slate-600 leading-relaxed font-normal">
                          {tab.desc}
                        </p>
                        <div className="space-y-1.5 pt-1">
                          {tab.details.map((d, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2">
                          <a
                            href="#demo"
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#E22637] hover:underline"
                          >
                            <span>{tab.linkText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Graphic with 3D Tilt Card */}
            <div className="lg:col-span-6">
              <Reveal3DCard tiltMax={6}>
                <div className="bg-[#FAFBFD] rounded-3xl p-8 border border-slate-200/80 shadow-lg text-center space-y-6">
                  
                  {/* Visual Avatar Group */}
                  <div className="relative w-64 h-56 mx-auto bg-gradient-to-tr from-red-50 to-amber-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-red-100">
                    <div className="w-16 h-16 rounded-full bg-[#E22637] text-white flex items-center justify-center font-black text-2xl shadow-lg mb-3">
                      R
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {tabs[activeTab].title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 max-w-xs">
                      Connected Kitchen, Floor &amp; Cashier Sync
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Average Setup Time</div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">&lt; 30 Minutes</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Staff Training Needed</div>
                      <div className="text-xl font-bold text-emerald-600 mt-0.5">Zero (Self-Guided)</div>
                    </div>
                  </div>

                </div>
              </Reveal3DCard>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
