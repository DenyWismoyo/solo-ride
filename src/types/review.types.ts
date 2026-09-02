import { Timestamp } from "firebase/firestore";

export type ReviewTarget = "driver" | "merchant" | "government";

export interface ReviewDocument {
  id?: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  targetType: ReviewTarget;
  rating: number; // 1 to 5
  driverRating?: number;
  merchantRating?: number;
  serviceRating?: number;
  tags?: string[];
  comment?: string;
  createdAt: Timestamp | any;
}
