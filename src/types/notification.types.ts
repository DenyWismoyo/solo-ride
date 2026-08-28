import { Timestamp } from "firebase/firestore";

export type NotificationType =
  | "order_accepted"
  | "order_arrived"
  | "order_completed"
  | "order_cancelled"
  | "flash_sale"
  | "broadcast"
  | "karcis_expiring"
  | "kyc_approved"
  | "reward_earned";

export interface NotificationDocument {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Timestamp | any;
}

export type BroadcastTarget = "all" | "driver" | "customer" | "merchant" | "industry" | "government" | string;

export interface BroadcastDocument {
  id?: string;
  authorId: string;
  institutionName: string;
  title: string;
  body: string;
  target: BroadcastTarget;
  geofence?: {
    center: { lat: number; lng: number };
    radiusKm: number;
    areaName?: string;
  };
  isActive?: boolean;
  createdAt: Timestamp | any;
}
