import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';

interface FloatingOrderTrackerPillProps {
  tableId: number;
  hasPlacedOrders: boolean;
  onOpenTracker: () => void;
}

export const FloatingOrderTrackerPill: React.FC<FloatingOrderTrackerPillProps> = ({
  tableId,
  hasPlacedOrders,
  onOpenTracker,
}) => {
  const [trackerStatus, setTrackerStatus] = useState<string>('Preparing');
  const [step, setStep] = useState<number>(2);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${tableId}_kitchen_tracker`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status) setTrackerStatus(parsed.status);
        if (parsed.step) setStep(parsed.step);
      }
    } catch (e) {}

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;
        if (data.type === 'ORDER_STATUS_UPDATED' && (!data.tableId || Number(data.tableId) === Number(tableId))) {
          setTrackerStatus(data.status);
          if (data.status === 'Ready') setStep(4);
          else if (data.status === 'Served') setStep(5);
          else setStep(2);
        } else if (data.type === 'TABLE_PAID' && Number(data.tableId) === Number(tableId)) {
          setStep(5);
        }
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [tableId]);

  if (!hasPlacedOrders) return null;

  const getStatusDisplay = () => {
    if (step >= 5 || trackerStatus === 'Served') {
      return { text: 'Food Served!', bg: 'bg-emerald-500 text-white' };
    }
    if (step === 4 || trackerStatus === 'Ready') {
      return { text: 'Waiter Bringing Food!', bg: 'bg-emerald-600 text-white animate-bounce-subtle' };
    }
    if (step === 3) {
      return { text: 'Plating in Kitchen...', bg: 'bg-amber-500 text-slate-950' };
    }
    return { text: 'Chef Cooking in Wok', bg: 'bg-[#d6361f] text-white animate-pulse' };
  };

  const status = getStatusDisplay();

  return (
    <div className="fixed bottom-5 left-4 z-40 animate-fade-in font-sans select-none">
      <button
        onClick={() => {
          soundService.playTactileClick('high');
          onOpenTracker();
        }}
        className={`px-3.5 py-2.5 rounded-2xl border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] flex items-center gap-2 font-semibold text-xs uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all transform hover:scale-105 ${status.bg}`}
        title="View Live Kitchen Order Tracker for your Table"
      >
        <div className="text-left">
          <span className="block text-[10px] opacity-90 leading-tight font-sans font-bold">
            Table #{tableId} Live Order
          </span>
          <span className="block text-xs leading-tight">{status.text}</span>
        </div>
        <span className="ml-1 text-sm bg-white/20 px-1.5 py-0.5 rounded-lg">➔</span>
      </button>
    </div>
  );
};

export default FloatingOrderTrackerPill;
