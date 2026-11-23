import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface DashboardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardConfigModal: React.FC<DashboardConfigModalProps> = ({ isOpen, onClose }) => {
  const { dashboardConfig, updateDashboardConfig } = useAppContext();
  
  const [targetRevenue, setTargetRevenue] = useState(dashboardConfig.targetRevenue.toString());
  const [targetWasteReduction, setTargetWasteReduction] = useState(dashboardConfig.targetWasteReduction.toString());
  const [estLossRupees, setEstLossRupees] = useState(dashboardConfig.estLossRupees.toString());

  useEffect(() => {
    if (isOpen) {
      setTargetRevenue(dashboardConfig.targetRevenue.toString());
      setTargetWasteReduction(dashboardConfig.targetWasteReduction.toString());
      setEstLossRupees(dashboardConfig.estLossRupees.toString());
    }
  }, [isOpen, dashboardConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDashboardConfig({
      targetRevenue: parseFloat(targetRevenue) || 50000,
      targetWasteReduction: parseFloat(targetWasteReduction) || 25,
      estLossRupees: parseFloat(estLossRupees) || 14500,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0F172A]/95 border-2 border-indigo-500/80 rounded-3xl shadow-[0_0_70px_-15px_rgba(99,102,241,0.5)] w-full max-w-lg text-left p-6 sm:p-8 overflow-y-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-pink-500" />

        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">⚙️ Dashboard Targets</h3>
            <p className="text-xs text-indigo-300 uppercase tracking-wider">Customize Live KPI Goals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Daily Revenue Goal (₹):
              </label>
              <input
                type="number"
                value={targetRevenue}
                onChange={e => setTargetRevenue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-extrabold text-emerald-400 focus:outline-none focus:border-indigo-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Updates the live revenue progress bar and financial telemetry.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Waste Reduction Goal (%):
              </label>
              <input
                type="number"
                value={targetWasteReduction}
                onChange={e => setTargetWasteReduction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-extrabold text-indigo-400 focus:outline-none focus:border-indigo-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Updates the AI Waste Prevention engine target goal percentage.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Monthly Waste Loss Baseline (₹):
              </label>
              <input
                type="number"
                value={estLossRupees}
                onChange={e => setEstLossRupees(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-extrabold text-amber-400 focus:outline-none focus:border-indigo-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Baseline metric used for AI margin recovery calculations.</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                setTargetRevenue('75000');
                setTargetWasteReduction('30');
                setEstLossRupees('12000');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-bold"
            >
              Reset to High-Performance Preset
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-transform active:scale-95"
          >
            ✅ Save & Apply Targets
          </button>
        </form>
      </div>
    </div>
  );
};
