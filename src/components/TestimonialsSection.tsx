import React, { useState } from 'react';
import { TESTIMONIALS } from '../data/content.ts';
import { Star, ChevronLeft, ChevronRight, Quote, Heart, CheckCircle2, Flame } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section id="testimonials" className="py-12 md:py-20 relative bg-transparent overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exact Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4">
            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>CLIENT SUCCESS</span>
          </div>

          <h2
            id="testimonials-header"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif] uppercase"
          >
            WE GREATLY APPRECIATE YOUR TESTIMONIALS
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Hear firsthand how our custom setups revolutionized operations for modern teams.
          </p>
        </div>

        {/* 3 Grid Columns on Desktop, Carousel on Mobile/Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={t.id}
              id={`testimonial-card-${t.id}`}
              className="glass-panel-luxury rounded-2xl p-7 sm:p-8 flex flex-col justify-between relative border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-amber-600/20 group-hover:text-amber-500/30 transition-colors">
                <Quote className="w-10 h-10" />
              </div>

              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-400">5.0 Verified Client</span>
                </div>

                {/* Exact Quote */}
                <blockquote className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8 italic">
                  "{t.quote}"
                </blockquote>
              </div>

              {/* Author Details */}
              <div className="pt-5 border-t border-amber-950/60 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-900/40">
                  {t.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 inline" />
                  </div>
                  <div className="text-xs text-amber-300/90 font-medium">
                    {t.role}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel controls for extra mobile responsiveness */}
        <div className="mt-10 flex items-center justify-center gap-4 md:hidden">
          <button
            onClick={prevTestimonial}
            className="p-2.5 rounded-full bg-slate-900 border border-amber-800 text-slate-300 hover:text-white"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentIndex === i ? 'bg-orange-500 w-6' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextTestimonial}
            className="p-2.5 rounded-full bg-slate-900 border border-amber-800 text-slate-300 hover:text-white"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
