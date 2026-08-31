import { Merchant, MenuItemDocument } from "@/types/merchant.types";

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

export const DEFAULT_MERCHANT_MENUS: Record<string, MenuItemDocument[]> = {
  "m-1": [
    {
      id: "manto-1",
      merchantId: "m-1",
      name: "Tengkleng Rica Pedas Pak Manto",
      description: "Tulang kambing empuk dengan bumbu rica-rica pedas gurih khas legendaris Solo.",
      price: 65000,
      isAvailable: true,
      soldToday: 42
    },
    {
      id: "manto-2",
      merchantId: "m-1",
      name: "Sate Buntel Kambing (2 Tusuk Jumbo)",
      description: "Daging kambing cincang berbalut lemak tipis dibakar dengan kecap manis Solo.",
      price: 60000,
      isAvailable: true,
      soldToday: 38
    },
    {
      id: "manto-3",
      merchantId: "m-1",
      name: "Sate Kambing Campur (10 Tusuk)",
      description: "Daging kambing muda empuk dipadu irisan bawang merah dan tomat segar.",
      price: 55000,
      isAvailable: true,
      soldToday: 29
    },
    {
      id: "manto-4",
      merchantId: "m-1",
      name: "Gule Kambing Segar",
      description: "Kuah gule rempah kuning santan gurih nikmat dengan potongan daging empuk.",
      price: 45000,
      isAvailable: true,
      soldToday: 18
    },
    {
      id: "manto-5",
      merchantId: "m-1",
      name: "Nasi Putih Hangat",
      description: "Porsi nasi pulen wangi beras lokal Solo.",
      price: 5000,
      isAvailable: true,
      soldToday: 80
    },
    {
      id: "manto-6",
      merchantId: "m-1",
      name: "Es Teh Manis / Panas",
      description: "Teh oplosan khas Solo dengan wangi melati mantap sepet legi kental.",
      price: 5000,
      isAvailable: true,
      soldToday: 65
    }
  ],
  "m-2": [
    {
      id: "dermi-1",
      merchantId: "m-2",
      name: "Es Dawet Telasih Komplit",
      description: "Dawet hijau, biji telasih, bubur sumsum, tape ketan hitam, kuah santan & gula cair Pasar Gede.",
      price: 15000,
      isAvailable: true,
      soldToday: 75
    },
    {
      id: "dermi-2",
      merchantId: "m-2",
      name: "Es Gempol Pleret Khas Solo",
      description: "Bulatan gempol gurih dan pleret manis berpadu santan dingin segar.",
      price: 15000,
      isAvailable: true,
      soldToday: 30
    },
    {
      id: "dermi-3",
      merchantId: "m-2",
      name: "Bubur Sumsum Manis Gurih",
      description: "Bubur tepung beras lembut dengan siraman kinca gula jawa asli.",
      price: 12000,
      isAvailable: true,
      soldToday: 25
    }
  ],
  "m-3": [
    {
      id: "lies-1",
      merchantId: "m-3",
      name: "Selat Galantin Daging Sapi",
      description: "Galantin daging sapi lembut, telur pindang, buncis, wortel, kentang goreng & saus mustard Solo.",
      price: 25000,
      isAvailable: true,
      soldToday: 50
    },
    {
      id: "lies-2",
      merchantId: "m-3",
      name: "Selat Bistik Daging Segar",
      description: "Potongan daging bistik empuk dengan kuah asam manis gurih rempah.",
      price: 28000,
      isAvailable: true,
      soldToday: 35
    },
    {
      id: "lies-3",
      merchantId: "m-3",
      name: "Sop Matahari Khas Solo",
      description: "Kulit dadar telur berisikan ayam cincang & jamur yang mekar seperti bunga matahari.",
      price: 20000,
      isAvailable: true,
      soldToday: 20
    }
  ],
  "m-4": [
    {
      id: "apt-1",
      merchantId: "m-4",
      name: "Paket Vitamin Daya Tahan Tubuh C + Zinc",
      description: "Suplemen daya tahan tubuh harian (Strip 10 tablet).",
      price: 35000,
      isAvailable: true,
      soldToday: 15
    },
    {
      id: "apt-2",
      merchantId: "m-4",
      name: "Obat Paracetamol 500mg (Strip)",
      description: "Pereda demam & nyeri sakit kepala.",
      price: 8000,
      isAvailable: true,
      soldToday: 40
    },
    {
      id: "apt-3",
      merchantId: "m-4",
      name: "Minyak Kayu Putih Plus 60ml",
      description: "Minyak kayu putih aroma menenangkan & anti nyamuk.",
      price: 26000,
      isAvailable: true,
      soldToday: 18
    }
  ]
};

