import { Merchant, MenuItemDocument } from "@/types/merchant.types";

export const LOCAL_MERCHANTS_SURAKARTA: Merchant[] = [
  {
    id: "m-1",
    storeSlug: "pak-manto",
    name: "Sate Kambing & Tengkleng Pak Manto",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 1840,
    area: "Jl. Honggowongso No. 36, Sriwedari",
    distanceKm: 1.2,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Voucher Diskon Rp 5.000",
    popularItems: ["Tengkleng Rica Pedas", "Sate Buntel Khas Solo", "Gule Kambing Segar"]
  },
  {
    id: "m-2",
    storeSlug: "dawet-bu-dermi",
    name: "Es Dawet Telasih Bu Dermi",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 1520,
    area: "Pintu Masuk Utama Pasar Gede, Sudiroprajan",
    distanceKm: 0.8,
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Gratis 1 Dawet (20 Poin)",
    popularItems: ["Es Dawet Telasih Komplit", "Bubur Sumsum Kinca", "Es Gempol Pleret Khas Solo"]
  },
  {
    id: "m-3",
    storeSlug: "selat-mbak-lies",
    name: "Selat Solo & Gado-Gado Mbak Lies",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 1610,
    area: "Gang II No. 42, Serengan",
    distanceKm: 2.1,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Bebas Ongkir Titip Tetangga",
    popularItems: ["Selat Galantin Daging Sapi", "Selat Bistik Segar", "Sop Matahari Keraton"]
  },
  {
    id: "m-4",
    storeSlug: "nasi-liwet-wongso-lemu",
    name: "Nasi Liwet Wongso Lemu Asli 1950",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 1450,
    area: "Jl. Teuku Umar, Keprabon, Banjarsari",
    distanceKm: 1.5,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Legendaris Solo 1950",
    popularItems: ["Nasi Liwet Ayam Suwir Komplit", "Nasi Liwet Paha Atas Areh", "Sayur Labu Siam Gurih"]
  },
  {
    id: "m-5",
    storeSlug: "timlo-sastro",
    name: "Timlo Solo Sastro 1952 Pasar Gede",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 1280,
    area: "Jl. Kapten Mulyadi No. 8, Belakang Pasar Gede",
    distanceKm: 0.9,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Kuah Kaldu Segar Panas",
    popularItems: ["Timlo Komplit Sosis & Telur", "Sosis Solo Basah Kuah", "Sosis Solo Goreng Renyah"]
  },
  {
    id: "m-6",
    storeSlug: "soto-gading-1",
    name: "Soto Ayam Gading 1",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 2150,
    area: "Jl. Brigjen Sudiarto No. 75, Joyosuran, Gading",
    distanceKm: 2.4,
    imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Langganan Tokoh Solo",
    popularItems: ["Soto Ayam Gading Komplit", "Sate Paru Bacem Sapi", "Tempe Garing Renyah"]
  },
  {
    id: "m-7",
    storeSlug: "serabi-notosuman",
    name: "Serabi Notosuman Ny. Lidia",
    category: "kuliner",
    rating: 4.9,
    totalReviews: 3400,
    area: "Jl. Moh. Yamin No. 28, Notosuman, Serengan",
    distanceKm: 1.8,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Oleh-Oleh Khas No. 1",
    popularItems: ["Serabi Notosuman Coklat (10 Pcs)", "Serabi Polos Pandan (10 Pcs)", "Serabi Campur Spesial"]
  },
  {
    id: "m-8",
    storeSlug: "soto-triwindu",
    name: "Soto Daging Sapi Triwindu 1939",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 890,
    area: "Jl. Teuku Umar No. 43, Keprabon (Pasar Triwindu)",
    distanceKm: 1.4,
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Resep Keraton 1939",
    popularItems: ["Soto Daging Sapi Triwindu", "Empal Sapi Goreng Gurih", "Paru Sapi Goreng Crispy"]
  },
  {
    id: "m-9",
    storeSlug: "gudeg-ceker-margoyudan",
    name: "Gudeg Ceker Bu Kasno Margoyudan",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 1120,
    area: "Jl. Monginsidi No. 41, Margoyudan, Banjarsari",
    distanceKm: 1.7,
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Ceker Super Empuk Lumer",
    popularItems: ["Nasi Gudeg Ceker Komplit (10 Ceker)", "Gudeg Ayam Suwir & Areh", "Sambal Goreng Krecek Pedas"]
  },
  {
    id: "m-10",
    storeSlug: "bebek-h-slamet",
    name: "Bebek Goreng H. Slamet Asli Kartasura",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 1680,
    area: "Jl. Slamet Riyadi No. 340, Sriwedari, Laweyan",
    distanceKm: 1.9,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Sambal Korek Uleg Segar",
    popularItems: ["Bebek Goreng Kremes Paha/Dada", "Bebek Remuk Sambal Korek", "Nasi Uduk Daun Pisang"]
  },
  {
    id: "m-11",
    storeSlug: "tahok-berlian",
    name: "Tahok Berlian Tradisional Pasar Gede",
    category: "kuliner",
    rating: 4.7,
    totalReviews: 540,
    area: "Jl. Suryopranoto No. 21 (Dekat Pasar Gede), Jebres",
    distanceKm: 0.8,
    imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Hangat Jahe Alami",
    popularItems: ["Tahok Kuah Jahe Gula Jawa", "Susu Kedelai Hangat Asli", "Kembang Tahu Double Jahe"]
  },
  {
    id: "m-12",
    storeSlug: "wedangan-pendopo",
    name: "Wedangan Pendopo Solo 1968",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 830,
    area: "Jl. Srigading I No. 7, Mangkubumen, Banjarsari",
    distanceKm: 2.0,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Suasana Klasik Nuansa Jawa",
    popularItems: ["Wedang Dongo Rempah Solo", "Wedang Uwuh Komplit", "Nasi Kucing Bandeng Sambal Bawang"]
  },
  {
    id: "m-13",
    storeSlug: "bakso-titoti",
    name: "Bakso Sapi & Tetelan Titoti Solo",
    category: "kuliner",
    rating: 4.8,
    totalReviews: 1350,
    area: "Jl. Honggowongso No. 35, Panularan, Laweyan",
    distanceKm: 1.3,
    imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Kuah Kaldu Sumsum Asli",
    popularItems: ["Bakso Urat Jumbo Spesial Tetelan", "Bakso Telur Komplit Mie Kuning", "Pangsit Goreng Renyah"]
  },
  {
    id: "m-14",
    storeSlug: "kios-mbok-darmi",
    name: "Kios Sayur Segar Mbok Darmi",
    category: "pasar",
    rating: 4.9,
    totalReviews: 480,
    area: "Lantai 1 Sayur Subuh, Pasar Gede Harjonagoro",
    distanceKm: 0.7,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
    isOpen: true,
    promoTag: "Panen Segar Petani Merbabu",
    popularItems: ["Paket Sayur Asem Komplit", "Paket Sayur Lodeh Pawon Solo", "Bumbu Pawon Dapur Segar"]
  }
];

