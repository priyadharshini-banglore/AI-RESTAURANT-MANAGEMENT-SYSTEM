import React, { useState, useEffect, useRef } from 'react';
import { soundService } from '../../services/soundService';

export interface PastaDish {
  id: number;
  name: string;
  italianName: string;
  price: number;
  description: string;
  tags: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  image: string;
  calories: number;
  cookTimeMin: number;
  isVegetarian: boolean;
}

export const PASTA_DISHES: PastaDish[] = [
  {
    id: 101,
    name: 'Fettuccine Alfredo Supreme',
    italianName: 'Fettuccine Burro e Parmigiano 36M',
    price: 349,
    description: 'Fresh egg fettuccine tossed in 36-month aged Parmigiano-Reggiano cream, European cultured butter, cracked Telicherry pepper.',
    tags: ['Hand-Spun Farm Eggs', 'Parmigiano 36M', 'Rich & Silky'],
    spiceLevel: 'Mild',
    image: '/images/pasta_alfredo.jpg',
    calories: 580,
    cookTimeMin: 10,
    isVegetarian: true,
  },
  {
    id: 102,
    name: 'Spaghetti Bolognese Al Forno',
    italianName: 'Spaghetti al Ragù Tradizionale',
    price: 399,
    description: 'Slow-simmered 8-hour braised beef and pork ragù, San Marzano tomatoes, fresh rosemary, finished with freshly grated Pecorino Romano.',
    tags: ['8-Hour Ragù', 'Volcanic Stone Baked', 'Chef Signature'],
    spiceLevel: 'Medium',
    image: '/images/pasta_bolognese.jpg',
    calories: 640,
    cookTimeMin: 12,
    isVegetarian: false,
  },
  {
    id: 103,
    name: "Penne All'Arrabiata Diabolo",
    italianName: 'Penne al Pomodoro e Peperoncino',
    price: 299,
    description: 'Bronze-die cut penne rigate fired with fiery Calabrian chili oil, garlic confit, crushed sweet cherry tomatoes, and sweet Genovese basil.',
    tags: ['Calabrian Fire', 'Vegan Friendly', 'Bronze-Die Cut'],
    spiceLevel: 'Spicy',
    image: '/images/pasta_arrabiata.jpg',
    calories: 490,
    cookTimeMin: 9,
    isVegetarian: true,
  },
  {
    id: 104,
    name: 'Classic Guanciale Carbonara',
    italianName: 'Carbonara Autentica Romana',
    price: 399,
    description: 'Crispy cured guanciale pork jowl, golden pasture-raised egg yolks, Pecorino Romano, and toasted black peppercorns. No cream.',
    tags: ['Roman Heritage', 'Guanciale D.O.P', 'Crispy Char'],
    spiceLevel: 'Medium',
    image: '/images/pasta_carbonara.jpg',
    calories: 680,
    cookTimeMin: 11,
    isVegetarian: false,
  },
  {
    id: 105,
    name: 'Genovese Basil Pesto Tagliatelle',
    italianName: 'Tagliatelle al Pesto e Pinoli Tostati',
    price: 349,
    description: 'Hand-crushed Ligurian basil pesto with toasted Italian pine nuts, cold-pressed extra virgin olive oil, and whipped cow-milk ricotta.',
    tags: ['Ligurian Basil', 'Pine Nuts', 'Herbaceous'],
    spiceLevel: 'Mild',
    image: '/images/pasta_pesto.jpg',
    calories: 520,
    cookTimeMin: 10,
    isVegetarian: true,
  },
];

interface OrbitalPastaWheelProps {
  onBackToFeed: () => void;
  onAddToCart: (dish: PastaDish, quantity: number) => void;
  cartCount: number;
  onOpenCart?: () => void;
  onOpenBillPayment?: () => void;
  tableId?: number;
}

