"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Droplet, 
  Heart, 
  Truck, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Hospital,
  XCircle,
  Pill,
  ShieldCheck,
  Check
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { SLACountdownBadge } from "@/components/government/shared/SLACountdownBadge";
import { useAuthContext } from "@/components/AuthProvider";
import { writeAuditLog } from "@/lib/auditLog";
import { toast } from "@/components/ui/toast";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DinkesWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"resep" | "prolanis" | "darah">("resep");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);
  const [preparingOrders, setPreparingOrders] = useState<Record<string, boolean>>({});

  const handleReject = async (reason: string) => {
    if (!rejectionTarget?.id) return;
    const orderId = rejectionTarget.id;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedByDinasAt: serverTimestamp(),
        rejectedByDinasName: userData?.displayName || "Petugas Dinkes/Puskesmas",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Dinkes/Puskesmas",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }
      
      toast.success("Permohonan Berhasil Ditolak", {
        description: `Alasan: ${reason}`
      });
    } catch (err: any) {
      toast.error("Gagal Menolak Permohonan", {
        description: err.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };

  const resepOrders = orders.filter(o => o.serviceType?.includes("resep"));
  const prolanisOrders = orders.filter(o => o.serviceType?.includes("prolanis"));
  const darahOrders = orders.filter(o => o.serviceType?.includes("darah") || o.serviceType?.includes("donor"));

  const pendingOrders = orders.filter(o => o.status === "pending_verification");

  const handleTogglePharmacyPreparation = async (orderId: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    setPreparingOrders(prev => ({ ...prev, [orderId]: nextStatus }));

    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        "citizenDetails.isPreparedByPharmacy": nextStatus,
        "citizenDetails.preparedAt": nextStatus ? serverTimestamp() : null,
        "citizenDetails.pharmacistName": userData?.displayName || "Apoteker Puskesmas",
        updatedAt: serverTimestamp()
      });

      if (nextStatus) {
        toast.success("Obat Siap & Tersegel", {
          description: "Apoteker telah meracik obat. Silakan panggil kurir medis."
        });
      } else {
        toast.info("Status Persiapan Dibatalkan", {
          description: "Obat kembali ke tahap peracikan farmasi."
        });
      }
    } catch (err: any) {
      toast.error("Gagal Mengubah Status Persiapan", {
        description: err.message || "Terjadi kesalahan jaringan."
      });
    }
  };

  const handleApprovePrescription = async (order: OrderDocument) => {
    const orderId = order.id;
    if (!orderId) return;

    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Apoteker Faskes",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "verified",
          actorId: user.uid,
          actorName: userData?.displayName || "Apoteker Faskes",
          actorRole: userData?.additionalRole || "government",
          notes: "Obat selesai diracik farmasi & kurir medis dipanggil."
        });
      }

      toast.success("Kurir Medis Dikerahkan!", {
        description: "Pesanan masuk ke radar driver mitra untuk penjemputan obat di loket Puskesmas."
      });
    } catch (err: any) {
      toast.error("Gagal Memverifikasi Resep", {
        description: err.message || "Terjadi kesalahan."
      });
    } finally {
      setDispatchingId(null);
    }
  };

  const currentList = activeTab === "resep" ? resepOrders : activeTab === "prolanis" ? prolanisOrders : darahOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS BENTO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Antar Obat Puskesmas</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{resepOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Distribusi Prolanis</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{prolanisOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Siaga Darah PMI</span>
          <div className="text-xl font-black text-red-600 dark:text-red-400">{darahOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Triage Apotek</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingOrders.length}</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("resep")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "resep"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>Resep Obat ({resepOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("prolanis")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "prolanis"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Prolanis ({prolanisOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("darah")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "darah"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Droplet className="h-4 w-4 text-red-500" />
          <span>Darah PMI ({darahOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER CARDS */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat antrean resep farmasi & faskes...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada antrean permohonan medis pada tab ini.
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => {
            const details = order.citizenDetails || {};
            const isPendingVerification = order.status === "pending_verification";
            const isPrepared = details.isPreparedByPharmacy || preparingOrders[order.id || ""] || false;

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.customerName || "Pasien Faskes Solo"}
                      </span>
                      <Badge variant={activeTab === "darah" ? "rose" : "teal"} size="sm" className="text-[10px]">
                        {details.serviceName || order.serviceTitle}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      {details.medRecordNo && <span>No RM: {details.medRecordNo}</span>}
                      {details.bpjsNo && <span>BPJS: {details.bpjsNo}</span>}
                      {details.bloodType && <span>Gol Darah: {details.bloodType} ({details.bloodBagsCount || 1} Kantong)</span>}
                      {details.puskesmasOrigin && <span>Faskes: {details.puskesmasOrigin}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      variant={
                        isPendingVerification
                          ? "amber"
                          : order.status === "completed"
                          ? "emerald"
                          : "teal"
                      }
                      size="sm"
                    >
                      {order.status}
                    </Badge>

                    {isPendingVerification && (
                      <SLACountdownBadge
                        createdAt={order.createdAt}
                        serviceType={order.serviceType}
                        additionalRole="gov_dinkes"
                        status={order.status}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.dropoffLocation?.address || "Alamat Pasien / RS"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{order.customerPhone || "-"}</span>
                  </div>
                </div>

                {/* Triage Apotek / Farmasi Check for Resep Orders */}
                {isPendingVerification && activeTab === "resep" && (
                  <div className="p-3 rounded-xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                          {isPrepared ? "Obat Telah Diramu & Tersegel" : "Tahap Peracikan Farmasi Puskesmas"}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {isPrepared ? "Apoteker telah memverifikasi dosis dan menyegel paket obat." : "Pastikan obat selesai diramu sebelum memanggil kurir."}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => order.id && handleTogglePharmacyPreparation(order.id, isPrepared)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        isPrepared
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100"
                      }`}
                    >
                      {isPrepared ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{isPrepared ? "Selesai Diramu" : "Tandai Siap"}</span>
                    </button>
                  </div>
                )}

                {isPendingVerification && (
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
                      onClick={() => handleApprovePrescription(order)}
                      disabled={dispatchingId === order.id || (activeTab === "resep" && !isPrepared)}
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>
                        {activeTab === "resep" && !isPrepared ? "Menunggu Racikan Selesai" : "Panggil Kurir Medis (Dispatch)"}
                      </span>
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
