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
│   │   ├── page.tsx              # Beranda Super App + 4 Tab (Home, Orders, Rewards, Profile)
│   │   ├── community/page.tsx    # Pojok Rembug Solo (Road Intelligence)
│   │   ├── order/[id]/page.tsx   # Tracking pesanan aktif
│   │   ├── store/[id]/page.tsx   # Halaman toko merchant tertentu
│   │   ├── merchant/[id]/page.tsx # Store merchant customer view
│   │   └── services/             # Sub-routes layanan customer
│   │       ├── ride/page.tsx     # Ojek Motor
│   │       ├── car/page.tsx      # Mobil Warga
│   │       ├── send/page.tsx     # Kurir Kirim
│   │       ├── food/page.tsx     # Kuliner UMKM
│   │       ├── titip/page.tsx    # Titip Tetangga
│   │       ├── pasar/page.tsx    # Pasar Tradisional 44 Pasar Solo
│   │       ├── pasar-murah/page.tsx # SPHP Gerakan Pangan Murah Pemkot×BULOG
│   │       ├── mart/page.tsx     # Mart Digital
│   │       ├── warta/page.tsx    # Pusat Warta & Siaran Resmi 19 Dinas
│   │       ├── gov/[id]/page.tsx # Portal Layanan Pemerintah per Dinas
│   │       └── more/page.tsx     # Katalog Lengkap + Search Ekosistem
│   ├── driver/                   # Driver workspace (standalone, no route group)
│   │   ├── page.tsx              # Dashboard Driver (4 Pilar: radar, income, performance, partner)
│   │   └── active-trip/[id]/page.tsx  # Navigasi trip aktif
│   ├── merchant/                 # Merchant workspace (standalone, no route group)
│   │   ├── layout.tsx            # MerchantLayout (Sidebar + BottomNav)
│   │   └── page.tsx              # Dashboard UMKM (4 Pilar: kitchen, catalog, voucher, finance)
│   ├── (government)/gov/         # Route group: Government OPD workspace
│   │   ├── layout.tsx            # GovLayout (Sidebar + Header + BottomNav)
│   │   ├── page.tsx              # OPD dashboard default
│   │   └── [opdId]/page.tsx      # Workspace per dinas (/gov/gov_dinkes, /gov/gov_disdag, dll.)
│   ├── (industry)/industry/      # Route group: Industry B2B workspace
│   │   └── page.tsx              # Industry dashboard (contracts, orders, fleet)
│   ├── (admin)/admin/            # Route group: Super Admin panel
│   │   ├── page.tsx              # Admin control panel
│   │   └── bizconfig/page.tsx    # BizConfig dynamic pricing admin
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx                # Root layout + AuthProvider + GoogleMapsProvider + ThemeProvider
│   └── globals.css               # Design tokens & base styles
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (Button, Input, Card, Badge, Modal, etc.)
│   ├── layout/                   # AppHeader, BottomNav, ProfileDrawer
│   ├── map/                      # GoogleMapsProvider, PlaceAutocomplete, RouteMap, MapLocationPickerModal
│   ├── icons/                    # Bespoke hyperlocal icon library (SoloMotorIcon, SoloAppLogoIcon, dll.)
│   ├── admin/                    # AdminImpersonationBar, AdminOverviewBento, AdminPersonaGrid, dll.
│   ├── booking/                  # RideBookingDrawer, dll.
│   ├── civic/                    # CivicFormDispatcher, civic forms per dinas (18 subfolder), CivicBroadcastBanner
│   ├── community/                # RoadIncidentFeed, RoadIncidentCard, CreateIncidentModal
│   ├── driver/                   # DriverRadarTab, DriverIncomeTab, DriverPerformanceTab, DriverPartnerTab
│   │   ├── income/               # DriverIncomeTab, DriverWalletBento, DriverLedgerHistory, SHUCalculator
│   │   ├── performance/          # DriverPerformanceTab
│   │   ├── partner/              # DriverPartnerTab
│   │   ├── radar/                # DriverRadarTab, HotspotDemandLeaderboard, DriverHeatmapControls
│   │   └── modals/               # TopupWalletModal, KycUploadModal
│   ├── government/               # GovWorkspaceDispatcher + workspaces per dinas (19 subfolder)
│   │   └── layout/               # GovSidebar, GovHeader, GovBottomNav, GovOPDDrawer, GovWorkspaceContext
│   ├── history/                  # HistoryDetailReceiptModal, UnifiedHistoryModal
│   ├── home/                     # HomeExploreTab, HomeActivityTab, HomeRewardsTab, HomeProfileTab
│   ├── industry/                 # IndustryWorkspace, IndustryContractsTab, CreateContractModal, dll.
│   ├── merchant/                 # CartCheckoutSheet, KitchenOrderStream, ProductCatalogManager
│   │   ├── catalog/              # ProductCatalogManager
│   │   ├── finance/              # MerchantFinancialSummary
│   │   ├── kitchen/              # KitchenOrderStream
│   │   ├── layout/               # MerchantSidebar, MerchantContext
│   │   ├── pasar/                # PasarMultiLapakCheckoutModal
│   │   └── voucher/              # VoucherScannerModal
│   ├── order/                    # DeliveryAddressPickerModal, dll.
│   ├── profile/                  # SavedAddressesModal
│   ├── services/                 # More page komponen (MoreCategoryTabs, MoreGovSectorsGrid, dll.)
│   └── theme/                    # ThemeProvider
│
├── hooks/                        # Custom React hooks (satu file per domain)
│   ├── useAuth.ts                # Auth state listener
│   ├── useOrder.ts               # Order realtime listener
│   ├── useLocation.ts            # Device GPS hook
│   ├── useLiveGPS.ts             # Driver live GPS broadcast ke Firestore (throttled)
│   ├── usePendingOrders.ts       # Pending orders listener untuk driver dispatch
│   ├── useDriverWallet.ts        # Karcis + dompet koperasi driver
│   ├── useBroadcasts.ts          # Civic broadcast listener per role
│   ├── useCivicOrder.ts          # Government order history customer
│   ├── useContracts.ts           # Industry B2B contracts
│   ├── useFoodMerchants.ts       # Merchant kuliner listing
│   ├── useKYCRequests.ts         # Admin KYC queue
│   ├── useMarketProducts.ts      # Pasar tradisional product listing
│   ├── useMerchant.ts            # Merchant profile & data
│   ├── useMerchantMenu.ts        # Menu items merchant
│   ├── useMerchantOrders.ts      # Order stream merchant
│   ├── useNotifications.ts       # In-app notifications
│   ├── useOpdServices.ts         # OPD dynamic service catalog + Firestore overrides
│   ├── useRecentDestinations.ts  # Customer recent trip destinations
│   ├── useReviews.ts             # Rating & review
│   ├── useRoadIncidents.ts       # Community road incidents
│   └── useRoleHistory.ts         # Unified order history per role
│
├── services/                     # Firebase / external API calls
│   ├── auth.service.ts           # Auth CRUD (login, logout, register, update profile)
│   ├── order.service.ts          # Order lifecycle (create, accept, complete, cancel, reject)
│   ├── location.service.ts       # Driver geolocation (update, read online drivers)
│   ├── wallet.service.ts         # Dompet koperasi + karcis harian driver
│   ├── driverWallet.service.ts   # Driver wallet & karcis read operations
│   ├── driverLedger.service.ts   # Driver daily ledger history
│   ├── merchant.service.ts       # UMKM store + order status management
│   ├── broadcast.service.ts      # Civic broadcast engine (publish, read)
│   ├── civic.service.ts          # Government order submission + OPD verification
│   ├── opdService.service.ts     # OPD dynamic services catalog management
│   ├── contract.service.ts       # Industry B2B contract CRUD
│   ├── notification.service.ts   # In-app push notification management
│   ├── kyc.service.ts            # Driver KYC submission & admin verification
│   ├── review.service.ts         # Rating & review submission
│   ├── traffic.service.ts        # Community road incident (Pojok Rembug Solo)
│   ├── address.service.ts        # Saved addresses management
│   ├── functions.service.ts      # Firebase callable functions wrapper (pricing, promo)
│   └── payment.service.ts        # [TODO] Payment gateway client wrapper (integrasi Mayar)
│
├── types/                        # Shared TypeScript types
│   ├── order.types.ts            # OrderDocument, OrderStatus, ServiceType, GovCitizenDetails per 18 dinas
│   ├── user.types.ts             # UserDocument, UserRole, SavedAddress
│   ├── civic.types.ts            # Civic service types
│   ├── merchant.types.ts         # Merchant, MenuItem, dll.
│   ├── wallet.types.ts           # DriverWalletDocument, KarcisStatus, WalletTransaction
│   ├── kyc.types.ts              # KYCRequest types
│   ├── payment.types.ts          # PaymentMethod types
│   ├── review.types.ts           # Review & rating types
│   ├── notification.types.ts     # BroadcastDocument, BroadcastCategory
│   ├── traffic.types.ts          # RoadIncident types
│   ├── contract.types.ts         # Industry B2B contract types
│   ├── audit.types.ts            # AuditEntry, SLAConfig, AuditAction
│   ├── sandbox.types.ts          # SandboxPersona, PersonaCategory (19 dinas)
│   └── location.types.ts         # [TODO] Ekstrak LocationPoint dari order.types ke sini
│
├── lib/                          # SDK initializers & utilities
│   ├── firebase.ts               # Firebase app, auth, db, storage
│   ├── utils.ts                  # cn(), formatRupiah(), dll.
│   ├── auditLog.ts               # writeAuditLog() — sub-collection helper
│   ├── privacy.ts                # maskName(), maskPhone(), generateAnonCode()
│   ├── sound.ts                  # Web Audio API: playOrderAlertSound(), playSuccessChime()
│   ├── geo.ts                    # Geolocation utility functions
│   ├── geoResolver.ts            # Reverse geocoding helper
│   ├── pricing.ts                # Tarif dasar, perhitungan ongkir, surge pricing
│   └── seedSandbox.ts            # seedEcosystemSandbox() — 1-click Firestore seed
│
└── constants/                    # App-wide constants
    ├── maps.ts                   # Koordinat default Solo (lat: -7.5755, lng: 110.8243), map styles
    ├── collections.ts            # Firestore collection name constants (COLLECTIONS object)
    ├── services.ts               # SUPER_APP_SERVICES, ALL_ECOSYSTEM_SERVICES catalog
    ├── ecosystemSectors.ts       # 19 dinas + industry + UMKM SectorDefinition
    ├── civicCatalog.ts           # Government service catalog detail per dinas
    ├── geofencing.ts             # DemandHotspot per kecamatan Solo
    ├── merchants.ts              # Seed catalog merchant UMKM Solo
    ├── slaConfig.ts              # SLA per dinas (jam) + getSLAConfig() + getSLAStatus()
    ├── emergencyServices.ts      # EMERGENCY_SERVICE_PREFIXES + isEmergencyService()
    ├── serviceCategories.ts      # Service category & sub-category definitions
    └── surakartaPlaces.ts        # Landmark, pasar, dan POI Solo
