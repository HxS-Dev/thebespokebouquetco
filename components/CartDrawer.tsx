import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, CreditCard, Lock } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemove,
  onUpdateQuantity,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    onCheckout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-dark/30 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-cream-light">
              <h2 className="font-serif text-2xl text-stone-dark flex items-center gap-2">
                Your Basket <span className="text-sm font-sans text-stone-400 font-normal">({items.length} items)</span>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="font-serif text-lg">Your basket is empty</p>
                  <button onClick={onClose} className="text-sm underline hover:text-rose-dust">Browse Arrangements</button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    key={item._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 bg-cream-light/30 rounded-lg border border-stone-100"
                  >
                    <div className="w-20 h-20 bg-stone-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-stone-dark text-lg leading-none">{item.name}</h3>
                        <p className="font-sans font-bold text-sm text-stone-600">${item.price * item.quantity}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-2 py-1 shadow-sm">
                          <button 
                            onClick={() => onUpdateQuantity(item._id, -1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-stone-50 rounded-full text-stone-500 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm w-4 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item._id, 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-stone-50 rounded-full text-stone-500 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => onRemove(item._id)}
                          className="text-stone-400 hover:text-red-400 transition-colors p-2 hover:bg-red-50 rounded-full"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-100 bg-cream-light/50 backdrop-blur-sm">
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-stone-600">
                        <span className="font-sans text-sm">Subtotal</span>
                        <span className="font-sans font-medium">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-600">
                        <span className="font-sans text-sm">Shipping</span>
                        <span className="font-sans text-sm text-green-700">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                        <span className="font-serif text-lg text-stone-dark">Total</span>
                        <span className="font-serif text-2xl font-bold text-stone-dark">${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-all duration-300 rounded-sm flex items-center justify-center gap-3"
                >
                    Checkout <CreditCard className="w-4 h-4" />
                </button>
                <div className="flex justify-center items-center gap-2 mt-4 text-stone-400">
                    <Lock className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider">Secure Payment via Stripe</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};