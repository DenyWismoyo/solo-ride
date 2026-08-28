import { Timestamp } from "firebase/firestore";

export type MerchantCategory = "kuliner" | "sembako" | "apotek" | "fashion" | "jasa";

export interface MenuItemDocument {
  id?: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
  isFlashSale?: boolean;
  soldToday?: number;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

// Backward compatibility alias
export type MenuItem = MenuItemDocument;

export interface Merchant {
  id: string;
  storeSlug?: string;
  name: string;
  category: MerchantCategory;
  rating: number;
  totalReviews: number;
  area: string; // e.g. "Pasar Gede, Surakarta"
  distanceKm: number;
  imageUrl: string;
  isOpen: boolean;
  promoTag?: string;
  popularItems: string[];
}