```

### Aturan Route Groups & Canonical Paths (Next.js)
- **HINDARI PARALLEL ROUTES CONFLICT**: DILARANG KERAS membuat folder dengan segment rute yang sama di dalam dan di luar Route Group. 
  Contoh SALAH: `src/app/(merchant)/merchant` dan `src/app/merchant`.
  Kedua path tersebut akan crash karena Next.js menganggapnya sama (resolves to `/merchant`).
- Selalu periksa direktori root `src/app/` sebelum men-generate page baru untuk memastikan URL segment belum digunakan.
- **Route Group Resiliency (`loading.tsx` & `error.tsx`)**: Setiap Route Group domain (`(customer)`, `driver`, `(government)/gov`, `merchant`) WAJIB memiliki `loading.tsx` (skeleton pulse) dan `error.tsx` (tactile recovery card dengan tombol reset) untuk mencegah crash putih (*blank screen*).

### Clean Barrel Exports Standard (`index.ts`)
- Setiap folder core (`src/types/`, `src/services/`, `src/hooks/`, dan `src/components/[domain]/`) WAJIB mengekspos `index.ts`.
- Developer dan agen dianjurkan mengimpor langsung dari root barrel:
  ```typescript
  import { useDriverWallet, useLiveGPS } from "@/hooks";
  import { orderService, walletService } from "@/services";
  import { DriverRadarTab, DriverIncomeTab } from "@/components/driver";
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

