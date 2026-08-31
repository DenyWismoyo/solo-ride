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

export interface DukcapilDetails {
  documentType: string;
  nikOrRef: string;
  registrantName?: string;
  originOffice?: string;
  otpCode?: string;
  urgencyLevel?: "normal" | "prioritas" | "lansia";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DinkesDetails {
  medicalRecordNumber?: string;
  selectedPuskesmas?: string;
  medicineType?: string;
  allergyNotes?: string;
  bpjsNumber?: string;
  pharmacistSeal?: boolean;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DinsosDetails {
  passengerType?: string;
  assistiveDevice?: string;
  emergencyContact?: string;
  bansosType?: string;
  bansosToken?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DiskopDetails {
  businessName?: string;
  businessType?: string;
  ownerPhone?: string;
  requestType?: string;
  estimatedRevenue?: number;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DisparDetails {
  packageType?: string;
  eventId?: string;
  numberOfGuests?: number;
  preferredLanguage?: "id" | "en" | "jv";
  preferredDate?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DishubDetails {
  reportType?: string;
  location?: string;
  description?: string;
  photo?: string;
  requestType?: string;
  vehiclePlate?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface BapendaDetails {
  taxType?: "pbb" | "retribusi_pasar" | "konsultasi_pajak" | "insentif_kepatuhan" | "cek_tunggakan" | string;
  spptNumber?: string;
  kiosId?: string;
  marketName?: string;
  nikOrNpwp?: string;
  taxYear?: number;
  amount?: number;
  paymentProofUrl?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DisdikDetails {
  studentName?: string;
  nisn?: string;
  schoolName?: string;
  pickupZone?: string;
  documentType?: "Ijazah" | "Buku BOS" | "Legalisir" | "Beasiswa BPMKS" | "Konsultasi PPDB";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DlhDetails {
  wasteType?: "Plastik/Kardus" | "Minyak Jelantah" | "Elektronik B3" | "Logam/Besi";
  estimatedWeightKg?: number;
  bankSampahRw?: string;
  requestType?: "Jemput Sampah" | "Uji Emisi" | "Perantingan Pohon";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DamkarDetails {
  emergencyType?: "Kebakaran" | "Animal Rescue (Ular/Tawon)" | "Evakuasi Cincin" | "Inspeksi APAR";
  urgencyLevel?: "Darurat Kritis" | "Siaga" | "Jadwal Inspeksi";
  locationDetail?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DispusipDetails {
  bookTitle?: string;
  barcodeNumber?: string;
  borrowDurationDays?: number;
  serviceTypeDetail?: "Pinjam Antar Buku" | "KTA Digital" | "Restorasi Naskah";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DispertanDetails {
  animalType?: "Kucing" | "Anjing" | "Kambing/Sapi" | "Unggas";
  petSymptoms?: string;
  serviceRequest?: "Vaksin Rabies Homecare" | "Pengobatan Hewan" | "Bibit Sayur KWT" | "Pangan Murah";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DisnakerDetails {
  applicantNik?: string;
  educationLevel?: string;
  serviceCategory?: "Kartu AK-1 Kuning" | "Pelatihan BLK" | "Pengaduan THR/UMK";
  courseSelected?: "Barista" | "Pengelasan" | "Otomotif" | "Digital Marketing";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DiskominfoDetails {
  ticketCategory?: "Infrastruktur" | "Pelayanan Publik" | "Cek Hoaks" | "WiFi RW";
  ulasSubject?: string;
  kelurahanTarget?: string;
  evidenceUrl?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface SatpolppDetails {
  disturbanceType?: "Ketertiban Umum" | "Parkir Liar" | "Musik Bising" | "Pengawalan Izin";
  incidentLocation?: string;
  eventOrganizer?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface BpbdDetails {
  disasterType?: "Banjir Bengawan Solo" | "Puting Beliung" | "Tanggul Kritis" | "Logistik Pengungsi";
  ewsWaterLevel?: string;
  affectedResidentsCount?: number;
  reliefItemNeeded?: "Terpal/Tenda" | "Makanan Siap Saji" | "Selimut/Pakaian" | "Perahu Karet";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface Dp3aDetails {
  caseType?: "Kekerasan Perempuan" | "Kekerasan Anak" | "Konseling Puspaga" | "Pendampingan Hukum";
  isEmergencyHotline?: boolean;
  victimAgeGroup?: "Anak-anak" | "Remaja" | "Dewasa";
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export interface DpmptspDetails {
  mppRegNumber?: string;
  permitType?: "NIB Berisiko" | "PBG / IMB" | "Izin Tenaga Kesehatan" | "Sertifikat Standar";
  deliveryAddressOffice?: string;
  notes?: string;
  submittedAt?: string;
  [key: string]: any;
}

export type GovCitizenDetails = 
  | DukcapilDetails 
  | DinkesDetails 
  | DinsosDetails 
  | DiskopDetails 
  | DisparDetails 
  | DishubDetails 
  | BapendaDetails
  | DisdikDetails
  | DlhDetails
  | DamkarDetails
  | DispusipDetails
  | DispertanDetails
  | DisnakerDetails
  | DiskominfoDetails
  | SatpolppDetails
  | BpbdDetails
  | Dp3aDetails
  | DpmptspDetails;

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
  
  citizenDetails?: GovCitizenDetails & {
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
