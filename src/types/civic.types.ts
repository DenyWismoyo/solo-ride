import { Timestamp } from "firebase/firestore";

export type CivicOutputMode = 
  | "delivery"            // Pengantaran fisik dokumen/obat oleh kurir driver mitra + OTP
  | "emergency_dispatch"   // Siaga darurat / Satgas reaksi cepat 24 jam + alarm + live SLA
  | "digital_issuance"    // Penerbitan surat/sertifikat digital ber-QR Code resmi
  | "field_visit"         // Penugasan petugas lapangan / home visit / inspeksi
  | "subsidy_voucher"     // Voucher bantuan sembako / dividen SHU / karcis driver subsidi
  | "civic_ticket";       // Tiket pengaduan warga / reservasi publik

export interface DigitalCertificateMetadata {
  certificateNumber: string;
  documentTitle: string;
  issuedAt: string;
  issuerAgency: string;
  signeeName: string;
  signeeNIP?: string;
  qrVerificationUrl: string;
  validUntil?: string;
  legalBasis?: string;
  qrPayload?: string;
}

export interface EmergencyDispatchMetadata {
  unitName: string;           // misal: "Regu Damkar Solo Pos Manahan", "Tim Siaga Bencana BPBD"
  commanderName: string;
  commanderPhone?: string;
  dispatchedAt: string;
  slaTargetMinutes: number;   // misal: 15 menit
  currentStatus: "dispatched" | "on_scene" | "handling" | "resolved";
}

export interface SubsidyVoucherMetadata {
  voucherCode: string;
  barcodeNumber: string;
  programName: string;
  subsidyAmount: number;      // Nilai rupiah subsidi
  validUntil: string;
  redeemLocations: string[];  // misal: ["Pasar Gede", "Pasar Klewer", "Koperasi Solo"]
  isRedeemed: boolean;
  redeemedAt?: string;
}

export interface FieldVisitMetadata {
  officerName: string;
  officerNIP?: string;
  officerBadge: string;
  scheduledDate: string;
  scheduledTimeWindow: string; // misal: "09.00 - 11.00 WIB"
  purpose: string;
  isCompleted: boolean;
}

export interface CivicTicketMetadata {
  ticketNumber: string;
  category: string;
  priority: "rendah" | "sedang" | "tinggi" | "kritis";
  officialResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface CivicFulfillmentData {
  outputMode: CivicOutputMode;
  digitalCertificate?: DigitalCertificateMetadata;
  emergencyDispatch?: EmergencyDispatchMetadata;
  subsidyVoucher?: SubsidyVoucherMetadata;
  fieldVisit?: FieldVisitMetadata;
  civicTicket?: CivicTicketMetadata;
  processedBy?: {
    uid: string;
    name: string;
    role: string;
  };
  processedAt?: string;
}

export interface CivicServiceDefinition {
  id: string;
  name: string;
  shortName: string;
  agencyId: string;
  agencyName: string;
  outputMode: CivicOutputMode;
  slaMinutes: number;
  feeLabel: string;
  price: number;
  description: string;
  requiresDeliveryAddress: boolean;
  requiresAttachments: boolean;
  isEmergency: boolean;
}
