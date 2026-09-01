import { Timestamp } from "firebase/firestore";

export type IncidentCategory = "flood" | "roadblock" | "event" | "roadwork" | "traffic";

export type IncidentStatus = "active" | "resolved" | "expired";

export interface RoadIncident {
  id: string;
  category: IncidentCategory;
  title: string;
  description: string;
  streetName: string;
  districtId: "banjarsari" | "jebres" | "laweyan" | "pasar_kliwon" | "serengan";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporterId: string;
  reporterName: string;
  reporterRole: "customer" | "driver" | "officer" | "admin";
  imageUrl?: string;
  status: IncidentStatus;
  isVerifiedByDishub?: boolean;
  verifiedByOfficerName?: string;
  stillActiveCount: number; // Number of upvotes confirming it's still there
  resolvedCount: number;    // Number of votes confirming it's resolved/clear
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  expiresAt?: Timestamp | any;
}

export interface CreateIncidentDTO {
  category: IncidentCategory;
  title: string;
  description: string;
  streetName: string;
  districtId: "banjarsari" | "jebres" | "laweyan" | "pasar_kliwon" | "serengan";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporterId: string;
  reporterName: string;
  reporterRole: "customer" | "driver" | "officer" | "admin";
  imageUrl?: string;
}
