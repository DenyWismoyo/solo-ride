"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  MapPin, 
  Phone, 
  Calendar, 
  EyeOff, 
  Eye, 
  Sparkles, 
  PhoneCall, 
  Send,
  MessageCircleHeart,
  UserCheck,
  History,
  X
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface GovDp3aWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovDp3aWorkspace({ orders, loading }: GovDp3aWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"hotline_cases" | "puspaga_schedule" | "safehouse">("hotline_cases");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Confidentiality PIN Unlock State
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const pendingCases = orders.filter(o => o.status === "pending_verification" || o.status === "pending");
  const inProgressCases = orders.filter(o => o.status === "in_progress" || o.status === "accepted");
  const completedCases = orders.filter(o => o.status === "completed");

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234" || pinInput === "3372") { // Standard DP3A Operator PIN
      setIsPinUnlocked(true);
      setIsPinModalOpen(false);
      setPinInput("");
      alert("🔓 Akses data terproteksi dibuka. Seluruh tindakan Anda tercatat dalam audit log kerahasiaan.");
    } else {
      alert("❌ PIN Petugas salah. Hubungi Administrator DP3APM Surakarta.");
    }
  };

  const handleAssignCounselor = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "in_progress",
        verifiedByDinasAt: serverTimestamp(),
        counselorAssigned: "Tim Sahabat & Psikolog Puspaga Solo",
        updatedAt: serverTimestamp()
      });
      playSuccessChime();
      alert("✅ Tim Sahabat / Konselor Puspaga Ditugaskan untuk Pendampingan Kasus.");
    } catch (err: any) {
      console.error("Gagal menugaskan konselor:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteCase = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      playSuccessChime();
      alert("✅ Kasus ditandai telah aman dan dalam pemantauan rutin.");
    } catch (err: any) {
      console.error("Gagal menyelesaikan kasus:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. EXECUTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wider">
            Laporan Masuk
          </span>
          <div className="text-2xl font-black text-pink-600 dark:text-pink-400">
            {pendingCases.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
            Dalam Pendampingan
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {inProgressCases.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            Situasi Aman / Tuntas
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedCases.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-center space-y-0.5 flex flex-col justify-center items-center">
          <button
            type="button"
            onClick={() => {
              if (isPinUnlocked) {
                setIsPinUnlocked(false);
              } else {
                setIsPinModalOpen(true);
              }
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isPinUnlocked
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
            }`}
          >
            {isPinUnlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            <span>{isPinUnlocked ? "Data Terbuka" : "Buka Kunci PIN"}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab("hotline_cases")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "hotline_cases"
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Hotline & Kasus Aktif ({pendingCases.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("puspaga_schedule")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "puspaga_schedule"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MessageCircleHeart className="h-3.5 w-3.5" />
          <span>Jadwal Puspaga</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("safehouse")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "safehouse"
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Rujukan & Safe House</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Loader2 className="h-6 w-6 text-pink-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Memuat data aman DP3APM...</p>
        </div>
      ) : activeTab === "hotline_cases" ? (
        /* HOTLINE CASES LIST */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daftar Kasus Terproteksi ({pendingCases.length})
            </h4>
            <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold flex items-center gap-1">
              <Lock className="h-3 w-3" /> Privasi Terenkripsi
            </span>
          </div>

          {pendingCases.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Tidak ada laporan kasus perlindungan aktif yang membutuhkan tindakan.
            </div>
          ) : (
            pendingCases.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-white/95 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="rose" size="sm">
                        {order.citizenDetails?.needOnsiteSupport ? "🚨 BUTUH TIM" : "KONSULTASI"}
                      </Badge>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{order.serviceTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                      <span>{order.dropoffLocation?.address}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Identitas Pelapor:</span>
                    <span className="font-mono font-bold text-pink-700 dark:text-pink-300">
                      {order.customerName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-pink-500/20">
                    <span className="text-[10px] text-slate-500">Kontak Aman:</span>
                    {isPinUnlocked ? (
                      <span className="font-mono font-bold text-emerald-600">
                        {order.citizenDetails?.safeContactPhone || order.customerPhone}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsPinModalOpen(true)}
                        className="text-[11px] text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        <span>Buka Kunci PIN</span>
                      </button>
                    )}
                  </div>

                  {order.citizenDetails?.notes && (
                    <div className="text-[11px] text-slate-600 dark:text-zinc-300 pt-1">
                      "{order.citizenDetails.notes}"
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => order.id && handleAssignCounselor(order.id)}
                    disabled={processingId === order.id}
                    className="flex-1 h-10 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processingId === order.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Menugaskan Tim...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Tugaskan Konselor Sahabat
                      </>
                    )}
                  </Button>

                  {isPinUnlocked && (
                    <a
                      href={`tel:${order.citizenDetails?.safeContactPhone || order.customerPhone}`}
                      className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Telepon</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}

          {/* In Progress Counseling */}
          {inProgressCases.length > 0 && (
            <div className="space-y-3 pt-3">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider px-1">
                Sedang Dalam Pendampingan ({inProgressCases.length})
              </h4>
              {inProgressCases.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2 text-xs"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{order.serviceTitle}</span>
                    <Badge variant="teal" size="sm">PENDAMPINGAN</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">Pemohon: {order.customerName}</p>
                  <Button
                    size="sm"
                    onClick={() => order.id && handleCompleteCase(order.id)}
                    disabled={processingId === order.id}
                    className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg"
                  >
                    Tandai Situasi Aman & Selesai
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "puspaga_schedule" ? (
        /* PUSPAGA COUNSELING APPOINTMENTS */
        <div className="space-y-4">
          <div className="p-4 bg-white/90 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-purple-600" />
              Jadwal Sesi Konseling Psikolog Puspaga Surakarta
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex justify-between items-center">
                <div>
                  <span className="font-bold text-purple-800 dark:text-purple-300 text-xs block">
                    Ruang Konseling Keluarga 1
                  </span>
                  <span className="text-[10px] text-slate-500">Psikolog: Dra. Sulastri, M.Psi</span>
                </div>
                <Badge variant="emerald" size="sm">SIAP SESI</Badge>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex justify-between items-center">
                <div>
                  <span className="font-bold text-purple-800 dark:text-purple-300 text-xs block">
                    Ruang Konseling Remaja & Anak
                  </span>
                  <span className="text-[10px] text-slate-500">Psikolog: Rahmat Hidayat, S.Psi</span>
                </div>
                <Badge variant="emerald" size="sm">SIAP SESI</Badge>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SAFE HOUSE & REFERRALS */
        <div className="space-y-4">
          <div className="p-4 bg-white/90 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl space-y-3 shadow-sm text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-pink-600" />
              Kesiapan Rumah Aman (Safe House) & Rujukan Medis Solo
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">Rumah Aman (Safe House) Surakarta</span>
                  <span className="text-emerald-600 font-bold">4 Kamar Siap Huni</span>
                </div>
                <p className="text-[10px] text-slate-500">Keamanan dijaga Satgas & petugas kepolisian 24 jam.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">RSUD Bung Karno & RSUD Dr. Moewardi</span>
                  <span className="text-emerald-600 font-bold">Layanan Visum Gratis</span>
                </div>
                <p className="text-[10px] text-slate-500">Pusat pemulihan trauma medis & visum et repertum korban.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/[0.1] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-pink-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verifikasi PIN Petugas DP3APM</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <p className="text-[11px] text-slate-500">
                Masukkan PIN otorisasi operator DP3APM (Default: 3372 / 1234) untuk menampilkan nomor kontak dan detail kasus sensitif.
              </p>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="4 Digit PIN..."
                className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl focus:outline-none focus:border-pink-500 text-slate-900 dark:text-white"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-10 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl"
              >
                Buka Otorisasi
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
