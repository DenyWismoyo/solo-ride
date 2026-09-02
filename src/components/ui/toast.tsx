"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export type ToastOptions = string | { title?: string; description?: string };

// Standalone global emitter for usage across services and event handlers
let globalToastEmitter: ((type: ToastType, message: string, title?: string) => void) | null = null;

const parseToastArgs = (message: string, options?: ToastOptions): { msg: string; title?: string } => {

  if (!options) return { msg: message };
  if (typeof options === "string") return { msg: message, title: options };
  return {
    msg: options.description || message,
    title: options.title || (options.description ? message : undefined)
  };
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    const { msg, title } = parseToastArgs(message, options);
    globalToastEmitter?.("success", msg, title);
  },
  error: (message: string, options?: ToastOptions) => {
    const { msg, title } = parseToastArgs(message, options);
    globalToastEmitter?.("error", msg, title);
  },
  info: (message: string, options?: ToastOptions) => {
    const { msg, title } = parseToastArgs(message, options);
    globalToastEmitter?.("info", msg, title);
  },
  warning: (message: string, options?: ToastOptions) => {
    const { msg, title } = parseToastArgs(message, options);
    globalToastEmitter?.("warning", msg, title);
  },
};


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast("success", msg, title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast("error", msg, title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast("info", msg, title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast("warning", msg, title), [showToast]);

  React.useEffect(() => {
    globalToastEmitter = (t, msg, title) => showToast(t, msg, title);
    return () => {
      globalToastEmitter = null;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}
      
      {/* Toast Viewport Container */}
      <div 
        aria-live="polite" 
        className="fixed top-4 right-0 left-0 sm:left-auto sm:right-4 z-[9999] pointer-events-none flex flex-col items-center sm:items-end gap-2 px-4 max-w-sm w-full mx-auto sm:mx-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="pointer-events-auto w-full shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20 dark:border-white/[0.08] p-3.5 flex items-start gap-3 bg-white/95 dark:bg-[#0c1220]/95 text-slate-900 dark:text-white"
            >
              <div className="shrink-0 mt-0.5">
                {item.type === "success" && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {item.type === "error" && (
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {item.type === "warning" && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {item.type === "info" && (
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h4 className="text-xs font-black leading-tight tracking-tight text-slate-900 dark:text-white mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-[11px] font-medium leading-relaxed text-slate-600 dark:text-zinc-300 break-words">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
