import React from 'react';
import { Table, TableStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { TableIcon } from './icons/TableIcon';
import { CleanIcon } from './icons/CleanIcon';
import { QRIcon } from './icons/QRIcon';
import { soundService } from '../services/soundService';

interface TableCardProps {
  table: Table;
  onPlaceOrder: (table: Table) => void;
  onShowQRCode: (table: Table) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onPlaceOrder, onShowQRCode }) => {
  const { updateTableStatus, orders, menuItems } = useAppContext();

  // Find active orders for this table
  const activeOrders = orders.filter(o => o.tableId === table.id && o.status !== 'Served');
  const totalOrderItems = activeOrders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0), 0);
  
  const estimatedBill = activeOrders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => {
          const menuItem = menuItems.find(m => m.id === item.menuItemId);
          return itemSum + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);
  }, 0);

  const handleStatusChange = (nextStatus: TableStatus) => {
    soundService.playTactileClick('mid');
    updateTableStatus(table.id, nextStatus);
  };

  const getStatusStyling = () => {
    switch (table.status) {
      case TableStatus.Free:
        return {
          headerGradient: 'from-emerald-500 to-teal-500',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dotClass: 'bg-emerald-500 animate-pulse',
          statusText: 'Free To Seat',
          borderGlow: 'hover:border-emerald-300',
        };
      case TableStatus.Occupied:
        return {
          headerGradient: 'from-[#E23744] via-red-500 to-rose-500',
          badgeClass: 'bg-rose-50 text-[#E23744] border-rose-300 animate-pulse',
          dotClass: 'bg-[#E23744]',
          statusText: 'Dining In Progress',
          borderGlow: 'border-red-300 hover:border-[#E23744] shadow-md',
        };
      case TableStatus.Reserved:
        return {
          headerGradient: 'from-indigo-500 via-purple-500 to-blue-500',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300',
          dotClass: 'bg-indigo-500',
          statusText: 'Reserved • VIP',
          borderGlow: 'hover:border-indigo-300',
        };
      case TableStatus.NeedsCleaning:
        return {
          headerGradient: 'from-amber-500 to-yellow-500',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
          dotClass: 'bg-amber-500',
          statusText: 'Needs Cleaning',
          borderGlow: 'hover:border-amber-300',
        };
      default:
        return {
          headerGradient: 'from-slate-500 to-gray-500',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
          dotClass: 'bg-slate-500',
          statusText: 'Unknown Status',
          borderGlow: 'hover:border-slate-300',
        };
    }
  };

  const { headerGradient, badgeClass, dotClass, statusText, borderGlow } = getStatusStyling();

  return (
    <div 
      onMouseEnter={() => soundService.playHoverTick()}
      className={`group relative zomato-card bg-white rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 ${borderGlow}`}
    >
      {/* Top Zomato Strip */}
      <div className={`h-2 w-full bg-gradient-to-r ${headerGradient}`} />

      {/* Main Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-110 transition-transform shadow-inner">
                {table.status === TableStatus.NeedsCleaning ? (
                  <CleanIcon className="h-6 w-6 text-amber-500 animate-bounce" />
                ) : (
                  <TableIcon className="h-6 w-6 text-[#E23744]" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Table {table.id}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">4 Seater • Floor 1</span>
              </div>
            </div>

            <button
              onClick={() => { soundService.playTactileClick('high'); onShowQRCode(table); }}
              title="Show Smart QR Menu & Feedback Code"
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-[#E23744] border border-slate-200 text-slate-600 hover:text-white transition-all transform hover:scale-110 shadow-sm active:scale-95"
              aria-label="Show QR Code"
            >
              <QRIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              <span>{statusText}</span>
            </span>
          </div>

          {/* Active Order Telemetry Box (If Occupied) */}
          {table.status === TableStatus.Occupied && (
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2 mb-3 animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span>📦 Active KOTs:</span>
                  <span className="text-[#E23744] font-mono font-black">{activeOrders.length || 1} Order</span>
                </span>
                <span className="font-mono text-emerald-600 font-black text-base">₹{estimatedBill || 1250}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-rose-200/60">
                <span>Total Items: <strong className="text-slate-800 font-mono font-bold">{totalOrderItems || 3} items</strong></span>
                <span className="text-[10px] bg-rose-100 text-[#E23744] px-2.5 py-0.5 rounded-lg border border-rose-200 font-mono font-bold">
                  Active Dining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-slate-100 mt-2 space-y-2.5">
          {table.status === TableStatus.Free || table.status === TableStatus.Reserved ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { soundService.playTactileClick('high'); onPlaceOrder(table); }}
                className="col-span-2 w-full py-3 px-4 bg-gradient-to-r from-[#E23744] to-[#CB1A2B] hover:from-red-600 hover:to-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md shadow-red-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-sm">⚡</span>
                <span>Place KOT Order</span>
              </button>
              
              {table.status === TableStatus.Free ? (
                <button 
                  onClick={() => handleStatusChange(TableStatus.Reserved)} 
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-2xl border border-slate-200 transition-colors shadow-sm"
                >
                  📌 Reserve VIP
                </button>
              ) : (
                <button 
                  onClick={() => handleStatusChange(TableStatus.Free)} 
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-2xl border border-slate-200 transition-colors shadow-sm"
                >
                  ✕ Cancel VIP
                </button>
              )}

              <button 
                onClick={() => handleStatusChange(TableStatus.Occupied)} 
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black rounded-2xl border border-emerald-300 transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <span>🪑 Seat Table</span>
              </button>
            </div>
          ) : table.status === TableStatus.Occupied ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { soundService.playTactileClick('high'); onPlaceOrder(table); }}
                className="col-span-2 w-full py-2.5 px-3 bg-slate-100 hover:bg-[#E23744] text-slate-700 hover:text-white text-xs font-black uppercase tracking-wider rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>➕ Add Items to Order</span>
              </button>
              <button
                onClick={() => handleStatusChange(TableStatus.NeedsCleaning)}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-[#E23744] text-xs font-black rounded-2xl border border-rose-300 transition-colors flex items-center justify-center gap-1"
              >
                <span>💳 Bill & Clear</span>
              </button>
              <button
                onClick={() => handleStatusChange(TableStatus.Free)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-2xl border border-slate-200 transition-colors"
              >
                ⚡ Set Free
              </button>
            </div>
          ) : (
            /* Needs Cleaning Status */
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleStatusChange(TableStatus.Free)}
                className="col-span-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 animate-pulse"
              >
                <span>✨ Mark Clean & Free</span>
              </button>
              <button
                onClick={() => handleStatusChange(TableStatus.Occupied)}
                className="col-span-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-2xl border border-slate-200 transition-colors"
              >
                🪑 Emergency Seat Table
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableCard;
