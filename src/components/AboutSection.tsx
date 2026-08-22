import React from 'react';
import { ABOUT_CONTENT, BRAND } from '../data/content.ts';
import { ShieldCheck, Award, Zap, CheckCircle2, ArrowRight, Building2, Sparkles, Flame } from 'lucide-react';

interface AboutSectionProps {
  onNavigateToContact: () => void;
  onOpenAnalyzer: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onNavigateToContact,
  onOpenAnalyzer,
}) => {
  return (
    <section
      id="about"
      className="py-12 md:py-20 relative bg-transparent overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Story & Pillars */}
          <div className="lg:col-span-7">
            {/* Header: "ABOUT" */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{ABOUT_CONTENT.header}</span>
            </div>

            {/* Title: "Our Experts Are the Finest" */}
            <h2
              id="about-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif] mb-6"
            >
              Our Experts Are the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                Finest
              </span>
            </h2>

            {/* Exact Body Text */}
            <div className="space-y-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {ABOUT_CONTENT.paragraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-amber-950/60">
              {ABOUT_CONTENT.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20"
                >
                  <div className="text-sm font-bold text-white mb-1 font-['Space_Grotesk',sans-serif]">
                    {pillar.title}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={onNavigateToContact}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Speak with Our Engineers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAnalyzer}
                className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-600/40 text-amber-300 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Run Free Tech Audit
              </button>
            </div>
          </div>

          {/* Right Column: Visual Infographic of Enterprise vs Standard vs FAST Solutions */}
          <div className="lg:col-span-5">
            <div className="glass-panel-luxury rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2">
                <Award className="w-4 h-4" />
                The FAST Solutions Difference
              </div>

              <div className="space-y-4">
                {/* Standard Approach */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1 text-xs font-semibold text-slate-400">
                    <span>Off-The-Shelf SaaS</span>
                    <span className="text-rose-400">Rigid & Costly</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    High monthly per-user fees, fragmented subscriptions, rigid workflows that force you to adapt to them.
                  </p>
                </div>

                {/* Big Agency Approach */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1 text-xs font-semibold text-slate-400">
                    <span>Traditional Big-Tech Agencies</span>
                    <span className="text-amber-400">Slow & Enterprise-Only</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    $50k+ minimum retainers, 6-month discovery phases, and endless corporate red tape.
                  </p>
                </div>

                {/* FAST Solutions Approach */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/80 via-[#151218] to-slate-900 border-2 border-amber-500/60 shadow-lg glow-orange-sm">
                  <p className="text-xs text-amber-100 font-medium leading-relaxed">
                    Fortune-500 enterprise architectures custom-built specifically for your business in days at an affordable, predictable price.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-amber-800/40 text-[11px] text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Custom Built for You</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Affordable Flat Pricing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>US Enterprise Experts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Overhead</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Badge */}
              <div className="mt-6 pt-4 border-t border-amber-900/40 flex items-center justify-center text-xs text-slate-400">
                <span className="text-amber-400 font-medium">Serving Clients Nationwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