### Page Controller & Orchestrator Layer (`src/app/**/page.tsx`)
- **Thin Page Controller**: File `page.tsx` bertindak sebagai *assembly hub* dan koordinator alur proses bisnis.
- **Tanggung Jawab**:
  1. Melakukan Guard Auth & Role (`userData.role`).
  2. Memanggil data hooks (`useAuth`, `useOrder`, `useOpdServices`, `useMerchant`).
  3. Mengoordinasikan state aktif (tab aktif, filter, dialog open/close).
  4. Mengoper data dan action handler ke komponen presentasional (Layer 2).
- **DILARANG**: Menumpuk ratusan baris markup HTML mentah (> 300 baris) di `page.tsx`. Semua tampilan wajib didelegasikan ke komponen terpisah di `src/components/`.

### Component Layer (`src/components/`)
- **Pemisahan 3 Kategori Komponen**:
  1. **`src/components/ui/` (Layer 1 - Atom Primitives)**: Komponen murni presentasional (`button`, `badge`, `card`, `modal`, `input`, `switch`).
  2. **`src/components/layout/` (Layer 2 - Shell & Chrome)**: Kerangka navigasi global (`AppHeader`, `BottomNav`, `ProfileDrawer`, `Sidebar`).
  3. **`src/components/[domain]/` (Layer 3 - Domain Feature Organisms)**: Modul spesifik per domain (`driver/`, `merchant/`, `government/`, `civic/`, `community/`, `map/`).
- Komponen presentational (UI murni): tidak boleh panggil service Firestore langsung, hanya menerima props dan callback.
- Pisahkan logika kompleks ke custom hook (`src/hooks/`), komponen harus "tipis" dan modular.
- Gunakan `"use client"` hanya jika memang butuh interaktivitas browser.
- **Panduan Desain Lengkap**: Wajib merujuk ke Skill `ridesolo-ui-design-system`.

