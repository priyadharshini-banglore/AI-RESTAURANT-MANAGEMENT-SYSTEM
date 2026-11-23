import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundService } from '../services/soundService';
import { useAppContext } from '../contexts/AppContext';

interface StaffPortalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffPortalsModal: React.FC<StaffPortalsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAdminAuthenticated, loginAdmin } = useAppContext();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    soundService.playTactileClick('high');
    if (isAdminAuthenticated) {
      onClose();
      navigate(path);
    } else {
      setPendingRoute(path);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter your Staff or Admin PIN (e.g. 1234).');
      return;
    }
    const success = loginAdmin(pin.trim());
    if (success) {
      soundService.playOrderSuccessChime();
      setError('');
      onClose();
      navigate(pendingRoute || '/tables');
    } else {
      soundService.playAlertSound();
      setError('Invalid PIN. Use default staff PIN: 1234');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-lg bg-[#fffdf7] rounded-[32px] sm:rounded-[36px] shadow-2xl border-3 border-[#3a1a0e] overflow-hidden flex flex-col max-h-[92vh] animate-card-bloom">
        
        {/* Header */}
        <div className="bg-[#1c1613] text-[#fff4dc] p-5 border-b-2 border-[#3a1a0e] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center text-2xl shrink-0">
                🛡️
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#d6361f] text-white text-[10px] font-semibold uppercase tracking-wider">
                  Staff & Kitchen Hub
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  Restaurant Staff Portals
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#fff4dc] border border-white/20 flex items-center justify-center font-black text-sm transition-transform active:scale-95 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* If NOT Authenticated, show quick PIN entry */}
          {!isAdminAuthenticated && (
            <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Staff Authentication Required</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-bold">
                  PIN: 1234
                </span>
              </div>

              <form onSubmit={handleLogin} className="flex gap-2">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter PIN (1234)"
                  className="flex-1 bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-center text-sm font-black tracking-widest text-[#d6361f] focus:outline-none focus:border-[#d6361f]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d6361f] hover:bg-[#ea3b21] text-white font-medium text-xs uppercase rounded-xl border border-[#3a1a0e] shadow-xs cursor-pointer active:scale-95"
                >
                  Unlock Staff
                </button>
              </form>

              {error && (
                <p className="text-[11px] font-bold text-rose-600 text-center">
                  ⚠️ {error}
                </p>
              )}
            </div>
          )}

          {/* Quick Staff Navigation Cards - 3 Main Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* 1. Floor Servant & Table Map Portal */}
            <button
              onClick={() => handleNavigate('/tables')}
              className="p-4 rounded-2xl bg-white hover:bg-amber-50 border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-[#3a1a0e] shadow-[1px_1px_0_#3a1a0e] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🛎️
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f6efe2] text-[#3a1a0e] font-bold border border-[#3a1a0e]/30">
                    /#/tables
                  </span>
                </div>
                <h4 className="font-semibold text-base text-[#3a1a0e] uppercase tracking-wide">
                  Servant Floor Map
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                  Live table occupancy, incoming floor waiter bell alerts, and table payment folios.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#d6361f] mt-3 block uppercase tracking-wider">
                Open Floor Map ➔
              </span>
            </button>

            {/* 2. Kitchen Display System (KDS) */}
            <button
              onClick={() => handleNavigate('/kitchen')}
              className="p-4 rounded-2xl bg-white hover:bg-amber-50 border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-10 h-10 rounded-xl bg-red-100 border-2 border-[#3a1a0e] shadow-[1px_1px_0_#3a1a0e] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    👨‍🍳
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f6efe2] text-[#3a1a0e] font-bold border border-[#3a1a0e]/30">
                    /#/kitchen
                  </span>
                </div>
                <h4 className="font-semibold text-base text-[#3a1a0e] uppercase tracking-wide">
                  Kitchen KDS Display
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                  Real-time chef order tickets, cooking stages (Preparing → Ready → Served), and station bells.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#d6361f] mt-3 block uppercase tracking-wider">
                Open Kitchen KDS ➔
              </span>
            </button>

            {/* 3. Executive Dashboard & Waste Analytics (Full Width or Hero Card) */}
            <button
              onClick={() => handleNavigate('/dashboard')}
              className="sm:col-span-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fff4dc] to-[#ffeac2] hover:to-[#ffd89e] border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <span className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                  📊
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg text-[#3a1a0e] uppercase tracking-wide">
                      Executive Analytics & Waste Dashboard
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#3a1a0e] font-bold border border-[#3a1a0e]">
                      /#/dashboard
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                    Revenue performance, target goals, live customer ratings, server tips, and AI neural waste prediction.
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-[#d6361f] text-white font-semibold text-xs uppercase tracking-wider border border-[#3a1a0e] shadow-xs shrink-0 group-hover:bg-[#ea3b21]">
                Launch Analytics ➔
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-medium text-center pt-2">
            Tip: Customers ordering at tables do not see this. Access anytime via the discrete <strong>Staff Portal</strong> link or by navigating directly to <code>/#/tables</code> or <code>/#/kitchen</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffPortalsModal;
