import { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
export type PaymentMethod = "cash" | "qris" | "wallet";

export type ServiceType = 
  | "ojek" 
  | "mobil" 
  | "kirim" 
  | "kuliner" 
  | "titip" 
  | "pasar" 
  | "mart";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface OrderDocument {
  id?: string;
  customerId: string;
  driverId: string | null;
  merchantId?: string;
  contractId?: string;
  
  serviceType: ServiceType;
  items?: OrderItem[];

  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  price: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  completedAt?: Timestamp | any;

  customerRatingForDriver?: number;
  driverRatingForCustomer?: number;
  customerNote?: string;
}
