import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchTestimonials } from '../services/sanity';
import { Testimonial } from '../types';

// Muted pastel color palette for borders/backgrounds
const PASTEL_COLORS = [
  'bg-stone-100',
  'bg-rose-50',
  'bg-amber-50',
  'bg-stone-50',
  'bg-pink-50',
  'bg-neutral-100',
  'bg-orange-50',
  'bg-zinc-100',
  'bg-red-50',
  'bg-slate-50',
];

// Individual flipping tile component
const TestimonialTile: React.FC<{
  testimonials: Testimonial[];
  delay: number;
  colorClass: string;
  style?: React.CSSProperties;
}> = ({ testimonials, delay, colorClass, style }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsFlipping(false);
      }, 300);
    }, 5000 + delay);

    return () => clearInterval(interval);
  }, [testimonials.length, delay]);

  const current = testimonials[currentIndex];
  if (!current) return null;

  return (
    <motion.div
      className="absolute"
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateY: isFlipping ? 90 : 0,
      }}
      transition={{
        opacity: { duration: 0.5, delay: delay / 1000 },
        scale: { duration: 0.5, delay: delay / 1000 },
        rotateY: { duration: 0.3, ease: 'easeInOut' }
      }}
    >
      <div className={`${colorClass} rounded-xl shadow-md p-2 h-full border border-stone-200/30 overflow-hidden flex items-center justify-center`}>
        <img
          src={current.image.asset.url}
          alt="Customer testimonial"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </motion.div>
  );
};

interface TestimonialsProps {
  onOrderClick: () => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ onOrderClick }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch testimonials from Sanity
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchTestimonials();
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  // Split testimonials into groups for different tiles
  const splitTestimonials = (arr: Testimonial[], parts: number): Testimonial[][] => {
    const result: Testimonial[][] = [];
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    for (let i = 0; i < parts; i++) {
      result.push([]);
    }
    shuffled.forEach((item, index) => {
      result[index % parts].push(item);
    });
    return result;
  };

  const testimonialGroups = splitTestimonials(testimonials, 10);

  // Tile configurations - varied sizes, slight overlap
  const tileConfigs = [
    // Row 1
    { left: '0%', top: '0px', width: '26%', height: '200px', zIndex: 1 },
    { left: '22%', top: '20px', width: '24%', height: '220px', zIndex: 2 },
    { left: '42%', top: '0px', width: '28%', height: '190px', zIndex: 1 },
    { left: '66%', top: '25px', width: '25%', height: '230px', zIndex: 2 },

    // Row 2 - slight overlap with row 1
    { left: '5%', top: '180px', width: '25%', height: '230px', zIndex: 3 },
    { left: '26%', top: '210px', width: '28%', height: '200px', zIndex: 2 },
    { left: '50%', top: '195px', width: '24%', height: '220px', zIndex: 3 },
    { left: '70%', top: '240px', width: '26%', height: '190px', zIndex: 2 },

    // Row 3 - slight overlap with row 2
    { left: '0%', top: '390px', width: '28%', height: '200px', zIndex: 2 },
    { left: '24%', top: '400px', width: '25%', height: '210px', zIndex: 3 },
  ];

  // Don't render if no testimonials
  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative z-20 bg-gradient-to-b from-white to-cream-light py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-rose-dust font-serif text-lg mb-2 block">Kind Words</span>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-dark mb-4">
            What Our Clients Say
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto">
            Every bouquet tells a story. Here's what our wonderful customers have shared about their experience.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-dust"></div>
          </div>
        ) : (
          <>
            {/* Testimonial Collage - Desktop */}
            <div className="hidden md:block relative max-w-6xl mx-auto h-[620px]">
              {tileConfigs.map((config, index) => (
                <TestimonialTile
                  key={index}
                  testimonials={testimonialGroups[index]?.length > 0 ? testimonialGroups[index] : testimonialGroups[0]}
                  delay={index * 400}
                  colorClass={PASTEL_COLORS[index % PASTEL_COLORS.length]}
                  style={{
                    left: config.left,
                    top: config.top,
                    width: config.width,
                    height: config.height,
                    zIndex: config.zIndex,
                  }}
                />
              ))}
            </div>

            {/* Mobile Layout - slight overlap, varied sizes */}
            <div className="md:hidden relative h-[750px]">
              {[
                { left: '2%', top: '0px', width: '70%', height: '200px' },
                { left: '25%', top: '170px', width: '73%', height: '210px' },
                { left: '0%', top: '350px', width: '68%', height: '200px' },
                { left: '28%', top: '520px', width: '70%', height: '210px' },
              ].map((config, index) => (
                <TestimonialTile
                  key={index}
                  testimonials={testimonialGroups[index]?.length > 0 ? testimonialGroups[index] : testimonialGroups[0]}
                  delay={index * 600}
                  colorClass={PASTEL_COLORS[index % PASTEL_COLORS.length]}
                  style={{
                    left: config.left,
                    top: config.top,
                    width: config.width,
                    height: config.height,
                    zIndex: index + 1,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-stone-500 text-sm mb-4">
            Join our happy customers
          </p>
          <button
            onClick={onOrderClick}
            className="px-8 py-3 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-colors"
          >
            Order Your Bouquet
          </button>
        </motion.div>
      </div>
    </section>
  );
};
