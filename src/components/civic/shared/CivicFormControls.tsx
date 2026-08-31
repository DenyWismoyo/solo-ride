"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

export function CivicTextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
  icon,
  className = "",
  mono = false
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 ${mono ? "font-mono font-bold" : ""} ${className}`}
      />
    </div>
  );
}

export function CivicSelectField({
  label,
  value,
  onChange,
  options,
  icon,
  className = ""
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[] | string[];
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500 ${className}`}
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function CivicTextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
  required = false,
  icon,
  className = ""
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 ${className}`}
      />
    </div>
  );
}

export function CivicRadioField({
  label,
  value,
  onChange,
  options,
  icon,
  className = ""
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[] | string[];
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </label>
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <label key={val} className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-zinc-200 cursor-pointer">
              <input
                type="radio"
                name={label}
                value={val}
                checked={value === val}
                onChange={() => onChange(val)}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span>{lbl}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function CivicPriceFooter({
  label,
  sublabel,
  priceText,
  accentColor = "text-blue-600 dark:text-blue-400",
  bgAccent = "bg-blue-500/10 border-blue-500/20"
}: {
  label: string;
  sublabel?: string;
  priceText: string;
  accentColor?: string;
  bgAccent?: string;
}) {
  return (
    <div className={`p-3.5 rounded-2xl ${bgAccent} border flex items-center justify-between text-xs`}>
      <div className="space-y-0.5">
        <span className="text-slate-600 dark:text-zinc-300 font-semibold block">{label}</span>
        {sublabel && <span className="text-[10px] text-slate-500 block">{sublabel}</span>}
      </div>
      <span className={`font-black text-sm ${accentColor}`}>{priceText}</span>
    </div>
  );
}

export function CivicSubmitButton({
  isSubmitting,
  submitText = "Kirim Permohonan",
  loadingText = "Mengirim...",
  onCancel,
  buttonBg = "bg-blue-600 hover:bg-blue-700",
  shadowColor = "shadow-blue-600/20"
}: {
  isSubmitting: boolean;
  submitText?: string;
  loadingText?: string;
  onCancel: () => void;
  buttonBg?: string;
  shadowColor?: string;
}) {
  return (
    <div className="pt-2 flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="w-1/3 py-2.5 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700 cursor-pointer"
      >
        Batal
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className={`w-2/3 py-2.5 rounded-xl text-xs font-bold ${buttonBg} text-white flex items-center justify-center gap-2 shadow-lg ${shadowColor} cursor-pointer`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <span>{submitText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </Button>
    </div>
  );
}

export { CivicAddressSelector } from "./CivicAddressSelector";
