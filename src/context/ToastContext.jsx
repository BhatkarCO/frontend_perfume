"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const contextValue = useMemo(() => ({
    showToast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info')
  }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Render Area */}
      <div className="fixed bottom-20 md:bottom-5 right-5 z-[9999] flex flex-col gap-3 w-[calc(100%-2.5rem)] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-start justify-between w-full p-4 rounded-sm shadow-2xl bg-white dark:bg-[#1A1A1A] border border-luxury-lightgrey dark:border-[#B89765]/30"
            >
              <div className="flex gap-3">
                <span className="mt-0.5">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-[#B89765]" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-[#B89765]" />}
                </span>
                <p className="text-sm font-medium text-black dark:text-[#FAF9F6]">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-[#B89765] transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
