import { UserRole } from "@/types/user.types";

export interface SectorDefinition {
  id: string; // e.g. "gov_dispar"
  parentRole: UserRole;
  name: string;
  agencyOrCompanyName: string;
  tagline: string;
  avatar: string;
  accentColor: string;
  services: string[];
  sampleFeatures: string[];
  description: string;
}

// -------------------------------------------------------------
// 1. DINAS PEMERINTAH KOTA SURAKARTA (GOVERNMENT SECTORS)
// -------------------------------------------------------------
export const GOVERNMENT_SECTORS: SectorDefinition[] = [
  {
    id: "gov_diskop",
    parentRole: "government",
    name: "Dinas Koperasi & UMKM",
    agencyOrCompanyName: "Dinas Koperasi & UKM Kota Surakarta",
    tagline: "Pemberdayaan Ekonomi Kerakyatan & Koperasi Mitra",
    avatar: "🪙",
    accentColor: "emerald",
    services: [
      "Distribusi Dividen SHU Koperasi",
      "Subsidi Karcis Harian Driver",
      "Sertifikasi Legalitas & NIB UMKM",
      "Fasilitasi Dana Bergulir Usaha Mikro"
    ],
    sampleFeatures: ["Kalkulator SHU", "Pencairan Subsidi Karcis", "Data 1.250 Mitra"],
    description: "Mengelola dana cadangan SHU, subsidi biaya operasional driver mitra, dan pembinaan UMKM pasar tradisional."
  },
  {
    id: "gov_dispar",
    parentRole: "government",
    name: "Dinas Pariwisata & Kebudayaan",
    agencyOrCompanyName: "Dinas Kebudayaan & Pariwisata Kota Surakarta",
    tagline: "Promosi Destinasi Heritage & Kalender Budaya Solo",
    avatar: "🎭",
    accentColor: "amber",
    services: [
      "Kalender Event Budaya & Solo Great Sale",
      "Rute Wisata Heritage (Keraton, Mangkunegaran, Radya Pustaka)",
      "Shelter Wisata Ojek Mitra di Lokasi Wisata",
      "Pemandu Wisata Terintegrasi Driver Lokal"
    ],
    sampleFeatures: ["Event Kirab 1 Suro", "Shelter Pasar Gede", "Paket Keliling Heritage"],
    description: "Memfasilitasi wisatawan menjelajahi Solo dengan peta wisata pintar dan shelter ojek terintegrasi event kota."
  },
  {
    id: "gov_dukcapil",
    parentRole: "government",
    name: "Disdukcapil (Administrasi Kependudukan)",
    agencyOrCompanyName: "Dinas Kependudukan & Pencatatan Sipil Surakarta",
    tagline: "Layanan Antar Dokumen Kependudukan Sampai Rumah",
    avatar: "🪪",
    accentColor: "blue",
    services: [
      "Dukcapil Antar KTP-el ke Rumah Warga",
      "Pengantaran Kartu Keluarga (KK) & KIA",
      "Distribusi Akta Kelahiran / Kematian",
      "Verifikasi Identitas Kependudukan Digital (IKD)"
    ],
    sampleFeatures: ["Dispatch Kurir KTP", "Tracking Berkas Warga", "Serah Terima OTP"],
    description: "Memudahkan warga mendapatkan dokumen kependudukan resmi tanpa antri melalui kurir driver mitra terverifikasi."
  },
  {
    id: "gov_dinsos",
    parentRole: "government",
    name: "Dinas Sosial",
    agencyOrCompanyName: "Dinas Sosial Kota Surakarta",
    tagline: "Perlindungan Sosial & Bantuan Pangan Warga",
    avatar: "🤝",
    accentColor: "rose",
    services: [
      "Voucher Bansos Sembako di Pasar Tradisional",
      "Layanan Antar Jemput Warga Difabel & Lansia",
      "Posko Tanggap Bencana & Dapur Umum",
      "Pendataan Pemerlu Pelayanan Kesejahteraan Sosial (PPKS)"
    ],
    sampleFeatures: ["Klaim Voucher Beras", "Armada Siaga Lansia", "Audit Distribusi Bansos"],
    description: "Menyalurkan bantuan pangan warga terintegrasi pasar lokal dan menyediakan armada ojek ramah difabel/lansia."
  },
  {
    id: "gov_bapenda",
    parentRole: "government",
    name: "Badan Pendapatan Daerah (Bapenda)",
    agencyOrCompanyName: "Bapenda Kota Surakarta",
    tagline: "Optimalisasi PAD & Retribusi Pasar Digital",
    avatar: "📊",
    accentColor: "indigo",
    services: [
      "Monitoring Retribusi Kios Pasar Digital (QRIS)",
      "Transparansi Pajak Parkir & Restoran UMKM",
      "Dashboard Real-time Mikro-Ekonomi Surakarta",
      "Insentif Pajak Usaha Mikro Kepatuhan Tinggi"
    ],
    sampleFeatures: ["Grafik PAD Harian", "Audit Transaksi Pasar", "Analisis Inflasi Pangan"],
    description: "Memantau sirkulasi ekonomi mikro kota Solo, retribusi kios pasar digital, dan optimalisasi PAD secara transparan."
  },
  {
    id: "gov_dinkes",
    parentRole: "government",
    name: "Dinas Kesehatan",
    agencyOrCompanyName: "Dinas Kesehatan Kota Surakarta",
    tagline: "Layanan Kesehatan Preventif & Pengantaran Obat",
    avatar: "🏥",
    accentColor: "teal",
    services: [
      "Pengantaran Obat Resep Puskesmas & RSUD ke Rumah",
      "Pemetaan Faskes & Ketersediaan Ruang Inap",
      "Armada Siaga Donor Darah & Posyandu",
      "E-Resep Terintegrasi Apotek Daerah"
    ],
    sampleFeatures: ["Dispatch Resep Obat", "Peta 17 Puskesmas", "Jadwal Posyandu Warga"],
    description: "Mempermudah pasien kronis/lansia mendapatkan obat resep langsung ke rumah melalui driver bersertifikat pengantaran medis."
  },
  {
    id: "gov_dishub",
    parentRole: "government",
    name: "Dinas Perhubungan (Dishub)",
    agencyOrCompanyName: "Dinas Perhubungan Kota Surakarta",
    tagline: "Manajemen Lalu Lintas, CFD & Shelter Ojek",
    avatar: "🚦",
    accentColor: "yellow",
    services: [
      "Rekayasa Shelter Ojek Saat Car Free Day (CFD)",
      "Integrasi Rute Feeder Batik Solo Trans (BST)",
      "Manajemen Titik Kumpul Stasiun & Terminal",
      "Laporan Kemacetan & Kondisi Jalan Real-time"
    ],
    sampleFeatures: ["Peta Shelter CFD", "Integrasi BST", "Broadcast Rekayasa Lalin"],
    description: "Mengatur titik kumpul mitra ojek lokal, rekayasa lalu lintas saat event kota, dan integrasi angkutan umum BST."
  }
];

