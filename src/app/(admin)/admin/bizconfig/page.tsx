"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings2,
  Save,
  Loader2,
  TrendingUp,
  Percent,
  Ticket
} from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BizConfigPage() {
  const router = useRouter();
  const { user, userData } = useAuthContext();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Pricing state
  const [config, setConfig] = useState<any>({
    BASE_FARE_OJEK: 3000,
    RATE_PER_KM_OJEK: 2500,
    MIN_FARE_OJEK: 10000,
    BASE_FARE_MOBIL: 5000,
    RATE_PER_KM_MOBIL: 4500,
    MIN_FARE_MOBIL: 15000,
    KARCIS_HARIAN: 15000,
    SURGE_CAP: 1.5,
  });

  useEffect(() => {
    // Only super admin can access
    if (userData && userData.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "bizConfig", "pricing");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setConfig(snap.data());
        } else {
          // Initialize if empty
          await setDoc(docRef, { ...config, lastUpdatedBy: "system", lastUpdatedAt: serverTimestamp() });
        }
      } catch (error) {
        console.error("Gagal memuat konfigurasi", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userData?.role === "admin") {
      fetchConfig();
    }
  }, [userData, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "bizConfig", "pricing");
      await setDoc(docRef, {
        ...config,
        lastUpdatedBy: user?.uid,
        lastUpdatedAt: serverTimestamp()
      }, { merge: true });
      alert("BizConfig berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-6">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-6">
        {/* Header Back & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">BizConfig Panel</h1>
                <p className="text-[10px] text-slate-500">Konfigurasi Tarif & Ekosistem</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
            Simpan
          </Button>
        </div>

        {/* Section: Ojek Motor */}
        <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold">Tarif Ojek Motor</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Base Fare (Rp)</label>
              <input 
                type="number" 
                value={config.BASE_FARE_OJEK}
                onChange={(e) => handleChange("BASE_FARE_OJEK", e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Per KM (Rp)</label>
              <input 
                type="number" 
                value={config.RATE_PER_KM_OJEK}
                onChange={(e) => handleChange("RATE_PER_KM_OJEK", e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Tarif Minimum (Rp)</label>
              <input 
                type="number" 
                value={config.MIN_FARE_OJEK}
                onChange={(e) => handleChange("MIN_FARE_OJEK", e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section: Mobil Warga */}
        <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold">Tarif Mobil Warga</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Base Fare (Rp)</label>
              <input 
                type="number" 
                value={config.BASE_FARE_MOBIL}
                onChange={(e) => handleChange("BASE_FARE_MOBIL", e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Per KM (Rp)</label>
              <input 
                type="number" 
                value={config.RATE_PER_KM_MOBIL}
                onChange={(e) => handleChange("RATE_PER_KM_MOBIL", e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Tarif Minimum (Rp)</label>
              <input 
                type="number" 
                value={config.MIN_FARE_MOBIL}
                onChange={(e) => handleChange("MIN_FARE_MOBIL", e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section: Sistem Ekosistem (Karcis & Surge) */}
        <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <Ticket className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold">Variabel Ekosistem</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Karcis Harian Driver (Rp)</label>
              <input 
                type="number" 
                value={config.KARCIS_HARIAN}
                onChange={(e) => handleChange("KARCIS_HARIAN", e.target.value)}
                className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-black text-amber-700 dark:text-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Surge Cap (Maks Multiplier)</label>
              <input 
                type="number" 
                step="0.1"
                value={config.SURGE_CAP}
                onChange={(e) => setConfig({...config, SURGE_CAP: parseFloat(e.target.value)})}
                className="w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 font-black text-rose-700 dark:text-rose-400"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
