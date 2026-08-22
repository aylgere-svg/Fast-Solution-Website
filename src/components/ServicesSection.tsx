import React, { useState } from 'react';
import { Cpu, LayoutGrid, Globe, ArrowRight, Check, Sparkles, Zap, Layers, BarChart3, Flame } from 'lucide-react';
import { SERVICES } from '../data/content.ts';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
  onOpenAnalyzer: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onOpenAnalyzer,
}) => {
  const [activeServiceId, setActiveServiceId] = useState<string>('ai-automation');

  const getIcon = (name: string) => {
    switch (name) {
      case 'Cpu':
        return <Cpu className="w-7 h-7 text-amber-400" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-7 h-7 text-amber-400" />;
      case 'Globe':
        return <Globe className="w-7 h-7 text-amber-400" />;
      default:
        return <Zap className="w-7 h-7 text-amber-400" />;
    }
  };

  return (
    <section
      id="services"
      className="py-12 md:py-20 relative bg-transparent"
    >
      {/* Background ambient lighting matching sunset amber tone */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SERVICES</span>
          </div>

          <h2
            id="services-subtitle"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]"
          >
            Taking Your Business to the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Next Level
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Tailored enterprise solutions built with precision, speed, and cost efficiency.
          </p>
        </div>

        {/* 3 Grid Columns of Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service) => {
            const isSelected = activeServiceId === service.id;
            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onClick={() => setActiveServiceId(service.id)}
                className={`glass-panel-luxury rounded-2xl p-7 md:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-amber-500/60 bg-[#121622] shadow-xl shadow-orange-950/50 -translate-y-1.5 glow-orange-sm'
                    : 'border-amber-500/20 hover:border-amber-500/40 hover:bg-[#0f131d]'
                }`}
              >
                {/* Top Badge & Corner Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-bl-full blur-xl pointer-events-none group-hover:bg-amber-600/20 transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-200">
                      {getIcon(service.iconName)}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/40 text-amber-300">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors font-['Space_Grotesk',sans-serif]">
                    {service.title}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                    {service.description}
                  </p>

                  {/* Bullet capabilities */}
                  <div className="space-y-2.5 pt-4 border-t border-amber-950/60 mb-8">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2">
                      Key Capabilities
                    </div>
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(service.title);
                    }}
                    id={`service-cta-${service.id}`}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-md"
                  >
                    <span>Request {service.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Analyzer Banner under Services */}
        <div className="mt-14 glass-panel-luxury rounded-2xl p-6 sm:p-8 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-amber-950/50 via-[#0d101a] to-orange-950/40">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 hidden sm:flex">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                Unsure which custom solution fits your current bottlenecks?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Run our 60-second interactive diagnostic to pinpoint high-ROI automation targets.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAnalyzer}
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            Launch Analyzer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
