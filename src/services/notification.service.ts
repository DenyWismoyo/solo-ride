import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { NotificationDocument, NotificationType } from "../types/notification.types";

export const notificationService = {
  sendNotification: async (
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    relatedId?: string
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        userId,
        type,
        title,
        body,
        isRead: false,
        relatedId: relatedId || null,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      throw new Error(`Gagal mengirim notifikasi: ${err}`);
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(notifRef, {
        isRead: true,
      });
    } catch (err) {
      throw new Error(`Gagal menandai notifikasi dibaca: ${err}`);
    }
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("userId", "==", userId),
        where("isRead", "==", false)
      );
      const snap = await getDocs(q);
      const updates = snap.docs.map((d) => updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, d.id), { isRead: true }));
      await Promise.all(updates);
    } catch (err) {
      throw new Error(`Gagal menandai semua notifikasi dibaca: ${err}`);
    }
  }
};
