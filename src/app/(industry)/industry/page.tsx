"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useContracts } from "@/hooks/useContracts";
import { contractService } from "@/services/contract.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { UnifiedHistoryModal } from "@/components/history/UnifiedHistoryModal";
import { INDUSTRY_SECTORS } from "@/constants/ecosystemSectors";
import { IndustrySectorSelector } from "@/components/industry/IndustrySectorSelector";
import { IndustryOverviewCard } from "@/components/industry/IndustryOverviewCard";
import { IndustryOrdersStream } from "@/components/industry/IndustryOrdersStream";
import { IndustryContractsTab } from "@/components/industry/IndustryContractsTab";
import { CreateContractModal } from "@/components/industry/CreateContractModal";
import { IndustryWorkspace } from "@/components/industry/IndustryWorkspace";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";
import { History, Layers, Building2 } from "lucide-react";

export default function IndustryDashboard() {
  const router = useRouter();
  const { user, userData, effectiveUid, impersonatedPersona } = useAuthContext();
  const activeIndustryId = effectiveUid || user?.uid;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<"workspace" | "contracts">("workspace");

  // Active Industry Sector Selection
  const defaultSectorId = impersonatedPersona?.additionalRole || userData?.additionalRole || "ind_kargo";
  const [selectedSectorId, setSelectedSectorId] = useState<string>(defaultSectorId);

  useEffect(() => {
    if (impersonatedPersona?.additionalRole) {
      setSelectedSectorId(impersonatedPersona.additionalRole);
    }
  }, [impersonatedPersona]);

  const activeSector = INDUSTRY_SECTORS.find((s) => s.id === selectedSectorId) || INDUSTRY_SECTORS[0];

  // Dynamic Form states
  const [contractTitle, setContractTitle] = useState("");
  const [contractDesc, setContractDesc] = useState("");
  const [vehicleCount, setVehicleCount] = useState(3);
  const [destinationAddress, setDestinationAddress] = useState("Kawasan Industri Palur & Pasar Klewer");
  const [contractValue, setContractValue] = useState(3500000);

  // Citizen Orders for this vertical
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

  // Real-time listener for incoming orders submitted to this sector
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

  const { contracts, loading: contractsLoading } = useContracts(activeIndustryId);

  const handleDispatchIndustryOrder = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
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
        {/* Top History Button */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            Workspace B2B & Logistik
          </span>
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <History className="h-3.5 w-3.5 text-teal-500" />
            <span>Riwayat Order B2B</span>
          </button>
        </div>

        {/* View Switcher: 4-Pilar Logistik vs Sektoral */}
        <div className="flex items-center p-1 bg-slate-200/70 dark:bg-white/[0.04] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveView("workspace")}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeView === "workspace"
                ? "bg-white dark:bg-blue-600 text-blue-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Pilar Kargo 4-Pilar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("contracts")}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeView === "contracts"
                ? "bg-white dark:bg-blue-600 text-blue-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Kontrak Sektoral (6 Vertikal)</span>
          </button>
        </div>

        {activeView === "workspace" ? (
          <IndustryWorkspace />
        ) : (
          <div className="space-y-5">
            {/* 1. Sector Selector */}
            <IndustrySectorSelector
              selectedSectorId={selectedSectorId}
              onSelectSector={setSelectedSectorId}
            />

            {/* 2. Active Sector Overview Card */}
            <IndustryOverviewCard
              sector={activeSector}
              onOpenCreateContract={() => setIsModalOpen(true)}
            />

            {/* 3. Incoming Requests Stream */}
            <IndustryOrdersStream
              orders={citizenOrders}
              loading={loadingOrders}
              activeSector={activeSector}
              onDispatchOrder={handleDispatchIndustryOrder}
              dispatchingId={dispatchingId}
            />

            {/* 4. Active Retainer Contracts List */}
            <IndustryContractsTab
              contracts={contracts}
              loading={contractsLoading}
            />
          </div>
        )}
      </main>

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <CreateContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sector={activeSector}
        contractTitle={contractTitle}
        setContractTitle={setContractTitle}
        contractDesc={contractDesc}
        setContractDesc={setContractDesc}
        vehicleCount={vehicleCount}
        setVehicleCount={setVehicleCount}
        destinationAddress={destinationAddress}
        setDestinationAddress={setDestinationAddress}
        contractValue={contractValue}
        setContractValue={setContractValue}
        onSubmit={handleCreateContract}
        isSubmitting={isSubmitting}
      />

      <UnifiedHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        initialRole="industry"
      />
    </div>
  );
}
