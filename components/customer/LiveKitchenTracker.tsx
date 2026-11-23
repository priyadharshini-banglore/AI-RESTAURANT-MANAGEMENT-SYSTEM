import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';

export interface KitchenTrackItem {
  name: string;
  quantity: number;
  image?: string;
  category?: string;
  price?: number;
}

export interface KitchenOrderTrackerData {
  orderId: string;
  tableId: number;
  status: 'Preparing' | 'Ready' | 'Served';
  step: 1 | 2 | 3 | 4 | 5;
  dishes: KitchenTrackItem[];
  placedAt: number;
  estimatedMinutes: number;
  chefName?: string;
}

interface LiveKitchenTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  placedOrders: KitchenTrackItem[];
  onOpenCallServant?: () => void;
  onOpenBill?: () => void;
  onOpenSplitBill?: () => void;
  onOrderMore?: () => void;
  onOpenReview?: () => void;
}

const STEPS = [
  { step: 1, icon: '📋', title: 'Order Received', desc: 'Dispatched to kitchen wok station', chefTip: 'Ticket printed & ingredients prepped' },
  { step: 2, icon: '🔥', title: 'Cooking in Wok', desc: 'Chef is sizzling & baking in stone oven', chefTip: 'Wood-fired oven at 450°C • Station: Wok #2' },
  { step: 3, icon: '✨', title: 'Plating & Quality Check', desc: 'Garnishing with herbs & chef inspection', chefTip: 'Temperature & quality standards verified' },
  { step: 4, icon: '🚶‍♂️', title: 'On The Way', desc: 'Floor server is carrying dishes to Table', chefTip: 'Freshly plated & heading to your table' },
  { step: 5, icon: '🍽️', title: 'Served at Table', desc: 'Delivered hot to your table. Enjoy!', chefTip: 'Bon appétit! Call waiter anytime if needed' },
];

