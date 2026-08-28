import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { LOCAL_MERCHANTS_SURAKARTA } from "../constants/merchants";
import { MenuItemDocument } from "../types/merchant.types";
import { UserDocument } from "../types/user.types";

export const merchantService = {
  addMenuItem: async (item: Omit<MenuItemDocument, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MENU_ITEMS), {
        ...item,
        soldToday: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      throw new Error(`Gagal menambahkan menu: ${err}`);
    }
  },

  updateMenuItem: async (itemId: string, data: Partial<MenuItemDocument>): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.MENU_ITEMS, itemId);
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(`Gagal memperbarui menu: ${err}`);
    }
  },

  toggleAvailability: async (itemId: string, isAvailable: boolean): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.MENU_ITEMS, itemId);
      await updateDoc(ref, {
        isAvailable,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(`Gagal mengubah ketersediaan menu: ${err}`);
    }
  },

  deleteMenuItem: async (itemId: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.MENU_ITEMS, itemId);
      await deleteDoc(ref);
    } catch (err) {
      throw new Error(`Gagal menghapus menu: ${err}`);
    }
  },

  getMerchantBySlugOrId: async (identifier: string): Promise<UserDocument | null> => {
    try {
      // Coba cari berdasarkan storeSlug terlebih dahulu
      const qSlug = query(collection(db, COLLECTIONS.USERS), where("storeSlug", "==", identifier), limit(1));
      const snapSlug = await getDocs(qSlug);
      if (!snapSlug.empty) {
        return snapSlug.docs[0].data() as UserDocument;
      }
      // Jika tidak ketemu, coba cari berdasarkan uid
      const qUid = query(collection(db, COLLECTIONS.USERS), where("uid", "==", identifier), limit(1));
      const snapUid = await getDocs(qUid);
      if (!snapUid.empty) {
        return snapUid.docs[0].data() as UserDocument;
      }
      
      // Fallback ke mock data lokal untuk testing
      const mockMerchant = LOCAL_MERCHANTS_SURAKARTA.find(m => m.storeSlug === identifier || m.id === identifier);
      if (mockMerchant) {
        return {
          uid: mockMerchant.id,
          email: "mock@merchant.local",
          displayName: mockMerchant.name,
          businessName: mockMerchant.name,
          address: mockMerchant.area,
          role: "merchant",
          storeSlug: mockMerchant.storeSlug,
          createdAt: new Date()
        } as UserDocument;
      }

      return null;
    } catch (err) {
      throw new Error(`Gagal mengambil data merchant: ${err}`);
    }
  }
};
