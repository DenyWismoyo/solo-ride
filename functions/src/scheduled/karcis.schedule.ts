import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../lib/admin";
import { BizEngine } from "../lib/bizengine";

interface DriverDailyLedger {
  date: string;            // "2026-08-28"
  driverId: string;
  onlineMinutes: number;   // Total menit online hari ini
  karcisAmount: number;    // Karcis yang dibebankan (0 jika gratis)
  karcisStatus: "gratis" | "diskon50" | "penuh" | "tidak_online";
  tripCount: number;       // Jumlah trip selesai
  grossRevenue: number;    // Total pendapatan kotor hari ini
  netRevenue: number;      // Gross - karcis
  points: number;          // Poin yang didapat hari ini
}

export const resetDailyKarcis = onSchedule(
  { schedule: "0 17 * * *", timeZone: "UTC", region: "asia-southeast1" },
  async () => {
    const bizConfig = await BizEngine.getBizConfig();
    const FULL_KARCIS_AMOUNT = bizConfig.KARCIS_HARIAN || 15000;
    
    // 17:00 UTC = 00:00 WIB
    const now = new Date();
    // Yesterday's date in local WIB (UTC+7)
    const yesterday = new Date(now.getTime() - 86400000 + (7 * 3600000));
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Ambil semua driver yang memiliki ledger hari kemarin
    const snap = await db.collection("driverLedger")
      .where("date", "==", yesterdayStr)
      .get();

    if (snap.empty) {
      console.log(`Tidak ada data driverLedger untuk tanggal ${yesterdayStr}.`);
      return;
    }

    const batch = db.batch();
    
    snap.forEach((doc) => {
      const data = doc.data() as DriverDailyLedger;
      let karcisAmount = FULL_KARCIS_AMOUNT;
      let karcisStatus: string = "penuh";

      // Logika pemotongan karcis berdasarkan menit online
      if (data.onlineMinutes === 0) {
        karcisAmount = 0;
        karcisStatus = "tidak_online";
      } else if (data.onlineMinutes >= 360) {
        // >= 6 jam -> Gratis
        karcisAmount = 0;
        karcisStatus = "gratis";
      } else if (data.onlineMinutes >= 240) {
        // >= 4 jam -> Diskon 50%
        karcisAmount = FULL_KARCIS_AMOUNT / 2;
        karcisStatus = "diskon50";
      }

      // 1. Update ledger kemarin dengan karcis final
      batch.update(doc.ref, { 
        karcisAmount, 
        karcisStatus,
        netRevenue: data.grossRevenue - karcisAmount,
        updatedAt: FieldValue.serverTimestamp()
      });

      // 2. Potong dari dompet driver jika karcisAmount > 0
      if (karcisAmount > 0) {
        const walletRef = db.collection("driverWallet").doc(data.driverId);
        batch.set(walletRef, {
          balance: FieldValue.increment(-karcisAmount),
          totalKarcis: FieldValue.increment(karcisAmount),
          lastKarcisDeduction: karcisAmount,
          lastKarcisDate: yesterdayStr,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      } else if (karcisStatus === "gratis") {
        // Catat sebagai karcis gratis (reward)
        const walletRef = db.collection("driverWallet").doc(data.driverId);
        batch.set(walletRef, {
          totalKarcisGratis: FieldValue.increment(FULL_KARCIS_AMOUNT),
          lastKarcisDate: yesterdayStr,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }
    });

    await batch.commit();
    console.log(`Karcis harian untuk ${snap.size} driver pada tanggal ${yesterdayStr} berhasil diproses.`);
  }
);
