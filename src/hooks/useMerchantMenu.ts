import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { MenuItemDocument } from "../types/merchant.types";

export function useMerchantMenu(merchantId?: string) {
  const [menuItems, setMenuItems] = useState<MenuItemDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, COLLECTIONS.MENU_ITEMS));

    if (merchantId) {
      q = query(collection(db, COLLECTIONS.MENU_ITEMS), where("merchantId", "==", merchantId));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: MenuItemDocument[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as MenuItemDocument);
        });

        // Sort descending by createdAt
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setMenuItems(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  return { menuItems, loading, error };
}
