import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { KYCRequestDocument, KYCStatus } from "../types/kyc.types";
import { notificationService } from "./notification.service";

export const kycService = {
  submitKYCRequest: async (data: Omit<KYCRequestDocument, "id" | "status" | "submittedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.KYC_REQUESTS), {
        ...data,
        status: "pending",
        submittedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      throw new Error(`Gagal mengirim permohonan KYC: ${err}`);
    }
  },

  reviewKYCRequest: async (
    requestId: string,
    driverUserId: string,
    status: KYCStatus,
    adminId: string,
    notes?: string
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // 1. Update KYC Request
      const kycRef = doc(db, COLLECTIONS.KYC_REQUESTS, requestId);
      batch.update(kycRef, {
        status,
        notes: notes || null,
        reviewedAt: serverTimestamp(),
        reviewedBy: adminId,
      });

      // 2. If approved, set isVerified = true on user
      if (status === "approved") {
        const userRef = doc(db, COLLECTIONS.USERS, driverUserId);
        batch.update(userRef, {
          isVerified: true,
        });

        // 3. Send Notification to driver
        const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        batch.set(notifRef, {
          userId: driverUserId,
          type: "kyc_approved",
          title: "Verifikasi KYC Berhasil!",
          body: "Selamat! Akun Mitra Driver Anda telah resmi terverifikasi oleh Koperasi.",
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (err) {
      throw new Error(`Gagal memproses verifikasi KYC: ${err}`);
    }
  }
};
