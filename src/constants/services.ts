import { 
  Bike, 
  Car, 
  Package, 
  UtensilsCrossed, 
  Users2, 
  Zap, 
  ShoppingBag, 
  LayoutGrid,
  FileCheck2,
  HeartHandshake,
  Stethoscope,
  Calendar,
  Coins,
  TrafficCone,
  FlaskConical,
  Bus,
  Truck,
  Hotel,
  Palette,
  Store
} from "lucide-react";

export interface AppService {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  tag?: string;
  isAvailable: boolean;
  category?: "mobility" | "merchant" | "government" | "industry";
  targetRole?: string;
  additionalRole?: string;
  agencyName?: string;
  estimatedFee?: number;
  feeLabel?: string;
}

// 8 Top Super-App Home Services
export const SUPER_APP_SERVICES: AppService[] = [
  {
    id: "ride",
    name: "Ojek Motor",
    shortName: "Ojek",
    description: "Antar jemput cepat tanpa potongan komisi",
    icon: Bike,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    tag: "Bebas Fee",
    isAvailable: true,
    category: "mobility"
  },
  {
    id: "car",
    name: "Mobil Warga",
    shortName: "Mobil",
    description: "Transportasi roda empat nyaman & hemat",
    icon: Car,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    borderColor: "border-teal-500/30",
    isAvailable: true,
    category: "mobility"
  },
  {
    id: "send",
    name: "Kirim Kilat",
    shortName: "Kirim",
    description: "Kurir paket & dokumen instan se-Solo",
    icon: Package,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    tag: "Instan",
    isAvailable: true,
    category: "mobility"
  },
  {
    id: "food",
    name: "Kuliner Warga",
    shortName: "Kuliner",
    description: "Pesan makan dari warung UMKM lokal",
    icon: UtensilsCrossed,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    borderColor: "border-orange-500/30",
    tag: "Enak",
    isAvailable: true,
    category: "merchant"
  },
  {
    id: "titip",
    name: "Titip Tetangga",
    shortName: "Titip",
    description: "Titip pesanan searah rute driver hemat ongkir",
    icon: Users2,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    borderColor: "border-amber-500/30",
    tag: "Hemat 50%",
    isAvailable: true,
    category: "mobility"
  },
  {
    id: "pasar",
    name: "Pasar Warga",
    shortName: "Flash Sale",
    description: "Flash sale stok UMKM diskon radius 2 km",
    icon: Zap,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10 hover:bg-rose-500/20",
    borderColor: "border-rose-500/30",
    tag: "Diskon",
    isAvailable: true,
    category: "merchant"
  },
  {
    id: "mart",
    name: "Apotek & Mart",
    shortName: "Belanja",
    description: "Kebutuhan harian & obat warung tetangga",
    icon: ShoppingBag,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    borderColor: "border-purple-500/30",
    isAvailable: true,
    category: "merchant"
  },
  {
    id: "more",
    name: "Semua Layanan",
    shortName: "Lainnya",
    description: "Semua modul ekosistem & layanan dinas kota",
    icon: LayoutGrid,
    color: "text-zinc-400",
    bgColor: "bg-zinc-800/80 hover:bg-zinc-800",
    borderColor: "border-zinc-700/60",
    isAvailable: true,
  }
];

