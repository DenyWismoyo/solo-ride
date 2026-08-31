"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, Lock, User, Bike, Sparkles, ArrowLeft, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await authService.registerWithEmail(email, password, role, name);
      if (role === "driver") {
        router.push("/driver");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg("Pendaftaran gagal. Pastikan email belum pernah terdaftar sebelumnya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-1/4 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Back */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push("/")}
          className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white gap-1.5 pl-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Beranda
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white/95 dark:bg-[#0c1220]/95 border-slate-200/80 dark:border-white/[0.08] shadow-2xl backdrop-blur-xl rounded-3xl z-10">
        <CardContent className="p-7 space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
              <span className="font-black text-xl text-white tracking-tighter">RS</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Buat Akun Baru</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
              Pilih peran Anda untuk bergabung dengan jaringan ojek komunitas lokal.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === "customer"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User className="h-4 w-4" />
              Pelanggan
            </button>
            <button
              type="button"
              onClick={() => setRole("driver")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === "driver"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Bike className="h-4 w-4" />
              Mitra Driver
            </button>
          </div>

          {/* Role Benefit Card */}
          <div className={`p-3.5 rounded-2xl border text-xs ${
            role === "driver" 
              ? "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              {role === "driver" ? "Keuntungan Mitra Driver:" : "Keuntungan Pelanggan:"}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              {role === "driver" 
                ? "Bebas potongan komisi! Uang tunai 100% langsung masuk ke kantong Anda tanpa potongan per-trip."
                : "Tarif wajar tanpa biaya aplikasi tersembunyi. Dapatkan poin reward setiap kali bepergian."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <Input 
                  type="text" 
                  placeholder="Nama Anda" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input 
                  type="email" 
                  placeholder="nama@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kata Sandi</label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  type="password" 
                  placeholder="Minimal 6 karakter" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className={`w-full h-12 text-white font-bold rounded-2xl shadow-lg text-sm mt-2 cursor-pointer ${
                role === "driver"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/20"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
              }`}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Daftar Sebagai ${role === "driver" ? "Mitra Driver" : "Pelanggan"}`}
            </Button>
          </form>

          {/* Footer link */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
