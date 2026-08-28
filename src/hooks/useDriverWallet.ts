import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { KarcisDocument, WalletDocument, LedgerDocument } from "../types/payment.types";

export function useDriverWallet(driverId?: string) {
  const [activeKarcis, setActiveKarcis] = useState<KarcisDocument | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [ledger, setLedger] = useState<LedgerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!driverId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    // Listen to Karcis
    const qKarcis = query(
      collection(db, COLLECTIONS.KARCIS),
      where("driverId", "==", driverId),
      where("status", "==", "active")
    );

    const unsubKarcis = onSnapshot(
      qKarcis,
      (snapshot) => {
        if (!isSubscribed) return;
        
        let validKarcis: KarcisDocument | null = null;
        if (!snapshot.empty) {
          validKarcis = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as KarcisDocument;
          // Cek apakah expired secara lokal juga, walau di db status active (belum di update cron job)
          if (validKarcis.expiresAt) {
            const now = new Date().getTime();
            const expires = validKarcis.expiresAt.toMillis ? validKarcis.expiresAt.toMillis() : 0;
            if (expires > 0 && now > expires) {
              validKarcis = null; // Dianggap expired secara client-side
            }
          }
        }
        setActiveKarcis(validKarcis);
        // Only stop loading if all is fetched, but for simplicity, we'll let each listener resolve quickly.
      },
      (err) => {
        if (isSubscribed) setError(err);
      }
    );

    // Listen to Wallet Balance
    const unsubWallet = onSnapshot(
      doc(db, COLLECTIONS.WALLETS, driverId),
      (docSnap) => {
        if (!isSubscribed) return;
        if (docSnap.exists()) {
          setWalletBalance((docSnap.data() as WalletDocument).balance);
        }
      },
      (err) => {
        if (isSubscribed) setError(err);
      }
    );

    // Listen to Ledger
    const qLedger = query(
      collection(db, COLLECTIONS.LEDGER),
      where("userId", "==", driverId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubLedger = onSnapshot(
      qLedger,
      (snapshot) => {
        if (!isSubscribed) return;
        const docs: LedgerDocument[] = [];
        snapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as LedgerDocument);
        });
        setLedger(docs);
        setLoading(false); // Consider loaded when ledger returns
      },
      (err) => {
        if (isSubscribed) setError(err);
      }
    );

    return () => {
      isSubscribed = false;
      unsubKarcis();
      unsubWallet();
      unsubLedger();
    };
  }, [driverId]);

  return { activeKarcis, walletBalance, ledger, loading, error };
}
