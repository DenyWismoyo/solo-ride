"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  Clock, 
  Radio, 
  Tent, 
  Package, 
  Ship, 
  AlertTriangle, 
  Megaphone,
  Send,
  Sparkles,
  Layers,
  History
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface GovBpbdWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovBpbdWorkspace({ orders, loading }: GovBpbdWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"ews_telemetry" | "relief_triage" | "inventory">("ews_telemetry");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // River telemetry states
  const [jurugLevel, setJurugLevel] = useState(7.42);
  const [pepeLevel, setPepeLevel] = useState(2.10);
  const [jenesLevel, setJenesLevel] = useState(1.65);

  // Logistics Inventory
  const [inventory, setInventory] = useState({
    tents: 45,
    blankets: 280,
    foodRations: 650,
    rubberBoats: 12,
    waterPumps: 8
  });

  const pendingReliefOrders = orders.filter(o => o.status === "pending_verification" || o.status === "pending");
  const inProgressOrders = orders.filter(o => o.status === "in_progress" || o.status === "accepted");
  const completedOrders = orders.filter(o => o.status === "completed");

  const handleApproveRelief = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "in_progress",
        verifiedByDinasAt: serverTimestamp(),
        dispatchedFrom: "Gudang Logistik Pusdalops BPBD Surakarta",
        updatedAt: serverTimestamp()
      });
      playSuccessChime();
      alert("✅ Permohonan Bantuan Logistik Bencana Disetujui! Tim Distribusi & Armada Sedang Bergerak.");
    } catch (err: any) {
      console.error("Gagal menyetujui logistik:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteRelief = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      playSuccessChime();
      alert("✅ Penyaluran Logistik Bencana Telah Diterima oleh Kontak Warga di Titik Lokasi.");
    } catch (err: any) {
      console.error("Gagal menyelesaikan order:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. EXECUTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
            Status EWS Bengawan
          </span>
          <div className="text-xl font-black text-teal-700 dark:text-teal-300">
            {jurugLevel < 9.0 ? "SIAGA HIJAU" : "SIAGA KUNING"}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
            Permintaan Logistik Masuk
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {pendingReliefOrders.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            Distribusi Bergerak
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {inProgressOrders.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            Bantuan Tersalurkan
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedOrders.length}
          </div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab("ews_telemetry")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "ews_telemetry"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>EWS & Telemetri Sungai</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("relief_triage")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "relief_triage"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Tent className="h-3.5 w-3.5" />
          <span>Triage Logistik Bencana ({pendingReliefOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "inventory"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>Gudang Stok Logistik</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Loader2 className="h-6 w-6 text-teal-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Memuat data Pusdalops BPBD...</p>
        </div>
      ) : activeTab === "ews_telemetry" ? (
        /* EWS TELEMETRY PANEL */
        <div className="space-y-4">
          <div className="p-4 bg-white/90 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Waves className="h-4 w-4 text-teal-600" />
                Sensor Ketinggian Air Pos Pantau Bengawan Solo & Anak Sungai
              </h4>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Sinkronisasi BBWS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pos Jurug (Bengawan Solo)</span>
                <div className="text-lg font-black text-teal-700 dark:text-teal-300">{jurugLevel} m</div>
                <span className="text-[10px] text-emerald-600 font-semibold block">Batas Waspada: 9.00 m</span>
              </div>

              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pintu Tirtonadi (Kali Pepe)</span>
                <div className="text-lg font-black text-teal-700 dark:text-teal-300">{pepeLevel} m</div>
                <span className="text-[10px] text-emerald-600 font-semibold block">Batas Waspada: 3.50 m</span>
              </div>

              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Kali Jenes (Pasar Kliwon)</span>
                <div className="text-lg font-black text-teal-700 dark:text-teal-300">{jenesLevel} m</div>
                <span className="text-[10px] text-emerald-600 font-semibold block">Batas Waspada: 2.80 m</span>
              </div>
            </div>
          </div>

          {/* Critical Flood Prone Zones Alert */}
          <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-3xl space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-teal-600" />
              Status 5 Titik Rawan Bantaran Sungai Surakarta
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { name: "Semanggi & Sangkrah (Pasar Kliwon)", river: "Bengawan Solo", status: "Aman Terkendali", badge: "emerald" },
                { name: "Gandekan & Sewu (Jebres)", river: "Kali Pepe Hilir", status: "Aman Terkendali", badge: "emerald" },
                { name: "Banyuanyar (Banjarsari)", river: "Kali Jenes", status: "Aman Terkendali", badge: "emerald" },
                { name: "Pajang & Sondakan (Laweyan)", river: "Kali Premulung", status: "Aman Terkendali", badge: "emerald" },
              ].map((zone) => (
                <div key={zone.name} className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.04]">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block">{zone.name}</span>
                    <span className="text-[10px] text-slate-400">Daerah Aliran {zone.river}</span>
                  </div>
                  <Badge variant="emerald" size="sm">{zone.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "relief_triage" ? (
        /* RELIEF REQUEST QUEUE TAB */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Antrean Permohonan Bantuan Darurat Bencana ({pendingReliefOrders.length})
            </h4>
          </div>

          {pendingReliefOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Tidak ada permohonan logistik bencana yang memerlukan tindakan saat ini.
            </div>
          ) : (
            pendingReliefOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-white/95 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="rose" size="sm">PERLU LOGISTIK</Badge>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{order.serviceTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span>{order.dropoffLocation?.address}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-700 dark:text-zinc-300 space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Kebutuhan Mendesak:</span>
                    <span className="font-bold text-teal-800 dark:text-teal-300">
                      {order.citizenDetails?.reliefItemNeeded || "Tenda, Selimut, Makanan Siap Saji"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-teal-500/20">
                    <span>Estimasi: <strong>{order.citizenDetails?.affectedResidentsCount || 10} KK</strong></span>
                    <span>Kontak: <strong>{order.customerPhone}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => order.id && handleApproveRelief(order.id)}
                    disabled={processingId === order.id}
                    className="flex-1 h-10 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processingId === order.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan Logistik...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Kirim Logistik dari Gudang
                      </>
                    )}
                  </Button>

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Hubungi</span>
                  </a>
                </div>
              </div>
            ))
          )}

          {/* In Progress Distribution Orders */}
          {inProgressOrders.length > 0 && (
            <div className="space-y-3 pt-3">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-1">
                Sedang Dalam Pengiriman ({inProgressOrders.length})
              </h4>
              {inProgressOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{order.serviceTitle}</span>
                    <Badge variant="teal" size="sm">ARMADA BERGERAK</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">{order.dropoffLocation?.address}</p>
                  <Button
                    size="sm"
                    onClick={() => order.id && handleCompleteRelief(order.id)}
                    disabled={processingId === order.id}
                    className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg"
                  >
                    Tandai Telah Tiba & Diserahkan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* INVENTORY TAB */
        <div className="space-y-4">
          <div className="p-4 bg-white/90 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Package className="h-4 w-4 text-teal-600" />
              Inventaris Logistik Gudang Pusdalops BPBD Kota Surakarta
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">Tenda Darurat & Terpal</span>
                <span className="text-lg font-black text-teal-700 dark:text-teal-300">{inventory.tents} Unit</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">Selimut & Pakaian Kering</span>
                <span className="text-lg font-black text-teal-700 dark:text-teal-300">{inventory.blankets} Lembar</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">Paket Sembako Siap Saji</span>
                <span className="text-lg font-black text-teal-700 dark:text-teal-300">{inventory.foodRations} Porsi</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">Perahu Karet & Pelampung</span>
                <span className="text-lg font-black text-teal-700 dark:text-teal-300">{inventory.rubberBoats} Unit</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">Pompa Alkon Sedot Air</span>
                <span className="text-lg font-black text-teal-700 dark:text-teal-300">{inventory.waterPumps} Unit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
