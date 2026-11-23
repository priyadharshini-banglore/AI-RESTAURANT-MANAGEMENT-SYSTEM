import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  ChefHat,
  Monitor,
  FileText,
  Users,
  CheckSquare,
  ShoppingCart,
  Wifi,
  WifiOff,
  ShoppingBag,
  BarChart3,
  Coffee,
  Flame,
  Cloud,
  Wine,
  Building,
  ArrowRight,
  PhoneCall,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Quote,
  Printer,
  Plus,
  ArrowUp
} from 'lucide-react';

export const RestroLandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Selected product tab in ecosystem
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<
    'POS' | 'Invoice' | 'Payroll' | 'Stepwise' | 'Purchase'
  >('POS');

  // Interactive Mini POS Puncher in Hero
  const [activeTable, setActiveTable] = useState<number>(3);
  const [mockBillItems, setMockBillItems] = useState([
    { id: 1, name: 'Thick Cold Coffee w/ Ice Cream', price: 179, qty: 1, img: '/images/cold_coffee.jpg' },
    { id: 2, name: 'Stone-Fired Pepperoni Pizza', price: 399, qty: 1, img: '/images/pizza.jpg' },
    { id: 3, name: 'Crispy Zinger Chicken Burger', price: 299, qty: 1, img: '/images/zinger_combo.jpg' },
  ]);
  const [isKOTPrinted, setIsKOTPrinted] = useState(false);

  const subtotal = mockBillItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const handleAddDish = (name: string, price: number, img: string) => {
    setMockBillItems((prev) => {
      const exist = prev.find((i) => i.name === name);
      if (exist) {
        return prev.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: Date.now(), name, price, qty: 1, img }];
    });
  };

  const handlePrintKOT = () => {
    setIsKOTPrinted(true);
    setTimeout(() => setIsKOTPrinted(false), 2400);
  };

  // Demo Booking Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    city: '',
    pincode: '',
    businessName: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['POS', 'Invoice']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const [isApproved, setIsApproved] = useState<boolean>(() => {
    try {
      return localStorage.getItem('restroai_customer_approved') === 'true';
    } catch {
      return false;
    }
  });

  const productPills = ['POS', 'Invoice', 'Payroll', 'Stepwise', 'Purchase'];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleProduct = (prod: string) => {
    setSelectedProducts((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
    if (errors.products) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.products;
        return next;
      });
    }
  };

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{4,10}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Enter a valid postal pincode';
    }
    if (!formData.businessName.trim()) {
      errs.businessName = 'Restaurant or business name is required';
    }
    if (selectedProducts.length === 0) {
      errs.products = 'Please select at least one product';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const submission = {
        id: `RESTRO-REG-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        countryCode: formData.countryCode,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        businessName: formData.businessName.trim(),
        interestedProducts: selectedProducts,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      try {
        const existing = JSON.parse(
          localStorage.getItem('restroai_restaurant_registrations') || '[]'
        );
        existing.unshift(submission);
        localStorage.setItem('restroai_restaurant_registrations', JSON.stringify(existing));
      } catch {}

      setSubmittedData(submission);
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 800);
  };

  const handleDeveloperApprove = () => {
    try {
      localStorage.setItem('restroai_customer_approved', 'true');
      setIsApproved(true);
      if (submittedData) {
        setSubmittedData({ ...submittedData, status: 'approved' });
      }
    } catch {}
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f6efe2] text-[#3a1a0e] font-sans selection:bg-[#d6361f] selection:text-[#fff4dc] overflow-x-hidden">
      
      {/* 1. TOP STICKY RESTRO NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#fffdf9]/95 backdrop-blur-md border-b-2 border-[#3a1a0e]/15 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo with Warm Culinary Icon */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d6361f] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center font-black text-xl">
              🍳
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl text-[#3a1a0e] tracking-tight leading-none block">
                RESTRO<span className="text-[#d6361f]">.AI</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                Gourmet Dining & POS OS
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-bold text-[#3a1a0e]">
            <button onClick={() => scrollTo('specials')} className="hover:text-[#d6361f] transition-colors cursor-pointer">
              Menu Specials
            </button>
            <button onClick={() => scrollTo('features')} className="hover:text-[#d6361f] transition-colors cursor-pointer">
              POS Features
            </button>
            <button onClick={() => scrollTo('ecosystem')} className="hover:text-[#d6361f] transition-colors cursor-pointer">
              Ecosystem
            </button>
            <button onClick={() => scrollTo('outlets')} className="hover:text-[#d6361f] transition-colors cursor-pointer">
              Outlets
            </button>
            <button onClick={() => scrollTo('demo-booking')} className="text-[#d6361f] font-extrabold hover:underline cursor-pointer">
              Book a Demo
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/restaurant')}
              className="px-4 py-2 rounded-xl bg-[#fff4dc] hover:bg-[#ffeac2] text-[#3a1a0e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] font-bold text-xs uppercase tracking-wide transition-all active:translate-y-0.5 cursor-pointer hidden sm:flex items-center space-x-1.5"
            >
              <span>Explore Live Restaurant</span>
              <span>➔</span>
            </button>

            <button
              onClick={() => scrollTo('demo-booking')}
              className="px-5 py-2.5 rounded-xl bg-[#d6361f] hover:bg-[#b52814] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] font-extrabold text-xs uppercase tracking-wider transition-all active:translate-y-0.5 cursor-pointer"
            >
              Book Free Demo
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION — APPETIZING RESTRO THEME + INTERACTIVE POS SIMULATOR */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Warm Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#ffd45e]/30 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-[#d6361f]/15 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Rich Restro Headline & Call to Action */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#ffd45e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] text-xs font-black uppercase tracking-wider text-[#3a1a0e]">
                <span>🔥 CRAFTED FOR GOURMET RESTAURANTS & SMART CAFES</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#3a1a0e] tracking-tight leading-[1.08]">
                CRISPY. JUICY. <br />
                <span className="text-[#d6361f] underline decoration-[#ffd45e] decoration-wavy">
                  STONE-BAKED.
                </span> <br />
                SMART RESTRO OS.
              </h1>

              <p className="text-base sm:text-lg text-[#3a1a0e]/80 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                The all-in-one culinary platform designed for food businesses. Delight your guests with
                lightning QR table ordering, 3-click fast POS billing, live kitchen KDS routing, and
                Swiggy/Zomato aggregator sync.
                <strong className="block text-[#3a1a0e] font-bold mt-1">
                  Works 100% offline so your kitchen and billing never stop.
                </strong>
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => scrollTo('demo-booking')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#d6361f] hover:bg-[#b52814] text-[#fff4dc] border-3 border-[#3a1a0e] shadow-[4px_5px_0_#3a1a0e] font-black text-sm uppercase tracking-wider transition-all active:translate-y-1 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Book a Free Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/restaurant')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#fff4dc] hover:bg-[#ffeac2] text-[#3a1a0e] border-3 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] font-black text-sm uppercase tracking-wider transition-all active:translate-y-1 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Open Customer Dine-In Menu</span>
                  <span>🍽️</span>
                </button>
              </div>

              {/* Trust Badge Counters */}
              <div className="pt-6 border-t-2 border-[#3a1a0e]/15 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#3a1a0e]">75,000+</span>
                  <p className="text-xs font-bold text-slate-600">Tables Served Daily</p>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#d6361f]">4.9 ★</span>
                  <p className="text-xs font-bold text-slate-600">Guest Review Rating</p>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#3a1a0e]">100%</span>
                  <p className="text-xs font-bold text-slate-600">Offline Reliability</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Restro POS & Dish Counter Terminal */}
            <div className="lg:col-span-6">
              <div className="bg-[#fffdf9] rounded-3xl border-3 border-[#3a1a0e] shadow-[6px_8px_0_#3a1a0e] overflow-hidden">
                
                {/* Terminal Header */}
                <div className="bg-[#3a1a0e] px-5 py-3.5 flex items-center justify-between text-[#fff4dc] text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#d6361f] animate-ping" />
                    <span className="font-extrabold uppercase tracking-wider">
                      Live Restaurant Billing Station
                    </span>
                  </div>
                  <span className="bg-[#ffd45e] text-[#3a1a0e] font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    Offline Sync Active
                  </span>
                </div>

                {/* Table Picker Strip */}
                <div className="bg-[#fff4dc] px-4 py-2.5 border-b-2 border-[#3a1a0e] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-[#3a1a0e]">Table:</span>
                    {[1, 2, 3, 4, 5].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTable(t)}
                        className={`px-3 py-1 rounded-xl font-black text-xs border-2 border-[#3a1a0e] transition-all cursor-pointer ${
                          activeTable === t
                            ? 'bg-[#d6361f] text-[#fff4dc] shadow-[2px_2px_0_#3a1a0e]'
                            : 'bg-white text-[#3a1a0e] hover:bg-slate-100'
                        }`}
                      >
                        T#{t}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-[#3a1a0e]">Dine-In • Main Patio</span>
                </div>

                {/* Tap-to-Punch Dish Cards */}
                <div className="p-4 bg-white border-b-2 border-[#3a1a0e]/15">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Tap Gourmet Dishes to Add to Bill:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { name: 'Cold Coffee w/ Ice Cream', price: 179, img: '/images/cold_coffee.jpg' },
                      { name: 'Foamy Hot Cappuccino', price: 149, img: '/images/hot_coffee.jpg' },
                      { name: 'Pepperoni Stone Pizza', price: 399, img: '/images/pizza.jpg' },
                      { name: 'Crispy Zinger Burger', price: 299, img: '/images/zinger_combo.jpg' },
                    ].map((dish, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddDish(dish.name, dish.price, dish.img)}
                        className="p-2 bg-[#f6efe2] hover:bg-[#ffd45e]/40 border-2 border-[#3a1a0e] rounded-2xl text-left transition-all active:scale-95 shadow-[2px_2px_0_#3a1a0e] cursor-pointer group"
                      >
                        <img
                          src={dish.img}
                          alt={dish.name}
                          className="w-full h-14 object-cover rounded-xl mb-1.5 border border-[#3a1a0e]/20"
                        />
                        <p className="text-[11px] font-extrabold text-[#3a1a0e] truncate leading-tight group-hover:text-[#d6361f]">
                          {dish.name}
                        </p>
                        <p className="text-xs font-black text-[#d6361f]">₹{dish.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Bill Ticket Preview */}
                <div className="p-4 space-y-3 bg-[#fffdf9]">
                  <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                    {mockBillItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-1 border-b border-dashed border-[#3a1a0e]/20"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-[#ffd45e] text-[#3a1a0e] border border-[#3a1a0e] flex items-center justify-center font-black text-[10px]">
                            {item.qty}x
                          </span>
                          <span className="font-bold text-[#3a1a0e]">{item.name}</span>
                        </div>
                        <span className="font-extrabold text-[#3a1a0e]">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="pt-2 border-t-2 border-[#3a1a0e]/20 text-xs space-y-1 font-semibold text-[#3a1a0e]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restaurant GST (5% CGST + SGST)</span>
                      <span>₹{gst}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-[#d6361f] pt-1 border-t border-[#3a1a0e]/15">
                      <span>Total Amount Payable</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handlePrintKOT}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#3a1a0e] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] font-extrabold text-xs uppercase flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#3a1a0e]" />
                      <span>{isKOTPrinted ? 'KOT Sent to Chef!' : 'Print KOT Ticket'}</span>
                    </button>

                    <button
                      onClick={() => navigate('/restaurant')}
                      className="py-2.5 px-3 rounded-xl bg-[#d6361f] hover:bg-[#b52814] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] font-extrabold text-xs uppercase flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>UPI Dynamic Pay</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SIGNATURE DISH SPECIALS STRIP */}
      <section id="specials" className="py-16 bg-[#fff4dc] border-y-3 border-[#3a1a0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#d6361f]">
              Handcrafted Culinary Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#3a1a0e]">
              Signature Restro Specialities
            </h2>
            <p className="text-xs sm:text-sm text-[#3a1a0e]/80">
              Freshly prepared by our culinary team with stone-fired crusts, fresh cream, and single-origin beans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Classic Thick Cold Coffee',
                tag: 'Bestseller',
                price: 179,
                desc: 'Rich Arabica coffee slow-churned with cold milk & creamy vanilla ice cream.',
                img: '/images/cold_coffee.jpg',
              },
              {
                name: 'Artisan Foamy Cappuccino',
                tag: 'Barista Spec',
                price: 149,
                desc: 'Dark espresso pulled fresh with velvety microfoam and hand-poured latte art.',
                img: '/images/hot_coffee.jpg',
              },
              {
                name: 'Pepperoni Stone Pizza',
                tag: 'Chef Choice',
                price: 399,
                desc: '12-inch wood-fired sourdough crust, aged mozzarella & spicy pepperoni.',
                img: '/images/pizza.jpg',
              },
              {
                name: 'Zinger Crunch Burger',
                tag: 'Popular',
                price: 299,
                desc: 'Crispy fried breast fillet, spicy sriracha slaw, pickled gherkins & fries.',
                img: '/images/zinger_combo.jpg',
              },
            ].map((dish, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border-3 border-[#3a1a0e] shadow-[4px_5px_0_#3a1a0e] flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#3a1a0e]">
                    <img src={dish.img} alt={dish.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#ffd45e] border border-[#3a1a0e] text-[10px] font-black uppercase text-[#3a1a0e]">
                      {dish.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#3a1a0e]">{dish.name}</h3>
                    <p className="text-xs text-[#3a1a0e]/70 mt-1 line-clamp-2">{dish.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t-2 border-[#3a1a0e]/15 flex items-center justify-between">
                  <span className="text-lg font-black text-[#d6361f]">₹{dish.price}</span>
                  <button
                    onClick={() => navigate('/restaurant')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#d6361f] text-[#fff4dc] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] text-xs font-black uppercase hover:bg-[#b52814] cursor-pointer"
                  >
                    Order Now ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PETPOOJA ECOSYSTEM SUITE (POS, INVOICE, PAYROLL, STEPWISE, PURCHASE) */}
      <section id="ecosystem" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#d6361f]">
              Comprehensive Technology Stack
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#3a1a0e]">
              The 5 Restaurant Operating Engines
            </h2>
            <p className="text-sm sm:text-base text-[#3a1a0e]/80">
              Everything your restaurant needs to scale smoothly—from frontend tables to kitchen inventory.
            </p>
          </div>

          {/* Product Pill Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {(['POS', 'Invoice', 'Payroll', 'Stepwise', 'Purchase'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveEcosystemTab(tab)}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-3 border-[#3a1a0e] cursor-pointer ${
                  activeEcosystemTab === tab
                    ? 'bg-[#d6361f] text-[#fff4dc] shadow-[4px_4px_0_#3a1a0e] scale-105'
                    : 'bg-white text-[#3a1a0e] hover:bg-[#fff4dc] shadow-[2px_2px_0_#3a1a0e]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Detailed Product Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-3 border-[#3a1a0e] shadow-[6px_8px_0_#3a1a0e] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-3 py-1 rounded-full bg-[#ffd45e] border-2 border-[#3a1a0e] text-xs font-black uppercase text-[#3a1a0e]">
                ✦ {activeEcosystemTab} Engine Active
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-[#3a1a0e]">
                {activeEcosystemTab === 'POS' && 'Lightning 3-Click Restaurant POS'}
                {activeEcosystemTab === 'Invoice' && 'Automated 100% Indian GST Invoicing'}
                {activeEcosystemTab === 'Payroll' && 'Staff Biometric Attendance & Tip Engine'}
                {activeEcosystemTab === 'Stepwise' && 'Kitchen SOPs & Manager Audit Logs'}
                {activeEcosystemTab === 'Purchase' && 'Recipe Inventory & Food Waste AI'}
              </h3>

              <p className="text-sm sm:text-base text-[#3a1a0e]/80 leading-relaxed font-normal">
                {activeEcosystemTab === 'POS' &&
                  'Speed up table service during peak hours. Manage floor maps, split bills across friends, generate dynamic UPI payment QRs, and route station-wise KOTs straight to kitchen chefs without lag.'}
                {activeEcosystemTab === 'Invoice' &&
                  'Generate compliant GST tax invoices (2.5% CGST + 2.5% SGST) with your FSSAI license printed automatically. Send instant digital bills over WhatsApp and eliminate paper receipt waste.'}
                {activeEcosystemTab === 'Payroll' &&
                  'Calculate staff salaries, captain sales performance bonuses, overtime, and floor tips effortlessly. Track clock-ins with facial verification and shift schedules.'}
                {activeEcosystemTab === 'Stepwise' &&
                  'Standardize your culinary recipes and hygiene across outlets. Kitchen opening/closing checklists, deep cleaning schedules, and temperature compliance checks.'}
                {activeEcosystemTab === 'Purchase' &&
                  'Auto-deduct raw materials (cheese, coffee beans, burger buns) per dish sold. Receive low-stock alerts before peak rush hours and stop kitchen food shrinkage.'}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => scrollTo('demo-booking')}
                  className="px-6 py-3.5 rounded-2xl bg-[#3a1a0e] hover:bg-black text-[#fff4dc] font-black text-xs uppercase tracking-wider border-2 border-[#3a1a0e] shadow-[3px_3px_0_#ffd45e] flex items-center space-x-2 cursor-pointer"
                >
                  <span>Book Demo for {activeEcosystemTab}</span>
                  <ArrowRight className="w-4 h-4 text-[#ffd45e]" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#fff4dc] rounded-2xl p-6 border-2 border-[#3a1a0e] space-y-3">
              <span className="text-xs font-black uppercase text-[#d6361f] block">
                Enterprise Restaurant Feature Spec
              </span>
              <div className="space-y-2 text-xs font-bold text-[#3a1a0e]">
                <div className="p-2.5 rounded-xl bg-white border border-[#3a1a0e]/20 flex justify-between">
                  <span>Offline Capability:</span>
                  <span className="text-[#d6361f]">100% Zero-Loss SQLite</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#3a1a0e]/20 flex justify-between">
                  <span>Aggregator Sync:</span>
                  <span>Swiggy, Zomato, Magicpin</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#3a1a0e]/20 flex justify-between">
                  <span>Payment Gateways:</span>
                  <span>Razorpay, Paytm, Dynamic UPI</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#3a1a0e]/20 flex justify-between">
                  <span>Reports Telemetry:</span>
                  <span>80+ Instant WhatsApp Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RESTRO FORMATS ADAPTABILITY */}
      <section id="outlets" className="py-20 bg-[#fff4dc] border-t-3 border-[#3a1a0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#d6361f]">
              Versatile Outlet Formats
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#3a1a0e]">
              Built for Every Food Business
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Cafes & Coffee Roasteries', icon: '☕', desc: 'Custom syrups, oat milk, and bean retail packs billed in 2 seconds.' },
              { title: 'QSR & Burger Joints', icon: '🍔', desc: 'Rapid token numbering, customer display counters, and automated combo deals.' },
              { title: 'Fine Dine & Casual Dining', icon: '🍷', desc: 'Table reservation, captain mobile tablets, and guest split bills at the table.' },
              { title: 'Cloud Kitchens', icon: '☁️', desc: 'Operate 10 virtual brands from a single kitchen terminal without confusion.' },
              { title: 'Pizzerias & Bakeries', icon: '🍕', desc: 'Crust selections, toppings modifier grids, and batch freshness expiry control.' },
              { title: 'Multi-Store Franchises', icon: '🏢', desc: 'Central master menu publishing, warehouse transfers, and chain-wide sales reports.' },
            ].map((out, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border-3 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] space-y-2"
              >
                <div className="text-3xl mb-2">{out.icon}</div>
                <h3 className="font-extrabold text-lg text-[#3a1a0e]">{out.title}</h3>
                <p className="text-xs text-[#3a1a0e]/70 leading-relaxed font-medium">{out.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL SECTION — BOOK A FREE DEMO (EXACT PETPOOJA LAYOUT & DEVELOPER WORKFLOW) */}
      <section id="demo-booking" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#e8dece]">
        <div className="max-w-6xl mx-auto bg-[#F4F5F7] rounded-3xl p-8 sm:p-12 lg:p-16 border-3 border-[#3a1a0e] shadow-[8px_10px_0_#3a1a0e]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A1D20] leading-tight">
                  Book a Free Demo
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                  Book a 10-minute demo to see how our restaurant platform can work for your business.
                </p>
              </div>

              {/* Trust Checklist */}
              <div className="pt-4 space-y-3.5 border-t border-slate-200">
                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Personalized walkthrough tailored to your cafe, QSR, or dine-in restaurant</span>
                </div>
                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero setup fees • Complimentary menu upload and staff training</span>
                </div>
                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Developer account review and system activation within 24 hours</span>
                </div>
              </div>

              {/* Status if Approved */}
              {isApproved && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Restaurant Account Approved!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Your restaurant registration has been accepted by the developers. You have full access to explore the complete live ordering, KDS, and table management system.
                  </p>
                  <button
                    onClick={() => navigate('/restaurant')}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>Launch Live Restaurant Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Exact Petpooja Form Layout */}
            <div className="lg:col-span-7">
              {isSubmittedSuccess ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md space-y-6 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">
                      Application Submitted Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                      Thank you, <strong className="text-slate-900">{submittedData?.name}</strong>. We have received your restaurant registration for <strong className="text-slate-900">{submittedData?.businessName}</strong> in {submittedData?.city}.
                    </p>
                  </div>

                  {/* Developer Review Info Box */}
                  <div className="bg-[#F8F9FA] rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-slate-800">
                      <ChefHat className="w-4 h-4 text-[#C82032]" />
                      <span>Developer Review: Status Pending Approval</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Our developer team will review your restaurant address and requirements, configure your plan pricing, and approve your application. Once approved, your live restaurant system and menu will be unlocked for dining customers.
                    </p>
                  </div>

                  {/* Developer Quick-Approve Button for Testing */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
                    {!isApproved ? (
                      <button
                        onClick={handleDeveloperApprove}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Developer: Click to Approve Restaurant Access</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/restaurant')}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
                      >
                        <span>Approved • Open Live Restaurant</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsSubmittedSuccess(false);
                        setFormData({
                          name: '',
                          email: '',
                          countryCode: '+91',
                          phone: '',
                          city: '',
                          pincode: '',
                          businessName: '',
                        });
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                    >
                      Submit Another Registration
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  {/* Row 1: Name * and Email * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Name <span className="text-[#C82032]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full bg-white border ${
                          errors.name ? 'border-[#C82032] ring-1 ring-[#C82032]' : 'border-slate-300'
                        } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all`}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Email <span className="text-[#C82032]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="e.g. rahul@bistro.in"
                        className={`w-full bg-white border ${
                          errors.email ? 'border-[#C82032] ring-1 ring-[#C82032]' : 'border-slate-300'
                        } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone Number * and City * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Phone Number <span className="text-[#C82032]">*</span>
                      </label>
                      <div className="flex">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => handleInputChange('countryCode', e.target.value)}
                          className="bg-slate-100 border border-slate-300 rounded-l-xl px-2.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-500 border-r-0"
                        >
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+971">🇦🇪 +971 (UAE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                        </select>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="9876543210"
                          className={`flex-1 bg-white border ${
                            errors.phone ? 'border-[#C82032] ring-1 ring-[#C82032]' : 'border-slate-300'
                          } rounded-r-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        City <span className="text-[#C82032]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="e.g. Bengaluru / Mumbai / Chennai"
                        className={`w-full bg-white border ${
                          errors.city ? 'border-[#C82032] ring-1 ring-[#C82032]' : 'border-slate-300'
                        } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all`}
                      />
                      {errors.city && (
                        <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Pincode * and Business Name * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Pincode <span className="text-[#C82032]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="e.g. 560001"
                        className={`w-full bg-white border ${
                          errors.pincode ? 'border-[#C82032] ring-1 ring-[#C82032]' : 'border-slate-300'
                        } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all`}
                      />
                      {errors.pincode && (
                        <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.pincode}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Restaurant / Business Name <span className="text-[#C82032]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="e.g. Bella Hearth Pizza & Coffee Outpost"
                        className={`w-full bg-white border ${
                          errors.businessName
                            ? 'border-[#C82032] ring-1 ring-[#C82032]'
                            : 'border-slate-300'
                        } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all`}
                      />
                      {errors.businessName && (
                        <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.businessName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Which product are you interested in? * */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Which product are you interested in? <span className="text-[#C82032]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productPills.map((prod) => {
                        const isSelected = selectedProducts.includes(prod);
                        return (
                          <button
                            key={prod}
                            type="button"
                            onClick={() => toggleProduct(prod)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? `✓ ${prod}` : prod}
                          </button>
                        );
                      })}
                    </div>
                    {errors.products && (
                      <p className="text-[11px] text-[#C82032] font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.products}</span>
                      </p>
                    )}
                  </div>

                  {/* Full-width Red Button (#C82032) */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#C82032] hover:bg-[#B01B2B] text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-70 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting Restaurant Application...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>

                  {/* Privacy Message */}
                  <p className="text-[11px] text-slate-500 text-center pt-1">
                    By submitting this form, you agree to receive updates and accept our{' '}
                    <a
                      href="#privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Privacy Policy: All customer & restaurant data is kept strictly confidential.');
                      }}
                      className="text-slate-800 underline hover:text-[#C82032] font-medium cursor-pointer"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 7. WARM RESTRO FOOTER */}
      <footer className="bg-[#2a1309] text-[#fff4dc] pt-16 pb-12 border-t-4 border-[#3a1a0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🍳</span>
                <span className="font-black text-xl text-[#fff4dc]">
                  RESTRO<span className="text-[#ffd45e]">.AI</span>
                </span>
              </div>
              <p className="text-xs text-[#fff4dc]/70 leading-relaxed font-light">
                Gourmet culinary experiences powered by next-generation restaurant POS, live kitchen telemetry, and QR dining operating systems.
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#fff4dc]/80">
              <h4 className="font-black uppercase tracking-wider text-[#ffd45e]">Platform Solutions</h4>
              <p>Lightning 3-Click POS</p>
              <p>Kitchen Display System (KDS)</p>
              <p>100% Indian GST Invoicing</p>
              <p>Recipe Inventory & Food Waste AI</p>
              <p>Swiggy & Zomato Aggregator Sync</p>
            </div>

            <div className="space-y-2 text-xs text-[#fff4dc]/80">
              <h4 className="font-black uppercase tracking-wider text-[#ffd45e]">Catering Formats</h4>
              <p>Specialty Cafes & Bakeries</p>
              <p>Stone-Fired Pizzerias</p>
              <p>Quick Service Restaurants (QSR)</p>
              <p>Fine Dining & Breweries</p>
              <p>Multi-Kitchen Cloud Brands</p>
            </div>

            <div className="space-y-2.5 text-xs text-[#fff4dc]/80">
              <h4 className="font-black uppercase tracking-wider text-[#ffd45e]">24x7 Restro Support</h4>
              <p className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#ffd45e]" />
                <span>+91 70462 70462</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#ffd45e]" />
                <span>support@restroai.in</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ffd45e]" />
                <span>Indiranagar 100ft Rd, Bengaluru, KA</span>
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#fff4dc]/60 gap-3">
            <p>© {new Date().getFullYear()} RestroAI Technologies Inc. All rights reserved.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default RestroLandingPage;