export const OrbitalPastaWheel: React.FC<OrbitalPastaWheelProps> = ({
  onBackToFeed,
  onAddToCart,
  cartCount,
  onOpenCart,
  onOpenBillPayment,
  tableId = 4,
}) => {
  // Active dish and interaction state (rotation handled via DOM refs to avoid 60fps React re-renders)
  const [isAutoRolling, setIsAutoRolling] = useState<boolean>(true);
  const [selectedDishIndex, setSelectedDishIndex] = useState<number>(1); // Default Bolognese
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [justAddedAlert, setJustAddedAlert] = useState<boolean>(false);
  const [activePortion, setActivePortion] = useState<'Standard' | 'Generous (+ ₹60)'>('Standard');

  const startYRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(0);
  const dishRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selectedIndexRef = useRef<number>(1);
  selectedIndexRef.current = selectedDishIndex;

  const count = PASTA_DISHES.length;
  const anglePerDish = 360 / count; // 72 degrees per dish
  const originX = 30; // Center inside the black circle
  const originY = 190; // Vertical middle
  const radius = 145; // Orbital track radius

  const updateDishPositions = (angle: number) => {
    for (let idx = 0; idx < count; idx++) {
      const el = dishRefs.current[idx];
      if (el) {
        const dishAngleDeg = (idx * anglePerDish + angle) % 360;
        const dishAngleRad = (dishAngleDeg * Math.PI) / 180;
        const posX = originX + radius * Math.cos(dishAngleRad);
        const posY = originY + radius * Math.sin(dishAngleRad);
        el.style.left = `${posX}px`;
        el.style.top = `${posY}px`;
      }
    }
  };

  // Continuous buttery smooth rolling animation with 0 extra React re-renders
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const animateRollingWheel = (now: number) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isAutoRolling && !isDragging) {
        // Continuous smooth rolling forward (14 degrees per second)
        currentAngleRef.current = (currentAngleRef.current + deltaSec * 14) % 360;
        updateDishPositions(currentAngleRef.current);

        // Update active dish index only when focal dish changes
        const normalized = (360 - (currentAngleRef.current % 360)) % 360;
        const activeIdx = Math.round(normalized / anglePerDish) % count;
        if (activeIdx !== selectedIndexRef.current) {
          setSelectedDishIndex(activeIdx);
        }
      }

      animationFrameId = requestAnimationFrame(animateRollingWheel);
    };

    animationFrameId = requestAnimationFrame(animateRollingWheel);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoRolling, isDragging, count, anglePerDish]);

  // Touch / Drag to rotate the orbital wheel smoothly
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setIsAutoRolling(false);
    startYRef.current = e.clientY;
    startAngleRef.current = currentAngleRef.current;
    soundService.playTactileClick('high');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startYRef.current;
    // Map vertical swipe to wheel rotation (1px = 0.5 degrees)
    const nextAngle = (startAngleRef.current + deltaY * 0.55 + 3600) % 360;
    currentAngleRef.current = nextAngle;
    updateDishPositions(nextAngle);

    const normalized = (360 - (nextAngle % 360)) % 360;
    const activeIdx = Math.round(normalized / anglePerDish) % count;
    if (activeIdx !== selectedIndexRef.current) {
      setSelectedDishIndex(activeIdx);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // After user stops dragging, resume auto-roll after a short inspection pause
      setTimeout(() => setIsAutoRolling(true), 3500);
    }
  };

  // Direct click on any dish along the arc rotates the wheel directly to center it!
  const handleSelectDishByClick = (index: number) => {
    soundService.playTactileClick('mid');
    setIsAutoRolling(false);
    setSelectedDishIndex(index);

    // Calculate target angle so this dish aligns with the spotlight at angle 0
    const targetAngle = (360 - index * anglePerDish) % 360;
    currentAngleRef.current = targetAngle;
    updateDishPositions(targetAngle);

    setTimeout(() => setIsAutoRolling(true), 4000);
  };

  const handleNextDish = () => {
    const nextIdx = (selectedDishIndex + 1) % count;
    handleSelectDishByClick(nextIdx);
  };

  const handlePrevDish = () => {
    const prevIdx = (selectedDishIndex - 1 + count) % count;
    handleSelectDishByClick(prevIdx);
  };

  const activeDish = PASTA_DISHES[selectedDishIndex] || PASTA_DISHES[0];

  const handleAddActiveDishToCart = () => {
    soundService.playOrderSuccessChime();
    onAddToCart(activeDish, orderQuantity);
    setJustAddedAlert(true);
    setTimeout(() => setJustAddedAlert(false), 2200);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1E1B18] font-sans relative overflow-hidden flex flex-col justify-between pb-16 selection:bg-[#B82B14] selection:text-white">
      {/* Top Header matching Image 3 */}
      <div className="max-w-md mx-auto w-full px-4 sm:px-6 pt-3 relative z-30">
        <div className="flex items-center justify-between py-3">
          {/* Back to Discovery Menu Button */}
          <button
            onClick={() => {
              soundService.playTactileClick('low');
              onBackToFeed();
            }}
            aria-label="Back to Menu"
            className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-center text-slate-800 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-lg font-bold">←</span>
          </button>

          {/* Title matching Image 3 */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1C1815] tracking-tight">
              Delicious Pasta
            </h1>
            <span className="text-xl">👩‍🍳</span>
          </div>

          {/* Cart Icon with live count badge */}
          <button
            onClick={onOpenCart}
            aria-label="View Cart"
            className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-center relative text-slate-800 hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#B82B14] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Wheel Showcase Stage - matching Image 3 geometry */}
      <div className="max-w-md mx-auto w-full px-2 sm:px-4 flex-1 flex flex-col justify-center relative z-20 my-auto">
        
        {/* Rolling Status & Mode Controls */}
        <div className="flex items-center justify-between px-3 mb-2">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAutoRolling ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              {isAutoRolling ? 'Rolling Motion Active' : 'Touch Inspected'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAutoRolling(!isAutoRolling)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
            >
              {isAutoRolling ? '⏸ Pause' : '▶️ Auto-Roll'}
            </button>
            <button
              onClick={handlePrevDish}
              className="w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-50"
              title="Previous dish"
            >
              ▲
            </button>
            <button
              onClick={handleNextDish}
              className="w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-50"
              title="Next dish"
            >
              ▼
            </button>
          </div>
        </div>

        {/* The Grand Rolling Wheel Container (Matches the split-circle layout in Image 3) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-[360px] sm:h-[400px] select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-[36px] bg-[#E8EAEF] border border-slate-200 shadow-xl"
        >
          {/* Deep Dark Semi-Circle Wheel Hub on the Left matching Image 3 */}
          <div className="absolute top-1/2 -left-[140px] sm:-left-[160px] -translate-y-1/2 w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] rounded-full bg-[#121214] shadow-2xl shadow-black/40 border-8 border-[#1F1F24] flex items-center justify-center pointer-events-none">
            {/* Inner subtle concentric rings */}
            <div className="w-[240px] h-[240px] rounded-full border border-white/5 flex items-center justify-center">
              <div className="w-[140px] h-[140px] rounded-full border border-white/10" />
            </div>
          </div>

          {/* "Select Pasta" Floating Callout Badge matching Image 3 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-6 z-30 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md border-2 border-slate-900/10 text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center space-x-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#B82B14]" />
              <span className="tracking-wide">Select Pasta</span>
              <span className="text-slate-400 font-bold">➔</span>
            </div>
          </div>

          {/* Orbital Track with Revolving Pasta Dishes */}
          {/* Center of rotation is at the center of the dark circle: (X: ~30px, Y: 180px) */}
          <div className="absolute inset-0 pointer-events-none">
            {PASTA_DISHES.map((dish, idx) => {
              // Calculate dish angle on the revolving orbital wheel
              const dishAngleDeg = (idx * anglePerDish + currentAngleRef.current) % 360;
              const dishAngleRad = (dishAngleDeg * Math.PI) / 180;
              
              const posX = originX + radius * Math.cos(dishAngleRad);
              const posY = originY + radius * Math.sin(dishAngleRad);

              const isCurrentActive = idx === selectedDishIndex;

              return (
                <div
                  key={dish.id}
                  ref={(el) => { dishRefs.current[idx] = el; }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDishByClick(idx);
                  }}
                  style={{
                    left: `${posX}px`,
                    top: `${posY}px`,
                    transform: `translate(-50%, -50%) scale(${isCurrentActive ? 1.15 : 0.88})`,
                    transition: isDragging ? 'none' : 'transform 0.25s ease-out',
                    willChange: 'left, top',
                  }}
                  className={`absolute pointer-events-auto cursor-pointer rounded-full p-1 transition-shadow duration-300 ${
                    isCurrentActive
                      ? 'z-40 ring-4 ring-[#B82B14] shadow-2xl ring-offset-2 ring-offset-white'
                      : 'z-20 opacity-85 hover:opacity-100 hover:scale-95'
                  }`}
                  title={`${dish.name} - Click to select & rotate`}
                >
                  {/* Plate Shadow */}
                  <div className="absolute inset-1 rounded-full bg-black/25 blur-md -z-10 translate-y-2" />

                  {/* Circular Pasta Plate Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      draggable={false}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Active Indicator Crown */}
                  {isCurrentActive && (
                    <div className="absolute -top-2 -right-1 bg-[#B82B14] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
                      ★ Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive instruction watermark */}
          <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-bold bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none">
            ↻ Swipe or click plate to spin wheel
          </div>
        </div>

        {/* Selected Dish Information & Customizer Drawer Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 mt-3 shadow-lg transition-all animate-card-bloom">
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className={activeDish.isVegetarian ? 'veg-badge' : 'nonveg-badge'} />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B82B14]">
                  {activeDish.spiceLevel} Spice • {activeDish.cookTimeMin}m Al Dente
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1 leading-snug">
                {activeDish.name}
              </h3>
              <p className="text-xs text-slate-500 italic font-serif">
                {activeDish.italianName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-[#B82B14]">
                ₹{(activeDish.price * orderQuantity + (activePortion.includes('+') ? 60 : 0)).toFixed(2)}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                {activeDish.calories} kcal
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2 line-clamp-2">
            {activeDish.description}
          </p>

          {/* Tags */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar mt-2.5">
            {activeDish.tags.map((tag) => (
              <span
                key={tag}
                className="whitespace-nowrap px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Portion Selector & Quantity Counter */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-2">
            
            {/* Portion buttons */}
            <div className="flex items-center space-x-1.5">
              {(['Standard', 'Generous (+ ₹60)'] as const).map((portion) => (
                <button
                  key={portion}
                  onClick={() => {
                    setActivePortion(portion);
                    soundService.playTactileClick('low');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                    activePortion === portion
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {portion}
                </button>
              ))}
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => {
                  soundService.playTactileClick('low');
                  setOrderQuantity((q) => Math.max(1, q - 1));
                }}
                className="w-7 h-7 rounded-lg bg-white text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-2xs"
              >
                −
              </button>
              <span className="w-5 text-center text-xs font-black text-slate-900">
                {orderQuantity}
              </span>
              <button
                onClick={() => {
                  soundService.playTactileClick('high');
                  setOrderQuantity((q) => q + 1);
                }}
                className="w-7 h-7 rounded-lg bg-white text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Bill & View Bill Actions */}
          <div className="mt-3 space-y-2">
            <button
              onClick={handleAddActiveDishToCart}
              className="w-full bg-[#B82B14] hover:bg-[#A3240F] text-white font-black text-sm py-3 px-4 rounded-2xl shadow-lg shadow-red-900/15 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <span>{justAddedAlert ? '✓ Added to Table Bill!' : `+ Add to Bill • ₹${(activeDish.price * orderQuantity + (activePortion.includes('+') ? 60 : 0)).toFixed(2)}`}</span>
            </button>

            {onOpenBillPayment && (
              <button
                onClick={() => {
                  soundService.playTactileClick('mid');
                  onOpenBillPayment();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 px-4 rounded-2xl flex items-center justify-center space-x-1.5 transition-all shadow-xs"
              >
                <span>🧾</span>
                <span>View Table #{tableId} Bill & Pay Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar matching Image 3 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-2.5 flex items-center justify-between text-slate-500">
          
          {/* Home Icon */}
          <button
            onClick={() => {
              soundService.playTactileClick('mid');
              onBackToFeed();
            }}
            className="flex flex-col items-center hover:text-[#B82B14] transition-colors group"
          >
            <svg className="w-6 h-6 text-[#B82B14]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-black text-[#B82B14] mt-0.5">Home</span>
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center hover:text-[#B82B14] transition-colors relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#B82B14] text-white text-[9px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] font-bold mt-0.5">Cart</span>
          </button>

          {/* User Profile */}
          <button
            onClick={() => soundService.playTactileClick('low')}
            className="flex flex-col items-center hover:text-[#B82B14] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-bold mt-0.5">Profile</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => soundService.playTactileClick('low')}
            className="flex flex-col items-center hover:text-[#B82B14] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-[10px] font-bold mt-0.5">Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default OrbitalPastaWheel;
