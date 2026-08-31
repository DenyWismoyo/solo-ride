import { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "driver" | "merchant" | "industry" | "government" | "admin";

export interface SavedAddress {
  id: string;
  label: "Rumah" | "Kantor" | "Kampus" | "Lainnya" | string;
  address: string;
  detail?: string;
  lat?: number;
  lng?: number;
  contactName?: string;
  contactPhone?: string;
  isDefault?: boolean;
}

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Timestamp | any;
  updatedAt?: Timestamp | any;
  
  // Specific role & Additional Role extensions
  additionalRole?: string; // e.g. "gov_dispar", "gov_dukcapil", "gov_dinsos", "ind_klinik", "ind_travel", "ind_kargo"
  sectorName?: string; // e.g. "Dinas Pariwisata Kota Surakarta"
  sectorCategory?: string; // e.g. "Pariwisata & Kebudayaan"
  
  points?: number; // Poin stamp komunitas (Customer / Driver)
  isVerified?: boolean; // Verifikasi KTP / SIM / Legalitas Usaha
  businessName?: string; // Merchant / Industry
  storeName?: string; // Merchant
  storeSlug?: string; // Merchant Custom Store URL
  institutionName?: string; // Government
  phone?: string;
  address?: string;
  savedAddresses?: SavedAddress[]; // Saved user addresses (Rumah, Kantor, Kampus, dll)
  companyName?: string; // Industry
  picName?: string; // Industry
  vehiclePlate?: string; // Driver
  vehicleModel?: string; // Driver
  location?: { lat: number; lng: number }; // Merchant store coordinate or Driver coordinate
}
