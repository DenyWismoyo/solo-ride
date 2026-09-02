"use client";

import React, { useState, useMemo } from "react";
import { useMerchantContext } from "../layout/MerchantContext";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, 
  Clock, 
  Bike, 
  History, 
  Search, 
  Flame, 
  Loader2,
  UtensilsCrossed,
  Sparkles,
  Inbox
} from "lucide-react";

export function KitchenOrderStream() {
  const { orders, loading } = useMerchantContext();
  const [activeKitchenTab, setActiveKitchenTab] = useState<"pending" | "preparing" | "delivery" | "history">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingOrders = useMemo(() => orders.filter(o => o.status === "pending_merchant"), [orders]);
  const preparingOrders = useMemo(() => orders.filter(o => o.status === "preparing"), [orders]);
  const deliveryOrders = useMemo(() => orders.filter(o => o.status === "ready_for_pickup" || o.status === "accepted" || o.status === "in_progress"), [orders]);
  const historyOrders = useMemo(() => orders.filter(o => o.status === "completed" || o.status === "rejected" || o.status === "cancelled"), [orders]);

  const currentList = useMemo(() => {
    let list = activeKitchenTab === "pending" ? pendingOrders :
               activeKitchenTab === "preparing" ? preparingOrders :
               activeKitchenTab === "delivery" ? deliveryOrders : historyOrders;

    if (searchQuery.trim()) {
      list = list.filter(o => 
        o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items?.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return list;
  }, [activeKitchenTab, pendingOrders, preparingOrders, deliveryOrders, historyOrders, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top POS Kanban Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveKitchenTab("pending")}
          className={`p-3.5 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
            activeKitchenTab === "pending"
              ? "bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/30 shadow-sm"
              : "sg-bento-card hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              1. PESANAN MASUK
            </span>
            <Inbox className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white">{pendingOrders.length}</span>
            {pendingOrders.length > 0 && (
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveKitchenTab("preparing")}
          className={`p-3.5 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
            activeKitchenTab === "preparing"
              ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 shadow-sm"
              : "sg-bento-card hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              2. SEDANG DIMASAK
            </span>
            <ChefHat className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{preparingOrders.length}</span>
        </button>

        <button
          onClick={() => setActiveKitchenTab("delivery")}
          className={`p-3.5 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
            activeKitchenTab === "delivery"
              ? "bg-blue-500/10 dark:bg-blue-950/30 border-blue-500/30 shadow-sm"
              : "sg-bento-card hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              3. KURIR / OTW
            </span>
            <Bike className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{deliveryOrders.length}</span>
        </button>

        <button
          onClick={() => setActiveKitchenTab("history")}
          className={`p-3.5 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
            activeKitchenTab === "history"
              ? "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 shadow-sm"
              : "sg-bento-card hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              4. SELESAI
            </span>
            <History className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{historyOrders.length}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pesanan (nama pelanggan, menu, ID pesanan)..."
          className="w-full pl-9 pr-4 py-2.5 sg-input text-xs"
        />
      </div>

      {/* Orders Stream List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-xs text-slate-400">Memuat pesanan dapur...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0c1220] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-8">
          <span className="text-3xl">🍳</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            {activeKitchenTab === "pending" ? "Belum ada pesanan baru masuk" :
             activeKitchenTab === "preparing" ? "Tidak ada pesanan yang sedang dimasak" :
             activeKitchenTab === "delivery" ? "Tidak ada pesanan dalam pengantaran" : "Belum ada riwayat pesanan"}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Notifikasi audio otomatis berbunyi saat ada pesanan makanan baru dari warga.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((order) => (
            <KitchenOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
