import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { SavedAddress } from "@/types/user.types";

export const DEFAULT_SOLO_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-home-1",
    label: "Rumah",
    address: "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta",
    detail: "Pagar hitam, samping warung kelontong Bu Warno, RT 02/RW 04",
    lat: -7.5621,
    lng: 110.8547,
    contactName: "Danu Setyawan",
    contactPhone: "081234567891",
    isDefault: true
  },
  {
    id: "addr-work-1",
    label: "Kantor",
    address: "Kompleks Balaikota Surakarta, Jl. Jend. Sudirman No. 2, Pasar Kliwon",
    detail: "Lobi Gedung Pusat Informasi Smart City Solo",
    lat: -7.5694,
    lng: 110.8297,
    contactName: "Danu Setyawan",
    contactPhone: "081234567891",
    isDefault: false
  },
  {
    id: "addr-campus-1",
    label: "Kampus",
    address: "Universitas Sebelas Maret (UNS), Jl. Ir. Sutami No. 36, Kentingan, Jebres",
    detail: "Gedung SPMB / Depan Danau UNS",
    lat: -7.5589,
    lng: 110.8561,
    contactName: "Danu Setyawan",
    contactPhone: "081234567891",
    isDefault: false
  }
];

export const addressService = {
  /**
   * Get all saved addresses for a user.
   * If user has no saved addresses yet, initialize with default Surakarta mock addresses.
   */
  getSavedAddresses: async (uid: string): Promise<SavedAddress[]> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.savedAddresses && Array.isArray(data.savedAddresses) && data.savedAddresses.length > 0) {
          return data.savedAddresses as SavedAddress[];
        }
      }
      return DEFAULT_SOLO_ADDRESSES;
    } catch (err) {
      console.warn("Falling back to default addresses:", err);
      return DEFAULT_SOLO_ADDRESSES;
    }
  },

  /**
   * Add or update a saved address
   */
  saveAddress: async (uid: string, address: SavedAddress): Promise<SavedAddress[]> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const snap = await getDoc(userRef);
      let currentAddresses: SavedAddress[] = [];

      if (snap.exists() && snap.data().savedAddresses) {
        currentAddresses = snap.data().savedAddresses as SavedAddress[];
      } else {
        currentAddresses = [...DEFAULT_SOLO_ADDRESSES];
      }

      const existingIndex = currentAddresses.findIndex((a) => a.id === address.id);
      let updated: SavedAddress[];

      if (existingIndex >= 0) {
        updated = [...currentAddresses];
        updated[existingIndex] = address;
      } else {
        updated = [address, ...currentAddresses];
      }

      // If marked as default, unset other defaults
      if (address.isDefault) {
        updated = updated.map((a) => ({
          ...a,
          isDefault: a.id === address.id
        }));
      }

      await updateDoc(userRef, {
        savedAddresses: updated
      });

      return updated;
    } catch (err) {
      console.error("Gagal menyimpan alamat:", err);
      throw err;
    }
  },

  /**
   * Delete a saved address
   */
  deleteAddress: async (uid: string, addressId: string): Promise<SavedAddress[]> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const snap = await getDoc(userRef);
      let currentAddresses: SavedAddress[] = [];

      if (snap.exists() && snap.data().savedAddresses) {
        currentAddresses = snap.data().savedAddresses as SavedAddress[];
      } else {
        currentAddresses = [...DEFAULT_SOLO_ADDRESSES];
      }

      const updated = currentAddresses.filter((a) => a.id !== addressId);
      
      // Ensure at least one default if list not empty
      if (updated.length > 0 && !updated.some(a => a.isDefault)) {
        updated[0].isDefault = true;
      }

      await updateDoc(userRef, {
        savedAddresses: updated
      });

      return updated;
    } catch (err) {
      console.error("Gagal menghapus alamat:", err);
      throw err;
    }
  },

  /**
   * Set an address as default
   */
  setDefaultAddress: async (uid: string, addressId: string): Promise<SavedAddress[]> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const snap = await getDoc(userRef);
      let currentAddresses: SavedAddress[] = [];

      if (snap.exists() && snap.data().savedAddresses) {
        currentAddresses = snap.data().savedAddresses as SavedAddress[];
      } else {
        currentAddresses = [...DEFAULT_SOLO_ADDRESSES];
      }

      const updated = currentAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId
      }));

      await updateDoc(userRef, {
        savedAddresses: updated
      });

      return updated;
    } catch (err) {
      console.error("Gagal menetapkan alamat utama:", err);
      throw err;
    }
  }
};
