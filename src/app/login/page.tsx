"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, Lock, Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await authService.loginWithEmail(email, password);
      const profile = await authService.getUserProfile(user.uid);
      if (profile?.role === "driver") {
        router.push("/driver");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg("Email atau kata sandi tidak cocok. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const user = await authService.loginWithGoogle();
      const profile = await authService.getUserProfile(user.uid);
      if (profile?.role === "driver") {
        router.push("/driver");
      } else {
        router.push("/");
      }
    } catch (err) {
      setErrorMsg("Gagal masuk dengan Google. Pastikan popup tidak diblokir.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <SoloAppLogoIcon 
              size={56} 
              className="mx-auto rounded-[1.4rem] shadow-xl shadow-emerald-500/25" 
            />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Selamat Datang</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
              Masuk ke ekosistem ojek lokal berbasis komunitas tanpa potongan komisi.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kata Sandi</label>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-sm"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-sm mt-2 cursor-pointer" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Masuk Sekarang"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-white/[0.08]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Atau</span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/[0.08]"></div>
          </div>

          {/* Google Sign-in */}
          <Button 
            variant="outline" 
            className="w-full h-12 border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer" 
            onClick={handleGoogleLogin}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Lanjut dengan Google
          </Button>

          {/* Footer link */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Daftar Gratis
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
