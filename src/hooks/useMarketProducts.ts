"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

export interface MarketProductItem {
  id: string;
  name: string;
  category: string;
  marketId: string;
  kiosName: string;
  price: number;
  unit: string;
  image: string;
  stock: number;
  origin: string;
  hasCustom: boolean;
  teraCertified: boolean;
  isAvailable?: boolean;
}

export function useMarketProducts(defaultFallbackProducts: MarketProductItem[] = []) {
  const [products, setProducts] = useState<MarketProductItem[]>(defaultFallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const q = collection(db, COLLECTIONS.MENU_ITEMS);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: MarketProductItem[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              fetched.push({
                id: doc.id,
                name: data.name || "Komoditas Pasar",
                category: data.category || "sayur",
                marketId: data.marketId || "pasar_gede",
                kiosName: data.kiosName || data.merchantName || "Lapak Pedagang",
                price: Number(data.price) || 0,
                unit: data.unit || "1 kg",
                image: data.image || data.photoUrl || "🧺",
                stock: Number(data.stock) || 10,
                origin: data.origin || "Lokal Surakarta",
                hasCustom: Boolean(data.hasCustom),
                teraCertified: data.teraCertified !== undefined ? Boolean(data.teraCertified) : true,
                isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true
              });
            });

            // If we have products in Firestore, combine or override
            if (fetched.length > 0) {
              setProducts(fetched);
            } else {
              setProducts(defaultFallbackProducts);
            }
          } else {
            setProducts(defaultFallbackProducts);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore menu_items listener error, using fallback catalog:", err);
          setProducts(defaultFallbackProducts);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setError(err);
      setProducts(defaultFallbackProducts);
      setLoading(false);
    }
  }, []);

  return { products, loading, error };
}
