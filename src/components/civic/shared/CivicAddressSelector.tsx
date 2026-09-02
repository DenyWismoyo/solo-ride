import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { MapPin, Home, Briefcase, GraduationCap, Map, PlusCircle } from "lucide-react";
import { SavedAddress } from "@/types/user.types";

interface CivicAddressSelectorProps {
  label?: string;
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  required?: boolean;
}

const getIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "rumah": return <Home className="h-4 w-4" />;
    case "kantor": return <Briefcase className="h-4 w-4" />;
    case "kampus": return <GraduationCap className="h-4 w-4" />;
    default: return <MapPin className="h-4 w-4" />;
  }
};

export function CivicAddressSelector({ 
  label = "Alamat Pengiriman / Penjemputan", 
  value, 
  onChange, 
  required = false 
}: CivicAddressSelectorProps) {
  const { userData } = useAuthContext();
  const savedAddresses = userData?.savedAddresses || [];
  const hasSavedAddresses = savedAddresses.length > 0;
  
  const [useManual, setUseManual] = useState(!hasSavedAddresses);
  const [manualAddress, setManualAddress] = useState(value);

  // Sync initial value if there's no saved addresses but value is provided
  useEffect(() => {
    if (!hasSavedAddresses && value && value !== manualAddress) {
      setManualAddress(value);
    }
  }, [hasSavedAddresses, value]);

  const handleSelectSaved = (addr: SavedAddress) => {
    setUseManual(false);
    onChange(addr.address, addr.lat, addr.lng);
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setManualAddress(val);
    onChange(val); // No lat/lng for manual fallback
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </label>

      {hasSavedAddresses ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedAddresses.map((addr) => {
              const isSelected = !useManual && value === addr.address;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSaved(addr)}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1220] hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isSelected ? "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"}`}>
                      {getIcon(addr.label)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex justify-between">
                        {addr.label}
                        {isSelected && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Terpilih</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{addr.address}</div>
                      {addr.detail && <div className="text-[10px] text-slate-400 mt-1">{addr.detail}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Option to use manual input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseManual(true)}
              className={`text-[11px] font-medium transition-colors ${useManual ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              + Gunakan alamat lain (Manual)
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 mb-3">
          <div className="flex items-start gap-2">
            <Map className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-amber-800 dark:text-amber-300 text-[11px]">
              <p className="font-semibold">Anda belum mengatur alamat tersimpan</p>
              <p className="opacity-90 leading-relaxed">
                Untuk mempercepat pesanan di masa depan, silakan atur profil Anda. Sementara itu, gunakan input manual di bawah ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {useManual && (
        <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
          <textarea
            value={manualAddress}
            onChange={handleManualChange}
            required={required && useManual}
            placeholder="Ketik alamat lengkap Anda di sini..."
            rows={3}
            className="w-full text-sm p-3.5 sg-textarea resize-none"
          />
        </div>
      )}
    </div>
  );
}
