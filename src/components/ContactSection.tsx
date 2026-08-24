import React, { useState } from 'react';
import { BRAND, SERVICES } from '../data/content.ts';
import { ContactFormData } from '../types.ts';
import { recordPublicInquiryToSharePoint } from '../services/graphService.ts';
import {
  MapPin,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Clock,
  Shield,
  ArrowUpRight,
  Flame,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContactSectionProps {
  selectedServicePreload?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  selectedServicePreload = '',
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: selectedServicePreload || 'AI Automation',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update if preload changes
  React.useEffect(() => {
    if (selectedServicePreload) {
      setFormData((prev) => ({ ...prev, service: selectedServicePreload }));
    }
  }, [selectedServicePreload]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await recordPublicInquiryToSharePoint({
        title: `${formData.service} Inquiry - ${formData.name}`,
        clientName: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        notes: `Company: ${formData.company || 'N/A'}. Message: ${formData.message}`,
        source: 'Website Contact Form',
        estimatedValue: 5000,
      });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Unable to submit your inquiry.');
      return;
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ea580c', '#d97706', '#fbbf24'],
      });
    } catch (err) {
      // Safe fallback if confetti isn't available
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: 'AI Automation',
      message: '',
    });
  };

  return (
    <section id="contact" className="pt-4 pb-8 md:pt-10 md:pb-16 relative bg-transparent">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header: "CONTACT" | Subtitle: "Let’s Work Together" */}
        <div className="text-center max-w-3xl mx-auto mb-5 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CONTACT</span>
          </div>

          <h2
            id="contact-subtitle"
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]"
          >
            Let’s Work{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Together
            </span>
          </h2>
          <p className="hidden sm:block mt-4 text-base sm:text-lg text-slate-300">
            Tell us about your business goals and current bottlenecks. We’ll design your custom setup.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-8">
          {/* Left Column: Direct Contact Info & Guarantees */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            <div className="glass-panel-luxury rounded-2xl p-6 sm:p-8 border border-amber-500/20">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk',sans-serif] mb-6">
                Get in Touch Directly
              </h3>

              {/* Exact Contact Details */}
              <div className="space-y-5">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-300 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Location
                    </div>
                    <div id="contact-location" className="text-base font-bold text-white mt-0.5">
                      {BRAND.location}
                    </div>
                    <div className="text-xs text-slate-400">Serving clients nationwide across the US</div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Email
                    </div>
                    <a
                      id="contact-email"
                      href={`mailto:${BRAND.email}`}
                      className="text-base font-bold text-white hover:text-amber-300 transition-colors mt-0.5 inline-block"
                    >
                      {BRAND.email}
                    </a>
                    <div className="text-xs text-slate-400">Response guaranteed within 24 hours</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Phone Lines
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5">
                      <a
                        id="contact-phone"
                        href={`tel:${BRAND.phoneClean}`}
                        className="text-base font-bold text-white hover:text-amber-300 transition-colors inline-block"
                      >
                        {BRAND.phone}
                      </a>
                      <span className="hidden sm:inline text-slate-500">•</span>
                      <a
                        id="contact-phone-2"
                        href={`tel:${BRAND.phone2Clean}`}
                        className="text-base font-bold text-white hover:text-amber-300 transition-colors inline-block"
                      >
                        {BRAND.phone2}
                      </a>
                    </div>
                    <div className="text-xs text-slate-400">Mon-Fri, 9am - 6pm EST</div>
                  </div>
                </div>
              </div>

              {/* Direct Quick Action Buttons */}
              <div className="space-y-2 mt-8 pt-6 border-t border-amber-950/60">
                <a
                  href={BRAND.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-950/40"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Strategy Call (Outlook Calendar)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`mailto:${BRAND.email}?subject=Inquiry%20from%20FAST%20Solutions%20Website`}
                    className="py-2.5 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-600/40 text-xs font-semibold text-amber-200 text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                    <ArrowUpRight className="w-3 h-3 text-amber-400" />
                  </a>

                  <a
                    href={`tel:${BRAND.phoneClean}`}
                    className="py-2.5 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-600/40 text-xs font-semibold text-amber-200 text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Direct Call</span>
                    <ArrowUpRight className="w-3 h-3 text-amber-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Our Partnership Standard</span>
              </div>
              <p className="text-slate-400">
                • 100% Free Initial Discovery & Architecture Blueprint
                <br />
                • Transparent Flat-Rate Pricing with Zero Hidden Fees
                <br />
                • Full Ownership of Your Code, Apps & IP
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Consultation & Project Form */}
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="glass-panel-luxury rounded-2xl p-4 sm:p-10 border border-amber-500/30 shadow-2xl relative">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500 text-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-orange-900/40">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
                    Message Received!
                  </h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-white">{formData.name}</span>. Our lead engineers (Fayl & Soliyana) have received your inquiry regarding <span className="text-amber-300 font-semibold">{formData.service}</span> and will reply to <span className="text-amber-300 font-mono">{formData.email}</span> within 24 hours.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-xs font-semibold text-amber-200 border border-amber-600/50 transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="contact-form" className="space-y-5">
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-amber-950/60">
                    <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk',sans-serif]">
                      Request a Custom Quote or Audit
                    </h3>
                    <span className="hidden sm:inline text-[11px] text-amber-400 font-medium">
                      No commitment required
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="contact-name-input"
                        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                      >
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="contact-name-input"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-slate-900/90 border border-amber-500/20 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="contact-email-input"
                        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                      >
                        Business Email *
                      </label>
                      <input
                        type="email"
                        id="contact-email-input"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-slate-900/90 border border-amber-500/20 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="contact-phone-input"
                        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="contact-phone-input"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(240) 000-0000"
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-slate-900/90 border border-amber-500/20 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label
                        htmlFor="contact-company-input"
                        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                      >
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        id="contact-company-input"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Inc."
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-slate-900/90 border border-amber-500/20 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Service Category */}
                  <div>
                    <label
                      htmlFor="contact-service-select"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Primary Service Area of Interest
                    </label>
                    <select
                      id="contact-service-select"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-slate-900/90 border border-amber-500/20 text-white text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title} className="bg-slate-900 text-white">
                          {s.title} — {s.badge}
                        </option>
                      ))}
                      <option value="Complete Custom Suite" className="bg-slate-900 text-white">
                        Complete Custom Suite (AI + Apps + Web)
                      </option>
                      <option value="General Consultation" className="bg-slate-900 text-white">
                        General Consultation / Tech Audit
                      </option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message-input"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Project Details / Current Bottlenecks
                    </label>
                    <textarea
                      id="contact-message-input"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Briefly describe what you're juggling or what tools you'd love automated..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-amber-500/20 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting to Engineers...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message & Claim Free Diagnostic</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
