"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Loader2, 
  Minus, 
  Plus, 
  MapPin, 
  Search, 
  CheckCircle2,
  FileText,
  Sliders,
  Scale,
  Sun,
  Coins,
  Check
} from "lucide-react";
import { SoloMarketIcon } from "@/components/icons";
import { PasarMultiLapakCheckoutModal } from "@/components/merchant/pasar/PasarMultiLapakCheckoutModal";
import { ETeraCertificateModal } from "@/components/merchant/pasar/ETeraCertificateModal";
import { useMarketProducts, MarketProductItem } from "@/hooks/useMarketProducts";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

import { toast } from "@/components/ui/toast";
import { DynamicQrisModal } from "@/components/payment/DynamicQrisModal";


// 44 Pasar Tradisional Terkenal di Kota Surakarta
const TRADITIONAL_MARKETS = [
  { id: "pasar_gede", name: "Pasar Gede Hardjonagoro", district: "Jebres", specialty: "Sentra Buah, Bumbu & Dawet Telasih", icon: "🏛️", stallsCount: 420 },
  { id: "pasar_legi", name: "Pasar Legi (Pusat Induk)", district: "Banjarsari", specialty: "Grosir Sayur Mayur & Bumbu Giling", icon: "🥬", stallsCount: 850 },
  { id: "pasar_nusukan", name: "Pasar Nusukan", district: "Banjarsari", specialty: "Daging Segar, Ayam & Ikan", icon: "🥩", stallsCount: 310 },
  { id: "pasar_jongke", name: "Pasar Jongke", district: "Laweyan", specialty: "Sayur Subuh & Sembako Barat", icon: "🥕", stallsCount: 260 },
  { id: "pasar_harjodaksino", name: "Pasar Harjodaksino (Gemblegan)", district: "Serengan", specialty: "Ikan Laut, Daging & Kelontong", icon: "🐟", stallsCount: 380 },
  { id: "pasar_nongko", name: "Pasar Nongko", district: "Banjarsari", specialty: "Sentra Buah & Jajanan Pasar", icon: "🍌", stallsCount: 190 },
  { id: "pasar_kadipolo", name: "Pasar Kadipolo", district: "Laweyan", specialty: "Sayur Siap Masak & Kuliner", icon: "🍲", stallsCount: 220 },
  { id: "pasar_klewer", name: "Pasar Klewer", district: "Pasar Kliwon", specialty: "Batik, Tekstil & Oleh-oleh", icon: "🧵", stallsCount: 1200 }
];

// Kategori Komoditas Pasar Tradisional
const MARKET_CATEGORIES = [
  { id: "all", label: "Semua Komoditas", icon: "🧺" },
  { id: "sayur", label: "Sayur & Lalapan", icon: "🥦" },
  { id: "bumbu", label: "Bumbu & Racik Giling", icon: "🌶️" },
  { id: "daging", label: "Daging Sapi & Ayam", icon: "🥩" },
  { id: "ikan", label: "Ikan & Seafood", icon: "🐟" },
  { id: "buah", label: "Buah-buahan", icon: "🍌" },
  { id: "jajanan", label: "Jajanan Khas Solo", icon: "🥮" }
];

// Opsi Kustomisasi Potong / Giling
const CUSTOM_OPTIONS: Record<string, string[]> = {
  daging: ["Potong Dadu (Gulai/Sop)", "Potong 4 Bagian", "Potong 8 Bagian", "Fillet Tipis", "Giling Halus (Bakso/Rawon)"],
  bumbu: ["Giling Halus Siap Masak", "Giling Kasar Tradisional", "Ekstra Gurih Tanpa Pedas", "Level Pedas Nampol"],
  sayur: ["Petik Bersih", "Ikat Utuh Segar"],
  ikan: ["Bersihkan Sisik & Isi Perut", "Potong Steak 3 Bagian", "Utuh Segar"]
};

