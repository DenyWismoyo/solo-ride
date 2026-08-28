import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// Type definitions matching the server's PriceParams and PriceResult
export type ServiceType = "ojek" | "mobil" | "kirim" | "kuliner" | "mart" | "titip" | "pasar";

export interface PriceParams {
  serviceType: ServiceType;
  distanceKm: number;
  weightKg?: number;
  promoCode?: string;
  timeOfDay?: string;
}

export interface PriceResult {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  driverTakeHome: number;
  platformFee: number;
  breakdown: {
    base: number;
    surge: number;
    discount: number;
  };
}

export const functionsService = {
  calculateFinalPrice: async (params: PriceParams): Promise<PriceResult> => {
    try {
      const fn = httpsCallable<PriceParams, PriceResult>(functions, "calculateFinalPrice");
      const result = await fn(params);
      return result.data;
    } catch (error: any) {
      console.error("Functions Error [calculateFinalPrice]:", error.message);
      throw error;
    }
  },
};
