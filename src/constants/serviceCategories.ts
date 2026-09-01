import { OrderDocument } from "@/types/order.types";

export type ServiceCategory =
  | "mobilitas"       // ride, car
  | "kuliner"         // food, mart
  | "pengiriman"      // send, titip
  | "layanan_publik"  // semua gov_*
  | "umkm_pasar"      // pasar
  | "industri";       // semua ind_*

export const getOrderCategory = (order: OrderDocument): ServiceCategory => {
  const type = order.serviceType || "";
  const role = (order as any).additionalRole || "";
  const targetRole = (order as any).targetRole || "";

  if (type.startsWith("gov_") || role.startsWith("gov_") || targetRole === "government")
    return "layanan_publik";
  if (role.startsWith("ind_") || targetRole === "industry")
    return "industri";
  if (["ride", "car"].includes(type)) return "mobilitas";
  if (["food", "mart"].includes(type)) return "kuliner";
  if (["send", "titip"].includes(type)) return "pengiriman";
  if (type === "pasar") return "umkm_pasar";
  return "mobilitas";
};

// Gunakan untuk order kategori layanan_publik
export const GOV_STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  pending_verification: {
    label: "Diverifikasi Dinas",
    color: "amber",
    desc: "Petugas dinas sedang memeriksa permohonan Anda"
  },
  pending: {
    label: "Mencari Kurir",
    color: "blue",
    desc: "Permohonan disetujui, mencari kurir mitra terdekat"
  },
  accepted: {
    label: "Kurir Bergerak",
    color: "teal",
    desc: "Kurir mitra menuju lokasi pengambilan dokumen"
  },
  in_progress: {
    label: "Sedang Diantar",
    color: "emerald",
    desc: "Kurir sedang melaksanakan layanan"
  },
  completed: {
    label: "Selesai",
    color: "emerald",
    desc: "Layanan berhasil diselesaikan"
  },
  rejected: {
    label: "Ditolak Dinas",
    color: "rose",
    desc: "Permohonan ditolak. Lihat detail untuk alasannya."
  },
  cancelled: {
    label: "Dibatalkan",
    color: "neutral",
    desc: "Permohonan dibatalkan"
  }
};
