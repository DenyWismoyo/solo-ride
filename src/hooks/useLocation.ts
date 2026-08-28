import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";

export interface DriverLocationData {
  uid: string;
  isOnline: boolean;
  location: {
    lat: number;
    lng: number;
  };
  currentOrderId?: string | null;
  lastUpdated?: any;
}

export function useDriverLocation(driverId?: string | null) {
  const [driverLocation, setDriverLocation] = useState<DriverLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!driverId) {
      setDriverLocation(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, COLLECTIONS.DRIVERS, driverId);
    const unsubscribe = onSnapshot(
      ref,
      (docSnap) => {
        if (docSnap.exists()) {
          setDriverLocation(docSnap.data() as DriverLocationData);
        } else {
          setDriverLocation(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [driverId]);

  return { driverLocation, loading, error };
}
