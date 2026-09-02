"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Store, 
  QrCode, 
  CheckCircle2, 
  Loader2, 
  Search, 
  TrendingDown, 
  Scale, 
  Truck, 
  ShieldCheck, 
  XCircle, 
  MapPin, 
  Package, 
  Clock, 
  Plus, 
  Check, 
  Sparkles,
  AlertTriangle
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

// Data Pantauan Harga Komoditas SIPAHAP Surakarta
const INITIAL_SIPAHAP_DATA = [
  { id: "beras_medium", name: "Beras Medium / SPHP", marketAvg: 14500, hetPrice: 12500, unit: "kg", status: "stabil", lastUpdate: "Hari ini, 07.30 WIB" },
  { id: "cabai_rawit", name: "Cabai Rawit Merah", marketAvg: 34000, hetPrice: 30000, unit: "kg", status: "waspada", lastUpdate: "Hari ini, 07.30 WIB" },
  { id: "minyak_goreng", name: "Minyakita Kemasan", marketAvg: 16500, hetPrice: 15700, unit: "liter", status: "stabil", lastUpdate: "Hari ini, 07.30 WIB" },
  { id: "gula_pasir", name: "Gula Pasir Kristal", marketAvg: 17800, hetPrice: 17000, unit: "kg", status: "stabil", lastUpdate: "Hari ini, 07.30 WIB" },
  { id: "daging_sapi", name: "Daging Sapi Murni", marketAvg: 135000, hetPrice: 130000, unit: "kg", status: "stabil", lastUpdate: "Hari ini, 07.30 WIB" }
];

// Data Alokasi Kuota Beras SPHP Bulog per Kecamatan
const SPHP_DISTRICT_QUOTA = [
  { district: "Kecamatan Laweyan", posko: "Kelurahan Purwosari", allocated: 350, redeemed: 165, remaining: 185 },
  { district: "Kecamatan Serengan", posko: "Pendopo Danukusuman", allocated: 280, redeemed: 188, remaining: 92 },
  { district: "Kecamatan Banjarsari", posko: "Kelurahan Nusukan", allocated: 400, redeemed: 0, remaining: 400 },
  { district: "Kecamatan Jebres", posko: "Balai Warga Mojosongo", allocated: 300, redeemed: 0, remaining: 300 },
  { district: "Kecamatan Pasar Kliwon", posko: "Pendhapi Semanggi", allocated: 250, redeemed: 40, remaining: 210 }
];

