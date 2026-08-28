import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { ContractDocument } from "../types/contract.types";

export function useContracts(industryId?: string) {
  const [contracts, setContracts] = useState<ContractDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, COLLECTIONS.CONTRACTS));

    if (industryId) {
      q = query(collection(db, COLLECTIONS.CONTRACTS), where("industryId", "==", industryId));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: ContractDocument[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ContractDocument);
        });

        // Client sort descending
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setContracts(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [industryId]);

  return { contracts, loading, error };
}
