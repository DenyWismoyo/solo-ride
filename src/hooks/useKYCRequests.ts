import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { KYCRequestDocument, KYCStatus } from "../types/kyc.types";

export function useKYCRequests(filterStatus?: KYCStatus) {
  const [requests, setRequests] = useState<KYCRequestDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, COLLECTIONS.KYC_REQUESTS));

    if (filterStatus) {
      q = query(collection(db, COLLECTIONS.KYC_REQUESTS), where("status", "==", filterStatus));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: KYCRequestDocument[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as KYCRequestDocument);
        });

        // Sort descending by submittedAt
        list.sort((a, b) => {
          const timeA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
          const timeB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
          return timeB - timeA;
        });

        setRequests(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterStatus]);

  return { requests, loading, error };
}
