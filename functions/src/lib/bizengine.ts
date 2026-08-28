import { db } from "./admin";

export type ServiceType = "ojek" | "mobil" | "kirim" | "kuliner" | "mart" | "titip" | "pasar";

export interface PriceParams {
  serviceType: ServiceType;
  distanceKm: number;
  weightKg?: number;
  promoCode?: string;
  userId?: string;
  timeOfDay?: string; // e.g. ISO string for surge pricing
  isFlashSale?: boolean;
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

// Default config as fallback
let cachedConfig: any = {
  ojek:   { base: 3000, perKm: 2500, min: 10000 },
  mobil:  { base: 5000, perKm: 4500, min: 15000 },
  kirim:  { base: 5000, perKm: 3000, min: 12000 },
  kuliner:{ base: 8000, perKm: 2000, min: 8000, flatRadius: 3 },
  mart:   { base: 8000, perKm: 2000, min: 8000, flatRadius: 3 },
  titip:  { base: 5000, perKm: 3000, min: 12000 },
  pasar:  { base: 8000, perKm: 2000, min: 8000, flatRadius: 3 },
  SURGE_CAP: 1.5
};

let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getBizConfig() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const snap = await db.collection("bizConfig").doc("pricing").get();
    if (snap.exists) {
      const data = snap.data()!;
      cachedConfig = {
        ojek:   { base: data.BASE_FARE_OJEK || 3000, perKm: data.RATE_PER_KM_OJEK || 2500, min: data.MIN_FARE_OJEK || 10000 },
        mobil:  { base: data.BASE_FARE_MOBIL || 5000, perKm: data.RATE_PER_KM_MOBIL || 4500, min: data.MIN_FARE_MOBIL || 15000 },
        kirim:  { base: data.BASE_FARE_KIRIM || 5000, perKm: data.RATE_PER_KM_KIRIM || 3000, min: data.MIN_FARE_KIRIM || 12000 },
        kuliner:{ base: data.BASE_FARE_KULINER || 8000, perKm: data.RATE_PER_KM_KULINER || 2000, min: data.MIN_FARE_KULINER || 8000, flatRadius: data.FLAT_RADIUS_KULINER || 3 },
        mart:   { base: data.BASE_FARE_MART || 8000, perKm: data.RATE_PER_KM_MART || 2000, min: data.MIN_FARE_MART || 8000, flatRadius: data.FLAT_RADIUS_MART || 3 },
        titip:  { base: data.BASE_FARE_TITIP || 5000, perKm: data.RATE_PER_KM_TITIP || 3000, min: data.MIN_FARE_TITIP || 12000 },
        pasar:  { base: data.BASE_FARE_PASAR || 8000, perKm: data.RATE_PER_KM_PASAR || 2000, min: data.MIN_FARE_PASAR || 8000, flatRadius: data.FLAT_RADIUS_PASAR || 3 },
        SURGE_CAP: data.SURGE_CAP || 1.5,
        KARCIS_HARIAN: data.KARCIS_HARIAN || 15000,
      };
      lastFetchTime = now;
    }
  } catch (error) {
    console.error("Gagal load BizConfig dari Firestore", error);
  }
  return cachedConfig;
}

function calculateBaseFare(config: any, serviceType: ServiceType, distanceKm: number): number {
  const c = config[serviceType];
  if (!c) throw new Error(`Unknown serviceType: ${serviceType}`);

  if (serviceType === "kuliner" || serviceType === "mart" || serviceType === "pasar") {
    const extraKm = Math.max(0, distanceKm - (c.flatRadius || 3));
    return Math.max(c.base + extraKm * c.perKm, c.min);
  }

  return Math.max(c.base + distanceKm * c.perKm, c.min);
}

function calculateWeightSurcharge(weightKg?: number): number {
  if (!weightKg) return 0;
  if (weightKg <= 5)  return 0;
  if (weightKg <= 10) return 5000;
  if (weightKg <= 20) return 12000;
  return 12000 + (weightKg - 20) * 1000;
}

function getSurgeMultiplier(config: any, time?: string, isEvent: boolean = false): number {
  if (isEvent) return config.SURGE_CAP || 1.5;
  if (!time) return 1.0;
  
  const date = new Date(time);
  // Using simple timezone conversion (UTC to WIB if possible, but keep simple)
  // Assuming the 'time' passed is in local ISO format or Date converts correctly.
  const hour = date.getHours();
  
  let multiplier = 1.0;
  if (hour >= 0  && hour < 5)  multiplier = 1.3;
  if (hour >= 17 && hour < 20) multiplier = 1.2;
  if (hour >= 20 && hour < 24) multiplier = 1.1;
  
  return Math.min(multiplier, config.SURGE_CAP || 1.5);
}

export const BizEngine = {
  getBizConfig,
  calculatePrice: async (params: PriceParams): Promise<PriceResult> => {
    const config = await getBizConfig();
    
    let base = calculateBaseFare(config, params.serviceType, params.distanceKm);
    
    if (params.serviceType === "kirim" || params.serviceType === "titip") {
      base += calculateWeightSurcharge(params.weightKg);
    }
    
    const surge = getSurgeMultiplier(config, params.timeOfDay, false);
    
    // For now, no dynamic discount lookup, placeholder for 0
    // Dynamic lookup will be done via validatePromoCode separately
    const discount = 0; 
    
    const rawPrice = (base * surge) - discount;
    const minFare = config[params.serviceType]?.min || 10000;
    const finalPrice = Math.max(rawPrice, minFare);

    return {
      basePrice: base,
      discountAmount: discount,
      finalPrice: finalPrice,
      driverTakeHome: finalPrice, // Zero Commission: Driver gets 100% of final price
      platformFee: 0, // Platform earns from Karcis Harian
      breakdown: { base, surge, discount }
    };
  }
};
