import React from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, children, className }: BottomSheetProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out bg-white/95 dark:bg-[#090d16]/95 text-slate-900 dark:text-slate-100 rounded-t-2xl border-t border-x border-slate-200/90 dark:border-white/10 shadow-[0_-12px_45px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.85)] backdrop-blur-3xl p-6 sg-custom-scrollbar overscroll-contain",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        {/* Drag Handle (Visual only) */}
        <div className="w-12 h-1 bg-slate-300/80 dark:bg-white/20 rounded-xs mx-auto mb-5" />
        
        {children}
      </div>
    </>
  );
}
