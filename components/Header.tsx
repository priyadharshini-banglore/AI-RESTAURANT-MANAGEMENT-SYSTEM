import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { WaiterIcon } from './icons/WaiterIcon';
import { ChefHatIcon } from './icons/ChefHatIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { useAppContext } from '../contexts/AppContext';
import { soundService } from '../services/soundService';
import QRCodeModal from './QRCodeModal';
import { TableQRStandeeModal } from './customer/TableQRStandeeModal';
import { Table, TableStatus } from '../types';

interface HeaderProps {
  onOpenMenuManager?: () => void;
  onOpenDashboardConfig?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenMenuManager, onOpenDashboardConfig }) => {
  const { isAdminAuthenticated, logoutAdmin, tables, orders, menuItems } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isServantPortal = location.pathname === '/tables';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [omniSearchQuery, setOmniSearchQuery] = useState('');
  const [showOmniResults, setShowOmniResults] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [activeCallCount, setActiveCallCount] = useState<number>(0);
  const [activeCallsList, setActiveCallsList] = useState<Array<{
    id: string;
    tableId: number;
    type: string;
    note?: string;
    status: string;
    staffName?: string;
    createdAt?: string;
  }>>([]);
  const [showCallsDropdown, setShowCallsDropdown] = useState<boolean>(false);

  // Monitor live service calls across all tables for floor alerts
  useEffect(() => {
    const checkActiveCalls = () => {
      const calls: Array<{
        id: string;
        tableId: number;
        type: string;
        note?: string;
        status: string;
        staffName?: string;
        createdAt?: string;
      }> = [];

      try {
        for (let i = 1; i <= 20; i++) {
          const callData = localStorage.getItem(`restroai_table_${i}_service_call`);
          if (callData) {
            const parsed = JSON.parse(callData);
            if (parsed && parsed.status !== 'resolved') {
              calls.push(parsed);
            }
          }
        }
      } catch (e) {}

      // Also check /api/state
      if (typeof fetch === 'function') {
        fetch('/api/state')
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.serviceCalls)) {
              data.serviceCalls.forEach((sc: any) => {
                if (sc && sc.status !== 'resolved' && !calls.some(c => c.tableId === Number(sc.tableId))) {
                  calls.push(sc);
                }
              });
            }
            setActiveCallsList(calls);
            setActiveCallCount(calls.length);
          })
          .catch(() => {
            setActiveCallsList(calls);
            setActiveCallCount(calls.length);
          });
      } else {
        setActiveCallsList(calls);
        setActiveCallCount(calls.length);
      }
    };

    checkActiveCalls();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = () => {
        checkActiveCalls();
      };
    } catch (e) {}

    const handleWindowMsg = (e: MessageEvent) => {
      if (e.data && (e.data.type === 'SERVICE_CALL_REQUEST' || e.data.type === 'SERVICE_CALL_ACKNOWLEDGED' || e.data.type === 'SERVICE_CALL_RESOLVED')) {
        checkActiveCalls();
      }
    };
    window.addEventListener('message', handleWindowMsg);

    const interval = setInterval(checkActiveCalls, 2000);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('message', handleWindowMsg);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleAcknowledgeCall = (tableId: number) => {
    soundService.playTactileClick('high');
    try {
      const call = activeCallsList.find(c => c.tableId === tableId) || {
        id: `CALL-${Date.now()}`,
        tableId,
        type: 'Assistance / Waiter',
        status: 'acknowledged',
        staffName: 'Floor Staff',
      };
      const updated = { ...call, status: 'acknowledged', staffName: 'Floor Staff' };
      localStorage.setItem(`restroai_table_${tableId}_service_call`, JSON.stringify(updated));

      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_ACKNOWLEDGED',
        tableId,
        call: updated,
        staffName: 'Floor Staff',
        timestamp: Date.now(),
      });
      setTimeout(() => { try { channel.close(); } catch(e){} }, 3000);

      window.postMessage({ type: 'SERVICE_CALL_ACKNOWLEDGED', tableId, call: updated }, '*');
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_ACKNOWLEDGED', tableId, call: updated }, '*'); } catch(e){}
      });

      fetch('/api/service-calls/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, status: 'acknowledged', staffName: 'Floor Staff' }),
      }).catch(() => {});
    } catch(e) {}
  };

  const handleResolveCall = (tableId: number) => {
    soundService.playTactileClick('low');
    try {
      localStorage.removeItem(`restroai_table_${tableId}_service_call`);

      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_RESOLVED',
        tableId,
        timestamp: Date.now(),
      });
      setTimeout(() => { try { channel.close(); } catch(e){} }, 3000);

      window.postMessage({ type: 'SERVICE_CALL_RESOLVED', tableId }, '*');
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_RESOLVED', tableId }, '*'); } catch(e){}
      });

      fetch('/api/service-calls/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, status: 'resolved' }),
      }).catch(() => {});
    } catch(e) {}
  };

  const handleFocusTableOnMap = (tableId: number) => {
    soundService.playTactileClick('high');
    setShowCallsDropdown(false);
    navigate('/tables');
    setTimeout(() => {
      window.postMessage({ type: 'FOCUS_TABLE', tableId }, '*');
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'FOCUS_TABLE', tableId }, '*'); } catch(e){}
      });
    }, 200);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-xl text-xs font-medium tracking-normal transition-all duration-200 relative group cursor-pointer ${
      isActive
        ? 'bg-[#d6361f] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] scale-[1.02]'
        : 'text-[#3a1a0e] hover:text-[#d6361f] hover:bg-[#ffeac2] border-2 border-transparent'
    }`;

  // Omni search filtering
  const searchResults = () => {
    if (!omniSearchQuery.trim()) return [];
    const query = omniSearchQuery.toLowerCase();
    
    const matchedTables = tables.filter(t => `table ${t.id}`.includes(query) || t.status.toLowerCase().includes(query)).map(t => ({
      type: 'Table',
      title: `Table #${t.id} (${t.status})`,
      subtitle: 'Click to open floor map selection',
      action: () => { navigate('/tables'); setShowOmniResults(false); }
    }));

    const matchedDishes = menuItems.filter(m => m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)).map(m => ({
      type: 'Dish',
      title: `${m.name} (₹${m.price})`,
      subtitle: `Category: ${m.category} • Neural Portion Shield`,
      action: () => { navigate('/menu/1'); setShowOmniResults(false); }
    }));

    const matchedOrders = orders.filter(o => o.status.toLowerCase().includes(query) || `order ${o.id}`.includes(query)).map(o => ({
      type: 'Order',
      title: `KOT #${o.id} - Table ${o.tableId}`,
      subtitle: `Status: ${o.status} • Wok Priority Queue`,
      action: () => { navigate('/kitchen'); setShowOmniResults(false); }
    }));

    return [...matchedTables, ...matchedDishes, ...matchedOrders].slice(0, 5);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-[#fff4dc]/95 backdrop-blur-xl border-b-2 border-[#3a1a0e] shadow-[0_3px_0_#3a1a0e] mb-4 transition-all duration-300 font-sans select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Logo & Brand Status */}
          <div className="flex items-center space-x-5 shrink-0">
            <div className="flex items-center space-x-2.5 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-2xl bg-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center font-extrabold text-white text-xl transition-transform group-hover:scale-105">
                R
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#3a1a0e] font-extrabold text-xl sm:text-2xl tracking-tight leading-none">RestroAI</span>
                </div>
                <span className="text-[10px] text-[#7a5843] font-semibold uppercase tracking-wider block mt-0.5">
                  Artisanal Dining OS
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:block">
              <div className="flex items-center space-x-1 bg-[#f0e4cf] p-1 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e]">

                <NavLink to="/tables" className={navLinkClass}>
                  <WaiterIcon className="h-4 w-4 mr-1.5" />
                  Floor Map
                  {activeCallCount > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs border border-amber-500">
                      <span>🛎️</span>
                      <span>{activeCallCount}</span>
                    </span>
                  )}
                </NavLink>
                {!isServantPortal && (
                  <>
                    <NavLink to="/kitchen" className={navLinkClass}>
                      <ChefHatIcon className="h-4 w-4 mr-1.5" />
                      Kitchen KDS
                    </NavLink>
                    <NavLink to="/dashboard" className={navLinkClass}>
                      <DashboardIcon className="h-4 w-4 mr-1.5" />
                      Analytics
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Executive Omni-Search Center */}
          <div className="hidden md:block flex-1 max-w-sm relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tables, dishes, or KOT orders..."
                value={omniSearchQuery}
                onFocus={() => setShowOmniResults(true)}
                onChange={(e) => { setOmniSearchQuery(e.target.value); setShowOmniResults(true); }}
                className="w-full bg-[#fffdf7] hover:bg-white border-2 border-[#3a1a0e] focus:border-[#d6361f] rounded-2xl pl-10 pr-4 py-2 text-xs text-[#3a1a0e] placeholder:text-[#8a7263] font-medium transition-all focus:outline-none shadow-[2px_2px_0_#3a1a0e]"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 flex items-center">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {omniSearchQuery && (
                <button
                  onClick={() => { setOmniSearchQuery(''); setShowOmniResults(false); }}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Omni Search Results Popup */}
            {showOmniResults && omniSearchQuery.trim() && (
              <div className="absolute left-0 right-0 top-12 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-in p-2">
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                  <span>Quick Search Results</span>
                  <span>{searchResults().length} matches</span>
                </div>
                {searchResults().length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {searchResults().map((res, i) => (
                      <div
                        key={i}
                        onClick={() => { soundService.playTactileClick('high'); res.action(); }}
                        className="p-3 hover:bg-rose-50/50 rounded-2xl cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-600 uppercase">{res.type}</span>
                            <span className="text-xs font-black text-slate-900 group-hover:text-[#E23744] transition-colors">{res.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{res.subtitle}</span>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-bold">
                    No results found for "{omniSearchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Tools & Mobile App Install */}
          <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
            {isAdminAuthenticated && (
              <button
                onClick={logoutAdmin}
                className="px-3.5 py-2 rounded-xl bg-[#fff4dc] hover:bg-[#ffeac2] border-2 border-[#3a1a0e] text-[#d6361f] font-medium text-xs transition-all flex items-center gap-1 shadow-[2px_2px_0_#3a1a0e] active:scale-95 cursor-pointer"
                title="Lock Admin Session"
              >
                <span>Lock</span>
              </button>
            )}

            {/* 🛎️ Active Call Servant Alert Pill & Action Popover */}
            {activeCallCount > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    soundService.playTactileClick('high');
                    setShowCallsDropdown(!showCallsDropdown);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#3a1a0e] font-medium text-xs shadow-[2px_2px_0_#3a1a0e] transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#3a1a0e] active:scale-95"
                  title="Click to view and respond to calling tables"
                >
                  <span className="text-sm">🛎️</span>
                  <span>{activeCallCount} Table{activeCallCount > 1 ? 's' : ''} Calling!</span>
                </button>

                {showCallsDropdown && (
                  <div className="absolute right-0 top-14 w-[360px] sm:w-[410px] max-w-[95vw] bg-[#fffdf7] rounded-3xl border-3 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] overflow-hidden z-50 animate-fade-in p-4 font-sans">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-dashed border-[#3a1a0e]">
                      <span className="text-sm font-semibold text-[#3a1a0e] flex items-center gap-2 whitespace-nowrap">
                        <span className="text-base">🛎️</span> Calling Tables ({activeCallsList.length})
                      </span>
                      <button
                        onClick={() => setShowCallsDropdown(false)}
                        className="w-7 h-7 rounded-full bg-[#f0e4cf] hover:bg-[#ffeac2] border border-[#3a1a0e] text-[#3a1a0e] text-xs font-black flex items-center justify-center cursor-pointer transition-colors"
                        title="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {activeCallsList.map((call) => (
                        <div
                          key={call.tableId}
                          className="bg-[#fff4dc] border-2 border-[#3a1a0e] rounded-2xl p-3.5 shadow-[2px_2px_0_#3a1a0e]"
                        >
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className="font-semibold text-base text-[#3a1a0e] whitespace-nowrap">
                              Table #{call.tableId}
                            </span>
                            <span
                              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1.5 shrink-0 border border-[#3a1a0e] ${
                                call.status === 'acknowledged'
                                   ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-300 text-amber-950'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${call.status === 'acknowledged' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                              {call.status === 'acknowledged' ? 'Staff Walking' : 'Calling'}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-[#3a1a0e] leading-snug">
                            {call.type}
                          </p>
                          {call.note && (
                            <p className="text-xs text-[#7a5843] italic mt-0.5 font-normal">
                              "{call.note}"
                            </p>
                          )}

                          <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-[#3a1a0e]/20">
                            {call.status === 'pending' && (
                              <button
                                onClick={() => handleAcknowledgeCall(call.tableId)}
                                className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-500 text-[#3a1a0e] font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:scale-95 text-center whitespace-nowrap"
                              >
                                On My Way
                              </button>
                            )}
                            <button
                              onClick={() => handleResolveCall(call.tableId)}
                              className="flex-1 py-2 px-3 bg-[#059669] hover:bg-[#047857] text-[#fff4dc] font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:scale-95 text-center whitespace-nowrap"
                            >
                              Done ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedTableForQR(tables[0] || { id: 1, status: TableStatus.Free, chairs: 4 })}
              className="px-3.5 py-2 rounded-xl bg-[#f0e4cf] hover:bg-[#ffeac2] border-2 border-[#3a1a0e] text-[#3a1a0e] font-medium text-xs transition-all flex items-center gap-1.5 shadow-[2px_2px_0_#3a1a0e] active:scale-95 cursor-pointer"
              title="View & Print Table QR Codes for Customer Self-Ordering"
            >
              <span>Table QRs</span>
            </button>
          </div>

          {/* Mobile Hamburger Controls */}
          <div className="flex items-center space-x-2 lg:hidden">
            {activeCallCount > 0 && (
              <button
                onClick={() => {
                  soundService.playTactileClick('high');
                  if (activeCallsList.length === 1) {
                    handleFocusTableOnMap(activeCallsList[0].tableId);
                  } else {
                    setShowCallsDropdown(!showCallsDropdown);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-900 font-black text-[11px] border border-amber-500 shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>🛎️</span>
                <span>{activeCallCount}</span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-slate-100 inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 border border-slate-200 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pt-3 pb-4 space-y-2 border-t border-slate-200 mt-2 animate-fade-in" id="mobile-menu">
            <div className="pb-2">
              <input
                type="text"
                placeholder="Quick search..."
                value={omniSearchQuery}
                onChange={(e) => setOmniSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <NavLink to="/tables" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              <WaiterIcon className="h-4 w-4 mr-2" />
              Table Floor Map
              {activeCallCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase">
                  🛎️ {activeCallCount} Calling
                </span>
              )}
            </NavLink>
            {!isServantPortal && (
              <>
                <NavLink to="/kitchen" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                  <ChefHatIcon className="h-4 w-4 mr-2" />
                  Kitchen KDS
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                  <DashboardIcon className="h-4 w-4 mr-2" />
                  Executive Analytics
                </NavLink>
              </>
            )}

            {isAdminAuthenticated && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => { setIsMenuOpen(false); logoutAdmin(); }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs"
                >
                  Lock Admin
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => { setIsMenuOpen(false); setSelectedTableForQR(tables[0] || { id: 1, status: TableStatus.Free, chairs: 4 }); }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📱 Table QRs</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowInstallGuide(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E23744] to-[#CB1A2B] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-red-500/25 font-black text-white animate-bounce">
              📲
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Install RestroAI Mobile App</h3>
            <p className="text-xs text-slate-500 mt-2">
              Run RestroAI in <strong className="text-[#E23744] font-bold">100% Full-Screen Standalone Mode</strong> with home screen icon & zero browser address bar!
            </p>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xl bg-[#E23744] text-white font-bold flex items-center justify-center shrink-0 shadow-sm">1</span>
                <span>Tap the <strong className="text-slate-900">Share Icon</strong> (<span className="text-[#E23744] font-bold">⬆️ or 3 dots ⋮</span>) in your phone browser menu.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xl bg-[#E23744] text-white font-bold flex items-center justify-center shrink-0 shadow-sm">2</span>
                <span>Scroll down and select <strong className="text-slate-900 font-bold">'Add to Home Screen ➕'</strong> or <strong className="text-slate-900 font-bold">'Install App'</strong>.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-xl bg-[#E23744] text-white font-bold flex items-center justify-center shrink-0 shadow-sm">3</span>
                <span>Tap <strong className="text-slate-900 font-bold">'Add'</strong> in the top corner. RestroAI will launch instantly as a native app on your home screen!</span>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-[#E23744] to-[#CB1A2B] text-white font-bold text-xs rounded-2xl shadow-md transition-transform active:scale-95"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      </nav>

      {/* Table QR Standee Card Generator Modal */}
      <TableQRStandeeModal
        isOpen={Boolean(selectedTableForQR)}
        onClose={() => setSelectedTableForQR(null)}
        tableId={selectedTableForQR?.id || 1}
      />
    </>
  );
};

export default Header;
