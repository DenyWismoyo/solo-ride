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
          "fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 border-t border-slate-200/80 dark:border-white/[0.08] rounded-t-3xl shadow-2xl p-6",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        {/* Drag Handle (Visual only) */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-6" />
        
        {children}
      </div>
    </>
  );
}