export const DEFAULT_MERCHANT_MENUS: Record<string, MenuItemDocument[]> = {
  // 1. PAK MANTO
  "m-1": [
    {
      id: "manto-1",
      merchantId: "m-1",
      name: "Tengkleng Rica Pedas Pak Manto",
      description: "Tulang iga & daging kambing empuk berbalut bumbu rica-rica pedas gurih khas legendaris Solo.",
      price: 65000,
      isAvailable: true,
      soldToday: 58
    },
    {
      id: "manto-2",
      merchantId: "m-1",
      name: "Sate Buntel Kambing (2 Tusuk Jumbo)",
      description: "Daging kambing cincang empuk berbalut lemak tipis gurih dengan olesan kecap manis Solo.",
      price: 60000,
      isAvailable: true,
      soldToday: 45
    },
    {
      id: "manto-3",
      merchantId: "m-1",
      name: "Sate Kambing Campur (10 Tusuk)",
      description: "Daging kambing muda empuk dipadu irisan bawang merah dan tomat segar.",
      price: 55000,
      isAvailable: true,
      soldToday: 34
    },
    {
      id: "manto-4",
      merchantId: "m-1",
      name: "Gule Kambing Segar",
      description: "Kuah gule rempah kuning santan gurih nikmat dengan potongan jeroan & daging empuk.",
      price: 45000,
      isAvailable: true,
      soldToday: 22
    },
    {
      id: "manto-5",
      merchantId: "m-1",
      name: "Nasi Putih Pulen Hangat",
      description: "Porsi nasi pulen wangi beras lokal Solo.",
      price: 5000,
      isAvailable: true,
      soldToday: 95
    },
    {
      id: "manto-6",
      merchantId: "m-1",
      name: "Es Teh Oplos Manis Mantap",
      description: "Teh racikan 3 merk khas Solo (Wasgitel: wangi, panas, sepet, legi, kenthel).",
      price: 5000,
      isAvailable: true,
      soldToday: 82
    }
  ],

  // 2. DAWET BU DERMI
  "m-2": [
    {
      id: "dermi-1",
      merchantId: "m-2",
      name: "Es Dawet Telasih Komplit",
      description: "Cendol hijau, biji telasih, bubur sumsum, tape ketan hitam, santan gurih & gula cair Pasar Gede.",
      price: 15000,
      isAvailable: true,
      soldToday: 92
    },
    {
      id: "dermi-2",
      merchantId: "m-2",
      name: "Es Gempol Pleret Khas Solo",
      description: "Bulatan gempol tepung beras gurih dan pleret manis berpadu kuah santan dingin segar.",
      price: 15000,
      isAvailable: true,
      soldToday: 44
    },
    {
      id: "dermi-3",
      merchantId: "m-2",
      name: "Bubur Sumsum Kinca Gula Jawa",
      description: "Bubur tepung beras selembut sutra dengan siraman gula kelapa asli.",
      price: 12000,
      isAvailable: true,
      soldToday: 38
    }
  ],

  // 3. SELAT MBAK LIES
  "m-3": [
    {
      id: "lies-1",
      merchantId: "m-3",
      name: "Selat Galantin Daging Sapi",
      description: "Galantin daging sapi lembut, telur pindang, buncis, wortel, kentang goreng & saus mustard Solo.",
      price: 25000,
      isAvailable: true,
      soldToday: 68
    },
    {
      id: "lies-2",
      merchantId: "m-3",
      name: "Selat Bistik Daging Segar",
      description: "Potongan daging bistik empuk dengan kuah asam manis gurih rempah ala kuliner Eropa-Jawa.",
      price: 28000,
      isAvailable: true,
      soldToday: 52
    },
    {
      id: "lies-3",
      merchantId: "m-3",
      name: "Sop Matahari Keraton Solo",
      description: "Kulit dadar telur berisikan ayam cincang & jamur yang mekar indah seperti kelopak matahari.",
      price: 22000,
      isAvailable: true,
      soldToday: 30
    },
    {
      id: "lies-4",
      merchantId: "m-3",
      name: "Sop Pengantin Khas Solo",
      description: "Sop kaldu bening dengan isian rolade daging, makaroni, jamur putih dan kembang tahu.",
      price: 22000,
      isAvailable: true,
      soldToday: 26
    }
  ],

  // 4. NASI LIWET WONGSO LEMU
  "m-4": [
    {
      id: "liwet-1",
      merchantId: "m-4",
      name: "Nasi Liwet Ayam Suwir Komplit",
      description: "Nasi gurih beraroma daun salam & serai, disajikan dengan ayam suwir, sayur labu siam, telur areh & kumut gurih.",
      price: 28000,
      isAvailable: true,
      soldToday: 76
    },
    {
      id: "liwet-2",
      merchantId: "m-4",
      name: "Nasi Liwet Paha Atas & Telur Pindang",
      description: "Nasi liwet komplit porsi mantap dengan potongan paha ayam kampung ungkep santan.",
      price: 38000,
      isAvailable: true,
      soldToday: 48
    },
    {
      id: "liwet-3",
      merchantId: "m-4",
      name: "Ati Ampela Ungkep Gurih",
      description: "Satu tusuk ati ampela ayam kampung empuk berbumbu gurih manis.",
      price: 10000,
      isAvailable: true,
      soldToday: 35
    }
  ],

  // 5. TIMLO SASTRO
  "m-5": [
    {
      id: "timlo-1",
      merchantId: "m-5",
      name: "Timlo Sastro Komplit Spesial",
      description: "Sosis solo basah & goreng, telur pindang kecap, ati ampela dan suwiran ayam kampung disiram kuah kaldu panas.",
      price: 32000,
      isAvailable: true,
      soldToday: 80
    },
    {
      id: "timlo-2",
      merchantId: "m-5",
      name: "Sosis Solo Basah Kuah (Isi 3)",
      description: "Dadar telur gulung berisikan daging ayam cincang empuk disiram kuah kaldu rempah.",
      price: 18000,
      isAvailable: true,
      soldToday: 42
    },
    {
      id: "timlo-3",
      merchantId: "m-5",
      name: "Sosis Solo Goreng Renyah (Isi 3)",
      description: "Sosis solo gulung goreng renyah garing dengan cabe rawit hijau segar.",
      price: 18000,
      isAvailable: true,
      soldToday: 55
    }
  ],

  // 6. SOTO GADING 1
  "m-6": [
    {
      id: "gading-1",
      merchantId: "m-6",
      name: "Soto Ayam Gading Komplit",
      description: "Kuah kaldu ayam bening kaya rempah, soun, tauge, seledri dan suwiran ayam kampung empuk.",
      price: 18000,
      isAvailable: true,
      soldToday: 110
    },
    {
      id: "gading-2",
      merchantId: "m-6",
      name: "Sate Paru Bacem Sapi",
      description: "Paru sapi tebal empuk dibacem manis gurih lalu digoreng pas.",
      price: 12000,
      isAvailable: true,
      soldToday: 64
    },
    {
      id: "gading-3",
      merchantId: "m-6",
      name: "Tempe Goreng Garing Renyah (Isi 3)",
      description: "Tempe tipis goreng renyah khas pelengkap soto gading.",
      price: 6000,
      isAvailable: true,
      soldToday: 140
    }
  ],

  // 7. SERABI NOTOSUMAN
  "m-7": [
    {
      id: "serabi-1",
      merchantId: "m-7",
      name: "Serabi Notosuman Coklat (1 Box Isi 10)",
      description: "Serabi tepung beras santan kental dengan topping coklat lumer legendaris asli Notosuman.",
      price: 35000,
      isAvailable: true,
      soldToday: 120
    },
    {
      id: "serabi-2",
      merchantId: "m-7",
      name: "Serabi Notosuman Polos Pandan (1 Box Isi 10)",
      description: "Serabi santan gurih beraroma daun pandan wangi lembut.",
      price: 33000,
      isAvailable: true,
      soldToday: 90
    },
    {
      id: "serabi-3",
      merchantId: "m-7",
      name: "Serabi Campur Coklat & Polos (1 Box Isi 10)",
      description: "5 pcs serabi coklat lumer + 5 pcs serabi polos pandan.",
      price: 34000,
      isAvailable: true,
      soldToday: 160
    }
  ],

  // 8. SOTO TRIWINDU
  "m-8": [
    {
      id: "triwindu-1",
      merchantId: "m-8",
      name: "Soto Daging Sapi Triwindu",
      description: "Kuah kaldu daging sapi pekat gurih rempah tradisional, tauge segar dan irisan daging sapi empuk.",
      price: 25000,
      isAvailable: true,
      soldToday: 65
    },
    {
      id: "triwindu-2",
      merchantId: "m-8",
      name: "Empal Daging Sapi Goreng Gurih",
      description: "Daging sapi pilihan bertekstur empuk berbumbu ketumbar bawang gurih.",
      price: 18000,
      isAvailable: true,
      soldToday: 42
    },
    {
      id: "triwindu-3",
      merchantId: "m-8",
      name: "Paru Sapi Goreng Crispy",
      description: "Irisan paru sapi tipis renyah tanpa bau amis.",
      price: 15000,
      isAvailable: true,
      soldToday: 38
    }
  ],

  // 9. GUDEG CEKER MARGOYUDAN
  "m-9": [
    {
      id: "gudeg-1",
      merchantId: "m-9",
      name: "Nasi Gudeg Ceker Komplit (10 Ceker)",
      description: "Nasi gudeg manis gurih, 10 biji ceker ayam kampung empuk lumer di lidah, sambal goreng krecek pedas & kuah areh santan.",
      price: 35000,
      isAvailable: true,
      soldToday: 85
    },
    {
      id: "gudeg-2",
      merchantId: "m-9",
      name: "Gudeg Ayam Kampung Suwir & Areh",
      description: "Nasi gudeg dengan suwiran ayam kampung gurih dan telur pindang kecap.",
      price: 28000,
      isAvailable: true,
      soldToday: 45
    },
    {
      id: "gudeg-3",
      merchantId: "m-9",
      name: "Ekstra Ceker Empuk (5 Pcs)",
      description: "Porsi tambahan 5 biji ceker ayam kampung super empuk.",
      price: 15000,
      isAvailable: true,
      soldToday: 55
    }
  ],

  // 10. BEBEK H. SLAMET
  "m-10": [
    {
      id: "bebek-1",
      merchantId: "m-10",
      name: "Paket Bebek Goreng Kremes Paha/Dada",
      description: "Bebek ungkep bumbu kuning digoreng renyah garing disajikan dengan nasi hangat, lalapan & sambal korek uleg pedas mantap.",
      price: 38000,
      isAvailable: true,
      soldToday: 95
    },
    {
      id: "bebek-2",
      merchantId: "m-10",
      name: "Bebek Remuk Sambal Korek",
      description: "Daging bebek remuk crispy disiram minyak sambal korek panas menggugah selera.",
      price: 36000,
      isAvailable: true,
      soldToday: 60
    },
    {
      id: "bebek-3",
      merchantId: "m-10",
      name: "Sambal Korek Cobek Ekstra",
      description: "Sambal cabe rawit merah bawang putih uleg dadakan dengan siraman minyak panas.",
      price: 6000,
      isAvailable: true,
      soldToday: 75
    }
  ],

  // 11. TAHOK BERLIAN
  "m-11": [
    {
      id: "tahok-1",
      merchantId: "m-11",
      name: "Tahok Kuah Jahe Gula Jawa Hangat",
      description: "Kembang tahu kedelai murni bertekstur selembut sutra dengan siraman kuah jahe gula merah rempah hangat.",
      price: 12000,
      isAvailable: true,
      soldToday: 60
    },
    {
      id: "tahok-2",
      merchantId: "m-11",
      name: "Susu Kedelai Murni Hangat / Dingin",
      description: "Susu sari kedelai segar tanpa bahan pengawet.",
      price: 8000,
      isAvailable: true,
      soldToday: 40
    }
  ],

  // 12. WEDANGAN PENDOPO
  "m-12": [
    {
      id: "wedang-1",
      merchantId: "m-12",
      name: "Wedang Dongo Rempah Khas Solo",
      description: "Minuman jahe hangat dengan isian ronde kacang tanah tumbuk, kolang-kaling dan serutan kelapa muda.",
      price: 15000,
      isAvailable: true,
      soldToday: 50
    },
    {
      id: "wedang-2",
      merchantId: "m-12",
      name: "Wedang Uwuh Komplit Rempah Imogiri",
      description: "Seduhan secang, jahe, kayu manis, cengkeh & gula batu berkhasiat menghangatkan tubuh.",
      price: 12000,
      isAvailable: true,
      soldToday: 45
    },
    {
      id: "wedang-3",
      merchantId: "m-12",
      name: "Nasi Kucing Bandeng Sambal Bawang (2 Bungkus)",
      description: "Nasi porsi kecil daun pisang dengan suwiran bandeng goreng dan sambal terasi gurih.",
      price: 8000,
      isAvailable: true,
      soldToday: 110
    }
  ],

  // 13. BAKSO TITOTI
  "m-13": [
    {
      id: "titoti-1",
      merchantId: "m-13",
      name: "Bakso Urat Jumbo Spesial Tetelan",
      description: "Bakso urat sapi kenyal mantap, bakso halus, tetelan sapi melimpah, mie kuning, bihun & kuah kaldu gurih berlemak.",
      price: 28000,
      isAvailable: true,
      soldToday: 88
    },
    {
      id: "titoti-2",
      merchantId: "m-13",
      name: "Bakso Telur Komplit",
      description: "Bakso berisikan telur ayam utuh dipadu bakso kecil & tahu bakso lembut.",
      price: 26000,
      isAvailable: true,
      soldToday: 62
    },
    {
      id: "titoti-3",
      merchantId: "m-13",
      name: "Pangsit Goreng Renyah Titoti (Isi 3)",
      description: "Pangsit goreng isi daging renyah gurih pelengkap kuah bakso.",
      price: 8000,
      isAvailable: true,
      soldToday: 75
    }
  ],

  // 14. KIOS MBOK DARMI (PASAR GEDE)
  "m-14": [
    {
      id: "darmi-1",
      merchantId: "m-14",
      name: "Paket Sayur Asem Komplit Merbabu",
      description: "Jagung manis, labu siam, kacang panjang, melinjo, daun melinjo & bumbu asem segar pawon.",
      price: 12000,
      isAvailable: true,
      soldToday: 40
    },
    {
      id: "darmi-2",
      merchantId: "m-14",
      name: "Paket Sayur Lodeh & Tempe Semangit",
      description: "Nangka muda (gori), labu siam, terong ungu, tempe semangit & santan kelapa murni.",
      price: 14000,
      isAvailable: true,
      soldToday: 35
    },
    {
      id: "darmi-3",
      merchantId: "m-14",
      name: "Bumbu Pawon Dapur Segar Komplit",
      description: "Bawang merah Brebes, bawang putih kating, cabai rawit merah, jahe, kunyit & lengkuas 250gr.",
      price: 18000,
      isAvailable: true,
      soldToday: 50
    }
  ]
};

