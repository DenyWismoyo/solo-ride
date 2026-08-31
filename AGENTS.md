# AGENTS.md — Ride-Solo Development Guide

> Dokumen ini adalah **satu-satunya sumber kebenaran** bagi semua agen AI dan developer yang bekerja di proyek ini.
> Baca seluruh dokumen sebelum menulis baris kode pertama.

---

## 1. Identitas Produk

**Ride-Solo** adalah platform ojek lokal berbasis komunitas yang dirancang untuk **menggantikan aplikator besar** dengan model ekonomi yang adil dan transparan. Ia bukan sekadar aplikasi ojek — ia adalah **ekosistem lokal** yang menghubungkan driver mitra, pelanggan, dan UMKM tanpa biaya komisi per-trip.

**Filosofi Inti:**
- **Zero Commission** → Driver membayar "karcis harian" flat, bukan potongan per order
- **Hyperlocal First** → Setiap fitur dirancang untuk skala kecamatan, bukan nasional
- **Community Owned** → Ekosistem dibangun untuk dan oleh komunitas lokal

---

## 2. Tech Stack

| Layer | Teknologi | Catatan |
|-------|-----------|---------|
| Framework | **Next.js 16.3.3 (App Router)** | Wajib baca `node_modules/next/dist/docs/` |
| Language | TypeScript (strict mode) | Tidak boleh `any` di type baru |
| Styling | Tailwind CSS v4 + shadcn/ui | Lihat Design System di bagian 6 |
| Auth | Firebase Auth (Email + Google) | via `auth.service.ts` |
| Database | Firestore (DB: `ride-solo`) | Rules ada di `firestore.rules` |
| Storage | Firebase Storage | |
| Maps | Google Maps JS API v3 | Gunakan Places API **(New)** |
| State | React Context (AuthProvider) + Hooks | Tidak boleh Redux/Zustand saat ini |
| Hosting | Firebase Hosting (target) | |

---

## 3. Struktur Direktori (Canonical)

```
src/
├── app/                          # Next.js App Router pages
│   ├── (customer)/               # Route group: Customer flows
│   │   ├── page.tsx              # Beranda + Peta
│   │   └── order/[id]/page.tsx   # Tracking pesanan
│   ├── driver/                   # Route group: Driver flows
│   │   ├── page.tsx              # Dashboard Driver
│   │   └── active-trip/[id]/page.tsx
│   ├── admin/                    # Admin Control Panel
│   │   └── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx                # Root layout + AuthProvider
│   └── globals.css               # Design tokens & base styles
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (Button, Input, Card, etc.)
│   ├── map/                      # Map-related components (PlaceAutocomplete, RouteMap, etc.)
│   ├── order/                    # Order-related UI (OrderCard, StatusBadge, etc.)
│   └── layout/                   # Navbar, Sidebar, BottomNav, etc.
│
├── hooks/                        # Custom React hooks (satu file per domain)
│   ├── useAuth.ts                # Auth state listener
│   ├── useOrder.ts               # Order realtime listener
│   ├── useLocation.ts            # Driver location + GPS hook
│   └── usePendingOrders.ts       # (Target: pindah ke sini dari useOrder.ts)
│
├── services/                     # Firebase / external API calls
│   ├── auth.service.ts           # Auth CRUD
│   ├── order.service.ts          # Order lifecycle
│   ├── location.service.ts       # Driver geolocation
│   ├── payment.service.ts        # [TODO] Karcis harian + ledger
│   └── notification.service.ts   # [TODO] Push notification UMKM
│
├── types/                        # [TODO] Shared TypeScript types
│   ├── order.types.ts
│   ├── user.types.ts
│   └── location.types.ts
│
├── lib/                          # SDK initializers & utilities
│   ├── firebase.ts               # Firebase app, auth, db, storage
│   └── utils.ts                  # cn(), formatRupiah(), etc.
│
└── constants/                    # [TODO] App-wide constants
    ├── maps.ts                   # Map styles, default center, etc.
    └── pricing.ts                # Tarif dasar, radius, dll.
```

