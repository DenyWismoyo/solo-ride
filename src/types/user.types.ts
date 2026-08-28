import { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "driver" | "merchant" | "industry" | "government" | "admin";

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Timestamp | any;
  
  // Specific role extensions
  points?: number; // Poin stamp komunitas (Customer / Driver)
  isVerified?: boolean; // Verifikasi KTP / SIM / Legalitas Usaha
  businessName?: string; // Merchant / Industry
  storeSlug?: string; // Merchant Custom Store URL
  institutionName?: string; // Government
  phone?: string;
  address?: string;
}
