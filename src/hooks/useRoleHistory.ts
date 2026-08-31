import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, Query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument, OrderStatus, ServiceType } from "@/types/order.types";
import { UserRole } from "@/types/user.types";

export interface RoleHistoryStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  totalVolumeRp: number;
  todayOrdersCount: number;
  todayVolumeRp: number;
}

export function useRoleHistory(
  role: UserRole = "customer",
  userId?: string | null,
  additionalRole?: string | null,
  storeSlug?: string | null
) {
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isSubscribed = true;

    try {
      const ordersRef = collection(db, COLLECTIONS.ORDERS);
      let q: Query;

      // Strict role-scoped isolation
      if (role === "customer") {
        q = query(ordersRef, where("customerId", "==", userId));
      } else if (role === "driver") {
        q = query(ordersRef, where("driverId", "==", userId));
      } else if (role === "merchant") {
        // Merchants can match either userId, storeSlug, or sandbox IDs
        const merchantIdentifiers = [userId];
        if (storeSlug && !merchantIdentifiers.includes(storeSlug)) {
          merchantIdentifiers.push(storeSlug);
        }
        if (userId === "sandbox-merchant-manto" || storeSlug === "pak-manto") {
          if (!merchantIdentifiers.includes("sandbox-merchant-manto")) merchantIdentifiers.push("sandbox-merchant-manto");
          if (!merchantIdentifiers.includes("pak-manto")) merchantIdentifiers.push("pak-manto");
          if (!merchantIdentifiers.includes("m-1")) merchantIdentifiers.push("m-1");
        } else if (userId === "sandbox-merchant-pasar" || storeSlug === "pasar-gede-mbok-darmi") {
          if (!merchantIdentifiers.includes("sandbox-merchant-pasar")) merchantIdentifiers.push("sandbox-merchant-pasar");
          if (!merchantIdentifiers.includes("pasar-gede-mbok-darmi")) merchantIdentifiers.push("pasar-gede-mbok-darmi");
        }

        q = query(ordersRef, where("merchantId", "in", merchantIdentifiers.slice(0, 10)));
      } else if (role === "government") {
        const dinasId = additionalRole || "gov_dukcapil";
        q = query(ordersRef, where("additionalRole", "==", dinasId));
      } else if (role === "industry") {
        const sectorId = additionalRole || "ind_kargo";
        q = query(ordersRef, where("additionalRole", "==", sectorId));
      } else {
        // Admin or fallback
        q = query(ordersRef);
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isSubscribed) return;

          const fetched: OrderDocument[] = [];
          snapshot.forEach((doc) => {
            fetched.push({ id: doc.id, ...doc.data() } as OrderDocument);
          });

          // Sort chronologically desc (newest first)
          fetched.sort((a, b) => {
            const timeA = a.createdAt?.toMillis 
              ? a.createdAt.toMillis() 
              : a.createdAt?.seconds 
                ? a.createdAt.seconds * 1000 
                : a.createdAt instanceof Date 
                  ? a.createdAt.getTime() 
                  : 0;
            const timeB = b.createdAt?.toMillis 
              ? b.createdAt.toMillis() 
              : b.createdAt?.seconds 
                ? b.createdAt.seconds * 1000 
                : b.createdAt instanceof Date 
                  ? b.createdAt.getTime() 
                  : 0;
            return timeB - timeA;
          });

          setOrders(fetched);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching role history:", err);
          if (isSubscribed) {
            setError(err);
            setLoading(false);
          }
        }
      );

      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (e: any) {
      console.error("Query builder error in useRoleHistory:", e);
      setError(e);
      setLoading(false);
    }
  }, [role, userId, additionalRole, storeSlug]);

  // Compute summary statistics
  const stats: RoleHistoryStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let completedOrders = 0;
    let activeOrders = 0;
    let cancelledOrders = 0;
    let totalVolumeRp = 0;
    let todayOrdersCount = 0;
    let todayVolumeRp = 0;

    orders.forEach((order) => {
      const orderPrice = Number(order.price) || 0;
      const orderTime = order.createdAt?.toMillis 
        ? order.createdAt.toMillis() 
        : order.createdAt?.seconds 
          ? order.createdAt.seconds * 1000 
          : order.createdAt instanceof Date 
            ? order.createdAt.getTime() 
            : 0;

      const isToday = orderTime >= todayStart;

      if (order.status === "completed") {
        completedOrders++;
        totalVolumeRp += orderPrice;
        if (isToday) {
          todayOrdersCount++;
          todayVolumeRp += orderPrice;
        }
      } else if (order.status === "cancelled") {
        cancelledOrders++;
      } else {
        activeOrders++;
        if (isToday) {
          todayOrdersCount++;
        }
      }
    });

    return {
      totalOrders: orders.length,
      completedOrders,
      activeOrders,
      cancelledOrders,
      totalVolumeRp,
      todayOrdersCount,
      todayVolumeRp,
    };
  }, [orders]);

  return { orders, stats, loading, error };
}