// Aliases for slug lookups
DEFAULT_MERCHANT_MENUS["pak-manto"] = DEFAULT_MERCHANT_MENUS["m-1"];
DEFAULT_MERCHANT_MENUS["dawet-bu-dermi"] = DEFAULT_MERCHANT_MENUS["m-2"];
DEFAULT_MERCHANT_MENUS["selat-mbak-lies"] = DEFAULT_MERCHANT_MENUS["m-3"];
DEFAULT_MERCHANT_MENUS["nasi-liwet-wongso-lemu"] = DEFAULT_MERCHANT_MENUS["m-4"];
DEFAULT_MERCHANT_MENUS["timlo-sastro"] = DEFAULT_MERCHANT_MENUS["m-5"];
DEFAULT_MERCHANT_MENUS["soto-gading-1"] = DEFAULT_MERCHANT_MENUS["m-6"];
DEFAULT_MERCHANT_MENUS["serabi-notosuman"] = DEFAULT_MERCHANT_MENUS["m-7"];
DEFAULT_MERCHANT_MENUS["soto-triwindu"] = DEFAULT_MERCHANT_MENUS["m-8"];
DEFAULT_MERCHANT_MENUS["gudeg-ceker-margoyudan"] = DEFAULT_MERCHANT_MENUS["m-9"];
DEFAULT_MERCHANT_MENUS["bebek-h-slamet"] = DEFAULT_MERCHANT_MENUS["m-10"];
DEFAULT_MERCHANT_MENUS["tahok-berlian"] = DEFAULT_MERCHANT_MENUS["m-11"];
DEFAULT_MERCHANT_MENUS["wedangan-pendopo"] = DEFAULT_MERCHANT_MENUS["m-12"];
DEFAULT_MERCHANT_MENUS["bakso-titoti"] = DEFAULT_MERCHANT_MENUS["m-13"];
DEFAULT_MERCHANT_MENUS["kios-mbok-darmi"] = DEFAULT_MERCHANT_MENUS["m-14"];

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
  { name: "Stasiun Solo Balapan", area: "Banjarsari", demand: "Tinggi", multiplier: "1.0x", lat: -7.5583, lng: 110.8214, weight: 8 },
  { name: "Universitas Sebelas Maret (UNS)", area: "Jebres", demand: "Sangat Tinggi", multiplier: "1.0x", lat: -7.5589, lng: 110.8561, weight: 15 },
  { name: "Pasar Gede & Pasar Legi", area: "Pasar Kliwon", demand: "Tinggi", multiplier: "1.0x", lat: -7.5689, lng: 110.8322, weight: 10 },
  { name: "Kawasan Stadion Manahan", area: "Banjarsari", demand: "Sedang", multiplier: "1.0x", lat: -7.5542, lng: 110.8067, weight: 5 },
  { name: "Solo Square & Solo Grand Mall", area: "Laweyan", demand: "Tinggi", multiplier: "1.0x", lat: -7.5574, lng: 110.7857, weight: 8 }
];
