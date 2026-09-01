import { Timestamp } from "firebase/firestore";

export type KarcisStatus = "gratis" | "diskon50" | "penuh" | "tidak_online";

export interface DriverDailyLedger {
  id?: string;
  date: string;            // Format YYYY-MM-DD
  driverId: string;
  onlineMinutes: number;   // Total menit online hari ini
  karcisAmount: number;    // Karcis yang dibebankan (0 jika gratis)
  karcisStatus: KarcisStatus;
  tripCount: number;       // Jumlah trip selesai
  grossRevenue: number;    // Total pendapatan kotor hari ini
  netRevenue: number;      // Gross - karcis
  points: number;          // Poin yang didapat hari ini
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;
}

export interface DriverWalletDocument {
  id?: string;
  driverId: string;
  balance: number;           // Saldo saat ini (bisa negatif = hutang karcis)
  totalEarned: number;       // Total pendapatan sepanjang karir
  totalKarcis: number;       // Total karcis yang pernah dibayar
  totalKarcisGratis: number; // Total karcis yang didapat gratis (reward rajin)
  pendingWithdrawal: number; // Penarikan yang sedang diproses
  lastWithdrawalAt: Timestamp | Date | any | null;
  lastKarcisDeduction?: number;
  lastKarcisDate?: string;
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;
}

export interface WalletTransaction {
  id?: string;
  driverId: string;
  type: "karcis_deduction" | "withdrawal" | "shu_bonus" | "adjustment";
  amount: number; // Positif untuk pemasukan (SHU), negatif untuk pengeluaran (karcis, tarik tunai)
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: Timestamp | Date | any;
}
