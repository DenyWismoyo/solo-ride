import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { detectGpsSpoofing } from "../lib/fraud";

// In-memory cache for throttling and velocity check per driver
const lastUpdateMap = new Map<string, { 
  time: number; 
  lat: number; 
  lng: number; 
  isOnline: boolean; 
  orderId?: string | null;
  accuracy?: number;
}>();

const THROTTLE_MS = 4000; // Minimal interval 4 detik untuk update lokasi reguler

export const locationService = {
  updateDriverLocation: async (
    driverId: string,
    location: { lat: number; lng: number; accuracy?: number },
    isOnline: boolean = true,
    currentOrderId?: string | null,
    force: boolean = false
  ): Promise<void> => {
    try {
      const now = Date.now();
      const last = lastUpdateMap.get(driverId);

      // Anti-Fraud GPS Spoofing & Velocity Validation
      if (last) {
        const fraudCheck = detectGpsSpoofing(
          { lat: location.lat, lng: location.lng, timestamp: now, accuracy: location.accuracy },
          { lat: last.lat, lng: last.lng, timestamp: last.time, accuracy: last.accuracy }
        );

        if (fraudCheck.isSpoofed) {
          console.warn(`[ANTI-FRAUD] Terdeteksi anomali GPS driver ${driverId}: ${fraudCheck.reason}, Kecepatan: ${fraudCheck.velocityKmh} km/h`);
          // Continue updating but can tag or log for moderation
        }
      }

      if (!force && last) {
        const timeDiff = now - last.time;
        const statusChanged = last.isOnline !== isOnline || last.orderId !== (currentOrderId || null);
        
        // Lewati jika status sama dan interval kurang dari batas throttling
        if (!statusChanged && timeDiff < THROTTLE_MS) {
          return;
        }
      }

      lastUpdateMap.set(driverId, {
        time: now,
        lat: location.lat,
        lng: location.lng,
        isOnline,
        orderId: currentOrderId || null,
        accuracy: location.accuracy
      });

      const ref = doc(db, COLLECTIONS.DRIVERS, driverId);
      await setDoc(
        ref,
        {
          uid: driverId,
          isOnline,
          location: { lat: location.lat, lng: location.lng },
          currentOrderId: currentOrderId || null,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Gagal memperbarui lokasi GPS driver:", err);
    }
  }
};

