import React from 'react';
import { BRAND } from '../data/content.ts';
import { Cloud, Zap, Mail, Phone, MapPin, ArrowUp, Sparkles, Shield, Heart, Flame } from 'lucide-react';

interface FooterProps {
  onOpenLimitedOffer: () => void;
  onOpenAnalyzer: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLimitedOffer,
  onOpenAnalyzer,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-transparent border-t border-amber-500/20 pt-12 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-amber-950/50">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-orange-950/60">
                <Cloud className="w-5 h-5 text-amber-200 absolute" />
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 relative z-10 translate-y-0.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase font-['Space_Grotesk',sans-serif]">
                {BRAND.navLogo}
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering small and mid-sized businesses with enterprise-grade custom AI automations, cloud applications, and web solutions without enterprise overhead.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-amber-400 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Headquartered in {BRAND.location}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="hover:text-amber-300 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#metrics-section" className="hover:text-amber-300 transition-colors">
                  Impact Numbers
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-300 transition-colors">
                  About Our Team
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-amber-300 transition-colors">
                  Client Testimonials
                </a>
              </li>
              <li>
                <a href="#tech-stack" className="hover:text-amber-300 transition-colors">
                  Tech Stack
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions & Tools */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Solutions
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="hover:text-amber-300 transition-colors">
                  AI Automation
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-300 transition-colors">
                  Business Applications
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-300 transition-colors">
                  Website Creation & Ads
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAnalyzer}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Launch Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLimitedOffer}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors text-left cursor-pointer"
                >
                  Limited 2026 Offer
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Contact
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">{BRAND.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${BRAND.email}`}
                  className="text-slate-300 hover:text-amber-300 transition-colors break-all"
                >
                  {BRAND.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${BRAND.phoneClean}`}
                    className="text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    {BRAND.phone}
                  </a>
                  <span className="text-slate-500">•</span>
                  <a
                    href={`tel:${BRAND.phone2Clean}`}
                    className="text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    {BRAND.phone2}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Exact Copyright & Back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div id="footer-copyright" className="text-slate-400 font-medium">
            {BRAND.copyright}
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400">Enterprise AI & Cloud Architectures</span>
            <button
              onClick={scrollToTop}
              id="back-to-top-btn"
              className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/40 text-amber-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              aria-label="Scroll to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
