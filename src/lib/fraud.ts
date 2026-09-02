/**
 * Anti-Fraud & GPS Spoofing Detection Engine for Ride-Solo Surakarta
 * Protects driver earnings, prevents fake location spoofing, and validates cashout security.
 */

import { calculateDistanceKm } from "./geo";

export interface GpsCheckResult {
  isSpoofed: boolean;
  reason?: "excessive_speed" | "impossible_teleport" | "zero_accuracy" | "out_of_bounds";
  velocityKmh?: number;
  deltaDistanceKm?: number;
  timeDeltaSeconds?: number;
}

export interface LocationPing {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

// Maximum realistic motorcycle courier speed in Surakarta city traffic (120 km/h)
const MAX_URBAN_VELOCITY_KMH = 120;
// Maximum instant teleport jump distance allowed within 2 seconds (0.4 km)
const MAX_INSTANT_TELEPORT_KM = 0.4;

/**
 * Validates consecutive GPS pings against physical velocity and spoofing invariants.
 */
export function detectGpsSpoofing(
  currentPing: LocationPing,
  previousPing?: LocationPing | null
): GpsCheckResult {
  // 1. Basic sanity check on coordinates
  if (isNaN(currentPing.lat) || isNaN(currentPing.lng)) {
    return { isSpoofed: true, reason: "out_of_bounds" };
  }

  // 2. Suspicious artificial mock accuracy check (e.g. constant 0.000m)
  if (currentPing.accuracy !== undefined && currentPing.accuracy === 0) {
    return { isSpoofed: true, reason: "zero_accuracy" };
  }

  if (!previousPing) {
    return { isSpoofed: false };
  }

  const timeDeltaMs = currentPing.timestamp - previousPing.timestamp;
  if (timeDeltaMs <= 0) {
    return { isSpoofed: false };
  }

  const timeDeltaSeconds = timeDeltaMs / 1000;
  const deltaDistanceKm = calculateDistanceKm(
    previousPing.lat,
    previousPing.lng,
    currentPing.lat,
    currentPing.lng
  );

  // 3. Instant teleport jump check (e.g. mock location switcher jumping across town in 2 seconds)
  if (timeDeltaSeconds < 3 && deltaDistanceKm > MAX_INSTANT_TELEPORT_KM) {
    return {
      isSpoofed: true,
      reason: "impossible_teleport",
      deltaDistanceKm,
      timeDeltaSeconds,
    };
  }

  // 4. Urban velocity check (Speed = Distance / Time * 3600)
  const velocityKmh = (deltaDistanceKm / timeDeltaSeconds) * 3600;

  if (velocityKmh > MAX_URBAN_VELOCITY_KMH) {
    return {
      isSpoofed: true,
      reason: "excessive_speed",
      velocityKmh: Math.round(velocityKmh),
      deltaDistanceKm,
      timeDeltaSeconds,
    };
  }

  return {
    isSpoofed: false,
    velocityKmh: Math.round(velocityKmh),
    deltaDistanceKm,
    timeDeltaSeconds,
  };
}

/**
 * Validates driver cashout / withdrawal security tokens before executing payout.
 */
export function verifyCashoutSecurity(
  amount: number,
  pin: string,
  selfieVerified: boolean
): { isValid: boolean; errorMessage?: string } {
  if (amount < 10000) {
    return { isValid: false, errorMessage: "Minimal penarikan saldo adalah Rp 10.000" };
  }

  if (!pin || pin.length < 4) {
    return { isValid: false, errorMessage: "PIN keamanan minimal 4 digit" };
  }

  if (!selfieVerified) {
    return { isValid: false, errorMessage: "Verifikasi liveness selfie wajah wajib dilakukan" };
  }

  return { isValid: true };
}
