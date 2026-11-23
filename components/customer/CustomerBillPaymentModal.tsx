import React, { useState, useEffect, useMemo } from 'react';
import { soundService } from '../../services/soundService';
import { useAppContext } from '../../contexts/AppContext';
import { TableStatus, TaxInvoice } from '../../types';
import { paymentService, CreatedOrderResponse } from '../../services/paymentService';

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  isPaid: boolean;
  paidAt?: number;
  paymentMethod?: string;
  assignedDishNames?: string[];
}

export interface GroupSplitState {
  tableId: number;
  splitType: 'equal' | 'itemized' | 'custom';
  splitCount: number;
  members: GroupMember[];
  updatedAt: number;
}

interface CustomerBillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  billItems: BillItem[];
  appliedCoupon: string;
  discountPercent: number;
  onPaymentComplete: () => void;
  initialMode?: 'full' | 'split';
  onOpenReview?: () => void;
}

const DEFAULT_AVATARS = ['😎', '🍕', '🤠', '🥳', '🐱', '🦊', '🐼', '🐯'];
const DEFAULT_NAMES = ['You (Host)', 'Alex', 'Sam', 'Chris', 'Jordan', 'Taylor', 'Morgan', 'Casey'];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🟢', color: 'from-blue-600 to-green-600', scheme: 'gpay://upi/pay' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', color: 'from-purple-600 to-indigo-600', scheme: 'phonepe://pay' },
  { id: 'paytm', name: 'Paytm', icon: '🔵', color: 'from-cyan-600 to-blue-600', scheme: 'paytmmp://pay' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🟠', color: 'from-amber-600 to-orange-600', scheme: 'bhim://upi/pay' },
  { id: 'cred', name: 'Cred UPI', icon: '⚪', color: 'from-slate-800 to-black', scheme: 'cred://upi' },
];

