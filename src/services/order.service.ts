import { collection, addDoc, doc, updateDoc, serverTimestamp, increment, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { OrderDocument, OrderStatus } from "../types/order.types";
import { notificationService } from "./notification.service";

export const orderService = {
  createOrder: async (orderData: Omit<OrderDocument, "id" | "status" | "createdAt" | "updatedAt" | "driverId">): Promise<string> => {
    try {
      const newOrder = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        driverId: null,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return newOrder.id;
    } catch (err) {
      throw new Error(`Gagal membuat pesanan: ${err}`);
    }
  },

  acceptOrder: async (orderId: string, driverId: string, customerId?: string): Promise<void> => {
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, {
        driverId: driverId,
        status: "accepted",
        updatedAt: serverTimestamp()
      });

      // Send notification to customer if customerId provided
      if (customerId) {
        await notificationService.sendNotification(
          customerId,
          "order_accepted",
          "Mitra Driver Ditemukan!",
          "Driver sedang menuju ke titik penjemputan Anda.",
          orderId
        ).catch(() => {});
      }
    } catch (err) {
      throw new Error(`Gagal menerima pesanan: ${err}`);
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
          "Perjalanan Dimulai",
          "Driver sedang dalam perjalanan mengantar ke lokasi tujuan.",
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
      await updateDoc(orderRef, {
        status: "cancelled",
        updatedAt: serverTimestamp()
      });

      if (customerId) {
        await notificationService.sendNotification(
          customerId,
          "order_cancelled",
          "Pesanan Dibatalkan",
          "Pesanan perjalanan Anda telah dibatalkan.",
          orderId
        ).catch(() => {});
      }
    } catch (err) {
      throw new Error(`Gagal membatalkan pesanan: ${err}`);
    }
  },
};
