import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { Product } from '../types';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuantity(1);
        setIsAdded(false);
      }, 300);
    }
  }, [isOpen]);

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-dark/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto max-w-4xl max-h-[90vh] w-[95%] bg-cream-light rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row"
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-full relative">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-dark/50 to-transparent md:hidden" />
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 md:hidden"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 flex flex-col relative overflow-y-auto">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-800 hidden md:block"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className="mb-2 flex gap-2">
                            {product.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-rose-dust/20 text-stone-600 text-xs rounded-full uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="font-serif text-4xl text-stone-dark mb-2">{product.name}</h2>
                        <p className="text-2xl font-light text-rose-dust mb-6">${product.price}.00</p>
                        <p className="text-stone-600 leading-relaxed mb-8">{product.description}</p>
                        
                        <div className="p-4 bg-white rounded-lg border border-sage-soft/30 mb-6">
                            <h4 className="font-serif text-sm font-bold text-stone-dark mb-2">Delivery Information</h4>
                            <p className="text-sm text-stone-500">Available for next-day delivery if ordered before 2 PM. Each bouquet is hand-tied and arrives in water.</p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-6">
                           <span className="font-serif text-stone-500">Quantity:</span>
                           <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-4 py-2">
                              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="hover:text-rose-dust">-</button>
                              <span className="w-4 text-center">{quantity}</span>
                              <button onClick={() => setQuantity(q => q + 1)} className="hover:text-rose-dust">+</button>
                           </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`w-full py-4 font-serif tracking-widest uppercase text-sm transition-all duration-300 flex items-center justify-center gap-2
                          ${isAdded 
                            ? 'bg-green-700 text-white' 
                            : 'bg-stone-dark text-white hover:bg-stone-800'
                          }`}
                    >
                        {isAdded ? (
                          <>Added to Basket <Check className="w-4 h-4" /></>
                        ) : (
                          <>Add to Basket <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};