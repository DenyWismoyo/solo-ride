import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { BroadcastDocument, BroadcastTarget } from "../types/notification.types";

export const broadcastService = {
  createBroadcast: async (data: Omit<BroadcastDocument, "id" | "createdAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.BROADCASTS), {
        ...data,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      throw new Error(`Gagal mempublikasikan broadcast: ${err}`);
    }
  },

  toggleBroadcastStatus: async (broadcastId: string, isActive: boolean): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.BROADCASTS, broadcastId);
      await updateDoc(ref, {
        isActive,
      });
    } catch (err) {
      throw new Error(`Gagal memperbarui status broadcast: ${err}`);
    }
  }
};
