"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Sparkles, 
  ArrowRight, 
  Landmark, 
  Building2, 
  Store, 
  Bike,
  X,
  Loader2,
  ChevronRight,
  ShieldCheck
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
      staggerChildren: 0.03,
      delayChildren: 0.02
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

type CategoryTab = "all" | "government" | "mobility" | "merchant" | "industry";

function MoreServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, isImpersonating } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Initialize state with URL Search Params and fallback to sessionStorage
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(() => {
    if (typeof window !== "undefined") {
      const urlTab = searchParams.get("tab") as CategoryTab;
      if (urlTab) return urlTab;
      const savedTab = sessionStorage.getItem("ridesolo_more_tab") as CategoryTab;
      if (savedTab) return savedTab;
    }
    return "all";
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlQ = searchParams.get("q");
      if (urlQ) return urlQ;
      const savedQ = sessionStorage.getItem("ridesolo_more_query");
      if (savedQ) return savedQ;
    }
    return "";
  });

  const [activeSubCategory, setActiveSubCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlSub = searchParams.get("sub");
      if (urlSub) return urlSub;
      const savedSub = sessionStorage.getItem("ridesolo_more_sub");
      if (savedSub) return savedSub;
    }
    return "all";
  });

  // Restore scroll position when returning to the catalog page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScroll = sessionStorage.getItem("ridesolo_more_scroll");
      if (savedScroll) {
        const y = parseInt(savedScroll, 10);
        if (!isNaN(y) && y > 0) {
          const timer = setTimeout(() => {
            window.scrollTo({ top: y, behavior: "instant" });
          }, 80);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  // Synchronize state when URL search params change (e.g. browser back/forward buttons)
  useEffect(() => {
    const currentTab = searchParams.get("tab") as CategoryTab;
    if (currentTab && currentTab !== activeCategory) {
      setActiveCategory(currentTab);
      sessionStorage.setItem("ridesolo_more_tab", currentTab);
    }
    const currentQ = searchParams.get("q");
    if (currentQ !== null && currentQ !== searchQuery) {
      setSearchQuery(currentQ);
      sessionStorage.setItem("ridesolo_more_query", currentQ);
    }
    const currentSub = searchParams.get("sub");
    if (currentSub !== null && currentSub !== activeSubCategory) {
      setActiveSubCategory(currentSub);
      sessionStorage.setItem("ridesolo_more_sub", currentSub);
    }
  }, [searchParams]);

  // Update URL history state and sessionStorage seamlessly
  const updateUrlAndStorage = (tab: CategoryTab, query: string, sub: string) => {
    sessionStorage.setItem("ridesolo_more_tab", tab);
    sessionStorage.setItem("ridesolo_more_query", query);
    sessionStorage.setItem("ridesolo_more_sub", sub);

    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    if (query.trim()) params.set("q", query.trim());
    if (sub !== "all") params.set("sub", sub);

    const newUrl = params.toString() ? `/services/more?${params.toString()}` : "/services/more";
    window.history.replaceState(null, "", newUrl);
  };

  const handleCategoryChange = (cat: CategoryTab) => {
    setActiveCategory(cat);
    setActiveSubCategory("all");
    updateUrlAndStorage(cat, searchQuery, "all");
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    updateUrlAndStorage(activeCategory, q, activeSubCategory);
  };

  const handleSubCategoryChange = (sub: string) => {
    setActiveSubCategory(sub);
    updateUrlAndStorage(activeCategory, searchQuery, sub);
  };

  // Generic B2B / Industry Request Modal State
  const [selectedCivicService, setSelectedCivicService] = useState<AppService | null>(null);
  const [citizenNikOrRef, setCitizenNikOrRef] = useState("");
  const [citizenPhone, setCitizenPhone] = useState(userData?.phone || "081234567891");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [citizenNotes, setCitizenNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessOrder, setRequestSuccessOrder] = useState<string | null>(null);

  // 1. Filter Non-Government Services
  const nonGovServices = useMemo(() => {
    return ALL_ECOSYSTEM_SERVICES.filter(s => s.category !== "government");
  }, []);

  // 2. Filter Government OPD Sectors (18 Gerbang Utama)
  const filteredGovSectors = useMemo(() => {
    return GOVERNMENT_SECTORS.filter((sector) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        sector.name.toLowerCase().includes(q) ||
        sector.agencyOrCompanyName.toLowerCase().includes(q) ||
        sector.tagline.toLowerCase().includes(q) ||
        sector.description.toLowerCase().includes(q) ||
        sector.services.some(s => s.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  // 3. Filter General Services (For non-government categories)
  const filteredNonGovServices = useMemo(() => {
    return nonGovServices.filter((srv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
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

  const handleCardClick = (service: AppService) => {
    sessionStorage.setItem("ridesolo_more_tab", activeCategory);
    sessionStorage.setItem("ridesolo_more_scroll", String(window.scrollY));
    sessionStorage.setItem("ridesolo_more_query", searchQuery);

    // Direct App Router Core Services
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

  const handleOpenGovPortal = (sectorId: string) => {
    sessionStorage.setItem("ridesolo_more_tab", "government");
    sessionStorage.setItem("ridesolo_more_scroll", String(window.scrollY));
    sessionStorage.setItem("ridesolo_more_query", searchQuery);
    router.push(`/services/gov/${sectorId}`);
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
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#0c1220]/80 border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Katalog Layanan Solo
                </h1>
                <Badge variant="blue" size="sm" className="hidden sm:inline-flex text-[10px] font-bold">
                  5 Pilar Terintegrasi
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Layanan Transportasi, UMKM Pasar, Gerbang 18 Dinas Pemkot, dan Industri B2B
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Section (Sticky Blur) */}
        <div className="space-y-3 sticky top-16 sm:top-18 z-30 pt-1 pb-2 backdrop-blur-md bg-slate-50/80 dark:bg-[#070b14]/80">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari dinas, layanan KTP, bansos, resep obat, pasar, ojek..."
              className="w-full pl-11 pr-11 py-3 bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Main Category Tabs with Smooth Slider */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-2xl rounded-2xl overflow-x-auto scrollbar-hide no-scrollbar touch-pan-x shadow-xs border border-slate-200/60 dark:border-white/[0.06]">
            {[
              { id: "all", label: "Semua", icon: Sparkles, color: "text-blue-500" },
              { id: "government", label: "Layanan Publik (18 Dinas)", icon: Landmark, color: "text-blue-500" },
              { id: "mobility", label: "Transportasi", icon: Bike, color: "text-emerald-500" },
              { id: "merchant", label: "UMKM & Pasar", icon: Store, color: "text-amber-500" },
              { id: "industry", label: "Industri B2B", icon: Building2, color: "text-purple-500" },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleCategoryChange(tab.id as CategoryTab)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 z-10 ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-white dark:bg-[#151e33] rounded-xl shadow-md border border-slate-200/80 dark:border-white/10 -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-3.5 w-3.5 ${isActive ? tab.color : "opacity-70"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Category Pill Filters (Only for Non-Gov with subcategories) */}
          {availableSubCategories.length > 0 && activeCategory !== "government" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide no-scrollbar touch-pan-x animate-in fade-in">
              <button
                onClick={() => handleSubCategoryChange("all")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  activeSubCategory === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white/80 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-zinc-300 hover:bg-white"
                }`}
              >
                Semua Sub-Kategori
              </button>
              {availableSubCategories.map((sub) => {
                const isActive = activeSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubCategoryChange(sub.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white/80 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-zinc-300 hover:bg-white"
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className="text-[9px] opacity-80 px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                      {sub.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BANNER: POJOK REMBUG & PANTAUAN JALAN LIVE                                */}
        {/* ========================================================================= */}
        <Link
          href="/community"
          className="p-4 rounded-[1.75rem] bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent border border-orange-500/25 shadow-xs flex items-center justify-between gap-3 group hover:border-orange-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              📢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Pojok Rembug & Pantauan Jalan Live
                </h3>
                <Badge variant="orange" size="sm" className="font-bold text-[9px]">REALTIME</Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Pantau penutupan jalan hajatan warga, genangan banjir & rute CFD Slamet Riyadi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform shrink-0">
            <span className="hidden sm:inline">Buka Pantauan</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* ========================================================================= */}
        {/* VIEW 1: GOVERNMENT TAB (18 GERBANG UTAMA DINAS PEMKOT)                    */}
        {/* ========================================================================= */}
        {activeCategory === "government" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  18 Gerbang Pelayanan Publik Pemkot Surakarta
                </h2>
                <Badge variant="blue" size="sm" className="font-bold">{filteredGovSectors.length} Dinas</Badge>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Pilih dinas untuk melihat seluruh layanannya</span>
            </div>

            {filteredGovSectors.length === 0 ? (
              <div className="p-12 text-center bg-white/90 dark:bg-[#0c1220]/90 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                <Search className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-sm font-bold">Dinas tidak ditemukan</h3>
                <Button size="sm" onClick={() => handleSearchChange("")} className="text-xs rounded-xl">
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
                    onClick={() => handleOpenGovPortal(sector.id)}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -3 }}
                    className="p-4 sm:p-5 rounded-[1.75rem] bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-3 transition-all hover:border-blue-500/40 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-2xl flex items-center justify-center shrink-0 group-hover:scale-108 group-hover:shadow-lg group-hover:shadow-blue-500/25 group-hover:bg-blue-500/25 transition-all">
                            {sector.avatar}
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {sector.name}
                            </h3>
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
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Layanan Warga & Mobilitas Harian
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">Ekosistem Koperasi Ride-Solo</span>
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
                      className="p-4 sm:p-5 rounded-[1.75rem] bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-3 transition-all hover:border-emerald-500/40 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-108 group-hover:shadow-lg shadow-sm ${service.bgColor} ${service.borderColor} ${service.id === "ride" ? "group-hover:shadow-emerald-500/30 group-hover:bg-emerald-500/30" : service.id === "car" ? "group-hover:shadow-teal-500/30 group-hover:bg-teal-500/30" : service.id === "send" ? "group-hover:shadow-blue-500/30 group-hover:bg-blue-500/30" : "group-hover:shadow-slate-500/30 group-hover:bg-slate-500/30"}`}>
                              <Icon size={24} variant="duotone" className={`h-6 w-6 ${service.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
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
                    onClick={() => handleOpenGovPortal(sector.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="p-4 min-h-[115px] rounded-[1.6rem] bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col items-center justify-center text-center gap-2 cursor-pointer group hover:border-blue-500/40 transition-all"
                  >
                    <div className="w-12 h-12 rounded-[1.2rem] bg-blue-500/10 text-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                      {sector.avatar}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[100px] mx-auto">
                        {sector.name}
                      </h4>
                      <span className="text-[9px] text-slate-500 dark:text-zinc-400 block mt-0.5 font-semibold">
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
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Daftar Layanan {activeCategory === "mobility" ? "Transportasi" : activeCategory === "merchant" ? "UMKM & Pasar" : "Industri B2B"}
              </h2>
              <Badge variant="outline" size="sm" className="font-bold">{filteredNonGovServices.length} Layanan</Badge>
            </div>

            {filteredNonGovServices.length === 0 ? (
              <div className="p-12 text-center bg-white/90 dark:bg-[#0c1220]/90 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                <Search className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-sm font-bold">Layanan tidak ditemukan</h3>
                <Button size="sm" onClick={() => { handleSearchChange(""); handleSubCategoryChange("all"); }} className="text-xs rounded-xl">
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
                      className="p-4 sm:p-5 rounded-[1.75rem] bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-3 transition-all hover:border-emerald-500/40 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-108 group-hover:shadow-lg shadow-sm ${service.bgColor} ${service.borderColor} group-hover:shadow-emerald-500/25`}>
                              <Icon size={24} variant="duotone" className={`h-6 w-6 ${service.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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

      {/* Generic Civic / B2B Modal */}
      <AnimatePresence>
        {selectedCivicService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0c1220] rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 max-h-[90vh] overflow-y-auto sg-custom-scrollbar"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedCivicService.bgColor} ${selectedCivicService.borderColor}`}>
                    {selectedCivicService.icon && (
                      <selectedCivicService.icon size={20} variant="duotone" className={selectedCivicService.color} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedCivicService.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                      {selectedCivicService.agencyName || "Mitra Industri Surakarta"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCivicService(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {requestSuccessOrder ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Permohonan Berhasil Dikirim!
                  </h4>
                  <p className="text-xs text-slate-500">
                    ID Pesanan: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{requestSuccessOrder}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Petugas / Mitra Industri akan segera memverifikasi dan menghubungkan ke mitra driver.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedCivicService(null);
                      router.push(`/order/${requestSuccessOrder}`);
                    }}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Pantau Status Pesanan
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitCivicRequest} className="space-y-3.5">
                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.04] text-xs text-slate-600 dark:text-zinc-300">
                    {selectedCivicService.description}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      NIK / Nomor Dokumen Referensi
                    </label>
                    <input
                      type="text"
                      required
                      value={citizenNikOrRef}
                      onChange={(e) => setCitizenNikOrRef(e.target.value)}
                      placeholder="Contoh: 3372012345670001"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Alamat Pengiriman / Penjemputan
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={citizenNotes}
                      onChange={(e) => setCitizenNotes(e.target.value)}
                      placeholder="Contoh: Titipkan di satpam jika tidak ada orang"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedCivicService(null)}
                      className="w-1/3 h-10 rounded-xl text-xs"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="w-2/3 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                    >
                      {isSubmittingRequest ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        "Kirim Permohonan"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AllEcosystemServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <MoreServicesContent />
    </Suspense>
  );
}
