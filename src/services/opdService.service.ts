import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { CivicOutputMode } from "@/types/civic.types";

export interface OpdServiceConfig {
  id: string;
  agencyId: string;
  name: string;
  shortName: string;
  description: string;
  icon?: string;
  outputMode: CivicOutputMode;
  isActive: boolean;
  price: number;
  feeLabel: string;
  slaMinutes: number;
  requirements?: string[];
  requiresDeliveryAddress: boolean;
  requiresAttachments: boolean;
  isEmergency: boolean;
  isCustom?: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export const opdService = {
  /**
   * Mengambil semua konfigurasi layanan untuk suatu dinas dari Firestore
   */
  getAgencyServices: async (agencyId: string): Promise<OpdServiceConfig[]> => {
    try {
      const q = query(
        collection(db, "opd_services"),
        where("agencyId", "==", agencyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OpdServiceConfig[];
    } catch (err) {
      console.error("Gagal mengambil konfigurasi layanan OPD:", err);
      return [];
    }
  },

  /**
   * Toggle status aktif / non-aktif sub-layanan
   */
  toggleServiceStatus: async (serviceId: string, isActive: boolean, fallbackData?: Partial<OpdServiceConfig>): Promise<void> => {
    try {
      const docRef = doc(db, "opd_services", serviceId);
      await setDoc(docRef, {
        ...fallbackData,
        id: serviceId,
        isActive,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      throw new Error(`Gagal mengubah status layanan: ${err}`);
    }
  },

  /**
   * Menyimpan / memperbarui konfigurasi layanan
   */
  saveServiceConfig: async (config: OpdServiceConfig): Promise<void> => {
    try {
      const docRef = doc(db, "opd_services", config.id);
      await setDoc(docRef, {
        ...config,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      throw new Error(`Gagal menyimpan konfigurasi layanan: ${err}`);
    }
  },

  /**
   * Menghapus layanan custom
   */
  deleteCustomService: async (serviceId: string): Promise<void> => {
    try {
      const docRef = doc(db, "opd_services", serviceId);
      await deleteDoc(docRef);
    } catch (err) {
      throw new Error(`Gagal menghapus layanan custom: ${err}`);
    }
  }
};
