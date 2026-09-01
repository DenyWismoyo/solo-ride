import { RoadIncident } from "@/types/traffic.types";

export const INITIAL_ROAD_INCIDENTS: RoadIncident[] = [
  {
    id: "inc-1",
    category: "event",
    title: "Car Free Day (CFD) Jl. Slamet Riyadi",
    description: "Jalur utama Jl. Slamet Riyadi (Purwosari s/d Bundaran Gladak) ditutup total untuk kegiatan CFD warga. Kendaraan dialihkan melalui Jl. Ronggowarsito dan Jl. Kebangkitan Nasional.",
    streetName: "Jl. Slamet Riyadi (Purwosari - Gladak)",
    districtId: "laweyan",
    location: {
      lat: -7.5678,
      lng: 110.8114,
      address: "Jl. Slamet Riyadi No.275, Sriwedari, Kec. Laweyan, Kota Surakarta"
    },
    reporterId: "officer_dishub_solo",
    reporterName: "Satlantas & Dishub Solo",
    reporterRole: "officer",
    status: "active",
    isVerifiedByDishub: true,
    verifiedByOfficerName: "Petugas Piket Dishub Surakarta",
    stillActiveCount: 42,
    resolvedCount: 2,
    createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
    updatedAt: new Date(Date.now() - 35 * 60 * 1000)
  },
  {
    id: "inc-2",
    category: "roadblock",
    title: "Penutupan Gang Hajatan Pernikahan Warga",
    description: "Tenda hajatan pernikahan warga terpasang di badan jalan gang. Akses sepeda motor dan mobil dialihkan memutar lewat Jl. Veteran atau Jl. Gatot Subroto.",
    streetName: "Jl. Moh. Yamin Gang II (Dekat Notosuman)",
    districtId: "serengan",
    location: {
      lat: -7.5794,
      lng: 110.8192,
      address: "Jl. Moh. Yamin Gang II, Jayengan, Kec. Serengan, Kota Surakarta"
    },
    reporterId: "driver_mitra_budi",
    reporterName: "Mas Budi (Driver Mitra)",
    reporterRole: "driver",
    status: "active",
    isVerifiedByDishub: false,
    stillActiveCount: 18,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    updatedAt: new Date(Date.now() - 90 * 60 * 1000)
  },
  {
    id: "inc-3",
    category: "roadwork",
    title: "Rekayasa Arus Proyek Simpang Palang Joglo",
    description: "Pekerjaan aspal dan penyempurnaan marka jalan di sekitar flyover Joglo. Diberlakukan sistem buka-tutup jalur dari arah Kadipiro menuju Nusukan.",
    streetName: "Simpang Tujuh Joglo (Jl. Kolonel Sugiyono)",
    districtId: "banjarsari",
    location: {
      lat: -7.5385,
      lng: 110.8267,
      address: "Simpang Palang Joglo, Kadipiro, Kec. Banjarsari, Kota Surakarta"
    },
    reporterId: "officer_dishub_solo",
    reporterName: "Dinas Perhubungan Kota Surakarta",
    reporterRole: "officer",
    status: "active",
    isVerifiedByDishub: true,
    verifiedByOfficerName: "Pusat Kendali Lalu Lintas (CCROOM Dishub)",
    stillActiveCount: 65,
    resolvedCount: 5,
    createdAt: new Date(Date.now() - 180 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 180 * 60 * 1000)
  },
  {
    id: "inc-4",
    category: "flood",
    title: "Genangan Air Hujan di Bawah Jembatan Jurug",
    description: "Genangan air setinggi 15-25 cm akibat luapan saluran pembuangan air hujan. Motor matic disarankan melambat atau melewati Jembatan Jurug Baru.",
    streetName: "Akses Bawah Jembatan Jurug (Dekat UNS)",
    districtId: "jebres",
    location: {
      lat: -7.5623,
      lng: 110.8621,
      address: "Jl. Ir. Sutami, Pucangsawit, Kec. Jebres, Kota Surakarta"
    },
    reporterId: "warga_solo_eka",
    reporterName: "Mbak Eka (Warga Kentingan)",
    reporterRole: "customer",
    status: "active",
    isVerifiedByDishub: false,
    stillActiveCount: 27,
    resolvedCount: 3,
    createdAt: new Date(Date.now() - 55 * 60 * 1000), // 55 mins ago
    updatedAt: new Date(Date.now() - 55 * 60 * 1000)
  },
  {
    id: "inc-5",
    category: "traffic",
    title: "Kepadatan Bongkar Muat Pasar Gede & Gladak",
    description: "Antrean kendaraan logistik sembako dan bus pariwisata di sekitar Tugu Jam Pasar Gede. Arus tersendat mengarah ke Jl. Urip Sumoharjo.",
    streetName: "Jl. Jenderal Sudirman - Pasar Gede",
    districtId: "pasar_kliwon",
    location: {
      lat: -7.5689,
      lng: 110.8322,
      address: "Jl. Urip Sumoharjo, Sudiroprajan, Kec. Pasar Kliwon, Kota Surakarta"
    },
    reporterId: "driver_mitra_slamet",
    reporterName: "Pak Slamet (Driver Ojek)",
    reporterRole: "driver",
    status: "active",
    isVerifiedByDishub: true,
    verifiedByOfficerName: "Petugas Pengatur Lalu Lintas",
    stillActiveCount: 31,
    resolvedCount: 8,
    createdAt: new Date(Date.now() - 70 * 60 * 1000), // 70 mins ago
    updatedAt: new Date(Date.now() - 70 * 60 * 1000)
  }
];
