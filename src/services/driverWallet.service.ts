import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, increment, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DriverWalletDocument, WalletTransaction } from "@/types/wallet.types";

export const driverWalletService = {
  getWallet: async (driverId: string): Promise<DriverWalletDocument> => {
    try {
      const ref = doc(db, "driverWallet", driverId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DriverWalletDocument;
      }
      
      const newWallet: DriverWalletDocument = {
        driverId,
        balance: 0,
        totalEarned: 0,
        totalKarcis: 0,
        totalKarcisGratis: 0,
        pendingWithdrawal: 0,
        lastWithdrawalAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(ref, newWallet);
      return { id: driverId, ...newWallet };
    } catch (err: any) {
      throw new Error(`Gagal mengambil dompet: ${err.message}`);
    }
  },

  getTransactions: async (driverId: string): Promise<WalletTransaction[]> => {
    try {
      const q = query(
        collection(db, "walletTransactions"),
        where("driverId", "==", driverId)
      );
      const snap = await getDocs(q);
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletTransaction));
      // Sort desc client-side
      return txs.sort((a, b) => {
        const da = a.createdAt?.toMillis?.() || 0;
        const db = b.createdAt?.toMillis?.() || 0;
        return db - da;
      });
    } catch (err: any) {
      console.error("Gagal getTransactions:", err);
      return [];
    }
  },

  simulateManualKarcisDeduction: async (driverId: string, amount: number, dateStr: string): Promise<void> => {
    try {
      await runTransaction(db, async (t) => {
        const walletRef = doc(db, "driverWallet", driverId);
        const walletSnap = await t.get(walletRef);
        if (!walletSnap.exists()) throw new Error("Wallet not found");
        
        t.update(walletRef, {
          balance: increment(-amount),
          totalKarcis: increment(amount),
          lastKarcisDeduction: amount,
          lastKarcisDate: dateStr,
          updatedAt: serverTimestamp()
        });

        const txRef = doc(collection(db, "walletTransactions"));
        t.set(txRef, {
          driverId,
          type: "karcis_deduction",
          amount: -amount,
          description: `Potongan Karcis Harian (${dateStr})`,
          date: dateStr,
          createdAt: serverTimestamp()
        });
      });
    } catch (err: any) {
      throw new Error(`Gagal memotong karcis: ${err.message}`);
    }
  }
};
