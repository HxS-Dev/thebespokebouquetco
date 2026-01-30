import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, Instagram, Pin } from 'lucide-react';
import { ThreeBackground } from './components/ThreeBackground';
import { ShopModal } from './components/ShopModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { LoadingScreen } from './components/LoadingScreen';
import { fetchProducts, fetchPageContent } from './services/sanityMock';
import { Product, CartItem } from './types';
import { Gallery } from './components/Gallery';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageContent, setPageContent] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { damping: 15 });
  const headerY = useTransform(smoothProgress, [0, 0.2], [0, -100]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, content] = await Promise.all([fetchProducts(), fetchPageContent()]);
        setProducts(prods);
        setPageContent(content);
        setTimeout(() => setIsLoading(false), 2000);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(item => item._id !== id));
  const updateQuantity = (id: string, delta: number) => setCartItems(prev => prev.map(item => {
    if (item._id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
    return item;
  }));

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm shadow-xl shadow-stone-dark/10">
                Explore Collection
              </motion.button>
            </motion.div>
          </section>

          {/* Gallery Section */}
          <section className="relative z-20 bg-white/80 backdrop-blur-sm pt-24 pb-0 px-0 m-0">
            <h2 className="font-serif text-4xl md:text-5xl text-stone-dark text-center m-0 p-0">Gallery</h2>
            <Gallery />
          </section>

          {/* Shop Section */}
          <section id="shop" className="min-h-screen relative z-20 bg-cream-light py-24">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-rose-dust font-serif text-lg mb-2 block">Shop</span>
                <h2 className="font-serif text-4xl md:text-5xl text-stone-dark">Current Arrangements</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="group cursor-pointer" onClick={() => handleProductClick(product)}>
                    <div className="relative overflow-hidden aspect-[3/4] mb-4 rounded-sm bg-stone-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                      <div className="absolute inset-0 bg-stone-dark/0 group-hover:bg-stone-dark/10 transition-colors duration-300"/>
                      <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-stone-dark px-4 py-2 text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-rose-dust hover:text-white">
                        Quick View
                      </button>
                    </div>
                    <h3 className="font-serif text-xl mb-1 group-hover:text-rose-dust transition-colors">{product.name}</h3>
                    <p className="text-stone-500 font-sans text-sm">${product.price}.00</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-stone-dark text-cream-light py-16 relative z-20">
            <div className="container mx-auto px-6 text-center">
              <h2 className="font-serif text-3xl mb-8">The Bespoke Bouquet Co.</h2>
              <p className="text-stone-400 mb-8 max-w-lg mx-auto">
                Bringing the ethereal beauty of the garden into your home with curated, seasonal arrangements.
              </p>
              <div className="flex justify-center gap-8 text-sm text-stone-500 uppercase tracking-widest">
                <a href="#" className="hover:text-rose-dust flex items-center gap-2 transition-colors"><Instagram className="w-4 h-4" /> Instagram</a>
                <a href="#" className="hover:text-rose-dust flex items-center gap-2 transition-colors"><Pin className="w-4 h-4" /> Pinterest</a>
                <a href="#" className="hover:text-rose-dust transition-colors">Contact</a>
              </div>
              <p className="mt-16 text-xs text-stone-600">© 2024 The Bespoke Bouquet Co. All rights reserved.</p>
            </div>
          </footer>

          {/* Interactive Elements */}
          <ShopModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} onAddToCart={addToCart} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} onCheckout={handleCheckout} />
          <CheckoutPage isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cartItems} subtotal={cartSubtotal} />

        </motion.div>
      )}
      
    </div>
  );
}

export default App;
