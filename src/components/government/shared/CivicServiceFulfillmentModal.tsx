"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { getCivicServiceDefinition } from "@/constants/civicCatalog";
import { CivicOutputMode } from "@/types/civic.types";
import { useAuthContext } from "@/components/AuthProvider";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { writeAuditLog } from "@/lib/auditLog";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ShieldCheck, 
  Send, 
  FileCheck2, 
  QrCode, 
  Truck, 
  Siren, 
  Ticket, 
  UserCheck, 
  Loader2, 
  AlertCircle,
  XCircle,
  Lock,
  Eye,
  Building2,
  Calendar
} from "lucide-react";
import { maskName, maskPhone } from "@/lib/privacy";

interface CivicServiceFulfillmentModalProps {
  order: OrderDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CivicServiceFulfillmentModal({
  order,
  isOpen,
  onClose,
  onSuccess
}: CivicServiceFulfillmentModalProps) {
  const { user, userData } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [isIdentityRevealed, setIsIdentityRevealed] = useState(false);

  // Form input fields for dynamic fulfillment
  const [officerNotes, setOfficerNotes] = useState("");
  const [signeeName, setSigneeName] = useState(userData?.displayName || "Kepala Dinas Terkait");
  const [commanderName, setCommanderName] = useState("Komandan Regu 1 Mako Solo");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen || !order) return null;

  const serviceDef = getCivicServiceDefinition(order.serviceType || "");
  const outputMode: CivicOutputMode = serviceDef.outputMode || "delivery";
  const isDp3a = order.serviceType?.startsWith("dp3a") || order.additionalRole === "gov_dp3a";

  const customerDisplayName = isDp3a && !isIdentityRevealed
    ? maskName(order.customerName || "Warga")
    : order.customerName || "Warga";

  const customerDisplayPhone = isDp3a && !isIdentityRevealed
    ? maskPhone(order.customerPhone || "")
    : order.customerPhone || "-";

  const handleRevealIdentity = async () => {
    setIsIdentityRevealed(true);
    if (user && order.id) {
      await writeAuditLog({
        orderId: order.id,
        action: "identity_revealed",
        actorId: user.uid,
        actorRole: "government",
        actorName: userData?.displayName || "Petugas DP3A",
        notes: "Membuka identitas pelapor sensitif untuk keperluan pendampingan hukum/psikologis.",
        metadata: { agencyName: "Dinas DP3A Kota Surakarta" }
      });
    }
  };

  const handleFulfillOrder = async () => {
    if (!user || !order.id) return;
    setIsProcessing(true);

    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);

