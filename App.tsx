import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, Instagram } from 'lucide-react';
import { ThreeBackground } from './components/ThreeBackground';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { LoadingScreen } from './components/LoadingScreen';
import { fetchPageContent } from './services/sanityMock';
import { CartItem, CartItemCustom } from './types';
import { Gallery } from './components/Gallery';
import { Testimonials } from './components/Testimonials';
import { ShopPage } from './components/ShopPage';

// localStorage keys
const CART_STORAGE_KEY = 'bespoke-bouquet-cart';
const CUSTOM_CART_STORAGE_KEY = 'bespoke-bouquet-custom-cart';

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [pageContent, setPageContent] = useState<any>(null);

  // Cart State - initialized from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [customCartItems, setCustomCartItems] = useState<CartItemCustom[]>(() =>
    loadFromStorage<CartItemCustom[]>(CUSTOM_CART_STORAGE_KEY, [])
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { damping: 15 });
  const headerY = useTransform(smoothProgress, [0, 0.2], [0, -100]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(CART_STORAGE_KEY, cartItems);
  }, [cartItems]);

  useEffect(() => {
    saveToStorage(CUSTOM_CART_STORAGE_KEY, customCartItems);
  }, [customCartItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const content = await fetchPageContent();
        setPageContent(content);
        setTimeout(() => setIsLoading(false), 2000);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addCustomToCart = (item: CartItemCustom) => {
    setCustomCartItems(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(item => item._id !== id));
  const removeCustomFromCart = (id: string) => setCustomCartItems(prev => prev.filter(item => item._id !== id));

  const updateQuantity = (id: string, delta: number) => setCartItems(prev => prev.map(item => {
    if (item._id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
    return item;
  }));
  const updateCustomQuantity = (id: string, delta: number) => setCustomCartItems(prev => prev.map(item => {
    if (item._id === id) {
      const newQuantity = Math.max(1, item.quantity + delta);
      const pricePerItem = item.totalPrice / item.quantity;
      return { ...item, quantity: newQuantity, totalPrice: pricePerItem * newQuantity };
    }
    return item;
  }));

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0) +
                    customCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
                       customCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div ref={scrollRef} className="relative bg-cream-light min-h-screen text-stone-dark selection:bg-rose-dust selection:text-white">
      
      <AnimatePresence>{isLoading && <LoadingScreen key="loader" />}</AnimatePresence>

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <ThreeBackground />
      </div>

      {!isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

          {/* Navigation */}
          <motion.nav style={{ y: headerY }} className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center">
            <img src="/logo.jpg" alt="B&B Co. Logo" className="h-10 w-auto cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})} />
            <div className="flex items-center gap-6">
              <button onClick={() => setIsCartOpen(true)} className="p-2 rounded-full hover:bg-stone-dark/5 transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-dust text-stone-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{cartCount}</span>
                )}
              </button>
              <button className="md:hidden p-2"><Menu className="w-6 h-6" /></button>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <section className="h-screen w-full flex flex-col items-center justify-center relative z-10 px-4">
            <motion.div className="text-center">
              <h2 className="text-rose-dust font-serif italic text-xl md:text-2xl mb-4 tracking-widest">Est. 2024</h2>
              <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl text-stone-dark mb-6 leading-tight drop-shadow-sm">
                The Bespoke <br /> Bouquet Co.
              </h1>
              <p className="font-sans text-stone-500 max-w-md mx-auto leading-relaxed mb-8">
                {pageContent?.heroText || "Nature's Artistry, Hand-Tied."}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm shadow-xl shadow-stone-dark/10">
                Explore Collection
              </motion.button>
            </motion.div>
          </section>

          {/* Gallery Section */}
          <section id="gallery" className="relative z-20 bg-white/80 backdrop-blur-sm pt-24 pb-0 px-0 m-0">
            <h2 className="font-serif text-4xl md:text-5xl text-stone-dark text-center m-0 p-0">Gallery</h2>
            <Gallery onAddToCart={addCustomToCart} />
          </section>

          {/* Testimonials Section */}
          <Testimonials onOrderClick={() => setIsShopOpen(true)} />

          {/* Footer */}
          <footer className="bg-stone-dark text-cream-light py-16 relative z-20">
            <div className="container mx-auto px-6 text-center">
              <h2 className="font-serif text-3xl mb-8">The Bespoke Bouquet Co.</h2>
              <p className="text-stone-400 mb-8 max-w-lg mx-auto">
                Bringing the ethereal beauty of the garden into your home with curated, seasonal arrangements.
              </p>
              <div className="flex justify-center gap-8 text-sm text-stone-500 uppercase tracking-widest">
                <a href="https://instagram.com/thebespokebouquetco" target="_blank" rel="noopener noreferrer" className="hover:text-rose-dust flex items-center gap-2 transition-colors"><Instagram className="w-4 h-4" /> Instagram</a>
                <a href="https://tiktok.com/@thebespokebouquetco" target="_blank" rel="noopener noreferrer" className="hover:text-rose-dust flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </a>
                <a href="#" className="hover:text-rose-dust transition-colors">Contact</a>
              </div>
              <p className="mt-16 text-xs text-stone-600">© 2024 The Bespoke Bouquet Co. All rights reserved.</p>
            </div>
          </footer>

          {/* Interactive Elements */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            customItems={customCartItems}
            onRemove={removeFromCart}
            onRemoveCustom={removeCustomFromCart}
            onUpdateQuantity={updateQuantity}
            onUpdateCustomQuantity={updateCustomQuantity}
            onCheckout={handleCheckout}
          />
          <CheckoutPage isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cartItems} customItems={customCartItems} subtotal={cartSubtotal} />
          <ShopPage isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} onAddToCart={addCustomToCart} />

        </motion.div>
      )}
      
    </div>
  );
}

export default App;