### Pengisian Alamat & Lokasi
- **Wajib "Saved Address First"**: Untuk setiap layanan yang membutuhkan alamat pengiriman/penjemputan (mis. Kurir, Dokumen, Bantuan), form wajib menampilkan opsi untuk memilih dari `user.savedAddresses` (Rumah/Kantor).
- **Fallback & Panduan**: Jika pengguna belum mengatur alamat di profil, tampilkan prompt/tombol yang memandu mereka untuk menyetel alamat terlebih dahulu, daripada langsung menyediakan input teks manual yang panjang. Input manual hanya bersifat darurat/lokasi spesifik (misalnya laporan insiden di jalan).
- **Visual Map / GPS Only (No Text Autocomplete)**: Untuk penentuan lokasi baru (di luar alamat tersimpan), DILARANG menggunakan input teks *autocomplete* karena rawan meleset. Selalu gunakan *read-only input* yang membuka **Map Modal** (`MapLocationPickerModal`) atau tombol **GPS Saya**. Input teks hanya berfungsi untuk menampilkan alamat hasil *reverse-geocoding*.
- **Destination-First Stepper (Ride & Car)**: Saat pengguna memilih lokasi tujuan, **DILARANG** mengisi otomatis lokasi penjemputan (pickup) menggunakan data GPS di belakang layar tanpa interaksi eksplisit pengguna. Mengisi GPS otomatis akan memicu kalkulasi rute prematur dan merampas kontrol pengguna untuk menentukan titik jemput mereka sendiri.

### Privacy & Identity Masking (DP3A Pattern)
- Untuk layanan yang menangani data sensitif (mis. pelaporan DP3A, aduan warga anonim), wajib mengimplementasikan **Privacy Masking**.
- Gunakan `maskName()` dan `maskPhone()` dari `src/lib/privacy.ts`.
- Di antarmuka admin/petugas, sediakan tombol eksplisit "Buka Identitas" yang memanggil `writeAuditLog({ action: "identity_revealed" })` sebelum data asli ditampilkan.

### Emergency Bypass & SLA Monitor
- Layanan yang bersifat darurat (Damkar, BPBD, Ambulans) harus mem-bypass tahap `pending_verification` dan langsung masuk ke `pending` (mencari petugas/mitra).
- Gunakan `isEmergencyService(serviceId)` dari `src/constants/emergencyServices.ts`.
- Setiap pesanan wajib dimonitor menggunakan batas waktu dari `src/constants/slaConfig.ts` (SLA threshold) untuk mengukur metrik *Average Response Time*.

### Rejection Flow Standard
- DILARANG melakukan *hard-delete* pada dokumen yang ditolak.
- WAJIB mengubah status menjadi `rejected` dan mencatat alasan penolakan (`rejectionReason`).
- Di sisi admin/petugas, WAJIB menggunakan komponen `<RejectionModal>` standar yang terintegrasi langsung dengan `writeAuditLog()`.
- Di sisi *customer history*, kartu order WAJIB menampilkan blok merah berisi alasan penolakan dengan jelas.

---

## 5. Firestore Schema

### Collection: `users`
```typescript
type UserRole = "customer" | "driver" | "admin" | "merchant" | "government" | "industry";

interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // Role extension (sub-role)
  additionalRole?: string;   // e.g. "gov_dispar", "gov_disdag", "ind_klinik"
  sectorName?: string;       // e.g. "Dinas Perdagangan Kota Surakarta"
  // Customer / Driver
  points?: number;           // Stamp/Poin untuk ditukar di UMKM mitra
  isVerified?: boolean;      // Verifikasi KTP/SIM/Legalitas
  kycStatus?: "unverified" | "pending" | "verified" | "rejected";
  savedAddresses?: SavedAddress[]; // Rumah, Kantor, Kampus, dll.
  // Driver specific
  vehiclePlate?: string;
  vehicleModel?: string;
  // Merchant / Industry
  storeName?: string;
  storeSlug?: string;
  businessName?: string;
  // Government
  institutionName?: string;
  phone?: string;
}
```

