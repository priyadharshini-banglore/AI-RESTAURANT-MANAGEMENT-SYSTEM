import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Order, OrderStatus } from '../types';
import { ClockIcon } from '../components/icons/ClockIcon';
import { ChefHatIcon } from '../components/icons/ChefHatIcon';
import { soundService } from '../services/soundService';

const KitchenView: React.FC = () => {
  const { orders, updateOrderStatus, menuItems } = useAppContext();
  const [isMuted, setIsMuted] = useState(soundService.getMutedStatus());
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [rushedOrders, setRushedOrders] = useState<{ [id: string]: boolean }>({});

  const activeOrders = orders.filter(
    order => order.status === OrderStatus.Preparing || order.status === OrderStatus.Ready
  ).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Trigger audio alert when a new KOT order arrives
  useEffect(() => {
    if (activeOrders.length > lastOrderCount && lastOrderCount > 0) {
      soundService.playKdsAlertBeep();
    }
    setLastOrderCount(activeOrders.length);
  }, [activeOrders.length, lastOrderCount]);

  const toggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundService.playTactileClick('high');
    }
  };

  const toggleRushOrder = (orderId: string) => {
    soundService.playKdsAlertBeep();
    setRushedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getMenuItemName = (id: number) => {
    return menuItems.find(item => item.id === id)?.name || 'Dish #' + id;
  };

  const getTicketUrgency = (orderId: string, createdAt: Date | string) => {
    if (rushedOrders[orderId]) {
      return {
        label: `⚡ EXPRESS RUSH • VIP`,
        headerClass: 'bg-gradient-to-r from-purple-800 to-indigo-800 text-[#fff4dc]',
        borderClass: 'border-purple-800',
        progressPct: 85
      };
    }
    const timeDiffMins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (timeDiffMins >= 10) {
      return {
        label: `🔥 URGENT • ${timeDiffMins}m`,
        headerClass: 'bg-[#d6361f] text-[#fff4dc]',
        borderClass: 'border-[#3a1a0e]',
        progressPct: 90
      };
    } else if (timeDiffMins >= 5) {
      return {
        label: `⚡ COOKING • ${timeDiffMins}m`,
        headerClass: 'bg-[#ea580c] text-[#fff4dc]',
        borderClass: 'border-[#3a1a0e]',
        progressPct: 55
      };
    }
    return {
      label: `🟢 FRESH • ${timeDiffMins || 1}m`,
      headerClass: 'bg-[#059669] text-[#fff4dc]',
      borderClass: 'border-[#3a1a0e]',
      progressPct: 25
    };
  };

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    soundService.playTactileClick('mid');
    if (nextStatus === OrderStatus.Ready) {
      soundService.playOrderSuccessChime();
    }
    updateOrderStatus(orderId, nextStatus);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto px-2 sm:px-4 font-sans select-none">
      {/* 🚀 Top Artisanal Kitchen Command Header */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#fff4dc] text-[#3a1a0e] p-6 sm:p-8 shadow-[4px_4px_0_#3a1a0e] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-3 border-[#3a1a0e]">
        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] text-3xl flex items-center justify-center text-white shrink-0">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#d6361f] text-[#fff4dc] border border-[#3a1a0e] shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Real-Time Kitchen KDS Terminal
              </span>
              <span className="text-xs text-[#7a5843] font-mono hidden sm:inline">| Chef Wok Priority Display</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3a1a0e] tracking-tight mt-1 leading-tight">
              Kitchen KOT Command Display
            </h1>
            <p className="text-xs sm:text-sm text-[#7a5843] mt-0.5 max-w-xl font-normal">
              Live preparation countdown bars, automated wok balancing warnings, and one-tap Express Rush escalation for VIP dine-in tables.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 relative z-10 w-full md:w-auto justify-end">
          <button
            onClick={toggleSound}
            className={`px-5 py-3 rounded-2xl text-xs font-medium uppercase tracking-wider transition-all transform active:scale-95 flex items-center gap-2 border-2 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e] cursor-pointer ${
              !isMuted
                ? 'bg-[#059669] hover:bg-[#047857] text-[#fff4dc]'
                : 'bg-[#f0e4cf] hover:bg-[#e4d4ba] text-[#3a1a0e]'
            }`}
          >
            <span className="text-base">{!isMuted ? '🔊' : '🔇'}</span>
            <span>{!isMuted ? 'Audio KOT Enabled' : 'Audio Muted'}</span>
          </button>
        </div>
      </div>

      {/* Active Ticket Counter & Wok Load Balancer Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-[#fffdf7] rounded-3xl border-2 sm:border-3 border-[#3a1a0e] shadow-[3px_3px_0_#3a1a0e]">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7a5843]">Wok Terminal Telemetry:</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#d6361f] text-[#fff4dc] border border-[#3a1a0e] text-xs font-medium shadow-xs">
            {activeOrders.length} Orders in Wok Queue
          </span>
          {activeOrders.length >= 4 && (
            <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-400 text-xs font-medium animate-pulse flex items-center gap-1">
              <span>🔥 Chef Terminal #1 High Velocity • Auto-balancing Active</span>
            </span>
          )}
        </div>
        <span className="text-xs text-[#7a5843] font-mono font-bold">
          Neural Sync: Every 1.0s ⚡
        </span>
      </div>

      {/* Main Grid of Ticket Cards */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-20 bg-[#fffdf7] rounded-3xl border-3 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] p-8 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-[#fff4dc] border-2 border-[#3a1a0e] text-4xl flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0_#3a1a0e] animate-bounce">
            👨‍🍳
          </div>
          <h2 className="text-2xl font-bold text-[#3a1a0e] tracking-tight">All Wok Terminals Clear!</h2>
          <p className="text-xs sm:text-sm text-[#7a5843] mt-2 max-w-md mx-auto leading-relaxed font-normal">
            There are no active kitchen orders in preparation right now. As guests submit orders on their mobile phones (<span className="font-mono font-bold text-[#d6361f]">#/menu/:id</span>), KOT tickets will ring here instantly with audio chimes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOrders.map((order: Order) => {
            const urgency = getTicketUrgency(order.id, order.createdAt);
            const isRushed = !!rushedOrders[order.id];

            return (
              <div 
                key={order.id} 
                className="bg-[#fffdf7] rounded-[28px] overflow-hidden flex flex-col justify-between transition-all duration-200 border-3 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] hover:translate-y-[-2px]"
              >
                {/* Top Ticket Status Header */}
                <div className={`p-4 sm:p-5 flex justify-between items-center border-b-2 border-[#3a1a0e] ${urgency.headerClass}`}>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest block opacity-90">
                      #{order.id}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight mt-0.5">Table {order.tableId}</h2>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/40 text-[10px] font-semibold tracking-wider uppercase block shadow-xs">
                      {urgency.label}
                    </span>
                    <button
                      onClick={() => toggleRushOrder(order.id)}
                      title="Escalate ticket to VIP Express Rush"
                      className="mt-1.5 text-[10px] font-medium uppercase tracking-wider bg-black/25 hover:bg-black/35 px-2.5 py-0.5 rounded-lg border border-white/30 transition-colors cursor-pointer"
                    >
                      {isRushed ? '✓ Rushed VIP' : '⚡ Rush Ticket'}
                    </button>
                  </div>
                </div>

                {/* Live Prep Countdown Bar */}
                <div className="px-5 pt-3.5 pb-2.5 bg-[#fff4dc] border-b-2 border-[#3a1a0e]">
                  <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-[#7a5843] mb-1">
                    <span>Prep Progress</span>
                    <span className="font-mono text-[#d6361f] font-black">{urgency.progressPct}% Cooked</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 border border-[#3a1a0e] overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#d6361f] to-amber-500 transition-all duration-500" 
                      style={{ width: `${urgency.progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Ticket Items Breakdown */}
                <div className="p-4 sm:p-5 flex-1 bg-[#fffdf7] space-y-3">
                  <span className="text-[10px] font-semibold text-[#7a5843] uppercase tracking-wider block pb-2 border-b-2 border-dashed border-[#3a1a0e]/20">
                    Dishes &amp; Precision Quantities
                  </span>
                  <ul className="space-y-2.5 divide-y divide-[#3a1a0e]/10">
                    {order.items.map((item, index) => (
                      <li key={index} className="pt-2 flex justify-between items-center first:pt-0">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#d6361f] shrink-0" />
                          <span className="text-sm font-bold text-[#3a1a0e]">{getMenuItemName(item.menuItemId)}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-xl bg-[#fff4dc] border-2 border-[#3a1a0e] text-xs font-bold text-[#d6361f] shadow-[1px_1px_0_#3a1a0e]">
                          x{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ticket Actions Strip */}
                <div className="p-4 bg-[#fff4dc] border-t-2 border-[#3a1a0e]">
                  {order.status === OrderStatus.Preparing ? (
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.Ready)}
                      className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-[#fff4dc] font-medium text-xs uppercase tracking-wider rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] transition-transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span className="text-base">✅</span>
                      <span>Mark Dish Ready for Waiter</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.Served)}
                      className="w-full py-3 bg-[#d6361f] hover:bg-[#b92c17] text-[#fff4dc] font-medium text-xs uppercase tracking-wider rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] transition-transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span className="text-base">🍽️</span>
                      <span>Dish Served &amp; Cleared</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenView;
