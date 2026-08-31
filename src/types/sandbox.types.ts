import { UserRole } from "./user.types";

export interface SandboxPersona {
  id: string; // e.g. "sandbox-driver-solo"
  role: UserRole;
  additionalRole?: string; // e.g. "gov_dispar", "gov_dukcapil", "ind_klinik"
  name: string;
  subtitle: string;
  avatar: string;
  targetPath: string;
  badge: string;
  badgeVariant: "emerald" | "amber" | "orange" | "blue" | "teal" | "rose";
  description: string;
  attributes: Record<string, any>;
}

export const SANDBOX_PERSONAS: SandboxPersona[] = [
  // 1. CUSTOMER
  {
    id: "sandbox-customer-solo",
    role: "customer",
    name: "Danu Setyawan (Warga Solo)",
    subtitle: "Pelanggan / Warga Aktif Jebres",
    avatar: "🛒",
    targetPath: "/",
    badge: "Warga Solo",
    badgeVariant: "emerald",
    description: "Saldo Poin UMKM: 120 Stamp. Menikmati layanan Ojek, Kuliner, & Titip Tetangga.",
    attributes: {
      points: 120,
      phone: "081234567891",
      address: "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta"
    }
  },

  // 2. DRIVER
  {
    id: "sandbox-driver-solo",
    role: "driver",
    name: "Joko Santoso (Mitra Driver)",
    subtitle: "Driver Komunitas Solo Balapan",
    avatar: "🛵",
    targetPath: "/driver",
    badge: "Driver Mitra",
    badgeVariant: "amber",
    description: "Karcis Flat Aktif 24 Jam. Saldo Dompet: Rp 150.000. 48 Trip Selesai. Rating ⭐ 4.9.",
    attributes: {
      vehiclePlate: "AD 4821 QA",
      vehicleModel: "Honda Vario 125cc",
      isVerified: true,
      points: 480,
      walletBalance: 150000,
      rating: 4.9
    }
  },

  // 3. MERCHANT FOOD
  {
    id: "sandbox-merchant-manto",
    role: "merchant",
    additionalRole: "merch_kuliner",
    name: "Sate Kambing Pak Manto",
    subtitle: "Kuliner Legendaris Sriwedari",
    avatar: "🍲",
    targetPath: "/merchant",
    badge: "Kuliner Solo",
    badgeVariant: "orange",
    description: "Toko Buka, QRIS Koperasi Aktif. 4 Menu Lengkap (Tengkleng Rica, Sate Buntel, Tongseng).",
    attributes: {
      storeName: "Sate Kambing & Tengkleng Pak Manto",
      storeSlug: "pak-manto",
      storeAddress: "Jl. Honggowongso No. 36, Sriwedari, Laweyan, Surakarta",
      isVerified: true,
      isOpen: true,
      rating: 4.9
    }
  },

  // 4. MERCHANT PASAR
  {
    id: "sandbox-merchant-pasar",
    role: "merchant",
    additionalRole: "merch_pasar",
    name: "Kios Mbok Darmi (Pasar Gede)",
    subtitle: "Pasar Tradisional & Sayur Subuh",
    avatar: "🥬",
    targetPath: "/merchant",
    badge: "Pasar Warga",
    badgeVariant: "emerald",
    description: "Katalog Sayur Segar Merbabu, Sembako Kiloan, Bumbu Dapur. Melayani Titip Belanja Subuh.",
    attributes: {
      storeName: "Kios Sayur Mbok Darmi Pasar Gede",
      storeSlug: "pasar-gede-mbok-darmi",
      isVerified: true,
      isOpen: true
    }
  },

  // 5. INDUSTRY - KARGO & LOGISTIK
  {
    id: "sandbox-industry-solo",
    role: "industry",
    additionalRole: "ind_kargo",
    name: "PT Bengawan Kargo Logistik",
    subtitle: "B2B & Logistik Kargo Pabrik Solo",
    avatar: "🚛",
    targetPath: "/industry",
    badge: "Kargo B2B",
    badgeVariant: "blue",
    description: "Kontrak Aktif Pengiriman Tekstil Solo-Semarang (Rp 4.500.000). 3 Armada Truk Siap.",
    attributes: {
      companyName: "PT Bengawan Kargo Logistik",
      picName: "Bambang Triatmojo",
      phone: "081987654321",
      activeContractsCount: 3
    }
  },

  // 6. INDUSTRY - KLINIK & LAB MEDIS
  {
    id: "sandbox-ind-klinik",
    role: "industry",
    additionalRole: "ind_klinik",
    name: "Klinik Medika Pratama Solo",
    subtitle: "Logistik Spesimen Medis & Farmasi",
    avatar: "🔬",
    targetPath: "/industry",
    badge: "Klinik & Lab",
    badgeVariant: "teal",
    description: "Layanan Pengantaran Sampel Laboratorium Suhu Terkendali & Distribusi Obat Resep Antar-Klinik.",
    attributes: {
      companyName: "Klinik Medika Pratama Solo",
      picName: "dr. Ratna Sp.PK",
      phone: "081333444555",
      specialization: "Pengantaran Sampel Darah & Resep Medis"
    }
  },

  // 7. INDUSTRY - TRAVEL & SHUTTLE
  {
    id: "sandbox-ind-travel",
    role: "industry",
    additionalRole: "ind_travel",
    name: "Solo Wisata Trans Nusantara",
    subtitle: "Shuttle Stasiun/Bandara & Charter",
    avatar: "🚐",
    targetPath: "/industry",
    badge: "Travel & Wisata",
    badgeVariant: "amber",
    description: "Shuttle Stasiun Solo Balapan & Bandara Adi Soemarmo. Paket Charter Mobil Keliling Heritage.",
    attributes: {
      companyName: "Solo Wisata Trans Nusantara",
      picName: "Hendra Wijaya",
      phone: "081555666777"
    }
  },

  // 8. GOVERNMENT - DISKOP & KOPERASI
  {
    id: "sandbox-gov-solo",
    role: "government",
    additionalRole: "gov_diskop",
    name: "Dinas Koperasi & UMKM Solo",
    subtitle: "Pemerintah Kota Surakarta & Koperasi",
    avatar: "🪙",
    targetPath: "/gov",
    badge: "Diskop & UMKM",
    badgeVariant: "emerald",
    description: "Cadangan SHU Koperasi Rp 120.000.000. Program Subsidi Karcis Harian Driver 2026.",
    attributes: {
      agencyName: "Dinas Koperasi & UMKM Kota Surakarta",
      shuPool: 120000000,
      activeBroadcastsCount: 2
    }
  },

  // 9. GOVERNMENT - PARIWISATA & KEBUDAYAAN
  {
    id: "sandbox-gov-dispar",
    role: "government",
    additionalRole: "gov_dispar",
    name: "Dinas Pariwisata Surakarta",
    subtitle: "Promosi Event & Wisata Heritage",
    avatar: "🎭",
    targetPath: "/gov",
    badge: "Dinas Pariwisata",
    badgeVariant: "amber",
    description: "Kalender Solo Great Sale, Kirab 1 Suro Keraton, dan Shelter Wisata Ojek di Pasar Gede.",
    attributes: {
      agencyName: "Dinas Kebudayaan & Pariwisata Kota Surakarta",
      activeBroadcastsCount: 1
    }
  },

  // 10. GOVERNMENT - DUKCAPIL
  {
    id: "sandbox-gov-dukcapil",
    role: "government",
    additionalRole: "gov_dukcapil",
    name: "Disdukcapil Surakarta",
    subtitle: "Layanan Antar Dokumen KTP/KK",
    avatar: "🪪",
    targetPath: "/gov",
    badge: "Disdukcapil",
    badgeVariant: "blue",
    description: "Program Dukcapil Antar KTP-el / KK / Akta Kelahiran resmi ke rumah warga via Driver Mitra.",
    attributes: {
      agencyName: "Dinas Kependudukan & Catatan Sipil Surakarta",
      deliveriesToday: 42
    }
  },

  // 11. GOVERNMENT - DINAS SOSIAL
  {
    id: "sandbox-gov-dinsos",
    role: "government",
    additionalRole: "gov_dinsos",
    name: "Dinas Sosial Surakarta",
    subtitle: "Perlindungan & Bansos Sembako",
    avatar: "🤝",
    targetPath: "/gov",
    badge: "Dinas Sosial",
    badgeVariant: "rose",
    description: "Penyaluran Voucher Bansos Sembako di Pasar Tradisional & Armada Ojek Siaga Difabel/Lansia.",
    attributes: {
      agencyName: "Dinas Sosial Kota Surakarta",
      activeVouchersCount: 350
    }
  },

  // 12. GOVERNMENT - BAPENDA
  {
    id: "sandbox-gov-bapenda",
    role: "government",
    additionalRole: "gov_bapenda",
    name: "Bapenda Kota Surakarta",
    subtitle: "Optimalisasi PAD & Retribusi Pasar",
    avatar: "📊",
    targetPath: "/gov",
    badge: "Bapenda PAD",
    badgeVariant: "teal",
    description: "Monitoring Retribusi Digital Kios Pasar Tradisional & Transparansi Sirkulasi Ekonomi Mikro Solo.",
    attributes: {
      agencyName: "Badan Pendapatan Daerah Surakarta",
      dailyPADRetribution: 48500000
    }
  }
];