---

## 4. Aturan Penulisan Kode

### TypeScript
- ✅ Selalu deklarasikan return type pada service functions
- ✅ Gunakan `interface` untuk data model, `type` untuk union/utility types
- ✅ Pindahkan semua type ke `src/types/` (bukan didefinisikan di dalam service)
- ❌ Jangan gunakan `any` kecuali untuk interop Google Maps API (tandai dengan komentar `// @gmaps-interop`)
- ❌ Jangan `ts-ignore` tanpa alasan yang dijelaskan di komentar

### Service Layer (`src/services/`)
- Setiap file service mengekspos **satu object** dengan method (pattern: `authService`, `orderService`)
- Method hanya berisi **logika Firebase/API** — tidak ada state, tidak ada React hook
- Semua Firestore path menggunakan string **konstan** (hindari string literal tersebar di mana-mana)
- Selalu handle error dengan try-catch di service layer, lempar error yang meaningful

```typescript
// ✅ BENAR
export const orderService = {
  createOrder: async (data: CreateOrderDTO): Promise<string> => {
    try {
      const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), { ... });
      return ref.id;
    } catch (err) {
      throw new Error(`Gagal membuat pesanan: ${err}`);
    }
  }
}

// ❌ SALAH — jangan campur React state di service
export const orderService = {
  createOrder: async (data: any) => { // any tidak boleh
    const [loading, setLoading] = useState(false); // JANGAN INI
```

### Hook Layer (`src/hooks/`)
- Satu file per domain, satu concern per hook
- Selalu return `{ data, loading, error }` sebagai pattern standar
- Cleanup semua subscription Firestore di `useEffect` return function
- Gunakan `useCallback` untuk handler yang diteruskan sebagai prop

```typescript
// ✅ Pattern standar hook
export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // ← wajib ada

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    const unsub = onSnapshot(..., (snap) => { ... }, (err) => setError(err));
    return () => unsub();
  }, [orderId]);

  return { order, loading, error };
}
```

### Component Layer (`src/components/`)
- Komponen presentational (UI murni): tidak boleh panggil service langsung, hanya terima props
- Komponen container (halaman): boleh gunakan hooks, koordinasi logika
- Pisahkan logika kompleks ke custom hook, komponen harus "tipis"
- Gunakan `"use client"` hanya jika memang butuh interaktivitas browser

---

## 5. Firestore Schema

### Collection: `users`
```typescript
interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "customer" | "driver" | "admin" | "merchant";
  createdAt: Timestamp;
  // Driver specific
  points?: number;           // Stamp/Poin untuk ditukar di UMKM mitra
  karcisExpiry?: Timestamp;  // [TODO] Masa berlaku karcis harian
  isVerified?: boolean;      // [TODO] Verifikasi KTP/SIM
}
```

