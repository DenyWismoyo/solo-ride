import { Timestamp } from "firebase/firestore";

export type KarcisStatus = "active" | "expired" | "used";

export interface KarcisDocument {
  id?: string;
  driverId: string;
  amount: number;
  status: KarcisStatus;
  isFreeTrial: boolean;
  expiresAt: Timestamp | any; // Batas waktu online harian (misal: 24 jam setelah dibeli)
  purchasedAt: Timestamp | any;
}

// Dompet Koperasi Ledger System
export type LedgerTransactionType = "karcis_fee" | "top_up" | "payout" | "promo_credit";

export interface LedgerDocument {
  id?: string;
  userId: string; // Bisa driver / customer / merchant
  amount: number; // Positif untuk pemasukan, negatif untuk pengeluaran
  type: LedgerTransactionType;
  description: string;
  createdAt: Timestamp | any;
}

export interface WalletDocument {
  userId: string;
  balance: number;
  updatedAt: Timestamp | any;
}
