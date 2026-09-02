"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Eye, ExternalLink, UserCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KYCRequestDocument } from "@/types/kyc.types";

interface AdminKycTabProps {
  kycRequests: KYCRequestDocument[];
  loadingKYC: boolean;
  onReviewKYC: (reqId: string, driverUid: string, status: "approved" | "rejected") => Promise<void>;
  processingKYCId: string | null;
}

export function AdminKycTab({
  kycRequests,
  loadingKYC,
  onReviewKYC,
  processingKYCId
}: AdminKycTabProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="sg-bento-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-500" />
            <span>Antrean Verifikasi Legalitas KYC Mitra Driver</span>
          </h3>
          <p className="text-xs text-slate-400">
            Pemeriksaan NIK, SIM, dan Plat Nomor Kendaraan oleh Petugas Koperasi
          </p>
        </div>
        <Badge variant="amber" size="sm" className="font-bold">
          {kycRequests.filter(r => r.status === "pending").length} Menunggu
        </Badge>
      </div>

      {loadingKYC ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Memuat berkas KYC...</p>
        </div>
      ) : kycRequests.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Tidak ada berkas KYC yang sedang menunggu verifikasi.
        </div>
      ) : (
        <div className="space-y-3">
          {kycRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.driverName}
                    </span>
                    <Badge
                      variant={req.status === "approved" ? "emerald" : req.status === "rejected" ? "rose" : "amber"}
                      size="sm"
                      className="font-bold text-[9px]"
                    >
                      {req.status === "approved" ? "TERVERIFIKASI" : req.status === "rejected" ? "DITOLAK" : "MENUNGGU REVIEW"}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Kontak: {req.phone} | {req.driverEmail}
                  </span>
                </div>

                {req.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onReviewKYC(req.id!, req.userId, "approved")}
                      disabled={processingKYCId === req.id}
                      className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      {processingKYCId === req.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReviewKYC(req.id!, req.userId, "rejected")}
                      disabled={processingKYCId === req.id}
                      className="h-8 rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-bold text-xs cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Tolak
                    </Button>
                  </div>
                )}
              </div>

              {/* Driver Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">NIK KTP:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{req.nik}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Nomor SIM C:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{req.simNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Plat Nomor:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{req.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Jenis Kendaraan:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{req.vehicleModel}</span>
                </div>
              </div>

              {/* Photo Previews */}
              <div className="flex items-center gap-3 pt-1">
                {req.ktpImageUrl && (
                  <button
                    onClick={() => setSelectedPhoto(req.ktpImageUrl!)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Lihat Foto KTP</span>
                  </button>
                )}
                {req.simImageUrl && (
                  <button
                    onClick={() => setSelectedPhoto(req.simImageUrl!)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Lihat Foto SIM</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1220] rounded-[2rem] p-4 max-w-lg w-full space-y-3">
            <img src={selectedPhoto} alt="Dokumen KYC" className="w-full h-auto rounded-2xl object-cover max-h-[70vh]" />
            <Button onClick={() => setSelectedPhoto(null)} className="w-full h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer">
              Tutup Foto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
