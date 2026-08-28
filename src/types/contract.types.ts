import { Timestamp } from "firebase/firestore";

export type ContractStatus = "draft" | "active" | "completed" | "cancelled";

export interface DeliveryPoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  recipientName: string;
  status: "pending" | "delivered";
  deliveredAt?: Timestamp | any;
}

export interface ContractDocument {
  id?: string;
  industryId: string;
  industryName: string;
  title: string;
  description?: string;
  assignedDriverIds?: string[];
  deliveryPoints: DeliveryPoint[];
  vehicleCount: number;
  status: ContractStatus;
  startDate: Timestamp | any;
  endDate?: Timestamp | any;
  totalValue: number;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}
