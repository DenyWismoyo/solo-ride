"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrafficCone, 
  Bus, 
  Bike, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle2,
  Loader2,
  Phone,
  Radio
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface GovDishubWorkspaceProps {
  orders?: OrderDocument[];
  loading?: boolean;
}

export function GovDishubWorkspace({ orders = [], loading = false }: GovDishubWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"shelter" | "laporan" | "bst">("shelter");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingReports = orders.filter(o => o.status === "pending_verification" || o.status === "pending");
  const completedReports = orders.filter(o => o.status === "completed");

  const [shelters] = useState([
    {
      id: "sh-1",
      name: "Shelter Sriwedari (Jl. Bhayangkara)",
      capacity: "25 Motor",
      activeDrivers: 18,
      status: "Siap CFD",
      location: "Samping Taman Sriwedari"
    },
    {
      id: "sh-2",
      name: "Shelter Gajah Mada (Jl. Gajah Mada)",
      capacity: "20 Motor",
      activeDrivers: 14,
      status: "Siap CFD",
      location: "Sirip Utara Slamet Riyadi"
    },
    {
      id: "sh-3",
      name: "Shelter Nonongan (Jl. Yos Sudarso)",
      capacity: "30 Motor",
      activeDrivers: 24,
      status: "Siap CFD",
      location: "Akses Pasar Klewer & Kauman"
    },
    {
      id: "sh-4",
      name: "Shelter Gladak (Bundaran PGS)",
      capacity: "35 Motor",
      activeDrivers: 28,
      status: "Siap CFD",
      location: "Pintu Masuk Keraton & PGS"
    }
  ]);

  const handleResolveReport = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      playSuccessChime();
      alert("✅ Laporan Lalu Lintas Telah Ditindaklanjuti & Ditandai Tuntas.");
    } catch (err: any) {
      console.error("Gagal menyelesaikan laporan:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-wider">Status CFD Slamet Riyadi</span>
          <div className="text-xs font-black text-yellow-600 dark:text-yellow-400 mt-0.5">Steril Minggu 06.00-09.30</div>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Shelter Resmi</span>
          <div className="text-lg font-black text-slate-900 dark:text-white">4 Titik Sirip</div>
        </div>
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Laporan Lalin Masuk</span>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400">{pendingReports.length}</div>
        </div>
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Armada BST</span>
          <div className="text-lg font-black text-blue-600 dark:text-blue-400">45 Bus</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab("shelter")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "shelter"
              ? "bg-yellow-500 text-slate-950 font-black shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <TrafficCone className="h-3.5 w-3.5" />
          <span>Shelter CFD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("laporan")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "laporan"
              ? "bg-yellow-500 text-slate-950 font-black shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Laporan Warga ({pendingReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bst")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "bst"
              ? "bg-yellow-500 text-slate-950 font-black shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Bus className="h-3.5 w-3.5" />
          <span>Feeder BST</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}
      {activeTab === "shelter" && (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {shelters.map((sh) => (
              <div
                key={sh.id}
                className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-1.5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sh.name}</h4>
                    <p className="text-[10px] text-slate-500">{sh.location}</p>
                  </div>
                  <Badge variant="emerald" size="sm">{sh.status}</Badge>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-white/[0.04] text-[10px] text-slate-500">
                  <span>Kapasitas: <strong>{sh.capacity}</strong></span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                    {sh.activeDrivers} Driver Standby
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "laporan" && (
        <div className="space-y-3">
          {pendingReports.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Tidak ada aduan kemacetan atau lampu lalu lintas yang belum ditangani.
            </div>
          ) : (
            pendingReports.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-white/95 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-sm text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="amber" size="sm">LAPORAN LALIN</Badge>
                      <span className="font-bold text-slate-900 dark:text-white">{order.serviceTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                      <span>{order.dropoffLocation?.address}</span>
                    </p>
                  </div>
                </div>

                {order.citizenDetails?.description && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] text-[11px] text-slate-600 dark:text-zinc-300">
                    "{order.citizenDetails.description}"
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => order.id && handleResolveReport(order.id)}
                    disabled={processingId === order.id}
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    {processingId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Tandai Selesai Ditangani
                      </>
                    )}
                  </Button>

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Hubungi</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "bst" && (
        <div className="p-4 bg-white/95 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl space-y-2 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Integrasi Feeder Batik Solo Trans
            </h3>
          </div>
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[11px]">
            Sistem Ride-Solo terhubung dengan simpul halte BST Solo untuk rute terintegrasi ojek antar-jemput first-mile dan last-mile.
          </p>
        </div>
      )}
    </div>
  );
}
