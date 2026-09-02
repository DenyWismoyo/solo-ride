"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  TreePine, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  XCircle,
  Scale,
  Coins,
  X,
  Layers
} from "lucide-react";
import { doc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
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

const ECO_RATES: Record<string, { label: string; rate: number; icon: string }> = {
  kardus: { label: "Kardus & Karton", rate: 250, icon: "📦" },
  plastik: { label: "Plastik PET & Botol", rate: 300, icon: "🧴" },
  besi: { label: "Besi & Logam", rate: 600, icon: "🔩" },
  kaca: { label: "Kaca & Beling", rate: 150, icon: "🍾" },
  jelantah: { label: "Minyak Jelantah", rate: 500, icon: "🛢️" },
  kertas: { label: "Kertas / HVS / Koran", rate: 200, icon: "📄" }
};

export function DlhWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"sampah" | "pohon">("sampah");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);
  const [weighingTarget, setWeighingTarget] = useState<OrderDocument | null>(null);
  
  // Weighing Modal State
  const [actualWeightKg, setActualWeightKg] = useState<number>(5);
  const [selectedWasteType, setSelectedWasteType] = useState<string>("plastik");

  const handleReject = async (reason: string) => {
    if (!rejectionTarget?.id) return;
    const orderId = rejectionTarget.id;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedByDinasAt: serverTimestamp(),
        rejectedByDinasName: userData?.displayName || "Petugas DLH",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas DLH",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }
      
      toast.success("Permohonan DLH Berhasil Ditolak", {
        description: `Alasan: ${reason}`
      });
    } catch (err: any) {
      toast.error("Gagal Menolak Permohonan", {
        description: err.message || "Terjadi kesalahan."
      });
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };

  const sampahOrders = orders.filter(o => o.serviceType?.includes("sampah"));
  const pohonOrders = orders.filter(o => o.serviceType?.includes("pohon"));

  const calculatedPoints = Math.round(actualWeightKg * (ECO_RATES[selectedWasteType]?.rate || 200));

  const handleConfirmWeighing = async () => {
    if (!weighingTarget?.id) return;
    const orderId = weighingTarget.id;

    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        "citizenDetails.beratAktualKg": actualWeightKg,
        "citizenDetails.jenisSampahAktual": selectedWasteType,
        "citizenDetails.ecoPointsAwarded": calculatedPoints,
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Bank Sampah DLH",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "completed",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Bank Sampah DLH",
          actorRole: userData?.additionalRole || "government",
          notes: `Timbangan sampah: ${actualWeightKg} kg (${selectedWasteType}). Poin: +${calculatedPoints}`
        });
      }

      if (calculatedPoints > 0 && weighingTarget.customerId) {
        await updateDoc(doc(db, COLLECTIONS.USERS, weighingTarget.customerId), {
          points: increment(calculatedPoints)
        }).catch(() => {});
      }

      toast.success("Setoran Bank Sampah Selesai!", {
        description: `+${calculatedPoints.toLocaleString("id-ID")} Eco-Points telah dikirimkan ke saldo warga.`
      });

      setWeighingTarget(null);
    } catch (err: any) {
      toast.error("Gagal Memproses Setoran", {
        description: err.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setDispatchingId(null);
    }
  };

  const handleResolveTreeHazard = async (order: OrderDocument) => {
    if (!order.id) return;
    setDispatchingId(order.id);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, order.id), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Tim Perantingan DLH",
        updatedAt: serverTimestamp()
      });

      if (user) {
        await writeAuditLog({
          orderId: order.id,
          action: "completed",
          actorId: user.uid,
          actorName: userData?.displayName || "Tim Perantingan DLH",
          actorRole: userData?.additionalRole || "government",
          notes: "Pemangkasan pohon rawan tumbang telah selesai ditangani regu lapangan."
        });
      }

      toast.success("Perantingan Pohon Selesai Ditangani", {
        description: "Lokasi telah dipastikan aman dan bersih dari dahan pohon."
      });
    } catch (err: any) {
      toast.error("Gagal Menyelesaikan Laporan", {
        description: err.message || "Terjadi kesalahan."
      });
    } finally {
      setDispatchingId(null);
    }
  };

  const currentList = activeTab === "sampah" ? sampahOrders : pohonOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Setoran Bank Sampah</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{sampahOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Total Terolah</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">14.8 Ton</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Perantingan Pohon</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{pohonOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Eco-Points Warga</span>
          <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">280.000 Poin</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("sampah")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "sampah"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span>Jemput Daur Ulang ({sampahOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pohon")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "pohon"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <TreePine className="h-4 w-4" />
          <span>Laporan Perantingan ({pohonOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data operasional DLH...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada antrean pada kategori {activeTab}.
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
                        {details.citizenName || details.reporterName || order.customerName}
                      </span>
                      <Badge variant="emerald" size="sm" className="text-[10px]">
                        {details.jenisSampah ? `${details.jenisSampah.join(", ")} (~${details.estimasiBeratKg || 5}kg)` : details.treeHazardCondition || "Perantingan"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      {details.locationName && <span>Lokasi: {details.locationName}</span>}
                      <span>•</span>
                      <span>Alamat: {order.pickupLocation?.address || "Surakarta"}</span>
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
                        additionalRole="gov_dlh"
                        status={order.status}
                      />
                    )}
                  </div>
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

                    {activeTab === "sampah" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setWeighingTarget(order);
                          setActualWeightKg(details.estimasiBeratKg || 5);
                          setSelectedWasteType(details.jenisSampah?.[0] || "plastik");
                        }}
                        disabled={dispatchingId === order.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs gap-1.5"
                      >
                        <Scale className="h-3.5 w-3.5" />
                        <span>Timbang & Beri Poin</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleResolveTreeHazard(order)}
                        disabled={dispatchingId === order.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs gap-1.5"
                      >
                        {dispatchingId === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Selesai Dipangkas</span>
                      </Button>
                    )}
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

      {/* Interactive Eco-Points Weighing Modal */}
      <AnimatePresence>
        {weighingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Timbangan Bank Sampah DLH
                    </h3>
                    <p className="text-[10px] text-slate-500">Konversi kilogram sampah menjadi Eco-Points warga</p>
                  </div>
                </div>
                <button
                  onClick={() => setWeighingTarget(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nasabah Warga:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {weighingTarget.citizenDetails?.citizenName || weighingTarget.customerName}
                    </span>
                  </div>
                  <Badge variant="emerald" size="sm">
                    {weighingTarget.citizenDetails?.kelurahan || "Surakarta"}
                  </Badge>
                </div>

                {/* Jenis Sampah Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                    1. Pilih Kategori Sampah Utama:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ECO_RATES).map(([key, item]) => {
                      const isSelected = selectedWasteType === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedWasteType(key)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-bold"
                              : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <div className="text-[11px] font-bold truncate">{item.label}</div>
                            <div className="text-[9px] text-slate-400">+{item.rate} Poin/kg</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Berat Aktual Timbangan Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      2. Berat Aktual Hasil Timbangan:
                    </label>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {actualWeightKg} Kilogram
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="0.5"
                    value={actualWeightKg}
                    onChange={(e) => setActualWeightKg(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 kg</span>
                    <span>50 kg</span>
                    <span>100 kg</span>
                  </div>
                </div>

                {/* Live Reward Calculation Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                        Total Poin Daur Ulang:
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        +{calculatedPoints.toLocaleString("id-ID")} Eco-Points
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmWeighing}
                  disabled={dispatchingId === weighingTarget.id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer"
                >
                  {dispatchingId === weighingTarget.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Menyimpan Setoran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>Konfirmasi & Berikan Poin ke Warga</span>
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
