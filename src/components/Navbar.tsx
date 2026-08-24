import React, { useState, useEffect } from 'react';
import { Cloud, Zap, Menu, X, ArrowRight, Phone, Sparkles, Flame, Database } from 'lucide-react';
import { BRAND } from '../data/content.ts';

interface NavbarProps {
  onOpenLimitedOffer: () => void;
  onOpenAnalyzer: () => void;
  onNavigateToContact: () => void;
  onNavigateToCard?: (cardIndex: number) => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLimitedOffer,
  onOpenAnalyzer,
  onNavigateToContact,
  onNavigateToCard,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero-section', cardIndex: 0 },
    { label: 'Services', href: '#services', cardIndex: 1 },
    { label: 'ROI & Stats', href: '#metrics', cardIndex: 2 },
    { label: 'About', href: '#about', cardIndex: 3 },
    { label: 'Testimonials', href: '#testimonials', cardIndex: 4 },
    { label: 'Tech Stack', href: '#tech-stack', cardIndex: 5 },
    { label: 'Contact', href: '#contact', cardIndex: 6 },
  ];

  const mobileNavLinks = navLinks.filter((link) =>
    ['Home', 'Services', 'About', 'Contact'].includes(link.label)
  );

  const handleLinkClick = (e: React.MouseEvent, cardIndex: number) => {
    e.preventDefault();
    if (onNavigateToCard) {
      onNavigateToCard(cardIndex);
    } else {
      onNavigateToContact();
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#08090d]/90 backdrop-blur-md border-b border-amber-500/20 py-3 shadow-2xl shadow-black/60'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo with Cloud & Lightning */}
          <a
            href="#"
            onClick={(e) => handleLinkClick(e, 0)}
            id="brand-logo-link"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white border-2 border-amber-400/50 shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-200">
              <Cloud className="w-6 h-6 text-amber-100 absolute opacity-80" />
              <Zap className="w-4 h-4 text-white fill-white relative z-10 translate-y-0.5 animate-pulse drop-shadow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase font-['Space_Grotesk',sans-serif]">
                {BRAND.navLogo}
              </span>
              <span className="text-[10px] tracking-widest text-amber-500 font-semibold uppercase -mt-1">
                Custom Tech Solutions
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.cardIndex)}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-amber-950/40 hover:border-amber-500/30 border border-transparent rounded-lg transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={onOpenAnalyzer}
              id="nav-analyzer-btn"
              className="px-3.5 py-2 text-xs font-semibold tracking-wide text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Launch Analyzer
            </button>
            <button
              onClick={onOpenLimitedOffer}
              id="nav-offer-btn"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 rounded-lg shadow-md shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              Limited Offer
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenLimitedOffer}
              id="nav-mobile-offer-badge"
              className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-orange-600 rounded-md shadow-sm"
            >
              Offer
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 border border-amber-900/40 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-[#0d0f17] border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-3 mt-2 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex flex-col space-y-1">
            {mobileNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLinkClick(e, link.cardIndex);
                }}
                className={`px-3 py-2.5 rounded-lg font-medium text-slate-200 hover:bg-amber-900/30 hover:text-amber-300 transition-colors cursor-pointer ${
                  link.label === 'Services' ? 'text-xs' : 'text-sm'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-amber-900/30 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAnalyzer();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-600/50 rounded-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Launch Analyzer
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLimitedOffer();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold uppercase text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center gap-2"
            >
              Limited Offer
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`tel:${BRAND.phoneClean}`}
              className="text-xs text-center text-slate-400 hover:text-amber-300 py-1 flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Call us: {BRAND.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
