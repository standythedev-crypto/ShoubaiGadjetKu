import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Smartphone, Send, Bot, User, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Helo! Saya Pembantu Shoubai. Perlukan cadangan gajet atau info harga dalam RM? Sila tanya terus."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      
      const productContext = PRODUCTS.map(p => `${p.name} (${p.category}): ${p.description} - Price: RM ${p.price.toLocaleString()}`).join('\n');
      
      const systemInstruction = `
        You are a highly efficient Gadget Assistant for "ShoubaiGadjetKu".
        
        CRITICAL RULES:
        - CURRENCY: Always use Malaysian Ringgit (RM).
        - STYLE: Be extremely straightforward, concise, and efficient. Avoid fluff or long pleasantries.
        - LANGUAGE: Use ONLY Malay (Bahasa Melayu) or English. Do not use Indonesian.
        - RECOMMENDATIONS: Directly suggest products from the list below with their RM prices.
        
        Available Products:
        ${productContext}
        
        Response Format:
        - Direct answer to the question.
        - If recommending, list 1-2 best options with price.
        - No unnecessary "Helo" or "Terima kasih" unless it's the very first message.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          { role: 'user', parts: [{ text: `System: ${systemInstruction}\n\nUser: ${userMessage}` }] }
        ],
      });

      const aiResponse = response.text || "Maaf, saya mengalami masalah teknikal. Sila cuba lagi.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, nampaknya ada masalah sambungan. Sila cuba sebentar lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#FBFBFD] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back to Store</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Gadget<span className="text-emerald-600">Assistant</span>
            </span>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth">
        <div className="flex-1 flex flex-col gap-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-black' : 'bg-emerald-100'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-black text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm rounded-tl-none">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu tentang gadget..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-black transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3 uppercase tracking-widest font-bold">
            Powered by Gemini AI • ShoubaiGadjetKu Assistant
          </p>
        </div>
      </div>
    </div>
  );
}
