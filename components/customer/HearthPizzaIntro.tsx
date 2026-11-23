import React, { useState, useEffect, useRef } from 'react';
import { soundService } from '../../services/soundService';

interface HearthPizzaIntroProps {
  onExploreMenu: () => void;
  cartCount: number;
  onOpenCart?: () => void;
  onAddToBill?: (item: { name: string; price: number; image: string; category: string }) => void;
  onOpenBillPayment?: () => void;
  tableId?: number;
}

export const HearthPizzaIntro: React.FC<HearthPizzaIntroProps> = ({
  onExploreMenu,
  cartCount,
  onOpenCart,
  onAddToBill,
  onOpenBillPayment,
  tableId = 4,
}) => {
  // 12 seconds rolling countdown as requested:
  const [secondsLeft, setSecondsLeft] = useState(12);
  const [isTitleCardVisible, setIsTitleCardVisible] = useState(false);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  const startDragAngle = useRef(0);
  const currentAngleRef = useRef(0);
  const pizzaImgRef = useRef<HTMLImageElement>(null);

  // Fast 4-second countdown timer for quick welcome reveal
  useEffect(() => {
    setSecondsLeft(4);
    setIsTitleCardVisible(false);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When timer reaches 0, smoothly reveal the Welcome Title Card
  useEffect(() => {
    if (secondsLeft === 0 && !isTitleCardVisible) {
      setIsTitleCardVisible(true);
      try {
        soundService.playOrderSuccessChime();
      } catch (e) {}
    }
  }, [secondsLeft, isTitleCardVisible]);

  // Continuous smooth clockwise rolling animation using direct DOM transform (zero React re-renders)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animateRotation = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isAutoSpinning && !isDragging) {
        // Continuous smooth clockwise roll (26 degrees per second)
        currentAngleRef.current = (currentAngleRef.current + delta * 26) % 360;
        if (pizzaImgRef.current) {
          pizzaImgRef.current.style.transform = `rotate(${currentAngleRef.current}deg)`;
        }
      }

      animationFrameId = requestAnimationFrame(animateRotation);
    };

    animationFrameId = requestAnimationFrame(animateRotation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoSpinning, isDragging]);

  // Touch & Drag to Spin interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startDragAngle.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) - currentAngleRef.current;
    soundService.playTactileClick('high');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const newAngle = (angle - startDragAngle.current + 360) % 360;
    currentAngleRef.current = newAngle;
    if (pizzaImgRef.current) {
      pizzaImgRef.current.style.transform = `rotate(${newAngle}deg)`;
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => setIsAutoSpinning(true), 1200);
    }
  };

  const handleAddPizzaToBill = () => {
    soundService.playOrderSuccessChime();
    onAddToBill?.({
      name: 'New Orleans Pepperoni Pizza (12")',
      price: 15,
      image: '/images/pizza.jpg',
      category: 'Pizza',
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('BELLACRAVE');
    setCopiedCode(true);
    soundService.playTactileClick('high');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSkipToWelcome = () => {
    setSecondsLeft(0);
    setIsTitleCardVisible(true);
    soundService.playTactileClick('mid');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EB] to-[#F3ECE1] text-[#1E1B18] font-sans relative overflow-x-hidden pb-24 select-none">
      
      {/* FLOATING CULINARY INGREDIENTS matching the phone photo */}
      <div className="absolute top-44 left-4 w-9 h-9 rounded-full bg-[#E23744]/90 border-2 border-white shadow-md animate-float pointer-events-none flex items-center justify-center text-sm">
        🍅
      </div>
      <div className="absolute top-40 right-6 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center text-base shadow-xs animate-pulse pointer-events-none">
        🌿
      </div>
      <div className="absolute top-[340px] left-5 w-7 h-7 flex items-center justify-center text-base animate-float pointer-events-none">
        🌶️
      </div>
      <div className="absolute top-[360px] right-7 w-3.5 h-3.5 rounded-full bg-[#3B2D26] opacity-80 pointer-events-none" />
      <div className="absolute top-52 right-12 w-2.5 h-2.5 rounded-full bg-[#9C4E2D] opacity-70 pointer-events-none" />

      {/* Main Responsive Mobile Frame */}
      <div className="max-w-md mx-auto px-4 sm:px-6 pt-2 relative z-10">
        
        {/* Top Status Bar: Time & Network */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 px-1 py-1">
          <span className="font-bold text-sm">11:27</span>
          <div className="flex items-center space-x-1.5 text-slate-700 text-[11px]">
            <span>📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Clean Restaurant Header (NO "Order Manually" text as requested) */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#B82B14] animate-ping" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                BELLA HEARTH • CRAFT OVEN
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Washington Park Outpost
              </h1>
            </div>
          </div>

          {/* Cart Icon with Live Bill Counter */}
          <button
            onClick={onOpenCart}
            aria-label="View Cart & Bill"
            className="w-11 h-11 rounded-2xl bg-white border border-[#EBE3D7] flex items-center justify-center relative shadow-sm hover:scale-105 active:scale-95 transition-all text-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E23744] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* 15s Clockwise Rolling Countdown Badge */}
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-md border border-[#EADBCE] rounded-full px-4 py-2 mt-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B82B14] animate-pulse" />
            <span className="text-xs font-black text-[#3B322C]">
              Oven Clockwise Rolling • {secondsLeft}s
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FCE6DF] text-[#A62814] text-[11px] font-black">
              🔥 914°F
            </span>
            {!isTitleCardVisible && (
              <button
                onClick={handleSkipToWelcome}
                className="text-[11px] font-black text-[#B82B14] hover:underline"
              >
                Skip ⏩
              </button>
            )}
          </div>
        </div>

        {/* ONLY THE PIZZA IS ROLLING (HERO CENTERPIECE) */}
        <div className="relative mt-8 mb-4 flex flex-col items-center">
          
          {/* Centered Rotating Pizza on Wooden Peel */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-68 h-68 sm:w-80 sm:h-80 cursor-grab active:cursor-grabbing select-none transition-transform hover:scale-[1.02] z-20"
            title="Rolling clockwise in animation! Drag to spin."
          >
            {/* Ambient drop shadow under pizza board */}
            <div className="absolute inset-4 rounded-full bg-black/25 blur-xl -z-10 translate-y-4" />

            {/* Rotating Pizza Image */}
            <img
              ref={pizzaImgRef}
              src="/images/pizza.jpg"
              alt="Artisanal Pizza Rolling Clockwise"
              draggable={false}
              style={{
                transform: 'rotate(0deg)',
                willChange: 'transform',
              }}
              className="w-full h-full object-contain filter drop-shadow-2xl rounded-full"
            />

            {/* Live 15-Second HUD Circular Track */}
            <div className="absolute -inset-2 pointer-events-none rounded-full flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="#E8C9B0"
                  strokeWidth="2"
                  strokeDasharray="301.59"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="#C83818"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="301.59"
                  strokeDashoffset={301.59 * (1 - secondsLeft / 15)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>
          </div>

          {/* Clockwise Spin Interaction Pill */}
          <div className="flex items-center space-x-2 mt-4 z-20">
            <button
              onClick={() => setIsAutoSpinning(!isAutoSpinning)}
              className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-[#EADBCE] text-[#342D27] px-4 py-2 rounded-full text-xs font-black shadow-sm hover:bg-white active:scale-95 transition-all"
            >
              <span className={`text-sm ${isAutoSpinning ? 'animate-spin' : ''}`}>🔄</span>
              <span>Watch Clockwise Roll</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#FCE5DD] text-[#B82B14] font-black text-[11px]">
                {secondsLeft}s
              </span>
            </button>

            <button
              onClick={handleAddPizzaToBill}
              className="inline-flex items-center space-x-1.5 bg-[#EA580C] hover:bg-[#D94E07] text-white px-4 py-2 rounded-full text-xs font-black shadow-md shadow-orange-500/25 transition-all active:scale-95"
            >
              <span>{addedNotice ? '✓ Added!' : '🛒 Add to Bill • ₹399'}</span>
            </button>
          </div>
        </div>

        {/* TITLE CARD: "Welcome to Bella Hearth Resto & Co." */}
        {/* Smooth blooming entrance as requested after the 15-second roll */}
        <div
          className={`mt-6 transition-all duration-700 ${
            isTitleCardVisible
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto animate-card-bloom'
              : 'opacity-40 translate-y-4 scale-98 pointer-events-none'
          }`}
        >
          <div className="bg-[#FEEFE6] border border-[#F4D2C1] rounded-[32px] p-5 sm:p-6 shadow-xl shadow-orange-950/5 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-[#8A4832] mb-2">
              <span className="px-2.5 py-1 rounded-full bg-white/70 border border-[#EAC4B0]">
                ARTISANAL HEARTH
              </span>
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/70 border border-[#EAC4B0]">
                <span>⏱</span>
                <span>90 Sec Bake</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1815] tracking-tight leading-tight">
              Welcome to <span className="text-[#B82B14]">Bella Hearth</span> Resto & Co.
            </h2>

            <p className="text-xs sm:text-sm text-[#5C4F44] font-medium leading-relaxed mt-2">
              Handcrafted Neapolitan pizzas fired at 900°F on volcanic stone & artisanal pasta spun daily with farm eggs.
            </p>

            {/* Flash Chef Deal Box */}
            <div className="bg-white/95 rounded-2xl p-3.5 mt-4 border border-[#EED7C8] shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FDE8DF] text-[#B82B14] flex items-center justify-center font-bold text-sm">
                    🏷️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#1C1815]">
                      Flash Chef Deal: 30% OFF
                    </h4>
                    <p className="text-[11px] text-[#7A6E65]">
                      First Gourmet Order
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#FDE8DF] text-[#B82B14] text-[11px] font-black flex items-center space-x-1">
                  <span>⏱</span>
                  <span>14:56</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F2E0D4] text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#7A6E65] text-[11px] font-bold">Use Code:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FCE5DD] text-[#B82B14] font-black tracking-wider text-[11px]">
                    BELLACRAVE
                  </span>
                </div>
                <button
                  onClick={handleCopyCoupon}
                  className="flex items-center space-x-1 text-[11px] font-bold text-[#4E443C] hover:text-[#B82B14] transition-colors"
                >
                  <span>{copiedCode ? '✓ Copied!' : '📋 Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: Explore Full Menu & Pay Bill */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  soundService.playTactileClick('high');
                  onExploreMenu();
                }}
                className="w-full bg-[#B82B14] hover:bg-[#A3240F] text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Explore Full Menu</span>
                <span className="text-lg">➔</span>
              </button>

              {onOpenBillPayment && (
                <button
                  onClick={() => {
                    soundService.playTactileClick('mid');
                    onOpenBillPayment();
                  }}
                  className="w-full bg-white/90 hover:bg-white text-slate-800 border border-[#E8D1C3] font-black text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xs"
                >
                  <span>🧾</span>
                  <span>View Table #{tableId} Bill & Pay Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-white/85 backdrop-blur-sm border border-[#EADBCE] rounded-2xl p-2.5 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-[#FCE5DD] text-[#B82B14] flex items-center justify-center text-xs mx-auto mb-1">
                🌾
              </div>
              <h5 className="text-[11px] font-black text-[#1C1815] leading-tight">
                Caputo 00
              </h5>
              <p className="text-[9px] text-[#7A6E65] font-semibold">
                Stoneground
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-sm border border-[#EADBCE] rounded-2xl p-2.5 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-[#FEF0D6] text-[#C27318] flex items-center justify-center text-xs mx-auto mb-1">
                ⏱️
              </div>
              <h5 className="text-[11px] font-black text-[#1C1815] leading-tight">
                72-Hour
              </h5>
              <p className="text-[9px] text-[#7A6E65] font-semibold">
                Cold Ferment
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-sm border border-[#EADBCE] rounded-2xl p-2.5 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-[#E0F3EE] text-[#248A6F] flex items-center justify-center text-xs mx-auto mb-1">
                🍃
              </div>
              <h5 className="text-[11px] font-black text-[#1C1815] leading-tight">
                Campania
              </h5>
              <p className="text-[9px] text-[#7A6E65] font-semibold">
                San Marzano
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HearthPizzaIntro;
