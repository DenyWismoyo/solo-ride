import { Timestamp } from "firebase/firestore";

export type ReviewTarget = "driver" | "merchant";

export interface ReviewDocument {
  id?: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  targetType: ReviewTarget;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Timestamp | any;
}