// Produk Realistis Pasar Tradisional Surakarta
const TRADITIONAL_MARKET_PRODUCTS = [
  // Sayuran
  {
    id: "prod-sayur-1",
    name: "Bayam Hijau Segar",
    category: "sayur",
    marketId: "pasar_legi",
    kiosName: "Los Sayur Mbok Darmi (Blok A-12)",
    price: 3500,
    unit: "Ikat Besar",
    image: "🥬",
    stock: 25,
    origin: "Petani Lereng Merbabu",
    hasCustom: true,
    teraCertified: true
  },
  {
    id: "prod-sayur-2",
    name: "Kangkung Akar Segar",
    category: "sayur",
    marketId: "pasar_legi",
    kiosName: "Kios Sayur Bu Sri (Blok A-05)",
    price: 3000,
    unit: "Ikat",
    image: "🌿",
    stock: 30,
    origin: "Lokal Boyolali",
    hasCustom: true,
    teraCertified: true
  },
  {
    id: "prod-sayur-3",
    name: "Wortel Brastagi Manis",
    category: "sayur",
    marketId: "pasar_gede",
    kiosName: "Lapak Sayur Pak Min (Blok B-02)",
    price: 12000,
    unit: "1 kg",
    image: "🥕",
    stock: 15,
    origin: "Grade A Segar",
    hasCustom: false,
    teraCertified: true
  },

  // Bumbu Dapur
  {
    id: "prod-bumbu-1",
    name: "Bumbu Opor & Rawon Giling Asli",
    category: "bumbu",
    marketId: "pasar_gede",
    kiosName: "Bumbu Racik Mbah Marto (Blok C-08)",
    price: 7000,
    unit: "1 Plastik (1/4 kg)",
    image: "🥘",
    stock: 20,
    origin: "Gilingan Segar Hari Ini",
    hasCustom: true,
    teraCertified: true
  },
  {
    id: "prod-bumbu-2",
    name: "Cabai Rawit Merah Setan",
    category: "bumbu",
    marketId: "pasar_legi",
    kiosName: "Juragan Cabai Mas Bowo (Blok Induk)",
    price: 8500,
    unit: "250 gram",
    image: "🌶️",
    stock: 18,
    origin: "Petik Pagi Pasar Legi",
    hasCustom: false,
    teraCertified: true
  },
  {
    id: "prod-bumbu-3",
    name: "Bawang Merah Brebes Super",
    category: "bumbu",
    marketId: "pasar_legi",
    kiosName: "Kios Bumbu Berkah (Blok C-01)",
    price: 18000,
    unit: "500 gram",
    image: "🧅",
    stock: 22,
    origin: "Kering & Bersih",
    hasCustom: false,
    teraCertified: true
  },

  // Daging & Unggas
  {
    id: "prod-daging-1",
    name: "Daging Sapi Has Dalam (Tenderloin)",
    category: "daging",
    marketId: "pasar_nusukan",
    kiosName: "Lapak Daging Halal Pak Slamet (Los D-04)",
    price: 135000,
    unit: "1 kg",
    image: "🥩",
    stock: 10,
    origin: "Sapi Lokal Segar Subuh",
    hasCustom: true,
    teraCertified: true
  },
  {
    id: "prod-daging-2",
    name: "Ayam Broiler Utuh Segar",
    category: "daging",
    marketId: "pasar_nusukan",
    kiosName: "Ayam Potong Bu Tin (Los D-11)",
    price: 36000,
    unit: "1 Ekor (± 1.2 kg)",
    image: "🍗",
    stock: 14,
    origin: "Bisa Minta Potong",
    hasCustom: true,
    teraCertified: true
  },

  // Ikan & Seafood
  {
    id: "prod-ikan-1",
    name: "Ikan Gurame Hidup / Segar",
    category: "ikan",
    marketId: "pasar_harjodaksino",
    kiosName: "Ikan Segar Gemblegan (Los E-02)",
    price: 45000,
    unit: "1 kg (2-3 ekor)",
    image: "🐟",
    stock: 8,
    origin: "Kolam Air Tawar Klaten",
    hasCustom: true,
    teraCertified: true
  },

  // Buah-buahan
  {
    id: "prod-buah-1",
    name: "Pisang Raja Bulu Manis",
    category: "buah",
    marketId: "pasar_nongko",
    kiosName: "Kios Buah Mbak Yanti (Kios 14)",
    price: 28000,
    unit: "1 Sisir",
    image: "🍌",
    stock: 12,
    origin: "Matang Pohon Alami",
    hasCustom: false,
    teraCertified: true
  },

  // Jajanan Khas Pasar Solo
  {
    id: "prod-jajan-1",
    name: "Lenjongan Komplit Pasar Gede",
    category: "jajanan",
    marketId: "pasar_gede",
    kiosName: "Lenjongan Bu Sum (Depan Pintu Utama)",
    price: 12000,
    unit: "1 Porsi (Gula Jawa Cair)",
    image: "🥮",
    stock: 15,
    origin: "Klepon, Cenil, Tiwul, Grontol",
    hasCustom: false,
    teraCertified: true
  },
  {
    id: "prod-jajan-2",
    name: "Dawet Telasih Khas Solo",
    category: "jajanan",
    marketId: "pasar_gede",
    kiosName: "Es Dawet Telasih Bu Dermi (Pojok Pasar Gede)",
    price: 11000,
    unit: "1 Pouch Gelas",
    image: "🍧",
    stock: 20,
    origin: "Bubur Sumsum & Biji Selasih",
    hasCustom: false,
    teraCertified: true
  }
];

