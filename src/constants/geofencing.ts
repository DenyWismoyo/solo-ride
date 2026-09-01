export interface SoloDistrict {
  id: "all" | "banjarsari" | "jebres" | "laweyan" | "pasar_kliwon" | "serengan";
  name: string;
  shortName: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  description: string;
  landmarks: string[];
  demandLevel: "Sangat Tinggi" | "Tinggi" | "Sedang" | "Normal";
  estimatedOrdersPerHour: number;
  tagColor: "rose" | "amber" | "blue" | "emerald" | "purple";
}

export interface DemandHotspot {
  id: string;
  districtId: "banjarsari" | "jebres" | "laweyan" | "pasar_kliwon" | "serengan";
  name: string;
  category: "transport" | "campus" | "market" | "mall" | "hospital" | "tourism";
  lat: number;
  lng: number;
  weight: number; // For Google Maps Heatmap layer
  demandLevel: "Sangat Tinggi" | "Tinggi" | "Sedang";
  ordersPerHour: number;
  avgPickupWaitMinutes: number;
  recommendedBasecamp: string;
  description: string;
}

export const SOLO_DISTRICTS: SoloDistrict[] = [
  {
    id: "banjarsari",
    name: "Kecamatan Banjarsari",
    shortName: "Banjarsari",
    center: { lat: -7.5562, lng: 110.8164 },
    radiusMeters: 2800,
    description: "Pusat Transportasi Utama & Komersial Utara Solo (Stasiun Balapan, Manahan, Tirtonadi)",
    landmarks: ["Stasiun Solo Balapan", "Stadion Manahan", "Terminal Tirtonadi", "Solo Paragon Mall"],
    demandLevel: "Sangat Tinggi",
    estimatedOrdersPerHour: 42,
    tagColor: "rose"
  },
  {
    id: "jebres",
    name: "Kecamatan Jebres",
    shortName: "Jebres",
    center: { lat: -7.5615, lng: 110.8465 },
    radiusMeters: 3000,
    description: "Pusat Pendidikan Kampus, Medis & Pasar Tradisional Timur (UNS, RS Moewardi, Pasar Gede)",
    landmarks: ["Universitas Sebelas Maret (UNS)", "RSUD Dr. Moewardi", "Pasar Gede", "Stasiun Jebres"],
    demandLevel: "Sangat Tinggi",
    estimatedOrdersPerHour: 48,
    tagColor: "rose"
  },
  {
    id: "laweyan",
    name: "Kecamatan Laweyan",
    shortName: "Laweyan",
    center: { lat: -7.5658, lng: 110.7932 },
    radiusMeters: 2600,
    description: "Kawasan Heritage Kampung Batik, Pusat Perbelanjaan Modern & Purwosari",
    landmarks: ["Kampung Batik Laweyan", "Solo Grand Mall", "Solo Square", "Stasiun Purwosari"],
    demandLevel: "Tinggi",
    estimatedOrdersPerHour: 34,
    tagColor: "amber"
  },
  {
    id: "pasar_kliwon",
    name: "Kecamatan Pasar Kliwon",
    shortName: "Pasar Kliwon",
    center: { lat: -7.5750, lng: 110.8320 },
    radiusMeters: 2200,
    description: "Pusat Sejarah Budaya Keraton, Pemerintahan Balaikota & Grosir Tekstil Klewer",
    landmarks: ["Balaikota Surakarta", "Keraton Kasunanan", "Pasar Klewer", "Masjid Agung Solo"],
    demandLevel: "Tinggi",
    estimatedOrdersPerHour: 31,
    tagColor: "blue"
  },
  {
    id: "serengan",
    name: "Kecamatan Serengan",
    shortName: "Serengan",
    center: { lat: -7.5815, lng: 110.8142 },
    radiusMeters: 2000,
    description: "Kawasan Sentra Kuliner Legendaris, Notosuman, Kratonan & Pemukiman Padat",
    landmarks: ["Serabi Notosuman", "Selat Solo Mbak Lies", "Kawasan Tipes", "Danukusuman"],
    demandLevel: "Sedang",
    estimatedOrdersPerHour: 22,
    tagColor: "emerald"
  }
];

