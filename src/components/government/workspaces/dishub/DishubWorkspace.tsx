"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  XCircle,
  Radio,
  Navigation
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { SLACountdownBadge } from "@/components/government/shared/SLACountdownBadge";
import { useAuthContext } from "@/components/AuthProvider";
import { writeAuditLog } from "@/lib/auditLog";
import { useRoadIncidents } from "@/hooks/useRoadIncidents";
import { toast } from "@/components/ui/toast";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DishubWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"kir" | "lalin" | "rembug">("kir");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);

  // Civic Community Feed from Pojok Rembug
  const { incidents: communityIncidents, loading: loadingIncidents } = useRoadIncidents();

  const handleReject = async (reason: string) => {
    if (!rejectionTarget?.id) return;
    const orderId = rejectionTarget.id;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedByDinasAt: serverTimestamp(),
        rejectedByDinasName: userData?.displayName || "Petugas Dishub",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Dishub",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }
      
      toast.success("Permohonan Berhasil Ditolak", {
        description: `Alasan: ${reason}`
      });
    } catch (err: any) {
      toast.error("Gagal Menolak Permohonan", {
        description: err.message || "Terjadi kesalahan jaringan."
      });
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };

  const kirOrders = orders.filter(o => o.serviceType?.includes("kir"));
  const lalinOrders = orders.filter(o => o.serviceType?.includes("lalin") || o.serviceType?.includes("jalan"));

  const handleResolveLalin = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Dishub",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "verified",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Dishub",
          actorRole: userData?.additionalRole || "government"
        });
      }

      toast.success("Laporan Lalu Lintas Ditindaklanjuti!", {
        description: "Regu CCROOM Dishub Kota Surakarta telah mengoptimalkan arus lalu lintas."
      });
    } catch (err: any) {
      toast.error("Gagal Memperbarui Status", {
        description: err.message || "Terjadi kendala jaringan."
      });
    } finally {
      setDispatchingId(null);
    }
  };

  const handleDispatchDishubToIncident = (incidentTitle: string) => {
    toast.success("Petugas Dishub Diterjunkan!", {
      description: `Regu pengatur lalu lintas meluncur ke titik: ${incidentTitle}`
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Booking Uji KIR</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{kirOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Laporan CCROOM</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{lalinOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Rembug Lalu Lintas</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">{communityIncidents.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Integrasi Feeder BST</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">12 Koridor</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("kir")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "kir"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Jadwal Uji KIR ({kirOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("lalin")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "lalin"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Laporan CCROOM ({lalinOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rembug")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "rembug"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Radio className="h-4 w-4 text-teal-500 animate-pulse" />
          <span>Rembug Lalin Warga ({communityIncidents.length})</span>
        </button>
      </div>

      {/* 3. ORDER / INCIDENT CARDS */}
      {activeTab === "rembug" ? (
        loadingIncidents ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memuat pantauan kemacetan & insiden Rembug Solo...</span>
          </div>
        ) : communityIncidents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
            Tidak ada laporan kemacetan atau insiden jalan aktif saat ini.
          </div>
        ) : (
          <div className="space-y-3">
            {communityIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-teal-500/20 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {inc.title}
                      </span>
                      <Badge variant="teal" size="sm" className="text-[10px]">
                        {inc.category.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-teal-500" />
                      <span>{inc.streetName || inc.location?.address || "Surakarta"}</span>
                      <span>•</span>
                      <span>{inc.stillActiveCount || 0} Konfirmasi Warga</span>
                    </div>
                  </div>

                  <Badge variant={inc.status === "resolved" ? "emerald" : "teal"} size="sm">
                    {inc.status === "resolved" ? "Lancar" : "Pantau Arus"}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 dark:text-zinc-300 bg-teal-500/5 dark:bg-teal-500/10 p-2.5 rounded-xl border border-teal-500/15">
                  {inc.description || "Laporan arus lalu lintas dari warga Rembug Solo."}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                  <Button
                    size="sm"
                    onClick={() => handleDispatchDishubToIncident(inc.title)}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1" />
                    <span>Terjunkan Petugas Pengurai</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data operasional Dishub...</span>
        </div>
      ) : (activeTab === "kir" ? kirOrders : lalinOrders).length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada antrean pada kategori {activeTab}.
        </div>
      ) : (
        <div className="space-y-3">
          {(activeTab === "kir" ? kirOrders : lalinOrders).map((order) => {
            const details = order.citizenDetails || {};
            const isPending = order.status === "pending_verification" || order.status === "pending";
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.customerName || "Pemilik Kendaraan / Pelapor"}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.licensePlate || details.trafficIssueType || order.serviceTitle}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      {details.vehicleType && <span>Jenis: {details.vehicleType}</span>}
                      {details.bookingDate && <span>Tanggal: {details.bookingDate}</span>}
                      {details.locationName && <span>Lokasi: {details.locationName}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                      {order.status}
                    </Badge>
                    {isPending && (
                      <SLACountdownBadge
                        createdAt={order.createdAt}
                        serviceType={order.serviceType}
                        additionalRole="gov_dishub"
                        status={order.status}
                      />
                    )}
                  </div>
                </div>

                {isPending && activeTab === "lalin" && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectionTarget(order)}
                      disabled={dispatchingId === order.id}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Tolak
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => order.id && handleResolveLalin(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Tindak Lanjuti & Selesaikan</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RejectionModal
        isOpen={!!rejectionTarget}
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleReject}
        orderInfo={{
          serviceName: rejectionTarget?.serviceTitle,
          customerName: rejectionTarget?.customerName,
          orderId: rejectionTarget?.id
        }}
      />
    </div>
  );
}
