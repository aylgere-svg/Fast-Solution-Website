import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Maximize2,
  Minimize2,
  Gauge,
  Film,
  Zap,
} from 'lucide-react';

interface FrameSequencePlayerProps {
  totalFrames?: number;
  prefix?: string;
  extension?: string;
  autoPlay?: boolean;
  fps?: number;
  className?: string;
}

export const FrameSequencePlayer: React.FC<FrameSequencePlayerProps> = ({
  totalFrames = 100,
  prefix = '/frames/ezgif-frame-',
  extension = '.jpg',
  autoPlay = true,
  fps = 24,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackFps, setPlaybackFps] = useState(fps);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoverScrubbing, setIsHoverScrubbing] = useState(false);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Pad number to 3 digits (e.g. 1 -> "001")
  const formatFrameIndex = (index: number) => {
    return index.toString().padStart(3, '0');
  };

  // Preload all 100 frames
  useEffect(() => {
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameStr = formatFrameIndex(i);
      img.src = `${prefix}${frameStr}${extension}`;
      img.onload = () => {
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded >= Math.min(10, totalFrames)) {
          setIsLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [totalFrames, prefix, extension]);

  // Render current frame to canvas
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (img && img.complete && img.naturalWidth > 0) {
      // Auto adjust canvas resolution
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Update canvas on frame change
  useEffect(() => {
    renderFrame(currentFrame);
  }, [currentFrame, renderFrame]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying || isHoverScrubbing) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      return;
    }

    const interval = 1000 / playbackFps;

    const loop = (timestamp: number) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const delta = timestamp - lastFrameTimeRef.current;

      if (delta >= interval) {
        lastFrameTimeRef.current = timestamp - (delta % interval);
        setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, playbackFps, totalFrames, isHoverScrubbing]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setCurrentFrame(1);
    setIsPlaying(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCurrentFrame(val);
  };

  const handleMouseMoveScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoverScrubbing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const targetFrame = Math.max(1, Math.min(totalFrames, Math.round(percentage * totalFrames)));
    setCurrentFrame(targetFrame);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="ezgif-frame-sequence-player"
      className={`relative bg-slate-950/90 rounded-2xl border border-purple-800/40 shadow-2xl overflow-hidden backdrop-blur-xl ${className}`}
    >
      {/* Header bar with info */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-purple-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 font-['Space_Grotesk',sans-serif]">
              <span>Interactive 100-Frame Visualizer</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800/60 text-[10px] text-purple-300 font-mono">
                100 Frames
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              ezgif-frame-001.jpg → ezgif-frame-100.jpg
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scrub Mode Toggle */}
          <button
            onClick={() => setIsHoverScrubbing(!isHoverScrubbing)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isHoverScrubbing
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Toggle cursor hover scrubbing mode"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cursor Scrub</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-600 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Display Viewport */}
      <div
        className="relative w-full aspect-video sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair group"
        onMouseMove={handleMouseMoveScrub}
      >
        {/* Loading overlay if initial frames not loaded */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20">
            <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
            <p className="text-xs text-purple-300 font-mono">
              Loading frames ({loadedCount}/{totalFrames})...
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain max-h-[540px] drop-shadow-md select-none pointer-events-none"
        />

        {/* Floating Frame Badge */}
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-slate-950/80 border border-purple-800/50 backdrop-blur-md text-[11px] font-mono text-purple-300 shadow-lg">
          Frame: <span className="text-white font-bold">{formatFrameIndex(currentFrame)}</span> / {totalFrames}
        </div>

        {/* Hover Scrub Prompt */}
        {isHoverScrubbing && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-700/60 text-[11px] text-purple-200 backdrop-blur-md pointer-events-none shadow-lg animate-pulse">
            Move mouse horizontally across screen to scrub frames
          </div>
        )}
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="p-4 bg-slate-900/95 border-t border-purple-900/40 space-y-3">
        {/* Scrubber Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">001</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={1}
              max={totalFrames}
              value={currentFrame}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400">{totalFrames}</span>
        </div>

        {/* Buttons and FPS selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to frame 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed / FPS Selector */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-400 mr-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Speed:</span>
            </div>
            {[12, 24, 30, 60].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackFps(rate)}
                className={`px-2 py-1 rounded-md font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  playbackFps === rate
                    ? 'bg-purple-900/80 text-purple-200 border border-purple-600 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {rate} FPS
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
