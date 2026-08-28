import { onCall, HttpsError } from "firebase-functions/v2/https";
import { BizEngine, PriceParams } from "../lib/bizengine";
import { db } from "../lib/admin";

export const calculateFinalPrice = onCall(
  { region: "asia-southeast1", cors: true },
  async (request) => {
    // 1. Authenticate Request
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anda harus login untuk menghitung harga.");
    }

    // 2. Parse Params
    const { serviceType, distanceKm, weightKg, promoCode, timeOfDay } = request.data as PriceParams;

    if (!serviceType || distanceKm === undefined) {
      throw new HttpsError("invalid-argument", "serviceType dan distanceKm wajib diisi.");
    }

    // 3. (Opsional) Validasi Promo Code ke Firestore jika ada
    let validDiscount = 0;
    if (promoCode) {
      const promoSnap = await db.collection("promos").where("code", "==", promoCode).where("isActive", "==", true).get();
      if (!promoSnap.empty) {
        const promoData = promoSnap.docs[0].data();
        if (promoData.validFor.includes(serviceType)) {
          // Simplifikasi: flat discount. Untuk percentage perlu logic lebih kompleks
          validDiscount = promoData.discountValue || 0;
        }
      }
    }

    // 4. Hitung menggunakan BizEngine
    const result = await BizEngine.calculatePrice({
      serviceType,
      distanceKm,
      weightKg,
      timeOfDay: timeOfDay || new Date().toISOString(),
      userId: request.auth.uid,
    });

    // Terapkan diskon yang tervalidasi server
    if (validDiscount > 0) {
      result.discountAmount = validDiscount;
      result.finalPrice = Math.max(result.basePrice * result.breakdown.surge - validDiscount, 10000); // min fare hardcoded fallback
      result.driverTakeHome = result.finalPrice;
    }

    return result;
  }
);
