import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export const AdminAuthModal: React.FC = () => {
  const { isAdminAuthenticated, loginAdmin } = useAppContext();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (isAdminAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter your Staff or Admin PIN.');
      return;
    }
    const success = loginAdmin(pin.trim());
    if (!success) {
      setError('Invalid Access PIN. Contact your floor manager or chef.');
    } else {
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade-in font-sans select-none">
      <div 
        className="relative bg-[#fffdf7] border-3 border-[#3a1a0e] rounded-[36px] shadow-[6px_6px_0_#3a1a0e] w-full max-w-md text-center p-6 sm:p-8 overflow-hidden animate-card-bloom"
      >
        {/* Top Header Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#d6361f]" />

        {/* Staff Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center text-3xl mx-auto mb-3 text-white">
          🛡️
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#3a1a0e] tracking-tight mb-1">
          Staff & Servant Portal
        </h2>
        <div className="flex items-center justify-center gap-1.5 mb-5">
          <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-[#d6361f] border border-rose-300">
            🔒 Restricted to Floor Servants & Kitchen Staff
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase text-[#3a1a0e]">
                Enter Staff Access PIN:
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#fff4dc] text-[#3a1a0e] font-bold border border-[#3a1a0e]/30">
                Default: 1234
              </span>
            </div>
            <input
              type="password"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              placeholder="••••"
              className="w-full bg-white border-2 border-[#3a1a0e] rounded-2xl px-4 py-3 text-center text-xl tracking-[0.3em] font-black text-[#d6361f] focus:outline-none focus:ring-2 focus:ring-[#d6361f]/20 shadow-xs"
              autoFocus
            />
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-2 text-center animate-shake">
                ⚠️ {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#d6361f] hover:bg-[#ea3b21] text-white font-medium text-xs uppercase tracking-wider rounded-2xl border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>Unlock Staff Floor Map & KDS</span>
          </button>
        </form>

        {/* Customer Return Button */}
        <div className="mt-5 pt-4 border-t-2 border-[#3a1a0e]/15 text-center space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Are you a customer dining at a table?
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#fff4dc] hover:bg-[#ffeac2] text-[#3a1a0e] font-semibold text-xs uppercase tracking-wider border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <span>🍕 Return to Customer Menu</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
