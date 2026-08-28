"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePromoCode = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../lib/admin");
exports.validatePromoCode = (0, https_1.onCall)({ region: "asia-southeast1", cors: true }, async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Anda harus login untuk menggunakan promo.");
    }
    const { code, serviceType, orderAmount, merchantId } = request.data;
    if (!code || !serviceType || orderAmount === undefined) {
        throw new https_1.HttpsError("invalid-argument", "code, serviceType, dan orderAmount wajib diisi.");
    }
    // 1. Cari promo di Firestore
    const snap = await admin_1.db.collection("promos")
        .where("code", "==", code.toUpperCase())
        .where("isActive", "==", true)
        .limit(1)
        .get();
    if (snap.empty) {
        throw new https_1.HttpsError("not-found", "Kode promo tidak ditemukan atau tidak aktif.");
    }
    const promoId = snap.docs[0].id;
    const promo = snap.docs[0].data();
    const now = new Date();
    // 2. Validasi waktu
    if (promo.validFrom.toDate() > now || promo.validUntil.toDate() < now) {
        throw new https_1.HttpsError("failed-precondition", "Promo sudah kedaluwarsa atau belum aktif.");
    }
    // 3. Validasi service type
    if (!promo.validFor.includes(serviceType)) {
        throw new https_1.HttpsError("failed-precondition", "Promo tidak berlaku untuk layanan ini.");
    }
    // 4. Validasi merchant (jika promo spesifik merchant)
    if (promo.merchantId && promo.merchantId !== merchantId) {
        throw new https_1.HttpsError("failed-precondition", "Promo ini tidak berlaku untuk merchant ini.");
    }
    // 5. Validasi minimum order
    if (orderAmount < promo.minOrderAmount) {
        throw new https_1.HttpsError("failed-precondition", `Minimum order Rp ${promo.minOrderAmount.toLocaleString("id-ID")}.`);
    }
    // 6. Cek batas penggunaan total
    if (promo.usageCount >= promo.usageLimit) {
        throw new https_1.HttpsError("resource-exhausted", "Kuota promo sudah habis.");
    }
    // 7. Cek batas penggunaan per user
    const userUsageSnap = await admin_1.db
        .collection("promos").doc(promoId)
        .collection("usage").doc(request.auth.uid).get();
    if (userUsageSnap.exists && (((_a = userUsageSnap.data()) === null || _a === void 0 ? void 0 : _a.count) || 0) >= promo.perUserLimit) {
        throw new https_1.HttpsError("already-exists", "Anda sudah mencapai batas penggunaan promo ini.");
    }
    // 8. Hitung diskon efektif (Anti-Rugi)
    let discountAmount = promo.type === "percentage"
        ? orderAmount * promo.discountValue
        : promo.discountValue;
    // Pastikan tidak melebihi maxDiscountAmount
    discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);
    return {
        isValid: true,
        promoId,
        discountAmount: Math.round(discountAmount),
        promoName: promo.code,
        fundedBy: promo.fundedBy,
    };
});
//# sourceMappingURL=promo.callable.js.map