import { UserRole } from "./user.types";

export type PersonaCategory = "Warga & Driver" | "UMKM & Kargo" | "Industri (B2B)" | "Pemerintahan (Dinas)";

export interface SandboxPersona {
  id: string; // e.g. "sandbox-driver-solo"
  role: UserRole;
  additionalRole?: string; // e.g. "gov_dispar", "gov_dukcapil", "ind_klinik"
  name: string;
  subtitle: string;
  avatar: string;
  targetPath: string;
  badge: string;
  badgeVariant: "emerald" | "amber" | "orange" | "blue" | "teal" | "rose" | "purple" | "neutral";
  description: string;
  category: PersonaCategory;
  attributes: Record<string, any>;
}

export const SANDBOX_PERSONAS: SandboxPersona[] = [
  // ==========================================
  // KATEGORI: WARGA & DRIVER
  // ==========================================
  {
    id: "sandbox-customer-solo",
    role: "customer",
    category: "Warga & Driver",
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
  {
    id: "sandbox-driver-solo",
    role: "driver",
    category: "Warga & Driver",
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

  // ==========================================
  // KATEGORI: UMKM & KARGO
  // ==========================================
  {
    id: "sandbox-merchant-manto",
    role: "merchant",
    additionalRole: "merch_kuliner",
    category: "UMKM & Kargo",
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
  {
    id: "sandbox-merchant-pasar",
    role: "merchant",
    additionalRole: "merch_pasar",
    category: "UMKM & Kargo",
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

  // ==========================================
  // KATEGORI: INDUSTRI (B2B)
  // ==========================================
  {
    id: "sandbox-industry-solo",
    role: "industry",
    additionalRole: "ind_kargo",
    category: "Industri (B2B)",
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
  {
    id: "sandbox-ind-klinik",
    role: "industry",
    additionalRole: "ind_klinik",
    category: "Industri (B2B)",
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
  {
    id: "sandbox-ind-travel",
    role: "industry",
    additionalRole: "ind_travel",
    category: "Industri (B2B)",
    name: "Solo Wisata Trans",
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

  // ==========================================
  // KATEGORI: PEMERINTAHAN (18 DINAS)
  // ==========================================
  {
    id: "sandbox-gov-dukcapil",
    role: "government",
    additionalRole: "gov_dukcapil",
    category: "Pemerintahan (Dinas)",
    name: "Disdukcapil Surakarta",
    subtitle: "Layanan Antar Dokumen",
    avatar: "🪪",
    targetPath: "/gov",
    badge: "Disdukcapil",
    badgeVariant: "blue",
    description: "Program Dukcapil Antar KTP-el / KK / Akta Kelahiran resmi ke rumah warga.",
    attributes: { agencyName: "Dinas Kependudukan & Catatan Sipil Surakarta", deliveriesToday: 42 }
  },
  {
    id: "sandbox-gov-dinkes",
    role: "government",
    additionalRole: "gov_dinkes",
    category: "Pemerintahan (Dinas)",
    name: "Dinas Kesehatan",
    subtitle: "Logistik & Kader Posyandu",
    avatar: "🏥",
    targetPath: "/gov",
    badge: "Dinkes",
    badgeVariant: "teal",
    description: "Pendistribusian PMT (Pemberian Makanan Tambahan) Posyandu.",
    attributes: { agencyName: "Dinas Kesehatan Surakarta" }
  },
  {
    id: "sandbox-gov-dinsos",
    role: "government",
    additionalRole: "gov_dinsos",
    category: "Pemerintahan (Dinas)",
    name: "Dinas Sosial Surakarta",
    subtitle: "Bansos & Pelayanan Difabel",
    avatar: "🤝",
    targetPath: "/gov",
    badge: "Dinas Sosial",
    badgeVariant: "rose",
    description: "Penyaluran Voucher Bansos Sembako di Pasar Tradisional.",
    attributes: { agencyName: "Dinas Sosial Kota Surakarta", activeVouchersCount: 350 }
  },
  {
    id: "sandbox-gov-diskop",
    role: "government",
    additionalRole: "gov_diskop",
    category: "Pemerintahan (Dinas)",
    name: "Diskop & UMKM Solo",
    subtitle: "Pemerintah Kota & Koperasi",
    avatar: "🪙",
    targetPath: "/gov",
    badge: "Diskop & UMKM",
    badgeVariant: "emerald",
    description: "Cadangan SHU Koperasi Rp 120.000.000. Program Subsidi Karcis Harian.",
    attributes: { agencyName: "Dinas Koperasi & UMKM", shuPool: 120000000 }
  },
  {
    id: "sandbox-gov-dispar",
    role: "government",
    additionalRole: "gov_dispar",
    category: "Pemerintahan (Dinas)",
    name: "Dinas Pariwisata",
    subtitle: "Promosi Event & Heritage",
    avatar: "🎭",
    targetPath: "/gov",
    badge: "Dispar",
    badgeVariant: "amber",
    description: "Kalender Solo Great Sale, Kirab 1 Suro.",
    attributes: { agencyName: "Dinas Pariwisata" }
  },
  {
    id: "sandbox-gov-dishub",
    role: "government",
    additionalRole: "gov_dishub",
    category: "Pemerintahan (Dinas)",
    name: "Dinas Perhubungan",
    subtitle: "Manajemen Lalu Lintas",
    avatar: "🚦",
    targetPath: "/gov",
    badge: "Dishub",
    badgeVariant: "orange",
    description: "Shelter Ojek dan pengaturan lalin acara Car Free Day.",
    attributes: { agencyName: "Dinas Perhubungan" }
  },
  {
    id: "sandbox-gov-bapenda",
    role: "government",
    additionalRole: "gov_bapenda",
    category: "Pemerintahan (Dinas)",
    name: "Bapenda Surakarta",
    subtitle: "Optimalisasi PAD",
    avatar: "📊",
    targetPath: "/gov",
    badge: "Bapenda PAD",
    badgeVariant: "teal",
    description: "Monitoring Retribusi Digital Kios Pasar Tradisional.",
    attributes: { agencyName: "Badan Pendapatan Daerah Surakarta" }
  },
  {
    id: "sandbox-gov-disdik",
    role: "government",
    additionalRole: "gov_disdik",
    category: "Pemerintahan (Dinas)",
    name: "Dinas Pendidikan",
    subtitle: "Bantuan Seragam & PIP",
    avatar: "🏫",
    targetPath: "/gov",
    badge: "Disdik",
    badgeVariant: "blue",
    description: "Layanan logistik sekolah dan pendataan zonasi.",
    attributes: { agencyName: "Dinas Pendidikan" }
  },
  {
    id: "sandbox-gov-dlh",
    role: "government",
    additionalRole: "gov_dlh",
    category: "Pemerintahan (Dinas)",
    name: "Dinas Lingkungan Hidup",
    subtitle: "Manajemen Sampah & Taman",
    avatar: "🌳",
    targetPath: "/gov",
    badge: "DLH",
    badgeVariant: "emerald",
    description: "Layanan laporan penjemputan limbah B3/Bank Sampah.",
    attributes: { agencyName: "Dinas Lingkungan Hidup" }
  },
  {
    id: "sandbox-gov-damkar",
    role: "government",
    additionalRole: "gov_damkar",
    category: "Pemerintahan (Dinas)",
    name: "Damkar Surakarta",
    subtitle: "Penyelamatan Darurat",
    avatar: "🚒",
    targetPath: "/gov",
    badge: "Damkar",
    badgeVariant: "rose",
    description: "Tombol Darurat Kebakaran langsung panggil posko terdekat.",
    attributes: { agencyName: "Pemadam Kebakaran" }
  },
  {
    id: "sandbox-gov-dispusip",
    role: "government",
    additionalRole: "gov_dispusip",
    category: "Pemerintahan (Dinas)",
    name: "Dispusip",
    subtitle: "Perpustakaan Keliling",
    avatar: "📚",
    targetPath: "/gov",
    badge: "Dispusip",
    badgeVariant: "blue",
    description: "Antar-jemput peminjaman buku perpustakaan daerah.",
    attributes: { agencyName: "Dinas Perpustakaan dan Kearsipan" }
  },
  {
    id: "sandbox-gov-dispertan",
    role: "government",
    additionalRole: "gov_dispertan",
    category: "Pemerintahan (Dinas)",
    name: "Dispertan",
    subtitle: "Pertanian & Pangan",
    avatar: "🌾",
    targetPath: "/gov",
    badge: "Dispertan",
    badgeVariant: "emerald",
    description: "Layanan benih gratis dan monitoring pupuk petani kota.",
    attributes: { agencyName: "Dinas Pertanian" }
  },
  {
    id: "sandbox-gov-disnaker",
    role: "government",
    additionalRole: "gov_disnaker",
    category: "Pemerintahan (Dinas)",
    name: "Disnaker",
    subtitle: "Kartu Kuning & Pelatihan",
    avatar: "👷",
    targetPath: "/gov",
    badge: "Disnaker",
    badgeVariant: "orange",
    description: "Pembuatan kartu kuning (AK-I) diantar via kurir mitra.",
    attributes: { agencyName: "Dinas Tenaga Kerja" }
  },
  {
    id: "sandbox-gov-diskominfo",
    role: "government",
    additionalRole: "gov_diskominfo",
    category: "Pemerintahan (Dinas)",
    name: "Diskominfo",
    subtitle: "Layanan Aduan SP4N LAPOR",
    avatar: "📡",
    targetPath: "/gov",
    badge: "Diskominfo",
    badgeVariant: "teal",
    description: "Monitoring dashboard aduan infrastruktur (ULAS).",
    attributes: { agencyName: "Diskominfo" }
  },
  {
    id: "sandbox-gov-satpolpp",
    role: "government",
    additionalRole: "gov_satpolpp",
    category: "Pemerintahan (Dinas)",
    name: "Satpol PP",
    subtitle: "Ketertiban Umum",
    avatar: "🛡️",
    targetPath: "/gov",
    badge: "Satpol PP",
    badgeVariant: "rose",
    description: "Aduan PKL liar dan gangguan ketertiban masyarakat.",
    attributes: { agencyName: "Satpol PP" }
  },
  {
    id: "sandbox-gov-bpbd",
    role: "government",
    additionalRole: "gov_bpbd",
    category: "Pemerintahan (Dinas)",
    name: "BPBD",
    subtitle: "Tanggap Bencana",
    avatar: "🌊",
    targetPath: "/gov",
    badge: "BPBD",
    badgeVariant: "amber",
    description: "Laporan cepat banjir/pohon tumbang dari mitra di lapangan.",
    attributes: { agencyName: "BPBD Surakarta" }
  },
  {
    id: "sandbox-gov-dp3a",
    role: "government",
    additionalRole: "gov_dp3a",
    category: "Pemerintahan (Dinas)",
    name: "DP3AP2KB",
    subtitle: "Perlindungan Anak & Perempuan",
    avatar: "👩‍👧",
    targetPath: "/gov",
    badge: "DP3A",
    badgeVariant: "purple",
    description: "Aduan KDRT/Kekerasan dengan masking anonim (Privacy DP3A Mode).",
    attributes: { agencyName: "DP3AP2KB" }
  },
  {
    id: "sandbox-gov-dpmptsp",
    role: "government",
    additionalRole: "gov_dpmptsp",
    category: "Pemerintahan (Dinas)",
    name: "DPMPTSP",
    subtitle: "Izin Usaha UMKM",
    avatar: "📑",
    targetPath: "/gov",
    badge: "DPMPTSP",
    badgeVariant: "blue",
    description: "Pendaftaran NIB untuk mitra pedagang Ride-Solo.",
    attributes: { agencyName: "DPMPTSP Surakarta" }
  }
];