### Collection: `orders`
```typescript
type OrderStatus =
  | "pending_verification" // Menunggu verifikasi OPD
  | "pending"              // Mencari driver
  | "accepted"             // Driver sudah diterima
  | "in_progress"          // Sedang dalam perjalanan
  | "completed"            // Selesai
  | "cancelled"            // Dibatalkan customer
  | "rejected"             // Ditolak OPD (catatan rejectionReason WAJIB ada)
  | "pending_merchant"     // Menunggu konfirmasi merchant
  | "cooking"              // Merchant sedang memproses
  | "ready_for_pickup"     // Siap dijemput driver;

interface OrderDocument {
  customerId: string;
  customerName?: string;
  driverId?: string | null;
  driverName?: string;
  merchantId?: string;          // Jika order UMKM
  contractId?: string;          // Jika Industry B2B
  serviceType: ServiceType;     // WAJIB ada di setiap order
  targetRole?: string;          // e.g. "government", "industry"
  additionalRole?: string;      // e.g. "gov_disdag", "ind_kargo"
  agencyName?: string;
  items?: OrderItem[];           // Jika order kuliner/mart/pasar
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  price: number;
  status: OrderStatus;
  paymentMethod?: "cash" | "qris" | "wallet";
  citizenDetails?: Record<string, any>; // Data spesifik per dinas
  isEmergency?: boolean;        // Damkar / BPBD — bypass pending_verification
  rejectionReason?: string;     // WAJIB diisi jika status === "rejected"
  otpCode?: string;             // Serah terima OTP dokumen Dukcapil
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

### Collection: `broadcasts` (Civic Broadcast Engine)
```typescript
interface BroadcastDocument {
  institutionName: string;         // e.g. "Dinas Perdagangan Kota Surakarta"
  title: string;
  body: string;
  category: "info" | "warning" | "emergency" | "program";
  targetAudience: "all" | "customer" | "driver" | "merchant";
  geofence?: { areaName: string; radius?: number };
  actionUrl?: string;              // Link ke halaman terkait (/services/pasar-murah, dll.)
  actionLabel?: string;
  createdAt: Timestamp;
}
```

### Collections Lain yang Aktif
- `wallets/{userId}` — Dompet koperasi driver (balance, updatedAt)
- `ledger/{entryId}` — Mutasi keuangan driver (immutable append-only)
- `karcis/{karcisId}` — Karcis harian flat driver (driverId, expiresAt, isTrial)
- `merchants/{merchantId}` — Profil toko UMKM (storeName, slug, location, isOpen)
- `menu_items/{itemId}` — Produk/menu per merchant
- `contracts/{contractId}` — Kontrak B2B industri
- `reviews/{reviewId}` — Rating & ulasan order
- `kyc_requests/{requestId}` — Pengajuan KYC driver
- `notifications/{notifId}` — Notifikasi in-app per user
- `stamps/{stampId}` — Loyalty stamp komunitas
- `forum/{forumId}` — Diskusi komunitas
- `bizConfig/{configId}` — Dynamic pricing & formula admin panel
- `opd_services/{serviceId}` — OPD dynamic service catalog dengan Firestore override

### Audit Log — Sub-Collection Pattern

Setiap aksi yang mengubah status order pemerintahan WAJIB dicatat ke sub-collection,
BUKAN sebagai field array di dalam order document.

```
// ✅ BENAR — Sub-collection (scalable, queryable, append-only)
orders/{orderId}/auditLog/{auto-id}

