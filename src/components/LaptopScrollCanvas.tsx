import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  ShieldCheck,
  ChevronDown,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// Register GSAP ScrollTrigger plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LaptopScrollCanvasProps {
  totalFrames?: number;
  prefix?: string;
  extension?: string;
  onOpenAnalyzer?: () => void;
  onOpenLimitedOffer?: () => void;
}

export const LaptopScrollCanvas: React.FC<LaptopScrollCanvasProps> = ({
  totalFrames = 100,
  prefix = '/frames/ezgif-frame-',
  extension = '.jpg',
  onOpenAnalyzer,
  onOpenLimitedOffer,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [fpsReadout, setFpsReadout] = useState(30);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeStoryStage, setActiveStoryStage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameTrackerRef = useRef<{ frame: number }>({ frame: 1 });
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  // Helper to format frame numbers (e.g. 1 -> "001")
  const getFrameUrl = useCallback(
    (index: number) => {
      const padded = Math.min(Math.max(1, index), totalFrames)
        .toString()
        .padStart(3, '0');
      return `${prefix}${padded}${extension}`;
    },
    [prefix, extension, totalFrames]
  );

  // Preload all 100 frames into memory
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadedCount += 1;
        const progress = Math.round((loadedCount / totalFrames) * 100);
        setLoadProgress(progress);

        if (loadedCount >= Math.min(15, totalFrames)) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        // Fallback for load errors
        loadedCount += 1;
        if (loadedCount >= totalFrames) setIsLoaded(true);
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
  }, [totalFrames, getFrameUrl]);

  // High-performance canvas drawing function with aspect ratio preservation
  const drawFrame = useCallback(
    (frameNum: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const idx = Math.min(Math.max(1, Math.round(frameNum)), totalFrames) - 1;
      const img = imagesRef.current[idx];

      if (img && img.complete && img.naturalWidth > 0) {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
          canvas.width = displayWidth * dpr;
          canvas.height = displayHeight * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background fill matching frame dark tone
        ctx.fillStyle = '#08090d';
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Aspect ratio contain logic
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = displayWidth / displayHeight;

        let drawWidth: number;
        let drawHeight: number;
        let offsetX: number;
        let offsetY: number;

        if (canvasAspect > imgAspect) {
          drawHeight = displayHeight;
          drawWidth = displayHeight * imgAspect;
          offsetX = (displayWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = displayWidth;
          drawHeight = displayWidth / imgAspect;
          offsetX = 0;
          offsetY = (displayHeight - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
      }
    },
    [totalFrames]
  );

  // Initialize GSAP ScrollTrigger
  useEffect(() => {
    if (!triggerRef.current || !containerRef.current) return;

    // Draw initial frame
    drawFrame(1);

    const tracker = frameTrackerRef.current;
    tracker.frame = 1;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top top',
        end: '+=2800',
        pin: true,
        scrub: 0.75, // Silky smooth inertia scrubbing
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const targetFrame = Math.max(1, Math.min(totalFrames, Math.round(1 + progress * (totalFrames - 1))));
          
          setScrollPercent(Math.round(progress * 100));
          setCurrentFrameIndex(targetFrame);
          drawFrame(targetFrame);

          // Update active storytelling stage based on progress
          if (progress < 0.28) {
            setActiveStoryStage(0);
          } else if (progress < 0.58) {
            setActiveStoryStage(1);
          } else if (progress < 0.84) {
            setActiveStoryStage(2);
          } else {
            setActiveStoryStage(3);
          }
        },
      });

      scrollTriggerInstanceRef.current = st;
    }, triggerRef);

    // Window resize handler
    const handleResize = () => {
      drawFrame(frameTrackerRef.current.frame);
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, [totalFrames, drawFrame]);

  // Handle auto-play toggle
  useEffect(() => {
    if (!isPlayingAuto) return;

    let animId: number;
    let lastTime = performance.now();
    const interval = 1000 / fpsReadout;

    const autoPlayLoop = (now: number) => {
      const delta = now - lastTime;
      if (delta >= interval) {
        lastTime = now - (delta % interval);
        setCurrentFrameIndex((prev) => {
          const next = prev >= totalFrames ? 1 : prev + 1;
          drawFrame(next);
          return next;
        });
      }
      animId = requestAnimationFrame(autoPlayLoop);
    };

    animId = requestAnimationFrame(autoPlayLoop);

    return () => cancelAnimationFrame(animId);
  }, [isPlayingAuto, fpsReadout, totalFrames, drawFrame]);

  // Interactive scrubber drag
  const handleSliderScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCurrentFrameIndex(val);
    drawFrame(val);
    const pct = ((val - 1) / (totalFrames - 1)) * 100;
    setScrollPercent(Math.round(pct));
  };

  const handleReset = () => {
    setCurrentFrameIndex(1);
    drawFrame(1);
    setIsPlayingAuto(false);
    if (scrollTriggerInstanceRef.current) {
      scrollTriggerInstanceRef.current.scroll(0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 4 Storytelling Milestones synchronized with the 30 FPS laptop closing sequence
  const storyMilestones = [
    {
      title: 'Active Intelligence Engine',
      subtitle: 'System Open & Monitoring',
      description:
        'Real-time automated lead routing, CRM synchronization, and AI Builder invoice parsing operate at sub-second latency.',
      badge: '01 / SYSTEM OPEN',
      icon: Zap,
      metric: '0.4s Response',
      statLabel: 'Lead Ingestion Speed',
    },
    {
      title: 'Autonomous Workflow Optimization',
      subtitle: 'Dynamic Resource Scaling',
      description:
        'Zero manual data entry. Microsoft Copilot Studio and Power Automate streamline cross-departmental operations.',
      badge: '02 / ARCHITECTURE IN MOTION',
      icon: Cpu,
      metric: '18.5 hrs',
      statLabel: 'Saved / Staff / Week',
    },
    {
      title: 'Precision Data Security & Consolidation',
      subtitle: 'Seamless Cloud Synthesis',
      description:
        'Enterprise-grade security rules, centralized cloud tables, and automated dispatch protocols eliminate SaaS sprawl.',
      badge: '03 / SYSTEM CONVERGENCE',
      icon: Layers,
      metric: '99.8%',
      statLabel: 'Process Accuracy',
    },
    {
      title: 'Mission Accomplished. Zero Inefficiency.',
      subtitle: 'Hardware-Level Elegance',
      description:
        'Shut down redundant overhead. Empower your team with a custom, tailored business setup built to scale indefinitely.',
      badge: '04 / DEPLOYMENT SEALED',
      icon: ShieldCheck,
      metric: '+35%',
      statLabel: 'Average Client ROI',
    },
  ];

  const currentMilestone = storyMilestones[activeStoryStage];

  return (
    <section
      ref={triggerRef}
      id="laptop-scroll-sequence-section"
      className="relative w-full bg-[#08090d] text-white select-none overflow-hidden"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={containerRef}
        className="relative w-full h-screen flex flex-col justify-between overflow-hidden bg-[#08090d]"
      >
        {/* Ambient Warm Amber & Orange Spotlight Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-amber-600/20 via-orange-600/15 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Top Header HUD Bar */}
        <div className="relative z-20 w-full px-4 sm:px-8 pt-20 sm:pt-24 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/15 bg-gradient-to-b from-[#08090d]/90 to-transparent backdrop-blur-md">
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
              <Flame className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-['Space_Grotesk',sans-serif]">
                  FAST Precision Canvas Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-[10px] font-mono text-amber-300 font-semibold">
                  30 FPS GSAP Scrub
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Scroll to scrub frame sequence • Laptop Closing Experience
              </p>
            </div>
          </div>

          {/* Right Live Telemetry Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Frame Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs font-mono text-slate-300 flex items-center gap-1.5 shadow-inner">
              <span className="text-slate-500">FRAME:</span>
              <span className="text-amber-400 font-bold">
                {currentFrameIndex.toString().padStart(3, '0')}
              </span>
              <span className="text-slate-500">/ {totalFrames}</span>
            </div>

            {/* Scroll Progress Meter */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-orange-500/20 text-xs font-mono text-slate-300 flex items-center gap-1.5 shadow-inner">
              <span className="text-slate-500">SCROLL:</span>
              <span className="text-orange-400 font-bold">{scrollPercent}%</span>
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Stage: High-DPI Canvas & Floating Story Panels */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-4 sm:px-8">
          {/* Preloader if assets are initializing */}
          {!isLoaded && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#08090d]/95 backdrop-blur-xl">
              <div className="w-12 h-12 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
              <div className="text-sm font-mono text-amber-300 font-semibold mb-2">
                Preloading High-Resolution Frames ({loadProgress}%)
              </div>
              <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-500/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Master Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full max-h-[75vh] object-contain drop-shadow-[0_20px_50px_rgba(245,158,11,0.25)] rounded-2xl select-none"
          />

          {/* Floating Luxury Story Callout (Left Side on Desktop) */}
          <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 max-w-sm hidden md:block z-20 pointer-events-auto">
            <div
              key={activeStoryStage}
              className="glass-panel-luxury p-5 rounded-2xl border border-amber-500/30 shadow-2xl glow-orange-sm animate-in fade-in slide-in-from-left-4 duration-300"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-2.5">
                <currentMilestone.icon className="w-3 h-3 text-amber-400" />
                <span>{currentMilestone.badge}</span>
              </div>

              <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk',sans-serif] tracking-tight leading-snug mb-1">
                {currentMilestone.title}
              </h3>

              <div className="text-xs text-amber-400/90 font-mono font-semibold mb-2">
                {currentMilestone.subtitle}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {currentMilestone.description}
              </p>

              {/* Stat highlight */}
              <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-white font-['Space_Grotesk',sans-serif]">
                    {currentMilestone.metric}
                  </div>
                  <div className="text-[10px] text-slate-400">{currentMilestone.statLabel}</div>
                </div>

                {onOpenAnalyzer && (
                  <button
                    onClick={onOpenAnalyzer}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Floating Quick Action (Right Side on Desktop) */}
          <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 max-w-xs hidden lg:block z-20 pointer-events-auto">
            <div className="glass-panel-luxury p-4 rounded-2xl border border-amber-500/20 shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Custom Architecture</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Replace 5+ disparate SaaS tools with one unified, bespoke operations engine.
              </p>
              {onOpenLimitedOffer && (
                <button
                  onClick={onOpenLimitedOffer}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <span>Claim $500 Credit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scroll Down Indication Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-400 text-[11px] font-mono pointer-events-none opacity-80 animate-bounce">
            <span>SCROLL DOWN TO SCRUB ANIMATION</span>
            <ChevronDown className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Bottom Interactive Playback & Scrubber Controls HUD */}
        <div className="relative z-20 w-full px-4 sm:px-8 py-3.5 bg-gradient-to-t from-[#08090d] via-[#08090d]/95 to-transparent border-t border-amber-500/15 backdrop-blur-md">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Scrubber slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">001</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={1}
                  max={totalFrames}
                  value={currentFrameIndex}
                  onChange={handleSliderScrub}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all shadow-inner"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">{totalFrames}</span>
            </div>

            {/* Sub-controls: Play/Pause, Reset, Speed */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingAuto(!isPlayingAuto)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all cursor-pointer"
                >
                  {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAuto ? 'Pause Playback' : 'Auto Play'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-amber-500/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-mono mr-1">FPS:</span>
                {[15, 24, 30, 60].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setFpsReadout(rate)}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                      fpsReadout === rate
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {rate}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
