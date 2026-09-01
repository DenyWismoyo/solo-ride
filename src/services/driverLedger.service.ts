import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DriverDailyLedger, KarcisStatus } from "@/types/wallet.types";

export const driverLedgerService = {
  getTodayLedger: async (driverId: string, dateStr: string): Promise<DriverDailyLedger> => {
    try {
      const ledgerId = `${driverId}_${dateStr}`;
      const ref = doc(db, "driverLedger", ledgerId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DriverDailyLedger;
      }

      // Create new daily ledger if not exists
      const newLedger: DriverDailyLedger = {
        date: dateStr,
        driverId,
        onlineMinutes: 0,
        karcisAmount: 15000,
        karcisStatus: "penuh",
        tripCount: 0,
        grossRevenue: 0,
        netRevenue: 0,
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(ref, newLedger);
      return { id: ledgerId, ...newLedger };
    } catch (err: any) {
      throw new Error(`Gagal mengambil ledger harian: ${err.message}`);
    }
  },

  addOnlineMinutes: async (driverId: string, dateStr: string, minutes: number): Promise<DriverDailyLedger> => {
    try {
      const ledgerId = `${driverId}_${dateStr}`;
      const ref = doc(db, "driverLedger", ledgerId);
      const snap = await getDoc(ref);

      let currentOnlineMinutes = minutes;
      if (snap.exists()) {
        currentOnlineMinutes += snap.data().onlineMinutes || 0;
      }

      let karcisAmount = 15000;
      let karcisStatus: KarcisStatus = "penuh";
      
      if (currentOnlineMinutes === 0) {
        karcisAmount = 0;
        karcisStatus = "tidak_online";
      } else if (currentOnlineMinutes >= 360) {
        karcisAmount = 0;
        karcisStatus = "gratis";
      } else if (currentOnlineMinutes >= 240) {
        karcisAmount = 7500;
        karcisStatus = "diskon50";
      }

      if (!snap.exists()) {
         // Create
         const newLedger: DriverDailyLedger = {
           date: dateStr,
           driverId,
           onlineMinutes: currentOnlineMinutes,
           karcisAmount,
           karcisStatus,
           tripCount: 0,
           grossRevenue: 0,
           netRevenue: 0,
           points: 0,
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
         };
         await setDoc(ref, newLedger);
         return { id: ledgerId, ...newLedger };
      } else {
        await updateDoc(ref, {
          onlineMinutes: currentOnlineMinutes,
          karcisAmount,
          karcisStatus,
          updatedAt: serverTimestamp()
        });
        const updated = await getDoc(ref);
        return { id: updated.id, ...updated.data() } as DriverDailyLedger;
      }
    } catch (err: any) {
      throw new Error(`Gagal update menit online: ${err.message}`);
    }
  }
};
