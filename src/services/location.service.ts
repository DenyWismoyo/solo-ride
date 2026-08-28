import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";

export const locationService = {
  updateDriverLocation: async (
    driverId: string,
    location: { lat: number; lng: number },
    isOnline: boolean = true,
    currentOrderId?: string | null
  ): Promise<void> => {
    try {
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
      throw new Error(`Gagal memperbarui lokasi GPS driver: ${err}`);
    }
  }
};
