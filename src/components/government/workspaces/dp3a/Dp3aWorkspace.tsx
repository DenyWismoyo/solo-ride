"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Loader2, Eye, EyeOff , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { useAuthContext } from "@/components/AuthProvider";
import { maskName, maskPhone } from "@/lib/privacy";
import { writeAuditLog } from "@/lib/auditLog";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function Dp3aWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const handleReject = async (orderId: string) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "cancelled",
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
      alert("Permohonan berhasil ditolak.");
    } catch (err: any) {
      alert(`Gagal menolak: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };
  const [revealedOrderIds, setRevealedOrderIds] = useState<string[]>([]);
  
  const sapaOrders = orders.filter(o => o.serviceType?.includes("sapa") || o.serviceType?.includes("dp3a"));

  const handleResolveSapa = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Kasus SAPA 129 Telah Ditindaklanjuti & Masuk Penanganan Konselor.");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const toggleReveal = async (orderId: string) => {
    const isRevealing = !revealedOrderIds.includes(orderId);
    
    setRevealedOrderIds(prev => 
      isRevealing ? [...prev, orderId] : prev.filter(id => id !== orderId)
    );

    if (isRevealing && user && userData) {
      try {
        await writeAuditLog({
          orderId,
          action: "identity_revealed",
          actorId: user.uid,
          actorName: userData.displayName || "Petugas DP3A",
          actorRole: userData.additionalRole || "government",
          notes: "Petugas membuka identitas anonim pemohon"
        });
      } catch (err) {
        console.error("Failed to write audit log for reveal:", err);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Laporan SAPA 129</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{sapaOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Kerahasiaan Kasus</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">100% Terenkripsi</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Psikolog PUSPAGA</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">12 Konselor</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Rumah Aman (Shelter)</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">Siaga 24 Jam</div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data SAPA 129 DP3A...</span>
        </div>
      ) : sapaOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada laporan perlindungan perempuan dan anak saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {sapaOrders.map((order) => {
            const details = order.citizenDetails || {};
            const isPending = order.status !== "completed";
            const isAnon = details.isAnonymous;
            const isRevealed = revealedOrderIds.includes(order.id || "");
            
            const rawName = details.namaAtauKode || details.reporterName || order.customerName;
            const rawPhone = details.safeContact || order.customerPhone;
            
            const displayName = isRevealed ? rawName : maskName(rawName);
            const displayPhone = isRevealed ? rawPhone : maskPhone(rawPhone);
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-purple-200/80 dark:border-purple-900/40 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {displayName}
                      </span>
                      {isAnon && (
                        <Badge variant="neutral" size="sm" className="text-[10px] bg-purple-100 text-purple-700">
                          Mode Anonim
                        </Badge>
                      )}
                      <Badge variant="neutral" size="sm" className="text-[10px]">
                        {details.jenisKasus || details.sapaCaseCategory || "Kasus Rahasia"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Kontak Aman: {displayPhone}</span>
                      
                      {!isAnon && order.id && (
                        <button
                          onClick={() => toggleReveal(order.id!)}
                          className="text-purple-600 hover:text-purple-800 flex items-center gap-1 ml-2 underline"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                          {isRevealed ? "Sembunyikan" : "Buka Identitas"}
                        </button>
                      )}
                    </div>
                  </div>

                  <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => order.id && handleReject(order.id)}
                      disabled={dispatchingId === order.id}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Tolak
                    </Button>
<Button
                      size="sm"
                      onClick={() => order.id && handleResolveSapa(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Terima & Tangani Konseling</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
