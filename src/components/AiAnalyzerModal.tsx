import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  Cpu,
  LayoutGrid,
  Globe,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronRight,
  Layers,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (solutionName: string, notes: string) => void;
}

export const AiAnalyzerModal: React.FC<AiAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bottleneck, setBottleneck] = useState<string>('manual-data');
  const [teamSize, setTeamSize] = useState<string>('5-15');
  const [currentTools, setCurrentTools] = useState<string[]>(['Excel / Spreadsheets', 'Email & Slack']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const bottlenecks = [
    {
      id: 'manual-data',
      title: 'Manual Data Entry & Invoicing',
      desc: 'Employees spending hours copying info between forms, emails, and spreadsheets.',
      recommended: 'AI Automation & AI Builder',
    },
    {
      id: 'lead-followup',
      title: 'Slow Lead Response & Inquiries',
      desc: 'Inbound leads getting delayed or falling through the cracks without automated triage.',
      recommended: 'Microsoft Copilot Studio & OpenAI Agents',
    },
    {
      id: 'fragmented-tools',
      title: 'Fragmented Tools & No Central App',
      desc: 'Information scattered across 5+ disconnected SaaS tools with zero unified tracking.',
      recommended: 'Custom Business Applications & Power Platform',
    },
    {
      id: 'outdated-web',
      title: 'Underperforming Website & Ads',
      desc: 'Website is slow or not converting ad spend into qualified booked consultations.',
      recommended: 'Website Creation and Ads',
    },
  ];

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(3);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ea580c', '#d97706'],
        });
      } catch (err) {}
    }, 1200);
  };

  const getRecommendations = () => {
    switch (bottleneck) {
      case 'manual-data':
        return {
          title: 'AI Automation Suite',
          serviceName: 'AI Automation',
          tools: ['AI Builder', 'Microsoft Power Platform', 'ChatGPT / OpenAI'],
          hoursSaved: '40 - 65 hrs/month',
          roi: '35% - 48%',
          summary:
            'Deploy automated document parsers and Power Automate background workers to ingest invoices and forms automatically without human data-entry bottlenecks.',
        };
      case 'lead-followup':
        return {
          title: 'Autonomous Lead & Copilot Engine',
          serviceName: 'AI Automation',
          tools: ['Microsoft Copilot Studio', 'ChatGPT / OpenAI', 'Microsoft Power Platform'],
          hoursSaved: '50 - 80 hrs/month',
          roi: '45% - 60%',
          summary:
            'Implement 24/7 Copilot agent responders that qualify incoming leads in under 15 seconds, schedule meetings, and route high-value deals directly.',
        };
      case 'fragmented-tools':
        return {
          title: 'Unified Custom Cloud Business Application',
          serviceName: 'Business Applications',
          tools: ['Microsoft Power Platform', 'Custom Cloud Portal', 'AI Builder'],
          hoursSaved: '60 - 110 hrs/month',
          roi: '35% - 50%',
          summary:
            'Consolidate disparate spreadsheets into a unified role-based cloud app with custom workflows, inventory tracking, and client dashboards built in days.',
        };
      case 'outdated-web':
      default:
        return {
          title: 'High-Converting Web & Ad Monetization Platform',
          serviceName: 'Website Creation and Ads',
          tools: ['Modern Responsive Web Engine', 'Ad Campaign Integrations', 'OpenAI Copy Optimization'],
          hoursSaved: '30 - 50 hrs/month',
          roi: '35% - 55%',
          summary:
            'Redesign internal and external web presence with modern architecture, targeted lead funnels, and automated ad monetization tracking.',
        };
    }
  };

  const rec = getRecommendations();

  return (
    <div
      id="ai-analyzer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="ai-analyzer-modal-content"
        className="relative w-full max-w-2xl glass-panel-luxury bg-[#0f1118] rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl glow-orange overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-analyzer-modal-btn"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 border border-amber-900/40 hover:bg-slate-800 transition-colors"
          aria-label="Close analyzer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 pr-8">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
              Process Analyzer
            </h3>
            <p className="text-xs text-amber-300">
              FAST Solutions Automated Diagnostic Blueprint
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6 text-xs font-semibold text-slate-400 border-b border-amber-950/80 pb-3">
          <span className={`px-2.5 py-0.5 rounded-full ${step >= 1 ? 'bg-amber-900/80 text-amber-200' : 'bg-slate-800'}`}>
            1. Bottlenecks
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`px-2.5 py-0.5 rounded-full ${step >= 2 ? 'bg-amber-900/80 text-amber-200' : 'bg-slate-800'}`}>
            2. Scope
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`px-2.5 py-0.5 rounded-full ${step >= 3 ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'bg-slate-800'}`}>
            3. Custom Blueprint
          </span>
        </div>

        {/* Step 1: Bottleneck selection */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-sm font-semibold text-white">
              Where does your team lose the most hours each week?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bottlenecks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setBottleneck(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    bottleneck === item.id
                      ? 'bg-amber-950/70 border-amber-500 shadow-md shadow-orange-950/40'
                      : 'bg-slate-900/60 border-amber-900/30 hover:border-amber-700/50 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-bold text-white mb-1 font-['Space_Grotesk',sans-serif]">
                      {item.title}
                    </div>
                    {bottleneck === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Team Size & Current Environment */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Team Size Involved in Daily Operations
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1-4', '5-15', '16-50', '50+'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setTeamSize(sz)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      teamSize === sz
                        ? 'bg-amber-900/90 text-white border-amber-500'
                        : 'bg-slate-900 text-slate-300 border-amber-900/40 hover:bg-slate-800'
                    }`}
                  >
                    {sz} people
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Primary Software Used Today
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Excel / Spreadsheets',
                  'Microsoft 365',
                  'Google Workspace',
                  'QuickBooks / Accounting',
                  'HubSpot / Salesforce / CRM',
                  'Custom Legacy Systems',
                ].map((toolName) => {
                  const isChecked = currentTools.includes(toolName);
                  return (
                    <button
                      key={toolName}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setCurrentTools(currentTools.filter((t) => t !== toolName));
                        } else {
                          setCurrentTools([...currentTools, toolName]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                          : 'bg-slate-900/60 border-amber-900/30 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{toolName}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-950/50"
              >
                {isAnalyzing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Blueprint...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Custom AI Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generated Blueprint Results */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Recommendation Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-[#16141a] to-slate-900 border-2 border-amber-500/60 shadow-lg glow-orange-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Recommended Architecture
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  High Impact Fit
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk',sans-serif]">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {rec.summary}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-900/60">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-900/30 text-center">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Monthly Time Saved
                  </div>
                  <div className="text-lg font-bold text-amber-300 font-mono mt-1">
                    {rec.hoursSaved}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-900/30 text-center">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Projected Client ROI
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    {rec.roi}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Restart Analyzer
              </button>
              <button
                onClick={() => {
                  onSelectResult(
                    rec.serviceName,
                    `Generated from Free AI Analyzer: Recommended ${rec.title} for ${teamSize} person team handling ${bottleneck}.`
                  );
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-orange-950/50"
              >
                <span>Deploy This Blueprint with FAST Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
