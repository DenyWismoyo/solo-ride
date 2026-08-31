import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { OrderDocument, ServiceType } from "../types/order.types";
import { calculateDistanceKm } from "../lib/geo";

export interface PendingOrderWithDistance extends OrderDocument {
  distanceToPickupKm?: number;
}

export function usePendingOrders(
  filterServiceTypes?: ServiceType[],
  driverLocation?: { lat: number; lng: number } | null,
  maxRadiusKm: number = 12
) {
  const [orders, setOrders] = useState<PendingOrderWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filterServiceTypesKey = JSON.stringify(filterServiceTypes || []);
  const driverLat = driverLocation?.lat;
  const driverLng = driverLocation?.lng;

  useEffect(() => {
    // Listen to orders that are available to claim (pending, cooking, or ready_for_pickup)
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("status", "in", ["pending", "cooking", "ready_for_pickup"])
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let pendingOrders: PendingOrderWithDistance[] = [];
        const parsedFilterTypes: ServiceType[] = filterServiceTypesKey 
          ? JSON.parse(filterServiceTypesKey) 
          : [];

        querySnapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() } as OrderDocument;
          // Only show orders that do not have an assigned driver yet
          if (!data.driverId) {
            let distanceToPickupKm: number | undefined = undefined;

            if (driverLat !== undefined && driverLng !== undefined && data.pickupLocation?.lat && data.pickupLocation?.lng) {
              distanceToPickupKm = calculateDistanceKm(
                driverLat,
                driverLng,
                data.pickupLocation.lat,
                data.pickupLocation.lng
              );
            }

            // Proximity Filter: If driver GPS is available, limit within max radius
            if (distanceToPickupKm !== undefined && maxRadiusKm > 0 && distanceToPickupKm > maxRadiusKm) {
              return; // Skip orders outside the hyperlocal radius
            }

            pendingOrders.push({
              ...data,
              distanceToPickupKm
            });
          }
        });

        // Filter service types if provided
        if (parsedFilterTypes && parsedFilterTypes.length > 0) {
          pendingOrders = pendingOrders.filter((o) =>
            o.serviceType ? parsedFilterTypes.includes(o.serviceType) : true
          );
        }

        // Sort descending by createdAt
        pendingOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setOrders(pendingOrders);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterServiceTypesKey, driverLat, driverLng, maxRadiusKm]);

  return { orders, loading, error };
}