// ❌ SALAH — Array field dalam document (size limit, tidak queryable)
orders/{orderId}.auditLog: AuditEntry[]
```

Interface `AuditEntry` wajib menggunakan `src/types/audit.types.ts`.
Helper untuk menulis log: `writeAuditLog()` dari `src/lib/auditLog.ts`.

Security rules: allow create ONLY, deny update/delete (immutable audit trail).

### Firestore Security Rules — Prinsip Wajib

- **DILARANG** menggunakan fallback `match /{document=**}` yang membuka semua collections ke semua authenticated user
- **WAJIB** menerapkan ownership check: `request.auth.uid == userId` untuk wallet dan data sensitif personal
- **Template minimal per collection**:
  - `wallets`: `allow read, write: if isOwner(userId) || isAdmin()`
  - `kyc_requests`: `allow read: if isOwner() || isAdmin(); allow create: if isOwner()`
  - `orders/auditLog`: `allow create: if isAuthenticated(); allow update, delete: if false;`
- **Firestore rules WAJIB di-deploy** sebelum produksi: `npx firebase-tools deploy --only firestore`

---

## 6. Design System (SIGAP Multi-Tenant & Borderless Mobile-First)

### Filosofi: "Borderless Tactile Glass & Obsidian Canvas"
- Tenant: `[data-tenant="sigap"]` dengan basis adaptive light & dark canvas
- File Token: `src/styles/sigap.css` diimpor di `globals.css`
- **Borderless Elevation**: Hindari garis pembatas kaku (harsh 1px solid borders). Gunakan soft tonal elevation (`bg-white/90 dark:bg-[#0c1220]/90`), ambient drop shadow (`0 8px 30px -4px rgba(0,0,0,0.06)`), dan inner specular highlight (`inset 0 1px 0 0 rgba(255,255,255,0.8)`).
- **Ultra-Premium Distinct Identity**: Untuk membedakan dari aplikasi ojek standar, menu utama dan katalog BUKAN sekadar kotak putih/hitam. WAJIB menggunakan:
  1. **Glassmorphism Base**: Latar belakang tembus pandang (`backdrop-blur-xl`, `bg-white/70`, `dark:bg-[#0c1220]/70`).
  2. **Specular Lighting (Inner Shadow)**: Efek pantulan cahaya di tepi kartu (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]` untuk terang, `rgba(255,255,255,0.1)` untuk gelap) agar komponen terlihat 3D dan *tactile*.
  3. **Vibrant Floating Icons**: Kontainer icon tidak boleh flat. Gunakan gradasi *mesh* tebal dengan bayangan bercahaya (glow) yang senada dengan warna brand layanan.
- **Squircle Corners**: Seluruh kartu utama, modal, dan sheet menggunakan continuous curve radius (`rounded-[1.75rem]`, `rounded-[2rem]`, `rounded-t-[2.5rem]`).
- **Tactile Haptic Spring**: Setiap tombol dan elemen interaktif wajib memiliki feedback animasi pegas (`motion: scale 0.92 - 0.94`, spring stiffness 400, damping 25).
- **Fintech Bento & Tile Aesthetics**: Kartu saldo/metrik menggunakan layout bento asimetris dengan icon well bergradasi ambient halo.
- Surface/Card: `.sg-card` / `.sg-card-borderless` / `.sg-glass-panel`

### Mobile-First Ergonomics & Elegance
- **Floating Pill Navigation**: Komponen Bottom Navigation dan Search Bar wajib menggunakan gaya "Floating Pill" atau "Dynamic Island" (mengambang di tengah bawah/atas layar dengan `rounded-full` atau `rounded-[2rem]`) dipadukan dengan `backdrop-blur` tebal, bukan bar penuh yang menempel kaku di tepi layar.
- **Fintech-Grade Padding & Touch Targets**: Semua elemen yang dapat disentuh (tombol, tab, kartu) WAJIB memiliki ukuran target sentuh minimal 44px (Tinggi/`h-11`) dan padding yang lapang (`p-4` atau `p-5`) agar terasa premium dan mencegah salah tekan di HP.
- **Bottom Sheets over Center Modals**: Interaksi sekunder pada mobile (seperti pengaturan alamat atau detail pesanan) harus memprioritaskan penggunaan "Bottom Sheet" (modal yang muncul dari bawah layar) daripada modal di tengah layar, agar selaras dengan UX mobile modern.

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

### Super Admin Ecosystem Persona Sandbox & Seeding (Categorized)
Untuk memfasilitasi pengujian lintas 5 ekosistem (khususnya 19 Dinas Pemkot):
- Persona Sandbox WAJIB dikelompokkan (*Grouped*) berdasarkan Kategori di UI `AdminImpersonationBar`:
  - **Kategori Warga & Driver**: Customer, Driver Reguler.
  - **Kategori UMKM**: Kuliner, Pasar Tradisional.
  - **Kategori Pemerintahan (19 Dinas)**: Diskop, Dispar, Satpol PP, DPMPTSP, **Disdag**, dll.
  - **Kategori Industri**: Kargo, Klinik, Travel.
- UI Impersonation WAJIB menggunakan Dropdown Categorized atau Tabs untuk mencegah *cluttered screen*.
- Semua 19 Dinas wajib tersedia di `SANDBOX_PERSONAS` untuk mempermudah QA spesifik per instansi.
- Modul `seedEcosystemSandbox()` di `src/lib/seedSandbox.ts` menginisialisasi seluruh data di atas ke Firestore dalam 1-Click.

### Dedicated Government OPD Workspace Architecture (Desktop & Mobile Compatible)
Seluruh pengelolaan **19 Dinas Pemerintah Kota Surakarta** (termasuk Dinas Perdagangan/`gov_disdag`) **WAJIB** menggunakan layout dedicated di `src/app/(government)/gov/layout.tsx`:
- **Desktop Command Center**:
  - Left Sidebar 260px (`GovSidebar.tsx`) dengan switcher dinas, status siaga satgas, dan 4 tab pilar: `workspace`, `orders`, `broadcast`, `audit`.
  - Top Command Bar (`GovHeader.tsx`) dengan capsule pemilih OPD dan profil.
- **Mobile Touch-First Ergonomics**:
  - Floating Pill Bottom Navigation (`GovBottomNav.tsx`) untuk peralihan instan antara 4 pilar menu operasional.
  - Quick OPD Drawer Sheet (`GovOPDDrawer.tsx`) untuk pemilihan instansi secara cepat dengan pencarian.
- **Direct Dynamic Routing**:
  - Setiap admin dinas dapat langsung diarahkan ke `/gov/[opdId]` (contoh: `/gov/gov_dinkes`, `/gov/gov_dukcapil`, `/gov/gov_diskop`, `/gov/gov_disdag`).

**19 Dinas OPD yang sudah aktif**: Dukcapil, Dinkes, Dinsos, Diskop, Dispar, Dishub, Bapenda, Disdik, DLH, Damkar, Dispusip, Dispertan, Disnaker, Diskominfo, Satpol PP, BPBD, DP3A, DPMPTSP, **Disdag** (Dinas Perdagangan — pengelola Pasar Murah SPHP dan retribusi 44 pasar tradisional).

### Dynamic OPD Service Template & Catalog Management (Two-Way Realtime Sync)
Setiap admin OPD memiliki hak kelola mandiri atas katalog layanannya via tab **`catalog`** di dashboard `/gov`:
- **Real-Time Toggle**: Menonaktifkan/mengaktifkan sub-layanan seketika via Firestore collection `opd_services`. Layanan yang non-aktif otomatis disembunyikan/berlabel *"Tutup Sementara"* di portal warga (`/services/gov/[id]`).
- **Custom Parameters**: Admin dapat menyesuaikan estimasi SLA (menit), biaya subsidi/tarif, deskripsi panduan, persyaratan dokumen, dan menentukan moda luaran (`CivicOutputMode`).
- **Inovasi Layanan Baru (+ Custom Service)**: Admin dinas dapat meluncurkan program layanan baru secara mandiri tanpa deploy ulang.
- **Client Hook**: Konsumsi hook `useOpdServices(agencyId)` yang memadukan default catalog dengan live Firestore overrides.

### Dedicated Merchant & Pasar Tradisional Workspace Architecture (`/merchant`)
Seluruh pengelolaan mitra UMKM kuliner dan pedagang pasar tradisional Surakarta menggunakan layout dedicated di `src/app/merchant/layout.tsx`:
- **4 Pilar Menu Operasional**:
  1. `kitchen` — Live Kitchen POS Kanban (Masuk, Dimasak, Siap, Kurir OTW, Selesai) dengan Web Audio synthesizer chime.
  2. `catalog` — Manajemen menu makanan/sembako dengan switch toggle stok habis/tersedia dan editor modal.
  3. `voucher` — Scanner & verifikator barcode voucher sembako/pangan dari Dinsos & Koperasi untuk pasar tradisional.
  4. `finance` — Laporan omzet bersih 100% (Zero Commission model) & saldo dompet koperasi.
- **Dual Compatibility**: Desktop Sidebar 260px (`MerchantSidebar.tsx`) + Mobile Floating Pill Nav (`MerchantBottomNav.tsx`).

---

## 8. Community Features & Beyond-Roadmap Services

### Pojok Rembug Solo (Community Road Intelligence)
- **Route**: `/community` (dalam route group `(customer)`)
- **Komponen**: `RoadIncidentFeed`, `RoadIncidentCard`, `CreateIncidentModal` di `src/components/community/`
- **Hook**: `useRoadIncidents.ts` | **Service**: `traffic.service.ts` | **Types**: `src/types/traffic.types.ts`
- **Tujuan**: Crowdsourced laporan kejadian jalan real-time dari warga & driver (kecelakaan, banjir, macet, galian jalan)
- **Aturan**: Laporan di-moderate — pengguna harus login untuk submit, tapi viewing terbuka umum

### Pasar Murah SPHP & Gerakan Pangan Murah (`/services/pasar-murah`)
- **Pengelola OPD**: Dinas Perdagangan (`gov_disdag`) + BULOG KC Surakarta + Dispangtan
- **Komoditas resmi**: Beras SPHP 5kg (HET Rp 62.500), Minyakita (Rp 15.700/L), Gula Maniskita, Telur Subsidi
- **5 Posko GPM**: 1 posko per kecamatan (Laweyan, Serengan, Banjarsari, Jebres, Pasar Kliwon) dengan live quota
- **Aturan Akses**: Wajib NIK KTP Solo, kuota maks 2 pack/KK/bulan (anti-tengkulak)
- **Mekanisme**: Voucher digital barcode QR / PIN Tebus — ambil di posko atau diantar mitra ojek (Civic Delivery)

### Pusat Warta Kota (`/services/warta`)
- **Tujuan**: Kanal siaran resmi 19 Dinas Pemkot Surakarta untuk seluruh warga
- **Hook**: `useBroadcasts("customer")` | **Filter**: per kategori (info/warning/emergency/program) + full-text search
- **Publisher**: Semua OPD via tab `broadcast` di Gov Command Center (`/gov`)

### BizConfig Admin Panel (`/admin/bizconfig`)
- **Tujuan**: Dynamic pricing management — Super Admin dapat mengubah formula tarif tanpa deploy
- **Firestore**: Collection `bizConfig` dengan versioning
- **Komponen**: `MidnightReconciliationSimulator` — test midnight cron reconciliation 1-Click
- **Integration**: Cloud Function `pricing.callable.ts` mengonsumsi config ini saat kalkulasi harga final

### Driver Demand Heatmap & Geofencing (`src/constants/geofencing.ts`)
- **Constants**: `DemandHotspot` per kelurahan/landmark (Stasiun Balapan, Pasar Legi, UNS, Solo Paragon, dll.)
- **Komponen Driver**: `DriverHeatmapControls`, `HotspotDemandLeaderboard`, `KecamatanFilterPill`
- **Tujuan**: Visualisasi demand hotspot real-time per kecamatan — memandu driver ke lokasi berpotensi tinggi

---

## 9. Roadmap Fitur & Status Implementasi

### Phase 1 — MVP Core ✅ (100% Selesai)
- [x] Auth (Email + Google, multi-role dynamic switcher)
- [x] Customer: Order ojek motor & mobil dengan Google Places API (New) & Destination-First Stepper
- [x] Driver: Radar order live listener, auto-accept, dispatch modal dengan timer & Web Audio chime
- [x] Realtime tracking status order (accepted, in_progress, completed) + live polyline interpolator
- [x] Poin/Stamp loyalitas ekosistem

### Phase 2 — Monetisasi & Keamanan ✅ (100% Selesai)
- [x] **Karcis Harian Flat**: Rp 5.000 / 24 jam dengan auto-waive gratis jika online $\ge 6$ jam
- [x] **Dompet Koperasi Driver**: Mutasi saldo internal, ledger harian, simulasi tutup buku harian
- [x] **Masking Kontak (DP3A Pattern)**: Privacy masking nama & telepon di dashboard dinas dengan audit log unmasking
- [x] **KYC Legalitas Mitra**: Pengajuan foto KTP/SIM & approval admin di `/admin`
- [x] **Geofencing 5 Kecamatan Surakarta**: Banjarsari, Jebres, Laweyan, Pasar Kliwon, Serengan

### Phase 3 — Smart Civic Hub 5 Ekosistem ✅ (100% Selesai)
- [x] **Dedicated Government OPD Workspace (`/gov`)**: 19 Dinas Pemkot Surakarta dengan command center, antrean berkas, multi-modal output (Digital Certificate, OTP, Surat Izin), dan Civic SLA Analytics Dashboard
- [x] **Pasar Tradisional 44 Pasar & Multi-Merchant Mixed Cart (`/services/pasar`)**: Belanja gabungan dari multi-los (sayur, daging, bumbu) diantar oleh 1 kurir flat ongkir
- [x] **Dedicated Merchant & Kitchen POS Kanban (`/merchant`)**: Kanban 4 kolom (Masuk, Dimasak, Siap, Diantar), Product Catalog Manager, dan QR Code Voucher Scanner
- [x] **Dedicated Industry B2B Cargo Workspace (`/industry`)**: Manajemen Armada Truk/Van, Surat Jalan Digital (Manifest QR Code), dan Kontrak Pasokan Grosir
- [x] **Zero Commission & Kalkulator Dividen SHU Koperasi**: Simulasi bagi hasil tahunan RAT (45% surplus) + Midnight Cron Simulator
- [x] **Dynamic Driver Demand Heatmap**: Hotspot lonjakan order Solo (Stasiun Balapan, Pasar Legi, Pasar Gede, Solo Paragon, UNS) + tombol GPS navigasi langsung
- [x] **Zen-Minimalist Chrome & Role-Tailored Account Management**: Standar icon-only header & modal profil spesifik per role

### Phase 4 — Produksi & Integrasi Nyata ✅ (100% Selesai)
- [x] **1. Pure Dynamic Data Binding**: Menghapus seluruh array hardcode di `/services/pasar` & `/services/food`, menghubungkan ke live Firestore `merchants` & `products`, serta menambahkan `EmptyStateCard` & onboarding pedagang.
- [x] **2. Dynamic QRIS & Payment Gateway Koperasi**: Generate kode QRIS dinamis per total tagihan dan webhook top-up dompet koperasi otomatis (`payment.service.ts` + `DynamicQrisModal.tsx`).
- [x] **3. Anti-Fraud & GPS Spoofing Detection**: Proteksi kecurangan jarak (Velocity Check delta km/detik) dan verifikasi liveness selfie saat driver menarik dana (`fraud.ts` + `DriverCashoutModal.tsx`).
- [x] **4. Gamelan Sound Synthesis & PWA Offline Resilience**: Notifikasi audio synthesizer gamelan khas Solo (Slendro/Pelog) untuk alert order driver, serah terima kurir, serta detektor `OfflineBanner.tsx` dan `ToastProvider`.

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
- Jangan membuat folder duplikat yang menghasilkan path yang sama (Route Segment Collision) karena ketidaktahuan penggunaan Route Group `(...)`.
- **Jangan gunakan `alert()`, `confirm()`, atau `prompt()` native browser** untuk feedback user — selalu gunakan toast/modal dari design system (`src/components/ui/`). `alert()` merusak kesan premium aplikasi dan tidak bisa dikustomisasi.
- Jangan gunakan `any` eksplisit pada data structures atau return types di service layer. `err: any` di catch blocks diperbolehkan. Gunakan komentar `// @gmaps-interop` jika `any` memang tidak terhindarkan untuk interop Maps API.
- Jangan gunakan Firestore Security Rules fallback `match /{document=**} { allow read, write: if isAuthenticated(); }` di production — terlalu permisif dan mengabaikan prinsip least privilege.
- **Jangan menjalankan perintah `npm run build` secara mandiri/otomatis** tanpa instruksi eksplisit dari user untuk menghemat sumber daya dan performa PC pengguna. Gunakan ketelitian pengecekan statis TypeScript dan validasi kode, dan hanya jalankan build jika user secara langsung memintanya.
- **Tunda seluruh fitur berbasis AI/LLM/ML** ke segmen/fase khusus tersendiri. Fokus pengembangan saat ini adalah 100% pada logika deterministik, operasional lapangan, integrasi 5 ekosistem, dan keandalan data.