export const LiveKitchenTracker: React.FC<LiveKitchenTrackerProps> = ({
  isOpen,
  onClose,
  tableId,
  placedOrders,
  onOpenCallServant,
  onOpenBill,
  onOpenSplitBill,
  onOrderMore,
  onOpenReview,
}) => {
  const [trackerData, setTrackerData] = useState<KitchenOrderTrackerData | null>(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${tableId}_kitchen_tracker`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(12 * 60);

  // Sync / create tracker data from placed orders
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${tableId}_kitchen_tracker`);
      if (saved) {
        const parsed: KitchenOrderTrackerData = JSON.parse(saved);
        setTrackerData(parsed);
      } else if (placedOrders && placedOrders.length > 0) {
        const newTracker: KitchenOrderTrackerData = {
          orderId: `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
          tableId,
          status: 'Preparing',
          step: 2,
          dishes: placedOrders,
          placedAt: Date.now(),
          estimatedMinutes: 14,
          chefName: 'Chef Marco & Wok Team',
        };
        localStorage.setItem(`restroai_table_${tableId}_kitchen_tracker`, JSON.stringify(newTracker));
        setTrackerData(newTracker);
      }
    } catch (e) {}
  }, [tableId, placedOrders]);

  // Listen to BroadcastChannel for real-time kitchen status updates
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'ORDER_STATUS_UPDATED') {
          if (!data.tableId || Number(data.tableId) === Number(tableId)) {
            setTrackerData((prev) => {
              if (!prev) return null;
              const nextStatus = data.status;
              let nextStep: 1 | 2 | 3 | 4 | 5 = prev.step;
              if (nextStatus === 'Preparing') nextStep = 2;
              else if (nextStatus === 'Ready') {
                nextStep = 4;
                soundService.playChimeSuccess();
              } else if (nextStatus === 'Served') {
                nextStep = 5;
                soundService.playOrderSuccessChime();
              }

              const updated: KitchenOrderTrackerData = {
                ...prev,
                status: nextStatus,
                step: nextStep,
              };

              try {
                localStorage.setItem(`restroai_table_${tableId}_kitchen_tracker`, JSON.stringify(updated));
              } catch (err) {}

              return updated;
            });
          }
        } else if (data.type === 'ORDER_PLACED' && Number(data.tableId) === Number(tableId)) {
          // Re-initialize or update with new dishes
          try {
            const saved = localStorage.getItem(`restroai_table_${tableId}_kitchen_tracker`);
            if (saved) {
              setTrackerData(JSON.parse(saved));
            }
          } catch (err) {}
        }
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [tableId]);

  // Live Countdown timer
  useEffect(() => {
    if (!trackerData) return;

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - trackerData.placedAt) / 1000);
      const totalEstimatedSeconds = trackerData.estimatedMinutes * 60;
      const left = Math.max(0, totalEstimatedSeconds - elapsedSeconds);
      setRemainingSeconds(left);

      // Auto-step logic if not manually controlled by KDS
      if (trackerData.status === 'Preparing') {
        if (elapsedSeconds < 60 && trackerData.step !== 1) {
          // just placed
        } else if (elapsedSeconds >= 60 && elapsedSeconds < 360 && trackerData.step === 1) {
          setTrackerData((prev) => (prev ? { ...prev, step: 2 } : null));
        } else if (elapsedSeconds >= 360 && elapsedSeconds < 600 && trackerData.step === 2) {
          setTrackerData((prev) => (prev ? { ...prev, step: 3 } : null));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [trackerData]);

  if (!isOpen || !trackerData) return null;

  const currentStepInfo = STEPS.find((s) => s.step === trackerData.step) || STEPS[1];
  const minutesLeft = Math.floor(remainingSeconds / 60);
  const secondsLeft = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="bg-[#fff4dc] rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-3 border-[#3a1a0e] relative animate-card-bloom max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#3a1a0e] border-2 border-[#3a1a0e] font-black text-sm flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-[1px_2px_0_#3a1a0e]"
          title="Close Tracker"
        >
          ✕
        </button>

        {/* Header: Title & Badges */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#d6361f] text-white flex items-center justify-center text-2xl shadow-[2px_3px_0_#3a1a0e] border-2 border-[#3a1a0e] shrink-0">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3a1a0e] text-[#fff4dc] text-[10px] font-semibold uppercase tracking-wider">
                📍 Table #{tableId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#d6361f] border border-[#d6361f] text-[10px] font-black font-mono">
                {trackerData.orderId}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Wok Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3a1a0e] mt-1">
              Live Kitchen Order Tracker
            </h2>
          </div>
        </div>

        {/* Hero Current Status Banner */}
        <div className="bg-gradient-to-br from-[#d6361f] to-[#b3261e] text-[#fff4dc] p-4 sm:p-5 rounded-2xl border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Current Kitchen Phase
            </span>
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300">
              <span>⏱️</span>
              <span>
                {trackerData.step >= 5
                  ? 'Ready & Served'
                  : `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')} min`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl sm:text-4xl animate-bounce-subtle">{currentStepInfo.icon}</span>
            <div>
              <h3 className="font-bold text-lg sm:text-xl uppercase tracking-wide">
                {currentStepInfo.title}
              </h3>
              <p className="text-xs text-amber-100/90 font-medium leading-snug">
                {currentStepInfo.desc}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] text-amber-200 font-semibold">
            <span>🔥 {currentStepInfo.chefTip}</span>
            <span className="hidden sm:inline">Station: Wok #2</span>
          </div>
        </div>

        {/* 5-Step Visual Progress Pipeline */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
            Cooking Journey • 5 Stages
          </span>

          <div className="relative flex items-center justify-between">
            {/* Connecting Progress Track */}
            <div className="absolute top-4 left-3 right-3 h-1.5 bg-slate-200 -z-0 rounded-full" />
            <div
              className="absolute top-4 left-3 h-1.5 bg-gradient-to-r from-amber-400 to-[#d6361f] -z-0 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, ((trackerData.step - 1) / 4) * 100))}%`,
              }}
            />

            {STEPS.map((s) => {
              const isPast = trackerData.step > s.step;
              const isCurrent = trackerData.step === s.step;

              return (
                <div key={s.step} className="flex flex-col items-center z-10 relative group">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${
                      isCurrent
                        ? 'bg-[#d6361f] text-white border-[#3a1a0e] shadow-md scale-110 ring-4 ring-amber-300'
                        : isPast
                        ? 'bg-emerald-500 text-white border-[#3a1a0e]'
                        : 'bg-slate-100 text-slate-400 border-slate-300'
                    }`}
                  >
                    {isPast ? '✓' : s.icon}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider mt-1 text-center max-w-[60px] leading-tight ${
                      isCurrent
                        ? 'text-[#d6361f] font-bold'
                        : isPast
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ordered Dishes In This KOT */}
        <div className="bg-[#fcf8f0] p-4 rounded-2xl border-2 border-amber-200/80 mb-5">
          <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-amber-200/70">
            <span className="text-xs font-black uppercase tracking-wider text-[#3a1a0e]">
              Dishes In This Order ({trackerData.dishes.length})
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              Freshly Prepared
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
            {trackerData.dishes.map((dish, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-200/60 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🍕</span>
                  <div>
                    <span className="font-semibold text-xs text-[#3a1a0e] block leading-tight">
                      {dish.name}
                    </span>
                    {dish.category && (
                      <span className="text-[10px] text-slate-500 font-semibold">{dish.category}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#d6361f] bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    x{dish.quantity}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {trackerData.step >= 4 ? 'Ready' : 'In Wok'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quick Actions: Call Waiter, View Bill, Order More */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundService.playTactileClick('high');
                onClose();
                onOpenCallServant?.();
              }}
              className="py-3 px-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-[#3a1a0e] font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>🛎️</span>
              <span>Call Waiter</span>
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('mid');
                onClose();
                onOpenBill?.();
              }}
              className="py-3 px-2 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>🧾</span>
              <span>View Bill & Pay</span>
            </button>
          </div>

          {onOpenReview && (
            <button
              onClick={() => {
                soundService.playTactileClick('high');
                onClose();
                onOpenReview();
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center gap-1.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>⭐ 1-Tap Rate Experience & Tip Attendant</span>
              <span>➔</span>
            </button>
          )}

          <button
            onClick={() => {
              soundService.playTactileClick('high');
              onClose();
              onOrderMore?.();
            }}
            className="w-full py-3 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-semibold text-xs sm:text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>➕ Order Additional Food for Table #{tableId}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveKitchenTracker;
