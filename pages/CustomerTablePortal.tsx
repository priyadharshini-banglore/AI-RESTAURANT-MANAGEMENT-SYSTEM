import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { OrderItem, OrderStatus, MenuItem } from '../types';
import FeedbackForm from '../components/FeedbackForm';
import { soundService } from '../services/soundService';

const CustomerTablePortal: React.FC = () => {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const { orders, addOrder, menuItems } = useAppContext();
    
    const tableNum = Number(tableId) || 1;

    const [activeTab, setActiveTab] = useState<'menu' | 'tracker' | 'feedback'>('menu');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [quickFilter, setQuickFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [cart, setCart] = useState<{ [menuItemId: number]: number }>({});
    const [isOrderSuccess, setIsOrderSuccess] = useState<boolean>(false);
    const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

    // Dish Customizer Modal state
    const [customizingDish, setCustomizingDish] = useState<MenuItem | null>(null);
    const [customSpiceLevel, setCustomSpiceLevel] = useState<string>('Medium 🌶️');
    const [customPortion, setCustomPortion] = useState<string>('Standard Zomato Serving');
    const [customNote, setCustomNote] = useState<string>('');

    // Dynamic Categories from existing menuItems
    const categories = useMemo(() => {
        const cats = new Set(menuItems.map(m => m.category));
        return ['All', ...Array.from(cats)];
    }, [menuItems]);

    // Filter menu items by category + search + quick filter chips + dietary shield
    const filteredMenu = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  item.category.toLowerCase().includes(searchQuery.toLowerCase());
            
            let matchesQuick = true;
            if (quickFilter === 'spicy') {
                matchesQuick = item.name.toLowerCase().includes('biryani') || item.name.toLowerCase().includes('tandoori') || item.name.toLowerCase().includes('chicken');
            } else if (quickFilter === 'veg') {
                matchesQuick = item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('dal') || item.name.toLowerCase().includes('pulao') || item.name.toLowerCase().includes('naan');
            } else if (quickFilter === 'protein') {
                matchesQuick = item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('dal');
            } else if (quickFilter === 'sweet') {
                matchesQuick = item.category.toLowerCase().includes('dessert') || item.category.toLowerCase().includes('beverage') || item.name.toLowerCase().includes('jamun') || item.name.toLowerCase().includes('chai');
            }

            return matchesCat && matchesSearch && matchesQuick;
        });
    }, [menuItems, selectedCategory, searchQuery, quickFilter]);

    // Cart calculations
    const cartItemsList: { item: typeof menuItems[0]; quantity: number }[] = useMemo(() => {
        return Object.entries(cart)
            .filter(([_, qty]) => Number(qty) > 0)
            .map(([idStr, qty]) => {
                const item = menuItems.find(m => m.id === Number(idStr));
                return item ? { item, quantity: Number(qty) } : null;
            })
            .filter((x): x is { item: typeof menuItems[0]; quantity: number } => x !== null);
    }, [cart, menuItems]);

    const totalCartCount = cartItemsList.reduce((sum, x) => sum + x.quantity, 0);
    const totalCartPrice = cartItemsList.reduce((sum, x) => sum + x.item.price * x.quantity, 0);

    // Active orders for this table
    const tableOrders = useMemo(() => {
        return orders
            .filter(o => o.tableId === tableNum)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, tableNum]);

    const activeTableOrders = tableOrders.filter(o => o.status !== OrderStatus.Served);
    const totalTableBill = tableOrders.reduce((sum, o) => {
        return sum + o.items.reduce((itemSum, item) => {
            const mi = menuItems.find(m => m.id === item.menuItemId);
            return itemSum + (mi ? mi.price * item.quantity : 0);
        }, 0);
    }, 0);

    const handleAddToCart = (menuItemId: number, delta: number) => {
        if (delta > 0) soundService.playTactileClick('high');
        else soundService.playTactileClick('low');

        setCart(prev => {
            const current = prev[menuItemId] || 0;
            const next = Math.max(0, current + delta);
            const copy = { ...prev };
            if (next === 0) delete copy[menuItemId];
            else copy[menuItemId] = next;
            return copy;
        });
    };

    const handleConfirmCustomizedDish = () => {
        if (!customizingDish) return;
        soundService.playTactileClick('high');
        handleAddToCart(customizingDish.id, 1);
        setCustomizingDish(null);
        setCustomNote('');
    };

    const handleSendOrderToKitchen = () => {
        if (cartItemsList.length === 0) return;
        
        soundService.playOrderSuccessChime();

        const orderItems: OrderItem[] = cartItemsList.map(c => ({
            menuItemId: c.item.id,
            quantity: c.quantity
        }));

        addOrder(tableNum, orderItems);
        setCart({});
        setIsOrderSuccess(true);
        setLastPlacedOrderId(`KOT-${Date.now().toString().slice(-4)}`);
        
        setTimeout(() => {
            setIsOrderSuccess(false);
            setActiveTab('tracker');
        }, 2200);
    };

    const handleTabChange = (tab: 'menu' | 'tracker' | 'feedback') => {
        soundService.playTactileClick('mid');
        setActiveTab(tab);
    };

    const handleCategoryClick = (cat: string) => {
        soundService.playTactileClick('mid');
        setSelectedCategory(cat);
    };

    const handleQuickFilterClick = (filterKey: string) => {
        soundService.playTactileClick('high');
        setQuickFilter(prev => prev === filterKey ? '' : filterKey);
    };

    const isVegDish = (name: string) => {
        const lower = name.toLowerCase();
        return lower.includes('paneer') || lower.includes('dal') || lower.includes('veg') || lower.includes('naan') || lower.includes('pulao') || lower.includes('jamun') || lower.includes('chai');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-32 max-w-5xl mx-auto px-2 sm:px-4">
            {/* 📍 Zomato Crimson Red Hero Banner Strip with Apple Glass Overlay */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E23744] via-[#D32F2F] to-[#CB1A2B] text-white p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-red-400/30">
                <div className="flex items-center space-x-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md p-1 shadow-inner shrink-0 flex flex-col items-center justify-center border border-white/30">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none text-red-100">Table</span>
                        <span className="text-3xl font-black leading-none mt-0.5 font-mono text-white">{tableNum}</span>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/25 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                Seated • Dine-In Portal v5.0 Pro
                            </span>
                            <span className="text-xs text-red-100 font-mono hidden sm:inline">| Apple Glass Light OS</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1.5 leading-tight">
                            Digital Menu & Instant Order
                        </h1>
                        <p className="text-xs sm:text-sm text-red-100 mt-0.5 max-w-xl font-medium">
                            Explore dishes with Swiggy/Zomato veg/non-veg squares. Tap <strong className="text-white font-bold">CUSTOMIZE</strong> or <strong className="text-white font-bold">ADD</strong> to send orders directly to the wok!
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 relative z-10 w-full md:w-auto justify-end">
                    <button
                        onClick={() => { soundService.playTactileClick('mid'); navigate('/tables'); }}
                        className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider transition-all border border-white/30 shadow-md active:scale-95"
                    >
                        ← Back to Floor
                    </button>
                </div>
            </div>

            {/* Zomato Light Navigation Tabs */}
            <div className="flex space-x-2 border border-slate-200/80 bg-white/90 backdrop-blur-xl p-2 rounded-3xl shadow-sm">
                <button
                    onClick={() => handleTabChange('menu')}
                    className={`flex-1 py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
                        activeTab === 'menu'
                            ? 'bg-[#E23744] text-white shadow-lg shadow-red-500/25 scale-[1.01]'
                            : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                    <span className="text-base">🍽️</span>
                    <span>Menu Catalog</span>
                    {totalCartCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-white text-[#E23744] text-xs font-black flex items-center justify-center shadow-sm">
                            {totalCartCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('tracker')}
                    className={`flex-1 py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
                        activeTab === 'tracker'
                            ? 'bg-slate-900 text-white shadow-lg scale-[1.01]'
                            : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                    <span className="text-base">📦</span>
                    <span>Live Tracker</span>
                    {activeTableOrders.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-extrabold animate-pulse shadow-sm">
                            {activeTableOrders.length} Cooking
                        </span>
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('feedback')}
                    className={`flex-1 py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
                        activeTab === 'feedback'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.01]'
                            : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                    <span className="text-base">⭐</span>
                    <span>Rate Taste</span>
                </button>
            </div>

            {/* TAB 1: Digital Menu & Cart Ordering */}
            {activeTab === 'menu' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Quick Zomato Craving Filter Chips + Dietary Shield */}
                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-wider shrink-0 mr-1">
                            ⚡ Dietary Shields:
                        </span>
                        {[
                            { key: 'spicy', label: '🔥 Spicy & Aromatic', activeClass: 'bg-red-50 text-[#E23744] border-[#E23744]' },
                            { key: 'veg', label: '🟢 Pure Veg Only', activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-500' },
                            { key: 'protein', label: '💪 High Protein Shield', activeClass: 'bg-indigo-50 text-indigo-700 border-indigo-500' },
                            { key: 'sweet', label: '🍯 Dessert & Chai', activeClass: 'bg-amber-50 text-amber-700 border-amber-500' }
                        ].map(chip => (
                            <button
                                key={chip.key}
                                onClick={() => handleQuickFilterClick(chip.key)}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm ${
                                    quickFilter === chip.key
                                        ? `${chip.activeClass} scale-105 shadow-md`
                                        : 'bg-white/80 backdrop-blur-md text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Search & Horizontal Category Pills */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                                        selectedCategory === cat
                                            ? 'bg-[#E23744] text-white border-[#E23744] shadow-md scale-105'
                                            : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="🔍 Search dishes (e.g., Biryani)..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#E23744] transition-all font-medium placeholder:text-slate-400 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Apple-Zomato Dish Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredMenu.map(item => {
                            const veg = isVegDish(item.name);
                            const currentQty = cart[item.id] || 0;

                            return (
                                <div 
                                    key={item.id}
                                    onMouseEnter={() => soundService.playHoverTick()}
                                    className={`zomato-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                                        currentQty > 0 
                                            ? 'border-[#E23744] shadow-[0_8px_30px_rgba(226,55,68,0.12)] bg-rose-50/30' 
                                            : ''
                                    }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-start gap-3 mb-3">
                                            <div>
                                                {/* Zomato Pure Veg/Non-Veg Square Badge */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={veg ? 'veg-badge' : 'nonveg-badge'} title={veg ? 'Pure Vegetarian' : 'Non-Vegetarian'} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                        {veg ? 'Pure Veg • Fresh' : 'Non-Veg • Chef Spiced'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-mono font-bold text-slate-600">
                                                        ⚡ Neural AI Portion Shield
                                                    </span>
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{item.name}</h3>
                                                <span className="text-xs text-[#E23744] block mt-0.5 uppercase tracking-wider font-extrabold">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-right shrink-0 shadow-inner">
                                                <span className="text-[10px] text-slate-500 block uppercase font-extrabold leading-none">Price</span>
                                                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-none mt-1 block">
                                                    ₹{item.price}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed py-2.5 border-y border-slate-100 my-3 font-medium">
                                            {item.name.includes('Biryani') ? (
                                                "Slow-cooked aromatic basmati rice layered with tender marinated spices & saffron. Hearty Zomato portion size with zero artificial colors."
                                            ) : item.name.includes('Dal') ? (
                                                "Creamy black lentils simmered overnight with fresh butter and herbs. Consistently rated 5★ by guests today."
                                            ) : item.name.includes('Paneer') ? (
                                                "Succulent cottage cheese cubes grilled in our tandoor with capsicum and onions. Excellent high-protein starter."
                                            ) : (
                                                "Prepared fresh upon your order. Precision portioning guaranteed by RestroAI neural quality control."
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 mt-1">
                                        <button
                                            onClick={() => { soundService.playTactileClick('high'); setCustomizingDish(item); }}
                                            className="text-[11px] font-bold text-[#E23744] hover:text-red-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                                        >
                                            <span>⚙️ Customize Spice / Portion</span>
                                        </button>

                                        <div className="flex items-center space-x-2">
                                            {currentQty > 0 ? (
                                                <div className="flex items-center bg-[#E23744] text-white rounded-2xl p-1 shadow-md">
                                                    <button
                                                        onClick={() => handleAddToCart(item.id, -1)}
                                                        className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/30 font-black text-base flex items-center justify-center transition-transform active:scale-90"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3.5 text-sm font-black font-mono">{currentQty}</span>
                                                    <button
                                                        onClick={() => handleAddToCart(item.id, 1)}
                                                        className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/30 font-black text-base flex items-center justify-center transition-transform active:scale-90"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddToCart(item.id, 1)}
                                                    className="px-6 py-2.5 bg-rose-50 hover:bg-[#E23744] text-[#E23744] hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl border border-rose-200 hover:border-[#E23744] transition-all shadow-sm active:scale-90 flex items-center gap-1"
                                                >
                                                    <span>ADD +</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: Live Order Tracker & Bill */}
            {activeTab === 'tracker' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="zomato-card p-6 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Live Kitchen KDS Order Telemetry</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Track your dishes straight from Table #{tableNum} to our Chef's Wok terminal</p>
                            </div>
                            <button 
                                onClick={() => { soundService.playOrderSuccessChime(); alert(`Wait staff notified for Table #${tableNum}! A waiter is walking over to you right now.`); }}
                                className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-[#E23744] border border-rose-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                            >
                                <span>🔔 Call Waiter / Bill</span>
                            </button>
                        </div>

                        {tableOrders.length > 0 ? (
                            <div className="space-y-4">
                                {tableOrders.map(order => (
                                    <div key={order.id} className="p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200/80 space-y-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-mono text-sm font-extrabold text-[#E23744]">#{order.id}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                                    order.status === OrderStatus.Preparing
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-300 animate-pulse'
                                                        : order.status === OrderStatus.Ready
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    Status: {order.status}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {/* Progress stage tracker */}
                                        <div className="grid grid-cols-3 gap-2.5 pt-1">
                                            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                                                <span className="text-base block mb-0.5">📥</span>
                                                <span className="text-[10px] font-black text-indigo-700 uppercase block">1. Accepted</span>
                                            </div>
                                            <div className={`p-3 rounded-2xl text-center border ${
                                                order.status === OrderStatus.Preparing || order.status === OrderStatus.Ready
                                                    ? 'bg-purple-100 border-purple-300 text-purple-700 animate-pulse'
                                                    : 'bg-white border-slate-200 text-slate-400'
                                            }`}>
                                                <span className="text-base block mb-0.5">👨‍🍳</span>
                                                <span className="text-[10px] font-black uppercase block">2. Cooking in Wok</span>
                                            </div>
                                            <div className={`p-3 rounded-2xl text-center border ${
                                                order.status === OrderStatus.Ready || order.status === OrderStatus.Served
                                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                                    : 'bg-white border-slate-200 text-slate-400'
                                            }`}>
                                                <span className="text-base block mb-0.5">🍽️</span>
                                                <span className="text-[10px] font-black uppercase block">3. Ready for Table</span>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-200 space-y-2">
                                            {order.items.map((item, idx) => {
                                                const mi = menuItems.find(m => m.id === item.menuItemId);
                                                return (
                                                    <div key={idx} className="flex justify-between text-xs font-bold text-slate-700">
                                                        <span>{item.quantity}x {mi?.name || 'Dish Item'}</span>
                                                        <span className="font-mono text-slate-900 font-black">₹{(mi?.price || 0) * item.quantity}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Running Table Bill Summary */}
                                <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
                                    <div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                                            Total Running Table #{tableNum} Bill
                                        </span>
                                        <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
                                            ₹{totalTableBill.toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { soundService.playOrderSuccessChime(); alert(`Digital Bill statement prepared for Table #${tableNum}. Please pay via UPI QR or card when ready.`); }}
                                        className="w-full sm:w-auto px-7 py-3.5 bg-[#E23744] hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="text-base">💳</span>
                                        <span>Pay Digital Bill</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50/80 rounded-3xl border border-slate-200">
                                <span className="text-5xl block mb-3 animate-bounce">📦</span>
                                <h4 className="text-base font-black text-slate-900">No active KOT orders placed for Table #{tableNum} yet.</h4>
                                <p className="text-xs text-slate-500 mt-1">Go to the Digital Menu tab to pick dishes and launch your order!</p>
                                <button
                                    onClick={() => handleTabChange('menu')}
                                    className="mt-5 px-6 py-3 bg-[#E23744] hover:bg-red-600 text-white font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95"
                                >
                                    Browse Menu & Order →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: Post-Meal Feedback */}
            {activeTab === 'feedback' && (
                <div className="zomato-card p-6 sm:p-8 animate-fade-in">
                    <div className="text-center mb-6 pb-5 border-b border-slate-200">
                        <span className="text-4xl block mb-2 animate-pulse">⭐</span>
                        <h3 className="text-2xl font-black text-slate-900">Rate Your Table #{tableNum} Dining Experience</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
                            Your taste & portion ratings directly train our AI neural core to optimize dish portioning and eliminate plate waste.
                        </p>
                    </div>
                    <FeedbackForm tableId={tableNum} />
                </div>
            )}

            {/* ⚙️ Interactive Dish Customizer Modal */}
            {customizingDish && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
                        <div className="h-2 w-full bg-gradient-to-r from-[#E23744] via-[#D32F2F] to-amber-500" />
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black text-[#E23744] uppercase tracking-widest block">Neural Portion Shield Customizer</span>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{customizingDish.name} (₹{customizingDish.price})</h3>
                            </div>
                            <button onClick={() => setCustomizingDish(null)} className="p-2 bg-white rounded-xl border text-slate-500">✕</button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2.5">
                                    1. Select Preferred Spice & Chef Intensity:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Mild 🧈', 'Medium 🌶️', 'Extra Spicy 🔥'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => { soundService.playTactileClick('high'); setCustomSpiceLevel(level); }}
                                            className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                                                customSpiceLevel === level ? 'bg-[#E23744] text-white border-[#E23744] shadow-md' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2.5">
                                    2. AI Zero-Waste Portion Shield Option:
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { key: 'Standard Zomato Serving', desc: 'Hearty standard portion, ideal for 1-2 persons' },
                                        { key: 'Zero-Waste Mini Serving (-15% Portion)', desc: 'Perfect for light appetite. Earn +50 AI Eco Points!' },
                                        { key: 'Family Share Bowl (+40% Portion)', desc: 'Large sharing platter for group dining' }
                                    ].map(opt => (
                                        <div
                                            key={opt.key}
                                            onClick={() => { soundService.playTactileClick('mid'); setCustomPortion(opt.key); }}
                                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                                customPortion === opt.key ? 'bg-rose-50 border-[#E23744]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div>
                                                <span className="font-black text-slate-900 text-xs block">{opt.key}</span>
                                                <span className="text-[11px] text-slate-500">{opt.desc}</span>
                                            </div>
                                            {customPortion === opt.key && <span className="text-[#E23744] font-bold text-sm">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                                    3. Special Chef Instructions or Dietary Notes:
                                </label>
                                <input
                                    type="text"
                                    placeholder="E.g., Less oil, extra onions, no coriander..."
                                    value={customNote}
                                    onChange={e => setCustomNote(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
                            <button onClick={() => setCustomizingDish(null)} className="px-5 py-2.5 rounded-xl border bg-white text-xs font-bold text-slate-700">Cancel</button>
                            <button
                                onClick={handleConfirmCustomizedDish}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#E23744] to-[#CB1A2B] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                            >
                                Confirm & Add to Cart →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛒 FLOATING ZOMATO CRIMSON CHECKOUT TRAY */}
            {totalCartCount > 0 && (
                <div className="fixed bottom-4 left-3 right-3 max-w-4xl mx-auto z-40 bg-[#E23744] text-white rounded-3xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(226,55,68,0.4)] flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-2xl text-white shrink-0 shadow-inner animate-bounce">
                            🛒
                        </div>
                        <div>
                            <div className="flex items-center space-x-2.5">
                                <span className="text-lg font-black text-white tracking-tight">Table #{tableNum} Cart</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-black">
                                    {totalCartCount} Dishes
                                </span>
                            </div>
                            <span className="text-sm text-red-100 font-extrabold font-mono mt-0.5 block">
                                Total to pay: ₹{totalCartPrice.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={() => { soundService.playTactileClick('low'); setCart({}); }}
                            className="px-5 py-3.5 bg-black/20 hover:bg-black/30 text-white text-xs font-bold rounded-2xl transition-all border border-white/20"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSendOrderToKitchen}
                            className="flex-1 sm:flex-none px-8 py-3.5 bg-white text-[#E23744] hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>🚀 Place KOT Order to Kitchen</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Success Confetti Notification Modal */}
            {isOrderSuccess && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
                        <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-[#E23744] text-4xl flex items-center justify-center mx-auto mb-5 shadow-sm animate-bounce">
                            🎉
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Order Sent to Kitchen!</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed font-medium">
                            Your KOT order <strong className="text-[#E23744] font-mono font-black">{lastPlacedOrderId}</strong> from Table #{tableNum} is ringing right now on the Chef's Wok terminal!
                        </p>
                        <div className="mt-6 p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-inner">
                            Redirecting to Live Order Tracker... ⏳
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTablePortal;