// -------------------------------------------------------------
// 2. SEKTOR INDUSTRI & B2B (INDUSTRY SECTORS)
// -------------------------------------------------------------
export const INDUSTRY_SECTORS: SectorDefinition[] = [
  {
    id: "ind_klinik",
    parentRole: "industry",
    name: "Klinik & Laboratorium Medis",
    agencyOrCompanyName: "Klinik Pratama & Lab Medika Solo",
    tagline: "Logistik Spesimen Medis & Farmasi B2B",
    avatar: "🔬",
    accentColor: "teal",
    services: [
      "Pengantaran Sampel Darah & Spesimen Lab Suhu Terkendali",
      "Distribusi Obat Resep B2B Antar-Klinik",
      "Homecare Nakes ke Rumah Pasien",
      "Drop-off Rekam Medis & Dokumen Asuransi"
    ],
    sampleFeatures: ["Coolbox Sample Tracking", "Jadwal Pick-up Lab Rutin", "SOP Medis Khusus"],
    description: "Solusi kurir medis terpercaya untuk rumah sakit, klinik, dan laboratorium klinik dengan penanganan berstandar higienis."
  },
  {
    id: "ind_travel",
    parentRole: "industry",
    name: "Biro Travel, Wisata & Shuttle",
    agencyOrCompanyName: "Solo Trans Nusantara & Tour",
    tagline: "Charter Rombongan & Antar-Jemput Stasiun/Bandara",
    avatar: "🚐",
    accentColor: "orange",
    services: [
      "Antar-Jemput Stasiun Solo Balapan / Purwosari",
      "Shuttle Bandara Internasional Adi Soemarmo",
      "Charter Mobil Wisata Keliling Solo-Karanganyar",
      "Drop-off Wisatawan Rombongan Hotel Bintang"
    ],
    sampleFeatures: ["Booking Shuttle Terjadwal", "Paket Wisata Candi Cetho", "Armada Avanza/HiAce"],
    description: "Kemitraan shuttle B2B menghubungkan hotel, stasiun, dan bandara dengan armada mobil warga yang terawat dan nyaman."
  },
  {
    id: "ind_kargo",
    parentRole: "industry",
    name: "Ekspedisi & Kargo Logistik",
    agencyOrCompanyName: "PT Bengawan Kargo Logistik",
    tagline: "Kargo Muatan Berat & Truk Antar-Kota",
    avatar: "🚛",
    accentColor: "blue",
    services: [
      "Pengiriman Kargo Bahan Baku Tekstil Solo-Semarang",
      "Sewa Truk Pick-Up & Blind Van Harian/Bulanan",
      "Multi-Drop Distribusi Grosir Solo Raya",
      "Gudang Transit Kargo Palur & Jebres"
    ],
    sampleFeatures: ["Surat Jalan Digital (POD)", "Timbangan Muatan Kg", "Multi-Stop Route"],
    description: "Menghubungkan kawasan industri Palur, Jebres, dan Grogol dengan jaringan transportasi logistik terpercaya."
  },
  {
    id: "ind_hotel",
    parentRole: "industry",
    name: "Hotel, Resto & Horeca",
    agencyOrCompanyName: "Asosiasi Horeca Solo Kencana",
    tagline: "Pasokan Subuh Pasar Gede & Laundry Linen Hotel",
    avatar: "🏨",
    accentColor: "amber",
    services: [
      "Pasokan Sayur & Daging Segar Subuh dari Pasar Gede",
      "Pengantaran Laundry Linen & Seragam Karyawan",
      "Katering Event Skala Besar (MICE Solo)",
      "Food Waste Logistics ke Bank Pakan Organik"
    ],
    sampleFeatures: ["Kontrak Suplai Subuh 04.00", "Jadwal Linen Hotel", "Katalog Bahan Baku"],
    description: "Memudahkan hotel berbintang dan restoran mendapatkan pasokan bahan pangan segar langsung dari petani dan pasar lokal."
  },
  {
    id: "ind_pabrik",
    parentRole: "industry",
    name: "Pabrik Tekstil & Manufaktur",
    agencyOrCompanyName: "PT Tekstil Batik Kencana Solo",
    tagline: "Rantai Pasok Kain Grosir Pasar Klewer & PGS",
    avatar: "🏭",
    accentColor: "purple",
    services: [
      "Distribusi Roll Kain Katun ke Pasar Klewer & PGS",
      "Pasokan Bahan Pewarna Alami & Lilin Malam",
      "Pengiriman Seragam Sekolah & Kantor Terjadwal",
      "Logistik Hasil Produksi Garment Ekspor"
    ],
    sampleFeatures: ["Kontrak Volume Bulanan", "Armada Box Tertutup", "Asuransi Kargo Tekstil"],
    description: "Mendukung jantung industri batik dan garmen Surakarta dengan pengiriman bahan baku dan kain grosir yang aman."
  },
  {
    id: "ind_agro",
    parentRole: "industry",
    name: "Agribisnis & Pangan Segar",
    agencyOrCompanyName: "Koperasi Tani Bengawan Makmur",
    tagline: "Distribusi Beras Delanggu & Sayuran Merbabu",
    avatar: "🌾",
    accentColor: "emerald",
    services: [
      "Pasokan Beras Delanggu ke Warung & Restoran",
      "Sayuran Dataran Tinggi Merbabu/Selo ke Pasar Solo",
      "Titip Gudang Dingin Pangan (Cold Storage)",
      "Suplai Daging Ayam & Telur Peternak Lokal"
    ],
    sampleFeatures: ["Harga Petani Langsung", "Distribusi Subuh", "Quality Grading"],
    description: "Memotong rantai tengkulak dengan mendistribusikan hasil panen petani lokal langsung ke pasar dan dapur warga Solo."
  }
];

