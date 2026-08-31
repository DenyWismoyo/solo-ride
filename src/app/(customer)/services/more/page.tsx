"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { ALL_ECOSYSTEM_SERVICES, AppService } from "@/constants/services";
import { GOVERNMENT_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Landmark, 
  Building2, 
  Store, 
  Bike,
  X,
  Loader2,
  FileCheck2,
  Phone,
  MapPin,
  HelpCircle,
  Layers,
  ChevronRight
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

import { cn } from "@/lib/utils";

const cardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 24
    }
  }
};

export default function AllEcosystemServicesPage() {
  const router = useRouter();
  const { user, userData, isImpersonating } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search, Category, and Sub-Category Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "mobility" | "merchant" | "government" | "industry">("all");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");

  // Generic B2B / Industry Request Modal State
  const [selectedCivicService, setSelectedCivicService] = useState<AppService | null>(null);
  const [citizenNikOrRef, setCitizenNikOrRef] = useState("");
  const [citizenPhone, setCitizenPhone] = useState(userData?.phone || "081234567891");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [citizenNotes, setCitizenNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessOrder, setRequestSuccessOrder] = useState<string | null>(null);

  // 1. Filter Non-Government Services (Mobility, Merchant, Industry)
  const nonGovServices = useMemo(() => {
    return ALL_ECOSYSTEM_SERVICES.filter(s => s.category !== "government");
  }, []);

  // 2. Filter Government OPD Sectors (18 Gerbang Utama)
  const filteredGovSectors = useMemo(() => {
    return GOVERNMENT_SECTORS.filter((sector) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        sector.name.toLowerCase().includes(q) ||
        sector.agencyOrCompanyName.toLowerCase().includes(q) ||
        sector.tagline.toLowerCase().includes(q) ||
        sector.description.toLowerCase().includes(q) ||
        sector.services.some(s => s.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [searchQuery]);

  // 3. Filter General Services (For non-government categories)
  const filteredNonGovServices = useMemo(() => {
    return nonGovServices.filter((srv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        srv.name.toLowerCase().includes(q) ||
        srv.description.toLowerCase().includes(q) ||
        srv.agencyName?.toLowerCase().includes(q) ||
        srv.shortName.toLowerCase().includes(q) ||
        srv.subCategoryLabel?.toLowerCase().includes(q);

      const matchesCat = activeCategory === "all" || srv.category === activeCategory;
      const matchesSubCat = activeSubCategory === "all" || srv.subCategory === activeSubCategory;

      return matchesSearch && matchesCat && matchesSubCat;
    });
  }, [nonGovServices, searchQuery, activeCategory, activeSubCategory]);

  // Derive Sub-Categories within the active main category (for non-gov)
  const availableSubCategories = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "government") return [];
    
    const subsMap = new Map<string, { label: string; count: number }>();
    nonGovServices
      .filter((s) => s.category === activeCategory)
      .forEach((s) => {
        if (s.subCategory && s.subCategoryLabel) {
          const current = subsMap.get(s.subCategory) || { label: s.subCategoryLabel, count: 0 };
          current.count += 1;
          subsMap.set(s.subCategory, current);
        }
      });

    return Array.from(subsMap.entries()).map(([key, val]) => ({
      id: key,
      label: val.label,
      count: val.count
    }));
  }, [nonGovServices, activeCategory]);

  // Reset activeSubCategory when activeCategory changes
  const handleCategoryChange = (cat: "all" | "mobility" | "merchant" | "government" | "industry") => {
    setActiveCategory(cat);
    setActiveSubCategory("all");
  };

  const handleCardClick = (service: AppService) => {
    // Direct App Router Routes
    if (["ride", "car", "send", "food", "pasar", "mart", "titip"].includes(service.id)) {
      router.push(`/services/${service.id}`);
      return;
    }

    // Direct Government Sub-Service Dedicated Pages
    if (service.category === "government" || (service.additionalRole && service.additionalRole.startsWith("gov_"))) {
      const agencyId = service.additionalRole || "gov_solo";
      router.push(`/services/gov/${agencyId}/${service.id}`);
      return;
    }

    // Generic B2B / Industry Request Modal
    setSelectedCivicService(service);
    setCitizenNikOrRef("");
    setCitizenNotes("");
    setRequestSuccessOrder(null);
  };

  const handleSubmitCivicRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk mengajukan permohonan.");
      router.push("/login");
      return;
    }

    if (!selectedCivicService) return;

    setIsSubmittingRequest(true);
    try {
      const isSubsidized = selectedCivicService.feeLabel?.toLowerCase().includes("gratis") || 
                           selectedCivicService.feeLabel?.toLowerCase().includes("subsidi");
      const orderPrice = isSubsidized ? 0 : 15000;

      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: userData?.displayName || "Warga Surakarta",
        customerPhone: citizenPhone,
        serviceType: selectedCivicService.id,
        serviceTitle: selectedCivicService.name,
        targetRole: selectedCivicService.category === "government" ? "government" : "industry",
        additionalRole: selectedCivicService.additionalRole || null,
        agencyName: selectedCivicService.agencyName || "Pemkot Surakarta / Mitra Industri",
        price: orderPrice,
        status: "pending_verification",
        pickupLocation: {
          address: selectedCivicService.agencyName || "Kantor Balai Kota Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: deliveryAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          nikOrRef: citizenNikOrRef,
          deliveryAddress,
          notes: citizenNotes,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setRequestSuccessOrder(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim permohonan:", err);
      alert(`Gagal mengirim permohonan: ${err.message || err}`);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white pb-24">
      {/* Impersonation bar */}
      <AdminImpersonationBar />

      {/* Header */}
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <main className={cn(
        "max-w-4xl mx-auto px-4 space-y-5 transition-all duration-200",
        isImpersonating ? "pt-28 sm:pt-28" : "pt-20 sm:pt-20"
      )}>
        {/* Top Title & Back Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Katalog Layanan Solo
                </h1>
                <Badge variant="blue" size="sm" className="hidden sm:inline-flex text-[10px]">
                  5 Pilar Terintegrasi
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Layanan Transportasi, UMKM Pasar, Gerbang 18 Dinas Pemkot, dan Industri B2B
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dinas, layanan KTP, bansos, resep obat, pasar, ojek..."
              className="w-full pl-11 pr-11 py-3.5 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500/80 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Main Category Tabs */}
          <div className="flex items-center gap-2 p-2 bg-white/40 dark:bg-[#0c1220]/40 backdrop-blur-2xl rounded-full overflow-x-auto no-scrollbar shadow-inner border border-white/50 dark:border-white/10">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-white dark:bg-[#0c1220] text-blue-600 dark:text-blue-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Sparkles className={`h-4 w-4 ${activeCategory === "all" ? "text-blue-500" : ""}`} />
              <span>Semua</span>
            </button>
            <button
              onClick={() => handleCategoryChange("government")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "government"
                  ? "bg-white dark:bg-[#0c1220] text-blue-600 dark:text-blue-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Landmark className={`h-4 w-4 ${activeCategory === "government" ? "text-blue-500" : ""}`} />
              <span>Layanan Publik (18 Dinas)</span>
            </button>
            <button
              onClick={() => handleCategoryChange("mobility")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "mobility"
                  ? "bg-white dark:bg-[#0c1220] text-emerald-600 dark:text-emerald-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Bike className={`h-4 w-4 ${activeCategory === "mobility" ? "text-emerald-500" : ""}`} />
              <span>Transportasi</span>
            </button>
            <button
              onClick={() => handleCategoryChange("merchant")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "merchant"
                  ? "bg-white dark:bg-[#0c1220] text-amber-600 dark:text-amber-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Store className={`h-4 w-4 ${activeCategory === "merchant" ? "text-amber-500" : ""}`} />
              <span>UMKM & Pasar</span>
            </button>
            <button
              onClick={() => handleCategoryChange("industry")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "industry"
                  ? "bg-white dark:bg-[#0c1220] text-purple-600 dark:text-purple-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/10"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Building2 className={`h-4 w-4 ${activeCategory === "industry" ? "text-purple-500" : ""}`} />
              <span>Industri B2B</span>
            </button>
          </div>

          {/* Sub-Category Pill Filters (Only for Non-Gov with subcategories) */}
          {availableSubCategories.length > 0 && activeCategory !== "government" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar animate-in fade-in">
              <button
                onClick={() => setActiveSubCategory("all")}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  activeSubCategory === "all"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white/60 dark:bg-zinc-800/60 border border-white/40 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                }`}
              >
                Semua Sub-Kategori
              </button>
              {availableSubCategories.map((sub) => {
                const isActive = activeSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubCategory(sub.id)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-white/60 dark:bg-zinc-800/60 border border-white/40 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className="text-[9px] opacity-80 px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
                      {sub.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: GOVERNMENT TAB (18 GERBANG UTAMA DINAS PEMKOT)                    */}
        {/* ========================================================================= */}
        {activeCategory === "government" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  18 Gerbang Pelayanan Publik Pemkot Surakarta
                </h2>
                <Badge variant="blue" size="sm">{filteredGovSectors.length} Dinas</Badge>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Pilih dinas untuk melihat seluruh layanannya</span>
            </div>

            {filteredGovSectors.length === 0 ? (
              <div className="p-12 text-center bg-white/90 dark:bg-[#0c1220]/90 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                <Search className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-sm font-bold">Dinas tidak ditemukan</h3>
                <Button size="sm" onClick={() => setSearchQuery("")} className="text-xs rounded-xl">
                  Reset Pencarian
                </Button>
              </div>
            ) : (
              <motion.div 
                variants={cardContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
              >
                {filteredGovSectors.map((sector) => (
                  <motion.div
                    key={sector.id}
                    variants={cardItemVariants}
                    onClick={() => router.push(`/services/gov/${sector.id}`)}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -3 }}
                    className="p-4 rounded-[1.75rem] bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] space-y-3 transition-all hover:bg-white/90 dark:hover:bg-[#11192e]/90 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:bg-blue-500/30 transition-all">
                            {sector.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {sector.name}
                              </h3>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[200px]">
                              {sector.agencyOrCompanyName}
                            </p>
                          </div>
                        </div>

                        <Badge variant="blue" size="sm" className="text-[9px] shrink-0 font-bold">
                          {sector.services.length} Layanan
                        </Badge>
                      </div>

                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold line-clamp-1">
                        {sector.tagline}
                      </p>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                        {sector.description}
                      </p>

                      {/* Services Preview Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {sector.services.slice(0, 3).map((srv, idx) => (
                          <span 
                            key={idx}
                            className="text-[9px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-300 border border-slate-200/50 dark:border-white/[0.05]"
                          >
                            {srv.split(" (")[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                        Resmi Pemkot Surakarta
                      </span>

                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Masuk Portal Dinas</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: "ALL" TAB (CORE ECOSYSTEM + 18 GERBANG DINAS HIGHLIGHT)           */}
        {/* ========================================================================= */}
        {activeCategory === "all" && (
          <div className="space-y-6">
            {/* Core Mobility & Marketplace */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Layanan Warga & Mobilitas Harian
                </h2>
                <span className="text-[11px] text-slate-500">Ekosistem Koperasi Ride-Solo</span>
              </div>

              <motion.div 
                variants={cardContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
              >
                {filteredNonGovServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={service.id}
                      variants={cardItemVariants}
                      onClick={() => handleCardClick(service)}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -3 }}
                      className="p-4 rounded-[1.6rem] bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] space-y-3 transition-all hover:bg-white/90 dark:hover:bg-[#11192e]/90 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-sm ${service.bgColor} ${service.borderColor} ${service.id === "ride" ? "group-hover:shadow-emerald-500/30 group-hover:bg-emerald-500/30" : service.id === "car" ? "group-hover:shadow-teal-500/30 group-hover:bg-teal-500/30" : service.id === "send" ? "group-hover:shadow-blue-500/30 group-hover:bg-blue-500/30" : "group-hover:shadow-slate-500/30 group-hover:bg-slate-500/30"}`}>
                              <Icon size={24} variant="duotone" className={`h-6 w-6 ${service.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {service.agencyName && (
                                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate max-w-[180px]">
                                    {service.agencyName}
                                  </p>
                                )}
                                {service.subCategoryLabel && (
                                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium before:content-['•'] before:mr-1">
                                    {service.subCategoryLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {service.tag && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              {service.tag}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                          {service.feeLabel || "Bebas Komisi"}
                        </span>

                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Buka Layanan</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Government Gateways Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Gerbang 18 Dinas Pemkot Surakarta
                  </h2>
                </div>
                <button
                  onClick={() => handleCategoryChange("government")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Lihat Semua Dinas</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {GOVERNMENT_SECTORS.map((sector) => (
                  <motion.div
                    key={sector.id}
                    onClick={() => router.push(`/services/gov/${sector.id}`)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="p-4 min-h-[110px] rounded-[1.6rem] bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer group hover:bg-white/90 dark:hover:bg-[#11192e]/90 transition-all"
                  >
                    <div className="w-12 h-12 rounded-[1.2rem] bg-blue-500/10 text-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:bg-blue-500/30">
                      {sector.avatar}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[100px] mx-auto">
                        {sector.name}
                      </h4>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {sector.services.length} Layanan
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: OTHER CATEGORIES (MOBILITY / MERCHANT / INDUSTRY)                 */}
        {/* ========================================================================= */}
        {activeCategory !== "all" && activeCategory !== "government" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Layanan {activeCategory === "mobility" ? "Transportasi" : activeCategory === "merchant" ? "UMKM & Pasar" : "Industri B2B"}
              </h2>
              <Badge variant="outline" size="sm">{filteredNonGovServices.length} Layanan</Badge>
            </div>

            {filteredNonGovServices.length === 0 ? (
              <div className="p-12 text-center bg-white/90 dark:bg-[#0c1220]/90 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                <Search className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-sm font-bold">Layanan tidak ditemukan</h3>
                <Button size="sm" onClick={() => { setSearchQuery(""); setActiveSubCategory("all"); }} className="text-xs rounded-xl">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <motion.div 
                variants={cardContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
              >
                {filteredNonGovServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={service.id}
                      variants={cardItemVariants}
                      onClick={() => handleCardClick(service)}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -3 }}
                      className="p-4 rounded-[1.6rem] bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] space-y-3 transition-all hover:bg-white/90 dark:hover:bg-[#11192e]/90 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-sm ${service.bgColor} ${service.borderColor} ${service.id === "ride" ? "group-hover:shadow-emerald-500/30 group-hover:bg-emerald-500/30" : service.id === "car" ? "group-hover:shadow-teal-500/30 group-hover:bg-teal-500/30" : service.id === "send" ? "group-hover:shadow-blue-500/30 group-hover:bg-blue-500/30" : "group-hover:shadow-slate-500/30 group-hover:bg-slate-500/30"}`}>
                              <Icon size={24} variant="duotone" className={`h-6 w-6 ${service.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {service.agencyName && (
                                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate max-w-[180px]">
                                    {service.agencyName}
                                  </p>
                                )}
                                {service.subCategoryLabel && (
                                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium before:content-['•'] before:mr-1">
                                    {service.subCategoryLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {service.tag && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              {service.tag}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                          {service.feeLabel || "Bebas Komisi"}
                        </span>

                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Buka Layanan</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* Generic B2B / Industry Request Modal */}
      {selectedCivicService && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-[2rem] shadow-2xl overflow-hidden my-6 text-slate-900 dark:text-white"
            >
              <div className="relative p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-100" />
                  </div>
                  <div>
                    <Badge className="bg-blue-400/20 text-blue-100 border border-blue-300/30 text-[10px] uppercase tracking-wider mb-0.5">
                      Layanan Industri & Faskes
                    </Badge>
                    <h2 className="text-base font-black tracking-tight">{selectedCivicService.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCivicService(null)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {requestSuccessOrder ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Permohonan Berhasil Dikirim!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      ID Pesanan: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{requestSuccessOrder}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    Pihak mitra penyedia layanan ({selectedCivicService.agencyName}) akan memverifikasi permohonan Anda dan driver kurir mitra segera meluncur.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedCivicService(null);
                      setRequestSuccessOrder(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-xs font-bold"
                  >
                    Selesai
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitCivicRequest} className="p-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Nomor Identitas / NIK / ID Pelanggan
                    </label>
                    <input
                      type="text"
                      value={citizenNikOrRef}
                      onChange={(e) => setCitizenNikOrRef(e.target.value)}
                      placeholder="Masukkan NIK atau nomor referensi..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-blue-500" />
                      <span>Nomor WhatsApp Aktif</span>
                    </label>
                    <input
                      type="tel"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      <span>Alamat Lokasi / Titik Penjemputan</span>
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Catatan Tambahan untuk Petugas
                    </label>
                    <textarea
                      rows={2}
                      value={citizenNotes}
                      onChange={(e) => setCitizenNotes(e.target.value)}
                      placeholder="Informasi spesifik mengenai permohonan..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">Tarif Layanan:</span>
                    <span className="font-black text-sm text-blue-600 dark:text-blue-400">
                      {selectedCivicService.feeLabel || "Sesuai Standar Layanan"}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedCivicService(null)}
                      className="w-1/3 py-2.5 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="w-2/3 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {isSubmittingRequest ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Permohonan</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
