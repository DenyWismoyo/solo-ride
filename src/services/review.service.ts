import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { ReviewDocument } from "../types/review.types";

export const reviewService = {
  createReview: async (review: Omit<ReviewDocument, "id" | "createdAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        ...review,
        createdAt: serverTimestamp(),
      });

      // Also update order with customerRatingForDriver if applicable
      if (review.orderId && review.targetType === "driver") {
        const orderRef = doc(db, COLLECTIONS.ORDERS, review.orderId);
        await updateDoc(orderRef, {
          customerRatingForDriver: review.rating,
        }).catch(() => {});
      }

      return docRef.id;
    } catch (err) {
      throw new Error(`Gagal mengirim ulasan: ${err}`);
    }
  }
};
