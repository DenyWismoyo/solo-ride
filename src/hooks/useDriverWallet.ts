import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDoc } from "firebase/firestore";
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
          const now = Date.now();
          // Find any unexpired active karcis document
          for (const docSnap of snapshot.docs) {
            const data = { id: docSnap.id, ...docSnap.data() } as KarcisDocument;
            let expires = 0;
            if (data.expiresAt?.toMillis) {
              expires = data.expiresAt.toMillis();
            } else if (data.expiresAt?.seconds) {
              expires = data.expiresAt.seconds * 1000;
            } else if (data.expiresAt?.toDate) {
              expires = data.expiresAt.toDate().getTime();
            } else if (data.expiresAt instanceof Date) {
              expires = data.expiresAt.getTime();
            } else if (typeof data.expiresAt === "string" || typeof data.expiresAt === "number") {
              expires = new Date(data.expiresAt).getTime();
            }

            // Valid if expiry is in future, or newly created without explicit expiry yet
            if (expires > now || expires === 0) {
              validKarcis = data;
              break;
            }
          }
        }

        // Fallback check on User Profile karcisExpiry if karcis collection empty
        if (!validKarcis) {
          getDoc(doc(db, COLLECTIONS.USERS, driverId)).then((uSnap) => {
            if (!isSubscribed) return;
            if (uSnap.exists()) {
              const uData = uSnap.data();
              let uExp = 0;
              if (uData.karcisExpiry?.toMillis) {
                uExp = uData.karcisExpiry.toMillis();
              } else if (uData.karcisExpiry?.toDate) {
                uExp = uData.karcisExpiry.toDate().getTime();
              } else if (uData.karcisExpiry instanceof Date) {
                uExp = uData.karcisExpiry.getTime();
              } else if (uData.karcisExpiry) {
                uExp = new Date(uData.karcisExpiry).getTime();
              }

              if (uExp > Date.now() || driverId === "sandbox-driver-solo") {
                setActiveKarcis({
                  id: "synced-user-karcis",
                  driverId: driverId,
                  amount: 0,
                  cost: 0,
                  status: "active",
                  type: "trial",
                  isFreeTrial: true,
                  expiresAt: uData.karcisExpiry || new Date(Date.now() + 24 * 60 * 60 * 1000),
                  createdAt: new Date()
                } as unknown as KarcisDocument);
                return;
              }
            }
            setActiveKarcis(null);
          }).catch(() => {
            if (isSubscribed) setActiveKarcis(null);
          });
        } else {
          setActiveKarcis(validKarcis);
        }
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
        setLoading(false);
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
