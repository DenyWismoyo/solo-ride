"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devTopUpWallet = exports.generateTopUpPayment = exports.buyKarcis = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const firestore_1 = require("firebase-admin/firestore");
const admin_1 = require("../lib/admin");
const mayarApiKey = (0, params_1.defineSecret)("MAYAR_API_KEY");
// ============================================================================
// BUY KARCIS (Internal Wallet Deduction)
// ============================================================================
exports.buyKarcis = (0, https_1.onCall)({ region: "asia-southeast1", cors: true }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Akses ditolak.");
    const driverId = request.auth.uid;
    const { isFreeTrial } = request.data;
    const fee = isFreeTrial ? 0 : 5000;
    try {
        return await admin_1.db.runTransaction(async (transaction) => {
            var _a;
            // 1. Cek Saldo Dompet
            const walletRef = admin_1.db.collection("wallets").doc(driverId);
            const walletSnap = await transaction.get(walletRef);
            let currentBalance = 0;
            if (walletSnap.exists) {
                currentBalance = ((_a = walletSnap.data()) === null || _a === void 0 ? void 0 : _a.balance) || 0;
            }
            if (!isFreeTrial && currentBalance < fee) {
                throw new https_1.HttpsError("failed-precondition", "Saldo dompet koperasi tidak mencukupi untuk membeli Karcis Reguler (Rp 5.000). Silakan lakukan Top-up terlebih dahulu.");
            }
            // 2. Buat Data Karcis
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 jam dari sekarang
            const karcisRef = admin_1.db.collection("karcis").doc();
            transaction.set(karcisRef, {
                driverId,
                amount: fee,
                status: "active",
                isFreeTrial: !!isFreeTrial,
                purchasedAt: firestore_1.FieldValue.serverTimestamp(),
                expiresAt: expiresAt
            });
            // 3. Potong Saldo Dompet
            if (!isFreeTrial) {
                transaction.set(walletRef, {
                    userId: driverId,
                    balance: firestore_1.FieldValue.increment(-fee),
                    updatedAt: firestore_1.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            // 4. Catat di Ledger
            const ledgerRef = admin_1.db.collection("ledger").doc();
            transaction.set(ledgerRef, {
                userId: driverId,
                amount: -fee,
                type: "karcis_fee",
                description: isFreeTrial ? "Karcis Harian Gratis (Promo 24 Jam)" : "Pembelian Karcis Harian Flat (24 Jam)",
                createdAt: firestore_1.FieldValue.serverTimestamp()
            });
            return { success: true, karcisId: karcisRef.id };
        });
    }
    catch (err) {
        throw new https_1.HttpsError("internal", err.message || "Gagal memproses pembelian karcis.");
    }
});
// ============================================================================
// GENERATE TOP-UP PAYMENT LINK VIA MAYAR
// ============================================================================
exports.generateTopUpPayment = (0, https_1.onCall)({ region: "asia-southeast1", cors: true, secrets: [mayarApiKey] }, async (request) => {
    var _a, _b;
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Akses ditolak.");
    const userId = request.auth.uid;
    const { amount, userName, userEmail } = request.data;
    if (!amount || amount < 10000) {
        throw new https_1.HttpsError("invalid-argument", "Minimal top-up adalah Rp 10.000");
    }
    const txRef = admin_1.db.collection("transactions").doc();
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
                redirectUrl: `http://localhost:3000/driver?topup=success`,
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
        const paymentLink = ((_a = mayarData.data) === null || _a === void 0 ? void 0 : _a.link) || null;
        // Simpan status Pending di Firestore
        await txRef.set({
            transactionId: transactionId,
            userId: userId,
            userEmail: userEmail,
            userName: userName,
            amount: amount,
            type: "top_up",
            status: "PENDING",
            mayarTransactionId: ((_b = mayarData.data) === null || _b === void 0 ? void 0 : _b.id) || null,
            paymentLink: paymentLink,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { transactionId, paymentLink };
    }
    catch (error) {
        console.error("TopUp Payment Error:", error);
        throw new https_1.HttpsError("internal", error.message || "Gagal menghubungi Mayar");
    }
});
// ============================================================================
// DEV ONLY: AUTO TOP-UP WALLET (For testing phase)
// ============================================================================
exports.devTopUpWallet = (0, https_1.onCall)({ region: "asia-southeast1", cors: true }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Akses ditolak.");
    const userId = request.auth.uid;
    const { amount } = request.data;
    if (!amount) {
        throw new https_1.HttpsError("invalid-argument", "Amount dibutuhkan");
    }
    try {
        return await admin_1.db.runTransaction(async (transaction) => {
            const walletRef = admin_1.db.collection("wallets").doc(userId);
            transaction.set(walletRef, {
                userId: userId,
                balance: firestore_1.FieldValue.increment(amount),
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            }, { merge: true });
            const ledgerRef = admin_1.db.collection("ledger").doc();
            transaction.set(ledgerRef, {
                userId: userId,
                amount: amount,
                type: "top_up",
                description: "Top-Up Otomatis (Mode Development)",
                createdAt: firestore_1.FieldValue.serverTimestamp()
            });
            return { success: true, amountAdded: amount };
        });
    }
    catch (err) {
        throw new https_1.HttpsError("internal", err.message || "Gagal auto top-up.");
    }
});
//# sourceMappingURL=wallet.callable.js.map