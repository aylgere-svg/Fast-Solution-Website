import React from 'react';
import { FrameSequencePlayer } from './FrameSequencePlayer.tsx';
import { Sparkles, Eye, Layers, Cpu } from 'lucide-react';

interface InteractiveFrameShowcaseProps {
  onOpenAnalyzer?: () => void;
}

export const InteractiveFrameShowcase: React.FC<InteractiveFrameShowcaseProps> = ({
  onOpenAnalyzer,
}) => {
  return (
    <section
      id="frames-showcase"
      className="py-16 md:py-24 bg-slate-950/60 border-y border-purple-950/50 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/40 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>High-Speed Visual Sequence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif] mb-4">
            Interactive Animation &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              Frame Engine
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Loaded all 100 high-fidelity frames seamlessly into the sequence renderer. Use the interactive scrubber, toggle hover scrubbing, or adjust playback speed.
          </p>
        </div>

        {/* 100 Frame Sequence Player */}
        <div className="max-w-4xl mx-auto">
          <FrameSequencePlayer
            totalFrames={100}
            prefix="/frames/ezgif-frame-"
            extension=".jpg"
            fps={24}
            autoPlay={true}
          />
        </div>

        {/* Quick feature highlights below player */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-900/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-800/50 flex items-center justify-center text-purple-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100 JPG Frames</h4>
              <p className="text-xs text-slate-400 mt-0.5">Preloaded & cached for zero-lag 60 FPS playback and instant seeking.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-900/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-800/50 flex items-center justify-center text-indigo-300 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cursor Scrubbing</h4>
              <p className="text-xs text-slate-400 mt-0.5">Interactive hover scrub allows precise frame-by-frame inspection.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-900/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-900/40 border border-violet-800/50 flex items-center justify-center text-violet-300 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hardware Accelerated</h4>
              <p className="text-xs text-slate-400 mt-0.5">HTML5 Canvas engine with automatic aspect ratio fitting and full-screen mode.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
