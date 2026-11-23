import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export interface DemoBookingData {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  city: string;
  pincode: string;
  businessName: string;
  interestedProducts: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'contacted';
}

const PRODUCT_PILLS = ['POS', 'Invoice', 'Payroll', 'Stepwise', 'Purchase'];

interface CoffeeDemoBookingProps {
  onApprovedLaunch?: () => void;
}

export const CoffeeDemoBooking: React.FC<CoffeeDemoBookingProps> = ({ onApprovedLaunch }) => {
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
  const [lastSubmission, setLastSubmission] = useState<DemoBookingData | null>(null);

  // Check if current user is already registered or approved in localStorage
  const [isApproved, setIsApproved] = useState<boolean>(() => {
    try {
      return localStorage.getItem('restroai_customer_approved') === 'true';
    } catch {
      return false;
    }
  });

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

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }

    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{4,10}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Please enter a valid postal pincode';
    }

    if (!formData.businessName.trim()) {
      errs.businessName = 'Business or restaurant name is required';
    }

    if (selectedProducts.length === 0) {
      errs.products = 'Please select at least one product';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const submission: DemoBookingData = {
        id: `DEMO-${Date.now()}`,
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
        localStorage.setItem('restroai_latest_registration', JSON.stringify(submission));
      } catch (err) {
        console.error('Storage error', err);
      }

      setLastSubmission(submission);
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 900);
  };

  // Developer Quick Approval Simulator for testing
  const handleDeveloperApprove = () => {
    try {
      localStorage.setItem('restroai_customer_approved', 'true');
      setIsApproved(true);
      if (lastSubmission) {
        const updated = { ...lastSubmission, status: 'approved' as const };
        setLastSubmission(updated);
      }
    } catch {}
  };

  return (
    <section id="demo-booking" className="py-20 sm:py-28 bg-[#EAE2D5] text-[#2D211B] px-4 sm:px-6 lg:px-8">
      {/* Outer Container with Light Grey Background, Rounded Corners & Generous Padding */}
      <div className="max-w-6xl mx-auto bg-[#F4F5F7] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: Large Heading & Supporting Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A1D20] leading-tight">
                Book a Free Demo
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                Book a 10-minute demo to see how our coffee platform can work for your business.
              </p>
            </div>

            {/* Platform Feature Trust Bullets */}
            <div className="pt-4 space-y-4 border-t border-slate-200">
              <div className="flex items-start space-x-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Customised live walkthrough tailored to your cafe or restaurant format</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero setup fees • Cloud-native POS, automated billing & kitchen KOT</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Developer review and approval within 24 business hours</span>
              </div>
            </div>

            {/* Developer Approval Status Pill */}
            {isApproved && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Restaurant Account Approved!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Your restaurant registration has been verified by the developers. You have full access to explore the complete ordering system and portals.
                </p>
                {onApprovedLaunch && (
                  <button
                    onClick={onApprovedLaunch}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <span>Launch Full Restaurant System</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Professional 2-Column Form */}
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
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-900">{lastSubmission?.name}</strong>. We
                    have received your restaurant application for{' '}
                    <strong className="text-slate-900">{lastSubmission?.businessName}</strong> in{' '}
                    {lastSubmission?.city}.
                  </p>
                </div>

                {/* Developer review message */}
                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-[#C82032]" />
                    <span>Developer Verification Status: Pending Review</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    As per the registration workflow, our development team will review your
                    address and business credentials, prepare the exact pricing & plan, and
                    grant approval for your restaurant to unlock full live ordering, KDS, and table management.
                  </p>
                </div>

                {/* Developer Simulation Approve Button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
                  {!isApproved ? (
                    <button
                      onClick={handleDeveloperApprove}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Developer: Click to Approve Application</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onApprovedLaunch?.()}
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
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="e.g. rahul@coffeehouse.in"
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
                        <option value="+61">🇦🇺 +61 (AU)</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="9876543210"
                        className={`flex-1 bg-white border ${
                          errors.phone
                            ? 'border-[#C82032] ring-1 ring-[#C82032]'
                            : 'border-slate-300'
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
                      Business Name <span className="text-[#C82032]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="e.g. Roast & Hearth Roastery"
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

                {/* Row 4: Selectable Product Pills */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Which product are you interested in? <span className="text-[#C82032]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_PILLS.map((prod) => {
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

                {/* Full-width Red Submit Button (#C82032) */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#C82032] hover:bg-[#B01B2B] text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-70 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Submitting Application...</span>
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
                      alert('Privacy Policy: We protect your data and do not share restaurant credentials.');
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
  );
};