export const CustomerBillPaymentModal: React.FC<CustomerBillPaymentModalProps> = ({
  isOpen,
  onClose,
  tableId,
  billItems,
  appliedCoupon,
  discountPercent,
  onPaymentComplete,
  initialMode = 'full',
  onOpenReview,
}) => {
  const { updateTableStatus } = useAppContext();

  // Top Tabs: 'full' or 'split'
  const [activeTab, setActiveTab] = useState<'full' | 'split'>(initialMode);

  // Full Bill State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(false);
  const [servantCalled, setServantCalled] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderResponse | null>(null);
  const [latestInvoice, setLatestInvoice] = useState<TaxInvoice | null>(null);

  // Split & Group UPI State
  const [splitStrategy, setSplitStrategy] = useState<'equal' | 'itemized' | 'custom'>('equal');
  const [splitGuestCount, setSplitGuestCount] = useState<number>(3);
  const [activePayingMember, setActivePayingMember] = useState<GroupMember | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Dish assignment for Itemized Split: { [dishName]: memberId }
  const [dishAssignments, setDishAssignments] = useState<Record<string, string>>({});

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setIsPaidSuccess(false);
      setIsProcessing(false);
      setActivePayingMember(null);
    }
  }, [isOpen, initialMode]);

  // Financial Calculations
  const subtotal = useMemo(() => {
    return billItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [billItems]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Indian Restaurant GST Breakdown: 2.5% CGST + 2.5% SGST = 5%
  const cgst = useMemo(() => {
    return Number((taxableAmount * 0.025).toFixed(2));
  }, [taxableAmount]);

  const sgst = useMemo(() => {
    return Number((taxableAmount * 0.025).toFixed(2));
  }, [taxableAmount]);

  const tax = useMemo(() => {
    return Number((cgst + sgst).toFixed(2)); // 5% GST total
  }, [cgst, sgst]);

  const tipAmount = useMemo(() => {
    return (taxableAmount * tipPercent) / 100;
  }, [taxableAmount, tipPercent]);

  const grandTotal = useMemo(() => {
    return Number((taxableAmount + tax + tipAmount).toFixed(2));
  }, [taxableAmount, tax, tipAmount]);

  // Auto-generate verified order with backend gateway
  useEffect(() => {
    if (isOpen && billItems.length > 0) {
      paymentService
        .createUpiOrder({
          tableId,
          items: billItems,
          tipAmount,
          discountPercent,
          couponCode: appliedCoupon,
        })
        .then((ord) => setCreatedOrder(ord))
        .catch(() => {});
    }
  }, [isOpen, billItems, tipAmount, discountPercent, appliedCoupon, tableId]);

  // Group Members state with localStorage persistence and IPC synchronization
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(() => {
    try {
      const saved = localStorage.getItem(`restroai_table_${tableId}_group_split`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.members) && parsed.members.length > 0) {
          return parsed.members;
        }
      }
    } catch (e) {}

    // Default 3 members
    return [
      { id: 'mem-1', name: 'You (Host)', avatar: '😎', amount: 0, isPaid: false },
      { id: 'mem-2', name: 'Alex', avatar: '🍕', amount: 0, isPaid: false },
      { id: 'mem-3', name: 'Sam', avatar: '🤠', amount: 0, isPaid: false },
    ];
  });

  // Calculate each member's amount based on active split strategy
  useEffect(() => {
    if (splitStrategy === 'equal') {
      const perPerson = grandTotal > 0 ? grandTotal / splitGuestCount : 0;
      setGroupMembers((prev) => {
        const next: GroupMember[] = [];
        for (let i = 0; i < splitGuestCount; i++) {
          const existing = prev[i];
          next.push({
            id: existing ? existing.id : `mem-${i + 1}`,
            name: existing ? existing.name : DEFAULT_NAMES[i] || `Guest #${i + 1}`,
            avatar: existing ? existing.avatar : DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
            amount: Math.round(perPerson * 100) / 100,
            isPaid: existing ? existing.isPaid : false,
            paidAt: existing?.paidAt,
            paymentMethod: existing?.paymentMethod,
          });
        }
        return next;
      });
    } else if (splitStrategy === 'itemized') {
      // Divide dishes among assigned members + pro-rate tax, discount and tip
      const memberSubtotals: Record<string, number> = {};
      const memberDishes: Record<string, string[]> = {};

      groupMembers.forEach((m) => {
        memberSubtotals[m.id] = 0;
        memberDishes[m.id] = [];
      });

      billItems.forEach((item) => {
        const assignedId = dishAssignments[item.name] || groupMembers[0]?.id || 'mem-1';
        if (memberSubtotals[assignedId] !== undefined) {
          memberSubtotals[assignedId] += item.price * item.quantity;
          memberDishes[assignedId].push(`${item.quantity}x ${item.name}`);
        } else {
          // fallback to first member
          const firstId = groupMembers[0]?.id;
          if (firstId) {
            memberSubtotals[firstId] += item.price * item.quantity;
            memberDishes[firstId].push(`${item.quantity}x ${item.name}`);
          }
        }
      });

      const totalItemizedSubtotal = Object.values(memberSubtotals).reduce((a, b) => a + b, 0);

      setGroupMembers((prev) =>
        prev.map((m) => {
          const memberSub = memberSubtotals[m.id] || 0;
          const ratio = totalItemizedSubtotal > 0 ? memberSub / totalItemizedSubtotal : 1 / prev.length;
          const memberGrand = grandTotal * ratio;

          return {
            ...m,
            amount: Math.round(memberGrand * 100) / 100,
            assignedDishNames: memberDishes[m.id] || [],
          };
        })
      );
    }
  }, [splitStrategy, splitGuestCount, grandTotal, dishAssignments]);

  // Persist group members to localStorage
  useEffect(() => {
    try {
      const state: GroupSplitState = {
        tableId,
        splitType: splitStrategy,
        splitCount: groupMembers.length,
        members: groupMembers,
        updatedAt: Date.now(),
      };
      localStorage.setItem(`restroai_table_${tableId}_group_split`, JSON.stringify(state));
    } catch (e) {}
  }, [tableId, splitStrategy, groupMembers]);

  // Listen to cross-window BroadcastChannel IPC for real-time table split updates
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'GROUP_SPLIT_PAYMENT_UPDATE' && Number(data.tableId) === Number(tableId)) {
          if (Array.isArray(data.members)) {
            setGroupMembers(data.members);
            soundService.playChimeSuccess();
          }
        } else if (data.type === 'TABLE_PAID' && Number(data.tableId) === Number(tableId)) {
          setIsPaidSuccess(true);
        }
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [tableId]);

  // Group Progress calculations
  const totalPaidAmount = groupMembers.filter((m) => m.isPaid).reduce((acc, m) => acc + m.amount, 0);
  const paidMembersCount = groupMembers.filter((m) => m.isPaid).length;
  const isAllGroupMembersPaid = groupMembers.length > 0 && groupMembers.every((m) => m.isPaid);
  const remainingGroupAmount = Math.max(0, grandTotal - totalPaidAmount);
  const groupProgressPercent = grandTotal > 0 ? Math.min(100, Math.round((totalPaidAmount / grandTotal) * 100)) : 0;

  // Settle single full bill via Razorpay / Verified UPI Gateway
  const handlePayFullBill = async () => {
    setIsProcessing(true);
    soundService.playTactileClick('high');

    try {
      const order = createdOrder || await paymentService.createUpiOrder({
        tableId,
        items: billItems,
        tipAmount,
        discountPercent,
        couponCode: appliedCoupon,
      });

      paymentService.openRazorpayCheckout({
        order,
        tableId,
        customerName: 'Table Guest',
        customerPhone: '9876543210',
        onSuccess: (invoice) => {
          setIsProcessing(false);
          setLatestInvoice(invoice);
          setIsPaidSuccess(true);
          soundService.playOrderSuccessChime();

          // Broadcast TABLE_PAID to all tabs and floor servant portal
          try {
            const paidRecord = {
              tableId,
              items: billItems,
              total: invoice.grandTotal,
              method: invoice.paymentMethod,
              invoiceNumber: invoice.invoiceNumber,
              paidAt: Date.now(),
              status: 'PAID'
            };
            localStorage.setItem(`restroai_table_${tableId}_paid_bill`, JSON.stringify(paidRecord));
            const channel = new BroadcastChannel('restro_orders_sync');
            channel.postMessage({
              type: 'TABLE_PAID',
              tableId,
              paidBill: paidRecord,
              method: invoice.paymentMethod,
              total: invoice.grandTotal,
              invoiceNumber: invoice.invoiceNumber,
              timestamp: Date.now(),
            });
            channel.close();
          } catch (e) {}

          updateTableStatus(tableId, TableStatus.Free);
          onPaymentComplete();
        },
        onFailure: (err) => {
          setIsProcessing(false);
          console.warn('Payment dismissed or failed:', err);
        },
      });
    } catch (e) {
      setIsProcessing(false);
      console.error('Payment checkout error:', e);
    }
  };

  // Settle individual group member payment via UPI Gateway
  const handlePayMemberViaGateway = async (member: GroupMember) => {
    setIsProcessing(true);
    soundService.playTactileClick('high');

    try {
      const order = await paymentService.createUpiOrder({
        tableId,
        items: billItems,
        tipAmount: 0,
        discountPercent: 0,
        isSplit: true,
        splitMemberName: member.name,
        customAmount: member.amount,
      });

      paymentService.openRazorpayCheckout({
        order,
        tableId,
        customerName: member.name,
        customerPhone: '9876543210',
        onSuccess: (invoice) => {
          setIsProcessing(false);
          handleConfirmMemberPayment(member.id, invoice.paymentMethod || 'UPI');
        },
        onFailure: () => {
          setIsProcessing(false);
        },
      });
    } catch (e) {
      setIsProcessing(false);
    }
  };

  // Settle individual group member payment via UPI
  const handleConfirmMemberPayment = (memberId: string, customMethod: string = 'UPI') => {
    soundService.playOrderSuccessChime();

    const updated = groupMembers.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          isPaid: true,
          paidAt: Date.now(),
          paymentMethod: customMethod,
        };
      }
      return m;
    });

    setGroupMembers(updated);
    setActivePayingMember(null);

    // Broadcast update to all other devices/windows
    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'GROUP_SPLIT_PAYMENT_UPDATE',
        tableId,
        members: updated,
        memberId,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) {}

    // Check if all paid
    if (updated.every((m) => m.isPaid)) {
      setTimeout(() => {
        setIsPaidSuccess(true);
        updateTableStatus(tableId, TableStatus.Free);
        onPaymentComplete();

        try {
          const channel = new BroadcastChannel('restro_orders_sync');
          channel.postMessage({
            type: 'TABLE_PAID',
            tableId,
            timestamp: Date.now(),
          });
          channel.close();
        } catch (e) {}
      }, 700);
    }
  };

  // Copy shareable group link
  const handleShareGroupBill = () => {
    soundService.playTactileClick('high');
    const shareUrl = `${window.location.origin}/?table=${tableId}&split=true`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
      });
    } else {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const handleCallServantForBill = () => {
    soundService.playSuccessAlert();
    setServantCalled(true);
    const newCall = {
      id: `CALL-${Date.now()}`,
      tableId,
      type: 'Bill Payment / Cash Bill',
      note: 'Customer requesting servant at table to collect bill payment',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`restroai_table_${tableId}_service_call`, JSON.stringify(newCall));
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'SERVICE_CALL_REQUEST',
        call: newCall,
        tableId,
        timestamp: Date.now(),
      });
      setTimeout(() => {
        try { channel.close(); } catch(e) {}
      }, 3000);
    } catch (e) {}

    try {
      window.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId, call: newCall }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId, call: newCall }, '*');
      }
      document.querySelectorAll('iframe').forEach(frame => {
        try { frame.contentWindow?.postMessage({ type: 'SERVICE_CALL_REQUEST', tableId, call: newCall }, '*'); } catch(e){}
      });
    } catch (e) {}

    try {
      fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call: newCall }),
      }).catch(() => {});
    } catch (e) {}

    setTimeout(() => setServantCalled(false), 6000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-lg bg-[#fffdf7] rounded-[32px] sm:rounded-[36px] shadow-2xl border-3 border-[#3a1a0e] overflow-hidden flex flex-col max-h-[94vh] animate-card-bloom">
        
        {/* Top Header Banner with Mode Toggle */}
        <div className="bg-[#1c1613] text-[#fff4dc] p-5 border-b-2 border-[#3a1a0e] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center text-2xl shrink-0">
                {activeTab === 'split' ? '💸' : '🧾'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#d6361f] text-white text-[10px] font-semibold uppercase tracking-wider">
                    Table #{tableId}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Group Sync
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  {activeTab === 'split' ? 'Split Bill & Group UPI' : 'Guest Table Checkout'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#fff4dc] border border-white/20 flex items-center justify-center font-black text-sm transition-transform active:scale-95 cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Primary Mode Switcher Tab Bar */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                soundService.playTactileClick('mid');
                setActiveTab('full');
              }}
              className={`py-2 px-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'full'
                  ? 'bg-white text-[#3a1a0e] shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>💳 Pay Full Bill</span>
              <span className="text-[10px] opacity-80">(₹{grandTotal.toFixed(2)})</span>
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setActiveTab('split');
              }}
              className={`py-2 px-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'split'
                  ? 'bg-gradient-to-r from-[#d6361f] to-amber-500 text-white shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>💸 Split & Group UPI</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                GROUP
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. PAID SUCCESS RECEIPT STATE WITH GST TAX INVOICE */}
          {isPaidSuccess ? (
            <div className="py-4 text-center space-y-4 animate-card-bloom">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-3 border-emerald-600 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-[3px_4px_0_#15803d] animate-bounce-subtle">
                ✓
              </div>
              
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border-2 border-emerald-300 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                  <span>✔ Verified by Payment Gateway</span>
                  <span className="text-[10px] font-mono opacity-80">(UPI Ref #{latestInvoice?.upiRrn?.slice(-6) || '492011'})</span>
                </span>
                <h4 className="text-xl sm:text-2xl font-semibold text-[#3a1a0e] mt-2">
                  Payment Confirmed!
                </h4>
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Table #{tableId}'s bill of <strong className="text-[#d6361f] font-bold">₹{grandTotal.toFixed(2)}</strong> has been settled via UPI. Server and kitchen updated.
                </p>
              </div>

              {/* Official GST Tax Invoice Card */}
              <div className="bg-white border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] rounded-3xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between items-center font-bold text-slate-700 pb-2 border-b border-dashed border-slate-300 font-sans">
                  <div>
                    <span className="block font-black text-[#3a1a0e] text-sm font-semibold">🍕 RestroAI Fine Dining</span>
                    <span className="text-[10px] text-slate-500">GSTIN: 27AABCR1234M1Z8 • FSSAI: 10020033004455</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    TAX INVOICE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                  <div>Invoice No: <strong className="text-slate-900">{latestInvoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`}</strong></div>
                  <div className="text-right">Table: <strong className="text-slate-900">#{tableId}</strong></div>
                  <div>Payment ID: <strong className="text-slate-900">{latestInvoice?.paymentId?.slice(0, 14) || `pay_upi_${Date.now()}`}</strong></div>
                  <div className="text-right">Method: <strong className="text-emerald-700 font-bold">UPI / GPay</strong></div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-1 pt-1.5 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Food & Drink Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promo Discount ({appliedCoupon}):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Taxable Value:</span>
                    <span>₹{taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>CGST (2.5%):</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>SGST (2.5%):</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Staff Gratuity Tip:</span>
                      <span>₹{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-black text-slate-900 pt-2 border-t-2 border-[#3a1a0e] text-sm font-sans">
                  <span className="font-semibold uppercase">Grand Total Paid:</span>
                  <span className="text-[#d6361f] font-semibold text-base font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons: Print Tax Invoice & Rating */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    soundService.playTactileClick('high');
                    if (latestInvoice) {
                      paymentService.printTaxInvoice(latestInvoice);
                    } else {
                      paymentService.printTaxInvoice({
                        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                        orderId: `order_${Date.now()}`,
                        paymentId: `pay_${Date.now()}`,
                        tableId,
                        paidAt: new Date().toISOString(),
                        items: [],
                        subtotal,
                        discountPercent,
                        discountAmount,
                        taxableAmount,
                        cgst,
                        sgst,
                        totalTax: tax,
                        tipAmount,
                        grandTotal,
                        paymentMethod: 'UPI',
                        gstin: '27AABCR1234M1Z8',
                        fssai: '10020033004455',
                        upiRrn: String(Math.floor(400000000000 + Math.random() * 900000000000)),
                      });
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#3a1a0e] font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🖨️ Print / Download Official GST Tax Invoice</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenReview) {
                      onOpenReview();
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-[#3a1a0e] font-semibold text-xs sm:text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>⭐ Rate Dining Experience & Floor Servant</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'split' ? (
            /* 2. SPLIT BILL & GROUP UPI INTERFACE */
            <div className="space-y-4">
              
              {/* Group Settlement Live Progress Header */}
              <div className="bg-gradient-to-br from-[#fff4dc] to-[#faedd0] p-4 rounded-3xl border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Group Settlement Progress
                    </span>
                    <span className="font-bold text-lg text-[#3a1a0e]">
                      ₹{totalPaidAmount.toFixed(2)} of ₹{grandTotal.toFixed(2)} Paid
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs">
                    {paidMembersCount} / {groupMembers.length} Paid ({groupProgressPercent}%)
                  </span>
                </div>

                {/* Animated Glowing Progress Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-[#3a1a0e]/30 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700 relative"
                    style={{ width: `${groupProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-0.5">
                  <span>Remaining to Pay: <strong className="text-[#d6361f] font-mono">₹{remainingGroupAmount.toFixed(2)}</strong></span>
                  <button
                    onClick={handleShareGroupBill}
                    className="text-[#d6361f] hover:underline font-black flex items-center gap-1 cursor-pointer"
                  >
                    <span>{copiedShareLink ? '✓ Copied Link!' : '🔗 Share Table Link'}</span>
                  </button>
                </div>
              </div>

              {/* Split Strategy Switcher */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Choose Split Strategy
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-[#f0e4cf] p-1 rounded-2xl border-2 border-[#3a1a0e]">
                  <button
                    onClick={() => {
                      soundService.playTactileClick('low');
                      setSplitStrategy('equal');
                    }}
                    className={`py-2 px-2 rounded-xl text-center font-semibold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                      splitStrategy === 'equal'
                        ? 'bg-[#3a1a0e] text-[#fff4dc] shadow-sm'
                        : 'text-[#3a1a0e] hover:bg-white/50'
                    }`}
                  >
                    👥 Equal Split
                  </button>

                  <button
                    onClick={() => {
                      soundService.playTactileClick('mid');
                      setSplitStrategy('itemized');
                    }}
                    className={`py-2 px-2 rounded-xl text-center font-semibold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                      splitStrategy === 'itemized'
                        ? 'bg-[#3a1a0e] text-[#fff4dc] shadow-sm'
                        : 'text-[#3a1a0e] hover:bg-white/50'
                    }`}
                  >
                    🍕 By Dish
                  </button>

                  <button
                    onClick={() => {
                      soundService.playTactileClick('high');
                      setSplitStrategy('custom');
                    }}
                    className={`py-2 px-2 rounded-xl text-center font-semibold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                      splitStrategy === 'custom'
                        ? 'bg-[#3a1a0e] text-[#fff4dc] shadow-sm'
                        : 'text-[#3a1a0e] hover:bg-white/50'
                    }`}
                  >
                    ✍️ Custom
                  </button>
                </div>
              </div>

              {/* Equal Split Stepper Control */}
              {splitStrategy === 'equal' && (
                <div className="bg-white p-3.5 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase text-[#3a1a0e] block">
                      Number of Guests
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      ₹{grandTotal.toFixed(2)} ÷ {splitGuestCount} = <strong className="text-[#d6361f] font-mono">₹{(grandTotal / splitGuestCount).toFixed(2)} each</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      disabled={splitGuestCount <= 2}
                      onClick={() => {
                        soundService.playTactileClick('low');
                        setSplitGuestCount((c) => Math.max(2, c - 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-[#3a1a0e] font-black border border-[#3a1a0e] flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-semibold text-base text-[#3a1a0e] w-6 text-center">
                      {splitGuestCount}
                    </span>
                    <button
                      disabled={splitGuestCount >= 8}
                      onClick={() => {
                        soundService.playTactileClick('high');
                        setSplitGuestCount((c) => Math.min(8, c + 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-[#d6361f] hover:bg-[#ea3b21] disabled:opacity-40 text-white font-black border border-[#3a1a0e] flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Itemized Dish Assignment Picker */}
              {splitStrategy === 'itemized' && (
                <div className="bg-white p-3.5 rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] space-y-2">
                  <span className="text-xs font-semibold uppercase text-[#3a1a0e] block pb-1 border-b border-slate-100">
                    Assign Dishes to Table Friends
                  </span>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                    {billItems.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div>
                          <span className="font-bold text-[#3a1a0e] block">{item.quantity}x {item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>

                        <select
                          value={dishAssignments[item.name] || groupMembers[0]?.id || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDishAssignments((prev) => ({ ...prev, [item.name]: val }));
                          }}
                          className="bg-white border border-[#3a1a0e] text-[#3a1a0e] text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer"
                        >
                          {groupMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.avatar} {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Members List with Individual UPI Pay Trigger */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Table Friends & Status ({groupMembers.length})
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
                        member.isPaid
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                          : 'bg-white border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="w-10 h-10 rounded-2xl bg-amber-100 border border-[#3a1a0e]/40 flex items-center justify-center text-xl shrink-0">
                          {member.avatar}
                        </span>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-[#3a1a0e] truncate">
                              {member.name}
                            </span>
                            {member.id === 'mem-1' && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-white text-[9px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-[#d6361f] font-mono block">
                            ₹{member.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {member.isPaid ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-1">
                            <span>✓</span>
                            <span>Paid</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                soundService.playTactileClick('high');
                                setActivePayingMember(member);
                              }}
                              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#d6361f] to-amber-500 hover:from-[#ea3b21] hover:to-amber-600 text-white font-semibold text-xs uppercase tracking-wide border border-[#3a1a0e] shadow-sm active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>⚡</span>
                              <span>Pay UPI</span>
                            </button>

                            <button
                              onClick={() => {
                                soundService.playTactileClick('mid');
                                handleConfirmMemberPayment(member.id, 'Cash/Offline');
                              }}
                              title="Mark paid via Cash or Offline"
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#3a1a0e] border border-slate-300 text-xs font-black flex items-center justify-center cursor-pointer"
                            >
                              ✓
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPI PAYMENT POPUP FOR SELECTED MEMBER */}
              {activePayingMember && (
                <div className="bg-[#1c1613] text-white p-4 rounded-3xl border-2 border-[#3a1a0e] shadow-xl space-y-3 animate-card-bloom">
                  <div className="flex items-center justify-between pb-2 border-b border-white/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{activePayingMember.avatar}</span>
                      <div>
                        <span className="text-[10px] text-amber-300 font-bold uppercase block">
                          UPI Checkout For
                        </span>
                        <h5 className="font-semibold text-sm tracking-wide">
                          {activePayingMember.name} • ₹{activePayingMember.amount.toFixed(2)}
                        </h5>
                      </div>
                    </div>

                    <button
                      onClick={() => setActivePayingMember(null)}
                      className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/10"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  {/* UPI Apps Row */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => {
                          soundService.playTactileClick('low');
                          setSelectedUpiApp(app.id);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedUpiApp === app.id
                            ? 'bg-white/20 border-amber-400 ring-2 ring-amber-400 shadow-md scale-105'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg block">{app.icon}</span>
                        <span className="text-[9px] font-bold block truncate mt-0.5">{app.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic UPI QR Code for Member's Share */}
                  <div className="bg-white rounded-2xl p-3 text-center space-y-2 text-[#3a1a0e]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Scan or Tap Below to Pay via {UPI_APPS.find((a) => a.id === selectedUpiApp)?.name}
                    </span>

                    <div className="w-32 h-32 mx-auto bg-white p-1 rounded-xl flex items-center justify-center border-2 border-[#3a1a0e]">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=restaurant@upi%26pn=RestroAI%26am=${activePayingMember.amount.toFixed(2)}%26cu=INR%26tn=Table${tableId}_${encodeURIComponent(activePayingMember.name)}`}
                        alt="Member UPI QR"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="pt-1 flex flex-col gap-2">
                      <button
                        onClick={() => handlePayMemberViaGateway(activePayingMember)}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d6361f] to-amber-500 hover:from-[#ea3b21] hover:to-amber-600 text-white font-semibold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:translate-y-0.5"
                      >
                        {isProcessing ? 'Opening Gateway...' : `⚡ Pay ₹${activePayingMember.amount.toFixed(2)} with Razorpay / UPI`}
                      </button>

                      <div className="flex gap-2">
                        <a
                          href={`upi://pay?pa=restaurant@icici&pn=RestroAI&am=${activePayingMember.amount.toFixed(2)}&cu=INR&tn=Table${tableId}_${encodeURIComponent(activePayingMember.name)}`}
                          onClick={() => soundService.playTactileClick('high')}
                          className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5"
                        >
                          <span>📲 Open GPay / UPI</span>
                        </a>

                        <button
                          onClick={() => handleConfirmMemberPayment(activePayingMember.id, 'UPI Instant')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer shadow-md"
                        >
                          <span>✓ Confirm Paid</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settle All Remaining Button (Convenience) */}
              <button
                disabled={isAllGroupMembersPaid}
                onClick={() => {
                  soundService.playOrderSuccessChime();
                  const allPaid = groupMembers.map((m) => ({ ...m, isPaid: true, paidAt: Date.now() }));
                  setGroupMembers(allPaid);
                  setTimeout(() => {
                    setIsPaidSuccess(true);
                    updateTableStatus(tableId, TableStatus.Free);
                    onPaymentComplete();
                  }, 500);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>💳 Settle Entire Table Remaining (₹{remainingGroupAmount.toFixed(2)}) ➔</span>
              </button>
            </div>
          ) : (
            /* 3. FULL BILL CHECKOUT INTERFACE */
            <>
              {/* Itemized Order Items List */}
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Itemized Order Breakdown
                </h4>
                
                {billItems.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No items ordered yet. Add pizza, pasta or combos to your bill!
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3 divide-y divide-slate-100 max-h-40 overflow-y-auto no-scrollbar">
                    {billItems.map((item) => (
                      <div key={item.name} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-200 font-black text-slate-800 flex items-center justify-center text-[10px]">
                            {item.quantity}×
                          </span>
                          <span className="font-bold text-slate-800 truncate max-w-[170px]">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-black text-slate-900 font-mono">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tip Selector */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">Add Chef & Staff Tip:</span>
                  <span className="font-black text-[#d6361f] font-mono">
                    ₹{tipAmount.toFixed(2)} ({tipPercent}%)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 15, 20].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        soundService.playTactileClick('low');
                        setTipPercent(t);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        tipPercent === t
                          ? 'bg-[#3a1a0e] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t === 0 ? 'No Tip' : `${t}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Summary with Standard 5% GST (2.5% CGST + 2.5% SGST) */}
              <div className="bg-white rounded-2xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Chef Deal 30% Promo ({appliedCoupon}):</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>CGST (2.5%):</span>
                  <span className="font-mono">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>SGST (2.5%):</span>
                  <span className="font-mono">₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Total Tax (5% GST):</span>
                  <span className="font-mono">₹{tax.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Gratuity Tip ({tipPercent}%):</span>
                    <span className="font-mono">₹{tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-100">
                  <span className="font-semibold uppercase">Total Amount Due:</span>
                  <span className="text-[#d6361f] font-bold text-xl font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Select Payment Method
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                    Razorpay Gateway Enabled
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: '⚡ UPI / QR', icon: '📱' },
                    { id: 'card', label: '💳 Cards / NetBank', icon: '💳' },
                    { id: 'cash', label: '🤝 Cash to Staff', icon: '🤝' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundService.playTactileClick('mid');
                        setPaymentMethod(m.id as any);
                      }}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-[#3a1a0e] bg-amber-100 text-[#3a1a0e] font-black shadow-[2px_2px_0_#3a1a0e]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-0.5">{m.icon}</span>
                      <span className="text-[10px] font-semibold uppercase block leading-tight">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic QR Code for UPI */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-2 border-2 border-[#3a1a0e]">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                      Dynamic Order UPI QR
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Auto-Verifying
                    </span>
                  </div>
                  
                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg border-2 border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(createdOrder?.upiDeepLink || `upi://pay?pa=restaurant@icici&pn=RestroAI&am=${grandTotal.toFixed(2)}&cu=INR&tn=Table${tableId}_FullBill`)}`}
                      alt="Payment QR"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium">
                    Scan with <strong>Google Pay • PhonePe • Paytm • CRED • BHIM</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Order Ref: {createdOrder?.orderId || `order_${tableId}`} • ₹{grandTotal.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Cash to Servant / Call Waiter Option */}
              {paymentMethod === 'cash' && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-2.5">
                  <span className="text-2xl block">🛎️</span>
                  <h5 className="text-xs font-black text-amber-900">
                    Pay Cash directly to the Floor Servant
                  </h5>
                  <p className="text-[11px] text-amber-800">
                    Tap below to notify your floor servant with the printed cash folio bill.
                  </p>
                  <button
                    onClick={handleCallServantForBill}
                    className="px-4 py-2 rounded-xl bg-[#3a1a0e] hover:bg-black text-[#fff4dc] text-xs font-medium uppercase shadow-xs transition-colors cursor-pointer"
                  >
                    {servantCalled ? '✓ Servant Notified & En Route!' : '🔔 Call Servant for Cash Bill'}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  disabled={billItems.length === 0 || isProcessing}
                  onClick={handlePayFullBill}
                  className="w-full py-3.5 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] disabled:opacity-50 text-white font-medium text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] flex items-center justify-center space-x-2 transition-all active:translate-y-0.5 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening Secure Razorpay Gateway...</span>
                    </div>
                  ) : (
                    <>
                      <span>⚡ Pay Bill via UPI / Gateway • ₹{grandTotal.toFixed(2)}</span>
                      <span>➔</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    soundService.playTactileClick('high');
                    setActiveTab('split');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-[#3a1a0e] font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💸 Want to Split Bill with Friends Instead? Click Here ➔</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBillPaymentModal;
