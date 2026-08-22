import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar.tsx';
import { FullPageBackgroundCanvas } from './components/FullPageBackgroundCanvas.tsx';
import { CinematicCardDeck } from './components/CinematicCardDeck.tsx';
import { LimitedOfferModal } from './components/LimitedOfferModal.tsx';
import { AiAnalyzerModal } from './components/AiAnalyzerModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function App() {
  const [isLimitedOfferOpen, setIsLimitedOfferOpen] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedServicePreload, setSelectedServicePreload] = useState('');
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  const totalCards = 7;

  // URL routing for hidden Admin Dashboard (#admin, ?admin=true, #/admin, #sharepoint, /admin)
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();

      if (
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#sharepoint' ||
        hash === '#db' ||
        hash === '#dashboard' ||
        search.includes('admin=true') ||
        search.includes('portal=admin') ||
        search.includes('mode=admin') ||
        path === '/admin'
      ) {
        setIsAdminOpen(true);
      }
    };

    // Check immediately on initial mount
    checkAdminRoute();

    // Listen for hash and popstate changes
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    // Global keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to toggle Admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => {
          const next = !prev;
          if (next) {
            window.history.pushState(null, '', '#admin');
          } else {
            window.history.pushState(null, '', window.location.pathname + window.location.search);
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenAdmin = () => {
    window.history.pushState(null, '', '#admin');
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin' || window.location.hash === '#/admin' || window.location.hash === '#sharepoint' || window.location.hash === '#db') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Initialize Lenis for luxurious buttery smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
    });

    setLenisInstance(lenis);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  const handleNavigateToCard = (cardIndex: number) => {
    const st = ScrollTrigger.getAll().find((s) => s.vars.pin);
    if (st && st.start !== undefined && st.end !== undefined) {
      const targetScroll = st.start + (cardIndex / (totalCards - 1)) * (st.end - st.start);
      if (lenisInstance) {
        lenisInstance.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    } else {
      const targetScroll = (cardIndex / (totalCards - 1)) * (window.innerHeight * (totalCards - 1) * 1.3);
      if (lenisInstance) {
        lenisInstance.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleOpenLimitedOffer = () => {
    setIsLimitedOfferOpen(true);
  };

  const handleOpenAnalyzer = () => {
    setIsAnalyzerOpen(true);
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedServicePreload(serviceName);
    handleNavigateToCard(6); // Navigate to Contact Card
  };

  const handleNavigateToContact = () => {
    handleNavigateToCard(6); // Navigate to Contact Card
  };

  const handleClaimOffer = (name: string, email: string) => {
    setIsLimitedOfferOpen(false);
    setSelectedServicePreload('Complete Custom Suite');
    handleNavigateToCard(6);
    // Pre-fill inputs if available
    setTimeout(() => {
      const nameInput = document.getElementById('contact-name-input') as HTMLInputElement | null;
      const emailInput = document.getElementById('contact-email-input') as HTMLInputElement | null;
      if (nameInput && name) nameInput.value = name;
      if (emailInput && email) emailInput.value = email;
    }, 400);
  };

  const handleSelectAnalyzerResult = (serviceName: string, notes: string) => {
    setIsAnalyzerOpen(false);
    setSelectedServicePreload(serviceName);
    handleNavigateToCard(6);
    setTimeout(() => {
      const msgInput = document.getElementById('contact-message-input') as HTMLTextAreaElement | null;
      if (msgInput) {
        msgInput.value = notes;
      }
    }, 400);
  };

  return (
    <div id="fast-solutions-app" className="relative min-h-screen bg-transparent text-slate-100 selection:bg-amber-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Full-Page Background HTML Canvas with GSAP ScrollTrigger Sequence Scrubbing */}
      <FullPageBackgroundCanvas
        totalFrames={100}
      />

      {/* Fixed Sticky Header Navigation */}
      <Navbar
        onOpenLimitedOffer={handleOpenLimitedOffer}
        onOpenAnalyzer={handleOpenAnalyzer}
        onNavigateToContact={handleNavigateToContact}
        onNavigateToCard={handleNavigateToCard}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Cinematic Card Stacking & Curtain Reveal Deck with Dynamic 3D Rotational Momentum */}
      <main className="w-full flex-grow">
        <CinematicCardDeck
          onOpenLimitedOffer={handleOpenLimitedOffer}
          onOpenAnalyzer={handleOpenAnalyzer}
          onNavigateToContact={handleNavigateToContact}
          onSelectService={handleSelectService}
          selectedServicePreload={selectedServicePreload}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      </main>

      {/* Interactive Modals */}
      <LimitedOfferModal
        isOpen={isLimitedOfferOpen}
        onClose={() => setIsLimitedOfferOpen(false)}
        onClaimOffer={handleClaimOffer}
      />

      <AiAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
        onSelectResult={handleSelectAnalyzerResult}
      />

      {/* Admin Dashboard for SharePoint List Database via Microsoft Graph */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
      />
    </div>
  );
}
