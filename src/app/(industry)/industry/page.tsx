"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useContracts } from "@/hooks/useContracts";
import { contractService } from "@/services/contract.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INDUSTRY_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";
import { 
  Building2, 
  Truck, 
  PackageCheck, 
  FileText, 
  Plus, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Loader2, 
  X,
  CheckCircle2,
  Sparkles,
  FlaskConical,
  Bus,
  Hotel,
  Wheat,
  Inbox
} from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";

export default function IndustryDashboard() {
  const router = useRouter();
  const { user, userData, effectiveUid, impersonatedPersona } = useAuthContext();
  const activeIndustryId = effectiveUid || user?.uid;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Industry Sector Selection
  const defaultSectorId = impersonatedPersona?.additionalRole || userData?.additionalRole || "ind_kargo";
  const [selectedSectorId, setSelectedSectorId] = useState<string>(defaultSectorId);

  // Sync if impersonated persona changes
  useEffect(() => {
    if (impersonatedPersona?.additionalRole) {
      setSelectedSectorId(impersonatedPersona.additionalRole);
    }
  }, [impersonatedPersona]);

  const activeSector = INDUSTRY_SECTORS.find((s) => s.id === selectedSectorId) || INDUSTRY_SECTORS[0];

  // Dynamic Form states tailored to industry sector
  const [contractTitle, setContractTitle] = useState("");
  const [contractDesc, setContractDesc] = useState("");
  const [vehicleCount, setVehicleCount] = useState(3);
  const [destinationAddress, setDestinationAddress] = useState("Kawasan Industri Palur & Pasar Klewer");
  const [contractValue, setContractValue] = useState(3500000);

  // Citizen Orders for this industry vertical
  const [citizenOrders, setCitizenOrders] = useState<OrderDocument[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Pre-fill form when changing sector
  useEffect(() => {
    if (selectedSectorId === "ind_klinik") {
      setContractTitle("Pengiriman Sampel Laboratorium Medis & E-Resep Terjadwal");
      setContractDesc("Pengantaran spesimen darah dan cairan lab dengan coolbox suhu 2-8°C rute 5 faskes Solo.");
      setDestinationAddress("RSUD Dr. Moewardi & Lab Klinik Solo");
      setContractValue(1800000);
      setVehicleCount(2);
    } else if (selectedSectorId === "ind_travel") {
      setContractTitle("Shuttle Antar-Jemput Stasiun Solo Balapan & Wisata Heritage");
      setContractDesc("Layanan charter armada MPV untuk tamu hotel dan rombongan wisata Keraton.");
      setDestinationAddress("Stasiun Solo Balapan - Hotel Alila - Pura Mangkunegaran");
      setContractValue(2400000);
      setVehicleCount(3);
    } else if (selectedSectorId === "ind_kargo") {
      setContractTitle("Distribusi Bahan Baku Tekstil Solo - Semarang (Kargo Box)");
      setContractDesc("Kargo muatan kain katun 1.200 kg rute Pabrik Palur ke Pelabuhan Tanjung Emas.");
      setDestinationAddress("Kawasan Industri Palur - Pelabuhan Semarang");
      setContractValue(4500000);
      setVehicleCount(2);
    } else if (selectedSectorId === "ind_hotel") {
      setContractTitle("Pasokan Bahan Pangan Segar Subuh Pasar Gede & Laundry Linen");
      setContractDesc("Pengadaan harian sayur, daging, dan antar-jemput linen hotel bintang.");
      setDestinationAddress("Pasar Gede Solo - Hotel Solo Heritage");
      setContractValue(3000000);
      setVehicleCount(2);
    } else if (selectedSectorId === "ind_pabrik") {
      setContractTitle("Drop-off Kain Grosir Batik PGS & Pasar Klewer");
      setContractDesc("Distribusi rutin 50 roll kain batik cap dan bahan malam perajin Laweyan.");
      setDestinationAddress("Pusat Grosir Solo (PGS) & Pasar Klewer");
      setContractValue(2800000);
      setVehicleCount(2);
    } else if (selectedSectorId === "ind_agro") {
      setContractTitle("Distribusi Beras Delanggu & Sayuran Selo ke Pasar Tradisional");
      setContractDesc("Pasokan 2 ton beras panen langsung ke kios pedagang sembako Pasar Legi.");
      setDestinationAddress("Pasar Legi Surakarta & Warung Warga");
      setContractValue(3200000);
      setVehicleCount(3);
    }
  }, [selectedSectorId]);

  // Real-time listener for incoming citizen orders submitted to this sector
  useEffect(() => {
    setLoadingOrders(true);
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("additionalRole", "==", selectedSectorId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() } as OrderDocument);
      });
      setCitizenOrders(docs);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [selectedSectorId]);

  // Real-time contracts listener
  const { contracts, loading: contractsLoading } = useContracts(activeIndustryId);

  const handleDispatchIndustryOrder = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Appears in driver radar!
        updatedAt: serverTimestamp()
      });
      alert("✅ Layanan B2B berhasil divalidasi dan dialokasikan ke Driver Mitra!");
    } catch (err: any) {
      alert(`Gagal dispatch: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contractTitle) return;

    setIsSubmitting(true);
    try {
      await contractService.createContract({
        industryId: user.uid,
        industryName: `${activeSector.agencyOrCompanyName} (${activeSector.name})`,
        title: contractTitle,
        description: contractDesc,
        vehicleCount: Number(vehicleCount),
        totalValue: Number(contractValue),
        deliveryPoints: [
          {
            id: "dp-1",
            address: destinationAddress,
            lat: -7.5755,
            lng: 110.8243,
            recipientName: "Mitra Penerima Surakarta",
            status: "pending"
          }
        ],
        startDate: new Date(),
      });

      setIsModalOpen(false);
      alert(`✅ Kontrak B2B untuk ${activeSector.name} berhasil diterbitkan ke pool driver mitra koperasi!`);
    } catch (err) {
      alert("Gagal membuat kontrak distribusi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 transition-colors duration-200">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-5 flex-1">
        {/* ========================================================================= */}
        {/* 1. SECTOR SELECTOR TABS */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Pilih Sektor Vertikal Industri B2B:
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              {INDUSTRY_SECTORS.length} Vertikal
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {INDUSTRY_SECTORS.map((sector) => {
              const isSelected = sector.id === selectedSectorId;
              return (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSectorId(sector.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                      : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-blue-500/40"
                  }`}
                >
                  <span className="text-sm">{sector.avatar}</span>
                  <span className="whitespace-nowrap text-[11px]">{sector.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. INDUSTRY ACTIVE BANNER */}
        {/* ========================================================================= */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-gradient-to-tr dark:from-blue-950/40 dark:via-zinc-900 dark:to-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30 text-3xl shrink-0 shadow-sm">
              {activeSector.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeSector.name}
                </h2>
                <Badge variant="blue" size="sm">
                  B2B MITRA
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                {activeSector.agencyOrCompanyName}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                "{activeSector.tagline}"
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            {activeSector.description}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INCOMING CITIZEN ORDERS (DARI /services/more WARGA) */}
        {/* ========================================================================= */}
        <div className="sg-bento-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Permohonan Warga Masuk ({citizenOrders.length})
                </h3>
                <p className="text-[10px] text-slate-500">
                  Layanan B2B yang dipesan warga (Homecare Lab / Shuttle / Kargo)
                </p>
              </div>
            </div>
          </div>

          {loadingOrders ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-blue-500" />
              Memeriksa pesanan masuk...
            </div>
          ) : citizenOrders.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 text-xs text-slate-500">
              Belum ada pesanan warga untuk sektor ini.
            </div>
          ) : (
            <div className="space-y-3">
              {citizenOrders.map((req) => (
                <div
                  key={req.id}
                  className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {(req as any).serviceTitle || req.serviceType.toUpperCase()}
                        </span>
                        <Badge 
                          variant={req.status === "pending_verification" ? "rose" : req.status === "pending" ? "amber" : "emerald"} 
                          size="sm"
                        >
                          {req.status === "pending_verification" ? "Menunggu Konfirmasi" : req.status === "pending" ? "Dalam Radar Driver" : req.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Pemesan: <strong>{(req as any).customerName}</strong> • {(req as any).customerPhone}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Rp {req.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {req.status === "pending_verification" && (
                    <Button
                      size="sm"
                      onClick={() => req.id && handleDispatchIndustryOrder(req.id)}
                      disabled={dispatchingId === req.id}
                      className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {dispatchingId === req.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengalokasikan...
                        </>
                      ) : (
                        <>
                          <Truck className="h-3.5 w-3.5" /> Konfirmasi & Alokasikan ke Driver Mitra
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button: Terbitkan Kontrak B2B */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Terbitkan Kontrak B2B: {activeSector.name}
        </Button>

        {/* ========================================================================= */}
        {/* 4. ACTIVE CONTRACTS LIST */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Kontrak Distribusi Aktif ({contracts.length})
            </h3>
          </div>

          {contractsLoading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memuat kontrak distribusi...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Belum ada kontrak aktif. Klik tombol di atas untuk membuat kontrak logistik B2B baru.
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h4>
                        <Badge variant="blue" size="sm">{c.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{c.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                      <Truck className="h-3.5 w-3.5 text-blue-500" />
                      <span>{c.vehicleCount} Armada Dialokasikan</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-bold justify-end">
                      <span className="text-blue-600 dark:text-blue-400">Rp {c.totalValue.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: CREATE B2B CONTRACT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeSector.avatar}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Buat Kontrak: {activeSector.name}
                  </h3>
                  <p className="text-[10px] text-slate-500">{activeSector.agencyOrCompanyName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nama Kontrak / Layanan B2B
                </label>
                <input
                  type="text"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Deskripsi / Spesifikasi Muatan
                </label>
                <textarea
                  value={contractDesc}
                  onChange={(e) => setContractDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Rute / Destinasi Pengiriman
                </label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Jumlah Armada Truk
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Nilai Kontrak (Rp)
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Menerbitkan Kontrak...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Publikasikan ke Pool Driver Mitra
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
