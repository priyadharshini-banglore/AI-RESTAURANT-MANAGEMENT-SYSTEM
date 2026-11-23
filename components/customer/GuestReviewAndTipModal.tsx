import React, { useState } from 'react';
import { soundService } from '../../services/soundService';
import { useAppContext } from '../../contexts/AppContext';
import { PortionFeedback } from '../../types';
import { generateGuestReview } from '../../services/geminiService';

interface GuestReviewAndTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  orderedDishes?: string[];
  servantName?: string;
  onReviewSubmitted?: () => void;
}

const COMPLIMENT_CHIPS = [
  { id: 'delicious', label: 'Delicious Taste', icon: '🍕' },
  { id: 'fast', label: 'Lightning Fast', icon: '⚡' },
  { id: 'friendly', label: 'Friendly Attendant', icon: '💖' },
  { id: 'clean', label: 'Spotless Table', icon: '🧹' },
  { id: 'vibe', label: 'Great Music & Vibe', icon: '🎶' },
  { id: 'plating', label: 'Beautiful Plating', icon: '🍷' },
  { id: 'fresh', label: 'Fresh Ingredients', icon: '🥗' },
  { id: 'value', label: 'Great Value', icon: '💵' },
];

const TIP_TIERS = [
  { amount: 0, label: 'No Tip', desc: 'No gratuity' },
  { amount: 20, label: '₹20', desc: 'Chai on us ☕' },
  { amount: 50, label: '₹50', desc: 'Great Service 💖' },
  { amount: 100, label: '₹100', desc: 'Super Host ⭐' },
];

