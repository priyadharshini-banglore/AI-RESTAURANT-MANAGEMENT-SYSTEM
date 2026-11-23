import React, { useState, useMemo, useEffect } from 'react';
import { getWastePrediction } from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';
import { PortionFeedback } from '../types';
import WasteLogForm from '../components/WasteLogForm';
import BarChartComponent, { BarChartDataItem } from '../components/BarChartComponent';
import PieChartComponent from '../components/PieChartComponent';
import CameraAnalysisModal from '../components/CameraAnalysisModal';
import WasteDrillDownModal from '../components/WasteDrillDownModal';
import { CameraIcon } from '../components/icons/CameraIcon';
import { soundService } from '../services/soundService';

const DashboardView: React.FC = () => {
    const { wasteLogs, feedback, visualWasteLogs, wasteReports = [], deleteWasteReport, menuItems, dashboardConfig, orders, tables } = useAppContext();
    const [isLoadingPrediction, setIsLoadingPrediction] = useState(true);
    const [aiResult, setAiResult] = useState<any | null>(null);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [selectedDrillDownItem, setSelectedDrillDownItem] = useState<BarChartDataItem | null>(null);
    const [tableFilter, setTableFilter] = useState<number | 'all'>('all');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Interactive Waste Reduction Simulator Slider state
    const [simulatedPortionReductionPct, setSimulatedPortionReductionPct] = useState<number>(10);

    useEffect(() => {
        const runPrediction = async () => {
            setIsLoadingPrediction(true);
            try {
                const result = await getWastePrediction(wasteLogs, feedback, visualWasteLogs, menuItems);
                setAiResult(result);
            } catch (error) {
                console.error("Failed to get prediction:", error);
            } finally {
                setIsLoadingPrediction(false);
            }
        };

        runPrediction();
    }, [wasteLogs, feedback, visualWasteLogs, menuItems]);
    
    const latestVisualLog = visualWasteLogs.length > 0 ? visualWasteLogs[visualWasteLogs.length - 1] : null;

    const barChartData = useMemo(() => {
        const dataMap = new Map<string, { waste: number; cost: number; menuItemId: number }>();
        const sortedLogs = [...wasteLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedLogs.forEach(log => {
            const item = menuItems.find(mi => mi.id === log.menuItemId);
            if (item) {
                const key = item.name;
                const existing = dataMap.get(key) || { waste: 0, cost: 0, menuItemId: item.id };
                const costForLog = Math.round(log.wastedAmountKg * (item.price * 0.7));
                dataMap.set(key, {
                    waste: existing.waste + log.wastedAmountKg,
                    cost: existing.cost + costForLog,
                    menuItemId: item.id,
                });
            }
        });
        return Array.from(dataMap, ([name, { waste, cost, menuItemId }]) => ({
            name,
            waste,
            cost,
            menuItemId,
        }));
    }, [wasteLogs, menuItems]);

    const pieChartData = useMemo(() => {
        const wasteByStage: { [key: string]: number } = {
            'Kitchen': 0,
            'Plate': 0,
            'Buffet': 0,
        };

        wasteLogs.forEach(log => {
            const amount = log.wastedAmountKg;
            if (log.reason === 'Plate waste') {
                wasteByStage['Plate'] += amount;
            } else if (log.reason === 'Buffet') {
                wasteByStage['Buffet'] += amount;
            } else { 
                wasteByStage['Kitchen'] += amount;
            }
        });
        
        return Object.entries(wasteByStage)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    }, [wasteLogs]);
    
    const getMenuItemName = (id: number) => menuItems.find(item => item.id === id)?.name || 'Chef Special Item';
    
    const getPortionFeedbackColor = (portion: PortionFeedback) => {
        switch(portion) {
            case PortionFeedback.TooLarge: return 'text-red-700 bg-red-100 border-red-300';
            case PortionFeedback.TooSmall: return 'text-amber-800 bg-amber-100 border-amber-300';
            case PortionFeedback.OK: return 'text-emerald-800 bg-emerald-100 border-emerald-300';
            default: return 'text-slate-700 bg-slate-100 border-slate-300';
        }
    };

    // Calculate simulated savings based on slider
    const totalWastedKgCurrent = barChartData.reduce((s, d) => s + d.waste, 0) || 14.2;
    const totalCostWastedCurrent = barChartData.reduce((s, d) => s + d.cost, 0) || 4850;
    const simulatedAnnualSavings = Math.round(totalCostWastedCurrent * 365 * (simulatedPortionReductionPct / 100));

    // Leftovers & Plate Waste Telemetry from Persistent Database
    const filteredReports = useMemo(() => {
        if (!wasteReports || wasteReports.length === 0) return [];
        if (tableFilter === 'all') return wasteReports;
        return wasteReports.filter(r => r.tableId === tableFilter);
    }, [wasteReports, tableFilter]);

    const totalLeftoverKg = useMemo(() => {
        return (wasteReports || []).reduce((sum, r) => sum + (Number(r.totalKg) || 0), 0);
    }, [wasteReports]);

    const totalVegetableScrapGrams = useMemo(() => {
        return (wasteReports || []).reduce((sum, r) => {
            return sum + (r.vegetablesWasted || []).reduce((vs, v) => vs + (Number(v.grams) || 0), 0);
        }, 0);
    }, [wasteReports]);

    const totalFoodScrapGrams = useMemo(() => {
        return (wasteReports || []).reduce((sum, r) => {
            return sum + (r.foodsWasted || []).reduce((fs, f) => fs + (Number(f.grams) || 0), 0);
        }, 0);
    }, [wasteReports]);

    const estScrapLossRupees = Math.round(totalLeftoverKg * 350);

    // Available tables present in waste reports for filter
    const reportTableIds = useMemo(() => {
        const set = new Set<number>();
        (wasteReports || []).forEach(r => { if (r.tableId) set.add(r.tableId); });
        return Array.from(set).sort((a, b) => a - b);
    }, [wasteReports]);

    // Live Dining & Staff Performance metrics
    const totalTipsCollected = feedback.reduce((sum, fb) => sum + (fb.servantTip || 0), 0);
    const averageRating = feedback.length > 0
        ? (feedback.reduce((sum, fb) => sum + fb.tasteRating, 0) / feedback.length).toFixed(1)
        : '5.0';
    const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;

    return (
        <div className="min-h-screen bg-[#f6efe2] text-[#3a1a0e] font-sans select-none">
            <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto px-3 sm:px-6 pt-4">
                
                {/* 1. Top Landing Page Theme Header */}
                <div className="bg-[#fffdf7] rounded-[32px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-5 sm:p-7 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-8 h-8 rounded-xl bg-amber-100 border border-[#3a1a0e] flex items-center justify-center text-lg shadow-xs">
                                📊
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#d6361f] text-[#fff4dc] text-[10px] font-semibold uppercase tracking-wider">
                                Management Suite
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3a1a0e] tracking-tight">
                            Executive Dashboard & Analytics
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                            Live dining sales telemetry, servant tip reports, food scrap mitigation & neural AI portion trim simulations.
                        </p>
                    </div>

                    {/* Quick Metric Badges in Cartoon Landing Style */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                        <div className="flex-1 sm:flex-initial bg-[#fff4dc] px-4 py-2.5 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e]">
                            <span className="text-[10px] font-semibold uppercase text-slate-600 block">Daily Target Revenue:</span>
                            <span className="text-base font-semibold text-emerald-700">₹{dashboardConfig.targetRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex-1 sm:flex-initial bg-[#fff4dc] px-4 py-2.5 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e]">
                            <span className="text-[10px] font-semibold uppercase text-slate-600 block">Waste Goal:</span>
                            <span className="text-base font-semibold text-[#d6361f]">-{dashboardConfig.targetWasteReduction}%</span>
                        </div>
                        <div className="flex-1 sm:flex-initial bg-[#fff4dc] px-4 py-2.5 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e]">
                            <span className="text-[10px] font-semibold uppercase text-slate-600 block">Scrap Baseline:</span>
                            <span className="text-base font-semibold text-[#3a1a0e]">₹{dashboardConfig.estLossRupees.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Four Live Executive KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* KPI 1: Active Tables Occupancy */}
                    <div className="bg-[#fffdf7] p-4 sm:p-5 rounded-[24px] border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold uppercase text-slate-600">Dining Tables</span>
                            <span className="text-xl">🪑</span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#3a1a0e]">
                                {occupiedTablesCount} <span className="text-xs font-bold text-slate-500 font-sans">/ 12 Active</span>
                            </span>
                            <span className="block text-[11px] font-bold text-emerald-600 mt-0.5">
                                Real-Time Seating
                            </span>
                        </div>
                    </div>

                    {/* KPI 2: Servant Tips Collected */}
                    <div className="bg-[#fffdf7] p-4 sm:p-5 rounded-[24px] border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold uppercase text-slate-600">Servant Gratuity</span>
                            <span className="text-xl">💖</span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#d6361f]">
                                ₹{totalTipsCollected.toFixed(2)}
                            </span>
                            <span className="block text-[11px] font-bold text-amber-700 mt-0.5">
                                100% Passed to Floor Team
                            </span>
                        </div>
                    </div>

                    {/* KPI 3: Guest Review Average */}
                    <div className="bg-[#fffdf7] p-4 sm:p-5 rounded-[24px] border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold uppercase text-slate-600">Customer Score</span>
                            <span className="text-xl">⭐</span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                                {averageRating} <span className="text-xs font-bold text-slate-500 font-sans">/ 5.0</span>
                            </span>
                            <span className="block text-[11px] font-bold text-slate-600 mt-0.5">
                                Based on {feedback.length} Dine-In Reviews
                            </span>
                        </div>
                    </div>

                    {/* KPI 4: Food Waste Loss Prevented */}
                    <div className="bg-[#fffdf7] p-4 sm:p-5 rounded-[24px] border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold uppercase text-slate-600">Food Scrap Volume</span>
                            <span className="text-xl">⚖️</span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#3a1a0e]">
                                {totalWastedKgCurrent.toFixed(1)} <span className="text-xs font-bold text-slate-500 font-sans">kg</span>
                            </span>
                            <span className="block text-[11px] font-bold text-emerald-600 mt-0.5">
                                Under {dashboardConfig.targetWasteReduction}% Threshold
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. 🎛️ Interactive Neural Portion Shield & Financial Simulator Card */}
                <div className="p-6 sm:p-8 bg-[#fff4dc] rounded-[32px] border-3 border-[#3a1a0e] shadow-[5px_5px_0_#3a1a0e]">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-[#d6361f] text-[#fff4dc] text-[10px] font-semibold uppercase tracking-wider shadow-xs">
                                    ⚡ Neural Waste Simulator
                                </span>
                                <span className="text-xs font-semibold uppercase text-[#3a1a0e]">Portion Trim Engine</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a1a0e] tracking-tight">
                                Real-Time Revenue Protection Simulator
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                Slide the portion optimization control to simulate kitchen margin recovery if serving sizes on high-scrap dishes are dynamically tailored:
                            </p>
                        </div>

                        <div className="w-full lg:w-96 p-5 bg-[#fffdf7] rounded-3xl border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] space-y-4">
                            <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#3a1a0e]">
                                <span>Simulated Portion Trim:</span>
                                <span className="text-sm text-[#d6361f] bg-rose-50 px-3 py-1 rounded-xl border border-rose-300">
                                    -{simulatedPortionReductionPct}% Portion
                                </span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="30"
                                step="5"
                                value={simulatedPortionReductionPct}
                                onChange={(e) => { soundService.playTactileClick('high'); setSimulatedPortionReductionPct(Number(e.target.value)); }}
                                className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-[#d6361f] border border-[#3a1a0e]"
                            />
                            <div className="pt-2 border-t border-[#3a1a0e]/20 flex justify-between items-baseline">
                                <span className="text-xs font-bold text-slate-600">Projected Annual Profit Gain:</span>
                                <span className="text-2xl font-extrabold text-emerald-700">
                                    +₹{simulatedAnnualSavings.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 4. Core Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. AI Visual Waste Analyzer */}
                    <div className="bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7 flex flex-col justify-between">
                         <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-9 h-9 rounded-xl bg-red-100 border border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                                        📷
                                    </span>
                                    <h2 className="text-xl font-bold text-[#3a1a0e] tracking-wide">
                                        AI Visual Plate Scanner
                                    </h2>
                                </div>
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-600">
                                    Gemini Vision
                                </span>
                            </div>
                            <p className="mb-5 text-xs text-slate-600 font-medium">
                                Take a photo of returned table plates or prep bins to automatically classify items and estimate wasted grams.
                            </p>
                         </div>

                         <div>
                            <button
                                onClick={() => { soundService.playTactileClick('high'); setIsCameraModalOpen(true); }}
                                className="w-full bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-semibold text-xs uppercase tracking-wider py-3.5 px-4 rounded-2xl border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <CameraIcon className="h-4 w-4" />
                                <span>Scan Plate with Camera / Upload</span>
                            </button>
                            
                            {latestVisualLog && (
                                <div className="mt-5 space-y-2 p-4 bg-[#fff4dc] border-2 border-[#3a1a0e] rounded-2xl shadow-xs animate-fade-in">
                                    <h3 className="font-bold text-xs uppercase text-[#3a1a0e]">Last Visual Scan:</h3>
                                    <div className="flex items-start space-x-3.5">
                                        <img src={`data:image/jpeg;base64,${latestVisualLog.imageBase64}`} alt="Last waste analysis" className="w-20 h-20 rounded-xl object-cover border-2 border-[#3a1a0e] shadow-xs" />
                                        <div className="text-xs text-slate-700 space-y-1">
                                            <p><span className="font-bold text-[#3a1a0e]">Items:</span> {latestVisualLog.analysis.identifiedItems.join(', ')}</p>
                                            <p><span className="font-bold text-[#3a1a0e]">Estimated Scrap:</span> <span className="font-mono text-emerald-700 font-black">{latestVisualLog.analysis.wasteEstimateKg} kg</span></p>
                                            <p className="italic text-[#d6361f] font-medium">"{latestVisualLog.analysis.suggestion}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                    
                    {/* 2. Log Food Waste Form */}
                    <WasteLogForm />

                    {/* 3. Live AI Neural Predictions & Quotas */}
                    <div className="lg:col-span-2 bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-9 h-9 rounded-xl bg-purple-100 border border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                                    🧠
                                </span>
                                <h2 className="text-xl font-bold text-[#3a1a0e] tracking-wide">
                                    Live AI Neural Predictions & Chef Action Plan
                                </h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-400">
                                Tomorrow Forecast
                            </span>
                        </div>

                        {isLoadingPrediction ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="w-8 h-8 rounded-full border-3 border-[#d6361f] border-t-transparent animate-spin" />
                                <span className="ml-3 text-xs font-semibold text-[#3a1a0e] uppercase tracking-wider">
                                    Crunching customer taste feedback & prep metrics...
                                </span>
                            </div>
                        ) : aiResult ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h3 className="font-bold text-xs uppercase text-slate-600 mb-1.5">
                                        Customer Taste & Portion Summary:
                                    </h3>
                                    <p className="p-3.5 bg-[#fff4dc] border-2 border-[#3a1a0e] text-[#3a1a0e] rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs">
                                        "{aiResult.customerFeedbackInsights}"
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs uppercase text-slate-600 mb-1.5">
                                        Forecasted Preparation Quotas for Tomorrow:
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {aiResult.predictions.map((p: any) => (
                                            <div key={p.itemName} className="p-3.5 bg-white border-2 border-[#3a1a0e] rounded-2xl shadow-xs hover:bg-amber-50 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-[#3a1a0e] text-sm uppercase">{p.itemName}</span>
                                                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 rounded-full text-[11px] font-mono font-black border border-indigo-300">
                                                        Prepare {p.suggestedQtyKg}kg
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium">{p.reasoning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs uppercase text-slate-600 mb-1.5">
                                        Executive Recommendation:
                                    </h3>
                                    <p className="p-3.5 bg-emerald-50 border-2 border-emerald-600 text-emerald-950 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs">
                                        {aiResult.menuSuggestion}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-12 text-xs font-bold">
                                Could not retrieve AI prediction.
                            </div>
                        )}
                    </div>

                    {/* 4. Waste Distribution Pie Chart */}
                    <div className="bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7 h-[420px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-9 h-9 rounded-xl bg-amber-100 border border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                                    🥧
                                </span>
                                <h2 className="text-xl font-bold text-[#3a1a0e] tracking-wide">
                                    Stage Waste Breakdown
                                </h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#f6efe2] text-[#3a1a0e] border border-[#3a1a0e]/30">
                                Kitchen vs Plate
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            {pieChartData.length > 0 ? (
                                <PieChartComponent data={pieChartData} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold">
                                    No waste data to display.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Waste Trend Bar Chart */}
                    <div className="bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7 h-[420px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-9 h-9 rounded-xl bg-red-100 border border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                                    📊
                                </span>
                                <h2 className="text-xl font-bold text-[#3a1a0e] tracking-wide">
                                    Item Scrap & Loss Bar Chart
                                </h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase text-[#d6361f] bg-rose-50 border border-[#d6361f] px-2.5 py-0.5 rounded-full">
                                🖱️ Click Bar to Diagnose
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            {barChartData.length > 0 ? (
                                <BarChartComponent 
                                    data={barChartData} 
                                    onBarClick={(item) => { soundService.playTactileClick('high'); setSelectedDrillDownItem(item); }} 
                                    thresholdKg={3} 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold">
                                    No waste data to display.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5.5 📋 LIVE AI LEFTOVERS & FOOD SCRAP DATABASE REPORTS */}
                    <div className="lg:col-span-2 bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b-2 border-[#3a1a0e]/10 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                                    🥗
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#3a1a0e] tracking-tight">
                                            Live AI Leftovers &amp; Food Scrap Reports
                                        </h2>
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400">
                                            🗄️ Database Connected
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                                        Real-time computer vision analysis of uneaten vegetables, side scrap, and actionable executive chef recommendations.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { soundService.playTactileClick('high'); setIsCameraModalOpen(true); }}
                                    className="bg-[#d6361f] hover:bg-[#b02a16] text-[#fff4dc] text-xs font-semibold uppercase tracking-wider py-2.5 px-3.5 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>📸 Scan Plate</span>
                                </button>
                                <a
                                    href="/#/tables"
                                    onClick={() => soundService.playTactileClick('high')}
                                    className="bg-[#fff4dc] hover:bg-amber-100 text-[#3a1a0e] text-xs font-semibold uppercase tracking-wider py-2.5 px-3.5 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer no-underline"
                                >
                                    <span>🍽️ Table Portal</span>
                                </a>
                            </div>
                        </div>

                        {/* Executive Leftovers Telemetry Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                            <div className="bg-[#fff4dc] p-3.5 rounded-2xl border-2 border-[#3a1a0e] shadow-xs">
                                <span className="text-[10px] font-semibold uppercase text-slate-600 block">Reports Saved</span>
                                <span className="text-xl font-bold text-[#3a1a0e]">{wasteReports.length}</span>
                                <span className="text-[10px] text-slate-500 block font-medium">In Persistent DB</span>
                            </div>
                            <div className="bg-[#fff4dc] p-3.5 rounded-2xl border-2 border-[#3a1a0e] shadow-xs">
                                <span className="text-[10px] font-semibold uppercase text-slate-600 block">Total Leftover Scrap</span>
                                <span className="text-xl font-bold text-[#d6361f]">{totalLeftoverKg.toFixed(2)} kg</span>
                                <span className="text-[10px] text-slate-500 block font-medium">Plate Return Waste</span>
                            </div>
                            <div className="bg-[#fff4dc] p-3.5 rounded-2xl border-2 border-[#3a1a0e] shadow-xs">
                                <span className="text-[10px] font-semibold uppercase text-emerald-800 block">Uneaten Vegetables</span>
                                <span className="text-xl font-bold text-emerald-700">{(totalVegetableScrapGrams / 1000).toFixed(2)} kg</span>
                                <span className="text-[10px] text-emerald-600 block font-medium">{totalVegetableScrapGrams}g Total</span>
                            </div>
                            <div className="bg-[#fff4dc] p-3.5 rounded-2xl border-2 border-[#3a1a0e] shadow-xs">
                                <span className="text-[10px] font-semibold uppercase text-amber-900 block">Scrap Loss Cost</span>
                                <span className="text-xl font-bold text-amber-700">₹{estScrapLossRupees.toLocaleString()}</span>
                                <span className="text-[10px] text-amber-600 block font-medium">At Avg ₹350/kg</span>
                            </div>
                        </div>

                        {/* Filter by Table */}
                        {reportTableIds.length > 0 && (
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
                                <span className="font-semibold uppercase text-slate-500 text-[11px] shrink-0">Filter Table:</span>
                                <button
                                    onClick={() => setTableFilter('all')}
                                    className={`px-3 py-1 rounded-xl font-semibold uppercase text-[11px] border transition-all cursor-pointer ${
                                        tableFilter === 'all'
                                            ? 'bg-[#3a1a0e] text-[#fff4dc] border-[#3a1a0e]'
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                                    }`}
                                >
                                    All Tables ({wasteReports.length})
                                </button>
                                {reportTableIds.map(tid => (
                                    <button
                                        key={tid}
                                        onClick={() => setTableFilter(tid)}
                                        className={`px-3 py-1 rounded-xl font-semibold uppercase text-[11px] border transition-all cursor-pointer ${
                                            tableFilter === tid
                                                ? 'bg-[#d6361f] text-[#fff4dc] border-[#3a1a0e]'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                                        }`}
                                    >
                                        Table #{tid}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Leftover Reports List */}
                        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-4 sm:p-5 bg-white border-2 border-[#3a1a0e] rounded-3xl shadow-[3px_3px_0_#3a1a0e] space-y-3.5 hover:bg-[#fffdf7] transition-all"
                                    >
                                        {/* Report Card Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-8 h-8 rounded-xl bg-amber-100 border border-[#3a1a0e] flex items-center justify-center font-semibold text-xs text-[#3a1a0e]">
                                                    #{report.tableId}
                                                </span>
                                                <div>
                                                    <span className="font-semibold text-[#3a1a0e] text-sm uppercase">
                                                        Table #{report.tableId} Dine-In Leftovers
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 block font-medium">
                                                        {new Date(report.timestamp).toLocaleString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-semibold uppercase">
                                                    ⚖️ {report.totalKg} kg ({report.totalGrams}g)
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-semibold uppercase">
                                                    ⚡ {report.modelUsed || 'Groq Vision'}
                                                </span>
                                                {deleteWasteReport && (
                                                    <button
                                                        onClick={() => {
                                                            soundService.playTactileClick('low');
                                                            if (confirm('Delete this leftover waste report from the database?')) {
                                                                deleteWasteReport(report.id);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer border border-slate-300"
                                                        title="Delete report"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Summary & Image preview */}
                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                            {report.imageThumbnail && (
                                                <div
                                                    onClick={() => setPreviewImage(report.imageThumbnail || null)}
                                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#3a1a0e] shadow-xs shrink-0 cursor-pointer group relative"
                                                    title="Click to view full photo"
                                                >
                                                    <img
                                                        src={report.imageThumbnail}
                                                        alt="Leftover plate"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                                        🔍 Zoom
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex-1 space-y-2.5">
                                                {report.summary && (
                                                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-[#fff4dc] p-3 rounded-2xl border border-amber-300 shadow-xs">
                                                        "{report.summary}"
                                                    </p>
                                                )}

                                                {/* Uneaten Vegetables & Food Chips */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                    {/* Vegetables */}
                                                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-300">
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <span className="text-xs">🥦</span>
                                                            <span className="text-[11px] font-semibold uppercase text-emerald-900">
                                                                Uneaten Vegetables ({report.vegetablesWasted?.length || 0})
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(report.vegetablesWasted || []).length > 0 ? (
                                                                report.vegetablesWasted.map((v, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2.5 py-1 rounded-xl bg-white border border-emerald-400 text-[11px] text-emerald-900 font-bold shadow-xs flex items-center gap-1.5"
                                                                    >
                                                                        <span>🌱 {v.name}</span>
                                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-mono">
                                                                            {v.grams}g ({v.wasted_percent}% wasted)
                                                                        </span>
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[11px] text-slate-500 italic">No significant vegetable waste.</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Main Foods & Grains */}
                                                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-300">
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <span className="text-xs">🍲</span>
                                                            <span className="text-[11px] font-semibold uppercase text-amber-900">
                                                                Uneaten Foods &amp; Grains ({report.foodsWasted?.length || 0})
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(report.foodsWasted || []).length > 0 ? (
                                                                report.foodsWasted.map((f, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2.5 py-1 rounded-xl bg-white border border-amber-400 text-[11px] text-amber-950 font-bold shadow-xs flex items-center gap-1.5"
                                                                    >
                                                                        <span>🍽️ {f.name}</span>
                                                                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md font-mono">
                                                                            {f.grams}g ({f.wasted_percent}% wasted)
                                                                        </span>
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[11px] text-slate-500 italic">No main food leftovers recorded.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actionable Chef Recommendations */}
                                        {report.suggestions && report.suggestions.length > 0 && (
                                            <div className="p-3.5 bg-[#fefce8] border-2 border-amber-400 rounded-2xl shadow-xs">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs">💡</span>
                                                    <span className="text-xs font-semibold uppercase text-amber-900">
                                                        Actionable Chef &amp; Kitchen Recommendations
                                                    </span>
                                                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                                                        AI Precision
                                                    </span>
                                                </div>
                                                <ol className="space-y-1.5 list-decimal list-inside text-xs font-medium text-slate-800">
                                                    {report.suggestions.map((sug, i) => (
                                                        <li key={i} className="leading-relaxed pl-1 text-slate-800">
                                                            {sug}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-white border-2 border-dashed border-[#3a1a0e]/30 rounded-3xl space-y-3">
                                    <span className="text-3xl block">🍽️</span>
                                    <h3 className="font-bold text-base text-[#3a1a0e]">
                                        No Leftover Reports Recorded Yet
                                    </h3>
                                    <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
                                        Whenever servers capture returned plate photos in the Table Portal or Camera Scanner, the Groq Vision breakdown and chef suggestions will automatically persist in the database and appear right here.
                                    </p>
                                    <button
                                        onClick={() => setIsCameraModalOpen(true)}
                                        className="bg-[#d6361f] text-[#fff4dc] text-xs font-semibold uppercase py-2.5 px-4 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] cursor-pointer"
                                    >
                                        Run A Plate Scan Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* 6. Live Customer Feedback & Servant Gratuities Log */}
                    <div className="lg:col-span-2 bg-[#fffdf7] rounded-[28px] border-2 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-6 sm:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-9 h-9 rounded-xl bg-amber-100 border border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                                    ⭐
                                </span>
                                <h2 className="text-xl font-bold text-[#3a1a0e] tracking-wide">
                                    Live Guest Reviews, Servant Tips & Table Compliments
                                </h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                {feedback.length} Dine-In Ratings
                            </span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {feedback.length > 0 ? [...feedback].reverse().map(fb => (
                                <div key={fb.id} className="p-4 bg-white border-2 border-[#3a1a0e] rounded-2xl flex flex-col sm:flex-row justify-between gap-3 shadow-xs hover:bg-[#fffdf7] transition-colors">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#3a1a0e] text-sm uppercase">
                                                {fb.menuItemId ? getMenuItemName(fb.menuItemId) : 'General Dining Experience'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-[#f6efe2] text-[#3a1a0e] font-semibold text-[10px] border border-[#3a1a0e]/30">
                                                Table #{fb.tableId}
                                            </span>
                                            {fb.servantTip && fb.servantTip > 0 ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px] border border-emerald-500">
                                                    💵 ₹{fb.servantTip.toFixed(2)} Tip Paid
                                                </span>
                                            ) : null}
                                        </div>

                                        {fb.servantName && (
                                            <div className="text-xs text-slate-500 font-medium">
                                                Attendant: <strong className="text-[#3a1a0e]">{fb.servantName}</strong>
                                            </div>
                                        )}

                                        {fb.compliments && fb.compliments.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {fb.compliments.map((comp: string) => (
                                                    <span key={comp} className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-semibold uppercase">
                                                        ✨ {comp}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {fb.comment && (
                                            <p className="mt-1 text-xs text-slate-700 italic font-medium bg-[#f6efe2] p-2.5 rounded-xl border border-[#3a1a0e]/20">
                                                "{fb.comment}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 gap-1" aria-label={`Taste rating: ${fb.tasteRating} out of 5 stars`}>
                                        <div className="flex items-center text-amber-400 text-lg">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < fb.tasteRating ? 'text-amber-400' : 'text-slate-300'}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                                            Portion: <span className="text-[#3a1a0e]">{fb.portionFeedback}</span>
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                 <div className="flex items-center justify-center h-32 text-slate-400 text-xs font-semibold uppercase">
                                    No customer feedback has been submitted yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialogs */}
            <CameraAnalysisModal 
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
            />
            <WasteDrillDownModal 
                isOpen={!!selectedDrillDownItem}
                onClose={() => setSelectedDrillDownItem(null)}
                item={selectedDrillDownItem}
                allLogs={wasteLogs}
                allFeedback={feedback}
            />

            {/* Leftover Plate Zoom Preview Modal */}
            {previewImage && (
                <div 
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="relative max-w-2xl w-full bg-[#1c1613] p-2 rounded-3xl border-3 border-[#3a1a0e] shadow-2xl"
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#d6361f] text-white font-bold flex items-center justify-center border-2 border-white cursor-pointer shadow-lg z-10"
                        >
                            ✕
                        </button>
                        <img 
                            src={previewImage} 
                            alt="Leftover Plate Inspection" 
                            className="w-full max-h-[80vh] object-contain rounded-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;