import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { OrderDocument, ServiceType } from "../types/order.types";

export function usePendingOrders(filterServiceTypes?: ServiceType[]) {
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let pendingOrders: OrderDocument[] = [];
        querySnapshot.forEach((docSnap) => {
          pendingOrders.push({ id: docSnap.id, ...docSnap.data() } as OrderDocument);
        });

        // Filter service types if provided
        if (filterServiceTypes && filterServiceTypes.length > 0) {
          pendingOrders = pendingOrders.filter((o) =>
            o.serviceType ? filterServiceTypes.includes(o.serviceType) : true
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
  }, [filterServiceTypes]);

  return { orders, loading, error };
}
