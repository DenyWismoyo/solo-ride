import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";

// In-memory cache for throttling GPS updates per driver
const lastUpdateMap = new Map<string, { 
  time: number; 
  lat: number; 
  lng: number; 
  isOnline: boolean; 
  orderId?: string | null 
}>();

const THROTTLE_MS = 4000; // Minimal interval 4 detik untuk update lokasi reguler

export const locationService = {
  updateDriverLocation: async (
    driverId: string,
    location: { lat: number; lng: number },
    isOnline: boolean = true,
    currentOrderId?: string | null,
    force: boolean = false
  ): Promise<void> => {
    try {
      const now = Date.now();
      const last = lastUpdateMap.get(driverId);

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
      });

      const ref = doc(db, COLLECTIONS.DRIVERS, driverId);
      await setDoc(
        ref,
        {
          uid: driverId,
          isOnline,
          location,
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
