"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  ThumbsUp, 
  Heart, 
  Clock, 
  ShieldCheck, 
  UtensilsCrossed 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderRatingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting: boolean;
  serviceType?: string;
  driverName?: string;
}

const PRESET_TAGS_DRIVER = [
  { id: "friendly", label: "🌟 Driver Sangat Ramah" },
  { id: "ontime", label: "⚡ Tiba Tepat Waktu" },
  { id: "safe", label: "🛡️ Berkendara Sangat Aman" },
  { id: "clean", label: "✨ Helm & Motor Bersih" },
  { id: "pro", label: "💯 Sangat Membantu" }
];

const PRESET_TAGS_FOOD = [
  { id: "delicious", label: "🍲 Makanan Sangat Lezat" },
  { id: "warm", label: "🔥 Masih Hangat & Segar" },
  { id: "portion", label: "💯 Porsi Pas & Higienis" },
  { id: "fast", label: "⚡ Pengantaran Cepat" }
];

export function OrderRatingReviewModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  serviceType,
  driverName
}: OrderRatingReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["🌟 Driver Sangat Ramah"]);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const isFoodOrMarket = serviceType === "food" || serviceType === "pasar" || serviceType === "mart";
  const tagsList = isFoodOrMarket ? PRESET_TAGS_FOOD : PRESET_TAGS_DRIVER;

  const toggleTag = (label: string) => {
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter((t) => t !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = [
      selectedTags.join(", "),
      comment.trim()
    ].filter(Boolean).join(" — ");

    await onSubmit(rating, finalComment || "Pelayanan sangat memuaskan!");
  };

  const getRatingFeedback = (r: number) => {
    switch (r) {
      case 5: return { label: "Luar Biasa Memuaskan! 💖", color: "text-emerald-500" };
      case 4: return { label: "Sangat Baik & Ramah 👍", color: "text-teal-500" };
      case 3: return { label: "Cukup Baik 😊", color: "text-amber-500" };
      case 2: return { label: "Kurang Memuaskan 😕", color: "text-orange-500" };
      default: return { label: "Perlu Evaluasi ⚠️", color: "text-rose-500" };
    }
  };

  const feedback = getRatingFeedback(rating);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card p-6 max-w-md w-full space-y-4 shadow-2xl rounded-t-3xl sm:rounded-3xl border-emerald-500/20 bg-white dark:bg-[#0c1220]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Beri Nilai & Ulasan Layanan
              </h3>
              <p className="text-[10px] text-slate-500">
                {driverName ? `Mitra: ${driverName}` : "Membantu meningkatkan kualitas ekosistem Solo"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="sg-icon-btn h-8 w-8 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selector */}
          <div className="text-center space-y-1.5 py-1 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-90"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-md"
                        : "text-slate-200 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-xs font-black ${feedback.color} transition-all`}>
              {feedback.label}
            </p>
          </div>

          {/* Preset Compliment Chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 block uppercase pl-1">
              Pilih Apresiasi Cepat:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tagsList.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/10 hover:bg-slate-200"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 block uppercase pl-1">
              Catatan Tambahan (Opsional):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Tuliskan pengalaman atau pesan terima kasih..."
              className="sg-input w-full text-xs font-semibold py-2.5"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Kirim Ulasan & Berikan Nilai</span>
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
