import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Clock, Gift, ArrowRight, ShieldCheck, Zap, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BRAND } from '../data/content.ts';

interface LimitedOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimOffer: (name: string, email: string) => void;
}

export const LimitedOfferModal: React.FC<LimitedOfferModalProps> = ({
  isOpen,
  onClose,
  onClaimOffer,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 59, seconds: 42 });

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setClaimed(true);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ea580c', '#d97706', '#fbbf24'],
      });
    } catch (err) {}

    // Launch Outlook booking portal
    const bookingUrl = BRAND.bookingUrl || 'https://outlook.office.com/book/FASsolution@FASSolutions.onmicrosoft.com/?ismsaljsauthenabled';
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      onClaimOffer(name, email);
    }, 1500);
  };

  return (
    <div
      id="limited-offer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="limited-offer-modal-content"
        className="relative w-full max-w-xl glass-panel-luxury bg-[#0f1118] rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl glow-orange overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-offer-modal-btn"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 border border-amber-900/40 hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>2026 Special Client Package</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk',sans-serif] mb-2">
          Unlock $500 Credit + Free Custom Architecture Blueprint
        </h3>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Ready to eliminate operational chaos? Claim this limited-time client package to get our senior engineers (ex-US enterprise veterans) to build your custom software with zero overhead.
        </p>

        {/* What's Included */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-2.5 mb-6 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-white">$500 Instant Credit</strong> applied to your first custom app or AI pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-white">Full 1-on-1 Architecture Audit</strong> by Fayl & Soliyana (Value $1,200)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-white">48-Hour Working Prototype Guarantee</strong> for rapid review</span>
          </div>
        </div>

        {claimed ? (
          <div className="text-center py-6 space-y-2 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-white">Voucher Reserved!</div>
            <p className="text-xs text-slate-300">
              Transferring you to project setup with your $500 credit locked in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="submit"
              id="claim-offer-submit-btn"
              className="w-full py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 shadow-xl shadow-orange-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lock In Limited Offer & $500 Credit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero obligation • Direct access to FAST Solutions senior engineers</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
