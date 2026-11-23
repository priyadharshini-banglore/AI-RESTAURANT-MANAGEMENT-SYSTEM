import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, Mail, ExternalLink, X, Database } from 'lucide-react';

export interface PetpoojaRegistration {
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
  status: 'pending' | 'approved';
}

interface PetpoojaDemoFormProps {
  initialSelectedProduct?: string;
  onApprovedLaunch?: () => void;
}

export const PetpoojaDemoForm: React.FC<PetpoojaDemoFormProps> = ({
  initialSelectedProduct = 'Restaurant POS',
  onApprovedLaunch,
}) => {
  const targetAdminEmail = 'biompriya2006@gmail.com';

  const [formData, setFormData] = useState({
    name: '',
    email: ''
    ,
    countryCode: 'India (+91)',
    phone: '',
    city: '',
    pincode: '',
    businessName: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([initialSelectedProduct]);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [storedLeads, setStoredLeads] = useState<PetpoojaRegistration[]>([]);

  const loadStoredLeads = () => {
    try {
      const items = JSON.parse(localStorage.getItem('restro_demo_leads') || '[]');
      setStoredLeads(items);
      setShowLeadsModal(true);
    } catch {
      setStoredLeads([]);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredLead, setRegisteredLead] = useState<PetpoojaRegistration | null>(null);
  const [emailStatus, setEmailStatus] = useState<'sent' | 'activation_needed' | 'cached'>('sent');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productOptions = ['Restaurant POS', '3D Table Menu', 'Kitchen KDS', 'Floor Map & Bell', 'AI Analytics'];

  const toggleProduct = (prod: string) => {
    setSelectedProducts((prev) =>
      prev.includes(prod)
        ? prev.length > 1
          ? prev.filter((p) => p !== prod)
          : prev
        : [...prev, prod]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim()) {
      setErrorMessage('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);

    const businessName = formData.businessName.trim() || `${formData.name}'s Restaurant`;
    const leadId = 'REST-' + Math.floor(100000 + Math.random() * 900000);
    const timeString = new Date().toLocaleString();

    const newLead: PetpoojaRegistration = {
      id: leadId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      countryCode: formData.countryCode,
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      businessName,
      interestedProducts: selectedProducts,
      submittedAt: timeString,
      status: 'pending',
    };

    // 1. Store in localStorage backup
    try {
      const existing = JSON.parse(localStorage.getItem('restro_demo_leads') || '[]');
      localStorage.setItem('restro_demo_leads', JSON.stringify([newLead, ...existing]));
    } catch (err) {
      console.warn('Could not save lead to localStorage', err);
    }

    // 2. Dispatch email directly to biompriya2006@gmail.com
    let status: 'sent' | 'activation_needed' | 'cached' = 'sent';
    try {
      const emailPayload = {
        _subject: `🚀 New Restro Demo Request: ${businessName} (${formData.name})`,
        _replyto: formData.email,
        _template: 'table',
        _captcha: 'false',
        'Lead ID': leadId,
        'Client Name': formData.name,
        'Client Email': formData.email,
        'Phone Number': `${formData.countryCode} ${formData.phone}`,
        'Restaurant / Business Name': businessName,
        'City': formData.city,
        'Pincode': formData.pincode || 'N/A',
        'Interested Modules': selectedProducts.join(', '),
        'Submission Time': timeString,
        'Destination Mailbox': targetAdminEmail,
      };

      const response = await fetch(`https://formsubmit.co/ajax/${targetAdminEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      const data = await response.json().catch(() => null);
      if (data && data.message && data.message.toLowerCase().includes('activation')) {
        status = 'activation_needed';
      } else {
        status = 'sent';
      }
    } catch (fetchErr) {
      console.warn('FormSubmit network error, fallback to cached lead:', fetchErr);
      status = 'cached';
    }

    // 3. Dispatch to local backend if running
    try {
      await fetch('/api/demo/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      }).catch(() => null);
    } catch { }

    setEmailStatus(status);
    setRegisteredLead(newLead);
    setIsSubmitting(false);
  };

  const handleInstantApprove = () => {
    if (registeredLead) {
      setRegisteredLead({
        ...registeredLead,
        status: 'approved',
      });
    }
  };

  const getMailtoLink = () => {
    if (!registeredLead) return '#';
    const subject = encodeURIComponent(`Demo Booking Inquiry - ${registeredLead.businessName}`);
    const body = encodeURIComponent(
      `Hello Admin,\n\nA new demo was booked on Restro Web:\n\n` +
      `Lead ID: ${registeredLead.id}\n` +
      `Name: ${registeredLead.name}\n` +
      `Email: ${registeredLead.email}\n` +
      `Phone: ${registeredLead.countryCode} ${registeredLead.phone}\n` +
      `Business: ${registeredLead.businessName}\n` +
      `City: ${registeredLead.city} (${registeredLead.pincode})\n` +
      `Interested In: ${registeredLead.interestedProducts.join(', ')}\n` +
      `Time: ${registeredLead.submittedAt}\n`
    );
    return `mailto:${targetAdminEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="demo" className="py-20 sm:py-28 bg-white px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="max-w-6xl mx-auto">

        {/* Main Card Container: Light Grey background #F4F5F7 matching Screenshot 10 */}
        <div className="bg-[#F4F5F7] rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/90 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Column: Heading and Subtitle (Screenshot 10) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Book a Free Demo
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                Book a 10-minute demo to see how Restro can work for your business.*
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={loadStoredLeads}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-slate-600" />
                  <span>Admin: View Captured Leads Vault</span>
                </button>
              </div>
            </div>

            {/* Right Column: Exact Form Fields (Screenshot 10) */}
            <div className="lg:col-span-7">
              {registeredLead && registeredLead.status === 'approved' ? (
                <div className="bg-white rounded-2xl p-7 border-2 border-emerald-500 shadow-md text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Demo Approved & Access Granted!
                  </h3>
                  <p className="text-sm text-slate-600">
                    Welcome <strong>{registeredLead.name}</strong> from <strong>{registeredLead.businessName}</strong>. Your full restaurant operating system is ready to launch.
                  </p>
                  <button
                    onClick={onApprovedLaunch}
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Launch Live Restaurant OS Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#E22637] font-bold flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Row 1: Name* | Email* */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Name<span className="text-[#E22637]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] focus:ring-1 focus:ring-[#E22637] outline-none text-sm text-slate-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email<span className="text-[#E22637]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] focus:ring-1 focus:ring-[#E22637] outline-none text-sm text-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone number* [India (+91)] [Phone] | City* */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone number<span className="text-[#E22637]">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="w-32 px-2 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] outline-none text-xs text-slate-700"
                        >
                          <option>India (+91)</option>
                          <option>UAE (+971)</option>
                          <option>USA (+1)</option>
                          <option>UK (+44)</option>
                        </select>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder=""
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] focus:ring-1 focus:ring-[#E22637] outline-none text-sm text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City<span className="text-[#E22637]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] focus:ring-1 focus:ring-[#E22637] outline-none text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Row 3: Pincode* | Business Name* */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pincode<span className="text-[#E22637]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] focus:ring-1 focus:ring-[#E22637] outline-none text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Business Name<span className="text-[#E22637]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#E22637] focus:ring-1 focus:ring-[#E22637] outline-none text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Row 4: Which product are you interested in?* */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Which product are you interested in?<span className="text-[#E22637]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productOptions.map((prod) => {
                        const isSelected = selectedProducts.includes(prod);
                        return (
                          <button
                            type="button"
                            key={prod}
                            onClick={() => toggleProduct(prod)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${isSelected
                                ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400'
                              }`}
                          >
                            {prod}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button (Exact Petpooja Red #E22637 button) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-lg bg-[#E22637] hover:bg-[#C82032] text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>

                  {/* Privacy Policy disclaimer matching screenshot 10 */}
                  <p className="text-[11px] text-slate-500 text-center pt-1">
                    By submitting this form, you agree to receive updates from Restro and accept our{' '}
                    <span className="text-[#E22637] underline cursor-pointer">Privacy Policy</span>.
                  </p>
                </form>
              )}

              {/* Instant Developer/Demo Approval Panel & Email Confirmation */}
              {registeredLead && registeredLead.status === 'pending' && (
                <div className="mt-5 p-5 rounded-2xl bg-white border-2 border-emerald-500 text-slate-800 shadow-md space-y-3 animate-in fade-in">
                  <div className="flex items-center space-x-3 text-emerald-600">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Demo Request Dispatched to biompriya2006@gmail.com!
                      </h4>
                      <p className="text-xs text-slate-500">
                        Booking ID: <span className="font-mono font-bold text-slate-700">{registeredLead.id}</span> • {registeredLead.submittedAt}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div><strong>Client:</strong> {registeredLead.name} ({registeredLead.email})</div>
                    <div><strong>Restaurant:</strong> {registeredLead.businessName} • {registeredLead.city}</div>
                    <div><strong>Phone:</strong> {registeredLead.countryCode} {registeredLead.phone}</div>
                    <div><strong>Selected Modules:</strong> {registeredLead.interestedProducts.join(', ')}</div>
                  </div>

                  {emailStatus === 'activation_needed' && (
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        First time setup: Please open <strong>biompriya2006@gmail.com</strong> and click <em>"Activate Form"</em> in the confirmation email so future requests land directly in your inbox.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <button
                      onClick={handleInstantApprove}
                      className="w-full sm:flex-1 py-2.5 px-4 bg-[#E22637] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#C82032] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Approve &amp; Test Live System</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={getMailtoLink()}
                      className="w-full sm:w-auto py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1 border border-slate-300"
                      title="Open in your default mail app"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Mail App</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Admin Leads Vault Modal */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-[#E22637]" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Captured Demo Leads ({storedLeads.length})
                </h3>
              </div>
              <button
                onClick={() => setShowLeadsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                All demo requests booked through the website are saved here and dispatched to <strong>biompriya2006@gmail.com</strong>.
              </div>

              {storedLeads.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No demo requests captured yet.
                </div>
              ) : (
                storedLeads.map((lead) => (
                  <div key={lead.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                      <span>{lead.name} • {lead.businessName}</span>
                      <span className="text-[11px] font-mono text-[#E22637] font-semibold">{lead.id}</span>
                    </div>
                    <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>📧 {lead.email}</span>
                      <span>📞 {lead.countryCode} {lead.phone}</span>
                      <span>📍 {lead.city} {lead.pincode ? `(${lead.pincode})` : ''}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      <strong>Interested:</strong> {lead.interestedProducts.join(', ')} • <em>{lead.submittedAt}</em>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={`mailto:${lead.email}?subject=Your Restro Demo Booking&body=Hi ${lead.name}, thank you for booking a demo of Restro for ${lead.businessName}.`}
                        className="px-2.5 py-1 bg-[#E22637] text-white rounded text-[11px] font-bold hover:bg-[#C82032]"
                      >
                        Email Client
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-bold hover:bg-slate-300"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Admin: biompriya2006@gmail.com</span>
              <button
                onClick={() => setShowLeadsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
