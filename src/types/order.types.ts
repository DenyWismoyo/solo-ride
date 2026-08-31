import { Timestamp } from "firebase/firestore";

export type OrderStatus = 
  | "pending_verification" 
  | "pending" 
  | "cooking" 
  | "ready_for_pickup" 
  | "accepted" 
  | "in_progress" 
  | "completed" 
  | "cancelled";
export type PaymentMethod = "cash" | "qris" | "wallet";

export type ServiceType = 
  | "ojek" 
  | "mobil" 
  | "kirim" 
  | "kuliner" 
  | "titip" 
  | "pasar" 
  | "mart"
  | "ride"
  | "car"
  | "send"
  | "food"
  | string;

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
  customerName?: string;
  customerPhone?: string;
  driverId?: string | null;
  driverName?: string;
  driverPhone?: string;
  merchantId?: string;
  merchantName?: string;
  contractId?: string;
  
  serviceType: ServiceType;
  serviceTitle?: string;
  targetRole?: string;
  additionalRole?: string;
  agencyName?: string;
  
  items?: OrderItem[];

  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  price: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  
  citizenDetails?: {
    nikOrRef?: string;
    notes?: string;
    submittedAt?: string;
    [key: string]: any;
  };

  verifiedByDinasAt?: Timestamp | any;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  completedAt?: Timestamp | any;

  distanceKm?: number;
  customerRatingForDriver?: number;
  driverRatingForCustomer?: number;
  customerNote?: string;
}
