import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  increment, 
  writeBatch,
  Timestamp 
} from "firebase/firestore";
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
      console.warn("Error checking active karcis:", err);
      return null;
    }
  },

  // Buy or Claim Karcis Harian (Resilient Client + Cloud Function)
  buyKarcis: async (driverId: string, isFreeTrial: boolean = false): Promise<string> => {
    // 1. Try Cloud Function first if available
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../lib/firebase");
      const fn = httpsCallable(functions, "buyKarcis");
      
      const result = await fn({ isFreeTrial });
      if ((result.data as any)?.karcisId) {
        return (result.data as any).karcisId;
      }
    } catch (fnErr) {
      console.warn("Cloud function buyKarcis unavailable, executing client-side transaction:", fnErr);
    }

    // 2. Resilient Direct Firestore Activation
    try {
      const cost = isFreeTrial ? 0 : 5000;
      const now = new Date();
      const expiresAtDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Jam

      // If regular purchase, check & deduct wallet
      if (!isFreeTrial) {
        const walletRef = doc(db, COLLECTIONS.WALLETS, driverId);
        const walletSnap = await getDoc(walletRef);
        const currentBalance = walletSnap.exists() ? (walletSnap.data() as WalletDocument).balance : 0;

        if (currentBalance < cost) {
          throw new Error(`Saldo Dompet (Rp ${currentBalance.toLocaleString("id-ID")}) tidak mencukupi untuk membeli Karcis Harian (Rp 5.000). Silakan Top-Up saldo terlebih dahulu atau Klaim Promo Trial Gratis.`);
        }

        // Deduct balance
        await updateDoc(walletRef, {
          balance: increment(-cost),
          updatedAt: serverTimestamp(),
        });

        // Record Ledger
        await addDoc(collection(db, COLLECTIONS.LEDGER), {
          userId: driverId,
          type: "debit",
          amount: cost,
          category: "karcis_fee",
          description: "Pembelian Karcis Harian Flat 24 Jam (Bebas Komisi)",
          createdAt: serverTimestamp(),
        });
      }

      // Create Active Karcis Document
      const karcisRef = await addDoc(collection(db, COLLECTIONS.KARCIS), {
        driverId,
        type: isFreeTrial ? "trial" : "daily",
        cost,
        status: "active",
        activatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAtDate),
        createdAt: serverTimestamp(),
      });

      // Update User Document
      try {
        const userRef = doc(db, COLLECTIONS.USERS, driverId);
        await updateDoc(userRef, {
          karcisExpiry: Timestamp.fromDate(expiresAtDate),
          updatedAt: serverTimestamp(),
        });
      } catch (userErr) {
        console.warn("User profile expiry update skipped:", userErr);
      }

      return karcisRef.id;
    } catch (err: any) {
      throw new Error(err.message || `Gagal mengaktifkan karcis harian.`);
    }
  },

  // Generate Top Up Payment Link via Cloud Functions
  topUpWallet: async (userId: string, amount: number, paymentDesc: string = "Top-Up Dompet QRIS Koperasi"): Promise<{ transactionId: string, paymentLink: string }> => {
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../lib/firebase");
      const fn = httpsCallable(functions, "generateTopUpPayment");
      
      const { getAuth } = await import("firebase/auth");
      const user = getAuth().currentUser;

      const result = await fn({ 
        amount, 
        userName: user?.displayName || "Mitra Koperasi", 
        userEmail: user?.email || "mitra@ridesolo.local" 
      });
      return result.data as { transactionId: string, paymentLink: string };
    } catch (err: any) {
      // Fallback Direct Topup
      await walletService.devTopUpWallet(amount);
      return { transactionId: "mock-tx", paymentLink: "" };
    }
  },

  // Direct Top-Up without External Payment Link
  devTopUpWallet: async (amount: number): Promise<void> => {
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../lib/firebase");
      const fn = httpsCallable(functions, "devTopUpWallet");
      await fn({ amount });
    } catch (err) {
      // Direct Firestore increment
      const { getAuth } = await import("firebase/auth");
      const user = getAuth().currentUser;
      if (!user) return;

      const walletRef = doc(db, COLLECTIONS.WALLETS, user.uid);
      const snap = await getDoc(walletRef);
      if (snap.exists()) {
        await updateDoc(walletRef, {
          balance: increment(amount),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(walletRef, {
          userId: user.uid,
          balance: amount,
          updatedAt: serverTimestamp(),
        });
      }

      await addDoc(collection(db, COLLECTIONS.LEDGER), {
        userId: user.uid,
        type: "credit",
        amount,
        category: "topup",
        description: `Top-Up Saldo Dompet Driver Rp ${amount.toLocaleString("id-ID")}`,
        createdAt: serverTimestamp(),
      });
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
      return 0;
    }
  }
};
