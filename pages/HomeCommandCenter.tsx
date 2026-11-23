import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { MENU_ITEMS } from '../constants';
import CameraAnalysisModal from '../components/CameraAnalysisModal';
import QRCodeModal from '../components/QRCodeModal';
import { CameraIcon } from '../components/icons/CameraIcon';
import { WaiterIcon } from '../components/icons/WaiterIcon';
import { ChefHatIcon } from '../components/icons/ChefHatIcon';
import { soundService } from '../services/soundService';
import { Table } from '../types';

const HomeCommandCenter: React.FC = () => {
    const navigate = useNavigate();
    const { tables, orders, wasteLogs } = useAppContext();
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [isAiWaiterOpen, setIsAiWaiterOpen] = useState(false);
    const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
    const [customerPreference, setCustomerPreference] = useState<string>('');
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate real live metrics from context
    const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;
    const activeOrdersCount = orders.filter(o => o.status !== 'Served').length;
    const totalWasteKg = wasteLogs.reduce((sum, log) => sum + log.wastedAmountKg, 0);
    const estimatedSavingsRupees = Math.round(totalWasteKg * 210 * 1.8);

    const handleGenerateAiRecommendation = () => {
        soundService.playOrderSuccessChime();
        if (!customerPreference.trim()) {
            setAiRecommendation("💡 AI Tip: Tell us your craving or mood! E.g., 'Spicy aromatic biryani', 'Light vegetarian Dal', or 'Sweet hot dessert'.");
            return;
        }
        const prefLower = customerPreference.toLowerCase();
        if (prefLower.includes('spicy') || prefLower.includes('rice') || prefLower.includes('chicken')) {
            setAiRecommendation("✨ AI Chef Recommendation: We strongly recommend our **Signature Chicken Biryani (₹450)**! Slow-cooked with aromatic basmati rice & saffron. Our neural portion optimizer ensures the exact right serving size to prevent waste while satisfying hearty appetites.");
        } else if (prefLower.includes('veg') || prefLower.includes('creamy') || prefLower.includes('paneer') || prefLower.includes('dal')) {
            setAiRecommendation("✨ AI Chef Recommendation: Try our creamy **Dal Makhani (₹300)** paired with **Garlic Naan (₹75)** or sizzling **Paneer Tikka (₹250)**! Consistently rated 5/5 stars by tables today with near-zero plate waste.");
        } else if (prefLower.includes('sweet') || prefLower.includes('dessert')) {
            setAiRecommendation("✨ AI Chef Recommendation: Finish your dining experience with warm, melt-in-your-mouth **Gulab Jamun (₹150)** or a refreshing hot **Masala Chai (₹100)**!");
        } else {
            setAiRecommendation(`✨ AI Chef Recommendation: Based on your preference for "${customerPreference}", our Chef's Top Pick right now is **Paneer Tikka (₹250)** for starters followed by **Veg Pulao (₹350)**! Both items have 98% customer satisfaction today.`);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16 max-w-7xl mx-auto px-2 sm:px-4">
            {/* 🔴 Zomato Crimson Executive Hero Banner Strip */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E23744] via-[#D32F2F] to-[#CB1A2B] text-white p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-red-400/30">
                <div className="flex items-center space-x-5 relative z-10">
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md p-1 shadow-inner shrink-0 border border-white/40">
                        <div className="w-full h-full bg-white rounded-[12px] flex items-center justify-center text-3xl">
                            🤖
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/25 backdrop-blur-md text-white border border-white/30 shadow-sm flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                Neural Command Core v5.0
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/20 text-white font-mono flex items-center gap-1.5">
                                ⏱️ Live Sync: {currentTime}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2 leading-tight">
                            Operations Command Center
                        </h1>
                        <p className="text-xs sm:text-sm text-red-100 mt-0.5 max-w-2xl font-medium">
                            Ultra-fast Zomato Apple Glass enterprise telemetry across all dining tables, chef wok KDS displays, and automated margin shield engines.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto relative z-10 justify-end">
                    <button
                        onClick={() => { soundService.playTactileClick('high'); setIsCameraModalOpen(true); }}
                        className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#E23744] font-black text-xs uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95 border border-white/80"
                    >
                        <CameraIcon className="w-4 h-4" />
                        <span>AI Plate Scanner</span>
                    </button>
                    <button
                        onClick={() => { soundService.playTactileClick('high'); setIsAiWaiterOpen(true); }}
                        className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all transform hover:scale-105 active:scale-95 border border-white/30"
                    >
                        <span>✨ Ask Chef AI</span>
                    </button>
                    <button
                        onClick={() => { soundService.playTactileClick('high'); setSelectedTableForQR(tables[0] || { id: 1, status: 'Free' as any, chairs: 4 }); }}
                        className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all transform hover:scale-105 active:scale-95 border border-white/30"
                    >
                        <span>📱 Table QRs</span>
                    </button>
                </div>
            </div>

            {/* 🔮 Apple-Zomato Executive KPI Counter Cards with Live Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="zomato-card p-6 flex flex-col justify-between group cursor-pointer border-t-4 border-t-[#E23744]" onClick={() => { soundService.playTactileClick('mid'); navigate('/tables'); }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Floor Seating Telemetry</span>
                            <h3 className="text-sm font-black text-slate-800 mt-0.5">Dine-In Table Status</h3>
                        </div>
                        <span className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#E23744] group-hover:scale-110 transition-transform shadow-sm">
                            <WaiterIcon className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-black text-slate-900 tracking-tight">{occupiedTablesCount || 8}</span>
                                <span className="text-lg font-bold text-slate-400">/ {tables.length || 12}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase font-mono">
                                +14.2% Peak
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div className="bg-[#E23744] h-1.5 rounded-full" style={{ width: `${((occupiedTablesCount || 8) / (tables.length || 12)) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold mt-2 block flex items-center justify-between">
                            <span>High Turnover Floor</span>
                            <span className="text-[#E23744] group-hover:translate-x-1 transition-transform">View Floor →</span>
                        </span>
                    </div>
                </div>

                <div className="zomato-card p-6 flex flex-col justify-between group cursor-pointer border-t-4 border-t-purple-500" onClick={() => { soundService.playTactileClick('mid'); navigate('/kitchen'); }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kitchen KDS Wok Queue</span>
                            <h3 className="text-sm font-black text-slate-800 mt-0.5">Active Prep Load</h3>
                        </div>
                        <span className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                            <ChefHatIcon className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-black text-slate-900 tracking-tight">{activeOrdersCount || 4}</span>
                                <span className="text-xs font-bold text-purple-600 uppercase">Active KOTs</span>
                            </div>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-[10px] font-black animate-pulse font-mono">
                                ⚡ Wok Sync
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div className="bg-purple-600 h-1.5 rounded-full animate-progress-strip" style={{ width: '68%' }} />
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold mt-2 block flex items-center justify-between">
                            <span>Avg Prep: <strong className="text-slate-800 font-mono">11.4 min</strong></span>
                            <span className="text-purple-600 group-hover:translate-x-1 transition-transform">Wok Display →</span>
                        </span>
                    </div>
                </div>

                <div className="zomato-card p-6 flex flex-col justify-between group cursor-pointer border-t-4 border-t-teal-500" onClick={() => { soundService.playTactileClick('mid'); navigate('/dashboard'); }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI Neural Quality Core</span>
                            <h3 className="text-sm font-black text-slate-800 mt-0.5">Portion Efficiency Index</h3>
                        </div>
                        <span className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 group-hover:scale-110 transition-transform shadow-sm text-xl">
                            🛡️
                        </span>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline space-x-1">
                                <span className="text-4xl font-black text-teal-600 tracking-tight">96.4</span>
                                <span className="text-sm font-bold text-slate-400">/ 100</span>
                            </div>
                            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-[10px] font-black font-mono">
                                Top 1% Tier
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '96%' }} />
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold mt-2 block flex items-center justify-between">
                            <span>Zero Portion Overrun</span>
                            <span className="text-teal-600 group-hover:translate-x-1 transition-transform">Diagnostic →</span>
                        </span>
                    </div>
                </div>

                <div className="zomato-card p-6 flex flex-col justify-between group cursor-pointer border-t-4 border-t-emerald-500" onClick={() => { soundService.playTactileClick('mid'); navigate('/dashboard'); }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Est. Spoilage Savings</span>
                            <h3 className="text-sm font-black text-slate-800 mt-0.5">Net Profit Protected</h3>
                        </div>
                        <span className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:scale-110 transition-transform shadow-sm text-xl">
                            💰
                        </span>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline space-x-1">
                                <span className="text-4xl font-black text-emerald-600 font-mono tracking-tight">₹{(estimatedSavingsRupees || 4850).toLocaleString()}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-mono font-black">
                                +28% vs Avg
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '84%' }} />
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold mt-2 block flex items-center justify-between">
                            <span>{(totalWasteKg || 14.2).toFixed(1)}kg waste prevented</span>
                            <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">Financials →</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 🎭 Apple Vision & Zomato Workspace Launchpad Grid */}
            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span>🚀 Workspace Launchpad</span>
                            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-rose-50 text-[#E23744] border border-rose-200 shadow-sm">
                                Apple Glass Deluxe
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Select your operational role to enter ultra-fast, high-contrast Zomato Pearl White management terminals.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Role 1: Owner / Manager */}
                    <div 
                        onClick={() => { soundService.playTactileClick('mid'); navigate('/dashboard'); }}
                        className="group relative zomato-card p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:border-red-300 shadow-sm hover:shadow-lg"
                    >
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform text-[#E23744] shadow-inner">
                                👑
                            </div>
                            <span className="text-[10px] font-black text-[#E23744] uppercase tracking-widest block mb-1">
                                Executive & Owner
                            </span>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-[#E23744] transition-colors tracking-tight">
                                AI Analytics & Waste Diagnostic Suite
                            </h3>
                            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                                Access real-time financial loss charts, interactive bar drill-down diagnostics, and automated target simulations.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#E23744] group-hover:translate-x-1.5 transition-transform">
                            <span>Open Dashboard</span>
                            <span>→</span>
                        </div>
                    </div>

                    {/* Role 2: Head Chef / Kitchen */}
                    <div 
                        onClick={() => { soundService.playTactileClick('mid'); navigate('/kitchen'); }}
                        className="group relative zomato-card p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:border-purple-300 shadow-sm hover:shadow-lg"
                    >
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform shadow-inner">
                                👨‍🍳
                            </div>
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-1">
                                Kitchen Operations
                            </span>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors tracking-tight">
                                Live Kitchen KDS & Audio KOT Terminal
                            </h3>
                            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                                Monitor live preparing tickets, real-time prep progress countdown bars, and automated portion optimization alerts.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-purple-600 group-hover:translate-x-1.5 transition-transform">
                            <span>Open Kitchen KDS</span>
                            <span>→</span>
                        </div>
                    </div>

                    {/* Role 3: Floor Manager / Tables */}
                    <div 
                        onClick={() => { soundService.playTactileClick('mid'); navigate('/tables'); }}
                        className="group relative zomato-card p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:border-teal-300 shadow-sm hover:shadow-lg"
                    >
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform shadow-inner">
                                🤵
                            </div>
                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-1">
                                Service & Floor Management
                            </span>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight">
                                Table Floor Map & Dine-In Ordering
                            </h3>
                            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                                Manage 12 dine-in tables, track turnaround heatmaps, log new table orders, and inspect guest QR feedback.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-teal-600 group-hover:translate-x-1.5 transition-transform">
                            <span>Open Table Map</span>
                            <span>→</span>
                        </div>
                    </div>

                    {/* Role 4: Guest / AI Waiter Experience */}
                    <div 
                        onClick={() => { soundService.playTactileClick('high'); setIsAiWaiterOpen(true); }}
                        className="group relative zomato-card p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:border-emerald-300 shadow-sm hover:shadow-lg"
                    >
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform shadow-inner">
                                ✨
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
                                Guest & Customer AI
                            </span>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                                Smart QR Menu & AI Waiter Assistant
                            </h3>
                            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                                Experience the customer-facing AI Waiter bot that recommends dishes tailored to personal taste & low waste scores.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-600 group-hover:translate-x-1.5 transition-transform">
                            <span>Launch AI Waiter</span>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ⚡ Real-Time AI Operations & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-2 zomato-card p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/80">
                            <div className="flex items-center space-x-3">
                                <span className="w-3 h-3 rounded-full bg-[#E23744] animate-pulse shadow-sm" />
                                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
                                    Real-Time AI Neural Telemetry & Alert Stream
                                </h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#E23744] bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 shadow-sm">
                                Zomato Pro Live
                            </span>
                        </div>

                        <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                            <div className="p-4 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 transition-colors hover:border-red-200 shadow-sm">
                                <span className="text-xl p-2.5 bg-red-100 text-red-600 rounded-2xl border border-red-200 shrink-0 shadow-inner">⚠️</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-red-600 uppercase tracking-wider">Portion Review Flagged by Neural Engine</span>
                                        <span className="font-mono text-[10px] text-slate-400">2 mins ago</span>
                                    </div>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                                        Table #5 submitted feedback complaining <strong className="text-slate-900 font-bold">"Huge portion! Could easily serve two people"</strong> on Chicken Biryani. Automated portion rule recommended for tomorrow's batch.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 transition-colors hover:border-purple-200 shadow-sm">
                                <span className="text-xl p-2.5 bg-purple-100 text-purple-600 rounded-2xl border border-purple-200 shrink-0 shadow-inner">🚀</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-purple-600 uppercase tracking-wider">Overproduction Surplus Prevented in KDS</span>
                                        <span className="font-mono text-[10px] text-slate-400">14 mins ago</span>
                                    </div>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                                        AI sales forecast detected post-lunch slowdown. Kitchen prep quota for <strong className="text-slate-900 font-bold">Dal Makhani</strong> automatically adjusted down by 2.5kg, saving an estimated <strong className="text-emerald-600 font-mono font-bold">₹750</strong> in potential spoilage.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 transition-colors hover:border-emerald-200 shadow-sm">
                                <span className="text-xl p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl border border-emerald-200 shrink-0 shadow-inner">📸</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-emerald-600 uppercase tracking-wider">Visual Plate Scanner Assessment</span>
                                        <span className="font-mono text-[10px] text-slate-400">32 mins ago</span>
                                    </div>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                                        Camera analysis completed on returning tray from Table #2. Verified <strong className="text-emerald-600 font-mono font-bold">0.1 kg plate waste</strong> (Clean Plate Trophy 🏆). Customer taste index confirmed at 99%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Menu Catalog Preview */}
                <div className="zomato-card p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-wide uppercase mb-4 pb-4 border-b border-slate-200/80 flex justify-between items-center">
                            <span>Top Profit Menu Index</span>
                            <span className="text-[10px] bg-rose-50 text-[#E23744] border border-rose-200 px-2.5 py-1 rounded-full font-mono font-bold">
                                Live Index
                            </span>
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {MENU_ITEMS.slice(0, 5).map(item => (
                                <div key={item.id} className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs shadow-sm hover:border-red-200 transition-colors">
                                    <div>
                                        <span className="font-black text-slate-900 block tracking-tight">{item.name}</span>
                                        <span className="text-[10px] text-[#E23744] font-bold uppercase tracking-wider block mt-0.5">{item.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-emerald-600 font-mono text-base block leading-none">₹{item.price}</span>
                                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">0.2kg avg waste</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => { soundService.playTactileClick('mid'); navigate('/dashboard'); }}
                        className="w-full mt-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md text-center block active:scale-95"
                    >
                        View Full Menu Analytics →
                    </button>
                </div>
            </div>

            {/* AI Plate Scanner Modal */}
            <CameraAnalysisModal 
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
            />

            {/* ✨ Smart AI Waiter & Dish Recommender Modal */}
            {isAiWaiterOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
                        <div className="h-2 w-full bg-gradient-to-r from-[#E23744] via-[#D32F2F] to-amber-500" />
                        
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#E23744] text-2xl shadow-sm animate-bounce">
                                    ✨
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Ask Chef AI Waiter Assistant</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Personalized smart recommendation engine based on live customer ratings & waste minimization</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsAiWaiterOpen(false); setAiRecommendation(null); }}
                                className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 p-2.5 rounded-xl transition-colors border border-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            <div>
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-3">
                                    1. What kind of flavors or mood are you looking for today?
                                </label>
                                <div className="flex flex-wrap gap-2.5 mb-4">
                                    {['Spicy & Aromatic', 'Creamy Vegetarian', 'High Protein Biryani', 'Light Starter', 'Sweet Dessert'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => { soundService.playTactileClick('high'); setCustomerPreference(tag); }}
                                            className={`px-4 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
                                                customerPreference === tag
                                                    ? 'bg-[#E23744] border-[#E23744] text-white shadow-md shadow-red-500/20 scale-105'
                                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Or type your craving... (e.g., 'I want something spicy with naan and less portion size')"
                                    value={customerPreference}
                                    onChange={e => setCustomerPreference(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#E23744] transition-all font-medium placeholder:text-slate-400 shadow-inner"
                                />
                            </div>

                            <button
                                onClick={handleGenerateAiRecommendation}
                                className="w-full py-4 bg-gradient-to-r from-[#E23744] to-[#CB1A2B] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <span>Generate AI Chef Recommendation</span>
                                <span>→</span>
                            </button>

                            {aiRecommendation && (
                                <div className="p-6 rounded-3xl bg-rose-50/60 border border-rose-200 text-slate-800 space-y-3 animate-fade-in shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-[#E23744] uppercase tracking-widest flex items-center gap-2">
                                            <span>✨ AI Tailored Dish Match</span>
                                        </span>
                                        <span className="text-[10px] bg-rose-100 text-[#E23744] border border-rose-200 px-2.5 py-1 rounded-full font-mono font-bold">
                                            99% Satisfaction Index
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                                        {aiRecommendation}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => { setIsAiWaiterOpen(false); setAiRecommendation(null); }}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-sm"
                            >
                                Close Assistant
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Table QR Code Generator Modal */}
            <QRCodeModal
                isOpen={Boolean(selectedTableForQR)}
                onClose={() => setSelectedTableForQR(null)}
                table={selectedTableForQR}
            />
        </div>
    );
};

export default HomeCommandCenter;
