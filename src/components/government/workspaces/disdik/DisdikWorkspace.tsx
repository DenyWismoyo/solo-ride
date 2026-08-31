"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, CheckCircle2, Loader2, MapPin, Phone , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DisdikWorkspace({ orders, loading }: GovWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"semua" | "pagi" | "siang" | "ijazah">("semua");
  const schoolOrders = orders.filter(o => o.serviceType?.includes("sekolah") || o.serviceType?.includes("disdik"));

  const filteredOrders = schoolOrders.filter(o => {
    const tripType = o.citizenDetails?.schoolTripType || "";
    const isIjazah = o.serviceType?.includes("ijazah") || o.citizenDetails?.jenisLegalisir;
    
    if (activeTab === "semua") return true;
    if (activeTab === "ijazah") return isIjazah;
    if (activeTab === "pagi") return tripType.includes("Pagi") || tripType.includes("Berangkat");
    if (activeTab === "siang") return tripType.includes("Sore") || tripType.includes("Pulang");
    return true;
  });

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">Antar Jemput Siswa</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{schoolOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Sekolah Terlayani</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">86 Sekolah</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Driver Ramah Anak</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">120 Driver</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Subsidi Ongkir Pelajar</span>
          <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">100% Terpantau</div>
        </div>
      </div>

      {/* TAB FILTER */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-3">
        {(["semua", "pagi", "siang", "ijazah"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl text-xs h-8 ${activeTab === tab ? "bg-sky-600 text-white hover:bg-sky-700" : "text-slate-600 dark:text-zinc-400"}`}
          >
            {tab === "semua" && "Semua Layanan"}
            {tab === "pagi" && "Berangkat Pagi"}
            {tab === "siang" && "Pulang Siang"}
            {tab === "ijazah" && "Antar Ijazah"}
          </Button>
        ))}
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data Disdik...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada data untuk kategori ini.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const details = order.citizenDetails || {};
            const isIjazah = order.serviceType?.includes("ijazah") || details.jenisLegalisir;
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {isIjazah ? (details.namaAlumnus || order.customerName) : (details.studentName || order.customerName)}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.schoolName || "Sekolah Solo"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{isIjazah ? "Jumlah:" : "NISN:"} {isIjazah ? details.jumlahDokumen : (details.studentNisn || "-")}</span>
                      <span>•</span>
                      <span>Layanan: {isIjazah ? details.jenisLegalisir : (details.schoolTripType || "Antar Jemput")}</span>
                    </div>
                  </div>

                  <Badge variant={order.status === "completed" ? "emerald" : "teal"} size="sm">
                    {order.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
