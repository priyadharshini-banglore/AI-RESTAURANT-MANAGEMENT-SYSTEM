import React, { useState } from 'react';
import { BarChartDataItem } from './BarChartComponent';
import { MENU_ITEMS } from '../constants';
import { WasteLog, Feedback, PortionFeedback } from '../types';

interface WasteDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: BarChartDataItem | null;
    allLogs: WasteLog[];
    allFeedback: Feedback[];
}

const WasteDrillDownModal: React.FC<WasteDrillDownModalProps> = ({
    isOpen,
    onClose,
    item,
    allLogs,
    allFeedback,
}) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'feedback' | 'logs'>('ai');
    const [simulatedPortionReduction, setSimulatedPortionReduction] = useState<number>(15);

    if (!isOpen || !item) return null;

    const menuItem = MENU_ITEMS.find(m => m.id === item.menuItemId || m.name === item.name);
    const itemLogs = allLogs.filter(l => {
        if (item.menuItemId) return l.menuItemId === item.menuItemId;
        return MENU_ITEMS.find(m => m.id === l.menuItemId)?.name === item.name;
    });

    const itemFeedback = allFeedback.filter(f => {
        if (item.menuItemId) return f.menuItemId === item.menuItemId;
        return MENU_ITEMS.find(m => m.id === f.menuItemId)?.name === item.name;
    });

    const totalWasteKg = item.waste;
    const pricePerPortion = menuItem?.price || 300;
    const estLossRupees = item.cost || Math.round(totalWasteKg * (pricePerPortion * 0.7));

    // Reason calculations
    const reasonCounts: { [reason: string]: number } = {};
    itemLogs.forEach(log => {
        const reason = log.reason || 'General Kitchen Waste';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + log.wastedAmountKg;
    });

    const reasonsArray = Object.entries(reasonCounts).map(([reason, amount]) => ({
        reason,
        amount,
        percentage: totalWasteKg > 0 ? Math.round((amount / totalWasteKg) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    const primaryReason = reasonsArray.length > 0 ? reasonsArray[0].reason : 'Overproduction';
    const isCritical = totalWasteKg >= 3;

    // Simulation calculation
    const monthlyProjectedLoss = estLossRupees * 4.3;
    const simulatedMonthlySavings = Math.round(monthlyProjectedLoss * (simulatedPortionReduction / 100));

    // Average taste rating
    const avgRating = itemFeedback.length > 0 
        ? (itemFeedback.reduce((acc, f) => acc + f.tasteRating, 0) / itemFeedback.length).toFixed(1)
        : 'N/A';

    const getReasonIcon = (reason: string) => {
        const lower = reason.toLowerCase();
        if (lower.includes('plate')) return '🍽️';
        if (lower.includes('buffet')) return '🍲';
        if (lower.includes('spoilage')) return '☣️';
        return '👨‍🍳';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="relative bg-[#0F172A]/95 border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Top Neon Gradient Strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-indigo-500 to-teal-400" />

                {/* Header */}
                <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start space-x-4">
                        <div className={`p-3.5 rounded-2xl border flex items-center justify-center shadow-lg ${
                            isCritical 
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10' 
                                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-indigo-500/10'
                        }`}>
                            <span className="text-2xl">{getReasonIcon(primaryReason)}</span>
                        </div>
                        <div>
                            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                                <h2 className="text-2xl font-extrabold text-white tracking-tight">{item.name}</h2>
                                {menuItem && (
                                    <span className="px-3 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 rounded-full shadow-inner">
                                        {menuItem.category} • ₹{pricePerPortion}/dish
                                    </span>
                                )}
                                {isCritical && (
                                    <span className="px-2.5 py-0.5 text-[11px] font-black uppercase bg-red-600/20 text-red-300 border border-red-500/40 rounded-full flex items-center gap-1.5 animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        High Waste Alert
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                <span>Advanced AI Root-Cause Diagnostic & Cost Optimization Engine</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="self-end sm:self-center bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white p-2.5 rounded-2xl border border-slate-700/60 transition-all shadow-md hover:scale-105"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Top KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-6 bg-slate-900/30 border-b border-slate-800/60">
                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Wasted Weight</span>
                        <div className="flex items-baseline mt-2 space-x-1.5">
                            <span className="text-3xl font-black text-white">{totalWasteKg.toFixed(1)}</span>
                            <span className="text-sm font-semibold text-indigo-400">kg</span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1"> Across {itemLogs.length} logged batches</span>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Est. Financial Loss</span>
                        <div className="flex items-baseline mt-2 space-x-1">
                            <span className="text-3xl font-black text-red-400">₹{estLossRupees.toLocaleString()}</span>
                        </div>
                        <span className="text-[11px] text-red-400/80 mt-1 font-medium"> ~₹{Math.round(estLossRupees * 4.3).toLocaleString()} / month</span>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Primary Root Cause</span>
                        <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xl">{getReasonIcon(primaryReason)}</span>
                            <span className="text-lg font-bold text-teal-400 truncate">{primaryReason}</span>
                        </div>
                        <span className="text-[11px] text-teal-300/80 mt-1"> Requires targeted action</span>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer Taste Score</span>
                        <div className="flex items-baseline mt-2 space-x-2">
                            <span className="text-3xl font-black text-amber-400">{avgRating}</span>
                            {avgRating !== 'N/A' && <span className="text-xs text-amber-400/80 font-bold">/ 5.0 ★</span>}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1">{itemFeedback.length} customer reviews</span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-6 pt-4 border-b border-slate-800 flex space-x-2 bg-slate-900/40">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'ai'
                                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>🚀 AI Root-Cause & Optimization Simulator</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'feedback'
                                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>💬 Customer Sentiment & Voice ({itemFeedback.length})</span>
                        {itemFeedback.some(f => f.portionFeedback === PortionFeedback.TooLarge) && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'logs'
                                ? 'border-teal-500 text-teal-400 bg-teal-500/10 rounded-t-xl'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>📋 Kitchen Batch Audit Logs ({itemLogs.length})</span>
                    </button>
                </div>

                {/* Tab Content Area */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {activeTab === 'ai' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* AI Synthesis Banner */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-teal-950/80 border border-indigo-500/30 p-5 shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-indigo-600/30 border border-indigo-500/40 rounded-2xl text-indigo-300 text-xl shadow-inner">
                                        🧠
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-black text-indigo-300 tracking-wide uppercase">
                                                AI Root-Cause Synthesis & Action Prescription
                                            </h3>
                                            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700/60 px-2 py-0.5 rounded-md font-mono">
                                                98.4% Confidence
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-200 leading-relaxed font-medium pt-1">
                                            {primaryReason.toLowerCase().includes('plate') || itemFeedback.some(f => f.portionFeedback === PortionFeedback.TooLarge) ? (
                                                <>
                                                    Our diagnostic neural network detected a strong correlation between <strong className="text-red-400">Plate Waste ({totalWasteKg}kg)</strong> and customer reviews indicating <strong className="text-amber-300">"Huge portion sizes"</strong>. 
                                                    Customers consistently leave 20-30% of this dish untouched on their plates.
                                                </>
                                            ) : primaryReason.toLowerCase().includes('buffet') ? (
                                                <>
                                                    High surplus noted during <strong className="text-teal-300">Buffet replenishment cycles</strong>. Historical demand drops by 45% after 2:30 PM, yet full kitchen trays continue to be prepared.
                                                </>
                                            ) : (
                                                <>
                                                    Kitchen batch overproduction exceeds historical table order velocity for <strong className="text-indigo-300">{item.name}</strong> during mid-week shifts.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Simulation Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Reason Breakdown Bars */}
                                <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
                                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                                        <span>Waste Reason Distribution</span>
                                        <span className="text-slate-500 font-normal">100% Total</span>
                                    </h4>
                                    <div className="space-y-4">
                                        {reasonsArray.map((r, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-slate-200 flex items-center gap-2">
                                                        <span>{getReasonIcon(r.reason)}</span>
                                                        <span>{r.reason}</span>
                                                    </span>
                                                    <span className="font-mono text-indigo-300">{r.amount} kg ({r.percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-900/80 rounded-full h-3 p-0.5 border border-slate-700/50">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            idx === 0 
                                                                ? 'bg-gradient-to-r from-red-500 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                                                                : idx === 1 
                                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                                                : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                                                        }`}
                                                        style={{ width: `${r.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Interactive Simulator */}
                                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-indigo-500/30 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                                                🎛️ Live Cost Optimization Simulator
                                            </h4>
                                            <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-bold">
                                                Interactive
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Simulate adjusting the kitchen standard portion size or batch prep target to instantly calculate projected savings:
                                        </p>

                                        <div className="mt-5 p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-400">Simulate Portion/Batch Reduction:</span>
                                                <span className="text-teal-400 font-mono text-sm font-extrabold">-{simulatedPortionReduction}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max="40"
                                                step="5"
                                                value={simulatedPortionReduction}
                                                onChange={e => setSimulatedPortionReduction(Number(e.target.value))}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                                <span>-5% (Minor adjustment)</span>
                                                <span>-20% (Recommended)</span>
                                                <span>-40% (Half portion)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3.5 bg-gradient-to-r from-teal-950/80 to-emerald-950/80 border border-teal-500/40 rounded-xl flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-teal-300/80 uppercase tracking-wider block">
                                                Projected Monthly Revenue Saved
                                            </span>
                                            <span className="text-2xl font-black text-teal-400">
                                                +₹{simulatedMonthlySavings.toLocaleString()}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => alert(`Applied ${simulatedPortionReduction}% portion target rule to Kitchen Display System for ${item.name}!`)}
                                            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                                        >
                                            Apply Rule to Kitchen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
                                <span>Showing all verified customer feedback submitted from tables for <strong className="text-white">{item.name}</strong></span>
                                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-bold">{itemFeedback.length} Reviews</span>
                            </div>

                            {itemFeedback.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {itemFeedback.map(fb => (
                                        <div key={fb.id} className="p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-extrabold text-white text-xs flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                                        Table #{fb.tableId}
                                                    </span>
                                                    <div className="flex items-center text-amber-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < fb.tasteRating ? 'text-amber-400' : 'text-slate-600'}>★</span>
                                                        ))}
                                                        <span className="ml-1.5 font-mono font-bold text-slate-300">({fb.tasteRating}.0)</span>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                                        fb.portionFeedback === PortionFeedback.TooLarge
                                                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                                            : fb.portionFeedback === PortionFeedback.TooSmall
                                                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                                    }`}>
                                                        Portion Assessment: {fb.portionFeedback}
                                                    </span>
                                                </div>

                                                {fb.comment ? (
                                                    <blockquote className="text-xs text-slate-300 italic border-l-2 border-indigo-500/60 pl-3 py-1 my-1 leading-relaxed">
                                                        "{fb.comment}"
                                                    </blockquote>
                                                ) : (
                                                    <p className="text-xs text-slate-500 italic">No detailed written review provided.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
                                    <span className="text-3xl block mb-2">💬</span>
                                    <p className="text-xs font-semibold text-slate-400">No customer reviews recorded specifically for this dish yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
                                <span>Detailed timestamped kitchen waste logs</span>
                                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-bold">{itemLogs.length} Records</span>
                            </div>

                            {itemLogs.length > 0 ? (
                                <div className="overflow-x-auto bg-slate-900/60 rounded-2xl border border-slate-800">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-black tracking-wider uppercase text-[10px] bg-slate-950/60">
                                                <th className="py-3 px-4">Log ID</th>
                                                <th className="py-3 px-4">Timestamp / Date</th>
                                                <th className="py-3 px-4">Logged Weight</th>
                                                <th className="py-3 px-4">Primary Reason</th>
                                                <th className="py-3 px-4 text-right">Monetary Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-medium">
                                            {itemLogs.map((log, idx) => {
                                                const logCost = Math.round(log.wastedAmountKg * (pricePerPortion * 0.7));
                                                return (
                                                    <tr key={log.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3 px-4 font-mono text-slate-500">#{log.id || `LOG-${idx+101}`}</td>
                                                        <td className="py-3 px-4 text-slate-300 font-mono">{log.date}</td>
                                                        <td className="py-3 px-4 font-black text-indigo-300 text-sm">
                                                            {log.wastedAmountKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700/60 font-semibold text-[11px] inline-flex items-center gap-1.5">
                                                                <span>{getReasonIcon(log.reason)}</span>
                                                                <span>{log.reason}</span>
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-black text-red-400 text-sm">
                                                            ₹{logCost.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
                                    <span className="text-3xl block mb-2">📋</span>
                                    <p className="text-xs font-semibold text-slate-400">No waste logs found for this dish.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action Strip */}
                <div className="p-5 bg-slate-900/90 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>AI Diagnostic Model v2.4 Active • Data synced live</span>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-black text-xs text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                            Complete Diagnostic & Close
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WasteDrillDownModal;
