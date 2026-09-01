import { Timestamp } from "firebase-admin/firestore";

export const COLLECTIONS = {
  USERS: "users",
  ORDERS: "orders",
  DRIVERS: "drivers",
  KARCIS: "karcis",
  MERCHANTS: "merchants",
  FORUM: "forum",
  WALLETS: "wallets",
  LEDGER: "ledger",
  MENU_ITEMS: "menu_items",
  NOTIFICATIONS: "notifications",
  BROADCASTS: "broadcasts",
  CONTRACTS: "contracts",
  REVIEWS: "reviews",
  STAMPS: "stamps",
  KYC_REQUESTS: "kyc_requests",
} as const;

export function maskPhone(phone?: string | null): string {
  if (!phone || phone.length < 8) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-3);
}

export function maskNIK(nik?: string | null): string {
  if (!nik || nik.length < 8) return "***";
  return nik.slice(0, 4) + "****" + nik.slice(-4);
}

export function maskName(name?: string | null): string {
  if (!name) return "Warga Anonim";
  const parts = name.trim().split(" ");
  return parts
    .map((part) => (part.length > 2 ? part.slice(0, 2) + "***" : part + "*"))
    .join(" ");
}

export function maskEmail(email?: string | null): string {
  if (!email) return "***";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return (local.length > 2 ? local.slice(0, 2) : local) + "***@" + domain;
}

export function formatTimestamp(ts: any): string {
  if (!ts) return "N/A";
  if (ts instanceof Timestamp) {
    return ts.toDate().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  }
  if (ts._seconds) {
    return new Date(ts._seconds * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  }
  if (ts instanceof Date) {
    return ts.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  }
  return String(ts);
}

export const EMERGENCY_SERVICES = [
  "damkar_kebakaran",
  "damkar_rescue",
  "bpbd_banjir",
  "bpbd_evakuasi",
  "satpolpp_darurat",
  "dinkes_ambulans"
];

export function isEmergency(serviceType?: string): boolean {
  if (!serviceType) return false;
  return EMERGENCY_SERVICES.some((es) => serviceType.toLowerCase().includes(es) || serviceType.toLowerCase().includes("damkar") || serviceType.toLowerCase().includes("bpbd"));
}
