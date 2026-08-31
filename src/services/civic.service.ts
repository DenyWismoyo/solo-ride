import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

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
      const isEmergencyService = 
        data.serviceType.includes("damkar") || data.serviceType.includes("bpbd");

      const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...data,
        targetRole: data.targetRole || "government",
        status: isEmergencyService ? "pending" : "pending_verification",
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
