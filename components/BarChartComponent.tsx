import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export interface BarChartDataItem {
    name: string;
    waste: number;
    cost?: number;
    menuItemId?: number;
}

interface BarChartProps {
    data: BarChartDataItem[];
    onBarClick?: (item: BarChartDataItem) => void;
    thresholdKg?: number;
}

const BarChartComponent: React.FC<BarChartProps> = ({ data, onBarClick, thresholdKg = 3 }) => {
    const [metricType, setMetricType] = useState<'waste' | 'cost'>('waste');
    const [sortBy, setSortBy] = useState<'default' | 'highest' | 'name'>('highest');
    const [activeThreshold, setActiveThreshold] = useState<number>(thresholdKg);
    const [showThreshold, setShowThreshold] = useState<boolean>(true);

    const processedData = React.useMemo(() => {
        let list = [...data];
        if (sortBy === 'highest') {
            list.sort((a, b) => (metricType === 'waste' ? b.waste - a.waste : (b.cost || 0) - (a.cost || 0)));
        } else if (sortBy === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [data, sortBy, metricType]);

    const handleExportCSV = () => {
        const headers = ['Item Name', 'Waste (kg)', 'Estimated Cost (INR)'];
        const rows = processedData.map(d => [
            `"${d.name}"`,
            d.waste.toFixed(2),
            (d.cost || Math.round(d.waste * 210)).toString()
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `restaurant_waste_trend_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full w-full select-none">
            {/* Top Interactive Toolbar in Landing Page Theme */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#3a1a0e]/20">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#3a1a0e] uppercase tracking-wider">Metric:</span>
                    <div className="bg-[#fff4dc] p-1 rounded-xl flex border-2 border-[#3a1a0e] shadow-xs">
                        <button
                            onClick={() => setMetricType('waste')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                metricType === 'waste'
                                    ? 'bg-[#3a1a0e] text-[#fff4dc] shadow-xs'
                                    : 'text-[#3a1a0e] hover:bg-[#ffeac2]'
                            }`}
                        >
                            <span>⚖️ Weight (kg)</span>
                        </button>
                        <button
                            onClick={() => setMetricType('cost')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                metricType === 'cost'
                                    ? 'bg-[#d6361f] text-[#fff4dc] shadow-xs'
                                    : 'text-[#3a1a0e] hover:bg-[#ffeac2]'
                            }`}
                        >
                            <span>💸 Loss (₹)</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {metricType === 'waste' && (
                        <div className="flex items-center space-x-1.5 bg-[#fffdf7] px-2.5 py-1 rounded-xl border border-[#3a1a0e] shadow-xs">
                            <input
                                type="checkbox"
                                id="showThreshold"
                                checked={showThreshold}
                                onChange={e => setShowThreshold(e.target.checked)}
                                className="rounded border-[#3a1a0e] text-[#d6361f] focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-[#d6361f]"
                            />
                            <label htmlFor="showThreshold" className="text-xs text-[#3a1a0e] cursor-pointer font-bold flex items-center gap-1 font-sans">
                                <span>Limit Alert ({activeThreshold}kg)</span>
                            </label>
                        </div>
                    )}

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="bg-white border-2 border-[#3a1a0e] text-[#3a1a0e] text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none shadow-xs cursor-pointer"
                        aria-label="Sort chart data"
                    >
                        <option value="highest">Sort: Highest Impact</option>
                        <option value="name">Sort: Alphabetical (A-Z)</option>
                        <option value="default">Sort: Default</option>
                    </select>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center space-x-1 bg-white hover:bg-[#fffdf7] text-[#3a1a0e] text-xs font-medium uppercase px-2.5 py-1 rounded-xl transition-all border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 cursor-pointer"
                        title="Download CSV Data"
                    >
                        <span>📥</span>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Click Guidance & Status Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2 px-1">
                <span className="flex items-center gap-1.5 font-medium">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 font-semibold text-[10px] uppercase">TIP</span>
                    <span>Click on any bar for deep root-cause diagnosis</span>
                </span>
                {metricType === 'waste' && showThreshold && (
                    <span className="text-[#d6361f] flex items-center gap-1 font-semibold text-[11px] uppercase bg-rose-50 border border-[#d6361f]/40 px-2 py-0.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-[#d6361f] animate-ping" />
                        Red = Exceeds {activeThreshold}kg
                    </span>
                )}
            </div>

            {/* Main Recharts Container */}
            <div className="flex-1 min-h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={processedData}
                        margin={{
                            top: 15,
                            right: 20,
                            left: 10,
                            bottom: 25,
                        }}
                    >
                        <defs>
                            <linearGradient id="barIndigo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                            </linearGradient>
                            <linearGradient id="barCritical" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#d6361f" stopOpacity={1} />
                                <stop offset="100%" stopColor="#991b1b" stopOpacity={0.9} />
                            </linearGradient>
                            <linearGradient id="barCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                                <stop offset="100%" stopColor="#c2410c" stopOpacity={0.9} />
                            </linearGradient>
                        </defs>

                        <XAxis 
                            dataKey="name" 
                            stroke="#3a1a0e" 
                            fontSize={11} 
                            fontWeight={700}
                            tickLine={false} 
                            axisLine={{ stroke: '#3a1a0e', strokeWidth: 1.5 }} 
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                        />
                        <YAxis 
                            stroke="#3a1a0e" 
                            fontSize={12} 
                            fontWeight={700}
                            tickLine={false} 
                            axisLine={{ stroke: '#3a1a0e', strokeWidth: 1.5 }} 
                            label={{ 
                                value: metricType === 'waste' ? 'Waste (kg)' : 'Loss (₹)', 
                                angle: -90, 
                                position: 'insideLeft', 
                                fill: '#3a1a0e', 
                                fontSize: 12,
                                fontWeight: 'bold' 
                            }} 
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(214, 54, 31, 0.08)', radius: 12 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload as BarChartDataItem;
                                    const isAboveThreshold = metricType === 'waste' && showThreshold && d.waste >= activeThreshold;
                                    const costVal = d.cost || Math.round(d.waste * 210);
                                    return (
                                        <div className="bg-[#fffdf7] border-2 border-[#3a1a0e] p-4 rounded-2xl shadow-[4px_4px_0_#3a1a0e] text-xs z-50 min-w-[210px] select-none">
                                            <div className="font-semibold uppercase text-[#3a1a0e] text-sm mb-2 border-b-2 border-[#3a1a0e]/20 pb-1.5 flex justify-between items-center gap-2">
                                                <span>{d.name}</span>
                                                {isAboveThreshold ? (
                                                    <span className="text-[10px] bg-red-100 text-[#d6361f] border border-[#d6361f] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                                        High Alert
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-600 px-2 py-0.5 rounded-full font-bold">
                                                        Normal
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2 font-semibold">
                                                <div className="flex justify-between items-center text-slate-700">
                                                    <span>Wasted Volume:</span>
                                                    <span className="font-mono font-black text-[#d6361f] text-sm">{d.waste.toFixed(2)} kg</span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-700">
                                                    <span>Revenue Loss:</span>
                                                    <span className="font-mono font-black text-[#d6361f] text-sm">₹{costVal.toLocaleString()}</span>
                                                </div>
                                                {isAboveThreshold && (
                                                    <div className="mt-2 pt-1.5 border-t border-[#3a1a0e]/20 text-[#d6361f] text-[11px] font-bold flex items-center gap-1.5 bg-rose-50 p-2 rounded-xl border border-rose-200">
                                                        <span>⚠️</span>
                                                        <span>Exceeds {activeThreshold}kg max threshold</span>
                                                    </div>
                                                )}
                                                <div className="mt-2 pt-1.5 border-t border-[#3a1a0e]/20 text-[11px] text-[#3a1a0e] font-semibold uppercase text-center flex items-center justify-center gap-1">
                                                    <span>🖱️ Click Bar for Diagnosis</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {metricType === 'waste' && showThreshold && (
                            <ReferenceLine 
                                y={activeThreshold} 
                                stroke="#EF4444" 
                                strokeDasharray="5 5" 
                                strokeWidth={2}
                                label={{ 
                                    value: `Max Limit (${activeThreshold}kg)`, 
                                    fill: '#EF4444', 
                                    fontSize: 11, 
                                    fontWeight: 'extrabold',
                                    position: 'insideTopRight' 
                                }} 
                            />
                        )}
                        <Bar 
                            dataKey={metricType === 'waste' ? 'waste' : 'cost'} 
                            name={metricType === 'waste' ? 'Wasted (kg)' : 'Financial Loss (₹)'} 
                            radius={[8, 8, 0, 0]} 
                            barSize={38}
                            onClick={(data) => {
                                if (onBarClick && data) {
                                    onBarClick(data as unknown as BarChartDataItem);
                                }
                            }}
                            className="cursor-pointer transition-all duration-300 hover:opacity-90 hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                        >
                            {processedData.map((entry, index) => {
                                const isCritical = metricType === 'waste' && showThreshold && entry.waste >= activeThreshold;
                                return (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={
                                            metricType === 'cost' 
                                                ? 'url(#barCost)' 
                                                : isCritical 
                                                ? 'url(#barCritical)' 
                                                : 'url(#barIndigo)'
                                        } 
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChartComponent;
