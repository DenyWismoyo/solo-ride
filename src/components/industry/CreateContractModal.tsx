"use client";

import React from "react";
import { X, Send, Loader2, Building2, Truck, Coins, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectorDefinition } from "@/constants/ecosystemSectors";

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: SectorDefinition;
  contractTitle: string;
  setContractTitle: (val: string) => void;
  contractDesc: string;
  setContractDesc: (val: string) => void;
  vehicleCount: number;
  setVehicleCount: (val: number) => void;
  destinationAddress: string;
  setDestinationAddress: (val: string) => void;
  contractValue: number;
  setContractValue: (val: number) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateContractModal({
  isOpen,
  onClose,
  sector,
  contractTitle,
  setContractTitle,
  contractDesc,
  setContractDesc,
  vehicleCount,
  setVehicleCount,
  destinationAddress,
  setDestinationAddress,
  contractValue,
  setContractValue,
  onSubmit,
  isSubmitting
}: CreateContractModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sector.avatar}</span>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Terbitkan Kontrak B2B: {sector.name}
              </h3>
              <p className="text-[10px] text-slate-400">
                Alokasikan armada kurir & angkutan terikat di Surakarta
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 p-1 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Judul Kontrak / Program Distribusi:
            </label>
            <input
              type="text"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Deskripsi Muatan & Jadwal:
            </label>
            <textarea
              value={contractDesc}
              onChange={(e) => setContractDesc(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Kebutuhan Armada:
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={vehicleCount}
                onChange={(e) => setVehicleCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Nilai Kontrak (Rp):
              </label>
              <input
                type="number"
                step={100000}
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Rute / Area Distribusi Tujuan:
            </label>
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Terbitkan Kontrak ke Mitra Koperasi</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
