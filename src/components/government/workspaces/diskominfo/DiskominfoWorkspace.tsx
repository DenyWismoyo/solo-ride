"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  XCircle, 
  Forward, 
  Building2, 
  X,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { SLACountdownBadge } from "@/components/government/shared/SLACountdownBadge";
import { useAuthContext } from "@/components/AuthProvider";
import { writeAuditLog } from "@/lib/auditLog";
import { toast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "motion/react";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

const FORWARD_OPD_OPTIONS = [
  { id: "gov_dishub", name: "Dinas Perhubungan (DISHUB)", desc: "Lalu lintas, APILL/lampu merah, rambu, parkir", icon: "🚦" },
  { id: "gov_satpolpp", name: "Satpol PP Kota Surakarta", desc: "Ketertiban umum, PKL liar, kebisingan, patroli", icon: "🛡️" },
  { id: "gov_dlh", name: "Dinas Lingkungan Hidup (DLH)", desc: "Tumpukan sampah, pohon rawan tumbang, kebersihan", icon: "♻️" },
  { id: "gov_pupr", name: "DPUPR Kota Surakarta", desc: "Jalan berlubang, saluran drainase, trotoar rusak", icon: "🏗️" },
  { id: "gov_disdag", name: "Dinas Perdagangan (DISDAG)", desc: "Tera timbangan los pasar, stabilitas harga sembako", icon: "🏪" },
  { id: "gov_dinkes", name: "Dinas Kesehatan (DINKES)", desc: "Faskes Puskesmas, jentik nyamuk DBD, sanitasi", icon: "🏥" }
];

export function DiskominfoWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);
  const [forwardTarget, setForwardTarget] = useState<OrderDocument | null>(null);
  const [selectedOpd, setSelectedOpd] = useState<string>("gov_dishub");

  const handleReject = async (reason: string) => {
    if (!rejectionTarget?.id) return;
    const orderId = rejectionTarget.id;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedByDinasAt: serverTimestamp(),
        rejectedByDinasName: userData?.displayName || "Petugas Diskominfo",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Diskominfo",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }
      
      toast.success("Aduan Berhasil Ditolak", {
        description: `Alasan: ${reason}`
      });
    } catch (err: any) {
      toast.error("Gagal Menolak Aduan", {
        description: err.message || "Terjadi kesalahan."
      });
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };

  const ulasOrders = orders.filter(o => o.serviceType?.includes("ulas") || o.serviceType?.includes("diskominfo"));

  const handleResolveUlas = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Diskominfo",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "completed",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Diskominfo",
          actorRole: userData?.additionalRole || "government",
          notes: "Aduan warga ULAS ditindaklanjuti secara tuntas oleh Diskominfo."
        });
      }

      toast.success("Aduan ULAS Selesai", {
        description: "Laporan warga telah ditandai terselesaikan secara mandiri."
      });
    } catch (err: any) {
      toast.error("Gagal Menyelesaikan Aduan", {
        description: err.message || "Terjadi kesalahan."
      });
    } finally {
      setDispatchingId(null);
    }
  };

  const handleConfirmForward = async () => {
    if (!forwardTarget?.id) return;
    const orderId = forwardTarget.id;
    const targetOpdInfo = FORWARD_OPD_OPTIONS.find(o => o.id === selectedOpd);

    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        additionalRole: selectedOpd,
        agencyName: targetOpdInfo?.name || "Dinas Teknis Pemkot",
        forwardedFrom: "gov_diskominfo",
        forwardedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "order_forwarded" as any,
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Diskominfo",
          actorRole: userData?.additionalRole || "government",
          notes: `Aduan diteruskan ke: ${targetOpdInfo?.name} (${selectedOpd})`
        });
      }

      toast.success("Aduan Diteruskan ke OPD Teknis!", {
        description: `Laporan warga kini masuk ke dashboard ${targetOpdInfo?.name}.`
      });

      setForwardTarget(null);
    } catch (err: any) {
      toast.error("Gagal Meneruskan Aduan", {
        description: err.message || "Terjadi kesalahan."
      });
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Bento Cell */}
        <div className="sm:col-span-2 p-5 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              Aduan Warga Portal ULAS
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-cyan-600 dark:text-cyan-400 mt-3">
            {ulasOrders.length}
          </div>
        </div>
        
        {/* Secondary Bento Cells */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider w-1/2">
              Terselesaikan
            </span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">96.8%</div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mb-1">Target SLA</span>
              <div className="text-sm font-black text-teal-600 dark:text-teal-400">&lt; 24 Jam</div>
            </div>
            <div className="p-3 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Integrasi CCTV</span>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400">320 Unit</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat antrean aduan ULAS...</span>
        </div>
      ) : ulasOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada aduan warga yang tertunda di portal ULAS.
        </div>
      ) : (
        <div className="space-y-3">
          {ulasOrders.map((order) => {
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
                        {details.ulasTitle || order.serviceTitle}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.ulasCategory || "Pengaduan"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Pelapor: {details.citizenName || order.customerName}</span>
                      <span>•</span>
                      <span>Lokasi: {details.locationName || order.pickupLocation?.address || "Solo"}</span>
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
                        additionalRole="gov_diskominfo"
                        status={order.status}
                      />
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  {details.description || "Tidak ada deskripsi rinci aduan."}
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
                      variant="outline"
                      onClick={() => setForwardTarget(order)}
                      disabled={dispatchingId === order.id}
                      className="rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/20"
                    >
                      <Forward className="h-3.5 w-3.5 mr-1" />
                      Teruskan ke OPD
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => order.id && handleResolveUlas(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Selesai Mandiri</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
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

      {/* Multi-Agency Forwarding Modal */}
      <AnimatePresence>
        {forwardTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-cyan-500/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <Forward className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Teruskan Aduan Warga ke OPD
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Disposisi resmi tindak lanjut ke dinas teknis terkait
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setForwardTarget(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Judul Aduan:</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">
                    {forwardTarget.citizenDetails?.ulasTitle || forwardTarget.serviceTitle}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                    Pilih Dinas Teknis Tujuan:
                  </label>
                  <div className="space-y-2">
                    {FORWARD_OPD_OPTIONS.map((opd) => {
                      const isSelected = selectedOpd === opd.id;
                      return (
                        <div
                          key={opd.id}
                          onClick={() => setSelectedOpd(opd.id)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200 font-bold shadow-xs"
                              : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xl">{opd.icon}</span>
                          <div className="space-y-0.5 flex-1">
                            <div className="text-xs font-black text-slate-900 dark:text-white">{opd.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">{opd.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={handleConfirmForward}
                  disabled={dispatchingId === forwardTarget.id}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer"
                >
                  {dispatchingId === forwardTarget.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Mendisposisikan Aduan...</span>
                    </>
                  ) : (
                    <>
                      <Forward className="w-4 h-4 mr-1.5" />
                      <span>Kirim Disposisi ke Dinas Terpilih</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
