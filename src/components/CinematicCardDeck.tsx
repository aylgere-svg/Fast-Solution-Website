import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hero } from './Hero.tsx';
import { ServicesSection } from './ServicesSection.tsx';
import { MetricsSection } from './MetricsSection.tsx';
import { AboutSection } from './AboutSection.tsx';
import { TestimonialsSection } from './TestimonialsSection.tsx';
import { TechStackSection } from './TechStackSection.tsx';
import { ContactSection } from './ContactSection.tsx';
import { Footer } from './Footer.tsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CinematicCardDeckProps {
  onOpenLimitedOffer: () => void;
  onOpenAnalyzer: () => void;
  onNavigateToContact: () => void;
  onSelectService: (serviceName: string) => void;
  selectedServicePreload: string;
  onOpenAdmin?: () => void;
}

export const CinematicCardDeck: React.FC<CinematicCardDeckProps> = ({
  onOpenLimitedOffer,
  onOpenAnalyzer,
  onNavigateToContact,
  onSelectService,
  selectedServicePreload,
  onOpenAdmin,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const cardTitles = [
    { title: 'Intro', label: '01 Hero', id: 'hero' },
    { title: 'Services', label: '02 Solutions', id: 'services' },
    { title: 'ROI & Stats', label: '03 Metrics', id: 'metrics' },
    { title: 'About Us', label: '04 Experts', id: 'about' },
    { title: 'Feedback', label: '05 Reviews', id: 'testimonials' },
    { title: 'Tech Stack', label: '06 Ecosystem', id: 'tech-stack' },
    { title: 'Contact', label: '07 Consult', id: 'contact' },
  ];

  const totalCards = 7;

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    if (window.matchMedia('(max-width: 1023px)').matches) return;

    const ctx = gsap.context(() => {
      // Horizontal Scroll Animation:
      // When scrolling down, track translates smoothly to the LEFT (xPercent: 0 -> -((totalCards - 1) / totalCards) * 100)
      // When scrolling up, track translates smoothly to the RIGHT
      const scrollTween = gsap.to(track, {
        xPercent: -100 * ((totalCards - 1) / totalCards),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${(totalCards - 1) * window.innerHeight * 1.3}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.6, // Luxurious, silky smooth scrub
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const raw = self.progress * (totalCards - 1);
            const idx = Math.min(totalCards - 1, Math.max(0, Math.round(raw)));
            setActiveCardIndex(idx);
          },
        },
      });

      // Subtle parallax on inner content containers as they scroll into view horizontally
      slidesRef.current.forEach((slide, index) => {
        if (!slide) return;
        const innerContent = slide.querySelector('.slide-inner-content');
        if (innerContent && index > 0) {
          gsap.fromTo(
            innerContent,
            { x: 60, opacity: 0.6 },
            {
              x: 0,
              opacity: 1,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: slide,
                containerAnimation: scrollTween,
                start: 'left right',
                end: 'center center',
                scrub: 0.5,
              },
            }
          );
        }
      });
    }, containerRef);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      ctx.revert();
    };
  }, [totalCards]);

  // Jump smoothly to a specific horizontal slide
  const scrollToCard = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia('(max-width: 1023px)').matches) {
      slidesRef.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const st = ScrollTrigger.getAll().find((s) => s.trigger === container);
    if (st && st.start !== undefined && st.end !== undefined) {
      const targetScroll = st.start + (index / (totalCards - 1)) * (st.end - st.start);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    } else {
      const targetScroll = (index / (totalCards - 1)) * (window.innerHeight * (totalCards - 1) * 1.3);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (Math.abs(diffX) > 60) {
      if (diffX > 0 && activeCardIndex < totalCards - 1) {
        scrollToCard(activeCardIndex + 1);
      } else if (diffX < 0 && activeCardIndex > 0) {
        scrollToCard(activeCardIndex - 1);
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      id="cards-deck-wrapper"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-auto min-h-[100dvh] lg:h-[100dvh] lg:min-h-[100dvh] overflow-visible bg-transparent select-none touch-pan-y"
    >
      {/* Horizontal Sliding Track (Scrolls Left on Scroll Down, Scrolls Right on Scroll Up) */}
      <div
        ref={trackRef}
        id="horizontal-scroll-track"
        className="flex flex-col lg:flex-row flex-nowrap h-auto lg:h-full w-full lg:w-[700vw] max-w-full lg:max-w-none will-change-transform bg-transparent"
      >
        {/* SLIDE 0: HERO */}
        <div
          ref={(el) => (slidesRef.current[0] = el)}
          id="slide-0-hero"
          className="w-full lg:w-screen h-auto lg:h-full min-h-[70dvh] lg:min-h-[100dvh] flex flex-col justify-center shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-auto lg:h-full overflow-visible lg:overflow-visible flex flex-col justify-center pt-16 pb-10 sm:pt-20 sm:pb-16 lg:pt-16 lg:pb-8 overscroll-contain bg-transparent">
            <Hero
              onOpenLimitedOffer={onOpenLimitedOffer}
              onOpenAnalyzer={onOpenAnalyzer}
              onNavigateToContact={() => scrollToCard(6)}
            />
          </div>
        </div>

        {/* SLIDE 1: SERVICES */}
        <div
          ref={(el) => (slidesRef.current[1] = el)}
          id="slide-1-services"
          className="flex w-full lg:w-screen h-auto lg:h-full min-h-[80dvh] lg:min-h-[100dvh] flex-col justify-center shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-full overflow-y-auto lg:overflow-visible flex flex-col justify-center pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-16 lg:pb-8 overscroll-contain bg-transparent">
            <ServicesSection
              onSelectService={(service) => {
                onSelectService(service);
                scrollToCard(6);
              }}
              onOpenAnalyzer={onOpenAnalyzer}
            />
          </div>
        </div>

        {/* SLIDE 2: METRICS & ROI */}
        <div
          ref={(el) => (slidesRef.current[2] = el)}
          id="slide-2-metrics"
          className="flex w-full lg:w-screen h-auto lg:h-full min-h-[80dvh] lg:min-h-[100dvh] flex-col justify-center shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-full overflow-y-auto lg:overflow-visible flex flex-col justify-center pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-16 lg:pb-8 overscroll-contain bg-transparent">
            <MetricsSection
              onOpenAnalyzer={onOpenAnalyzer}
              onNavigateToContact={() => scrollToCard(6)}
            />
          </div>
        </div>

        {/* SLIDE 3: ABOUT US */}
        <div
          ref={(el) => (slidesRef.current[3] = el)}
          id="slide-3-about"
          className="flex w-full lg:w-screen h-auto lg:h-full min-h-[80dvh] lg:min-h-[100dvh] flex-col justify-center shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-full overflow-y-auto lg:overflow-visible flex flex-col justify-center pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-16 lg:pb-8 overscroll-contain bg-transparent">
            <AboutSection
              onNavigateToContact={() => scrollToCard(6)}
              onOpenAnalyzer={onOpenAnalyzer}
            />
          </div>
        </div>

        {/* SLIDE 4: TESTIMONIALS */}
        <div
          ref={(el) => (slidesRef.current[4] = el)}
          id="slide-4-testimonials"
          className="flex w-full lg:w-screen h-auto lg:h-full min-h-[80dvh] lg:min-h-[100dvh] flex-col justify-center shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-full overflow-y-auto lg:overflow-visible flex flex-col justify-center pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-16 lg:pb-8 overscroll-contain bg-transparent">
            <TestimonialsSection />
          </div>
        </div>

        {/* SLIDE 5: TECH STACK */}
        <div
          ref={(el) => (slidesRef.current[5] = el)}
          id="slide-5-techstack"
          className="flex w-full lg:w-screen h-auto lg:h-full min-h-[80dvh] lg:min-h-[100dvh] flex-col justify-center shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-full overflow-y-auto lg:overflow-visible flex flex-col justify-center pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-16 lg:pb-8 overscroll-contain bg-transparent">
            <TechStackSection />
          </div>
        </div>

        {/* SLIDE 6: CONTACT & FOOTER */}
        <div
          ref={(el) => (slidesRef.current[6] = el)}
          id="slide-6-contact"
          className="w-full lg:w-screen h-auto lg:h-full min-h-[100dvh] flex flex-col justify-start shrink-0 bg-transparent px-3 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="slide-inner-content w-full h-auto lg:h-full overflow-visible lg:overflow-y-auto flex flex-col justify-between pt-12 pb-10 lg:pt-20 lg:pb-16 overscroll-contain bg-transparent">
            <ContactSection selectedServicePreload={selectedServicePreload} />
            <Footer
              onOpenLimitedOffer={onOpenLimitedOffer}
              onOpenAnalyzer={onOpenAnalyzer}
              onOpenAdmin={onOpenAdmin}
            />
          </div>
        </div>
      </div>

      {/* Floating Horizontal Navigation Indicator on Desktop */}
      <div
        id="cinematic-deck-nav-indicator"
        className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 items-center gap-2.5 pointer-events-auto"
      >
        <div className="glass-panel-luxury px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-3 shadow-2xl backdrop-blur-md">
          {cardTitles.map((card, idx) => {
            const isActive = activeCardIndex === idx;
            return (
              <button
                key={card.id}
                onClick={() => scrollToCard(idx)}
                id={`deck-dot-btn-${idx}`}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-600/40 border border-amber-500/60 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={`Go to ${card.title}`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 scale-125 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      : 'bg-slate-600 group-hover:bg-slate-400'
                  }`}
                />
                <span
                  className={`font-mono text-[11px] tracking-tight ${
                    isActive ? 'text-amber-300' : 'opacity-70 group-hover:opacity-100'
                  }`}
                >
                  {card.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Compact Slide Indicator for Mobile / Tablet */}
      <div
        id="mobile-deck-nav-indicator"
        className="hidden"
      >
        <div className="glass-panel-luxury px-3 py-1.5 rounded-full border border-amber-500/40 flex items-center gap-2 shadow-2xl backdrop-blur-md bg-black/70">
          <button
            onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
            disabled={activeCardIndex === 0}
            className="p-1 rounded-full text-slate-300 disabled:opacity-30 hover:text-amber-300"
            aria-label="Previous Section"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-1">
            <span className="font-mono text-xs font-bold text-amber-300">
              0{activeCardIndex + 1}/0{totalCards}
            </span>
            <span className="text-[11px] text-slate-200 font-medium max-w-[80px] truncate">
              {cardTitles[activeCardIndex]?.title}
            </span>
          </div>

          <button
            onClick={() => scrollToCard(Math.min(totalCards - 1, activeCardIndex + 1))}
            disabled={activeCardIndex === totalCards - 1}
            className="p-1 rounded-full text-slate-300 disabled:opacity-30 hover:text-amber-300"
            aria-label="Next Section"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side Horizontal Scroll Next/Prev Navigation Helpers */}
      {activeCardIndex < totalCards - 1 && (
        <button
          onClick={() => scrollToCard(activeCardIndex + 1)}
          className="hidden md:flex fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 lg:w-12 lg:h-12 rounded-full glass-panel-luxury border border-amber-500/30 items-center justify-center text-amber-300 hover:text-white hover:bg-amber-600/30 transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
          title="Next Slide (or scroll down)"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      )}

      {activeCardIndex > 0 && (
        <button
          onClick={() => scrollToCard(activeCardIndex - 1)}
          className="hidden md:flex fixed left-4 lg:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 lg:w-12 lg:h-12 rounded-full glass-panel-luxury border border-amber-500/30 items-center justify-center text-amber-300 hover:text-white hover:bg-amber-600/30 transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
          title="Previous Slide (or scroll up)"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      )}

      {/* Bottom Subtle Scroll Down Hint (Only on Slide 0 / Hero) */}
      {activeCardIndex === 0 && (
        <div
          id="scroll-down-curtain-hint"
          onClick={() => scrollToCard(1)}
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer animate-pulse pointer-events-auto"
        >
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase">Scroll Down to Move Left</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
        </div>
      )}
    </div>
  );
};
