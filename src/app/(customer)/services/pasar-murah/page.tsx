"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Store, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Truck, 
  UserCheck, 
  ShoppingBag, 
  Minus, 
  Plus, 
  Loader2,
  Calendar,
  AlertCircle,
  TrendingDown,
  Percent,
  FileCheck,
  Users,
  Award
} from "lucide-react";
import { SoloMarketIcon, SoloGovPillarIcon } from "@/components/icons";

// Data Posko & Jadwal GPM di 5 Kecamatan Surakarta dengan Live Quota
const GPM_LOCATIONS = [
  { id: "laweyan", name: "Kecamatan Laweyan", location: "Kantor Kelurahan Purwosari, Jl. Slamet Riyadi", status: "Buka Hari Ini (08.00 - 14.00)", quotaRemaining: 185, totalQuota: 350, badge: "Siaga Posko 1" },
  { id: "serengan", name: "Kecamatan Serengan", location: "Pendopo Kel. Danukusuman, Kec. Serengan", status: "Buka Hari Ini (08.00 - 14.00)", quotaRemaining: 92, totalQuota: 280, badge: "Siaga Posko 2" },
  { id: "banjarsari", name: "Kecamatan Banjarsari", location: "Halaman Kel. Nusukan, Jl. Piere Tendean", status: "Besok (08.00 WIB)", quotaRemaining: 400, totalQuota: 400, badge: "Jadwal Besok" },
  { id: "jebres", name: "Kecamatan Jebres", location: "Balai Warga Mojosongo, Kec. Jebres", status: "Besok (08.00 WIB)", quotaRemaining: 300, totalQuota: 300, badge: "Jadwal Besok" },
  { id: "pasarkliwon", name: "Kecamatan Pasar Kliwon", location: "Pendhapi Kel. Semanggi, Pasar Kliwon", status: "Tersedia", quotaRemaining: 210, totalQuota: 250, badge: "Siaga Posko 3" }
];

// Komoditas Resmi Program SPHP & Gerakan Pangan Murah Pemkot Solo × BULOG
const SPHP_COMMODITIES = [
  {
    id: "sphp-beras",
    name: "Beras SPHP 5kg (BULOG)",
    unit: "Sak 5kg",
    price: 62500,
    normalPrice: 75000,
    savings: 12500,
    maxLimit: 2,
    stock: 24,
    icon: "🍚",
    badge: "SPHP HET Resmi",
    desc: "Beras medium kemasan resmi Bulog penugasan Bapanas & Pemkot Solo"
  },
  {
    id: "sphp-minyak",
    name: "Minyakita Kemasan 1 Liter",
    unit: "Botol/Bantal 1L",
    price: 15700,
    normalPrice: 18500,
    savings: 2800,
    maxLimit: 2,
    stock: 18,
    icon: "🛢️",
    badge: "Subsidi Kemendag",
    desc: "Minyak goreng rakyat terdaftar resmi anti-penimbunan"
  },
  {
    id: "sphp-gula",
    name: "Gula Pasir Maniskita 1kg",
    unit: "Pouch 1kg",
    price: 17000,
    normalPrice: 19500,
    savings: 2500,
    maxLimit: 2,
    stock: 30,
    icon: "🍬",
    badge: "Gula Bulog",
    desc: "Gula pasir kristal putih kualitas premium higienis"
  },
  {
    id: "sphp-telur",
    name: "Telur Ayam Ras Segar 1kg",
    unit: "Tray 1kg",
    price: 24000,
    normalPrice: 28500,
    savings: 4500,
    maxLimit: 2,
    stock: 15,
    icon: "🥚",
    badge: "Peternak Lokal Solo",
    desc: "Telur segar pasokan binaan Dispangtan & Disdag Surakarta"
  },
  {
    id: "sphp-terigu",
    name: "Tepung Terigu Kita 1kg",
    unit: "Pouch 1kg",
    price: 11500,
    normalPrice: 13500,
    savings: 2000,
    maxLimit: 3,
    stock: 20,
    icon: "🌾",
    badge: "Harga Pabrik",
    desc: "Tepung terigu serbaguna bersubsidi pangan"
  }
];

