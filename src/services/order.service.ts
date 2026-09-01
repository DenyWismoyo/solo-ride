import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  increment, 
  writeBatch,
  runTransaction 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { OrderDocument, OrderStatus } from "../types/order.types";
import { notificationService } from "./notification.service";

function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanUndefined(value);
    }
  }
  return result;
}

export const orderService = {
  createOrder: async (orderData: Omit<OrderDocument, "id" | "status" | "createdAt" | "updatedAt" | "driverId">, initialStatus: OrderStatus = "pending"): Promise<string> => {
    try {
      const sanitized = cleanUndefined(orderData);
      const newOrder = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...sanitized,
        driverId: null,
        status: initialStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return newOrder.id;
    } catch (err) {
      throw new Error(`Gagal membuat pesanan: ${err}`);
    }
  },

  acceptOrder: async (
    orderId: string, 
    driverId: string, 
    customerId?: string,
    driverInfo?: { driverName?: string; driverPhone?: string }
  ): Promise<void> => {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      let merchantIdToNotify: string | null = null;
      let serviceType: string | null = null;

      // Atomic Transaction: Guarantee only one driver can claim the order
      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Pesanan tidak ditemukan.");
        }

        const data = orderSnap.data();
        
        // Allowed statuses for driver to claim
        const claimableStatuses = ["pending", "cooking", "ready_for_pickup", "pending_verification"];
        if (data.driverId && data.driverId !== driverId) {
          throw new Error("Pesanan sudah diambil oleh mitra driver lain.");
        }
        if (!claimableStatuses.includes(data.status)) {
          throw new Error("Pesanan tidak dalam status yang dapat diambil.");
        }

        merchantIdToNotify = data.merchantId || null;
        serviceType = data.serviceType || null;

        const updatePayload: any = {
          driverId: driverId,
          updatedAt: serverTimestamp()
        };

        if (driverInfo?.driverName) updatePayload.driverName = driverInfo.driverName;
        if (driverInfo?.driverPhone) updatePayload.driverPhone = driverInfo.driverPhone;

        // If order was pending, advance to accepted
        if (data.status === "pending") {
          updatePayload.status = "accepted";
        }

        transaction.update(orderRef, updatePayload);
      });

      // Send notification to customer
      if (customerId) {
        await notificationService.sendNotification(
          customerId,
          "order_accepted",
          "Mitra Driver Ditemukan!",
          serviceType === "kuliner" 
            ? "Driver sedang menuju ke warung untuk mengambil pesanan kuliner Anda."
            : "Driver sedang menuju ke titik penjemputan Anda.",
          orderId
        ).catch(() => {});
      }

      // Send notification to merchant if kuliner
      if (merchantIdToNotify) {
        await notificationService.sendNotification(
          merchantIdToNotify,
          "driver_assigned",
          "Kurir Ditemukan!",
          `Driver ${driverInfo?.driverName || "Mitra"} sedang menuju ke warung Anda.`,
          orderId
        ).catch(() => {});
      }
    } catch (err: any) {
      throw new Error(err.message || `Gagal menerima pesanan: ${err}`);
    }
  },

  // Merchant starts cooking the order
  merchantStartCooking: async (
    orderId: string, 
    merchantId: string, 
    customerId?: string,
    driverId?: string
  ): Promise<void> => {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, {
        status: "cooking",
        cookingStartedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (customerId) {
        await notificationService.sendNotification(
          customerId,
          "order_cooking",
          "Warung Mulai Memasak! 🍳",
          "Pesanan kuliner Anda sedang disiapkan dan dimasak oleh warung mitra.",
          orderId
        ).catch(() => {});
      }

      if (driverId) {
        await notificationService.sendNotification(
          driverId,
          "order_cooking",
          "Warung Sedang Memasak 🍳",
          "Pesanan sedang dimasak. Anda bisa langsung menuju ke lokasi warung.",
          orderId
        ).catch(() => {});
      }
    } catch (err) {
      throw new Error(`Gagal memperbarui status memasak: ${err}`);
    }
  },

  // Merchant marks food as ready for pickup
  merchantMarkFoodReady: async (
    orderId: string, 
    merchantId: string, 
    customerId?: string,
    driverId?: string
  ): Promise<void> => {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, {
        status: "ready_for_pickup",
        foodReadyAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (customerId) {
        await notificationService.sendNotification(
          customerId,
          "order_ready",
          "Makanan Sudah Siap! ✅",
          "Masakan telah matang dan siap diambil oleh kurir pengantar.",
          orderId
        ).catch(() => {});
      }

      if (driverId) {
        await notificationService.sendNotification(
          driverId,
          "order_ready",
          "Makanan Siap Diambil! 🔔",
          "Pesanan sudah matang dan siap diambil di meja kasir warung.",
          orderId
        ).catch(() => {});
      }
    } catch (err) {
      throw new Error(`Gagal memperbarui status makanan siap: ${err}`);
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, customerId?: string): Promise<void> => {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, {
        status: status,
        updatedAt: serverTimestamp()
      });

      if (customerId && status === "in_progress") {
        await notificationService.sendNotification(
          customerId,
          "order_arrived",
          "Perjalanan Dimulai 🛵",
          "Driver sedang dalam perjalanan mengantar ke lokasi tujuan Anda.",
          orderId
        ).catch(() => {});
      }
    } catch (err) {
      throw new Error(`Gagal update status pesanan: ${err}`);
    }
  },

  completeOrder: async (orderId: string, driverId: string, customerId?: string): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // 1. Update order status to completed
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      batch.update(orderRef, {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Award +10 points to driver
      const driverRef = doc(db, COLLECTIONS.USERS, driverId);
      batch.update(driverRef, {
        points: increment(10)
      });

      // 3. Award +5 stamp points to customer (if customerId available)
      if (customerId) {
        const customerRef = doc(db, COLLECTIONS.USERS, customerId);
        batch.update(customerRef, {
          points: increment(5)
        });

        // 4. Notification to customer
        const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        batch.set(notifRef, {
          userId: customerId,
          type: "order_completed",
          title: "Pesanan Selesai!",
          body: "Perjalanan Anda telah selesai. Anda mendapatkan +5 Poin Stamp UMKM!",
          isRead: false,
          relatedId: orderId,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (err) {
      throw new Error(`Gagal menyelesaikan pesanan: ${err}`);
    }
  },

  cancelOrder: async (orderId: string, customerId?: string): Promise<void> => {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      let assignedDriverId: string | null = null;

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Pesanan tidak ditemukan.");
        }

        const data = orderSnap.data();
        
        // Cancellation is strictly allowed ONLY when status is pending
        if (data.status !== "pending") {
          throw new Error("Pesanan tidak dapat dibatalkan karena sudah diproses atau dimasak oleh warung mitra / driver.");
        }

        assignedDriverId = data.driverId || null;

        transaction.update(orderRef, {
          status: "cancelled",
          updatedAt: serverTimestamp()
        });
      });

      if (customerId) {
        await notificationService.sendNotification(
          customerId,
          "order_cancelled",
          "Pesanan Dibatalkan",
          "Pesanan kuliner / perjalanan Anda telah dibatalkan.",
          orderId
        ).catch(() => {});
      }

      if (assignedDriverId) {
        await notificationService.sendNotification(
          assignedDriverId,
          "order_cancelled",
          "Pesanan Dibatalkan Pelanggan",
          "Pelanggan telah membatalkan pesanan ini.",
          orderId
        ).catch(() => {});
      }
    } catch (err: any) {
      throw new Error(err.message || `Gagal membatalkan pesanan: ${err}`);
    }
  },
};