export const DEMAND_HOTSPOTS_SOLO: DemandHotspot[] = [
  {
    id: "hotspot_uns",
    districtId: "jebres",
    name: "Universitas Sebelas Maret (UNS)",
    category: "campus",
    lat: -7.5589,
    lng: 110.8561,
    weight: 18,
    demandLevel: "Sangat Tinggi",
    ordersPerHour: 26,
    avgPickupWaitMinutes: 2,
    recommendedBasecamp: "Depan Gerbang Depan UNS & Boulevard Kentingan",
    description: "Aktivitas mahasiswa tinggi untuk pesanan ojek, kirim tugas, dan pesanan kuliner."
  },
  {
    id: "hotspot_balapan",
    districtId: "banjarsari",
    name: "Stasiun Solo Balapan",
    category: "transport",
    lat: -7.5583,
    lng: 110.8214,
    weight: 16,
    demandLevel: "Sangat Tinggi",
    ordersPerHour: 22,
    avgPickupWaitMinutes: 3,
    recommendedBasecamp: "Area Parkir Timur Stasiun & Jl. Wolter Monginsidi",
    description: "Titik kedatangan KRL Commuter Line Jogja-Solo dan Kereta Api Jarak Jauh."
  },
  {
    id: "hotspot_pasargede",
    districtId: "jebres",
    name: "Pasar Gede Harjonagoro",
    category: "market",
    lat: -7.5689,
    lng: 110.8322,
    weight: 14,
    demandLevel: "Tinggi",
    ordersPerHour: 18,
    avgPickupWaitMinutes: 2,
    recommendedBasecamp: "Pintu Masuk Barat Pasar Gede & Tugu Jam Pasar",
    description: "Ramai pembeli kuliner dawet telasih, sembako pasar, dan wisatawan."
  },
  {
    id: "hotspot_manahan",
    districtId: "banjarsari",
    name: "Kawasan Stadion Manahan",
    category: "tourism",
    lat: -7.5542,
    lng: 110.8067,
    weight: 12,
    demandLevel: "Tinggi",
    ordersPerHour: 15,
    avgPickupWaitMinutes: 3,
    recommendedBasecamp: "Shelter PKL Manahan & Plaza Patung Soekarno",
    description: "Pusat olahraga, car free day mingguan, dan event olahraga/konser."
  },
  {
    id: "hotspot_paragon",
    districtId: "banjarsari",
    name: "Solo Paragon Lifestyle Mall",
    category: "mall",
    lat: -7.5622,
    lng: 110.8118,
    weight: 12,
    demandLevel: "Tinggi",
    ordersPerHour: 14,
    avgPickupWaitMinutes: 4,
    recommendedBasecamp: "Drop-off Lobby Barat Jl. Yosodipuro",
    description: "Tinggi permintaan kuliner resto & belanja ritel."
  },
  {
    id: "hotspot_sologrand",
    districtId: "laweyan",
    name: "Solo Grand Mall & Purwosari",
    category: "mall",
    lat: -7.5639,
    lng: 110.8005,
    weight: 11,
    demandLevel: "Tinggi",
    ordersPerHour: 13,
    avgPickupWaitMinutes: 3,
    recommendedBasecamp: "Pintu Selatan Jl. Slamet Riyadi",
    description: "Pusat keramaian belanja dan dekat perlintasan rel Purwosari."
  },
  {
    id: "hotspot_moewardi",
    districtId: "jebres",
    name: "RSUD Dr. Moewardi Solo",
    category: "hospital",
    lat: -7.5578,
    lng: 110.8428,
    weight: 10,
    demandLevel: "Tinggi",
    ordersPerHour: 12,
    avgPickupWaitMinutes: 3,
    recommendedBasecamp: "Pintu Keluar Instalasi Rawat Jalan Jl. Kolonel Sutarto",
    description: "Tinggi permintaan pengantaran obat Dinkes, resep, dan keluarga pasien."
  },
  {
    id: "hotspot_balaikota",
    districtId: "pasar_kliwon",
    name: "Balaikota Surakarta & Jl. Jend. Sudirman",
    category: "tourism",
    lat: -7.5694,
    lng: 110.8297,
    weight: 9,
    demandLevel: "Sedang",
    ordersPerHour: 10,
    avgPickupWaitMinutes: 4,
    recommendedBasecamp: "Kawasan Benteng Vastenburg & Titik Nol Kilometer Solo",
    description: "Pusat kantor dinas pemerintahan Kota Solo dan event budaya balai kota."
  },
  {
    id: "hotspot_serabi",
    districtId: "serengan",
    name: "Sentra Serabi Notosuman & Kratonan",
    category: "tourism",
    lat: -7.5794,
    lng: 110.8192,
    weight: 8,
    demandLevel: "Sedang",
    ordersPerHour: 9,
    avgPickupWaitMinutes: 3,
    recommendedBasecamp: "Jl. Moh. Yamin & Pintu Toko Serabi Ny. Lidia",
    description: "Titik oleh-oleh legendaris dan kuliner Serengan."
  }
];

// Helper: Calculate distance between two GPS coordinates in Kilometers (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper: Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Helper: Find closest district from coordinates
export function getClosestDistrict(lat: number, lng: number): SoloDistrict {
  let closest = SOLO_DISTRICTS[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.center.lat, closest.center.lng);

  for (let i = 1; i < SOLO_DISTRICTS.length; i++) {
    const dist = calculateDistanceKm(lat, lng, SOLO_DISTRICTS[i].center.lat, SOLO_DISTRICTS[i].center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = SOLO_DISTRICTS[i];
    }
  }

  return closest;
}
