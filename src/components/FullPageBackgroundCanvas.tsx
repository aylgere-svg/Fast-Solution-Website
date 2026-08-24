import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameUrls, firstFrameUrl, getFallbackFrameUrl } from '../utils/frameLoader';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FullPageBackgroundCanvasProps {
  totalFrames?: number;
}

export const FullPageBackgroundCanvas: React.FC<FullPageBackgroundCanvasProps> = ({
  totalFrames = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(1);
  const lastDrawnFrameRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number | null>(null);

  // Initial frame URL
  const initialUrl = firstFrameUrl;
  const [currentFrameUrl, setCurrentFrameUrl] = useState<string>(initialUrl);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Balanced 70% Transparency Clarity (30% subtle dark overlay for optimal contrast)
  const overlayDarkness = 10;

  // Reliable URL retriever
  const getFrameUrl = useCallback(
    (index: number) => {
      const idx = Math.min(Math.max(1, index), totalFrames) - 1;
      if (frameUrls && frameUrls[idx]) {
        return frameUrls[idx];
      }
      return getFallbackFrameUrl(index);
    },
    [totalFrames]
  );

  // High-performance crystal-clear drawing function with HD crisp boost & mobile support
  const renderFrame = useCallback(
    (frameNum: number) => {
      const target = Math.min(Math.max(1, Math.round(frameNum)), totalFrames);
      currentFrameRef.current = target;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const idx = target - 1;
      const img = imagesRef.current[idx];

      const url = getFrameUrl(target);
      setCurrentFrameUrl(url);

      if (!img || !img.complete || img.naturalWidth === 0) {
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      // Handle high-density mobile and desktop retina displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const width = window.innerWidth || document.documentElement.clientWidth;
      const height = window.innerHeight || document.documentElement.clientHeight;

      const targetWidth = Math.round(width * dpr);
      const targetHeight = Math.round(height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear for fresh frame draw
      ctx.clearRect(0, 0, width, height);

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Fit the frame inside phone screens so the full subject remains visible.
      const hRatio = width / imgWidth;
      const vRatio = height / imgHeight;
      const isPhone = window.matchMedia('(max-width: 767px)').matches;
      const ratio = isPhone ? Math.min(hRatio, vRatio) * 0.88 : Math.max(hRatio, vRatio);

      const drawWidth = imgWidth * ratio;
      const drawHeight = imgHeight * ratio;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      ctx.drawImage(img, 0, 0, imgWidth, imgHeight, offsetX, offsetY, drawWidth, drawHeight);

      ctx.restore();
      lastDrawnFrameRef.current = target;
      setIsLoaded(true);
    },
    [totalFrames, getFrameUrl]
  );

  // Preload all frames immediately for instant responsive playback
  useEffect(() => {
    const count = Math.max(totalFrames, frameUrls.length);
    const loadedImages: HTMLImageElement[] = new Array(count);
    imagesRef.current = loadedImages;

    let firstFrameLoaded = false;

    for (let i = 1; i <= count; i++) {
      const img = new Image();
      loadedImages[i - 1] = img;

      img.onload = () => {
        if (i === 1 || (!firstFrameLoaded && i === currentFrameRef.current)) {
          firstFrameLoaded = true;
          renderFrame(currentFrameRef.current);
        }
      };

      img.src = getFrameUrl(i);

      if (img.complete && img.naturalWidth > 0 && i === 1) {
        firstFrameLoaded = true;
        renderFrame(1);
      }
    }

    const checkTimer = setInterval(() => {
      if (lastDrawnFrameRef.current > 0) {
        clearInterval(checkTimer);
      } else {
        renderFrame(1);
      }
    }, 50);

    return () => {
      clearInterval(checkTimer);
    };
  }, [totalFrames, getFrameUrl, renderFrame]);

  // Master scroll listener + GSAP ScrollTrigger scrubbing
  useEffect(() => {
    renderFrame(1);

    // Direct window scroll calculation with requestAnimationFrame
    const updateFromScroll = () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

      animFrameIdRef.current = requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const maxScroll = Math.max(
          1,
          (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
        );
        const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
        const targetFrame = Math.max(
          1,
          Math.min(totalFrames, Math.round(1 + progress * (totalFrames - 1)))
        );

        if (targetFrame !== lastDrawnFrameRef.current) {
          renderFrame(targetFrame);
        }
      });
    };

    window.addEventListener('scroll', updateFromScroll, { passive: true });

    // GSAP ScrollTrigger linked to document scroll
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1, // Ultra-responsive scrubbing on touch and desktop
        onUpdate: (self) => {
          const progress = self.progress;
          const targetFrame = Math.max(
            1,
            Math.min(totalFrames, Math.round(1 + progress * (totalFrames - 1)))
          );
          if (targetFrame !== lastDrawnFrameRef.current) {
            renderFrame(targetFrame);
          }
        },
      });
    });

    const handleResize = () => {
      const frameToDraw = lastDrawnFrameRef.current > 0 ? lastDrawnFrameRef.current : 1;
      renderFrame(frameToDraw);
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('scroll', updateFromScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      ctx.revert();
    };
  }, [totalFrames, renderFrame]);

  return (
    <div
      id="fullpage-background-canvas-wrapper"
      className="fixed inset-0 w-full h-full min-h-[100dvh] pointer-events-none z-0 overflow-hidden select-none bg-[#0a0c10]"
      style={{
        backgroundImage: `url(${firstFrameUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    >
      {/* 1. Instant Hardware Fallback Image Layer with HD Crisp Boost */}
      <img
        id="background-frame-img-fallback"
        src={currentFrameUrl}
        alt=""
        className={`absolute inset-0 z-0 w-full h-full min-h-[100dvh] object-contain md:object-cover transition-opacity duration-200 contrast-[1.08] brightness-[1.02] saturate-[1.06] ${
          isLoaded ? 'opacity-100' : 'opacity-90'
        }`}
        style={{
          width: '100vw',
          height: '100vh',
          objectPosition: 'center center',
        }}
        onLoad={() => setIsLoaded(true)}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          setCurrentFrameUrl(firstFrameUrl);
        }}
      />

      {/* 2. High-DPI Canvas with HD Crisp Boost (Renders Rotating Frame Sequence) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full min-h-[100dvh] object-contain md:object-cover contrast-[1.08] brightness-[1.02] saturate-[1.06]"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* 3. Balanced 70% Background Transparency Clarity (30% subtle dark tint) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none bg-black"
        style={{ opacity: overlayDarkness / 100 }}
      />

      {/* 4. Permanent Cinematic Edge Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_55%,rgba(6,7,10,0.65)_100%] pointer-events-none" />

      {/* 5. Responsive Phone Screen Mobile Ambient Gradient */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
};
