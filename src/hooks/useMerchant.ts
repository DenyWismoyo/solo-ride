import { useState, useEffect } from "react";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { MerchantDocument, MenuItemDocument } from "../types/merchant.types";

export function useMerchant(merchantId?: string) {
  const [merchant, setMerchant] = useState<MerchantDocument | null>(null);
  const [products, setProducts] = useState<MenuItemDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    // Listen to Merchant Profile
    const unsubMerchant = onSnapshot(
      doc(db, "merchants", merchantId),
      (docSnap) => {
        if (!isSubscribed) return;
        if (docSnap.exists()) {
          setMerchant({ id: docSnap.id, ...docSnap.data() } as MerchantDocument);
        } else {
          setMerchant(null);
        }
      },
      (err) => {
        if (isSubscribed) setError(err);
      }
    );

    // Listen to Merchant Products
    const qProducts = query(
      collection(db, "products"),
      where("merchantId", "==", merchantId)
    );

    const unsubProducts = onSnapshot(
      qProducts,
      (snapshot) => {
        if (!isSubscribed) return;
        const items: MenuItemDocument[] = [];
        snapshot.forEach((pDoc) => {
          items.push({ id: pDoc.id, ...pDoc.data() } as MenuItemDocument);
        });
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        if (isSubscribed) setError(err);
      }
    );

    return () => {
      isSubscribed = false;
      unsubMerchant();
      unsubProducts();
    };
  }, [merchantId]);

  return { merchant, products, loading, error };
}
