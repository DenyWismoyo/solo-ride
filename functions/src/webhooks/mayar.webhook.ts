import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { FieldValue } from "firebase-admin/firestore";
import * as crypto from "crypto";
import { db } from "../lib/admin";

const mayarWebhookSecret = defineSecret("MAYAR_WEBHOOK_SECRET");

// ============================================================================
// MAYAR WEBHOOK (MENANGKAP NOTIFIKASI SUCCESS & TOP-UP SALDO)
// ============================================================================
export const mayarWebhookHandler = onRequest(
  {
    region: "asia-southeast1",
    cors: true,
    secrets: [mayarWebhookSecret],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // --- Webhook Forwarder (Multiplexer) ---
    // Karena Mayar hanya mendukung 1 Webhook URL, kita forward payload ini ke aplikasi lain Anda
    const TARGET_WEBHOOK_URL = "https://asia-southeast2-teknopark-surakarta.cloudfunctions.net/mayarWebhook";
    
    // Kita jalankan secara async (fire-and-forget) agar tidak memblokir proses Ojek Lokal
    fetch(TARGET_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mayar-signature': req.headers['x-mayar-signature'] as string || '',
        'x-webhook-signature': req.headers['x-webhook-signature'] as string || ''
      },
      body: req.rawBody.toString('utf8') // Mengirimkan rawBody agar signature di server sebelah tetap valid
    }).catch(err => console.error("⚠️ [WEBHOOK FORWARDER] Gagal meneruskan ke aplikasi lain:", err));

    // --- Webhook Signature Verification (HMAC) untuk Ojek Lokal ---
    const secret = mayarWebhookSecret.value();
    if (secret) {
      const signatureHeader = req.headers['x-mayar-signature'] || req.headers['x-webhook-signature'];
      if (!signatureHeader) {
        console.warn("⚠️ [WEBHOOK] Missing signature header. Proceeding without validation for now.");
      } else {
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(req.rawBody).digest('hex');
        if (signatureHeader !== digest) {
          console.error("❌ [WEBHOOK] Invalid signature detected.");
          res.status(401).send('Unauthorized');
          return;
        }
      }
    }
    
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch(e) {}
    }
    
    console.log("📥 [WEBHOOK MAYAR] Payload mentah:", JSON.stringify(payload));

    // Validasi Event Testing dari Mayar Dashboard
    if (payload.event === "testing" || payload.event === "ping") {
      res.status(200).send({ status: "success", message: "Webhook connection test successful" });
      return;
    }

    const mayarTx = payload.data ? payload.data : payload;
    
    let txDocRef: FirebaseFirestore.DocumentReference | null = null;
    let txData: any = null;

    let exactTxId = mayarTx.reference_id || mayarTx.referenceId || payload.reference_id;
    if (!exactTxId && typeof mayarTx.customField === 'string') exactTxId = mayarTx.customField;
    if (!exactTxId && typeof mayarTx.custom_field === 'string') exactTxId = mayarTx.custom_field;

    // STRATEGI 1: Pencocokan Akurat via Reference ID
    if (exactTxId && typeof exactTxId === 'string') {
      try {
        const docSnap = await db.collection("transactions").doc(exactTxId).get();
        if (docSnap.exists) {
          txDocRef = docSnap.ref;
          txData = docSnap.data();
        }
      } catch (e) {
        console.log(`⚠️ [WEBHOOK] Gagal mengambil dokumen by ID: ${exactTxId}`);
      }
    }

    // STRATEGI 2: Pencocokan ID Link Mayar
    if (!txDocRef) {
      const possibleMayarIds = [mayarTx.productId, mayarTx.id, payload.productId, mayarTx.paymentLinkId].filter(Boolean);
      for (const pId of possibleMayarIds) {
        try {
          const q = await db.collection("transactions").where("mayarTransactionId", "==", pId).limit(1).get();
          if (!q.empty) {
            txDocRef = q.docs[0].ref;
            txData = q.docs[0].data();
            break; 
          }
        } catch (e) {}
      }
    }

    if (!txDocRef || !txData) {
      res.status(400).send('Transaction Not Found');
      return;
    }

    const currentStatus = String(mayarTx.status || "").toUpperCase();
    const transactionStatus = String(mayarTx.transactionStatus || "").toUpperCase();
    const eventType = String(payload.event || "").toLowerCase();

    const isPaymentSuccess =
      ['SUCCESS', 'SETTLED', 'PAID', 'COMPLETED'].includes(currentStatus) ||
      ['PAID', 'SETTLED', 'SUCCESS'].includes(transactionStatus);

    const isSuccessEvent = !eventType || eventType.includes('success') || eventType.includes('paid') || eventType.includes('settled') || eventType.includes('completed');

    if (!isPaymentSuccess || !isSuccessEvent) {
      console.log(`[WEBHOOK] Event diabaikan. Status: ${currentStatus} / ${transactionStatus} | Event: ${eventType}`);
      res.status(200).send({ status: "ignored", message: "Non-payment event received" });
      return;
    }

    try {
      // =========================================================
      // ATOMIC TRANSACTION: Menambahkan Saldo Driver
      // =========================================================
      await db.runTransaction(async (trx) => {
        const freshTxSnap = await trx.get(txDocRef!);
        if (!freshTxSnap.exists) {
          throw new Error("Transaction document disappeared during processing");
        }

        const freshTxData = freshTxSnap.data()!;

        // ✅ IDEMPOTENCY GUARD #1: Cek apakah sudah PAID sebelumnya
        if (freshTxData.status === 'PAID') {
          console.log(`[WEBHOOK] Transaksi ${txDocRef!.id} sudah PAID sebelumnya. Webhook duplikat diabaikan.`);
          return; 
        }

        if (!freshTxData.userId || freshTxData.type !== 'top_up') {
          trx.update(txDocRef!, {
            status: "PAID",
            paidAt: FieldValue.serverTimestamp(),
            paymentMethod: mayarTx.paymentMethod || mayarTx.payment_method || "GATEWAY",
          });
          return;
        }

        const topUpAmount = freshTxData.amount;
        const driverId = freshTxData.userId;

        // Update status PAID di transaksi
        trx.update(txDocRef!, {
          status: "PAID",
          paidAt: FieldValue.serverTimestamp(),
          paymentMethod: mayarTx.paymentMethod || mayarTx.payment_method || "GATEWAY",
        });

        // Update Wallet Saldo Driver
        const walletRef = db.collection("wallets").doc(driverId);
        trx.set(walletRef, {
          userId: driverId,
          balance: FieldValue.increment(topUpAmount),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Tambah ke Ledger
        const ledgerRef = db.collection("ledger").doc();
        trx.set(ledgerRef, {
          userId: driverId,
          amount: topUpAmount,
          type: "top_up",
          description: `Top-Up Dompet via Mayar (Rp ${topUpAmount.toLocaleString("id-ID")})`,
          createdAt: FieldValue.serverTimestamp()
        });

        console.log(`[WEBHOOK] ✅ Saldo ditambahkan Rp ${topUpAmount} ke wallet user ${driverId}`);
      });

      res.status(200).send({ status: "success", message: "Webhook processed, balance updated." });
    } catch (error) {
      console.error("❌ [WEBHOOK EXECUTION ERROR]:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
