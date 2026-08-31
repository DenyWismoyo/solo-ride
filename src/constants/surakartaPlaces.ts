export interface SoloPlaceItem {
  id: string;
  name: string;
  category: "heritage" | "transport" | "market" | "campus" | "health" | "government" | "kelurahan";
  address: string;
  district: "Banjarsari" | "Jebres" | "Laweyan" | "Pasar Kliwon" | "Serengan" | "Solo Raya";
  lat: number;
  lng: number;
  popularRank?: number;
  description?: string;
}

export const SURAKARTA_MASTER_PLACES: SoloPlaceItem[] = [
  // ==========================================
  // 1. HERITAGE & BUDAYA SOLO
  // ==========================================
  {
    id: "h-keraton-solo",
    name: "Keraton Kasunanan Surakarta Hadiningrat",
    category: "heritage",
    address: "Baluwarti, Kec. Pasar Kliwon, Kota Surakarta",
    district: "Pasar Kliwon",
    lat: -7.5779,
    lng: 110.8281,
    popularRank: 1,
    description: "Pusat istana kerajaan Mataram Islam dan cagar budaya adiluhung Surakarta."
  },
  {
    id: "h-mangkunegaran",
    name: "Pura Mangkunegaran",
    category: "heritage",
    address: "Jl. Ronggowarsito, Keprabon, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5667,
    lng: 110.8228,
    popularRank: 2,
    description: "Istana kadipaten agung dengan pendopo terbesar se-Nusantara."
  },
  {
    id: "h-radya-pustaka",
    name: "Museum Radya Pustaka",
    category: "heritage",
    address: "Jl. Slamet Riyadi No. 275, Sriwedari, Kec. Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5683,
    lng: 110.8122,
    popularRank: 3,
    description: "Museum tertua di Indonesia dengan koleksi naskah kuno dan arca Mataram Kuno."
  },
  {
    id: "h-sriwedari",
    name: "Taman Sriwedari (Gedung Wayang Orang)",
    category: "heritage",
    address: "Jl. Slamet Riyadi No. 275, Sriwedari, Kec. Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5678,
    lng: 110.8114,
    popularRank: 4,
    description: "Pusat seni pertunjukan wayang orang dan taman rekreasi historis kota Solo."
  },
  {
    id: "h-vastenburg",
    name: "Benteng Vastenburg",
    category: "heritage",
    address: "Kedung Lumbu, Kec. Pasar Kliwon, Kota Surakarta",
    district: "Pasar Kliwon",
    lat: -7.5708,
    lng: 110.8328,
    popularRank: 5,
    description: "Benteng peninggalan era kolonial Belanda di pusat sumbu heritage Gladak."
  },
  {
    id: "h-triwindu",
    name: "Pasar Antik Triwindu (Ngarsopuro)",
    category: "heritage",
    address: "Jl. Diponegoro, Keprabon, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5681,
    lng: 110.8239,
    popularRank: 6,
    description: "Sentra pasar barang antik, pusaka, lukisan, lampu hias kuno dan perunggu."
  },
  {
    id: "h-laweyan",
    name: "Kampung Batik Laweyan (Masjid Laweyan 1546)",
    category: "heritage",
    address: "Jl. Dr. Rajiman No. 521, Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5661,
    lng: 110.7967,
    popularRank: 7,
    description: "Kawasan saudagar batik kuno dengan arsitektur dinding tinggi beratap benteng."
  },
  {
    id: "h-kauman",
    name: "Kampung Batik Kauman Solo",
    category: "heritage",
    address: "Kauman, Kec. Pasar Kliwon, Kota Surakarta",
    district: "Pasar Kliwon",
    lat: -7.5739,
    lng: 110.8286,
    popularRank: 8,
    description: "Sentra batik klasik motif keraton di kawasan pemukiman abdi dalem ulama."
  },
  {
    id: "h-lokananta",
    name: "Lokananta Heritage & Music Hub",
    category: "heritage",
    address: "Jl. Ahmad Yani No. 379, Kerten, Kec. Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5567,
    lng: 110.7936,
    popularRank: 9,
    description: "Pabrik piringan hitam dan studio rekaman pertama Republik Indonesia."
  },
  {
    id: "h-monumen-pers",
    name: "Monumen Pers Nasional Solo",
    category: "heritage",
    address: "Jl. Gajahmada No. 59, Timuran, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5644,
    lng: 110.8194,
    popularRank: 10,
    description: "Museum jurnalisme dan saksi berdirinya Persatuan Wartawan Indonesia (PWI)."
  },

  // ==========================================
  // 2. TRANSPORTASI & HUB KOTA
  // ==========================================
  {
    id: "t-balapan",
    name: "Stasiun Solo Balapan",
    category: "transport",
    address: "Jl. Wolter Monginsidi No. 112, Kestalan, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5583,
    lng: 110.8214,
    popularRank: 1,
    description: "Stasiun kereta api utama Surakarta untuk KRL Jogja-Solo & Kereta Eksekutif."
  },
  {
    id: "t-purwosari",
    name: "Stasiun Purwosari",
    category: "transport",
    address: "Jl. Slamet Riyadi No. 502, Purwosari, Kec. Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5647,
    lng: 110.7981,
    popularRank: 2,
    description: "Stasiun perlintasan KRL, Railbus Batara Kresna & KA Jaladara Heritage."
  },
  {
    id: "t-solo-kota",
    name: "Stasiun Solo Kota (Sangkrah)",
    category: "transport",
    address: "Sangkrah, Kec. Pasar Kliwon, Kota Surakarta",
    district: "Pasar Kliwon",
    lat: -7.5756,
    lng: 110.8389,
    popularRank: 3,
    description: "Stasiun cagar budaya di timur kota rute Wonogiri."
  },
  {
    id: "t-tirtonadi",
    name: "Terminal Tirtonadi Surakarta",
    category: "transport",
    address: "Jl. Ahmad Yani, Gilingan, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5503,
    lng: 110.8202,
    popularRank: 4,
    description: "Terminal bus tipe A modern berstandar bandara dengan jembatan layang ke Balapan."
  },
  {
    id: "t-adi-soemarmo",
    name: "Bandara Internasional Adi Soemarmo",
    category: "transport",
    address: "Ngrayung, Dibal, Kec. Ngemplak, Boyolali (Akses Solo)",
    district: "Solo Raya",
    lat: -7.5161,
    lng: 110.7569,
    popularRank: 5,
    description: "Bandar udara internasional gerbang udara utama Solo Raya."
  },

  // ==========================================
  // 3. PASAR TRADISIONAL & BELANJA
  // ==========================================
  {
    id: "m-pasar-gede",
    name: "Pasar Gede Harjonagoro",
    category: "market",
    address: "Jl. Urip Sumoharjo, Sudiroprajan, Kec. Jebres, Kota Surakarta",
    district: "Jebres",
    lat: -7.5689,
    lng: 110.8322,
    popularRank: 1,
    description: "Pasar tradisional tertua Solo, surga kuliner dawet telasih & bumbu rempah."
  },
  {
    id: "m-pasar-klewer",
    name: "Pasar Klewer Surakarta",
    category: "market",
    address: "Jl. Dr. Radjiman No. 5A, Gajahan, Kec. Pasar Kliwon, Kota Surakarta",
    district: "Pasar Kliwon",
    lat: -7.5772,
    lng: 110.8272,
    popularRank: 2,
    description: "Pusat grosir dan eceran tekstil dan batik terbesar di Jawa Tengah."
  },
  {
    id: "m-pasar-legi",
    name: "Pasar Legi Surakarta",
    category: "market",
    address: "Jl. Letjen S. Parman, Setabelan, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5606,
    lng: 110.8239,
    popularRank: 3,
    description: "Pasar induk sayur mayur, cabai, beras dan komoditas pangan terbesar Solo."
  },
  {
    id: "m-solo-paragon",
    name: "Solo Paragon Lifestyle Mall",
    category: "market",
    address: "Jl. Yosodipuro No. 133, Mangkubumen, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5622,
    lng: 110.8118,
    popularRank: 4,
    description: "Pusat perbelanjaan, bioskop, dan kuliner modern di tengah kota."
  },
  {
    id: "m-the-park",
    name: "The Park Mall Solo Baru",
    category: "market",
    address: "Jl. Ir. Soekarno, Madegondo, Grogol, Sukoharjo (Solo Baru)",
    district: "Solo Raya",
    lat: -7.5997,
    lng: 110.8172,
    popularRank: 5,
    description: "Mall terkemuka di kawasan bisnis Solo Baru."
  },
  {
    id: "m-solo-square",
    name: "Solo Square Mall",
    category: "market",
    address: "Jl. Slamet Riyadi No. 451, Pajang, Kec. Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5583,
    lng: 110.7889,
    popularRank: 6,
    description: "Pusat perbelanjaan strategis di pintu barat gerbang Kota Surakarta."
  },

  // ==========================================
  // 4. KAMPUS & PENDIDIKAN
  // ==========================================
  {
    id: "c-uns",
    name: "Universitas Sebelas Maret (UNS Kentingan)",
    category: "campus",
    address: "Jl. Ir. Sutami No. 36, Kentingan, Kec. Jebres, Kota Surakarta",
    district: "Jebres",
    lat: -7.5589,
    lng: 110.8561,
    popularRank: 1,
    description: "Kampus PTN terkemuka Surakarta dengan lebih dari 45.000 mahasiswa."
  },
  {
    id: "c-ums",
    name: "Universitas Muhammadiyah Surakarta (UMS Pabelan)",
    category: "campus",
    address: "Jl. A. Yani No. 157, Pabelan, Kartasura (Akses Barat Solo)",
    district: "Solo Raya",
    lat: -7.5564,
    lng: 110.7717,
    popularRank: 2,
    description: "Kampus PTS unggul dengan Gedung Edutorium KH Ahmad Dahlan."
  },
  {
    id: "c-isi",
    name: "Institut Seni Indonesia (ISI Surakarta)",
    category: "campus",
    address: "Jl. Ki Hajar Dewantara No. 19, Jebres, Kota Surakarta",
    district: "Jebres",
    lat: -7.5558,
    lng: 110.8567,
    popularRank: 3,
    description: "Perguruan tinggi negeri pusat pendidikan seni tari, karawitan, kriya dan pedalangan."
  },

  // ==========================================
  // 5. RUMAH SAKIT & FASKES
  // ==========================================
  {
    id: "k-moewardi",
    name: "RSUD Dr. Moewardi Surakarta",
    category: "health",
    address: "Jl. Kolonel Sutarto No. 132, Jebres, Kec. Jebres, Kota Surakarta",
    district: "Jebres",
    lat: -7.5583,
    lng: 110.8415,
    popularRank: 1,
    description: "Rumah sakit rujukan utama provinsi tipe A pendidikan di Jawa Tengah bagian selatan."
  },
  {
    id: "k-kasih-ibu",
    name: "RS Kasih Ibu Surakarta",
    category: "health",
    address: "Jl. Slamet Riyadi No. 404, Purwosari, Kec. Laweyan, Kota Surakarta",
    district: "Laweyan",
    lat: -7.5653,
    lng: 110.8036,
    popularRank: 2,
    description: "Rumah sakit swasta terpercaya di jantung Jl. Slamet Riyadi."
  },
  {
    id: "k-pku",
    name: "RS PKU Muhammadiyah Surakarta",
    category: "health",
    address: "Jl. Ronggowarsito No. 130, Timuran, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5681,
    lng: 110.8186,
    popularRank: 3,
    description: "Rumah sakit historis di kawasan Timuran Mangkunegaran."
  },

  // ==========================================
  // 6. PUSAT PEMERINTAHAN & LAYANAN PUBLIK
  // ==========================================
  {
    id: "g-balaikota",
    name: "Balaikota Surakarta & Kompleks Pemkot",
    category: "government",
    address: "Jl. Jend. Sudirman No. 2, Kampung Baru, Kec. Pasar Kliwon, Kota Surakarta",
    district: "Pasar Kliwon",
    lat: -7.5694,
    lng: 110.8297,
    popularRank: 1,
    description: "Pusat pemerintahan Kota Surakarta, Disdukcapil, dan pelayanan publik satu atap."
  },
  {
    id: "g-manahan",
    name: "Stadion Manahan Solo & Gelanggang Olahraga",
    category: "government",
    address: "Jl. Adi Sucipto No. 1, Manahan, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5542,
    lng: 110.8067,
    popularRank: 2,
    description: "Stadion megah standar internasional pusat olahraga dan rekreasi warga Solo."
  },
  {
    id: "g-polresta",
    name: "Polresta Surakarta (Mako Manahan)",
    category: "government",
    address: "Jl. Adi Sucipto No. 2, Manahan, Kec. Banjarsari, Kota Surakarta",
    district: "Banjarsari",
    lat: -7.5547,
    lng: 110.8094,
    popularRank: 3,
    description: "Markas Kepolisian Resor Kota Surakarta."
  },

  // ==========================================
  // 7. 54 KELURAHAN SE-KOTA SURAKARTA
  // ==========================================
  // --- KECAMATAN BANJARSARI (15 Kelurahan) ---
  { id: "kel-banyuanyar", name: "Kelurahan Banyuanyar", category: "kelurahan", address: "Banyuanyar, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5414, lng: 110.8019 },
  { id: "kel-banjarsari", name: "Kelurahan Banjarsari", category: "kelurahan", address: "Banjarsari, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5458, lng: 110.8142 },
  { id: "kel-gilingan", name: "Kelurahan Gilingan", category: "kelurahan", address: "Gilingan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5539, lng: 110.8247 },
  { id: "kel-kadipiro", name: "Kelurahan Kadipiro", category: "kelurahan", address: "Kadipiro, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5342, lng: 110.8222 },
  { id: "kel-keprabon", name: "Kelurahan Keprabon", category: "kelurahan", address: "Keprabon, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5683, lng: 110.8225 },
  { id: "kel-kestalan", name: "Kelurahan Kestalan", category: "kelurahan", address: "Kestalan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5603, lng: 110.8211 },
  { id: "kel-ketelan", name: "Kelurahan Ketelan", category: "kelurahan", address: "Ketelan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5647, lng: 110.8189 },
  { id: "kel-manahan", name: "Kelurahan Manahan", category: "kelurahan", address: "Manahan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5542, lng: 110.8067 },
  { id: "kel-mangkubumen", name: "Kelurahan Mangkubumen", category: "kelurahan", address: "Mangkubumen, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5619, lng: 110.8131 },
  { id: "kel-nusukan", name: "Kelurahan Nusukan", category: "kelurahan", address: "Nusukan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5481, lng: 110.8217 },
  { id: "kel-punggawan", name: "Kelurahan Punggawan", category: "kelurahan", address: "Punggawan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5614, lng: 110.8169 },
  { id: "kel-setabelan", name: "Kelurahan Setabelan", category: "kelurahan", address: "Setabelan, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5631, lng: 110.8258 },
  { id: "kel-sumber", name: "Kelurahan Sumber", category: "kelurahan", address: "Sumber, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5467, lng: 110.8042 },
  { id: "kel-timuran", name: "Kelurahan Timuran", category: "kelurahan", address: "Timuran, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5661, lng: 110.8175 },
  { id: "kel-joglo", name: "Kelurahan Joglo", category: "kelurahan", address: "Joglo, Kec. Banjarsari, Kota Surakarta", district: "Banjarsari", lat: -7.5381, lng: 110.8294 },

  // --- KECAMATAN JEBRES (11 Kelurahan) ---
  { id: "kel-gandekan", name: "Kelurahan Gandekan", category: "kelurahan", address: "Gandekan, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5692, lng: 110.8419 },
  { id: "kel-jagalan", name: "Kelurahan Jagalan", category: "kelurahan", address: "Jagalan, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5642, lng: 110.8411 },
  { id: "kel-jebres", name: "Kelurahan Jebres", category: "kelurahan", address: "Jebres, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5621, lng: 110.8547 },
  { id: "kel-kepatihan-kulon", name: "Kelurahan Kepatihan Kulon", category: "kelurahan", address: "Kepatihan Kulon, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5669, lng: 110.8297 },
  { id: "kel-kepatihan-wetan", name: "Kelurahan Kepatihan Wetan", category: "kelurahan", address: "Kepatihan Wetan, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5664, lng: 110.8336 },
  { id: "kel-mojosongo", name: "Kelurahan Mojosongo", category: "kelurahan", address: "Mojosongo, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5406, lng: 110.8458 },
  { id: "kel-pucangsawit", name: "Kelurahan Pucangsawit", category: "kelurahan", address: "Pucangsawit, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5686, lng: 110.8603 },
  { id: "kel-purwodiningratan", name: "Kelurahan Purwodiningratan", category: "kelurahan", address: "Purwodiningratan, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5647, lng: 110.8358 },
  { id: "kel-sewu", name: "Kelurahan Sewu", category: "kelurahan", address: "Sewu, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5683, lng: 110.8475 },
  { id: "kel-sudiroprajan", name: "Kelurahan Sudiroprajan", category: "kelurahan", address: "Sudiroprajan, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5689, lng: 110.8328 },
  { id: "kel-tegalharjo", name: "Kelurahan Tegalharjo", category: "kelurahan", address: "Tegalharjo, Kec. Jebres, Kota Surakarta", district: "Jebres", lat: -7.5636, lng: 110.8353 },

  // --- KECAMATAN LAWEYAN (11 Kelurahan) ---
  { id: "kel-bumi", name: "Kelurahan Bumi", category: "kelurahan", address: "Bumi, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5756, lng: 110.8033 },
  { id: "kel-jajar", name: "Kelurahan Jajar", category: "kelurahan", address: "Jajar, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5494, lng: 110.7936 },
  { id: "kel-karangasem", name: "Kelurahan Karangasem", category: "kelurahan", address: "Karangasem, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5486, lng: 110.7836 },
  { id: "kel-kerten", name: "Kelurahan Kerten", category: "kelurahan", address: "Kerten, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5564, lng: 110.7961 },
  { id: "kel-laweyan", name: "Kelurahan Laweyan", category: "kelurahan", address: "Laweyan, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5661, lng: 110.7967 },
  { id: "kel-pajang", name: "Kelurahan Pajang", category: "kelurahan", address: "Pajang, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5678, lng: 110.7858 },
  { id: "kel-panularan", name: "Kelurahan Panularan", category: "kelurahan", address: "Panularan, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5739, lng: 110.8125 },
  { id: "kel-penumping", name: "Kelurahan Penumping", category: "kelurahan", address: "Penumping, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5672, lng: 110.8089 },
  { id: "kel-purwosari", name: "Kelurahan Purwosari", category: "kelurahan", address: "Purwosari, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5636, lng: 110.8017 },
  { id: "kel-sondakan", name: "Kelurahan Sondakan", category: "kelurahan", address: "Sondakan, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5617, lng: 110.7936 },
  { id: "kel-sriwedari", name: "Kelurahan Sriwedari", category: "kelurahan", address: "Sriwedari, Kec. Laweyan, Kota Surakarta", district: "Laweyan", lat: -7.5686, lng: 110.8136 },

  // --- KECAMATAN PASAR KLIWON (10 Kelurahan) ---
  { id: "kel-baluwarti", name: "Kelurahan Baluwarti", category: "kelurahan", address: "Baluwarti, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5779, lng: 110.8281 },
  { id: "kel-gajahan", name: "Kelurahan Gajahan", category: "kelurahan", address: "Gajahan, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5794, lng: 110.8256 },
  { id: "kel-joyosuran", name: "Kelurahan Joyosuran", category: "kelurahan", address: "Joyosuran, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5858, lng: 110.8358 },
  { id: "kel-kampung-baru", name: "Kelurahan Kampung Baru", category: "kelurahan", address: "Kampung Baru, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5694, lng: 110.8297 },
  { id: "kel-kauman", name: "Kelurahan Kauman", category: "kelurahan", address: "Kauman, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5739, lng: 110.8286 },
  { id: "kel-kedung-lumbu", name: "Kelurahan Kedung Lumbu", category: "kelurahan", address: "Kedung Lumbu, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5714, lng: 110.8336 },
  { id: "kel-pasar-kliwon", name: "Kelurahan Pasar Kliwon", category: "kelurahan", address: "Pasar Kliwon, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5772, lng: 110.8344 },
  { id: "kel-sangkrah", name: "Kelurahan Sangkrah", category: "kelurahan", address: "Sangkrah, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5764, lng: 110.8406 },
  { id: "kel-semanggi", name: "Kelurahan Semanggi", category: "kelurahan", address: "Semanggi, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5892, lng: 110.8436 },
  { id: "kel-mojo", name: "Kelurahan Mojo", category: "kelurahan", address: "Mojo, Kec. Pasar Kliwon, Kota Surakarta", district: "Pasar Kliwon", lat: -7.5947, lng: 110.8419 },

  // --- KECAMATAN SERENGAN (7 Kelurahan) ---
  { id: "kel-danukusuman", name: "Kelurahan Danukusuman", category: "kelurahan", address: "Danukusuman, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5861, lng: 110.8228 },
  { id: "kel-jayengan", name: "Kelurahan Jayengan", category: "kelurahan", address: "Jayengan, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5747, lng: 110.8197 },
  { id: "kel-joyotakan", name: "Kelurahan Joyotakan", category: "kelurahan", address: "Joyotakan, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5936, lng: 110.8258 },
  { id: "kel-kemlayan", name: "Kelurahan Kemlayan", category: "kelurahan", address: "Kemlayan, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5706, lng: 110.8214 },
  { id: "kel-kratonan", name: "Kelurahan Kratonan", category: "kelurahan", address: "Kratonan, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5794, lng: 110.8194 },
  { id: "kel-serengan", name: "Kelurahan Serengan", category: "kelurahan", address: "Serengan, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5786, lng: 110.8147 },
  { id: "kel-tipes", name: "Kelurahan Tipes", category: "kelurahan", address: "Tipes, Kec. Serengan, Kota Surakarta", district: "Serengan", lat: -7.5797, lng: 110.8078 }
];
