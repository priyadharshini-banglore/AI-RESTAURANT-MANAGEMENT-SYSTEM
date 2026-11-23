
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PieChartData {
    name: string;
    value: number;
}

interface PieChartComponentProps {
    data: PieChartData[];
}

const COLORS: { [key: string]: string } = {
  'Plate': '#d6361f',   // cartoon crimson
  'Buffet': '#10b981',  // emerald green
  'Kitchen': '#f59e0b', // sunny amber
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data }) => {
    const totalWaste = data.reduce((sum, entry) => sum + entry.value, 0);
    
    return (
        <div className="w-full h-full relative select-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-extrabold text-[#3a1a0e] tracking-tight">{totalWaste.toFixed(1)}kg</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Scraps</div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        fill="#8884d8"
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        stroke="#3a1a0e"
                        strokeWidth={2}
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#cccccc'} />
                        ))}
                    </Pie>
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                            backgroundColor: '#fffdf7', 
                            borderColor: '#3a1a0e',
                            borderWidth: '2px',
                            color: '#3a1a0e',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            boxShadow: '3px 3px 0 #3a1a0e',
                            fontFamily: 'Inter'
                        }} 
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartComponent;
