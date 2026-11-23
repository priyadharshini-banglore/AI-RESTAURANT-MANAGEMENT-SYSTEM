import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';

export interface ServiceCall {
  id: string;
  tableId: number;
  type: string;
  note?: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  staffName?: string;
  createdAt: string;
}

interface CallServantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  activeCall: ServiceCall | null;
  onCallInitiated: (call: ServiceCall) => void;
  onCallCancelled: () => void;
}

const PRESET_REQUESTS = [
  { id: 'water', icon: '💧', label: 'Drinking Water', desc: 'Fresh chilled or warm drinking water' },
  { id: 'cutlery', icon: '🍴', label: 'Extra Cutlery & Napkins', desc: 'Spoons, forks, plates & tissues' },
  { id: 'sauce', icon: '🌶️', label: 'Extra Dips & Sauces', desc: 'Chilli flakes, oregano, mayo or ketchup' },
  { id: 'bill', icon: '🧾', label: 'Request Paper Bill', desc: 'Bring physical printed bill to table' },
  { id: 'clean', icon: '🧹', label: 'Clear Empty Plates', desc: 'Clear finished dishes from table' },
  { id: 'waiter', icon: '🙋‍♂️', label: 'Call Waiter in Person', desc: 'Need staff assistance or recommendation' },
];

export const CallServantModal: React.FC<CallServantModalProps> = ({
  isOpen,
  onClose,
  tableId,
  activeCall,
  onCallInitiated,
  onCallCancelled,
}) => {
  const [selectedType, setSelectedType] = useState('Drinking Water');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeCall && activeCall.type) {
      setSelectedType(activeCall.type);
    }
  }, [activeCall]);

  if (!isOpen) return null;

  const handleSendCall = async () => {
    setIsSubmitting(true);
    soundService.playTactileClick('high');

    const newCall: ServiceCall = {
      id: `CALL-${Date.now()}`,
      tableId,
      type: selectedType,
      note: customNote.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 1. Save to local storage for persistence on refresh
    try {
      localStorage.setItem(`restroai_table_${tableId}_service_call`, JSON.stringify(newCall));
    } catch (e) {}

    // 2. Broadcast immediately over BroadcastChannel (keep channel open briefly)
    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_REQUEST',
        call: newCall,
        tableId,
        timestamp: Date.now(),
      });
      setTimeout(() => {
        try { channel.close(); } catch(e) {}
      }, 3000);
    } catch (e) {}

    // 3. Post to window and parent / iframes for instant IPC
    try {
      window.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId, call: newCall }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId, call: newCall }, '*');
      }
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId, call: newCall }, '*'); } catch(e){}
      });
    } catch (e) {}

    // 4. Post to backend API
    try {
      fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call: newCall }),
      }).catch(() => {});
    } catch (e) {}

    onCallInitiated(newCall);
    setIsSubmitting(false);

    // Auto close modal with positive feedback after 1.2s so guest knows staff was called
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCancelCall = () => {
    soundService.playTactileClick('low');
    try {
      localStorage.removeItem(`restroai_table_${tableId}_service_call`);
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_RESOLVED',
        tableId,
        timestamp: Date.now(),
      });
      setTimeout(() => {
        try { channel.close(); } catch(e) {}
      }, 3000);

      window.postMessage({ type: 'SERVICE_CALL_RESOLVED', tableId }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SERVICE_CALL_RESOLVED', tableId }, '*');
      }
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_RESOLVED', tableId }, '*'); } catch(e){}
      });

      fetch('/api/service-calls/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, status: 'resolved' }),
      }).catch(() => {});
    } catch (e) {}

    onCallCancelled();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#fff4dc] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-3 border-[#3a1a0e] relative animate-card-bloom">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#3a1a0e] border-2 border-[#3a1a0e] font-black text-sm flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-[1px_2px_0_#3a1a0e]"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#d6361f] text-white text-2xl flex items-center justify-center mx-auto mb-2.5 shadow-[2px_3px_0_#3a1a0e] border-2 border-[#3a1a0e] animate-bounce-subtle">
            🛎️
          </div>
          <h3 className="font-bold text-2xl uppercase tracking-tight text-[#3a1a0e]">
            Call Table #{tableId} Servant
          </h3>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Tap a quick request below. Your floor waiter will be alerted instantly!
          </p>
        </div>

        {/* Active Call Live Status Box (If already called) */}
        {activeCall && activeCall.status !== 'resolved' ? (
          <div className="mb-5 p-4 rounded-2xl bg-white border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Live Request Status</span>
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  activeCall.status === 'acknowledged'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                    : 'bg-amber-100 text-amber-800 border-amber-400 animate-pulse'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeCall.status === 'acknowledged' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                {activeCall.status === 'acknowledged' ? 'Servant On The Way' : 'Alert Sent • Pending'}
              </span>
            </div>

            <div className="bg-[#fcf8f0] p-3 rounded-xl border border-amber-200/80 mb-3">
              <div className="font-semibold text-base text-[#3a1a0e] flex items-center gap-1.5">
                <span>{activeCall.type}</span>
              </div>
              {activeCall.note && (
                <p className="text-xs text-slate-600 mt-1 italic font-medium">"{activeCall.note}"</p>
              )}
              <p className="text-[11px] text-slate-500 mt-1.5 font-semibold">
                {activeCall.status === 'acknowledged'
                  ? `🚶‍♂️ ${activeCall.staffName || 'Floor staff'} has acknowledged and is walking to your table.`
                  : '🔔 Waiter floor map has lit up. Servant arriving shortly.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancelCall}
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#3a1a0e] border-2 border-[#3a1a0e] font-medium text-xs uppercase tracking-wide cursor-pointer shadow-[1px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all"
              >
                ✕ Cancel Request
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#d6361f] hover:bg-[#ea3b21] text-white border-2 border-[#3a1a0e] font-medium text-xs uppercase tracking-wide cursor-pointer shadow-[1px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all"
              >
                ✓ Got It
              </button>
            </div>
          </div>
        ) : (
          /* Request Picker Options */
          <div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {PRESET_REQUESTS.map((req) => {
                const isSelected = selectedType === req.label;
                return (
                  <button
                    key={req.id}
                    onClick={() => {
                      soundService.playTactileClick('mid');
                      setSelectedType(req.label);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#d6361f] text-white border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] scale-[1.02]'
                        : 'bg-white hover:bg-amber-50/50 text-[#3a1a0e] border-[#3a1a0e] shadow-[1px_2px_0_#3a1a0e]'
                    }`}
                  >
                    <span className="text-xl mb-1">{req.icon}</span>
                    <span className="font-semibold text-xs uppercase tracking-tight leading-tight block">
                      {req.label}
                    </span>
                    <span className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {req.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Notes */}
            <div className="mb-4">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Optional Note / Special Request:
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. 2 warm water glasses, extra spicy dip..."
                className="w-full bg-white border-2 border-[#3a1a0e] rounded-xl px-3 py-2 text-xs text-[#3a1a0e] placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 shadow-[1px_2px_0_#3a1a0e]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#3a1a0e] border-2 border-[#3a1a0e] font-medium text-xs uppercase tracking-wide cursor-pointer shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleSendCall}
                disabled={isSubmitting}
                className="flex-2 py-3 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-white border-2 border-[#3a1a0e] font-medium text-sm uppercase tracking-wide cursor-pointer shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Call Waiter Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallServantModal;