// -------------------------------------------------------------
// 3. SEKTOR MITRA UMKM (MERCHANT SECTORS)
// -------------------------------------------------------------
export const MERCHANT_SECTORS: SectorDefinition[] = [
  {
    id: "merch_kuliner",
    parentRole: "merchant",
    name: "Kuliner Legendaris Solo",
    agencyOrCompanyName: "Sentra Kuliner Khas Surakarta",
    tagline: "Makanan Siap Saji, Tengkleng, Selat & Sate Solo",
    avatar: "🍲",
    accentColor: "orange",
    services: ["Pemesanan Online", "Takeaway", "Dine-in QR", "Catering"],
    sampleFeatures: ["Menu Dinamis", "Kasir QRIS", "Stok Habis Real-time"],
    description: "Warung makan legendaris dan UMKM kuliner khas Solo yang siap saji untuk warga dan wisatawan."
  },
  {
    id: "merch_pasar",
    parentRole: "merchant",
    name: "Pedagang Pasar Tradisional",
    agencyOrCompanyName: "Paguyuban Pasar Gede & Pasar Legi",
    tagline: "Sayur Segar, Daging, Bumbu Dapur & Sembako Kiloan",
    avatar: "🥬",
    accentColor: "emerald",
    services: ["Pesan Subuh", "Timbang Kiloan", "Titip Belanja", "Langganan Mingguan"],
    sampleFeatures: ["Katalog Sayur Harian", "Paket Masak Komplit", "Titip Belanja Tetangga"],
    description: "Kios pasar tradisional yang mendigitalisasi transaksi bahan pokok untuk warga perumahan."
  },
  {
    id: "merch_mart",
    parentRole: "merchant",
    name: "Warung Mart Kelontong",
    agencyOrCompanyName: "Jaringan Warung Kelontong Warga",
    tagline: "Kebutuhan Harian, Sabun, Air Galon & Gas LPG",
    avatar: "🏪",
    accentColor: "blue",
    services: ["Antar Galon/Gas", "Kebutuhan Darurat", "Pulsa & Token", "Sembako"],
    sampleFeatures: ["Antar Kilat 15 Menit", "Bebas Minimal Belanja", "Kasir Warga"],
    description: "Warung tetangga yang menyediakan kebutuhan rumah tangga harian dengan pengantaran instan."
  },
  {
    id: "merch_apotek",
    parentRole: "merchant",
    name: "Apotek & Toko Jamu Herbal",
    agencyOrCompanyName: "Sentra Jamu & Farmasi Tradisional",
    tagline: "Obat Bebas, Vitamin & Jamu Godhogan Tradisional",
    avatar: "💊",
    accentColor: "teal",
    services: ["Tebus Resep Bebas", "Jamu Tradisional", "Alkes Rumahan", "Vitamin"],
    sampleFeatures: ["Pencarian Obat", "Konsultasi Herbal", "Kemasan Tertutup"],
    description: "Penyedia obat-obatan ringan, vitamin keluarga, dan ramuan jamu herbal khas keraton Surakarta."
  },
  {
    id: "merch_batik",
    parentRole: "merchant",
    name: "Batik & Kerajinan Pasar Triwindu",
    agencyOrCompanyName: "Sentra Batik Laweyan & Kauman",
    tagline: "Batik Tulis/Cap, Souvenir & Barang Antik Solo",
    avatar: "🎨",
    accentColor: "amber",
    services: ["Belanja Souvenir", "Katalog Batik", "Custom Jahit", "Oleh-Oleh Khas Solo"],
    sampleFeatures: ["Galeri Foto Batik", "Sertifikat Asli Laweyan", "Packing Kado"],
    description: "Pengrajin batik asli Laweyan, Kauman, dan pedagang kerajinan seni Pasar Triwindu."
  }
];

// Helper Functions
export function getSectorDetails(role: UserRole, additionalRoleId?: string): SectorDefinition | undefined {
  if (!additionalRoleId) return undefined;
  if (role === "government") {
    return GOVERNMENT_SECTORS.find((s) => s.id === additionalRoleId);
  }
  if (role === "industry") {
    return INDUSTRY_SECTORS.find((s) => s.id === additionalRoleId);
  }
  if (role === "merchant") {
    return MERCHANT_SECTORS.find((s) => s.id === additionalRoleId);
  }
  return undefined;
}

export function getAllSectorsForRole(role: UserRole): SectorDefinition[] {
  if (role === "government") return GOVERNMENT_SECTORS;
  if (role === "industry") return INDUSTRY_SECTORS;
  if (role === "merchant") return MERCHANT_SECTORS;
  return [];
}
