import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { ServiceType } from "../lib/bizengine";

interface PromoDocument {
  id?: string;
  code: string;
  type: "percentage" | "flat";
  discountValue: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  validFor: ServiceType[];
  merchantId?: string;
  validFrom: FirebaseFirestore.Timestamp;
  validUntil: FirebaseFirestore.Timestamp;
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  fundedBy: "platform" | "merchant" | "koperasi" | "industry";
  isActive: boolean;
  createdBy: string;
}

export const validatePromoCode = onCall(
  { region: "asia-southeast1", cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anda harus login untuk menggunakan promo.");
    }

    const { code, serviceType, orderAmount, merchantId } = request.data as {
      code: string;
      serviceType: ServiceType;
      orderAmount: number;
      merchantId?: string;
    };

    if (!code || !serviceType || orderAmount === undefined) {
      throw new HttpsError("invalid-argument", "code, serviceType, dan orderAmount wajib diisi.");
    }

    // 1. Cari promo di Firestore
    const snap = await db.collection("promos")
      .where("code", "==", code.toUpperCase())
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snap.empty) {
      throw new HttpsError("not-found", "Kode promo tidak ditemukan atau tidak aktif.");
    }

    const promoId = snap.docs[0].id;
    const promo = snap.docs[0].data() as PromoDocument;
    const now = new Date();

    // 2. Validasi waktu
    if (promo.validFrom.toDate() > now || promo.validUntil.toDate() < now) {
      throw new HttpsError("failed-precondition", "Promo sudah kedaluwarsa atau belum aktif.");
    }

    // 3. Validasi service type
    if (!promo.validFor.includes(serviceType)) {
      throw new HttpsError("failed-precondition", "Promo tidak berlaku untuk layanan ini.");
    }

    // 4. Validasi merchant (jika promo spesifik merchant)
    if (promo.merchantId && promo.merchantId !== merchantId) {
      throw new HttpsError("failed-precondition", "Promo ini tidak berlaku untuk merchant ini.");
    }

    // 5. Validasi minimum order
    if (orderAmount < promo.minOrderAmount) {
      throw new HttpsError("failed-precondition", `Minimum order Rp ${promo.minOrderAmount.toLocaleString("id-ID")}.`);
    }

    // 6. Cek batas penggunaan total
    if (promo.usageCount >= promo.usageLimit) {
      throw new HttpsError("resource-exhausted", "Kuota promo sudah habis.");
    }

    // 7. Cek batas penggunaan per user
    const userUsageSnap = await db
      .collection("promos").doc(promoId)
      .collection("usage").doc(request.auth.uid).get();

    if (userUsageSnap.exists && (userUsageSnap.data()?.count || 0) >= promo.perUserLimit) {
      throw new HttpsError("already-exists", "Anda sudah mencapai batas penggunaan promo ini.");
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
  }
);