export function DisdagWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"vouchers" | "sipahap" | "sphp_stock" | "tera">("vouchers");
  const [filterStatus, setFilterStatus] = useState<"pending" | "dispatched" | "completed">("pending");
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);

  // Filter Orders for GPM / Pasar Murah
  const gpmOrders = orders.filter(o => o.serviceType === "pasar" || o.additionalRole === "gov_disdag");
  const pendingOrders = gpmOrders.filter(o => o.status === "pending_verification");
  const inProgressOrders = gpmOrders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");
  const completedOrders = gpmOrders.filter(o => o.status === "completed");

  const currentList = filterStatus === "pending" ? pendingOrders : filterStatus === "dispatched" ? inProgressOrders : completedOrders;

  // Handle Approve E-Voucher & Dispatch to Driver or Mark as Pickup
  const handleApproveVoucher = async (orderId: string, isDelivery: boolean) => {
    setDispatchingId(orderId);
    try {
      const nextStatus = isDelivery ? "pending" : "completed";
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: nextStatus,
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Posko Disdag",
        updatedAt: serverTimestamp()
      });

      if (user) {
        await writeAuditLog({
          orderId,
          action: isDelivery ? "verified" : "completed",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Disdag Solo",
          actorRole: userData?.additionalRole || "government"
        });
      }

      alert(isDelivery ? "✅ E-Voucher Sah! Pesanan diteruskan ke Radar Driver Mitra." : "✅ E-Voucher Berhasil Ditebus di Posko!");
    } catch (err: any) {
      alert(`Gagal memverifikasi voucher: ${err.message || err}`);
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
        rejectedByDinasName: userData?.displayName || "Petugas Disdag Solo",
        updatedAt: serverTimestamp()
      });

      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Disdag Solo",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }

      alert("❌ Permohonan E-Voucher Berhasil Ditolak.");
    } catch (err: any) {
      alert(`Gagal menolak pesanan: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top OPD Banner */}
      <div className="sg-bento-card p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white border-none shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-tight">Dinas Perdagangan Kota Surakarta</h2>
              <span className="px-2 py-0.2 bg-white/20 text-white rounded-md text-[9px] font-black uppercase">
                Disdag Solo
              </span>
            </div>
            <p className="text-[11px] text-emerald-100">
              Pengelolaan 44 Pasar Tradisional, SPHP BULOG & Gerakan Pangan Murah (GPM)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-right">
          <div>
            <div className="text-xs font-black text-emerald-100">Posko Siaga Aktif</div>
            <div className="text-sm font-black">5 Kecamatan Solo</div>
          </div>
        </div>
      </div>

      {/* 4 Control Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("vouchers")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "vouchers"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scanner & E-Voucher GPM</span>
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-white text-emerald-700 rounded-full text-[9px] font-black">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sipahap")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "sipahap"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>SIPAHAP Harga 44 Pasar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sphp_stock")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "sphp_stock"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Alokasi SPHP Bulog</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tera")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "tera"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Tera Metrologi Timbangan</span>
        </button>
      </div>

      {/* TAB 1: VOUCHERS SCANNER & VERIFICATION */}
      {activeTab === "vouchers" && (
        <div className="space-y-3">
          {/* Search Voucher Bar */}
          <div className="sg-bento-card p-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={voucherSearchCode}
                onChange={(e) => setVoucherSearchCode(e.target.value)}
                placeholder="Scan Barcode / Masukkan Kode GPM-SLO atau PIN Tebus..."
                className="sg-input pl-9 pr-3 py-2 w-full text-xs font-semibold"
              />
            </div>
            <Button size="sm" className="h-9 px-4 text-xs font-bold shrink-0">
              Validasi Voucher
            </Button>
          </div>

          {/* Sub Tab Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400"
              }`}
            >
              Menunggu Tebus ({pendingOrders.length})
            </button>
            <button
              onClick={() => setFilterStatus("dispatched")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "dispatched"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400"
              }`}
            >
              Kurir Mengantar ({inProgressOrders.length})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "completed"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400"
              }`}
            >
              Selesai Ditebus ({completedOrders.length})
            </button>
          </div>

          {/* Order List */}
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Memuat data tebusan sembako...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="sg-bento-card p-8 text-center text-slate-400 space-y-2">
              <Store className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs font-semibold">Tidak ada data tebusan sembako pada status ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map((order) => {
                const orderId = order.id || "";
                const isDelivery = order.dropoffLocation?.address?.toLowerCase().includes("rumah") || 
                                   order.dropoffLocation?.address?.toLowerCase().includes("driver");

                return (
                  <div key={orderId || Math.random().toString()} className="sg-bento-card p-4 space-y-3 border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          #{orderId ? orderId.slice(-6) : "GPM-00"}
                        </span>
                        <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 border-emerald-500/30">
                          {isDelivery ? "🛵 Diantar Driver" : "🏢 Ambil di Posko"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Baru saja"}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-800 dark:text-zinc-200">
                        Posko Tebus: <span className="font-normal">{order.pickupLocation?.address || "Posko GPM Disdag"}</span>
                      </div>
                      <div className="text-slate-600 dark:text-zinc-400">
                        Tujuan: <span className="font-normal">{order.dropoffLocation?.address}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Komoditas: {order.items?.map(i => `${i.name} (${i.qty}x)`).join(", ") || "Paket SPHP Sembako"}
                      </div>
                    </div>

                    {filterStatus === "pending" && orderId && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectionTarget(order)}
                          className="h-8 text-xs font-bold text-rose-600 border-rose-500/30"
                        >
                          Tolak
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveVoucher(orderId, isDelivery)}
                          disabled={dispatchingId === orderId}
                          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          {dispatchingId === orderId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isDelivery ? (
                            "Verifikasi & Teruskan ke Driver"
                          ) : (
                            "Tandai Tebus Selesai"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SIPAHAP LIVE PRICE MONITOR */}
      {activeTab === "sipahap" && (
        <div className="sg-bento-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                SIPAHAP: Sistem Informasi Pantauan Harga Pasar
              </h3>
              <p className="text-[10px] text-slate-500">
                Data agregat harga pangan harian dari 44 Pasar Tradisional Kota Surakarta
              </p>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
              Live Real-Time
            </span>
          </div>

          <div className="space-y-2">
            {INITIAL_SIPAHAP_DATA.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-400">Pembaruan: {item.lastUpdate}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    Rp {item.marketAvg.toLocaleString("id-ID")} <span className="text-[9px] text-slate-400">/ {item.unit}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    HET Subsidi: Rp {item.hetPrice.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ALOKASI SPHP BULOG */}
      {activeTab === "sphp_stock" && (
        <div className="sg-bento-card p-4 space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Alokasi Beras SPHP Bulog per Kecamatan
            </h3>
            <p className="text-[10px] text-slate-500">
              Monitoring distribusi kuota beras SPHP 5kg bersama BULOG KC Surakarta
            </p>
          </div>

          <div className="space-y-2.5">
            {SPHP_DISTRICT_QUOTA.map((q) => (
              <div key={q.district} className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">{q.district}</span>
                  <span className="text-emerald-600 font-extrabold">{q.remaining} Sak Tersisa</span>
                </div>
                <div className="text-[10px] text-slate-500">Posko: {q.posko}</div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(q.redeemed / q.allocated) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Tebus: {q.redeemed} Sak</span>
                  <span>Total Alokasi: {q.allocated} Sak</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TERA METROLOGI */}
      {activeTab === "tera" && (
        <div className="sg-bento-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                Sertifikasi Tera Metrologi Legalitas Timbangan
              </h3>
              <p className="text-[10px] text-slate-500">
                Pemeriksaan timbangan pedagang los 44 pasar tradisional Kota Solo
              </p>
            </div>
            <Scale className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
            <div className="font-extrabold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 1.420 Timbangan Pedagang Terverifikasi
            </div>
            <p className="text-[10px] opacity-90">
              Seluruh los pedagang binaan di Pasar Gede, Pasar Legi, Nusukan, dan Jongke telah dipasangi barcode stempel Tera Pas Disdag Surakarta.
            </p>
          </div>
        </div>
      )}

      {/* Rejection Modal Standard */}
      <RejectionModal
        isOpen={!!rejectionTarget}
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleReject}
        orderInfo={{
          serviceName: "Gerakan Pangan Murah (GPM) Disdag",
          orderId: rejectionTarget?.id
        }}
      />
    </div>
  );
}
