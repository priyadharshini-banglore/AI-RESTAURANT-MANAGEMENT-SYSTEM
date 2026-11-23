import React, { useState } from 'react';
import { BrewingStation3D } from './three/BrewingStation3D';
import { Play, Pause, RotateCcw, Thermometer, Scale, Clock, Sparkles } from 'lucide-react';

export const CoffeeBrewingGuide: React.FC = () => {
  const [isPouring, setIsPouring] = useState<boolean>(true);
  const [doseGrams, setDoseGrams] = useState<number>(18);
  const [ratio, setRatio] = useState<number>(16); // 1:16
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Calculated water needed in ml (grams)
  const totalWaterMl = Math.round(doseGrams * ratio);

  // Timer loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section id="brewing" className="py-24 sm:py-32 bg-[#EAE2D5] text-[#2D211B] relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#B77A4B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Content & Brewing Lab Guide */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center space-x-2 text-[#C87552] text-xs uppercase tracking-[0.25em] font-bold mb-3">
                <span className="w-6 h-[2px] bg-[#C87552]" />
                <span>The Pour-Over Ritual</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#2D211B] leading-tight">
                POUR. PAUSE. <br />
                <span className="italic font-serif text-[#B77A4B] font-normal">ENJOY.</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#593A2C] font-light leading-relaxed">
                Brewing coffee is a meditation of geometry, heat, and flow rate. Observe the extraction
                unfold in real-time or fine-tune your brew ratio below.
              </p>
            </div>

            {/* Interactive Brew Calculator & Timer Card */}
            <div className="bg-[#F5F1E9] rounded-3xl p-6 sm:p-8 shadow-xl border border-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#2D211B]/10">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#B77A4B]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D211B]">
                    Barista Ratio Calculator
                  </span>
                </div>
                <button
                  onClick={() => setIsPouring(!isPouring)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isPouring ? 'bg-[#C87552] text-white' : 'bg-[#EAE2D5] text-[#593A2C]'
                  }`}
                >
                  {isPouring ? 'Kettle Flow: ON' : 'Kettle Flow: PAUSED'}
                </button>
              </div>

              {/* Slider for Coffee Dose */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#593A2C]">
                  <span className="flex items-center space-x-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Coffee Dose</span>
                  </span>
                  <span className="font-mono text-sm text-[#2D211B]">{doseGrams} grams</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="30"
                  value={doseGrams}
                  onChange={(e) => setDoseGrams(Number(e.target.value))}
                  className="w-full accent-[#2D211B] cursor-pointer"
                />
              </div>

              {/* Slider for Ratio */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#593A2C]">
                  <span>Extraction Ratio</span>
                  <span className="font-mono text-sm text-[#2D211B]">1:{ratio}</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="18"
                  value={ratio}
                  onChange={(e) => setRatio(Number(e.target.value))}
                  className="w-full accent-[#2D211B] cursor-pointer"
                />
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-3 rounded-2xl bg-white border border-[#2D211B]/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Water</span>
                  <span className="text-base font-black text-[#2D211B]">{totalWaterMl} ml</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#2D211B]/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#C87552]" />
                    <span>Water Temp</span>
                  </span>
                  <span className="text-base font-black text-[#2D211B]">93.5°C</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#2D211B]/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-[#B77A4B]" />
                    <span>Brew Timer</span>
                  </span>
                  <span className="text-base font-black font-mono text-[#2D211B]">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-5 py-2.5 rounded-full bg-[#2D211B] hover:bg-[#593A2C] text-[#F5F1E9] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-md cursor-pointer"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Pour Timer</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="p-2.5 rounded-full bg-[#EAE2D5] hover:bg-[#D8C8B4] text-[#2D211B] cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Pour-Over Visualizer Viewport */}
          <div className="lg:col-span-6">
            <div className="bg-[#F5F1E9] rounded-3xl p-6 shadow-2xl border-4 border-white relative min-h-[500px] sm:min-h-[560px] flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#2D211B]/10 z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#593A2C]">
                  3D Pour-Over Extraction Rig
                </span>
                <span className="text-xs text-[#B77A4B] font-semibold">
                  Gooseneck Kettle • Glass Server
                </span>
              </div>

              {/* Three.js Canvas */}
              <div className="flex-1 w-full relative flex items-center justify-center">
                <BrewingStation3D isWaterPouring={isPouring} className="w-full h-[420px] sm:h-[460px]" />
              </div>

              <div className="pt-3 border-t border-[#2D211B]/10 text-center text-xs text-[#593A2C] z-10">
                ✦ Realistic hot water stream, continuous droplet physics, and rising steam particles
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

