import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { KYCRequestDocument, KYCStatus } from "../types/kyc.types";
import { notificationService } from "./notification.service";

export const kycService = {
  submitKYCRequest: async (data: Omit<KYCRequestDocument, "id" | "status" | "submittedAt">): Promise<string> => {
    try {
      const batch = writeBatch(db);

      // 1. Create KYC Request
      const kycRef = doc(collection(db, COLLECTIONS.KYC_REQUESTS));
      batch.set(kycRef, {
        ...data,
        status: "pending",
        submittedAt: serverTimestamp(),
      });

      // 2. Update user profile kycStatus
      const userRef = doc(db, COLLECTIONS.USERS, data.userId);
      batch.update(userRef, {
        kycStatus: "pending"
      });

      await batch.commit();
      return kycRef.id;
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
      const userRef = doc(db, COLLECTIONS.USERS, driverUserId);
      if (status === "approved") {
        batch.update(userRef, {
          isVerified: true,
          kycStatus: "verified"
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
      } else {
        batch.update(userRef, {
          kycStatus: status
        });
      }

      await batch.commit();
    } catch (err) {
      throw new Error(`Gagal memproses verifikasi KYC: ${err}`);
    }
  }
};
