"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { Merchant } from "@/types/merchant.types";
import { LOCAL_MERCHANTS_SURAKARTA } from "@/constants/merchants";

export function useFoodMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>(LOCAL_MERCHANTS_SURAKARTA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Listen to registered merchants in Firestore
      const unsubMerchants = onSnapshot(
        collection(db, "merchants"),
        (snapshot) => {
          if (!snapshot.empty) {
            const liveList: Merchant[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              liveList.push({
                id: doc.id,
                storeSlug: data.storeSlug || doc.id,
                name: data.name || data.storeName || "Warung Mitra Solo",
                category: data.category || "kuliner",
                rating: Number(data.rating) || 4.9,
                totalReviews: Number(data.totalReviews) || 120,
                area: data.area || data.address || "Surakarta",
                distanceKm: Number(data.distanceKm) || 1.2,
                imageUrl: data.imageUrl || data.photoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
                isOpen: data.isOpen !== undefined ? Boolean(data.isOpen) : true,
                promoTag: data.promoTag || "0% Komisi",
                popularItems: Array.isArray(data.popularItems) ? data.popularItems : ["Menu Favorit Warga"]
              });
            });

            // Merge with local legend presets without duplicating by id/storeSlug
            const existingSlugs = new Set(liveList.map((m) => m.storeSlug || m.id));
            const merged = [
              ...liveList,
              ...LOCAL_MERCHANTS_SURAKARTA.filter((m) => !existingSlugs.has(m.storeSlug || m.id))
            ];

            setMerchants(merged);
          } else {
            setMerchants(LOCAL_MERCHANTS_SURAKARTA);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore merchants listener error, using fallback merchants:", err);
          setMerchants(LOCAL_MERCHANTS_SURAKARTA);
          setLoading(false);
        }
      );

      return () => unsubMerchants();
    } catch (err: any) {
      setError(err);
      setMerchants(LOCAL_MERCHANTS_SURAKARTA);
      setLoading(false);
    }
  }, []);

  return { merchants, loading, error };
}
