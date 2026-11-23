import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MENU_ITEMS } from '../constants';
import { soundService } from '../services/soundService';

const WasteLogForm: React.FC = () => {
    const { addWasteLog } = useAppContext();
    const [menuItemId, setMenuItemId] = useState<number>(MENU_ITEMS[0].id);
    const [wastedAmount, setWastedAmount] = useState('');
    const [reason, setReason] = useState('Overproduction');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (menuItemId && wastedAmount) {
            soundService.playOrderSuccessChime();
            addWasteLog({
                date: new Date().toISOString().split('T')[0],
                menuItemId: Number(menuItemId),
                wastedAmountKg: parseFloat(wastedAmount),
                reason,
            });
            setWastedAmount('');
            setIsSubmitted(true);
            setTimeout(() => setIsSubmitted(false), 2500);
        }
    };

    return (
        <div className="bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7 flex flex-col justify-between select-none">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-xl bg-amber-100 border border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                            🌱
                        </span>
                        <h2 className="text-xl font-bold text-[#3a1a0e] tracking-wide">
                            Log Kitchen Waste
                        </h2>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#f6efe2] text-[#3a1a0e] border border-[#3a1a0e]/30">
                        Manual Entry
                    </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-5">
                    Record prep scraps, buffet leftovers, or spoiled ingredients to tune the neural model.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="menuItem" className="block text-xs font-semibold uppercase text-[#3a1a0e] mb-1">
                            Menu Item
                        </label>
                        <select
                            id="menuItem"
                            value={menuItemId}
                            onChange={(e) => setMenuItemId(Number(e.target.value))}
                            className="w-full px-3 py-2.5 text-xs font-bold text-[#3a1a0e] bg-white border-2 border-[#3a1a0e] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d6361f]/20 shadow-xs cursor-pointer"
                        >
                            {MENU_ITEMS.map(item => (
                                <option key={item.id} value={item.id}>{item.name} (₹{item.price})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="wastedAmount" className="block text-xs font-semibold uppercase text-[#3a1a0e] mb-1">
                                Wasted Quantity (kg)
                            </label>
                            <input
                                type="number"
                                id="wastedAmount"
                                value={wastedAmount}
                                onChange={(e) => setWastedAmount(e.target.value)}
                                step="0.1"
                                min="0.1"
                                required
                                className="w-full px-3 py-2.5 text-xs font-mono font-black text-[#d6361f] bg-white border-2 border-[#3a1a0e] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d6361f]/20 shadow-xs"
                                placeholder="e.g. 1.8"
                            />
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-xs font-semibold uppercase text-[#3a1a0e] mb-1">
                                Cause / Reason
                            </label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2.5 text-xs font-bold text-[#3a1a0e] bg-white border-2 border-[#3a1a0e] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d6361f]/20 shadow-xs cursor-pointer"
                            >
                                <option>Overproduction</option>
                                <option>Plate waste</option>
                                <option>Buffet</option>
                                <option>Spoilage</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 px-4 rounded-xl font-medium text-xs uppercase tracking-wider border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSubmitted 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc]'
                        }`}
                    >
                        <span>{isSubmitted ? '✅' : '📥'}</span>
                        <span>{isSubmitted ? 'Waste Logged & Telemetry Synced!' : 'Submit Waste Entry'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WasteLogForm;
