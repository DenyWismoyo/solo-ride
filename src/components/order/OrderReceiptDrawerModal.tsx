"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Receipt, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderDocument } from "@/types/order.types";

interface OrderReceiptDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDocument;
}

export function OrderReceiptDrawerModal({
  isOpen,
  onClose,
  order
}: OrderReceiptDrawerModalProps) {
  if (!isOpen) return null;

  const itemsTotal = order.items?.reduce((acc, i) => acc + (i.price * i.qty), 0) || (order.price - 8000);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="sg-bento-card max-w-sm w-full p-5 shadow-2xl space-y-4"
      >
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-orange-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Rincian Tagihan & Biaya</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Items List if food/mart */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menu / Barang:</span>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start text-slate-700 dark:text-zinc-300">
                <div>
                  <span>{it.qty}x {it.name}</span>
                  {it.notes && <p className="text-[10px] text-amber-600 dark:text-amber-400">Catatan: {it.notes}</p>}
                </div>
                <span className="font-bold">Rp {(it.price * it.qty).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cost Summary */}
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs">
          {order.items && order.items.length > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Menu</span>
              <span>Rp {itemsTotal.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>Ongkir / Tarif Layanan</span>
            <span>{order.price === 0 ? "Gratis (Subsidi Pemkot)" : `Rp ${order.price?.toLocaleString("id-ID")}`}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Metode Pembayaran</span>
            <span className="font-bold text-slate-900 dark:text-white uppercase">{order.paymentMethod || "Tunai"}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-zinc-800">
            <span>Total Tagihan</span>
            <span className="text-orange-600 dark:text-orange-400">Rp {order.price?.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {order.customerNote && (
          <div className="p-2.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl text-[10px] text-slate-600 dark:text-zinc-400">
            <strong>Catatan:</strong> "{order.customerNote}"
          </div>
        )}

        <Button onClick={onClose} className="w-full h-10 text-xs rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold cursor-pointer">
          Tutup Rincian
        </Button>
      </motion.div>
    </div>
  );
}
