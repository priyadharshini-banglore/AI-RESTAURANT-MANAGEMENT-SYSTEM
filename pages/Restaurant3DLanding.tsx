import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { soundService } from '../services/soundService';
import DiscoveryMenuFeed, { MenuItemFeed } from '../components/customer/DiscoveryMenuFeed';
import CustomerBillPaymentModal from '../components/customer/CustomerBillPaymentModal';
import { CallServantModal, ServiceCall } from '../components/customer/CallServantModal';
import { LiveKitchenTracker } from '../components/customer/LiveKitchenTracker';
import { FloatingOrderTrackerPill } from '../components/customer/FloatingOrderTrackerPill';
import { GuestReviewAndTipModal } from '../components/customer/GuestReviewAndTipModal';
import { TableQRStandeeModal } from '../components/customer/TableQRStandeeModal';
import { StaffPortalsModal } from '../components/StaffPortalsModal';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  notes?: string;
}

export const Restaurant3DLanding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addOrder } = useAppContext();

  // Universal Table ID extractor supporting Google Scanner, Google Lens, Chrome, Hash & Direct Query
  const resolveTableIdFromAnyUrl = (): number => {
    try {
      // 1. React Router searchParams (hash-based ?table=X)
      const rParam = searchParams.get('table');
      if (rParam && !isNaN(parseInt(rParam, 10)) && parseInt(rParam, 10) > 0) {
        return parseInt(rParam, 10);
      }
      // 2. Native browser window.location.search (?table=X from Google Lens / QR Scanner)
      if (typeof window !== 'undefined' && window.location.search) {
        const nativeParams = new URLSearchParams(window.location.search);
        const sParam = nativeParams.get('table');
        if (sParam && !isNaN(parseInt(sParam, 10)) && parseInt(sParam, 10) > 0) {
          return parseInt(sParam, 10);
        }
      }
      // 3. Raw hash search (e.g. #/?table=X or #/menu/X)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        const menuMatch = hash.match(/#\/menu\/(\d+)/);
        if (menuMatch && menuMatch[1]) {
          return parseInt(menuMatch[1], 10);
        }
        const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
        if (hashQuery) {
          const hParams = new URLSearchParams(hashQuery);
          const hParam = hParams.get('table');
          if (hParam && !isNaN(parseInt(hParam, 10)) && parseInt(hParam, 10) > 0) {
            return parseInt(hParam, 10);
          }
        }
      }
      // 4. LocalStorage memory fallback
      const saved = localStorage.getItem('restroai_active_table_id');
      if (saved && !isNaN(parseInt(saved, 10)) && parseInt(saved, 10) > 0) {
        return parseInt(saved, 10);
      }
    } catch (e) { }
    return 1;
  };

  const initialTableId = resolveTableIdFromAnyUrl();
  const [selectedTableId, setSelectedTableId] = useState<number>(initialTableId);

  // Active view: default to '3d' Landing Page unless explicitly requested via ?view=menu
  const initialView = searchParams.get('view') === 'menu' ? 'menu' : '3d';
  const [activeView, setActiveView] = useState<'3d' | 'menu'>(initialView);
  const [lastPaidDishes, setLastPaidDishes] = useState<string[]>([]);

  const [isMuted, setIsMuted] = useState(soundService.getMutedStatus());

  // Cart & Bill state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isBillPaymentModalOpen, setIsBillPaymentModalOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('BELLACRAVE');
  const [discountPercent, setDiscountPercent] = useState<number>(30); // 30% off chef deal
  const [isOrderPlacedSuccess, setIsOrderPlacedSuccess] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [billPaymentInitialMode, setBillPaymentInitialMode] = useState<'full' | 'split'>('full');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isQRStandeeModalOpen, setIsQRStandeeModalOpen] = useState<boolean>(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);

  // 🛎️ Call Servant Bell State & Persistence
  const [isCallServantOpen, setIsCallServantOpen] = useState<boolean>(false);
  const [activeServiceCall, setActiveServiceCall] = useState<ServiceCall | null>(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${initialTableId}_service_call`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Persistent table orders in localStorage
  const [placedTableOrders, setPlacedTableOrders] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${initialTableId}_bill`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const detected = resolveTableIdFromAnyUrl();
    if (detected && detected !== selectedTableId) {
      setSelectedTableId(detected);
    }
    const vParam = searchParams.get('view');
    if (vParam === 'menu') {
      setActiveView('menu');
    } else if (vParam === '3d') {
      setActiveView('3d');
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      localStorage.setItem('restroai_active_table_id', selectedTableId.toString());
    } catch (e) { }
  }, [selectedTableId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${selectedTableId}_bill`);
      if (saved) {
        setPlacedTableOrders(JSON.parse(saved));
      } else {
        setPlacedTableOrders([]);
      }
    } catch (e) {
      setPlacedTableOrders([]);
    }

    try {
      const savedCall = localStorage.getItem(`restroai_table_${selectedTableId}_service_call`);
      if (savedCall) {
        const parsed = JSON.parse(savedCall);
        if (parsed && parsed.status !== 'resolved') {
          setActiveServiceCall(parsed);
        } else {
          setActiveServiceCall(null);
        }
      } else {
        setActiveServiceCall(null);
      }
    } catch (e) {
      setActiveServiceCall(null);
    }
  }, [selectedTableId]);

  // Real-time IPC sync via BroadcastChannel for servant acknowledgment and resolution
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;
        if (Number(data.tableId) === Number(selectedTableId)) {
          if (data.type === 'SERVICE_CALL_REQUEST') {
            setActiveServiceCall(data.call);
          } else if (data.type === 'SERVICE_CALL_ACKNOWLEDGED') {
            setActiveServiceCall((prev) =>
              prev ? { ...prev, status: 'acknowledged', staffName: data.staffName || 'Floor Staff' } : null
            );
            soundService.playChimeSuccess();
          } else if (data.type === 'SERVICE_CALL_RESOLVED') {
            setActiveServiceCall(null);
          }
        }
      };
    } catch (e) { }

    const syncCallFromStorage = () => {
      try {
        const savedCall = localStorage.getItem(`restroai_table_${selectedTableId}_service_call`);
        if (savedCall) {
          const parsed = JSON.parse(savedCall);
          if (parsed && parsed.status !== 'resolved') {
            setActiveServiceCall(parsed);
          } else {
            setActiveServiceCall(null);
          }
        } else {
          setActiveServiceCall(null);
        }
      } catch (e) { }
    };

    window.addEventListener('storage', syncCallFromStorage);
    const interval = setInterval(syncCallFromStorage, 1500);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', syncCallFromStorage);
      clearInterval(interval);
    };
  }, [selectedTableId]);

  const handleDirectCallServant = (type = 'Drinking Water / Assistance', note = '') => {
    soundService.playTactileClick('high');
    if (activeServiceCall && activeServiceCall.status !== 'resolved') {
      setIsCallServantOpen(true);
      return;
    }
    const newCall: ServiceCall = {
      id: `CALL-${Date.now()}`,
      tableId: selectedTableId,
      type: type,
      note: note,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setActiveServiceCall(newCall);

    try {
      localStorage.setItem(`restroai_table_${selectedTableId}_service_call`, JSON.stringify(newCall));
    } catch (e) { }

    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_REQUEST',
        call: newCall,
        tableId: selectedTableId,
        timestamp: Date.now(),
      });
      setTimeout(() => { try { channel.close(); } catch (e) { } }, 3000);
    } catch (e) { }

    try {
      window.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId: selectedTableId, call: newCall }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId: selectedTableId, call: newCall }, '*');
      }
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId: selectedTableId, call: newCall }, '*'); } catch (e) { }
      });
    } catch (e) { }

    try {
      fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call: newCall }),
      }).catch(() => { });
    } catch (e) { }

    setIsCallServantOpen(true);
  };

  // Listen to postMessage from 3D iframe when customer taps actions on the 3D stage
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'OPEN_MENU') {
        soundService.playTactileClick('high');
        setActiveView('menu');
        setSearchParams((prev) => {
          const p = new URLSearchParams(prev);
          p.set('view', 'menu');
          return p;
        });
      } else if (e.data?.type === 'OPEN_CALL_SERVANT') {
        soundService.playTactileClick('high');
        handleDirectCallServant();
      } else if (e.data?.type === 'OPEN_BILL') {
        soundService.playTactileClick('mid');
        setIsBillPaymentModalOpen(true);
      } else if (e.data?.type === 'OPEN_STAFF_PORTAL') {
        soundService.playTactileClick('high');
        setIsStaffModalOpen(true);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [setSearchParams, selectedTableId, activeServiceCall]);

  const handleToggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundService.playTactileClick('high');
    }
  };

  // Cart operations
  const handleAddToCart = (item: {
    id: number | string;
    name: string;
    price: number;
    image: string;
    category?: string;
  }, quantity: number = 1) => {
    soundService.playTactileClick('high');
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.name === item.name);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            id: String(item.id),
            name: item.name,
            price: item.price,
            quantity,
            image: item.image,
            category: item.category || 'Special',
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (name: string, delta: number) => {
    soundService.playTactileClick(delta > 0 ? 'high' : 'low');
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.name === name) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const activeBillItems = cartItems.length > 0 ? cartItems : placedTableOrders;

  // Book order for table and immediately dispatch to Kitchen KOT
  const handleCheckoutOrder = () => {
    if (cartItems.length === 0) return;

    soundService.playOrderSuccessChime();

    // Map cart items into OrderItem format
    const orderItems = cartItems.map((ci, idx) => ({
      menuItemId: idx + 1,
      quantity: ci.quantity,
      notes: `${ci.name} (${ci.category})`,
    }));

    addOrder(selectedTableId, orderItems);

    // Save to persistent table bill so customer can pay after eating
    const updatedPlaced = [...placedTableOrders];
    cartItems.forEach((ci) => {
      const existing = updatedPlaced.find((p) => p.name === ci.name);
      if (existing) {
        existing.quantity += ci.quantity;
      } else {
        updatedPlaced.push({ ...ci });
      }
    });

    setPlacedTableOrders(updatedPlaced);
    try {
      localStorage.setItem(`restroai_table_${selectedTableId}_bill`, JSON.stringify(updatedPlaced));
    } catch (e) { }

    // Initialize or update Kitchen Tracker in localStorage
    try {
      const trackerData = {
        orderId: `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
        tableId: selectedTableId,
        status: 'Preparing',
        step: 2,
        dishes: updatedPlaced.map((d) => ({
          name: d.name,
          quantity: d.quantity,
          category: d.category,
          price: d.price,
        })),
        placedAt: Date.now(),
        estimatedMinutes: 14,
        chefName: 'Chef Marco & Wok Team',
      };
      localStorage.setItem(`restroai_table_${selectedTableId}_kitchen_tracker`, JSON.stringify(trackerData));
    } catch (e) { }

    // Broadcast event to Servant Portal for instant automatic display
    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({














        type: 'ORDER_PLACED',
        tableId: selectedTableId,
        items: updatedPlaced,
        total: finalTotal,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) { }
    try {
      window.postMessage({
        type: 'ORDER_PLACED',
        tableId: selectedTableId,
        items: updatedPlaced,
      }, '*');
    } catch (e) { }

    setIsOrderPlacedSuccess(true);
    setCartItems([]);
  };

  const handlePaymentComplete = () => {
    const dishes = (placedTableOrders.length > 0 ? placedTableOrders : cartItems).map((i) => i.name);
    const paidItems = placedTableOrders.length > 0 ? placedTableOrders : cartItems;
    const paidAmount = finalTotal > 0 ? finalTotal : paidItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    setLastPaidDishes(dishes);
    setCartItems([]);
    setPlacedTableOrders([]);
    try {
      const paidRecord = {
        tableId: selectedTableId,
        items: paidItems,
        total: paidAmount,
        paidAt: Date.now(),
        status: 'PAID'
      };
      localStorage.setItem(`restroai_table_${selectedTableId}_paid_bill`, JSON.stringify(paidRecord));
      localStorage.removeItem(`restroai_table_${selectedTableId}_bill`);
      localStorage.removeItem(`restroai_table_${selectedTableId}_kitchen_tracker`);
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'TABLE_PAID',
        tableId: selectedTableId,
        paidBill: paidRecord,
        total: paidAmount,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) { }

    // Automatically trigger guest rating & servant tip pop-up right after paying bill
    setTimeout(() => {
      setIsBillPaymentModalOpen(false);
      setIsReviewModalOpen(true);
      soundService.playOrderSuccessChime();
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f6efe2] text-[#3a1a0e] font-sans select-none overflow-x-clip">

      {/* 1. Top Customer Experience Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-[#fff4dc]/95 backdrop-blur-md border-b-2 border-[#3a1a0e] shadow-[0_3px_0_#3a1a0e] px-4 py-2.5">
        <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">

          {/* Brand Name & Table Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setActiveView('3d');
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.delete('view');
                  return p;
                });
              }}
              className="flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity"
              title="Restaurant Home"
            >
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#d6361f]">
                RestroAI
              </span>
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setIsQRStandeeModalOpen(true);
              }}
              className="flex items-center space-x-1.5 bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] px-3 py-1.5 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] cursor-pointer transition-transform active:scale-95"
              title="Click to view & scan Table QR Standee Card"
            >
              <span className="font-semibold text-xs tracking-normal">
                Table #{selectedTableId}
              </span>
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white text-[#d6361f] text-[9px] font-black uppercase tracking-wider shadow-xs">
                QR
              </span>
            </button>
          </div>

          {/* Center Navigation Switcher: Home & Menu */}
          <div className="flex items-center bg-[#f0e4cf] p-1 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] shrink-0">
            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setActiveView('3d');
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.delete('view');
                  return p;
                });
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium tracking-normal transition-all cursor-pointer ${activeView === '3d'
                ? 'bg-[#d6361f] text-[#fff4dc] shadow-sm'
                : 'text-[#3a1a0e] hover:bg-[#e4d4ba]'
                }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setActiveView('menu');
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.set('view', 'menu');
                  return p;
                });
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium tracking-normal flex items-center gap-1.5 transition-all cursor-pointer ${activeView === 'menu'
                ? 'bg-[#d6361f] text-[#fff4dc] shadow-sm'
                : 'text-[#3a1a0e] hover:bg-[#e4d4ba]'
                }`}
            >
              <span>Menu</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-[#d6361f] text-[10px] font-black">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Actions: Call Servant, Cart Bag, Bill & Sound */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Live "Call Servant" Button */}
            <button
              onClick={() => {
                handleDirectCallServant();
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center gap-1.5 font-medium text-xs cursor-pointer active:translate-y-0.5 transition-all ${activeServiceCall && activeServiceCall.status === 'pending'
                ? 'bg-amber-400 text-[#3a1a0e] ring-2 ring-amber-500'
                : activeServiceCall && activeServiceCall.status === 'acknowledged'
                  ? 'bg-emerald-400 text-white shadow-md'
                  : 'bg-[#fff4dc] hover:bg-[#ffeac2] text-[#3a1a0e]'
                }`}
              title="Call Floor Waiter / Servant"
            >
              <span>
                {activeServiceCall && activeServiceCall.status === 'acknowledged'
                  ? 'Staff On Way'
                  : activeServiceCall && activeServiceCall.status === 'pending'
                    ? 'Called...'
                    : 'Call Waiter'}
              </span>
              {activeServiceCall && activeServiceCall.status !== 'resolved' && (
                <span className="w-2 h-2 rounded-full bg-[#d6361f]" />
              )}
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setIsCartOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3a1a0e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center gap-1.5 font-medium text-xs cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>Bag</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#d6361f] text-[#fff4dc] text-[10px] font-black animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {placedTableOrders.length > 0 && (
              <button
                onClick={() => {
                  soundService.playTactileClick('high');
                  setIsTrackerOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center gap-1.5 font-medium text-xs cursor-pointer active:translate-y-0.5 transition-colors"
                title="View Live Kitchen Cooking Tracker"
              >
                <span>Track Order</span>
              </button>
            )}

            <button
              onClick={() => {
                soundService.playTactileClick('mid');
                setBillPaymentInitialMode('full');
                setIsBillPaymentModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center gap-1.5 font-medium text-xs cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>View Bill & Pay</span>
              {activeBillItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#fff4dc] text-[#3a1a0e] text-[10px] font-black">
                  {activeBillItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setIsStaffModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#3a1a0e] hover:bg-black text-[#ffd45e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center gap-1.5 font-medium text-xs cursor-pointer active:translate-y-0.5 transition-all"
              title="Restaurant Staff & Kitchen Portals (Servants / KDS / Manager)"
            >
              <svg className="w-3.5 h-3.5 text-[#ffd45e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Staff</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area: 3D Showcase or Interactive Menu Feed */}
      {activeView === '3d' ? (
        <div className="relative w-full h-[calc(100vh-62px)] overflow-hidden bg-[#f6efe2]">
          {/* Fullscreen 3D Cartoon Restaurant WebGL Experience */}
          <iframe
            id="restaurant-3d-iframe"
            src={`/landing.html?table=${selectedTableId}`}
            title="Restaurant 3D Interactive Showcase"
            className="w-full h-full border-0 block"
            allow="autoplay"
          />

          {/* Floating Customer Welcome Banner over 3D Stage */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md bg-[#fff4dc]/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-3 border-[#3a1a0e] shadow-[4px_6px_0_#3a1a0e] text-center animate-card-bloom">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d6361f] text-[#fff4dc] text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm">
              <span>Table #{selectedTableId} Connected</span>
            </div>

            <h3 className="font-extrabold text-xl sm:text-2xl text-[#3a1a0e] tracking-tight">
              Ready to Order Delicious Food?
            </h3>
            <p className="text-xs text-slate-700 font-normal mt-1 leading-snug">
              Touch below to explore our stone-fired pizzas, handmade pasta, burgers, and drinks. Select your dishes and send your order straight to the chef!
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  soundService.playTactileClick('high');
                  setActiveView('menu');
                }}
                className="flex-1 py-3 px-3 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-medium text-xs sm:text-sm border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Order Now</span>
                <span className="text-sm">➔</span>
              </button>

              <button
                onClick={() => {
                  handleDirectCallServant();
                }}
                className={`py-3 px-3 rounded-2xl border-2 border-[#3a1a0e] font-medium text-xs shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 ${activeServiceCall && activeServiceCall.status !== 'resolved'
                  ? 'bg-amber-400 text-[#3a1a0e] ring-2 ring-amber-500'
                  : 'bg-amber-100 hover:bg-amber-200 text-[#3a1a0e]'
                  }`}
                title="Call Floor Waiter / Servant"
              >
                <span>Waiter</span>
              </button>

              <button
                onClick={() => {
                  soundService.playTactileClick('mid');
                  setIsBillPaymentModalOpen(true);
                }}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 text-[#3a1a0e] font-medium text-xs border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer"
                title="View Bill for Table"
              >
                Bill
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Render Full Interactive Discovery Menu Feed */
        <div className="relative w-full max-w-[1720px] mx-auto pb-12 animate-fade-in">
          {/* Quick bar to return to 3D Stage */}
          <div className="px-4 pt-3 flex items-center justify-between">
            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setActiveView('3d');
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.delete('view');
                  return p;
                });
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#d6361f] hover:text-[#ea3b21] bg-[#fff4dc] px-3.5 py-1.5 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>Back to Home</span>
              <span>➔</span>
            </button>
          </div>
          <DiscoveryMenuFeed
            onAddToCart={(item, qty) => {
              handleAddToCart(
                {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  category: item.category,
                },
                qty
              );
            }}
            cartCount={totalCartCount}
            cartItems={cartItems}
            placedTableOrders={placedTableOrders}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckoutOrder={handleCheckoutOrder}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenBillPayment={() => {
              setBillPaymentInitialMode('full');
              setIsBillPaymentModalOpen(true);
            }}
            onOpenSplitBill={() => {
              setBillPaymentInitialMode('split');
              setIsBillPaymentModalOpen(true);
            }}
            onOpenReview={() => setIsReviewModalOpen(true)}
            onOpenQRStandee={() => setIsQRStandeeModalOpen(true)}
            onOpenCallServant={() => handleDirectCallServant()}
            onOpenTracker={() => setIsTrackerOpen(true)}
            tableId={selectedTableId}
            onSelectTableId={setSelectedTableId}
            appliedCoupon={appliedCoupon}
            discountPercent={discountPercent}
            subtotal={subtotal}
            discountAmount={discountAmount}
            finalTotal={finalTotal}
            isOrderPlacedSuccess={isOrderPlacedSuccess}
            onDismissOrderSuccess={() => setIsOrderPlacedSuccess(false)}
          />
        </div>
      )}

      {/* 3. Slide-out Cart Drawer Modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#fff4dc] h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l-4 border-[#3a1a0e]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#3a1a0e]">
                <div>
                  <h3 className="font-bold text-xl text-[#3a1a0e] tracking-tight">
                    Your Table #{selectedTableId} Bag
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block">
                    {cartItems.length} Unique Dishes Selected
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border-2 border-[#3a1a0e] text-[#3a1a0e] font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white border-2 border-[#3a1a0e] flex items-center justify-center font-bold text-xs text-[#3a1a0e] mb-2">
                      EMPTY
                    </div>
                    <p className="text-sm font-bold text-[#3a1a0e]">Your bag is empty</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Touch any menu dish (+) to add to your order!
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-[#d6361f]">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Stepper (+ / -) */}
                      <div className="flex items-center space-x-1.5 bg-[#f6efe2] border border-[#3a1a0e] rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(item.name, -1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center cursor-pointer border border-[#3a1a0e]/40"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-xs font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.name, 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center cursor-pointer border border-[#3a1a0e]/40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bill Summary & Send to Kitchen */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t-2 border-[#3a1a0e] space-y-3">
                {/* Coupon Code Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={appliedCoupon}
                    onChange={(e) => setAppliedCoupon(e.target.value)}
                    placeholder="Enter Coupon (BELLACRAVE)"
                    className="flex-1 bg-white border-2 border-[#3a1a0e] rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (appliedCoupon.trim().toUpperCase() === 'BELLACRAVE') {
                        setDiscountPercent(30);
                        soundService.playSuccessAlert();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-[#3a1a0e] text-white text-xs font-medium uppercase tracking-wider hover:bg-black cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {/* Subtotals */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Chef Deal Discount ({discountPercent}%):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-300">
                    <span>Total Amount:</span>
                    <span className="text-[#d6361f]">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleCheckoutOrder}
                    className="w-full bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-medium text-sm py-3.5 px-4 rounded-2xl shadow-lg border-2 border-[#3a1a0e] flex items-center justify-center transition-all active:translate-y-0.5 cursor-pointer"
                  >
                    <span>Send Order to Chef (Table #{selectedTableId})</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsBillPaymentModalOpen(true);
                      soundService.playTactileClick('high');
                    }}
                    className="w-full bg-white hover:bg-slate-50 text-[#3a1a0e] font-medium text-xs py-3 px-4 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center transition-all active:translate-y-0.5 cursor-pointer"
                  >
                    <span>View & Pay Table #{selectedTableId} Bill</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Customer Bill & Pay Modal */}
      <CustomerBillPaymentModal
        isOpen={isBillPaymentModalOpen}
        onClose={() => setIsBillPaymentModalOpen(false)}
        tableId={selectedTableId}
        billItems={activeBillItems.map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          category: c.category,
        }))}
        appliedCoupon={appliedCoupon}
        discountPercent={discountPercent}
        onPaymentComplete={handlePaymentComplete}
        initialMode={billPaymentInitialMode}
        onOpenReview={() => setIsReviewModalOpen(true)}
      />

      {/* 5. Live "Call Servant" Bell Modal */}
      <CallServantModal
        isOpen={isCallServantOpen}
        onClose={() => setIsCallServantOpen(false)}
        tableId={selectedTableId}
        activeCall={activeServiceCall}
        onCallInitiated={(call) => setActiveServiceCall(call)}
        onCallCancelled={() => setActiveServiceCall(null)}
      />

      {/* 5. Order Placed Success Confirmation Modal */}
      {isOrderPlacedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#fff4dc] rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border-3 border-[#3a1a0e] animate-card-bloom">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-[2px_3px_0_#15803d]">
              ✓
            </div>
            <h3 className="text-2xl font-extrabold text-[#3a1a0e] tracking-tight">
              Order Confirmed!
            </h3>
            <p className="text-xs text-slate-700 font-normal mt-1.5 leading-relaxed">
              Your order for <strong>Table #{selectedTableId}</strong> has been received and is being freshly prepared by our chef.
            </p>
            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  setIsOrderPlacedSuccess(false);
                  setIsCartOpen(false);
                  setIsTrackerOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d6361f] to-amber-500 hover:from-[#ea3b21] hover:to-amber-600 text-[#fff4dc] font-medium text-sm border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
              >
                <span>Track Kitchen Cooking Live ➔</span>
              </button>
              <button
                onClick={() => {
                  setIsOrderPlacedSuccess(false);
                  setIsCartOpen(false);
                  setIsBillPaymentModalOpen(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#3a1a0e] font-medium text-xs border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
              >
                <span>Proceed to Pay Bill</span>
              </button>
              <button
                onClick={() => {
                  setIsOrderPlacedSuccess(false);
                  setIsCartOpen(false);
                  setActiveView('menu');
                }}
                className="w-full py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-[#3a1a0e] font-medium text-xs border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Order More Food for Table #{selectedTableId}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Floating Live Order Tracker Pill */}
      <FloatingOrderTrackerPill
        tableId={selectedTableId}
        hasPlacedOrders={placedTableOrders.length > 0}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* 7. Full Live Kitchen Order Tracker Modal */}
      <LiveKitchenTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        tableId={selectedTableId}
        placedOrders={placedTableOrders.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          category: p.category,
          price: p.price,
        }))}
        onOpenCallServant={() => setIsCallServantOpen(true)}
        onOpenBill={() => {
          setBillPaymentInitialMode('full');
          setIsBillPaymentModalOpen(true);
        }}
        onOpenSplitBill={() => {
          setBillPaymentInitialMode('split');
          setIsBillPaymentModalOpen(true);
        }}
        onOpenReview={() => setIsReviewModalOpen(true)}
        onOrderMore={() => setActiveView('menu')}
      />

      {/* 8. 1-Tap Guest Review & Servant Tip Modal */}
      <GuestReviewAndTipModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        tableId={selectedTableId}
        orderedDishes={lastPaidDishes.length > 0 ? lastPaidDishes : placedTableOrders.map((p) => p.name)}
      />

      {/* 9. Industry Table QR Standee Card Hub */}
      <TableQRStandeeModal
        isOpen={isQRStandeeModalOpen}
        onClose={() => setIsQRStandeeModalOpen(false)}
        tableId={selectedTableId}
        onSelectTable={setSelectedTableId}
      />

      {/* 10. Staff & Kitchen Team Portals Modal */}
      <StaffPortalsModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />
    </div>
  );
};

export default Restaurant3DLanding;
