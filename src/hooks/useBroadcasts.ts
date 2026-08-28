import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { BroadcastDocument, BroadcastTarget } from "../types/notification.types";

export function useBroadcasts(targetRole?: BroadcastTarget) {
  const [broadcasts, setBroadcasts] = useState<BroadcastDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.BROADCASTS),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let list: BroadcastDocument[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as BroadcastDocument);
        });

        // Filter target role if specified
        if (targetRole && targetRole !== "all") {
          list = list.filter((b) => b.target === "all" || b.target === targetRole);
        }

        // Sort descending
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setBroadcasts(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetRole]);

  return { broadcasts, loading, error };
}
