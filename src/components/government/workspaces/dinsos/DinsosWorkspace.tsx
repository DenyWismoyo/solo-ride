"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  Accessibility, 
  Store, 
  Truck, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Users,
  LifeBuoy
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

export function DinsosWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"difabel" | "bansos" | "bencana">("difabel");
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

  const difabelOrders = orders.filter(o => o.serviceType?.includes("difabel"));
  const bansosOrders = orders.filter(o => o.serviceType?.includes("bansos") || o.serviceType?.includes("sembako"));
  const bencanaOrders = orders.filter(o => o.serviceType?.includes("bencana") || o.serviceType?.includes("tanggap"));

  const pendingVerificationOrders = orders.filter(o => o.status === "pending_verification");
  const activeTrips = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");

  const handleDispatchDinsosOrder = async (orderId: string, label: string) => {
    const isDTKS = confirm("Apakah warga pemohon ini TERVERIFIKASI dalam DTKS / PKH?\n\n(Klik OK jika Terverifikasi, Cancel jika Tidak/Umum)");

    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Enters driver radar
        "citizenDetails.terverifikasiDTKS": isDTKS,
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

      alert(`✅ Permohonan ${label} Berhasil Disetujui! Subsidi 100% dialokasikan dan pesanan diteruskan ke Radar Driver Mitra.`);
    } catch (err: any) {
      alert(`Gagal dispatch: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const currentList = activeTab === "difabel" ? difabelOrders : activeTab === "bansos" ? bansosOrders : bencanaOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS BENTO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Ojek Difabel & Lansia</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{difabelOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Klaim Bansos Sembako</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{bansosOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Logistik Bencana Tagana</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">{bencanaOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Alokasi Subsidi APBD</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">100% Terjamin</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("difabel")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "difabel"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Accessibility className="h-4 w-4" />
          <span>Ojek Difabel ({difabelOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("bansos")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "bansos"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Kupon Sembako ({bansosOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("bencana")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "bencana"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Tagana Bencana ({bencanaOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER CARDS */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat antrean Dinas Sosial...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada permohonan pada kategori {activeTab}.
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
                        {order.customerName || "Warga Penerima Manfaat"}
                      </span>
                      <Badge variant="rose" size="sm" className="text-[10px]">
                        {details.serviceName || order.serviceTitle}
                      </Badge>
                      {details.terverifikasiDTKS && (
                        <Badge variant="teal" size="sm" className="text-[10px] ml-1">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          DTKS Valid
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      {details.pkhCardNumber && <span>No PKH: {details.pkhCardNumber}</span>}
                      {details.disabilityType && <span>Kondisi: {details.disabilityType}</span>}
                      {details.disasterType && <span>Bencana: {details.disasterType}</span>}
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
                    <span className="truncate">{order.dropoffLocation?.address || "Alamat tujuan"}</span>
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
                      onClick={() => order.id && handleDispatchDinsosOrder(order.id, order.serviceTitle || "Layanan Dinsos")}
                      disabled={dispatchingId === order.id}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Setujui Subsidi & Dispatch</span>
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
