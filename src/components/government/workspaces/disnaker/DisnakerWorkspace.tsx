"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap, CheckCircle2, Loader2, KeyRound , XCircle} from "lucide-react";
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

export function DisnakerWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"ak1" | "blk">("ak1");
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
        rejectedByDinasName: userData?.displayName || "Petugas Disnaker",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Disnaker",
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

  const ak1Orders = orders.filter(o => o.serviceType?.includes("kuning") || o.serviceType?.includes("ak1"));
  const blkOrders = orders.filter(o => o.serviceType?.includes("blk") || o.serviceType?.includes("pelatihan"));

  const handleApproveAk1 = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Disnaker",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "verified",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Disnaker",
          actorRole: userData?.additionalRole || "government"
        });
      }

      alert("✅ Kartu Kuning AK-1 Berhasil Dicetak & Siap Diantar Kurir Mitra!");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleApproveBlk = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Disnaker",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "verified",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Disnaker",
          actorRole: userData?.additionalRole || "government"
        });
      }

      alert("✅ Pendaftaran Peserta Pelatihan BLK Berhasil Disetujui!");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const currentList = activeTab === "ak1" ? ak1Orders : blkOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Antar Kartu AK-1</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{ak1Orders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Peserta Vokasi BLK</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{blkOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Tingkat Penyerapan Kerja</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">84.2%</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Subsidi Pelatihan APBD</span>
          <div className="text-sm font-black text-teal-600 dark:text-teal-400 mt-1">100% Gratis</div>
        </div>
      </div>

      {/* METRIK KAPASITAS BLK (Mock UI) */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
            <Briefcase className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-bold">Kapasitas Balai Latihan Kerja (BLK)</span>
          </div>
          <Badge variant="orange" size="sm" className="text-[9px]">Bulan Ini</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] text-slate-500">Barista & Kopi</div>
            <div className="text-sm font-bold text-orange-600">Sisa 12 Kuota</div>
          </div>
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] text-slate-500">Digital Marketing</div>
            <div className="text-sm font-bold text-orange-600">Sisa 5 Kuota</div>
          </div>
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] text-slate-500">Las Listrik 3G</div>
            <div className="text-sm font-bold text-orange-600 text-rose-500">Penuh</div>
          </div>
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] text-slate-500">Tata Busana</div>
            <div className="text-sm font-bold text-orange-600">Sisa 8 Kuota</div>
          </div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("ak1")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "ak1"
              ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Layanan Kartu Kuning AK-1 ({ak1Orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("blk")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "blk"
              ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Peserta Pelatihan BLK ({blkOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data ketenagakerjaan...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada berkas pada kategori {activeTab}.
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
                        {details.applicantName || order.customerName}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.blkCourse || details.educationMajor || order.serviceTitle}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>NIK: {details.nik || "-"}</span>
                      {details.educationLevel && <span>• Pend: {details.educationLevel}</span>}
                    </div>
                  </div>

                  <Badge variant={isPendingVerification ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                {order.otpCode && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40">
                    <span className="text-[11px] text-orange-700 dark:text-orange-300 flex items-center gap-1 font-semibold">
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>OTP Serah Terima Kartu AK-1:</span>
                    </span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">
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
                      onClick={() => order.id && (activeTab === "ak1" ? handleApproveAk1(order.id) : handleApproveBlk(order.id))}
                      disabled={dispatchingId === order.id}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Verifikasi & Setujui</span>
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
