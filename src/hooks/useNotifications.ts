import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { NotificationDocument } from "../types/notification.types";

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: NotificationDocument[] = [];
        let unread = 0;

        querySnapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() } as NotificationDocument;
          list.push(data);
          if (!data.isRead) {
            unread++;
          }
        });

        // Client-side sort by createdAt descending
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setNotifications(list);
        setUnreadCount(unread);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount, loading, error };
}
