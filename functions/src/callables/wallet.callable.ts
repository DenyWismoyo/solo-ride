import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../lib/admin";

const mayarApiKey = defineSecret("MAYAR_API_KEY");

// ============================================================================
// BUY KARCIS (Internal Wallet Deduction)
// ============================================================================
export const buyKarcis = onCall(
  { region: "asia-southeast1", cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Akses ditolak.");
    const driverId = request.auth.uid;
    const { isFreeTrial } = request.data;
    const fee = isFreeTrial ? 0 : 5000;

    try {
      return await db.runTransaction(async (transaction) => {
        // 1. Cek Saldo Dompet
        const walletRef = db.collection("wallets").doc(driverId);
        const walletSnap = await transaction.get(walletRef);
        
        let currentBalance = 0;
        if (walletSnap.exists) {
          currentBalance = walletSnap.data()?.balance || 0;
        }

        if (!isFreeTrial && currentBalance < fee) {
          throw new HttpsError("failed-precondition", "Saldo dompet koperasi tidak mencukupi untuk membeli Karcis Reguler (Rp 5.000). Silakan lakukan Top-up terlebih dahulu.");
        }

        // 2. Buat Data Karcis
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 jam dari sekarang
        
        const karcisRef = db.collection("karcis").doc();
        transaction.set(karcisRef, {
          driverId,
          amount: fee,
          status: "active",
          isFreeTrial: !!isFreeTrial,
          purchasedAt: FieldValue.serverTimestamp(),
          expiresAt: expiresAt
        });

        // 3. Potong Saldo Dompet
        if (!isFreeTrial) {
          transaction.set(walletRef, {
            userId: driverId,
            balance: FieldValue.increment(-fee),
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });
        }

        // 4. Catat di Ledger
        const ledgerRef = db.collection("ledger").doc();
        transaction.set(ledgerRef, {
          userId: driverId,
          amount: -fee,
          type: "karcis_fee",
          description: isFreeTrial ? "Karcis Harian Gratis (Promo 24 Jam)" : "Pembelian Karcis Harian Flat (24 Jam)",
          createdAt: FieldValue.serverTimestamp()
        });

        return { success: true, karcisId: karcisRef.id };
      });
    } catch (err: any) {
      throw new HttpsError("internal", err.message || "Gagal memproses pembelian karcis.");
    }
  }
);

// ============================================================================
// GENERATE TOP-UP PAYMENT LINK VIA MAYAR
// ============================================================================
export const generateTopUpPayment = onCall(
  { region: "asia-southeast1", cors: true, secrets: [mayarApiKey] },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Akses ditolak.");
    const userId = request.auth.uid;
    const { amount, userName, userEmail } = request.data;
    
    if (!amount || amount < 10000) {
      throw new HttpsError("invalid-argument", "Minimal top-up adalah Rp 10.000");
    }

    const txRef = db.collection("transactions").doc();
    const transactionId = txRef.id;

    try {
      const response = await fetch("https://api.mayar.id/hl/v1/payment/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mayarApiKey.value()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName || "Mitra Koperasi",
          email: userEmail || "mitra@ridesolo.local",
          amount: amount,
          mobile: "089900000000",
          description: `Top-Up Saldo Dompet Koperasi`,
          redirectUrl: `http://localhost:3000/driver?topup=success`, // Nanti bisa ganti ke host production
          expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          customField: transactionId,
          custom_field: transactionId,
          reference_id: transactionId, 
          referenceId: transactionId 
        })
      });
      
      const mayarData = await response.json();
      if (!response.ok || mayarData.statusCode !== 200) {
        throw new Error(mayarData.message || "Gagal membuat payment link di Mayar");
      }

      const paymentLink = mayarData.data?.link || null;
      
      // Simpan status Pending di Firestore
      await txRef.set({
        transactionId: transactionId,
        userId: userId,
        userEmail: userEmail,
        userName: userName,
        amount: amount,
        type: "top_up",
        status: "PENDING",
        mayarTransactionId: mayarData.data?.id || null, 
        paymentLink: paymentLink,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { transactionId, paymentLink };
    } catch (error: any) {
      console.error("TopUp Payment Error:", error);
      throw new HttpsError("internal", error.message || "Gagal menghubungi Mayar");
    }
  }
);
