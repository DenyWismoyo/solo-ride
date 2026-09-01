"use client";

import React from "react";
import { OrderDocument } from "@/types/order.types";
import { getCivicServiceDefinition } from "@/constants/civicCatalog";
import { DigitalCertificateCard } from "./DigitalCertificateCard";
import { EmergencyDispatchCard } from "./EmergencyDispatchCard";
import { SubsidyVoucherCard } from "./SubsidyVoucherCard";
import { FieldVisitCard } from "./FieldVisitCard";
import { CivicTicketCard } from "./CivicTicketCard";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Truck, KeyRound } from "lucide-react";

interface CivicOutputViewerProps {
  order: OrderDocument;
  className?: string;
}

export function CivicOutputViewer({ order, className = "" }: CivicOutputViewerProps) {
  const serviceDef = getCivicServiceDefinition(order.serviceType || "");
  const fulfillment = (order as any).civicFulfillment;
  const outputMode = fulfillment?.outputMode || serviceDef.outputMode || "delivery";

  // 1. Digital Certificate Output (Diskop NIB, Bapenda PBB, DPMPTSP, Disnaker)
  if (outputMode === "digital_issuance") {
    const certData = fulfillment?.digitalCertificate || {
      certificateNumber: `REG-SOLO/${new Date().getFullYear()}/${order.id?.slice(0, 8).toUpperCase()}`,
      documentTitle: order.serviceTitle || serviceDef.name,
      issuedAt: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
      issuerAgency: order.agencyName || serviceDef.agencyName,
      signeeName: "Kepala Dinas Terkait Surakarta",
      qrVerificationUrl: `https://solo-ride.web.app/verify/${order.id}`,
    };

    return (
      <DigitalCertificateCard
        data={certData}
        serviceTitle={order.serviceTitle || serviceDef.name}
        customerName={order.customerName}
        orderId={order.id || "RS-DOC"}
        className={className}
      />
    );
  }

  // 2. Emergency Dispatch Output (Damkar, BPBD, Satpol PP, Dinkes PSC 119)
  if (outputMode === "emergency_dispatch") {
    const dispatchData = fulfillment?.emergencyDispatch || {
      unitName: `Regu Siaga Satgas ${serviceDef.agencyName}`,
      commanderName: "Komandan Jaga Mako Solo",
      commanderPhone: "0271-7630133",
      dispatchedAt: new Date().toISOString(),
      slaTargetMinutes: serviceDef.slaMinutes || 15,
      currentStatus: order.status === "completed" ? "resolved" : "dispatched" as any,
    };

    return (
      <EmergencyDispatchCard
        data={dispatchData}
        serviceTitle={order.serviceTitle || serviceDef.name}
        orderId={order.id || "EMERGENCY"}
        className={className}
      />
    );
  }

  // 3. Subsidy Voucher Output (Dinsos Sembako, Diskop SHU/Karcis)
  if (outputMode === "subsidy_voucher") {
    const voucherData = fulfillment?.subsidyVoucher || {
      voucherCode: `VCH-${serviceDef.shortName.toUpperCase().replace(/\s/g, "-")}-${order.id?.slice(0, 6).toUpperCase()}`,
      barcodeNumber: `3372${order.id?.replace(/\D/g, "").slice(0, 10) || "8899220011"}`,
      programName: order.serviceTitle || serviceDef.name,
      subsidyAmount: 150000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", { dateStyle: "long" }),
      redeemLocations: ["Pasar Gede Surakarta", "Pasar Klewer", "Koperasi Warga Solo"],
      isRedeemed: order.status === "completed",
    };

    return (
      <SubsidyVoucherCard
        data={voucherData}
        serviceTitle={order.serviceTitle || serviceDef.name}
        orderId={order.id || "VOUCHER"}
        className={className}
      />
    );
  }

  // 4. Field Visit Output (DP3A PUSPAGA, Dispertan Puskeswan, DLH)
  if (outputMode === "field_visit") {
    const visitData = fulfillment?.fieldVisit || {
      officerName: "Petugas Lapangan Resmi Pemkot",
      officerBadge: `KTA-SOLO-${order.id?.slice(0, 5).toUpperCase()}`,
      scheduledDate: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
      scheduledTimeWindow: "09.00 - 12.00 WIB",
      purpose: order.serviceTitle || serviceDef.name,
      isCompleted: order.status === "completed",
    };

    return (
      <FieldVisitCard
        data={visitData}
        serviceTitle={order.serviceTitle || serviceDef.name}
        orderId={order.id || "VISIT"}
        className={className}
      />
    );
  }

  // 5. Civic Ticket Output (Diskominfo ULAS, Dishub KIR, Dispar)
  if (outputMode === "civic_ticket") {
    const ticketData = fulfillment?.civicTicket || {
      ticketNumber: `TKT-ULAS-${order.id?.slice(0, 8).toUpperCase()}`,
      category: serviceDef.shortName,
      priority: "sedang" as any,
      officialResponse: order.status === "completed" ? "Permohonan/Aduan telah ditindaklanjuti secara tuntas oleh tim teknis dinas terkait." : undefined,
      respondedBy: serviceDef.agencyName,
    };

    return (
      <CivicTicketCard
        data={ticketData}
        serviceTitle={order.serviceTitle || serviceDef.name}
        orderId={order.id || "TICKET"}
        className={className}
      />
    );
  }

  // 6. Delivery Output (Default: Disdukcapil KTP, Dinkes Resep, Dispusip Buku)
  // Shows OTP & Courier Handover Details
  const otpCode = (order as any).citizenDetails?.otpCode || (order as any).otpCode;

  return (
    <div className={`p-4 sm:p-5 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white dark:from-emerald-950/30 dark:via-[#0c1220] dark:to-[#0c1220] border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-md space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            🛵
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              PENGANTARAN RESMI DOKUMEN & OBAT
            </span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {order.serviceTitle || serviceDef.name}
            </h4>
          </div>
        </div>

        <Badge variant="emerald" size="sm" className="font-bold">
          {order.status === "completed" ? "Selesai Diterima" : "Kurir Siap Antar"}
        </Badge>
      </div>

      {/* OTP Display Card */}
      {otpCode && (
        <div className="p-3 bg-white dark:bg-[#070b14] rounded-2xl border border-emerald-500/20 text-center space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            KODE PIN OTP PENYERAHAN DOKUMEN:
          </span>
          <span className="font-mono text-2xl font-black tracking-widest text-emerald-600 dark:text-emerald-400 block">
            {otpCode}
          </span>
          <p className="text-[10px] text-slate-500">
            Tunjukkan kode PIN ini kepada mitra kurir saat dokumen/obat fisik telah Anda terima di rumah.
          </p>
        </div>
      )}
    </div>
  );
}
