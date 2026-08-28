import { 
  Bike, 
  Car, 
  Package, 
  UtensilsCrossed, 
  Users2, 
  Zap, 
  ShoppingBag, 
  LayoutGrid 
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
}

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
  },
  {
    id: "more",
    name: "Semua Layanan",
    shortName: "Lainnya",
    description: "Semua modul ekosistem koperasi lokal",
    icon: LayoutGrid,
    color: "text-zinc-400",
    bgColor: "bg-zinc-800/80 hover:bg-zinc-800",
    borderColor: "border-zinc-700/60",
    isAvailable: true,
  }
];
