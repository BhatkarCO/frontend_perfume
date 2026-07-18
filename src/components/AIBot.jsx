"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, X, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your Bhatkar & Co. AI Fragrance Stylist. Tell me what notes or vibes you prefer, and I will recommend the perfect scent for you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  
  const handleSend = async (text) => {
  if (!text.trim()) return;

  // Add User Message
  const userMsg = {
    id: Date.now(),
    sender: "user",
    text,
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setIsTyping(true);

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: "guest-user",
        message: text,
      }),
    });

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: "bot",
        text: data.reply,
      },
    ]);
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: "bot",
        text: "Sorry, I'm unable to connect to the AI assistant right now.",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };


  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white border border-luxury-lightgrey rounded-md shadow-2xl w-[320px] sm:w-[350px] h-[460px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-luxury-black text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-white">Bhatkar & Co. AI</h4>
                  <p className="text-[8px] tracking-wider text-gold font-semibold uppercase">Fragrance Stylist</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-luxury-deep">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`text-[11px] px-3.5 py-2.5 rounded-md leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-luxury-black text-white rounded-br-none'
                        : 'bg-white text-luxury-black border border-luxury-lightgrey rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Recommendation mini cards */}
                  {msg.products && (
                    <div className="flex flex-col gap-2 mt-2 w-full">
                      {msg.products.map((prod, idx) => (
                        <Link
                          key={idx}
                          href={`/catalog`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 bg-white p-2 border border-luxury-lightgrey rounded-sm hover:border-gold transition-colors shadow-sm"
                        >
                          <div className="relative w-8 h-8 flex-shrink-0 rounded-sm overflow-hidden bg-luxury-darkgrey">
                            <Image
                              src={prod.image || '/hero-bg.jpg'}
                              alt={prod.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h5 className="text-[9px] font-bold text-luxury-black truncate uppercase tracking-wider">{prod.name}</h5>
                            <p className="text-[8px] text-gold font-bold mt-0.5">₹{prod.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Single Link response */}
                  {msg.link && (
                    <Link
                      href={msg.link.url}
                      onClick={() => setIsOpen(false)}
                      className="mt-2 text-[9px] font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1"
                    >
                      {msg.link.text} →
                    </Link>
                  )}

                  {/* List of Links response */}
                  {msg.links && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.links.map((lnk, idx) => (
                        <Link
                          key={idx}
                          href={lnk.url}
                          onClick={() => setIsOpen(false)}
                          className="bg-white border border-luxury-lightgrey text-luxury-black text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm hover:border-gold transition-colors shadow-sm"
                        >
                          {lnk.text}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="self-start flex items-center gap-1.5 bg-white border border-luxury-lightgrey rounded-md px-3 py-2 text-[10px] text-gray-400 italic shadow-sm">
                  <Bot className="w-3 h-3 text-gold animate-bounce" /> Stylist is thinking...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick replies chips */}
            {messages.length === 1 && (
              <div className="px-3 py-2 flex flex-wrap gap-1.5 bg-white border-t border-luxury-lightgrey">
                <button
                  type="button"
                  onClick={() => handleQuickReply('Recommend a Citrus scent')}
                  className="text-[9px] bg-luxury-deep border border-luxury-lightgrey text-gray-600 px-2.5 py-1 rounded-full hover:border-gold hover:text-gold transition-colors focus:outline-none font-medium"
                >
                  🍋 Fresh/Citrus Scent
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Recommend a Woody scent')}
                  className="text-[9px] bg-luxury-deep border border-luxury-lightgrey text-gray-600 px-2.5 py-1 rounded-full hover:border-gold hover:text-gold transition-colors focus:outline-none font-medium"
                >
                  🪵 Woody/Oud Scent
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Recommend a Floral scent')}
                  className="text-[9px] bg-luxury-deep border border-luxury-lightgrey text-gray-600 px-2.5 py-1 rounded-full hover:border-gold hover:text-gold transition-colors focus:outline-none font-medium"
                >
                  🌸 Sweet Floral Scent
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="bg-white border-t border-luxury-lightgrey p-3 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask fragrance stylist..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-3.5 py-2 rounded focus:outline-none"
              />
              <button
                type="submit"
                className="bg-luxury-black text-white hover:bg-gold hover:text-luxury-black p-2.5 rounded flex items-center justify-center transition-colors focus:outline-none"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-luxury-black hover:bg-gold hover:text-luxury-black border border-gold/20 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none flex items-center justify-center relative overflow-hidden"
        title="Bhatkar & Co. AI Stylist"
      >
        <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="w-5.5 h-5.5 text-gold group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
