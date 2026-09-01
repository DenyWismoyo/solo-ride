import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants/collections";
import { LOCAL_MERCHANTS_SURAKARTA } from "../constants/merchants";
import { MenuItemDocument, MerchantDocument } from "../types/merchant.types";
import { UserDocument } from "../types/user.types";
import { OrderStatus } from "../types/order.types";
import { writeAuditLog } from "../lib/auditLog";

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
  },

  getMerchantProfileByOwner: async (ownerId: string): Promise<MerchantDocument | null> => {
    try {
      const q = query(
        collection(db, "merchants"),
        where("ownerId", "==", ownerId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as MerchantDocument;
      }
      return null;
    } catch (err) {
      console.error("Error fetching merchant profile:", err);
      return null;
    }
  },

  getMerchantProducts: async (merchantId: string): Promise<MenuItemDocument[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MENU_ITEMS),
        where("merchantId", "==", merchantId)
      );
      const snapshot = await getDocs(q);
      const items: MenuItemDocument[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as MenuItemDocument);
      });
      return items;
    } catch (err) {
      console.error("Error fetching merchant products:", err);
      return [];
    }
  },

  toggleStoreStatus: async (merchantId: string, isOpen: boolean): Promise<void> => {
    try {
      const docRef = doc(db, "merchants", merchantId);
      await updateDoc(docRef, { isOpen, updatedAt: serverTimestamp() });
    } catch (err: any) {
      throw new Error(`Gagal mengubah status toko: ${err.message}`);
    }
  },

  updateMerchantOrderStatus: async (
    orderId: string, 
    status: OrderStatus, 
    userId: string, 
    userRole: string = "merchant",
    userName: string = "Merchant",
    rejectionReason?: string
  ): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === "rejected" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
        updateData.rejectedByDinasAt = serverTimestamp();
        updateData.rejectedByDinasName = userName;
      } else if (status === "preparing") {
        updateData.verifiedByDinasAt = serverTimestamp();
        updateData.verifiedByDinasName = userName;
      }

      await updateDoc(docRef, updateData);

      // Write to sub-collection audit trail
      await writeAuditLog({
        orderId,
        action: status === "rejected" ? "status_rejected" : `status_${status}` as any,
        actorId: userId,
        actorRole: userRole,
        actorName: userName,
        notes: status === "rejected" ? `Pesanan ditolak merchant: ${rejectionReason}` : `Status diubah ke ${status}`
      });
    } catch (err: any) {
      throw new Error(`Gagal memperbarui status pesanan: ${err.message}`);
    }
  },

  saveProduct: async (product: Partial<MenuItemDocument> & { merchantId: string; name: string }): Promise<void> => {
    try {
      if (product.id) {
        const ref = doc(db, COLLECTIONS.MENU_ITEMS, product.id);
        await updateDoc(ref, {
          ...product,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, COLLECTIONS.MENU_ITEMS), {
          ...product,
          isAvailable: product.isAvailable ?? true,
          soldToday: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      throw new Error(`Gagal menyimpan produk menu: ${err}`);
    }
  },

  deleteProduct: async (productId: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.MENU_ITEMS, productId);
      await deleteDoc(ref);
    } catch (err) {
      throw new Error(`Gagal menghapus produk: ${err}`);
    }
  }
};

export type { ProductItem, MerchantProfile, MenuItemDocument, MerchantDocument } from "../types/merchant.types";

