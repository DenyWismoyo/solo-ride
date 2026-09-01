"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, Loader2, MapPin, Phone , XCircle} from "lucide-react";
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

export function SatpolppWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"trantib" | "acara">("trantib");
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
        rejectedByDinasName: userData?.displayName || "Petugas Satpol PP",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Satpol PP",
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
  
  const allSatpolOrders = orders.filter(o => o.serviceType?.includes("trantib") || o.serviceType?.includes("satpolpp"));
  
  const trantibOrders = allSatpolOrders.filter(o => o.citizenDetails?.trantibCategory !== "Permohonan Pengamanan Acara Keramaian Warga");
  const acaraOrders = allSatpolOrders.filter(o => o.citizenDetails?.trantibCategory === "Permohonan Pengamanan Acara Keramaian Warga");

  const currentList = activeTab === "trantib" ? trantibOrders : acaraOrders;

  const handleResolveTrantib = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Satpol PP",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "completed",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Satpol PP",
          actorRole: userData?.additionalRole || "government"
        });
      }

      alert("✅ Laporan Trantibum Telah Ditindaklanjuti Regu Patroli Satpol PP!");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-200 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 text-center space-y-0.5">
          <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider">Laporan Trantibum</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{trantibOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Kondusifitas Wilayah</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">99.1% Aman</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Regu Patroli Reaksi Cepat</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">8 Pleton</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Penertiban Humanis</span>
          <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">100% Persuasif</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("trantib")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "trantib"
              ? "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Laporan Trantibum ({trantibOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("acara")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "acara"
              ? "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Izin & Pengamanan Acara ({acaraOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data Satpol PP...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada {activeTab === "trantib" ? "laporan gangguan trantibum" : "permohonan izin acara"} aktif.
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => {
            const details = order.citizenDetails || {};
            const isPending = order.status !== "completed";
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {details.citizenName || order.customerName}
                      </span>
                      <Badge variant="neutral" size="sm" className="text-[10px] truncate max-w-[150px]">
                        {details.eventName || details.trantibCategory || "Trantibum"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Lokasi: {details.locationName || order.pickupLocation?.address} {details.rtRw ? `RT/RW ${details.rtRw}` : ""}</span>
                      <span>•</span>
                      <span>Telp: {details.phone || order.customerPhone}</span>
                    </div>
                    {details.eventDate && (
                      <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                        Acara: {details.eventDate} ({details.eventParticipants})
                      </div>
                    )}
                  </div>

                  <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  {details.description || "Tidak ada rincian tambahan."}
                </div>

                {isPending && (
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
                      onClick={() => order.id && handleResolveTrantib(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-slate-800 hover:bg-slate-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Tindak Lanjuti Patroli</span>
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