export default function PasarMurahPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [selectedLocation, setSelectedLocation] = useState(GPM_LOCATIONS[0].id);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery" | "titip_kuasa">("pickup");
  const [nikKtp, setNikKtp] = useState("");
  const [isNikVerified, setIsNikVerified] = useState(false);
  const [isVerifyingNik, setIsVerifyingNik] = useState(false);
  const [isDtksBeneficiary, setIsDtksBeneficiary] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [delegationReason, setDelegationReason] = useState("");

  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherData, setVoucherData] = useState<{
    orderId: string;
    voucherCode: string;
    pin: string;
    expiresAt: string;
  } | null>(null);

  // Delivery Fee Calculation (Subsidi DTKS discount)
  const baseDeliveryFee = 8000;
  const deliveryFee = deliveryMethod === "pickup" ? 0 : (isDtksBeneficiary ? 4000 : baseDeliveryFee);

  const handleVerifyNik = () => {
    if (nikKtp.trim().length !== 16) {
      alert("Masukkan 16 digit NIK KTP Surakarta yang valid.");
      return;
    }
    setIsVerifyingNik(true);
    setTimeout(() => {
      setIsVerifyingNik(false);
      setIsNikVerified(true);
      // Auto detect demo DTKS for odd NIK last digit
      const isOdd = parseInt(nikKtp.slice(-1), 10) % 2 !== 0;
      setIsDtksBeneficiary(isOdd);
    }, 800);
  };

  const handleUpdateCart = (itemId: string, delta: number, maxLimit: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;

      if (next > maxLimit) {
        alert(`Batas maksimal komoditas subsidi ini adalah ${maxLimit} item per KK bulan ini.`);
        return prev;
      }

      const newCart = { ...prev };
      if (next <= 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = next;
      }
      return newCart;
    });
  };

  const subtotal = Object.entries(cart).reduce((total, [itemId, qty]) => {
    const item = SPHP_COMMODITIES.find(i => i.id === itemId);
    return total + (item?.price || 0) * qty;
  }, 0);

  const totalNormal = Object.entries(cart).reduce((total, [itemId, qty]) => {
    const item = SPHP_COMMODITIES.find(i => i.id === itemId);
    return total + (item?.normalPrice || 0) * qty;
  }, 0);

  const totalSavings = totalNormal - subtotal;
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleGenerateVoucher = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!isNikVerified && nikKtp.trim().length !== 16) {
      alert("Harap verifikasi NIK KTP Warga Solo terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const items = Object.entries(cart).map(([itemId, qty]) => {
        const item = SPHP_COMMODITIES.find(i => i.id === itemId)!;
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          qty
        };
      });

      const selectedLocObj = GPM_LOCATIONS.find(l => l.id === selectedLocation);

      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "pasar",
        pickupLocation: {
          lat: -7.5755,
          lng: 110.8243,
          address: selectedLocObj?.location || "Posko GPM Pemkot Solo"
        },
        dropoffLocation: {
          lat: -7.56,
          lng: 110.83,
          address: deliveryMethod === "pickup" 
            ? "Ambil di Posko Tebus Kelurahan" 
            : deliveryMethod === "titip_kuasa"
            ? `Titip Tebus Driver (Kuasa: ${recipientName || "Warga Binaan DTKS"})`
            : "Rumah Warga (Sesuai KTP Solo)"
        },
        price: total,
        paymentMethod: "cash",
        items
      });

      // Generate digital voucher details with 24-hour expiration
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      const code = `GPM-SLO-${Date.now().toString().slice(-6)}`;
      const expDate = new Date();
      expDate.setHours(expDate.getHours() + 24);

      setVoucherData({
        orderId,
        voucherCode: code,
        pin: randomPin,
        expiresAt: expDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB Besok"
      });
    } catch (err) {
      alert("Gagal memproses e-voucher subsidi: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocData = GPM_LOCATIONS.find(l => l.id === selectedLocation);

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-32">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4">
        {/* Header Back & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="sg-icon-btn h-9.5 w-9.5 cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Gerakan Pangan Murah (GPM)
                </h1>
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                  Disdag × BULOG
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Stabilisasi Pasokan & Sembako Subsidi Pemkot Surakarta
              </p>
            </div>
          </div>
        </div>

        {/* SIPAHAP Live Inflation & Price Comparison Bar */}
        <div className="sg-bento-card p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white border-none shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Sparkles className="w-28 h-28" />
          </div>
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                SIPAHAP Surakarta: Harga Terkendali
              </div>
              <span className="text-[10px] font-extrabold text-emerald-200">
                Hemat s/d 35%
              </span>
            </div>

            <div>
              <h2 className="text-base font-black tracking-tight leading-tight">
                Sembako Subsidi HET Bapanas Bebas Antre
              </h2>
              <p className="text-[11px] text-emerald-100 max-w-xs leading-relaxed mt-0.5">
                Warga KTP Solo dapat memesan alokasi beras SPHP dan minyak goreng bersubsidi dengan jaminan harga resmi tanpa biaya siluman.
              </p>
            </div>

            {subtotal > 0 && (
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-100 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Total Penghematan Subsidi:
                </span>
                <span className="text-emerald-200 font-black text-sm">
                  - Rp {totalSavings.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Family NIK Vault & DTKS Smart Subsidy */}
        <div className="sg-bento-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  1. Verifikasi NIK KTP & Kuota KK Warga
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Sistem alokasi subsidi adil bebas tengkulak
                </p>
              </div>
            </div>
            {isNikVerified && (
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> NIK Tervalidasi
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={16}
              value={nikKtp}
              onChange={(e) => setNikKtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Masukkan 16 Digit NIK KTP Solo..."
              className="sg-input flex-1 text-xs font-bold tracking-wider"
            />
            <Button
              size="sm"
              onClick={handleVerifyNik}
              disabled={isVerifyingNik || isNikVerified || nikKtp.length < 16}
              className="h-10 px-4 text-xs font-bold shrink-0"
            >
              {isVerifyingNik ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isNikVerified ? "Tervalidasi" : "Cek Kuota"}
            </Button>
          </div>

          {isNikVerified && (
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span>Status Alokasi Bulan Ini:</span>
                <span className="font-extrabold">2 Beras SPHP • 2 Minyakita • 2 Gula</span>
              </div>

              {isDtksBeneficiary && (
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-700 dark:text-teal-300 flex items-center gap-2">
                  <Award className="h-4 w-4 shrink-0 text-teal-500" />
                  <div>
                    <span className="font-extrabold">Warga Penerima DTKS Terdaftar</span>
                    <p className="text-[10px] opacity-90">Mendapatkan potongan ongkir pengantaran kurir 50% (Subsidi APBD).</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Peta Posko GPM Keliling & Kuota Live */}
        <div className="sg-bento-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  2. Lokasi Posko Tebus GPM Keliling
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Pilih titik posko kelurahan/kecamatan terdekat Anda
                </p>
              </div>
            </div>

            {selectedLocData && (
              <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                Sisa: {selectedLocData.quotaRemaining} Paket
              </span>
            )}
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="sg-select w-full text-xs font-semibold"
          >
            {GPM_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name} — {loc.location} (Sisa {loc.quotaRemaining}/{loc.totalQuota} Sak)
              </option>
            ))}
          </select>
        </div>

        {/* Section 3: Komoditas Pangan Pokok Subsidi */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              3. Paket Komoditas Subsidi Hari Ini
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
              Harga HET Bapanas
            </span>
          </div>

          {SPHP_COMMODITIES.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="sg-bento-card p-3.5 flex gap-3 items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-3xl shrink-0">
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-[8px] font-black px-1.5 py-0.2 bg-teal-500/15 text-teal-600 dark:text-teal-400 rounded-md border border-teal-500/20">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                    {item.desc}
                  </p>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      Rp {item.normalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">/ {item.unit}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {qty === 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateCart(item.id, 1, item.maxLimit)}
                      className="h-8 rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Pilih
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-xl p-1 border border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => handleUpdateCart(item.id, -1, item.maxLimit)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-zinc-200 shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-4 text-center text-slate-900 dark:text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCart(item.id, 1, item.maxLimit)}
                        className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 4: Metode Pengambilan & Titip Tebus Driver Carpooling */}
        {subtotal > 0 && (
          <div className="sg-bento-card p-4 space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              4. Metode Pengambilan Sembako
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMethod("pickup")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  deliveryMethod === "pickup"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <QrCode className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-xs font-black leading-tight">Ambil Mandiri</div>
                  <div className="text-[10px] opacity-80">Tebus di Posko (Rp 0)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("delivery")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  deliveryMethod === "delivery"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <Truck className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-xs font-black leading-tight">Antar Driver</div>
                  <div className="text-[10px] opacity-80">{isDtksBeneficiary ? "Rp 4.000 (DTKS)" : "Flat Rp 8.000"}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("titip_kuasa")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  deliveryMethod === "titip_kuasa"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <Users className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-xs font-black leading-tight">Titip Kuasa</div>
                  <div className="text-[10px] opacity-80">Lansia / Difabel</div>
                </div>
              </button>
            </div>

            {deliveryMethod === "titip_kuasa" && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
                  <FileCheck className="h-4 w-4 text-emerald-500" />
                  <span>Surat Kuasa Pengambilan Sembako Digital</span>
                </div>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama Lengkap Pemilik KTP Asli..."
                  className="sg-input w-full text-xs font-semibold"
                />
                <input
                  type="text"
                  value={delegationReason}
                  onChange={(e) => setDelegationReason(e.target.value)}
                  placeholder="Alasan titip kuasa (mis. Lansia, Sedang Bekerja, Sakit)..."
                  className="sg-input w-full text-xs font-semibold"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Checkout & Voucher Generator Bar */}
      {subtotal > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-[#0c1220]/95 border-t border-slate-200/80 dark:border-white/[0.08] backdrop-blur-2xl z-40">
          <div className="max-w-lg mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-zinc-400">
                {deliveryMethod === "pickup" ? "Ambil di Posko GPM" : `Ongkir Antar: Rp ${deliveryFee.toLocaleString("id-ID")}`}
              </span>
              <div className="font-bold text-slate-900 dark:text-white">
                Total Tebus:{" "}
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 ml-1">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleGenerateVoucher}
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-black rounded-xl shadow-lg flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Terbitkan E-Voucher Tebus ({totalItems} Item)</span>
              </div>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Dynamic Security Voucher Result Modal */}
      <AnimatePresence>
        {voucherData && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sg-bento-card p-6 max-w-sm w-full space-y-4 text-center shadow-2xl relative border-emerald-500/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <QrCode className="h-7 w-7" />
              </div>

              <div>
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                  E-Voucher Sah Disdag Solo
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Voucher Tebus Pasar Murah
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Dinas Perdagangan Kota Surakarta × BULOG KC Solo
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2 font-mono">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-widest">
                  {voucherData.voucherCode}
                </div>
                <div className="text-xs text-slate-500">
                  PIN Pengambilan: <span className="font-bold text-slate-900 dark:text-white text-sm">{voucherData.pin}</span>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Berlaku Hingga: {voucherData.expiresAt}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed">
                {deliveryMethod === "pickup"
                  ? "Tunjukkan kode voucher barcode atau PIN di atas kepada petugas posko GPM kelurahan saat pengambilan barang."
                  : deliveryMethod === "titip_kuasa"
                  ? "Petugas posko dan Driver Ride-Solo akan memvalidasi surat kuasa digital ini untuk serah terima sembako."
                  : "Pesanan akan diverifikasi dan diantar langsung oleh Mitra Driver Ride-Solo ke alamat Anda."}
              </p>

              <div className="pt-2 flex gap-2">
                <Button
                  className="flex-1 h-11 text-xs font-bold"
                  onClick={() => router.push(`/order/${voucherData.orderId}`)}
                >
                  Lihat Status Order
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-4 text-xs font-bold"
                  onClick={() => router.push("/")}
                >
                  Beranda
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
