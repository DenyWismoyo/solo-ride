import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { ReviewDocument } from "../types/review.types";

export function useReviews(targetId?: string) {
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!targetId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where("targetId", "==", targetId)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: ReviewDocument[] = [];
        let sum = 0;

        querySnapshot.forEach((docSnap) => {
          const r = { id: docSnap.id, ...docSnap.data() } as ReviewDocument;
          list.push(r);
          sum += r.rating;
        });

        // Client sort descending
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setReviews(list);
        setAverageRating(list.length > 0 ? parseFloat((sum / list.length).toFixed(1)) : 5.0);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetId]);

  return { reviews, averageRating, loading, error };
}
