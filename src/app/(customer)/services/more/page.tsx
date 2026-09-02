"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import { ALL_ECOSYSTEM_SERVICES, AppService } from "@/constants/services";
import { GOVERNMENT_SECTORS } from "@/constants/ecosystemSectors";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { MoreCategoryTabs, CategoryTab } from "@/components/services/more/MoreCategoryTabs";
import { MoreGovSectorsGrid } from "@/components/services/more/MoreGovSectorsGrid";
import { MoreGeneralServicesGrid } from "@/components/services/more/MoreGeneralServicesGrid";
import { CivicServiceRequestModal } from "@/components/services/more/CivicServiceRequestModal";
import { ArrowLeft, Search, X, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { cn } from "@/lib/utils";

function MoreServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, isImpersonating } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Initialize state with URL Search Params
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

  // Synchronize state when URL search params change
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

  // Modal State for generic request
  const [selectedCivicService, setSelectedCivicService] = useState<AppService | null>(null);
  const [citizenNikOrRef, setCitizenNikOrRef] = useState("");
  const [citizenPhone, setCitizenPhone] = useState(userData?.phone || "081234567891");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [citizenNotes, setCitizenNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessOrder, setRequestSuccessOrder] = useState<string | null>(null);

  // Filter Non-Government Services
  const nonGovServices = useMemo(() => {
    return ALL_ECOSYSTEM_SERVICES.filter(s => s.category !== "government");
  }, []);

  // Filter Government OPD Sectors
  const filteredGovSectors = useMemo(() => {
    return GOVERNMENT_SECTORS.filter((sector) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        sector.name.toLowerCase().includes(q) ||
        sector.agencyOrCompanyName.toLowerCase().includes(q) ||
        sector.tagline?.toLowerCase().includes(q) ||
        sector.description.toLowerCase().includes(q) ||
        sector.services.some(s => s.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  // Filter General Services
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

    // Generic Request Modal
    setSelectedCivicService(service);
    setCitizenNikOrRef("");
    setCitizenNotes("");
    setRequestSuccessOrder(null);
  };

  const handleOpenGovPortal = (sectorId: string) => {
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
      alert(`Gagal mengirim permohonan: ${err.message || err}`);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white pb-24">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />
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
              className="sg-icon-btn h-9.5 w-9.5 cursor-pointer"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Katalog Layanan Solo
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pusat integrasi mobilitas, pasar, industri, dan dinas Pemkot
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari layanan dinas, kuliner, pasar, kargo..."
            className="w-full pl-10 pr-9 py-3 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <MoreCategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          activeSubCategory={activeSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          availableSubCategories={availableSubCategories}
          totalGovCount={GOVERNMENT_SECTORS.length}
          totalNonGovCount={nonGovServices.length}
        />

        {/* 1. Government OPD Grid */}
        {(activeCategory === "all" || activeCategory === "government") && (
          <MoreGovSectorsGrid
            sectors={filteredGovSectors}
            onOpenSector={handleOpenGovPortal}
          />
        )}

        {/* 2. Non-Government Services Grid */}
        {activeCategory !== "government" && (
          <MoreGeneralServicesGrid
            services={filteredNonGovServices}
            onSelectService={handleCardClick}
          />
        )}
      </main>

      {/* Civic / Industry Request Modal */}
      <CivicServiceRequestModal
        isOpen={Boolean(selectedCivicService)}
        onClose={() => setSelectedCivicService(null)}
        service={selectedCivicService}
        citizenNikOrRef={citizenNikOrRef}
        setCitizenNikOrRef={setCitizenNikOrRef}
        citizenPhone={citizenPhone}
        setCitizenPhone={setCitizenPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        citizenNotes={citizenNotes}
        setCitizenNotes={setCitizenNotes}
        onSubmit={handleSubmitCivicRequest}
        isSubmitting={isSubmittingRequest}
        successOrderId={requestSuccessOrder}
      />
    </div>
  );
}

export default function MoreServicesPage() {
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