export const GuestReviewAndTipModal: React.FC<GuestReviewAndTipModalProps> = ({
  isOpen,
  onClose,
  tableId,
  orderedDishes = [],
  servantName = 'Arjun S. (Host #04)',
  onReviewSubmitted,
}) => {
  const { addFeedback } = useAppContext();

  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>(['delicious', 'friendly', 'fast']);
  const [tipAmount, setTipAmount] = useState<number>(50);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustomTipActive, setIsCustomTipActive] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedVoucher, setCopiedVoucher] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentEffectiveRating = hoveredRating !== null ? hoveredRating : rating;

  const getMoodCaption = (r: number) => {
    switch (r) {
      case 1:
        return '😞 Poor • We are truly sorry';
      case 2:
        return '😐 Fair • Could be improved';
      case 3:
        return '🙂 Good • Enjoyed our meal';
      case 4:
        return '😋 Delicious • Very happy!';
      case 5:
      default:
        return '🌟 Outstanding • 5-Star Experience!';
    }
  };

  const toggleCompliment = (id: string) => {
    soundService.playTactileClick('low');
    setSelectedCompliments((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectTip = (amount: number) => {
    soundService.playTactileClick('mid');
    setIsCustomTipActive(false);
    setTipAmount(amount);
  };

  const handleGenerateAiReview = async () => {
    soundService.playTactileClick('high');
    setIsGeneratingAi(true);
    try {
      const generated = await generateGuestReview(orderedDishes, rating, servantName.split(' ')[0]);
      setReviewComment(generated);
    } catch (e) {
      setReviewComment(
        `The food was wonderfully prepared and fresh, and ${servantName.split(' ')[0]} delivered exceptional, attentive table service! 🌟`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playOrderSuccessChime();

    const finalTip = isCustomTipActive ? parseFloat(customTip) || 0 : tipAmount;

    // Submit to AppContext feedback repository
    addFeedback({
      tableId,
      tasteRating: rating,
      portionFeedback: PortionFeedback.OK,
      comment: reviewComment || `Rated ${rating} Stars! Table #${tableId}`,
      servantTip: finalTip,
      servantName,
      compliments: selectedCompliments,
      createdAt: new Date().toISOString(),
    });

    // Broadcast across windows so servant portal and kitchen are notified
    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'GUEST_FEEDBACK_SUBMITTED',
        tableId,
        rating,
        servantName,
        tip: finalTip,
        compliments: selectedCompliments,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (err) {}

    setIsSubmitted(true);
    onReviewSubmitted?.();
  };

  const handleCopyVoucher = () => {
    soundService.playTactileClick('high');
    if (navigator.clipboard) {
      navigator.clipboard.writeText('DINEVIP15');
    }
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-lg bg-[#fffdf7] rounded-[32px] sm:rounded-[36px] shadow-2xl border-3 border-[#3a1a0e] overflow-hidden flex flex-col max-h-[94vh] animate-card-bloom">
        
        {/* Top Header Banner */}
        <div className="bg-[#1c1613] text-[#fff4dc] p-5 border-b-2 border-[#3a1a0e] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center text-2xl shrink-0">
                ⭐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#d6361f] text-white text-[10px] font-semibold uppercase tracking-wider">
                    Table #{tableId}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-full">
                    Guest Review & Tip
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  How Was Your Experience?
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
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {isSubmitted ? (
            /* THANK YOU & VIP REWARD STATE */
            <div className="py-6 text-center space-y-4 animate-card-bloom">
              <div className="w-20 h-20 rounded-full bg-amber-100 border-3 border-amber-500 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-[3px_4px_0_#d97706] animate-bounce-subtle">
                ⭐
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold uppercase tracking-wider">
                  🎉 Review Submitted • Thank You!
                </span>
                <h4 className="text-2xl sm:text-3xl font-semibold text-[#3a1a0e] mt-2">
                  Your Feedback Makes Us Better!
                </h4>
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  {servantName.split(' ')[0]} and our entire culinary team thank you for dining with us at Table #{tableId}.
                </p>
              </div>

              {/* VIP Reward Voucher Card */}
              <div className="bg-gradient-to-br from-[#fff4dc] to-[#faedd0] border-2 border-[#3a1a0e] shadow-[3px_4px_0_#3a1a0e] rounded-3xl p-5 text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-3 text-2xl opacity-20">🎁</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d6361f] block">
                  Exclusive Guest Dine-In Reward
                </span>
                <h5 className="font-semibold text-2xl text-[#3a1a0e]">
                  15% OFF Next Dining Visit
                </h5>
                <p className="text-[11px] text-slate-600 font-medium">
                  Use voucher code on your next QR scan or show to your floor attendant:
                </p>

                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-dashed border-[#3a1a0e] shadow-xs mt-1">
                  <span className="font-bold text-lg text-[#d6361f] tracking-wider">
                    DINEVIP15
                  </span>
                  <button
                    onClick={handleCopyVoucher}
                    className="px-2.5 py-1 rounded-xl bg-[#3a1a0e] text-[#fff4dc] text-[10px] font-medium uppercase hover:bg-black transition-colors cursor-pointer"
                  >
                    {copiedVoucher ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[#3a1a0e] hover:bg-black text-[#fff4dc] font-medium text-xs sm:text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Close & Return to Menu ➔
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Star Rating with Mood Caption */}
              <div className="bg-white p-4 rounded-3xl border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] text-center space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Overall Food & Ambiance Rating
                </span>

                <div className="flex justify-center items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      onClick={() => {
                        soundService.playTactileClick('high');
                        setRating(star);
                      }}
                      className="text-4xl sm:text-5xl transition-transform hover:scale-125 active:scale-95 cursor-pointer filter drop-shadow-sm"
                      title={`${star} Star`}
                    >
                      {currentEffectiveRating >= star ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-[#3a1a0e] border border-amber-200 text-xs font-semibold uppercase tracking-wide">
                  {getMoodCaption(currentEffectiveRating)}
                </div>
              </div>

              {/* 2. 1-Tap Compliments Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  What Did You Love? (Tap to Select)
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {COMPLIMENT_CHIPS.map((chip) => {
                    const isSelected = selectedCompliments.includes(chip.id);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => toggleCompliment(chip.id)}
                        className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 ${
                          isSelected
                            ? 'bg-[#d6361f] text-white border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] scale-[1.03]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Floor Servant Tip Card */}
              <div className="bg-[#fff4dc] p-4 rounded-3xl border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#3a1a0e]/15">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-2xl bg-white border border-[#3a1a0e]/40 flex items-center justify-center text-xl shrink-0 shadow-xs">
                      👨‍🍳
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                        Assigned Floor Attendant
                      </span>
                      <h5 className="font-semibold text-sm text-[#3a1a0e] leading-tight">
                        {servantName}
                      </h5>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                    100% Direct Gratuity
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {TIP_TIERS.map((tier) => (
                    <button
                      key={tier.amount}
                      type="button"
                      onClick={() => handleSelectTip(tier.amount)}
                      className={`p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                        !isCustomTipActive && tipAmount === tier.amount
                          ? 'bg-[#3a1a0e] text-[#fff4dc] border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] scale-[1.03]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-semibold text-xs block leading-tight">
                        {tier.label}
                      </span>
                      <span className="text-[9px] opacity-80 block truncate leading-tight mt-0.5">
                        {tier.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Tip Input Toggle */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTactileClick('low');
                      setIsCustomTipActive(!isCustomTipActive);
                    }}
                    className="text-[#d6361f] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>✍️ Enter Custom Tip Amount</span>
                  </button>

                  {isCustomTipActive && (
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#3a1a0e]">₹</span>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        placeholder="50"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        className="w-20 px-2 py-1 rounded-xl bg-white border border-[#3a1a0e] text-xs font-bold text-center"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. AI 1-Tap Review Assistant & Comments */}
              <div className="bg-white p-4 rounded-3xl border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Review / Personal Note
                  </span>

                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateAiReview}
                    className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>✨</span>
                    <span>{isGeneratingAi ? 'Generating...' : 'AI 1-Tap Write'}</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Sizzling hot pizza, super attentive server, definitely coming back!"
                  className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-[#3a1a0e] placeholder-slate-400 focus:outline-none focus:border-[#3a1a0e] focus:bg-white resize-none"
                />

                {/* Quick 1-Tap Review Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Pizza was crisp to perfection! 🍕',
                    'Arjun was super polite & quick! 🌟',
                    'Loved the stone-fired taste & music! ✨',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundService.playTactileClick('low');
                        setReviewComment(preset);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Review Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-medium text-sm uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⭐ Submit 1-Tap Review & Tip</span>
                <span className="text-sm">➔</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestReviewAndTipModal;
