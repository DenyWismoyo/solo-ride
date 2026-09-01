"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck2, 
  Truck, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  KeyRound,
  Baby,
  Accessibility,
  XCircle
} from "lucide-react";
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

export function DukcapilWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"pending" | "dispatched" | "completed">("pending");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);

  const pendingOrders = orders.filter(o => o.status === "pending_verification");
  const inProgressOrders = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");
  const completedOrders = orders.filter(o => o.status === "completed");

  const handleApproveAndDispatch = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Enters driver mitra radar!
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

      alert("✅ Dokumen Adminduk Berhasil Diverifikasi! Pesanan diteruskan ke Radar Driver Mitra.");
    } catch (err: any) {
      alert(`Gagal memverifikasi: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

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

  const currentList = activeTab === "pending" ? pendingOrders : activeTab === "dispatched" ? inProgressOrders : completedOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS BENTO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Total Permohonan</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Perlu Verifikasi</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Kurir Bergerak</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">{inProgressOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Selesai OTP</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedOrders.length}</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "pending"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Verifikasi Loket ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("dispatched")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "dispatched"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Dalam Pengantaran ({inProgressOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "completed"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Riwayat Arsip ({completedOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER CARDS */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data permohonan Disdukcapil...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada permohonan dokumen pada tab ini.
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
                        {order.customerName || "Warga Surakarta"}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.docType || order.serviceTitle || "KTP-el"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>NIK: {details.nik || "-"}</span>
                      <span>•</span>
                      <span>Loket: {details.selectedOffice || "Disdukcapil Balai Kota"}</span>
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
                    <span className="truncate">{order.dropoffLocation?.address || "Alamat warga"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{order.customerPhone || "-"}</span>
                  </div>
                </div>

                {order.otpCode && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                    <span className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1 font-semibold">
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>OTP Serah Terima Dokumen:</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {order.otpCode}
                    </span>
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
                      onClick={() => order.id && handleApproveAndDispatch(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Verifikasi & Dispatch Driver</span>
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