      if (outputMode === "digital_issuance") {
        const certNumber = `REG-SOLO/${new Date().getFullYear()}/${order.id.slice(0, 8).toUpperCase()}`;
        
        await updateDoc(orderRef, {
          status: "completed",
          civicFulfillment: {
            outputMode: "digital_issuance",
            digitalCertificate: {
              certificateNumber: certNumber,
              documentTitle: order.serviceTitle || serviceDef.name,
              issuedAt: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
              issuerAgency: order.agencyName || serviceDef.agencyName,
              signeeName: signeeName,
              qrVerificationUrl: `https://solo-ride.web.app/verify/${order.id}`,
            },
            processedBy: {
              uid: user.uid,
              name: userData?.displayName || "Petugas OPD",
              role: "government"
            },
            processedAt: new Date().toISOString()
          },
          updatedAt: serverTimestamp()
        });

        await writeAuditLog({
          orderId: order.id,
          action: "verified",
          actorId: user.uid,
          actorRole: "government",
          actorName: userData?.displayName || "Petugas OPD",
          notes: `Menerbitkan Surat/Sertifikat Resmi Digital No: ${certNumber}.`,
          metadata: { agencyName: order.agencyName || serviceDef.agencyName }
        });
      } else if (outputMode === "delivery") {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await updateDoc(orderRef, {
          status: "pending", // Siap diambil kurir driver mitra
          otpCode: otp,
          "citizenDetails.otpCode": otp,
          civicFulfillment: {
            outputMode: "delivery",
            processedBy: {
              uid: user.uid,
              name: userData?.displayName || "Petugas OPD",
              role: "government"
            },
            processedAt: new Date().toISOString()
          },
          updatedAt: serverTimestamp()
        });

        await writeAuditLog({
          orderId: order.id,
          action: "verified",
          actorId: user.uid,
          actorRole: "government",
          actorName: userData?.displayName || "Petugas OPD",
          notes: `Verifikasi loket selesai. Memanggil kurir mitra driver dengan OTP ${otp}.`,
          metadata: { agencyName: order.agencyName || serviceDef.agencyName }
        });
      } else if (outputMode === "emergency_dispatch") {
        await updateDoc(orderRef, {
          status: "in_progress",
          civicFulfillment: {
            outputMode: "emergency_dispatch",
            emergencyDispatch: {
              unitName: `Regu Siaga ${serviceDef.agencyName}`,
              commanderName: commanderName,
              dispatchedAt: new Date().toISOString(),
              slaTargetMinutes: serviceDef.slaMinutes || 15,
              currentStatus: "dispatched"
            },
            processedBy: {
              uid: user.uid,
              name: userData?.displayName || "Komandan Jaga",
              role: "government"
            },
            processedAt: new Date().toISOString()
          },
          updatedAt: serverTimestamp()
        });

        await writeAuditLog({
          orderId: order.id,
          action: "verified",
          actorId: user.uid,
          actorRole: "government",
          actorName: userData?.displayName || "Komandan Jaga",
          notes: `Disposisi regu darurat satgas di bawah komando ${commanderName}.`,
          metadata: { agencyName: order.agencyName || serviceDef.agencyName }
        });
      } else if (outputMode === "subsidy_voucher") {
        const vchCode = `VCH-${serviceDef.shortName.toUpperCase().replace(/\s/g, "-")}-${order.id.slice(0, 6).toUpperCase()}`;

        await updateDoc(orderRef, {
          status: "completed",
          civicFulfillment: {
            outputMode: "subsidy_voucher",
            subsidyVoucher: {
              voucherCode: vchCode,
              barcodeNumber: `3372${order.id.replace(/\D/g, "").slice(0, 8) || "99881122"}`,
              programName: order.serviceTitle || serviceDef.name,
              subsidyAmount: 150000,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", { dateStyle: "long" }),
              redeemLocations: ["Pasar Gede Surakarta", "Pasar Klewer", "Koperasi Warga Solo"],
              isRedeemed: false
            },
            processedBy: {
              uid: user.uid,
              name: userData?.displayName || "Petugas Bantuan",
              role: "government"
            },
            processedAt: new Date().toISOString()
          },
          updatedAt: serverTimestamp()
        });

        await writeAuditLog({
          orderId: order.id,
          action: "verified",
          actorId: user.uid,
          actorRole: "government",
          actorName: userData?.displayName || "Petugas Bantuan",
          notes: `Menerbitkan Voucher Subsidi Pangan: ${vchCode}.`,
          metadata: { agencyName: order.agencyName || serviceDef.agencyName }
        });
      } else if (outputMode === "field_visit") {
        await updateDoc(orderRef, {
          status: "in_progress",
          civicFulfillment: {
            outputMode: "field_visit",
            fieldVisit: {
              officerName: commanderName,
              officerBadge: `KTA-SOLO-${order.id.slice(0, 5).toUpperCase()}`,
              scheduledDate: scheduledDate,
              scheduledTimeWindow: "09.00 - 12.00 WIB",
              purpose: order.serviceTitle || serviceDef.name,
              isCompleted: false
            },
            processedBy: {
              uid: user.uid,
              name: userData?.displayName || "Petugas Lapangan",
              role: "government"
            },
            processedAt: new Date().toISOString()
          },
          updatedAt: serverTimestamp()
        });

        await writeAuditLog({
          orderId: order.id,
          action: "verified",
          actorId: user.uid,
          actorRole: "government",
          actorName: userData?.displayName || "Petugas Lapangan",
          notes: `Menugaskan ${commanderName} untuk kunjungan lapangan pada ${scheduledDate}.`,
          metadata: { agencyName: order.agencyName || serviceDef.agencyName }
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Gagal memproses fulfillment:", err);
      alert(`Gagal memproses permohonan: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#0c1220] rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 max-h-[90vh] overflow-y-auto sg-custom-scrollbar">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0">
                {outputMode === "digital_issuance" ? "📄" :
                 outputMode === "delivery" ? "🛵" :
                 outputMode === "emergency_dispatch" ? "🚨" :
                 outputMode === "subsidy_voucher" ? "🎟️" : "🧑‍💼"}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                  FULFILLMENT & EKSEKUSI LAYANAN
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {order.serviceTitle || serviceDef.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Citizen Details Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/[0.04] pb-2">
              <span className="text-slate-500 font-semibold">Nama Pemohon:</span>
              <span className="font-bold text-slate-900 dark:text-white">{customerDisplayName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/[0.04] pb-2">
              <span className="text-slate-500 font-semibold">Telepon / Kontak:</span>
              <span className="font-bold text-slate-900 dark:text-white">{customerDisplayPhone}</span>
            </div>

            {order.citizenDetails?.nikOrRef && (
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/[0.04] pb-2">
                <span className="text-slate-500 font-semibold">NIK / No. Referensi:</span>
                <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{order.citizenDetails.nikOrRef}</span>
              </div>
            )}

            {order.dropoffLocation?.address && (
              <div>
                <span className="text-slate-500 font-semibold block">Alamat / Lokasi Tujuan:</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300 block mt-0.5">{order.dropoffLocation.address}</span>
              </div>
            )}

            {/* Privacy Reveal Button if DP3A */}
            {isDp3a && !isIdentityRevealed && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRevealIdentity}
                  className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Buka Identitas Pelapor (Tercatat di Audit Log)</span>
                </button>
              </div>
            )}
          </div>

          {/* Action-Specific Form Fields */}
          <div className="space-y-3 pt-1">
            {outputMode === "digital_issuance" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nama Pejabat Penandatangan Elektronik
                </label>
                <input
                  type="text"
                  value={signeeName}
                  onChange={(e) => setSigneeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {(outputMode === "emergency_dispatch" || outputMode === "field_visit") && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nama Petugas / Komandan Regu yang Ditugaskan
                </label>
                <input
                  type="text"
                  value={commanderName}
                  onChange={(e) => setCommanderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {outputMode === "field_visit" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Jadwal Tanggal Kunjungan
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectionOpen(true)}
              className="flex-1 h-11 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-xs font-bold gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              <span>Tolak Permohonan</span>
            </Button>

            <Button
              type="button"
              onClick={handleFulfillOrder}
              disabled={isProcessing}
              className="flex-2 h-11 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold gap-1.5 shadow-md shadow-teal-500/20"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : outputMode === "digital_issuance" ? (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>Terbitkan Dokumen & QR</span>
                </>
              ) : outputMode === "delivery" ? (
                <>
                  <Truck className="h-4 w-4" />
                  <span>Verifikasi & Panggil Kurir</span>
                </>
              ) : outputMode === "emergency_dispatch" ? (
                <>
                  <Siren className="h-4 w-4" />
                  <span>Disposisi Satgas Cepat</span>
                </>
              ) : outputMode === "subsidy_voucher" ? (
                <>
                  <Ticket className="h-4 w-4" />
                  <span>Terbitkan Voucher Pangan</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Tugaskan Petugas</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Rejection Standard Modal */}
      {isRejectionOpen && (
        <RejectionModal
          isOpen={isRejectionOpen}
          onClose={() => setIsRejectionOpen(false)}
          orderInfo={{
            orderId: order.id,
            serviceName: order.serviceTitle || serviceDef.name,
            customerName: order.customerName
          }}
          onConfirm={async (reason) => {
            if (!user || !order.id) return;
            const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
            await updateDoc(orderRef, {
              status: "rejected",
              rejectionReason: reason,
              updatedAt: serverTimestamp()
            });
            await writeAuditLog({
              orderId: order.id,
              action: "rejected",
              actorId: user.uid,
              actorRole: "government",
              actorName: userData?.displayName || "Petugas OPD",
              notes: reason,
              metadata: { agencyName: order.agencyName || serviceDef.agencyName }
            });
            setIsRejectionOpen(false);
            onClose();
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </>
  );
}