export default function PasarWargaPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { products: liveMarketProducts, loading: productsLoading } = useMarketProducts(TRADITIONAL_MARKET_PRODUCTS);

  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliverySlot, setDeliverySlot] = useState<"instant" | "subuh">("instant");

  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [customSelections, setCustomSelections] = useState<Record<string, string>>({});
  const [activeCustomProduct, setActiveCustomProduct] = useState<MarketProductItem | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isETeraModalOpen, setIsETeraModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>("");


  const deliveryFee = 8000; // Flat fee ojek lokal

  const handleUpdateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      
      const newCart = { ...prev };
      if (next === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = next;
      }
      return newCart;
    });
  };

  const handleSetNote = (itemId: string, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const handleSelectCustom = (itemId: string, option: string) => {
    setCustomSelections(prev => ({ ...prev, [itemId]: option }));
    setActiveCustomProduct(null);
  };

  // Filter Produk
  const filteredProducts = liveMarketProducts.filter(p => {
    const matchMarket = selectedMarket === "all" || p.marketId === selectedMarket;
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.kiosName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMarket && matchCategory && matchSearch;
  });

  // Group Cart by Kios for Multi-Lapak Breakdown
  const groupedCartByKios = Object.entries(cart).reduce<Record<string, Array<{ item: MarketProductItem; qty: number }>>>((acc, [itemId, qty]) => {
    const item = liveMarketProducts.find(i => i.id === itemId);
    if (!item) return acc;
    if (!acc[item.kiosName]) {
      acc[item.kiosName] = [];
    }
    acc[item.kiosName].push({ item, qty });
    return acc;
  }, {});

  const totalKiosCount = Object.keys(groupedCartByKios).length;

  const groupedCartDetail = Object.entries(groupedCartByKios).reduce<Record<string, Array<{ id: string; name: string; price: number; qty: number; unit: string; kiosName: string; note?: string; customOption?: string }>>>((acc, [kiosName, items]) => {
    acc[kiosName] = items.map(({ item, qty }) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty,
      unit: item.unit,
      kiosName: item.kiosName,
      note: notes[item.id] || "",
      customOption: customSelections[item.id] || ""
    }));
    return acc;
  }, {});

  const subtotal = Object.entries(cart).reduce((total, [itemId, qty]) => {
    const item = liveMarketProducts.find(i => i.id === itemId);
    return total + (item?.price || 0) * qty;
  }, 0);

  const total = subtotal > 0 ? subtotal + deliveryFee : 0;
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const earnedCoins = Math.floor(subtotal / 2000); // 1 Koin Pasar per Rp 2.000

  const handleCheckout = async (paymentMethod: "cash" | "qris" = "cash") => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const items = Object.entries(cart).map(([itemId, qty]) => {
        const item = liveMarketProducts.find(i => i.id === itemId);
        return {
          id: item?.id || itemId,
          name: item?.name || "Komoditas Pasar",
          kiosName: item?.kiosName || "Lapak Pasar Solo",
          price: item?.price || 0,
          qty,
          note: notes[itemId] || "",
          customOption: customSelections[itemId] || ""
        };
      });

      const currentMarket = TRADITIONAL_MARKETS.find(m => m.id === selectedMarket);

      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "pasar",
        pickupLocation: {
          lat: -7.5755,
          lng: 110.8243,
          address: currentMarket 
            ? `${currentMarket.name} (Multi-Los Belanja: ${totalKiosCount} Kios)` 
            : `Pasar Tradisional Surakarta (${totalKiosCount} Los Pedagang)`
        },
        dropoffLocation: {
          lat: -7.56,
          lng: 110.83,
          address: deliverySlot === "subuh" ? "Rumah Warga (Slot Subuh 05.30 - 08.00 WIB)" : "Alamat Rumah Warga"
        },
        price: total,
        paymentMethod,
        items
      });

      setCreatedOrderId(orderId);
      setIsCheckoutModalOpen(false);

      if (paymentMethod === "qris") {
        setIsQrisModalOpen(true);
      } else {
        toast.success("Pesanan Pasar Warga berhasil dibuat!", "Sukses");
        router.push(`/order/${orderId}`);
      }
    } catch (err: any) {
      toast.error("Gagal membuat pesanan Pasar Warga: " + err.message, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-36">
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
                  Pasar Warga Surakarta
                </h1>
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                  0% Komisi
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Belanja Sayur Segar, Bumbu & Daging Langsung dari 44 Pasar Tradisional Solo
              </p>
            </div>
          </div>
        </div>

        {/* Promo & E-Tera Guarantee Banner */}
        <div className="sg-bento-card p-4.5 bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-transparent border-rose-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-rose-500 text-white rounded-md uppercase">
                  Multi-Lapak 1 Ongkir
                </span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Scale className="w-3 h-3" /> Jaminan Tera Metrologi Disdag
                </span>
              </div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Belanja Multi-Los Diantar 1 Driver Tanpa Mark-up
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Beli sayur, daging, bumbu di pedagang berbeda cukup bayar 1 kali tarif flat ojek.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl shrink-0 shadow-xs">
              🧺
            </div>
          </div>
        </div>

        {/* Delivery Time Slot Selector (Instant vs Subuh-Fresh) */}
        <div className="sg-bento-card p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" /> Jadwal Waktu Pengantaran
            </span>
            <span className="text-[10px] text-rose-500 font-extrabold">
              {deliverySlot === "subuh" ? "🌅 Pengantaran Subuh" : "⚡ Kirim Sekarang"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliverySlot("instant")}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                deliverySlot === "instant"
                  ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-xs font-black">Langsung Antar</div>
                <div className="text-[9px] opacity-80">Estimasi 30-45 Menit</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeliverySlot("subuh")}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                deliverySlot === "subuh"
                  ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
              }`}
            >
              <Sun className="w-4 h-4 shrink-0 text-amber-500" />
              <div>
                <div className="text-xs font-black">Subuh-Fresh (Besok)</div>
                <div className="text-[9px] opacity-80">Pukul 05.30 - 08.00 WIB</div>
              </div>
            </button>
          </div>
        </div>

        {/* Disdag E-Tera Guarantee Card */}
        <div 
          onClick={() => setIsETeraModalOpen(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-teal-500/30 flex items-center justify-between gap-3 cursor-pointer hover:border-teal-500/50 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100">Jaminan Timbangan Pas & Jujur</span>
                <Badge variant="teal" size="sm" className="text-[9px] font-bold py-0 px-1.5">E-TERA DISDAG</Badge>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                Seluruh timbangan los pasar telah terkalibrasi UPTD Metrologi Legal Pemkot Solo.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 shrink-0 flex items-center gap-0.5">
            Lihat SK <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">

          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sayur bayam, cabai, daging sapi, dawet telasih..."
            className="sg-input pl-10 pr-4 py-2.5 w-full text-xs font-semibold"
          />
        </div>

        {/* Section 1: Pemilih Pasar Tradisional Solo */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3 w-3 text-rose-500" /> Pilih Pasar Tradisional Solo
            </h3>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
              44 Pasar Dikelola
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedMarket("all")}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedMarket === "all"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100"
              }`}
            >
              Semua Pasar (44)
            </button>
            {TRADITIONAL_MARKETS.map((market) => (
              <button
                key={market.id}
                type="button"
                onClick={() => setSelectedMarket(market.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedMarket === market.id
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100"
                }`}
              >
                <span>{market.icon}</span>
                <span>{market.name.split(" ")[1] || market.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Kategori Komoditas Pasar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {MARKET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Section 3: Katalog Produk Los Pedagang */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
              Menampilkan {filteredProducts.length} Komoditas Segar
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Stok Segar Pagi Ini
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyStateCard
              icon="🧺"
              title="Komoditas Belum Tersedia"
              description={`Belum ada pedagang yang menambahkan barang untuk kategori ini di ${
                selectedMarket === "all" ? "pasar pilihan" : TRADITIONAL_MARKETS.find(m => m.id === selectedMarket)?.name
              }. Silakan pilih pasar lain atau ubah kata kunci pencarian.`}
              actionLabel="Lihat Semua Komoditas"
              onAction={() => {
                setSelectedMarket("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            />
          ) : (
            filteredProducts.map((item) => {
              const qty = cart[item.id] || 0;
              const note = notes[item.id] || "";
              const customOption = customSelections[item.id] || "";

              return (
                <div key={item.id} className="sg-bento-card p-3.5 space-y-2.5">
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-3xl shrink-0 shadow-xs">
                      {item.image}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        {item.teraCertified && (
                          <span className="text-[8px] font-black px-1 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 shrink-0">
                            ⚖️ Tera Pas
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <Store className="w-3 h-3 text-rose-500" /> {item.kiosName}
                      </p>

                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">/ {item.unit}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {qty === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleUpdateCart(item.id, 1);
                            if (item.hasCustom) setActiveCustomProduct(item);
                          }}
                          className="h-8 rounded-xl text-xs font-bold border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                        >
                          + Beli
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-xl p-1 border border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => handleUpdateCart(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-zinc-200 shadow-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black w-4 text-center text-slate-900 dark:text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCart(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Option Badge & Catatan Belanja */}
                  {qty > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] space-y-1.5">
                      {item.hasCustom && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Request Khusus:</span>
                          <button
                            type="button"
                            onClick={() => setActiveCustomProduct(item)}
                            className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3 h-3" />
                            {customOption || "Pilih Potong/Giling..."}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => handleSetNote(item.id, e.target.value)}
                          placeholder="Catatan belanja (mis. bumbu jangan pedas, pilih yang segar)..."
                          className="bg-slate-100/80 dark:bg-white/[0.04] text-[10px] px-2.5 py-1 rounded-lg w-full text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Checkout Bar with Multi-Lapak Breakdown & Coins */}
      {subtotal > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-[#0c1220]/95 border-t border-slate-200/80 dark:border-white/[0.08] backdrop-blur-2xl z-40">
          <div className="max-w-lg mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <span>Multi-Lapak ({totalKiosCount} Los)</span>
                <span>•</span>
                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                  <Coins className="w-3 h-3" /> +{earnedCoins} Koin
                </span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">
                Total Belanja:{" "}
                <span className="text-sm font-black text-rose-600 dark:text-rose-400 ml-1">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsCheckoutModalOpen(true)}
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-black rounded-xl shadow-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-between px-5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Rincian Pesanan ({totalItems} Item dari {totalKiosCount} Los)</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Multi-Merchant Mixed Cart Checkout Modal */}
      <PasarMultiLapakCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        marketName={TRADITIONAL_MARKETS.find(m => m.id === selectedMarket)?.name || "Pasar Tradisional Surakarta"}
        marketDistrict={TRADITIONAL_MARKETS.find(m => m.id === selectedMarket)?.district || "Surakarta"}
        groupedCartByKios={groupedCartDetail}
        deliverySlot={deliverySlot}
        deliveryFee={deliveryFee}
        onConfirmOrder={(method) => handleCheckout(method)}
        isSubmitting={isSubmitting}
      />

      {/* Interactive Customization Modal (Potong Daging & Racikan Bumbu) */}
      <AnimatePresence>
        {activeCustomProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sg-bento-card p-5 max-w-sm w-full space-y-4 rounded-t-3xl sm:rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeCustomProduct.image}</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      Kustomisasi Pedagang
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {activeCustomProduct.name} ({activeCustomProduct.kiosName})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCustomProduct(null)}
                  className="sg-icon-btn h-7 w-7 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                {(CUSTOM_OPTIONS[activeCustomProduct.category] || []).map((opt) => {
                  const isSelected = customSelections[activeCustomProduct.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectCustom(activeCustomProduct.id, opt)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic QRIS Koperasi Modal */}
      {createdOrderId && (
        <DynamicQrisModal
          isOpen={isQrisModalOpen}
          onClose={() => {
            setIsQrisModalOpen(false);
            router.push(`/order/${createdOrderId}`);
          }}
          orderId={createdOrderId}
          amount={total}
          merchantName="Pasar Tradisional Surakarta"
          serviceType="pasar"
          onPaymentSuccess={() => {
            setIsQrisModalOpen(false);
            router.push(`/order/${createdOrderId}`);
          }}
        />
      )}

      {/* Disdag E-Tera Legal Metrology Certificate Modal */}
      <ETeraCertificateModal
        isOpen={isETeraModalOpen}
        onClose={() => setIsETeraModalOpen(false)}
        marketName={
          selectedMarket !== "all"
            ? (TRADITIONAL_MARKETS.find(m => m.id === selectedMarket)?.name || "Pasar Tradisional Solo")
            : "44 Pasar Tradisional Surakarta"
        }
      />
    </div>
  );
}


