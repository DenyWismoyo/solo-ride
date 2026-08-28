"use client";

import React, { useState } from "react";
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
  X
} from "lucide-react";

export default function IndustryDashboard() {
  const router = useRouter();
  const { user, userData } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new contract
  const [contractTitle, setContractTitle] = useState("");
  const [contractDesc, setContractDesc] = useState("");
  const [vehicleCount, setVehicleCount] = useState(4);
  const [destinationAddress, setDestinationAddress] = useState("Pasar Klewer & Laweyan");
  const [contractValue, setContractValue] = useState(1500000);

  // Real-time contracts listener
  const { contracts, loading: contractsLoading } = useContracts(user?.uid);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contractTitle) return;

    setIsSubmitting(true);
    try {
      await contractService.createContract({
        industryId: user.uid,
        industryName: userData?.businessName || "PT Industri Tekstil Solo Kencana",
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
            recipientName: "Pengrajin Mitra Solo",
            status: "pending"
          }
        ],
        startDate: new Date(),
      });

      setIsModalOpen(false);
      setContractTitle("");
      setContractDesc("");
      alert("✅ Kontrak Distribusi Batch berhasil diterbitkan ke pool driver mitra koperasi!");
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
        {/* Industry Profile Banner */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-gradient-to-tr dark:from-blue-950/30 dark:via-zinc-900 dark:to-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {userData?.businessName || "PT Industri Tekstil Solo Kencana"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Kawasan Industri Laweyan</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Mitra Resmi B2B</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Armada Aktif</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">6 Mitra</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Distribusi Sukses</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">142 Titik</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Hemat Ongkir</span>
              <span className="text-sm font-black text-teal-600 dark:text-teal-400">~35% B2B</span>
            </div>
          </div>
        </div>

        {/* Quick Batch Logistics Request */}
        <div className="sg-card p-4 rounded-3xl border border-blue-500/30 bg-blue-500/5 dark:bg-gradient-to-r dark:from-blue-950/40 dark:via-zinc-900 dark:to-zinc-900 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Permintaan Armada Batch</h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Booking 5-20 armada driver lokal sekaligus</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-3 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              Order Batch
            </Button>
          </div>
        </div>

        {/* Active Supply Chain Contracts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">Kontrak Distribusi Lokal</h3>
            <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {contracts.length} Kontrak
            </span>
          </div>

          {contractsLoading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memuat kontrak distribusi B2B...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="sg-card p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-center space-y-2 shadow-sm">
              <FileText className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Belum Ada Kontrak Distribusi</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                Terbitkan kontrak distribusi bahan baku atau barang jadi Anda untuk langsung dialokasikan ke armada driver mitra koperasi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((ctr) => (
                <div
                  key={ctr.id}
                  className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="blue" size="sm">
                        CTR-#{ctr.id?.slice(0, 6)}
                      </Badge>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{ctr.title}</h4>
                    </div>
                    <Badge variant="emerald" size="sm">
                      {ctr.status}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-300 border-t border-slate-200 dark:border-zinc-800 pt-2">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>Tujuan: {ctr.deliveryPoints?.[0]?.address || "Surakarta"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                      <Users className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>Alokasi: {ctr.vehicleCount} Armada Mitra Driver</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Nilai: <b className="text-emerald-600 dark:text-emerald-400">Rp {ctr.totalValue.toLocaleString("id-ID")}</b></span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">Pantau GPS Armada →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Buat Kontrak Distribusi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                Terbitkan Kontrak Distribusi B2B
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Judul Pengiriman / Kontrak:</label>
                <input
                  type="text"
                  placeholder="Misal: Distribusi Kain Batik ke 10 Pengrajin"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Titik / Area Tujuan:</label>
                <input
                  type="text"
                  placeholder="Misal: Kawasan Laweyan & Pasar Klewer"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Jumlah Armada:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Nilai Kontrak (Rp):</label>
                  <input
                    type="number"
                    step="50000"
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Terbitkan Kontrak ke Pool Driver
              </Button>
            </form>
          </div>
        </div>
      )}

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
