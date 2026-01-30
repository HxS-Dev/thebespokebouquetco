import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  occasion?: string;
}

// Sample testimonials - these could come from Sanity later
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah M.',
    text: 'Absolutely stunning arrangement! The roses were so fresh and the colours were even more beautiful in person.',
    rating: 5,
    occasion: 'Anniversary',
  },
  {
    id: 2,
    name: 'James & Emily',
    text: 'Our wedding flowers were beyond perfect. Everyone commented on how gorgeous they were!',
    rating: 5,
    occasion: 'Wedding',
  },
  {
    id: 3,
    name: 'Charlotte W.',
    text: 'The attention to detail is incredible. My mum cried happy tears when she received her birthday bouquet.',
    rating: 5,
    occasion: 'Birthday',
  },
  {
    id: 4,
    name: 'David R.',
    text: "Best florist I've ever used. The personal delivery service made it extra special.",
    rating: 5,
    occasion: 'Just Because',
  },
  {
    id: 5,
    name: 'Hannah L.',
    text: 'I order monthly for my office and they never disappoint. Fresh, vibrant, and always on time.',
    rating: 5,
    occasion: 'Regular Order',
  },
  {
    id: 6,
    name: 'Michael & Sophie',
    text: "The sympathy flowers were elegant and tasteful. Thank you for handling everything with such care.",
    rating: 5,
    occasion: 'Sympathy',
  },
  {
    id: 7,
    name: 'Rebecca T.',
    text: 'Ordered for Valentine\'s Day and wow! The presentation was exquisite. Will definitely be back.',
    rating: 5,
    occasion: "Valentine's Day",
  },
  {
    id: 8,
    name: 'Oliver & Grace',
    text: 'They brought our vision to life for our garden party. Magical arrangements throughout!',
    rating: 5,
    occasion: 'Event',
  },
  {
    id: 9,
    name: 'Lucy P.',
    text: 'Such a personal touch with every order. You can tell they truly love what they do.',
    rating: 5,
    occasion: 'Thank You',
  },
  {
    id: 10,
    name: 'Tom & Anna',
    text: 'The bouquet lasted over two weeks! Incredible quality and value.',
    rating: 5,
    occasion: 'New Home',
  },
];

// Muted pastel color palette
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
  'bg-warmGray-100',
  'bg-slate-50',
  'bg-rose-100/50',
];

// Individual flipping tile component
const TestimonialTile: React.FC<{
  testimonials: Testimonial[];
  delay: number;
  colorClass: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ testimonials, delay, colorClass, className = '', style }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
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

  return (
    <motion.div
      className={`absolute ${className}`}
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
      <div className={`${colorClass} rounded-xl shadow-md p-5 h-full flex flex-col border border-stone-200/30`}>
        <Quote className="w-6 h-6 text-stone-400/40 mb-2 flex-shrink-0" />

        <p className="text-stone-600 text-sm leading-relaxed flex-grow mb-3 line-clamp-4">
          "{current.text}"
        </p>

        <div className="mt-auto">
          <div className="flex gap-0.5 mb-1">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="font-serif text-stone-dark text-sm font-medium">{current.name}</p>
          {current.occasion && (
            <p className="text-xs text-rose-dust/80">{current.occasion}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface TestimonialsProps {
  onOrderClick: () => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ onOrderClick }) => {
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

  const [testimonialGroups] = useState(() => splitTestimonials(TESTIMONIALS, 10));

  // Tile configurations - varied sizes, slight overlap
  const tileConfigs = [
    // Row 1
    { left: '0%', top: '0px', width: '26%', height: '200px', zIndex: 1 },      // medium
    { left: '22%', top: '20px', width: '24%', height: '220px', zIndex: 2 },    // tall
    { left: '42%', top: '0px', width: '28%', height: '190px', zIndex: 1 },     // wide
    { left: '66%', top: '25px', width: '25%', height: '230px', zIndex: 2 },    // tall

    // Row 2 - slight overlap with row 1
    { left: '5%', top: '180px', width: '25%', height: '230px', zIndex: 3 },    // tall
    { left: '26%', top: '210px', width: '28%', height: '200px', zIndex: 2 },   // wide
    { left: '50%', top: '195px', width: '24%', height: '220px', zIndex: 3 },   // tall
    { left: '70%', top: '240px', width: '26%', height: '190px', zIndex: 2 },   // medium

    // Row 3 - slight overlap with row 2
    { left: '0%', top: '390px', width: '28%', height: '200px', zIndex: 2 },    // wide
    { left: '24%', top: '400px', width: '25%', height: '210px', zIndex: 3 },   // medium tall
  ];

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
