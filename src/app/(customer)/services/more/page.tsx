"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { ALL_ECOSYSTEM_SERVICES, AppService } from "@/constants/services";
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
  HelpCircle
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

// Dedicated Civic Modals
import { DukcapilCivicModal } from "@/components/civic/DukcapilCivicModal";
import { DinsosCivicModal } from "@/components/civic/DinsosCivicModal";
import { DinkesCivicModal } from "@/components/civic/DinkesCivicModal";
import { DisparCivicModal } from "@/components/civic/DisparCivicModal";
import { DiskopCivicModal } from "@/components/civic/DiskopCivicModal";
import { DishubCivicModal } from "@/components/civic/DishubCivicModal";
import { BapendaCivicModal } from "@/components/civic/BapendaCivicModal";
import { DamkarCivicModal } from "@/components/civic/DamkarCivicModal";
import { BpbdCivicModal } from "@/components/civic/BpbdCivicModal";
import { Dp3aCivicModal } from "@/components/civic/Dp3aCivicModal";
import { DynamicGovCivicModal } from "@/components/civic/DynamicGovCivicModal";

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
  const { user, userData } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "mobility" | "merchant" | "government" | "industry">("all");

  // Dedicated Dinas Modals States
  const [isDukcapilOpen, setIsDukcapilOpen] = useState(false);
  const [isDinsosOpen, setIsDinsosOpen] = useState(false);
  const [isDinkesOpen, setIsDinkesOpen] = useState(false);
  const [isDisparOpen, setIsDisparOpen] = useState(false);
  const [isDiskopOpen, setIsDiskopOpen] = useState(false);
  const [isDishubOpen, setIsDishubOpen] = useState(false);
  const [isBapendaOpen, setIsBapendaOpen] = useState(false);

  // High Priority Emergency & Protection Modals States
  const [isDamkarOpen, setIsDamkarOpen] = useState(false);
  const [damkarServiceId, setDamkarServiceId] = useState<string>("damkar_panic_button");
  const [isBpbdOpen, setIsBpbdOpen] = useState(false);
  const [bpbdServiceId, setBpbdServiceId] = useState<string>("bpbd_peringatan_dini_banjir");
  const [isDp3aOpen, setIsDp3aOpen] = useState(false);
  const [dp3aServiceId, setDp3aServiceId] = useState<string>("dp3a_hotline_sahabat_perempuan");

  const [selectedGovService, setSelectedGovService] = useState<AppService | null>(null);

  // Generic B2B / Industry Request Modal State
  const [selectedCivicService, setSelectedCivicService] = useState<AppService | null>(null);
  const [citizenNikOrRef, setCitizenNikOrRef] = useState("");
  const [citizenPhone, setCitizenPhone] = useState(userData?.phone || "081234567891");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [citizenNotes, setCitizenNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessOrder, setRequestSuccessOrder] = useState<string | null>(null);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return ALL_ECOSYSTEM_SERVICES.filter((srv) => {
      const matchesSearch = 
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.agencyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.shortName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = activeCategory === "all" || srv.category === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const handleCardClick = (service: AppService) => {
    // 1. Direct App Router Routes
    if (["ride", "car", "send", "food", "pasar", "mart", "titip"].includes(service.id)) {
      router.push(`/services/${service.id}`);
      return;
    }

    // 2. High Priority Specialized Modals (Emergency & Protection)
    if (service.additionalRole === "gov_damkar" || service.id.startsWith("damkar_")) {
      setDamkarServiceId(service.id);
      setIsDamkarOpen(true);
      return;
    }
    if (service.additionalRole === "gov_bpbd" || service.id.startsWith("bpbd_")) {
      setBpbdServiceId(service.id);
      setIsBpbdOpen(true);
      return;
    }
    if (service.additionalRole === "gov_dp3a" || service.id.startsWith("dp3a_")) {
      setDp3aServiceId(service.id);
      setIsDp3aOpen(true);
      return;
    }

    // 3. Standard Specialized Dinas Modals by ID prefix or additionalRole
    if (service.additionalRole === "gov_dukcapil" || service.id.startsWith("dukcapil_")) {
      setIsDukcapilOpen(true);
      return;
    }
    if (service.additionalRole === "gov_dinsos" || service.id.startsWith("dinsos_")) {
      setIsDinsosOpen(true);
      return;
    }
    if (service.additionalRole === "gov_dinkes" || service.id.startsWith("dinkes_")) {
      setIsDinkesOpen(true);
      return;
    }
    if (service.additionalRole === "gov_dispar" || service.id.startsWith("dispar_")) {
      setIsDisparOpen(true);
      return;
    }
    if (service.additionalRole === "gov_diskop" || service.id.startsWith("diskop_")) {
      setIsDiskopOpen(true);
      return;
    }
    if (service.additionalRole === "gov_dishub" || service.id.startsWith("dishub_")) {
      setIsDishubOpen(true);
      return;
    }
    if (service.additionalRole === "gov_bapenda" || service.id.startsWith("bapenda_")) {
      setIsBapendaOpen(true);
      return;
    }

    // 4. Government category services for remaining agencies
    if (service.category === "government" || (service.additionalRole && service.additionalRole.startsWith("gov_"))) {
      setSelectedGovService(service);
      return;
    }

    // 5. Fallback to Generic B2B / Industry Request Modal
    setSelectedCivicService(service);
    setRequestSuccessOrder(null);
  };

  const handleSendCivicRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCivicService) {
      alert("Silakan login terlebih dahulu untuk mengajukan layanan ini.");
      router.push("/login");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const orderRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: userData?.displayName || "Warga Surakarta",
        customerPhone: citizenPhone,
        serviceType: selectedCivicService.id,
        serviceTitle: selectedCivicService.name,
        targetRole: selectedCivicService.targetRole || "industry",
        additionalRole: selectedCivicService.additionalRole || "ind_klinik",
        agencyName: selectedCivicService.agencyName || "Mitra Industri Surakarta",
        price: selectedCivicService.estimatedFee || 15000,
        status: "pending_verification",
        pickupLocation: {
          address: selectedCivicService.agencyName || "Kantor Mitra Solo",
          lat: -7.5755,
          lng: 110.8243
        },
        dropoffLocation: {
          address: deliveryAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          nikOrRef: citizenNikOrRef,
          notes: citizenNotes,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setRequestSuccessOrder(orderRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim permohonan layanan:", err);
      alert(`Gagal mengirim permohonan: ${err.message || err}`);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 transition-colors duration-200">

      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="pt-20 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6 flex-1 relative z-10">
        {/* Navigation Breadcrumb & Hero */}
        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </motion.button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Katalog Layanan Ekosistem Warga
                <Badge variant="emerald" size="sm">SMART CIVIC HUB</Badge>
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Direktori terpadu Mobilitas, Pasar UMKM, Pelayanan Publik Pemkot Surakarta, dan Industri B2B.
              </p>
            </div>

            <Badge variant="teal" size="sm" className="px-3 py-1">
              Surakarta Hyperlocal
            </Badge>
          </div>
        </div>

        {/* Search & Category Filter Chips */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan (contoh: KTP, Ojek, Kuliner, Bansos, Puskesmas, Lab, Shuttle)..."
              className="w-full pl-11 pr-4 py-3 bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] rounded-[1.4rem] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* Category Tabs with Animated Spring Pill */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { id: "all", label: "🌟 Semua Layanan", count: ALL_ECOSYSTEM_SERVICES.length },
                { id: "government", label: "🏛️ Pemkot Surakarta", count: ALL_ECOSYSTEM_SERVICES.filter(s => s.category === "government").length },
                { id: "industry", label: "🏢 Industri & Kesehatan", count: ALL_ECOSYSTEM_SERVICES.filter(s => s.category === "industry").length },
                { id: "merchant", label: "🍲 Pasar & UMKM", count: ALL_ECOSYSTEM_SERVICES.filter(s => s.category === "merchant").length },
                { id: "mobility", label: "🛵 Mobilitas Warga", count: ALL_ECOSYSTEM_SERVICES.filter(s => s.category === "mobility").length },
              ] as const
            ).map((cat) => {
              const isSelected = activeCategory === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 select-none ${
                    isSelected
                      ? "text-slate-900 dark:text-white font-black"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-[#0c1220]/70 border border-slate-200/80 dark:border-white/[0.06]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      className="absolute inset-0 bg-slate-200/90 dark:bg-white/[0.12] border border-slate-300 dark:border-white/20 rounded-2xl -z-10 shadow-sm"
                    />
                  )}
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-70 px-1 py-0.2 rounded bg-black/10 dark:bg-white/20">
                    {cat.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Services Grid with Staggered Motion */}
        <motion.div 
          variants={cardContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
        >
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                variants={cardItemVariants}
                onClick={() => handleCardClick(service)}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -3 }}
                className="p-4 rounded-[1.6rem] bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] space-y-3 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 shadow-sm ${service.bgColor} ${service.borderColor}`}>
                        <Icon size={24} variant="duotone" className={`h-6 w-6 ${service.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {service.name}
                          </h3>
                        </div>
                        {service.agencyName && (
                          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                            {service.agencyName}
                          </p>
                        )}
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
      </main>

      {/* ========================================================================= */}
      {/* DEDICATED CIVIC MODALS */}
      {/* ========================================================================= */}
      <DamkarCivicModal 
        isOpen={isDamkarOpen} 
        onClose={() => setIsDamkarOpen(false)} 
        serviceId={damkarServiceId}
      />
      <BpbdCivicModal 
        isOpen={isBpbdOpen} 
        onClose={() => setIsBpbdOpen(false)} 
        serviceId={bpbdServiceId}
      />
      <Dp3aCivicModal 
        isOpen={isDp3aOpen} 
        onClose={() => setIsDp3aOpen(false)} 
        serviceId={dp3aServiceId}
      />

      <DukcapilCivicModal isOpen={isDukcapilOpen} onClose={() => setIsDukcapilOpen(false)} />
      <DinsosCivicModal isOpen={isDinsosOpen} onClose={() => setIsDinsosOpen(false)} />
      <DinkesCivicModal isOpen={isDinkesOpen} onClose={() => setIsDinkesOpen(false)} />
      <DisparCivicModal isOpen={isDisparOpen} onClose={() => setIsDisparOpen(false)} />
      <DiskopCivicModal isOpen={isDiskopOpen} onClose={() => setIsDiskopOpen(false)} />
      <DishubCivicModal isOpen={isDishubOpen} onClose={() => setIsDishubOpen(false)} />
      <BapendaCivicModal isOpen={isBapendaOpen} onClose={() => setIsBapendaOpen(false)} />
      <DynamicGovCivicModal 
        service={selectedGovService} 
        isOpen={Boolean(selectedGovService)} 
        onClose={() => setSelectedGovService(null)} 
      />

      {/* ========================================================================= */}
      {/* GENERIC B2B / INDUSTRY SERVICE REQUEST MODAL */}
      {/* ========================================================================= */}
      {selectedCivicService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl border ${selectedCivicService.bgColor} ${selectedCivicService.borderColor}`}>
                  {React.createElement(selectedCivicService.icon, { className: `h-5 w-5 ${selectedCivicService.color}` })}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedCivicService.name}
                  </h3>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    {selectedCivicService.agencyName || "Mitra Industri Surakarta"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCivicService(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {requestSuccessOrder ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Permohonan Berhasil Dikirim ke {selectedCivicService.agencyName}!
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1">
                    Petugas akan memvalidasi pesanan Anda dan segera mengalokasikan driver mitra terdekat.
                  </p>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/order/${requestSuccessOrder}`)}
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Lacak Pesanan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCivicService(null)}
                    className="h-9 text-xs rounded-xl"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendCivicRequest} className="space-y-3.5">
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/[0.04] text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {selectedCivicService.description}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Nomor WhatsApp Pemesan
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Alamat Lengkap Penjemputan / Pengantaran
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Catatan / Detail Layanan
                  </label>
                  <input
                    type="text"
                    value={citizenNotes}
                    onChange={(e) => setCitizenNotes(e.target.value)}
                    placeholder="Contoh: Ambil sampel darah puasa jam 07.00 WIB / Rombongan 4 orang..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="w-full h-11 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmittingRequest ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Mengirim Pesanan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Pesan Layanan Sekarang
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