// Aliases for slug lookups
DEFAULT_MERCHANT_MENUS["pak-manto"] = DEFAULT_MERCHANT_MENUS["m-1"];
DEFAULT_MERCHANT_MENUS["dawet-bu-dermi"] = DEFAULT_MERCHANT_MENUS["m-2"];
DEFAULT_MERCHANT_MENUS["selat-mbak-lies"] = DEFAULT_MERCHANT_MENUS["m-3"];
DEFAULT_MERCHANT_MENUS["apotek-jebres"] = DEFAULT_MERCHANT_MENUS["m-4"];

export const POPULAR_SOLO_LANDMARKS = [
  { name: "Balaikota Surakarta", address: "Jl. Jend. Sudirman No.2, Kp. Baru, Kec. Pasar Kliwon, Kota Surakarta", lat: -7.5694, lng: 110.8297 },
  { name: "Stasiun Solo Balapan", address: "Jl. Wolter Monginsidi No.112, Kestalan, Kec. Banjarsari, Kota Surakarta", lat: -7.5583, lng: 110.8214 },
  { name: "Pasar Gede Harjonagoro", address: "Jl. Urip Sumoharjo, Sudiroprajan, Kec. Jebres, Kota Surakarta", lat: -7.5689, lng: 110.8322 },
  { name: "Universitas Sebelas Maret (UNS)", address: "Jl. Ir. Sutami No.36, Kentingan, Kec. Jebres, Kota Surakarta", lat: -7.5589, lng: 110.8561 },
  { name: "Solo Paragon Lifestyle Mall", address: "Jl. Yosodipuro No.133, Mangkubumen, Kec. Banjarsari, Kota Surakarta", lat: -7.5622, lng: 110.8118 },
  { name: "Stadion Manahan Solo", address: "Jl. Adi Sucipto No.1, Manahan, Kec. Banjarsari, Kota Surakarta", lat: -7.5542, lng: 110.8067 },
  { name: "Keraton Surakarta Hadiningrat", address: "Baluwarti, Kec. Pasar Kliwon, Kota Surakarta", lat: -7.5779, lng: 110.8281 },
  { name: "The Park Mall Solo Baru", address: "Jl. Ir. Soekarno, Madegondo, Grogol, Sukoharjo (Solo Baru)", lat: -7.5997, lng: 110.8172 },
  { name: "Pura Mangkunegaran", address: "Jl. Ronggowarsito, Keprabon, Kec. Banjarsari, Kota Surakarta", lat: -7.5667, lng: 110.8228 },
  { name: "Taman Sriwedari", address: "Jl. Slamet Riyadi No.275, Sriwedari, Kec. Laweyan, Kota Surakarta", lat: -7.5678, lng: 110.8114 },
  { name: "Bandara Internasional Adi Soemarmo", address: "Ngrayung, Dibal, Kec. Ngemplak, Kabupaten Boyolali (Akses Solo)", lat: -7.5161, lng: 110.7569 },
  { name: "Terminal Tirtonadi Solo", address: "Jl. Ahmad Yani, Gilingan, Kec. Banjarsari, Kota Surakarta", lat: -7.5503, lng: 110.8202 }
];

export const DEMAND_HOTSPOTS_SURAKARTA = [
  { name: "Stasiun Solo Balapan", area: "Banjarsari", demand: "Tinggi", multiplier: "1.0x" },
  { name: "Universitas Sebelas Maret (UNS)", area: "Jebres", demand: "Sangat Tinggi", multiplier: "1.0x" },
  { name: "Pasar Gede & Pasar Legi", area: "Pasar Kliwon", demand: "Tinggi", multiplier: "1.0x" },
  { name: "Kawasan Stadion Manahan", area: "Banjarsari", demand: "Sedang", multiplier: "1.0x" },
  { name: "Solo Square & Solo Grand Mall", area: "Laweyan", demand: "Tinggi", multiplier: "1.0x" }
];
