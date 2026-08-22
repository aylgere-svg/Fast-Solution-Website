import React, { useState } from 'react';
import { TECH_STACK } from '../data/content.ts';
import { Wrench, CheckCircle2, Layers, Cpu, Cloud, Megaphone, Target } from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const renderToolIcon = (iconType: string) => {
    switch (iconType) {
      case 'power-platform':
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300">
            <Layers className="w-6 h-6" />
          </div>
        );
      case 'azure':
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-300">
            <Cloud className="w-6 h-6" />
          </div>
        );
      case 'copilot-studio':
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-300">
            <Cloud className="w-6 h-6" />
          </div>
        );
      case 'ai-builder':
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-amber-900/60 border border-amber-600/40 text-amber-300">
            <Cpu className="w-6 h-6" />
          </div>
        );
      case 'meta-ads':
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300">
            <Megaphone className="w-6 h-6" />
          </div>
        );
      case 'openai':
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            <Target className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300">
            <Cpu className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <section
      id="tech-stack"
      className="py-12 md:py-20 relative bg-transparent overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exact Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>ENTERPRISE ECOSYSTEM</span>
          </div>

          <h2
            id="tech-stack-header"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif] uppercase"
          >
            OUR GO TO TOOLS
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Industry-standard, secure frameworks powering our custom business solutions.
          </p>
        </div>

        {/* 4 Tech Stack Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TECH_STACK.map((tool, index) => {
            return (
              <div
                key={index}
                id={`tech-tool-${index}`}
                onMouseEnter={() => setSelectedTool(tool.name)}
                onMouseLeave={() => setSelectedTool(null)}
                className="glass-panel-luxury rounded-2xl p-6 flex flex-col justify-between border border-amber-500/20 hover:border-amber-500/50 relative overflow-hidden group transition-all duration-300"
              >
                {/* Subtle top accent gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    {renderToolIcon(tool.iconType)}
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-600/40">
                      Tier 1
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-300 transition-colors font-['Space_Grotesk',sans-serif]">
                    {tool.name}
                  </h3>

                  <div className="text-xs font-medium text-amber-400 mb-3">
                    {tool.category}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-5 font-normal">
                    {tool.description}
                  </p>
                </div>

                {/* Capabilities list */}
                <div className="pt-4 border-t border-amber-950/60 space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Capabilities
                  </div>
                  {tool.capabilities.map((cap, capIdx) => (
                    <div key={capIdx} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Integration Architecture strip */}
        <div className="mt-12 p-6 rounded-2xl bg-[#090b11] border border-amber-500/20 text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            <span className="text-amber-300 font-semibold">Seamlessly Integrated:</span> All tools connect natively with your existing Microsoft 365, Google Workspace, SQL databases, Stripe, and internal CRM/ERP software.
          </p>
        </div>
      </div>
    </section>
  );
};
