import { Merchant } from "@/types/merchant.types";

export const LOCAL_MERCHANTS_SURAKARTA: Merchant[] = [
  {
    id: "m-1",
    storeSlug: "pak-manto",
    name: "Sate Kambing & Tengkleng Pak Manto",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 840,
    area: "Sriwedari, Surakarta",
    distanceKm: 1.2,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Voucher Diskon Rp 5.000",
    popularItems: ["Tengkleng Rica Pedas", "Sate Buntel Khas Solo", "Gule Kambing"]
  },
  {
    id: "m-2",
    storeSlug: "dawet-bu-dermi",
    name: "Es Dawet Telasih Bu Dermi",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 520,
    area: "Pasar Gede, Surakarta",
    distanceKm: 0.8,
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Gratis 1 Dawet (20 Poin)",
    popularItems: ["Es Dawet Telasih Komplit", "Bubur Sumsum", "Es Gempol Pleret"]
  },
  {
    id: "m-3",
    storeSlug: "selat-mbak-lies",
    name: "Selat Solo & Gado-Gado Mbak Lies",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 610,
    area: "Serengan, Surakarta",
    distanceKm: 2.1,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Bebas Ongkir Titip Tetangga",
    popularItems: ["Selat Galantin Daging", "Selat Bistik Segar", "Sop Matahari"]
  },
  {
    id: "m-4",
    storeSlug: "apotek-jebres",
    name: "Apotek & Toko Sehat Warga Jebres",
    category: "apotek",
    rating: 4.7,
    totalReviews: 230,
    area: "Jebres (Dekat UNS), Surakarta",
    distanceKm: 0.5,
    imageUrl: "https://images.unsplash.com/photo-1586015555751-63c29994c6f9?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Antar Kilat 15 Menit",
    popularItems: ["Vitamin C & Imun", "Obat Flu & Batuk", "Perlengkapan Bayi"]
  }
];

export const DEMAND_HOTSPOTS_SURAKARTA = [
  { name: "Stasiun Solo Balapan", area: "Banjarsari", demand: "Tinggi", multiplier: "1.0x" },
  { name: "Universitas Sebelas Maret (UNS)", area: "Jebres", demand: "Sangat Tinggi", multiplier: "1.0x" },
  { name: "Pasar Gede & Pasar Legi", area: "Pasar Kliwon", demand: "Tinggi", multiplier: "1.0x" },
  { name: "Kawasan Stadion Manahan", area: "Banjarsari", demand: "Sedang", multiplier: "1.0x" },
  { name: "Solo Square & Solo Grand Mall", area: "Laweyan", demand: "Tinggi", multiplier: "1.0x" }
];
