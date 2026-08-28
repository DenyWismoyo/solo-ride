import { Timestamp } from "firebase/firestore";

export type KYCStatus = "pending" | "approved" | "rejected";

export interface KYCRequestDocument {
  id?: string;
  userId: string;
  driverName: string;
  driverEmail: string;
  phone: string;
  nik: string;
  simNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  ktpImageUrl?: string;
  simImageUrl?: string;
  status: KYCStatus;
  notes?: string;
  submittedAt: Timestamp | any;
  reviewedAt?: Timestamp | any;
  reviewedBy?: string;
}
