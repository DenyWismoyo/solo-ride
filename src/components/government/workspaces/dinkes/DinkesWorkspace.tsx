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
  Hospital 
, XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { useAuthContext } from "@/components/AuthProvider";
import { writeAuditLog } from "@/lib/auditLog";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DinkesWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"resep" | "prolanis" | "darah">("resep");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);

  const handleReject = async (reason: string) => {
    if (!rejectionTarget?.id) return;
    const orderId = rejectionTarget.id;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedByDinasAt: serverTimestamp(),
        rejectedByDinasName: userData?.displayName || "Petugas Dinas",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Dinas",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }
      
      alert("Permohonan berhasil ditolak.");
    } catch (err: any) {
      alert(`Gagal menolak: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };

  const resepOrders = orders.filter(o => o.serviceType?.includes("resep"));
  const prolanisOrders = orders.filter(o => o.serviceType?.includes("prolanis"));
  const darahOrders = orders.filter(o => o.serviceType?.includes("darah") || o.serviceType?.includes("donor"));

  const pendingOrders = orders.filter(o => o.status === "pending_verification");
  const activeTrips = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");

  const handleApprovePrescription = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Dinas",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "verified",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Dinas",
          actorRole: userData?.additionalRole || "government"
        });
      }

      alert("✅ Resep Farmasi Berhasil Diverifikasi! Kurir Medis dipanggil ke Loket Puskesmas.");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
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
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Verifikasi Apotek</span>
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
          <span>Resep Puskesmas ({resepOrders.length})</span>
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
          <span>Prolanis BPJS ({prolanisOrders.length})</span>
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
          <span>Kurir Darah PMI ({darahOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER CARDS */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data layanan kesehatan...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada antrean resep / permintaan darah pada tab ini.
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => {
            const details = order.citizenDetails || {};
            const isPendingVerification = order.status === "pending_verification";
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
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      {details.medRecordNo && <span>No RM: {details.medRecordNo}</span>}
                      {details.bpjsNo && <span>BPJS: {details.bpjsNo}</span>}
                      {details.bloodType && <span>Gol Darah: {details.bloodType} ({details.bloodBagsCount || 1} Kantong)</span>}
                    </div>
                  </div>

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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.dropoffLocation?.address || "Alamat pasien/RS"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{order.customerPhone || "-"}</span>
                  </div>
                </div>

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
                      onClick={() => order.id && handleApprovePrescription(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Verifikasi Apotek & Dispatch</span>
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
