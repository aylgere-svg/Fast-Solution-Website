import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { BRAND } from '../data/content.ts';

interface HeroProps {
  onOpenLimitedOffer: () => void;
  onOpenAnalyzer: () => void;
  onNavigateToContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenLimitedOffer,
  onOpenAnalyzer,
  onNavigateToContact,
}) => {
  return (
    <section
      id="hero-section"
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-transparent"
    >
      {/* Subtle ambient highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-600/10 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Exact Headline - Minimal & High Contrast */}
        <h1
          id="hero-headline"
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-5 font-['Space_Grotesk',sans-serif]"
        >
          Empower Your Business with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
            Custom Solutions
          </span>
        </h1>

        {/* Minimalist Action Buttons */}
        <div className="flex flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={onOpenLimitedOffer}
            id="hero-primary-cta"
            className="px-6 py-3 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAnalyzer}
            id="hero-secondary-cta"
            className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Launch Analyzer</span>
          </button>
        </div>
      </div>
    </section>
  );
};