// Comprehensive 16-Services Catalog for /services/more
export const ALL_ECOSYSTEM_SERVICES: AppService[] = [
  // -------------------------------------------------------------
  // PILAR 1: MOBILITAS & LOGISTIK
  // -------------------------------------------------------------
  {
    id: "ride",
    name: "Ojek Motor Warga",
    shortName: "Ojek",
    description: "Antar jemput cepat tanpa potongan komisi per trip.",
    icon: Bike,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    tag: "Bebas Fee",
    isAvailable: true,
    category: "mobility",
    feeLabel: "Mulai Rp 8.000"
  },
  {
    id: "car",
    name: "Mobil Warga Solo",
    shortName: "Mobil",
    description: "Transportasi mobil keluarga nyaman & hemat se-Solo Raya.",
    icon: Car,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    borderColor: "border-teal-500/30",
    isAvailable: true,
    category: "mobility",
    feeLabel: "Mulai Rp 15.000"
  },
  {
    id: "send",
    name: "Kirim Kilat Dokumen & Paket",
    shortName: "Kirim",
    description: "Kurir instan door-to-door barang belanjaan & berkas penting.",
    icon: Package,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    tag: "Instan",
    isAvailable: true,
    category: "mobility",
    feeLabel: "Mulai Rp 6.000"
  },
  {
    id: "titip",
    name: "Titip Tetangga Searah",
    shortName: "Titip",
    description: "Batching order searah rute driver hemat ongkir hingga 50%.",
    icon: Users2,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    borderColor: "border-amber-500/30",
    tag: "Hemat 50%",
    isAvailable: true,
    category: "mobility",
    feeLabel: "Diskon 50%"
  },
  {
    id: "cargo_truck",
    name: "Sewa Truk & Blind Van Kargo",
    shortName: "Kargo",
    description: "Angkut barang berat, pindahan rumah & pasokan grosir.",
    icon: Truck,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    tag: "Muatan Berat",
    isAvailable: true,
    category: "industry",
    targetRole: "industry",
    additionalRole: "ind_kargo",
    agencyName: "PT Bengawan Kargo Logistik",
    feeLabel: "Mulai Rp 150.000"
  },

  // -------------------------------------------------------------
  // PILAR 2: PASAR & UMKM LOKAL
  // -------------------------------------------------------------
  {
    id: "food",
    name: "Kuliner Legendaris Warga",
    shortName: "Kuliner",
    description: "Sate Pak Manto, Selat Mbak Lies, Timlo, Es Dawet Telasih.",
    icon: UtensilsCrossed,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    borderColor: "border-orange-500/30",
    tag: "Solo Enak",
    isAvailable: true,
    category: "merchant",
    targetRole: "merchant",
    additionalRole: "merch_kuliner",
    agencyName: "Sentra Kuliner Khas Surakarta"
  },
  {
    id: "pasar",
    name: "Pasar Tradisional & Sayur Subuh",
    shortName: "Pasar Gede",
    description: "Sayur segar Merbabu, daging, bumbu dapur dari Kios Mbok Darmi.",
    icon: Store,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    tag: "Segar 04.00",
    isAvailable: true,
    category: "merchant",
    targetRole: "merchant",
    additionalRole: "merch_pasar",
    agencyName: "Pasar Gede & Pasar Legi"
  },
  {
    id: "mart",
    name: "Warung Mart & Apotek Herbal",
    shortName: "Mart",
    description: "Kebutuhan pokok, gas LPG, air galon & jamu tradisional keraton.",
    icon: ShoppingBag,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    borderColor: "border-purple-500/30",
    isAvailable: true,
    category: "merchant",
    targetRole: "merchant",
    additionalRole: "merch_mart",
    agencyName: "Jaringan Warung Tetangga"
  },
  {
    id: "batik_craft",
    name: "Batik Laweyan & Seni Triwindu",
    shortName: "Batik",
    description: "Batik tulis, cap, dan kerajinan seni asli perajin Surakarta.",
    icon: Palette,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    borderColor: "border-amber-500/30",
    tag: "Asli Solo",
    isAvailable: true,
    category: "merchant",
    targetRole: "merchant",
    additionalRole: "merch_batik",
    agencyName: "Sentra Batik Laweyan & Kauman"
  },

  // -------------------------------------------------------------
  // PILAR 3: PROGRAM PUBLIK DINAS PEMKOT SURAKARTA
  // -------------------------------------------------------------
  {
    id: "dukcapil_antar_ktp",
    name: "Dukcapil: Antar KTP-el / KK ke Rumah",
    shortName: "Antar KTP",
    description: "Layanan pengantaran dokumen kependudukan resmi langsung ke rumah warga oleh driver mitra.",
    icon: FileCheck2,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    tag: "Resmi Pemkot",
    isAvailable: true,
    category: "government",
    targetRole: "government",
    additionalRole: "gov_dukcapil",
    agencyName: "Disdukcapil Kota Surakarta",
    feeLabel: "Subsidi Rp 0 / Rp 10.000"
  },
  {
    id: "dinsos_bansos_pasar",
    name: "Dinas Sosial: Voucher Bansos & Ojek Lansia",
    shortName: "Bansos Sembako",
    description: "Klaim kupon beras pasar murah & armada penjemputan warga lansia / difabel.",
    icon: HeartHandshake,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10 hover:bg-rose-500/20",
    borderColor: "border-rose-500/30",
    tag: "Bantuan Sosial",
    isAvailable: true,
    category: "government",
    targetRole: "government",
    additionalRole: "gov_dinsos",
    agencyName: "Dinas Sosial Kota Surakarta",
    feeLabel: "Gratis Bersyarat"
  },
  {
    id: "dinkes_resep_puskesmas",
    name: "Dinkes: Antar Resep Obat 17 Puskesmas",
    shortName: "Resep Obat",
    description: "Pengantaran obat resep pasien rawat jalan & lansia dari Puskesmas terdekat bersegel steril.",
    icon: Stethoscope,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    borderColor: "border-teal-500/30",
    tag: "Kesehatan",
    isAvailable: true,
    category: "government",
    targetRole: "government",
    additionalRole: "gov_dinkes",
    agencyName: "Dinas Kesehatan Surakarta",
    feeLabel: "Ongkir Koperasi Rp 8.000"
  },
  {
    id: "dispar_heritage_tour",
    name: "Dinas Pariwisata: Peta Wisata Heritage & Event",
    shortName: "Wisata Solo",
    description: "Kalender Solo Great Sale, Kirab 1 Suro, shelter wisata Keraton & Pasar Gede.",
    icon: Calendar,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    borderColor: "border-amber-500/30",
    tag: "Budaya",
    isAvailable: true,
    category: "government",
    targetRole: "government",
    additionalRole: "gov_dispar",
    agencyName: "Dinas Pariwisata Surakarta",
    feeLabel: "Informasi Publik"
  },
  {
    id: "diskop_shu_koperasi",
    name: "Dinas Koperasi: Poin Stamp & Legalitas NIB",
    shortName: "Koperasi SHU",
    description: "Tabungan stamp belanja UMKM, dividen SHU tahunan, dan pendampingan izin usaha.",
    icon: Coins,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    tag: "Koperasi Warga",
    isAvailable: true,
    category: "government",
    targetRole: "government",
    additionalRole: "gov_diskop",
    agencyName: "Dinas Koperasi & UMKM Surakarta",
    feeLabel: "Program Warga"
  },
  {
    id: "dishub_cfd_shelter",
    name: "Dishub: Peta Shelter CFD & Rute BST",
    shortName: "CFD & BST",
    description: "Jalur steril Car Free Day Slamet Riyadi, shelter ojek resmi & angkutan feeder BST.",
    icon: TrafficCone,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
    isAvailable: true,
    category: "government",
    targetRole: "government",
    additionalRole: "gov_dishub",
    agencyName: "Dinas Perhubungan Surakarta",
    feeLabel: "Informasi Lalin"
  },

  // -------------------------------------------------------------
  // PILAR 4: LAYANAN INDUSTRI & KESEHATAN TERBUKA UNTUK WARGA
  // -------------------------------------------------------------
  {
    id: "klinik_homecare_lab",
    name: "Klinik Medika: Homecare & Ambil Sampel Lab",
    shortName: "Lab Homecare",
    description: "Booking tenaga medis datang ke rumah untuk cek darah, tensi, dan spesimen laboratorium.",
    icon: FlaskConical,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    borderColor: "border-teal-500/30",
    tag: "Medis B2B",
    isAvailable: true,
    category: "industry",
    targetRole: "industry",
    additionalRole: "ind_klinik",
    agencyName: "Klinik Pratama & Lab Medika Solo",
    feeLabel: "Mulai Rp 45.000"
  },
  {
    id: "travel_shuttle_balapan",
    name: "Solo Wisata Trans: Shuttle Stasiun / Bandara",
    shortName: "Shuttle",
    description: "Antar-jemput terjadwal Stasiun Balapan, Purwosari & Bandara Adi Soemarmo.",
    icon: Bus,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    borderColor: "border-orange-500/30",
    tag: "Shuttle Wisata",
    isAvailable: true,
    category: "industry",
    targetRole: "industry",
    additionalRole: "ind_travel",
    agencyName: "Solo Wisata Trans Nusantara",
    feeLabel: "Mulai Rp 25.000"
  }
];
