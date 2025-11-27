import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, Flower, Star, Instagram, Pin } from 'lucide-react';
import { ThreeBackground } from './components/ThreeBackground';
import { SeasonalityChart } from './components/SeasonalityChart';
import { ShopModal } from './components/ShopModal';
import { CartDrawer } from './components/CartDrawer';
import { LoadingScreen } from './components/LoadingScreen';
import { fetchProducts, fetchPageContent } from './services/sanityMock';
import { Product, CartItem } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageContent, setPageContent] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const scrollRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 15 });
  const headerY = useTransform(smoothProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    // Load data and handle loading screen
    const loadData = async () => {
      try {
        const [prods, content] = await Promise.all([
          fetchProducts(),
          fetchPageContent()
        ]);
        setProducts(prods);
        setPageContent(content);
        
        // Ensure loading screen stays for at least 2.5 seconds for effect
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Failed to load content", error);
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
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    // Automatically open cart for better UX
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div ref={scrollRef} className="relative bg-cream-light min-h-screen text-stone-dark selection:bg-rose-dust selection:text-white">
      
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      {/* 3D Background - Always rendered so it's ready when loader fades */}
      <div className="fixed inset-0 z-0">
        <ThreeBackground />
      </div>

      {!isLoading && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
          {/* Navigation */}
          <motion.nav 
            style={{ y: headerY }}
            className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex justify-between items-center mix-blend-multiply pointer-events-none"
          >
            <div className="font-serif text-2xl font-bold tracking-tighter cursor-pointer pointer-events-auto" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              B&B Co.
            </div>
            <div className="flex items-center gap-6 pointer-events-auto">
              <button className="hidden md:block font-serif hover:text-rose-dust transition-colors">Journal</button>
              <button className="hidden md:block font-serif hover:text-rose-dust transition-colors">Weddings</button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-full hover:bg-stone-dark/5 transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-dust text-stone-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="md:hidden p-2">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <section className="h-screen w-full flex flex-col items-center justify-center relative z-10 px-4 pointer-events-none">
            <motion.div 
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="text-center pointer-events-auto"
            >
              <h2 className="text-rose-dust font-serif italic text-xl md:text-2xl mb-4 tracking-widest">Est. 2024</h2>
              <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl text-stone-dark mb-6 leading-tight drop-shadow-sm">
                The Bespoke <br /> Bouquet Co.
              </h1>
              <p className="font-sans text-stone-500 max-w-md mx-auto leading-relaxed mb-8">
                {pageContent?.heroText || "Nature's Artistry, Hand-Tied."}
              </p>
              <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                 className="px-8 py-3 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm shadow-xl shadow-stone-dark/10"
              >
                Explore Collection
              </motion.button>
            </motion.div>
          </section>

          {/* About / Parallax Section */}
          <section className="min-h-screen relative z-20 bg-white/80 backdrop-blur-sm py-24">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                   <motion.div
                     initial={{ opacity: 0, x: -50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.8 }}
                   >
                     <span className="text-rose-dust font-serif text-lg mb-2 block">Our Philosophy</span>
                     <h2 className="font-serif text-4xl md:text-5xl text-stone-dark mb-6">Curated from the wildest gardens.</h2>
                     <p className="text-stone-600 leading-relaxed text-lg mb-8">
                       {pageContent?.aboutText || "Crafting elegance from the finest seasonal blooms."}
                     </p>
                     <div className="flex gap-4 mb-8">
                       <div className="flex items-center gap-2">
                         <Flower className="text-rose-dust w-5 h-5" />
                         <span className="text-sm font-bold uppercase tracking-wide">Sustainable</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Star className="text-rose-dust w-5 h-5" />
                         <span className="text-sm font-bold uppercase tracking-wide">Artisan</span>
                       </div>
                     </div>
                     
                     {/* Seasonality Chart Integration */}
                     <SeasonalityChart />
                   </motion.div>
                </div>
                
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8 }}
                   className="h-[600px] bg-stone-100 rounded-full overflow-hidden relative shadow-2xl"
                >
                  <img 
                    src="https://picsum.photos/id/1062/800/1200" 
                    alt="Florist at work" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 border-[1px] border-white/20 rounded-full m-4 pointer-events-none" />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Shop Section */}
          <section id="shop" className="min-h-screen relative z-20 bg-cream-light py-24">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-rose-dust font-serif text-lg mb-2 block">Shop</span>
                <h2 className="font-serif text-4xl md:text-5xl text-stone-dark">Current Arrangements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <motion.div 
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative overflow-hidden aspect-[3/4] mb-4 rounded-sm bg-stone-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-stone-dark/0 group-hover:bg-stone-dark/10 transition-colors duration-300" />
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
          <ShopModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            product={selectedProduct} 
            onAddToCart={addToCart}
          />
          
          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        </motion.div>
      )}
      
    </div>
  );
}

export default App;