import { collection, addDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where, getDocs, increment, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { KarcisDocument, LedgerDocument, WalletDocument } from "../types/payment.types";

export const walletService = {
  // Check if driver has an active karcis
  getActiveKarcis: async (driverId: string): Promise<KarcisDocument | null> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.KARCIS),
        where("driverId", "==", driverId),
        where("status", "==", "active")
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data() as KarcisDocument;
        // Check if expired
        const now = new Date();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        if (expiresAt < now) {
          await updateDoc(doc(db, COLLECTIONS.KARCIS, docSnap.id), { status: "expired" });
          return null;
        }
        return { id: docSnap.id, ...data };
      }
      return null;
    } catch (err) {
      throw new Error(`Gagal mengambil status karcis: ${err}`);
    }
  },

  // Buy a Karcis Harian via Cloud Functions
  buyKarcis: async (driverId: string, isFreeTrial: boolean = false): Promise<string> => {
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../lib/firebase");
      const fn = httpsCallable(functions, "buyKarcis");
      
      const result = await fn({ isFreeTrial });
      return (result.data as any).karcisId;
    } catch (err: any) {
      throw new Error(err.message || `Gagal membeli karcis`);
    }
  },

  // Generate Top Up Payment Link via Cloud Functions
  topUpWallet: async (userId: string, amount: number, paymentDesc: string = "Top-Up Dompet QRIS Koperasi"): Promise<{ transactionId: string, paymentLink: string }> => {
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../lib/firebase");
      const fn = httpsCallable(functions, "generateTopUpPayment");
      
      // Ambil displayName/email dari currentUser
      const { getAuth } = await import("firebase/auth");
      const user = getAuth().currentUser;

      const result = await fn({ 
        amount, 
        userName: user?.displayName || "Mitra Koperasi", 
        userEmail: user?.email || "mitra@ridesolo.local" 
      });
      return result.data as { transactionId: string, paymentLink: string };
    } catch (err: any) {
      throw new Error(err.message || `Gagal mengisi saldo dompet`);
    }
  },

  // DEV ONLY: Direct Top-Up without Mayar Link
  devTopUpWallet: async (amount: number): Promise<void> => {
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../lib/firebase");
      const fn = httpsCallable(functions, "devTopUpWallet");
      
      await fn({ amount });
    } catch (err: any) {
      throw new Error(err.message || `Gagal auto top-up saldo`);
    }
  },
  
  // Get wallet balance
  getWalletBalance: async (userId: string): Promise<number> => {
    try {
      const walletRef = doc(db, COLLECTIONS.WALLETS, userId);
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        return (walletSnap.data() as WalletDocument).balance || 0;
      }
      return 0;
    } catch (err) {
      throw new Error(`Gagal mengambil saldo dompet: ${err}`);
    }
  }
};
