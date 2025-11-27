import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative flex flex-col items-center"
      >
        {/* Animated Flower Icon */}
        <div className="relative w-24 h-24 mb-8">
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 border border-dashed border-rose-dust/50 rounded-full"
          />
          <motion.div 
             animate={{ scale: [0.8, 1.1, 0.8] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-stone-dark" stroke="currentColor" strokeWidth="1">
               <path d="M12 2L12 22M12 2C14.5 2 17 4.5 17 8C17 11.5 12 14 12 14C12 14 7 11.5 7 8C7 4.5 9.5 2 12 2Z" fill="#EACACD" fillOpacity="0.5"/>
               <path d="M12 14C12 14 16 15 18 18M12 14C12 14 8 15 6 18" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-serif text-3xl md:text-4xl text-stone-dark tracking-wide mb-2"
        >
          The Bespoke Bouquet Co.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-sans text-stone-400 text-sm tracking-widest uppercase"
        >
          Gathering Blooms...
        </motion.p>
      </motion.div>
    </div>
  );
};