import { SLAConfig } from "@/types/audit.types";

// SLA per kategori dinas (dalam JAM):
export const DINAS_SLA_CONFIG: Record<string, SLAConfig> = {
  // Emergency — sangat ketat
  gov_damkar: { pendingVerificationHours: 0, pendingHours: 0.08, inProgressHours: 1 }, // 5 menit
  gov_bpbd:   { pendingVerificationHours: 0, pendingHours: 0.17, inProgressHours: 2 }, // 10 menit

  // Layanan rutin cepat
  gov_dinkes:     { pendingVerificationHours: 4,  pendingHours: 2,  inProgressHours: 3 },
  gov_dukcapil:   { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },
  gov_disdik:     { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },
  gov_dispusip:   { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },
  gov_disnaker:   { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },

  // Bantuan sosial
  gov_dinsos: { pendingVerificationHours: 48, pendingHours: 8, inProgressHours: 24 },

  // Pengaduan/Laporan
  gov_diskominfo: { pendingVerificationHours: 24, pendingHours: 0, inProgressHours: 24 }, // SLA 1x24 jam
  gov_dishub:     { pendingVerificationHours: 48, pendingHours: 4, inProgressHours: 8 },
  gov_dlh:        { pendingVerificationHours: 48, pendingHours: 4, inProgressHours: 8 },
  gov_satpolpp:   { pendingVerificationHours: 72, pendingHours: 0, inProgressHours: 48 },

  // Privasi-First
  gov_dp3a: { pendingVerificationHours: 24, pendingHours: 4, inProgressHours: 24 },

  // Pajak & Legalitas
  gov_bapenda:  { pendingVerificationHours: 72, pendingHours: 8, inProgressHours: 24 },
  gov_diskop:   { pendingVerificationHours: 72, pendingHours: 8, inProgressHours: 24 },
  gov_dpmptsp:  { pendingVerificationHours: 72, pendingHours: 8, inProgressHours: 24 },

  // Booking/Reservasi
  gov_dispar:    { pendingVerificationHours: 48, pendingHours: 4, inProgressHours: 4 },
  gov_dispertan: { pendingVerificationHours: 48, pendingHours: 8, inProgressHours: 4 },
};

// Default SLA jika dinas tidak terdaftar:
export const DEFAULT_SLA: SLAConfig = {
  pendingVerificationHours: 48,
  pendingHours: 8,
  inProgressHours: 24
};

export const getSLAConfig = (additionalRole?: string): SLAConfig =>
  (additionalRole ? DINAS_SLA_CONFIG[additionalRole] : null) || DEFAULT_SLA;

export type SLAStatus = "on_track" | "warning" | "overdue";

// Helper: hitung SLA status berdasarkan jam elapsed
export const getSLAStatus = (
  elapsedHours: number,
  slaHours: number
): SLAStatus => {
  if (elapsedHours >= slaHours) return "overdue";
  if (elapsedHours >= slaHours * 0.75) return "warning"; // 75% SLA terlewat
  return "on_track";
};
