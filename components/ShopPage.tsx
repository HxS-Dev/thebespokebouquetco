import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { fetchCarouselImages } from '../services/sanity';
import { CarouselImage, CartItemCustom } from '../types';
import { CarouselImageModal } from './CarouselImageModal';
import { OrderCustomizeModal } from './OrderCustomizeModal';

interface ShopPageProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItemCustom) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ isOpen, onClose, onAddToCart }) => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const fetchedImages = await fetchCarouselImages();
      const sortedImages = fetchedImages.sort((a, b) => a.order - b.order);
      setImages(sortedImages);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (image: CarouselImage) => {
    setSelectedImage(image);
    setIsPreviewOpen(true);
  };

  const handleOrderSimilar = () => {
    setIsPreviewOpen(false);
    setIsOrderModalOpen(true);
  };

  const handleBackToPreview = () => {
    setIsOrderModalOpen(false);
    setIsPreviewOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedImage(null);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setSelectedImage(null), 150);
  };

  const handleAddToCart = (item: CartItemCustom) => {
    onAddToCart(item);
    handleCloseOrderModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full Page Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cream-light z-[100] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-cream-light/95 backdrop-blur-sm border-b border-stone-200 z-10">
              <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl text-stone-dark">Our Collection</h1>
                  <p className="text-stone-500 text-sm">Browse our hand-crafted arrangements</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-stone-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-dust"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-stone-500 text-lg">No arrangements available at the moment.</p>
                  <p className="text-stone-400 text-sm mt-2">Please check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {images.map((image, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <div className="relative overflow-hidden aspect-[3/4] rounded-lg bg-stone-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                        <img
                          src={image.image.asset.url}
                          alt={image.image.alt || image.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-serif text-white text-lg mb-1">{image.title}</h3>
                          {image.bouquetSizes && image.bouquetSizes.length > 0 && (
                            <p className="text-white/80 text-sm">
                              From £{Math.min(...image.bouquetSizes.map(s => s.price))}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-white/90 text-xs mt-2">
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Title below image (always visible) */}
                      <div className="mt-3">
                        <h3 className="font-serif text-stone-dark group-hover:text-rose-dust transition-colors">
                          {image.title}
                        </h3>
                        {image.bouquetSizes && image.bouquetSizes.length > 0 && (
                          <p className="text-rose-dust text-sm">
                            From £{Math.min(...image.bouquetSizes.map(s => s.price))}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Back to home button */}
            <div className="container mx-auto px-6 py-8 text-center border-t border-stone-200">
              <button
                onClick={onClose}
                className="text-stone-500 hover:text-rose-dust transition-colors text-sm uppercase tracking-wider"
              >
                ← Back to Home
              </button>
            </div>
          </motion.div>

          {/* Preview Modal */}
          <CarouselImageModal
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
            image={selectedImage}
            onOrderSimilar={handleOrderSimilar}
          />

          {/* Order Customize Modal */}
          <OrderCustomizeModal
            isOpen={isOrderModalOpen}
            onClose={handleCloseOrderModal}
            onBack={handleBackToPreview}
            image={selectedImage}
            onAddToCart={handleAddToCart}
          />
        </>
      )}
    </AnimatePresence>
  );
};
