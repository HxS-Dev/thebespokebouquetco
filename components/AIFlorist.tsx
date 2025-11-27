import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFloralAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIFlorist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello, I am Flora. How can I help you choose the perfect bouquet today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await getFloralAdvice(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-transform hover:scale-105 bg-rose-dust text-stone-dark ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="w-6 h-6 mr-2" />
        <span className="font-serif font-bold hidden md:inline">Ask Flora</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-rose-dust overflow-hidden"
          >
            {/* Header */}
            <div className="bg-rose-dust/30 p-4 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-dust flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-stone-dark" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-dark">Flora</h3>
                  <p className="text-xs text-stone-500">AI Concierge</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-light/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-stone-dark text-white rounded-tr-none'
                        : 'bg-white border border-rose-dust text-stone-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-rose-dust shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-rose-dust rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-rose-dust rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-rose-dust rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-rose-dust/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about occasions or colors..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-rose-dust"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="p-2 bg-stone-dark text-white rounded-full hover:bg-stone-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
