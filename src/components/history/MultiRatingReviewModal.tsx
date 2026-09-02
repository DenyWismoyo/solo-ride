"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  X, 
  Smile, 
  ShieldCheck, 
  Utensils, 
  Bike, 
  Building2, 
  Sparkles,
  Loader2,
  CheckCircle2,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reviewService } from "@/services/review.service";
import { useAuthContext } from "@/components/AuthProvider";
import { toast } from "@/components/ui/toast";
import { OrderDocument } from "@/types/order.types";

interface MultiRatingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDocument;
  onReviewSubmitted?: () => void;
}

const REVIEW_TAGS = [
  "Pengemudi Ramah",
  "Tepat Waktu",
  "Makanan Masih Hangat",
  "Packing Rapi & Higienis",
  "Pelayanan Cepat",
  "Aman & Tertib Lalu Lintas",
  "Resep Obat Tersegel",
  "Sangat Membantu"
];

export function MultiRatingReviewModal({
  isOpen,
  onClose,
  order,
  onReviewSubmitted
}: MultiRatingReviewModalProps) {
  const { user, userData } = useAuthContext();
  const [driverRating, setDriverRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFoodOrMarket = order.serviceType?.includes("food") || order.serviceType?.includes("pasar") || order.serviceType?.includes("mart");
  const isGov = order.targetRole === "government" || order.serviceType?.includes("gov_") || order.serviceType?.includes("dukcapil") || order.serviceType?.includes("dinkes");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Silakan login untuk mengirim ulasan");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate overall score
      const overallRating = Math.round((driverRating + serviceRating) / 2);

      await reviewService.createReview({
        orderId: order.id || "",
        reviewerId: user.uid,
        reviewerName: userData?.displayName || "Warga Solo",
        targetId: order.driverId || order.merchantId || order.additionalRole || "platform",
        targetType: order.driverId ? "driver" : isGov ? "government" : "merchant",
        rating: overallRating,
        driverRating,
        serviceRating,
        merchantRating: isFoodOrMarket ? serviceRating : undefined,
        tags: selectedTags,
        comment: comment.trim()
      });

      toast.success("Matur Nuwun! Ulasan Terkirim", {
        description: "Penilaian Anda membantu menjaga kualitas ekosistem Ride-Solo."
      });

      onReviewSubmitted?.();
      onClose();
    } catch (err: any) {
      toast.error("Gagal Mengirim Ulasan", {
        description: err.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Beri Penilaian & Ulasan Warga
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Order Context Banner */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {order.serviceTitle || "Layanan Ride-Solo"}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                    ID: {order.id?.slice(0, 8)}... • Mitra: {order.driverName || "Mitra Koperasi"}
                  </div>
                </div>
                <Badge variant="teal" size="sm" className="text-[10px]">
                  Pesanan Selesai
                </Badge>
              </div>

              {/* Dimension 1: Driver / Courier Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    <Bike className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Pelayanan Driver & Kurir</span>
                  </div>
                  <span className="text-xs font-black text-amber-500">{driverRating} / 5</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-1.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDriverRating(star)}
                      className="p-1.5 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= driverRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension 2: Product / Service Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {isGov ? (
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : isFoodOrMarket ? (
                      <Utensils className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>
                      {isGov
                        ? "Kecepatan & Akurasi Layanan Dinas"
                        : isFoodOrMarket
                        ? "Kualitas Makanan / Kesegaran Pasar"
                        : "Kualitas & Keamanan Perjalanan"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-500">{serviceRating} / 5</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-1.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setServiceRating(star)}
                      className="p-1.5 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= serviceRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tags */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  Apa yang paling Anda apresiasi?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && <Heart className="w-3 h-3 fill-white" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  Catatan atau Masukan Tambahan:
                </span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tuliskan pengalaman Anda menggunakan layanan ojek & ekosistem Solo ini..."
                  rows={3}
                  className="sg-input w-full text-xs p-3 rounded-xl resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Mengirim Ulasan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>Kirim Penilaian Warga</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
