import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { CarouselImage } from '../types';

interface CarouselImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: CarouselImage | null;
  onOrderSimilar?: () => void;
}

export const CarouselImageModal: React.FC<CarouselImageModalProps> = ({ isOpen, onClose, image, onOrderSimilar }) => {
  if (!image) return null;

  const hasSizesOrAddOns = (image.bouquetSizes && image.bouquetSizes.length > 0) ||
                           (image.addOns && image.addOns.length > 0);
  const minPrice = image.bouquetSizes && image.bouquetSizes.length > 0
    ? Math.min(...image.bouquetSizes.map(s => s.price))
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 500 }}
              className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-stone-dark" />
              </button>

              {/* Content */}
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  className="md:w-1/2 bg-stone-100"
                >
                  <img
                    src={image.image.asset.url}
                    alt={image.image.alt || image.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </motion.div>

                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="md:w-1/2 p-8 flex flex-col"
                >
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="font-serif text-3xl md:text-4xl text-stone-dark mb-2"
                  >
                    {image.title}
                  </motion.h2>

                  {minPrice && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.17, duration: 0.2 }}
                      className="text-xl text-rose-dust font-light mb-4"
                    >
                      From £{minPrice}
                    </motion.p>
                  )}

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="text-stone-600 leading-relaxed mb-6"
                  >
                    {image.description}
                  </motion.p>

                  {/* Available Sizes Preview */}
                  {image.bouquetSizes && image.bouquetSizes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.2 }}
                      className="mb-4"
                    >
                      <h3 className="text-sm font-semibold text-stone-dark uppercase tracking-wider mb-2">Available Sizes</h3>
                      <div className="flex flex-wrap gap-2">
                        {image.bouquetSizes.map((size) => (
                          <span
                            key={size._id}
                            className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full"
                          >
                            {size.name} ({size.numberOfRoses} roses) - £{size.price}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Available Add-ons Preview */}
                  {image.addOns && image.addOns.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.2 }}
                      className="mb-6"
                    >
                      <h3 className="text-sm font-semibold text-stone-dark uppercase tracking-wider mb-2">Add-ons Available</h3>
                      <div className="flex flex-wrap gap-2">
                        {image.addOns.map((addOn) => (
                          <span
                            key={addOn._id}
                            className="px-3 py-1 bg-rose-dust/10 text-stone-600 text-sm rounded-full flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-rose-dust" />
                            {addOn.name}
                            {addOn.price && <span className="text-rose-dust">+£{addOn.price}</span>}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Order Similar Button */}
                  {hasSizesOrAddOns && onOrderSimilar && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.2 }}
                      className="mt-auto"
                    >
                      <button
                        onClick={onOrderSimilar}
                        className="w-full py-4 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-all duration-300 flex items-center justify-center gap-2 rounded-lg"
                      >
                        Order Similar <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
