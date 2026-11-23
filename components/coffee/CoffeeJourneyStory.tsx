import React, { useState } from 'react';
import { JourneyCanvas3D } from './three/JourneyCanvas3D';
import { ChevronRight, Droplets, Flame, Wind, Sparkles, Coffee } from 'lucide-react';

export const CoffeeJourneyStory: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 0,
      title: 'Scene 1 — Specialty Coffee Beans',
      subtitle: 'Sourced from misty volcanic highlands',
      description:
        'Whole green Arabica beans harvested at peak ripeness, naturally sun-dried and calibrated to preserve delicate fruity notes and sweet aroma before roasting.',
      icon: <Sparkles className="w-5 h-5 text-[#B77A4B]" />,
      stats: 'Grade 1 • 100% Arabica',
    },
    {
      id: 1,
      title: 'Scene 2 — Precision Grinding',
      subtitle: 'Ultra-uniform conical burr milling',
      description:
        'Steel burrs rotate at steady low RPM to minimize thermal friction, producing a uniform medium-fine particle distribution designed for optimal extraction.',
      icon: <Flame className="w-5 h-5 text-[#C87552]" />,
      stats: '600µm Particle Size',
    },
    {
      id: 2,
      title: 'Scene 3 — Artisan Hand Pouring',
      subtitle: 'Steady spiral 93°C water flow',
      description:
        'A balanced gooseneck kettle releases hot water in slow concentric circles over the coffee bed. Fresh CO2 blooms gently before extraction begins.',
      icon: <Droplets className="w-5 h-5 text-[#B77A4B]" />,
      stats: '1:16 Brew Ratio',
    },
    {
      id: 3,
      title: 'Scene 4 — Fresh Extraction & Dripping',
      subtitle: 'Golden drops into heat-resistant glass carafe',
      description:
        'The clean brew filters down drop by drop, releasing rich caramel hues and complex acidity into the carafe with gentle rising steam.',
      icon: <Wind className="w-5 h-5 text-[#C87552]" />,
      stats: '3m 15s Total Brew Time',
    },
    {
      id: 4,
      title: 'Scene 5 — The Coffee Moment',
      subtitle: 'Poured into a warm ceramic cup with golden crema',
      description:
        'Served in an artisanal matte ceramic cup. Warm, balanced, and deeply satisfying—made for mindful mornings and unforgettable moments.',
      icon: <Coffee className="w-5 h-5 text-[#B77A4B]" />,
      stats: 'Served at 68°C',
    },
  ];

  return (
    <section id="journey" className="relative py-24 sm:py-32 bg-[#EAE2D5] text-[#2D211B] overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#EAE2D5] to-[#D8C8B4]/40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F5F1E9] border border-[#2D211B]/15 text-xs font-bold uppercase tracking-[0.2em] text-[#593A2C] mb-4 shadow-sm">
            <span>Scroll & Interactive Storytelling</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D211B]">
            THE ART OF EXTRACTION.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#593A2C] font-light max-w-xl mx-auto">
            Experience each stage of the craft. Follow the transformation from single-origin bean to the perfect pour.
          </p>
        </div>

        {/* 2-Column Interactive Journey: 3D Canvas Left, Step Storyline Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Three.js 3D Viewport */}
          <div className="lg:col-span-7 bg-[#F5F1E9] rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-white relative overflow-hidden min-h-[480px] sm:min-h-[560px] flex flex-col justify-between">
            {/* Top Scene Indicator */}
            <div className="flex items-center justify-between z-10 pb-2 border-b border-[#2D211B]/10">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C87552] animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#593A2C]">
                  Live 3D Stage • {steps[activeStep].title.split('—')[0]}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#B77A4B] bg-[#EAE2D5] px-2.5 py-1 rounded-full">
                Step 0{activeStep + 1} / 05
              </span>
            </div>

            {/* 3D WebGL Canvas */}
            <div className="flex-1 w-full relative flex items-center justify-center my-2">
              <JourneyCanvas3D currentStep={activeStep} className="w-full h-[400px] sm:h-[460px]" />
            </div>

            {/* Bottom Controls / Quick Slider */}
            <div className="pt-3 border-t border-[#2D211B]/10 flex items-center justify-between z-10">
              <span className="text-xs text-[#593A2C] font-medium hidden sm:inline">
                {steps[activeStep].stats}
              </span>
              <div className="flex items-center space-x-2 mx-auto sm:mx-0">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeStep === idx
                        ? 'w-8 bg-[#2D211B]'
                        : 'w-2.5 bg-[#B77A4B]/40 hover:bg-[#B77A4B]'
                    }`}
                    aria-label={`Jump to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Step Cards & Narrative */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-5 sm:p-6 rounded-2xl transition-all duration-300 cursor-pointer border ${
                    isActive
                      ? 'bg-[#F5F1E9] border-[#2D211B] shadow-xl translate-x-1.5'
                      : 'bg-white/60 hover:bg-white/90 border-transparent hover:border-[#2D211B]/15'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2.5 rounded-xl transition-colors ${
                          isActive ? 'bg-[#2D211B] text-[#F5F1E9]' : 'bg-[#EAE2D5] text-[#593A2C]'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-[#2D211B]">
                          {step.title}
                        </h3>
                        <p className="text-xs text-[#B77A4B] font-semibold tracking-wide">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isActive ? 'text-[#C87552] rotate-90' : 'text-slate-400'
                      }`}
                    />
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-[#2D211B]/10 animate-fade-in space-y-2">
                      <p className="text-sm text-[#593A2C] leading-relaxed font-light">
                        {step.description}
                      </p>
                      <div className="inline-block px-3 py-1 rounded-full bg-[#EAE2D5] text-xs font-bold text-[#2D211B]">
                        {step.stats}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