### Collection: `orders`
```typescript
interface OrderDocument {
  customerId: string;
  driverId: string | null;
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  price: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  paymentMethod: "cash" | "qris" | "wallet"; // [TODO]
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `drivers`
```typescript
interface DriverDocument {
  uid: string;
  isOnline: boolean;
  location: { lat: number; lng: number };
  lastUpdated: Timestamp;
}
```

---

## 6. Design System (SIGAP Multi-Tenant & Borderless Mobile-First)

### Filosofi: "Borderless Tactile Glass & Obsidian Canvas"
- Tenant: `[data-tenant="sigap"]` dengan basis adaptive light & dark canvas
- File Token: `src/styles/sigap.css` diimpor di `globals.css`
- **Borderless Elevation**: Hindari garis pembatas kaku (harsh 1px solid borders). Gunakan soft tonal elevation (`bg-white/90 dark:bg-[#0c1220]/90`), ambient drop shadow (`0 8px 30px -4px rgba(0,0,0,0.06)`), dan inner specular highlight (`inset 0 1px 0 0 rgba(255,255,255,0.8)`).
- **Squircle Corners**: Seluruh kartu utama, modal, dan sheet menggunakan continuous curve radius (`rounded-[1.75rem]`, `rounded-[2rem]`, `rounded-t-[2.5rem]`).
- **Tactile Haptic Spring**: Setiap tombol dan elemen interaktif wajib memiliki feedback animasi pegas (`motion: scale 0.92 - 0.94`, spring stiffness 400, damping 25).
- **Fintech Bento & Tile Aesthetics**: Kartu saldo/metrik menggunakan layout bento asimetris dengan icon well bergradasi ambient halo.
- Surface/Card: `.sg-card` / `.sg-card-borderless` / `.sg-glass-panel`
- Aksen Primer: **Emerald / Royal Blue Gradient** (`--sg-gradient-start` & `--sg-gradient-end`)
- Aksen Sekunder: **Rose** (`--destructive`) → Cancel/Bahaya
- Aksen Tersier: **Amber** → Poin Stamp UMKM
- Judul Section: `.sg-editorial-title` atau `.sg-text-gradient`
- Tombol Aksi: `.sg-btn` (`.sg-btn-primary`, `.sg-btn-success`, `.sg-btn-outline`, `.sg-btn-glass`)
- Micro-Interaksi: `.sg-hover-lift`, `.sg-active-scale`, `.sg-animate-in`

### Hyperlocal Bespoke Icon Library (`src/components/icons/`)
- Gunakan komponen ikon internal dari `src/components/icons/` untuk seluruh 8 Layanan Warga, Fitur Dompet Koperasi, dan Navigasi Sektor Ekosistem.
- Setiap ikon kustom wajib:
  1. Menerima props standar `IconProps` (`className`, `size`, `variant="duotone" | "solid"`).
  2. Memiliki dua lapisan visual: *primary stroke/accent path* dan *soft opacity background fill* (`opacity-20` / `0.25`).
  3. Mendukung adaptabilitas warna teks (`currentColor`) atau palette token tematik SIGAP.
- Hindari penggunaan ikon generik monokrom 1px untuk fitur unggulan atau tile beranda.

### Brand Asset & Logo Icon Rules (`SoloAppLogoIcon`)
- Seluruh elemen branding aplikasi yang menampilkan logo Ride-Solo (seperti pada `AppHeader`, halaman `login`, `register`, dan splash header) **wajib menggunakan komponen vektor resmi `SoloAppLogoIcon`**, bukan sekadar teks inisial ("RS") di dalam kotak warna.
- `SoloAppLogoIcon` menjaga konsistensi visual identitas produk antara icon web, PWA icon (`public/icon.svg`), dan UI aplikasi.

### Lokasi Hyperlocal Default
- **Kota**: Surakarta (Solo), Jawa Tengah
- **Koordinat Default**: `lat: -7.5755, lng: 110.8243` di `src/constants/maps.ts`

### Tipografi
- Font: `Geist Sans` (sudah dikonfigurasi di layout.tsx)
- Heading halaman: `sg-editorial-title text-xl md:text-2xl font-bold`
- Sub-heading: `text-sm text-slate-500 dark:text-zinc-400`
- Label form: `text-xs font-semibold text-slate-700 dark:text-zinc-300`

---

## 7. Google Maps Integration Rules

- **Gunakan Places API (New)** — bukan Places API legacy. Proyek baru diblokir dari API lama.
- Komponen autocomplete: gunakan Web Component `<gmp-place-autocomplete>` via `PlaceAutocomplete.tsx`.
- Parsing objek Place wajib menggunakan `place.location.lat()` / `place.location.lat` dan `place.formattedAddress` / `place.displayName`, jangan pernah mengakses `place.geometry`.
- Gunakan `GoogleMapsProvider` tunggal sebagai wrapper global daripada memanggil `useJsApiLoader` secara terpencar di setiap child component.
- Library array **wajib** dideklarasikan sebagai `const` di luar komponen:
  ```typescript
  const MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"]; // Di luar component
  ```
- Kalkulasi rute: gunakan `DirectionsService` dari `@react-google-maps/api`.
- Jangan panggil `google.maps.*` tanpa pengecekan `isLoaded` dari `useGoogleMaps()`.

### Concurrency & Location Best Practices
- Setiap mutasi perubahan status pesanan yang diperebutkan (seperti driver mengambil order) **wajib** menggunakan Firestore `runTransaction`.
- Broadcast koordinat GPS driver (`useLiveGPS` -> Firestore) **wajib** melalui mekanisme throttling (minimal interval 4 detik atau perpindahan > 5 meter) untuk mencegah pemborosan kuota write database.

### Driver Order Dispatch & Audio Alert Rules
- Notifikasi audio driver **wajib** menggunakan Web Audio API synthesizer di `src/lib/sound.ts` (`playOrderAlertSound()`, `playSuccessChime()`) untuk performa tinggi tanpa ketergantungan file aset audio eksternal.
- Komponen dispatch modal driver `IncomingOrderModal` wajib memiliki timer mundur visual (30 detik), rincian pendapatan tunai bersih driver, dan rute lokasi penjemputan/tujuan.
- Fitur `Auto-Accept` memungkinkan pesanan masuk langsung dieksekusi secara otomatis saat driver mengaktifkannya di dashboard.

### Dedicated Driver Navigation & Workspace Pillars
Menu navigasi driver **berbeda total** dari navigasi customer. Terdiri dari 4 pilar operasional:
1. **`radar`**: Power online/offline, preferensi order, auto-accept, incoming order modal, hotspot demand Solo.
2. **`income`**: Transparansi 100% tunai, status karcis harian flat 24 jam, saldo dompet koperasi, mutasi ledger.
3. **`performance`**: Rating mitra, tingkat penyelesaian, tabungan poin stamp, estimasi dividen SHU koperasi tahunan, riwayat trip detail.
4. **`partner`**: KTA digital koperasi, verifikasi legalitas KYC (KTP/SIM), tombol darurat Satgas 24 jam, posko basecamp Solo.

### Super Admin Ecosystem Persona Sandbox & Seeding
Untuk memfasilitasi pengujian multi-role yang realistis tanpa login-logout:
- Super Admin dilengkapi dengan **12 Persona Sandbox Surakarta**:
  1. `sandbox-customer-solo` (Danu Setyawan - Warga Jebres)
  2. `sandbox-driver-solo` (Joko Santoso - Driver Balapan, Karcis Aktif, Saldo Rp 150rb, ⭐ 4.9)
  3. `sandbox-merchant-manto` (`merch_kuliner` - Sate Pak Manto Sriwedari)
  4. `sandbox-merchant-pasar` (`merch_pasar` - Kios Sayur Mbok Darmi Pasar Gede)
  5. `sandbox-industry-solo` (`ind_kargo` - PT Bengawan Kargo Logistik)
  6. `sandbox-ind-klinik` (`ind_klinik` - Klinik Medika Pratama Solo - Spesimen Lab & E-Resep)
  7. `sandbox-ind-travel` (`ind_travel` - Solo Wisata Trans - Shuttle Balapan & Bandara)
  8. `sandbox-gov-solo` (`gov_diskop` - Diskop & UKM Kota Surakarta - Cadangan SHU)
  9. `sandbox-gov-dispar` (`gov_dispar` - Dinas Pariwisata Surakarta - Kalender Heritage & Event)
  10. `sandbox-gov-dukcapil` (`gov_dukcapil` - Disdukcapil - Antar KTP/KK ke Rumah)
  11. `sandbox-gov-dinsos` (`gov_dinsos` - Dinas Sosial - Bansos Sembako Pasar & Difabel)
  12. `sandbox-gov-bapenda` (`gov_bapenda` - Bapenda - Retribusi Pasar Digital & PAD)
- Modul `seedEcosystemSandbox()` di `src/lib/seedSandbox.ts` menginisialisasi seluruh data di atas ke Firestore dalam 1-Click.

### Hierarchical Additional Roles Architecture
Setiap pengguna dapat memiliki `role` primer dan `additionalRole` spesifik:
- **`government`**: `gov_diskop`, `gov_dispar`, `gov_dukcapil`, `gov_dinsos`, `gov_bapenda`, `gov_dinkes`, `gov_dishub`
- **`industry`**: `ind_klinik`, `ind_travel`, `ind_kargo`, `ind_hotel`, `ind_pabrik`, `ind_agro`
- **`merchant`**: `merch_kuliner`, `merch_pasar`, `merch_mart`, `merch_apotek`, `merch_batik`
Didefinisikan secara modular di `src/constants/ecosystemSectors.ts`.

---

## 8. Roadmap Fitur (Prioritas)

### Phase 1 — MVP Core ✅ (Selesai)
- [x] Auth (Email + Google, role-based)
- [x] Customer: Order ojek dengan peta
- [x] Driver: Dashboard online/offline + terima pesanan
- [x] Realtime tracking status order
- [x] Poin/Stamp sistem dasar

### Phase 2 — Monetisasi & Keamanan 🔧 (Berikutnya)
- [ ] **Karcis Harian**: Sistem flat fee Rp X/hari untuk driver aktif
- [ ] **Dompet Driver**: Saldo digital internal (bukan rekening)
- [ ] **Masking Kontak**: Nomor pelanggan disembunyikan dari driver
- [ ] **KYC Driver**: Upload foto KTP/SIM sebelum verifikasi
- [ ] **Geofencing**: Batasi order per kecamatan/radius

### Phase 3 — Ekosistem Lokal 🌱 (Visioner)
- [ ] **Merchant UMKM**: Modul order makanan/barang dari warung lokal
- [ ] **Titip Tetangga**: Algoritma batching order searah rute
- [ ] **Pasar Warga**: Flash sale UMKM dengan push notif radius
- [ ] **Forum Driver**: Chat komunitas + laporan kondisi jalan
- [ ] **SHU Koperasi**: Kalkulasi pembagian keuntungan tahunan

### Phase 4 — Anti-Fraud & Scale 🛡️
- [ ] **Deteksi GPS Palsu (Tuyul)**: Validasi dengan accelerometer
- [ ] **Liveness Detection**: Verifikasi wajah saat tarik dana
- [ ] **Demand Heatmap**: Peta panas prediksi keramaian per jam

---

## 9. Konvensi Penamaan

| Entitas | Konvensi | Contoh |
|---------|----------|--------|
| File komponen | PascalCase | `OrderCard.tsx` |
| File hook | camelCase + `use` prefix | `useLocation.ts` |
| File service | camelCase + `.service.ts` | `payment.service.ts` |
| File type | camelCase + `.types.ts` | `order.types.ts` |
| Variabel/fungsi | camelCase | `calculateRoute()` |
| Konstanta global | UPPER_SNAKE | `BASE_FARE_PER_KM` |
| CSS class | Tailwind utility | Sesuai design system |

---

## 10. Do & Don't

### ✅ DO
- Selalu cek `authLoading` sebelum redirect berdasarkan user role
- Unsubscribe semua Firestore listeners di `useEffect` cleanup
- Gunakan `useCallback` untuk handler yang diteruskan ke child component
- Baca `node_modules/next/dist/docs/` sebelum menggunakan fitur Next.js yang tidak familiar
- Tambahkan loading state dan error state di setiap hook

### ❌ DON'T
- Jangan panggil Firebase langsung dari komponen UI — gunakan service layer
- Jangan hardcode API key — gunakan `process.env.NEXT_PUBLIC_*`
- Jangan gunakan `libraries: ['places']` sebagai literal array di dalam komponen
- Jangan buat state management global selain `AuthProvider` tanpa diskusi arsitektur
- Jangan deploy ke production tanpa update `firestore.rules`
