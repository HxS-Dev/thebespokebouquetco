import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, ArrowLeft, Plus, Minus } from 'lucide-react';
import { CarouselImage, BouquetSize, AddOn, CartItemCustom } from '../types';

interface OrderCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  image: CarouselImage | null;
  onAddToCart: (item: CartItemCustom) => void;
}

export const OrderCustomizeModal: React.FC<OrderCustomizeModalProps> = ({
  isOpen,
  onClose,
  onBack,
  image,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<BouquetSize | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [addOnDetails, setAddOnDetails] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && image) {
      // Auto-select first size if available
      if (image.bouquetSizes && image.bouquetSizes.length > 0) {
        setSelectedSize(image.bouquetSizes[0]);
      }
      setSelectedAddOns(new Set());
      setAddOnDetails({});
      setQuantity(1);
      setIsAdded(false);
    }
  }, [isOpen, image]);

  if (!image) return null;

  const toggleAddOn = (addOn: AddOn) => {
    const newSelected = new Set(selectedAddOns);
    if (newSelected.has(addOn._id)) {
      newSelected.delete(addOn._id);
      const newDetails = { ...addOnDetails };
      delete newDetails[addOn._id];
      setAddOnDetails(newDetails);
    } else {
      newSelected.add(addOn._id);
    }
    setSelectedAddOns(newSelected);
  };

  const calculateTotal = () => {
    let total = selectedSize?.price || 0;
    if (image.addOns) {
      image.addOns.forEach(addOn => {
        if (selectedAddOns.has(addOn._id) && addOn.price) {
          total += addOn.price;
        }
      });
    }
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const selectedAddOnsList = image.addOns?.filter(a => selectedAddOns.has(a._id)) || [];

    const cartItem: CartItemCustom = {
      _id: `${image._id}-${Date.now()}`,
      name: image.title,
      imageUrl: image.image.asset.url,
      size: selectedSize,
      addOns: selectedAddOnsList,
      addOnDetails,
      quantity,
      totalPrice: calculateTotal(),
    };

    onAddToCart(cartItem);
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const hasAllRequiredDetails = () => {
    if (!image.addOns) return true;
    for (const addOn of image.addOns) {
      if (selectedAddOns.has(addOn._id) && addOn.requiresExtraInfo) {
        if (!addOnDetails[addOn._id]?.trim()) {
          return false;
        }
      }
    }
    return true;
  };

  const canAddToCart = selectedSize && hasAllRequiredDetails();

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
              {/* Header with back and close buttons */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={onBack}
                  className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 flex items-center gap-1"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-dark" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-stone-dark" />
              </button>

              {/* Content */}
              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Image */}
                <div className="md:w-2/5 bg-stone-100 flex-shrink-0">
                  <img
                    src={image.image.asset.url}
                    alt={image.image.alt || image.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>

                {/* Configuration */}
                <div className="md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                  <h2 className="font-serif text-2xl md:text-3xl text-stone-dark mb-2">
                    Order Similar
                  </h2>
                  <p className="text-stone-500 text-sm mb-6">
                    Inspired by "{image.title}"
                  </p>

                  {/* Size Selection */}
                  {image.bouquetSizes && image.bouquetSizes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-serif text-lg text-stone-dark mb-3">Select Size</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {image.bouquetSizes.map((size) => (
                          <button
                            key={size._id}
                            onClick={() => setSelectedSize(size)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              selectedSize?._id === size._id
                                ? 'border-rose-dust bg-rose-dust/10'
                                : 'border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="font-serif text-stone-dark">{size.name}</div>
                            <div className="text-sm text-stone-500">{size.numberOfRoses} roses</div>
                            <div className="text-lg font-semibold text-rose-dust mt-1">£{size.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-ons Selection */}
                  {image.addOns && image.addOns.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-serif text-lg text-stone-dark mb-3">Add-ons</h3>
                      <div className="space-y-3">
                        {image.addOns.map((addOn) => (
                          <div key={addOn._id}>
                            <button
                              onClick={() => toggleAddOn(addOn)}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                                selectedAddOns.has(addOn._id)
                                  ? 'border-rose-dust bg-rose-dust/10'
                                  : 'border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div>
                                <div className="font-serif text-stone-dark">{addOn.name}</div>
                                {addOn.price && (
                                  <div className="text-sm text-rose-dust">+£{addOn.price}</div>
                                )}
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedAddOns.has(addOn._id)
                                  ? 'border-rose-dust bg-rose-dust'
                                  : 'border-stone-300'
                              }`}>
                                {selectedAddOns.has(addOn._id) && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </button>

                            {/* Extra info input */}
                            {selectedAddOns.has(addOn._id) && addOn.requiresExtraInfo && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2"
                              >
                                <textarea
                                  placeholder={`Enter details for ${addOn.name}...`}
                                  value={addOnDetails[addOn._id] || ''}
                                  onChange={(e) => setAddOnDetails({
                                    ...addOnDetails,
                                    [addOn._id]: e.target.value
                                  })}
                                  className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rose-dust resize-none"
                                  rows={3}
                                />
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <h3 className="font-serif text-lg text-stone-dark mb-3">Quantity</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 rounded-full border border-stone-200 hover:border-stone-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-serif w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 rounded-full border border-stone-200 hover:border-stone-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total and Add to Cart */}
                  <div className="mt-auto pt-4 border-t border-stone-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-stone-dark">Total</span>
                      <span className="text-2xl font-serif text-rose-dust">£{calculateTotal()}</span>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart || isAdded}
                      className={`w-full py-4 font-serif tracking-widest uppercase text-sm transition-all duration-300 flex items-center justify-center gap-2 rounded-lg
                        ${isAdded
                          ? 'bg-green-700 text-white'
                          : canAddToCart
                            ? 'bg-stone-dark text-white hover:bg-stone-800'
                            : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        }`}
                    >
                      {isAdded ? (
                        <>Added to Basket <Check className="w-4 h-4" /></>
                      ) : (
                        <>Add to Basket <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                    {!hasAllRequiredDetails() && (
                      <p className="text-sm text-rose-dust mt-2 text-center">
                        Please fill in the required details for selected add-ons
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
