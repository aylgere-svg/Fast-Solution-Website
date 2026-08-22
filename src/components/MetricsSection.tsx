import React from 'react';
import { METRICS } from '../data/content.ts';
import {
  TrendingUp,
  Layout,
  Database,
  ShieldCheck,
  Cloud,
  ArrowUpRight,
} from 'lucide-react';

interface MetricsSectionProps {
  onOpenAnalyzer: () => void;
  onNavigateToContact: () => void;
}

const CORE_PILLARS = [
  {
    id: 'frontend-design',
    title: 'Frontend Design',
    subtext: 'UI/UX wireframes & immersive visual interfaces',
    icon: Layout,
    accent: 'from-amber-500/20 to-orange-500/10',
    borderGlow: 'group-hover:border-amber-400 group-hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]',
    iconColor: 'text-amber-400',
  },
  {
    id: 'backend-engineering',
    title: 'Backend Engineering',
    subtext: 'Scalable databases and high-performance APIs',
    icon: Database,
    accent: 'from-orange-500/20 to-amber-600/10',
    borderGlow: 'group-hover:border-orange-400 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.3)]',
    iconColor: 'text-orange-400',
  },
  {
    id: 'security-automation',
    title: 'Security & Automation',
    subtext: 'Enterprise-grade security and smart workflow automation',
    icon: ShieldCheck,
    accent: 'from-amber-600/20 to-emerald-600/10',
    borderGlow: 'group-hover:border-emerald-400 group-hover:shadow-[0_0_24px_rgba(52,211,153,0.25)]',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'hosting-maintenance',
    title: 'Hosting & Maintenance',
    subtext: 'High-speed cloud deployment and continuous support',
    icon: Cloud,
    accent: 'from-amber-500/20 to-cyan-600/10',
    borderGlow: 'group-hover:border-cyan-400 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]',
    iconColor: 'text-cyan-400',
  },
];

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  onOpenAnalyzer,
  onNavigateToContact,
}) => {
  return (
    <section id="metrics" className="py-12 md:py-20 relative overflow-hidden bg-transparent">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exact Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Proven Track Record</span>
          </div>
          <h2
            id="metrics-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]"
          >
            We’re Good with Numbers
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Real metrics from custom architectures deployed for fast-growing businesses.
          </p>
        </div>

        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {METRICS.map((metric, index) => (
            <div
              key={index}
              id={`metric-card-${index}`}
              className="glass-panel-luxury rounded-2xl p-8 text-center relative overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group"
            >
              {/* Card top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400" />

              <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-100 to-amber-400 tracking-tight font-['Space_Grotesk',sans-serif] mb-3 group-hover:scale-105 transition-transform">
                {metric.value}
              </div>

              <div className="text-lg font-bold text-slate-100 mb-2">
                {metric.label}
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {metric.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Core Pillars 4-Column Responsive Grid with Neon Hover Micro-Animations */}
        <div
          id="core-pillars-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {CORE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                id={`pillar-card-${pillar.id}`}
                onClick={onNavigateToContact}
                className={`group relative glass-panel-luxury rounded-2xl p-6 border border-amber-500/20 bg-slate-900/60 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-2 hover:bg-slate-900/90 ${pillar.borderGlow}`}
              >
                {/* Top Subtle Gradient Light */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${pillar.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Header with Icon and Outward Arrow */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-white/10 group-hover:border-amber-400/40 flex items-center justify-center transition-colors duration-300">
                        <Icon className={`w-6 h-6 ${pillar.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-amber-300 group-hover:bg-amber-500/10 transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110" />
                      </div>
                    </div>

                    {/* Pillar Title */}
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif] mb-2 tracking-tight group-hover:text-amber-200 transition-colors">
                      {pillar.title}
                    </h3>

                    {/* Subtext */}
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      {pillar.subtext}
                    </p>
                  </div>

                  {/* Bottom glowing underline accent */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 group-hover:text-amber-400/80 transition-colors">
                      Core Pillar
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_rgba(245,158,11,1)] transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
