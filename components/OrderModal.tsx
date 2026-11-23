import React, { useState } from 'react';
import { Table, OrderItem } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { soundService } from '../services/soundService';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, table }) => {
  const { addOrder, menuItems } = useAppContext();
  const [orderItems, setOrderItems] = useState<Map<number, number>>(new Map());

  const handleQuantityChange = (menuItemId: number, change: number) => {
    if (change > 0) soundService.playTactileClick('high');
    else soundService.playTactileClick('low');

    const newItems = new Map<number, number>(orderItems);
    const currentQty = newItems.get(menuItemId) || 0;
    const newQty = Math.max(0, currentQty + change);
    if (newQty > 0) {
      newItems.set(menuItemId, newQty);
    } else {
      newItems.delete(menuItemId);
    }
    setOrderItems(newItems);
  };

  const handleSubmitOrder = () => {
    if (orderItems.size > 0) {
      soundService.playOrderSuccessChime();
      const items: OrderItem[] = Array.from(orderItems.entries()).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity,
      }));
      const formattedForBill = Array.from(orderItems.entries()).map(([menuItemId, quantity]) => {
        const item = menuItems.find(m => m.id === menuItemId);
        return {
          id: String(menuItemId),
          name: item ? item.name : `Dish #${menuItemId}`,
          price: item ? item.price : 200,
          quantity,
          category: item ? item.category : 'General'
        };
      });
      try {
        localStorage.setItem(`restroai_table_${table.id}_bill`, JSON.stringify(formattedForBill));
      } catch (e) {}
      addOrder(table.id, items);
      onClose();
      setOrderItems(new Map());
    }
  };
  
  const totalItems = Array.from(orderItems.values()).reduce((sum: number, qty: number) => sum + qty, 0);
  const totalCost = Array.from(orderItems.entries()).reduce((sum: number, [id, qty]: [number, number]) => {
    const item = menuItems.find(m => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  if (!isOpen) return null;

  const isVegDish = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('paneer') || lower.includes('dal') || lower.includes('veg') || lower.includes('naan') || lower.includes('pulao') || lower.includes('jamun') || lower.includes('chai');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden text-slate-900">
        <div className="h-2 w-full bg-gradient-to-r from-[#E23744] via-[#D32F2F] to-[#CB1A2B]" />
        
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-[#E23744] uppercase tracking-widest block">New Kitchen Order Ticket</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Place Order for Table #{table.id}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 p-2.5 rounded-xl transition-colors border border-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {menuItems.map(item => {
            const veg = isVegDish(item.name);
            const qty = orderItems.get(item.id) || 0;

            return (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${qty > 0 ? 'bg-rose-50/40 border-[#E23744]' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={veg ? 'veg-badge' : 'nonveg-badge'} />
                    <span className="text-[10px] font-black text-slate-400 uppercase">{item.category}</span>
                  </div>
                  <p className="font-black text-slate-900 text-base">{item.name}</p>
                  <p className="text-xs font-mono font-bold text-[#E23744] mt-0.5">₹{item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-2.5">
                  {qty > 0 ? (
                    <div className="flex items-center bg-[#E23744] text-white rounded-2xl p-1 shadow-sm">
                      <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/30 font-black text-base flex items-center justify-center transition-transform active:scale-90">-</button>
                      <span className="px-3.5 text-sm font-black font-mono">{qty}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/30 font-black text-base flex items-center justify-center transition-transform active:scale-90">+</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="px-5 py-2 bg-rose-50 hover:bg-[#E23744] text-[#E23744] hover:text-white border border-rose-200 hover:border-[#E23744] rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-90"
                    >
                      ADD +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase block">Total Items ({totalItems})</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">₹{totalCost.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSubmitOrder} 
              disabled={totalItems === 0}
              className="bg-gradient-to-r from-[#E23744] to-[#CB1A2B] text-white font-black py-3 px-6 rounded-2xl shadow-md text-xs uppercase tracking-wider hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              Confirm KOT ({totalItems})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
