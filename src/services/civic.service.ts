import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

import { isEmergencyService } from "@/constants/emergencyServices";

export interface CreateCivicOrderDTO {
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  serviceTitle: string;
  targetRole?: "government" | "industry";
  additionalRole?: string;
  agencyName: string;
  price: number;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoffLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  citizenDetails: Record<string, any>;
}

export const civicService = {
  createCivicOrder: async (data: CreateCivicOrderDTO): Promise<string> => {
    try {
      const isEmergency = isEmergencyService(data.serviceType);

      const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...data,
        targetRole: data.targetRole || "government",
        status: isEmergency ? "pending" : "pending_verification",
        isEmergency,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return ref.id;
    } catch (err: any) {
      console.error("Gagal membuat civic order:", err);
      throw new Error(`Gagal mengajukan layanan sipil: ${err.message || err}`);
    }
  }
};
