# Ride-Solo Development Rules

Aturan-aturan ini berlaku untuk **semua sesi pengembangan** proyek Ride-Solo.
Agent wajib mematuhi semua aturan berikut tanpa pengecualian.

---

## ARSITEKTUR

- Selalu ikuti **4-layer architecture**: Types → Services → Hooks → Components/Pages
- Jangan panggil Firebase (`db`, `auth`) langsung dari komponen React — gunakan service layer
- Definisikan semua TypeScript type di `src/types/` sebelum implementasi
- Setiap hook baru harus return `{ data, loading, error }` sebagai standar minimum
- Hapus `usePendingOrders` dari `useOrder.ts` — pindahkan ke `usePendingOrders.ts` tersendiri

## FIREBASE & FIRESTORE

- Selalu unsubscribe Firestore listener (`onSnapshot`) di `useEffect` cleanup function
- Gunakan database `"ride-solo"` — sudah dikonfigurasi di `src/lib/firebase.ts`
- Update `firestore.rules` dan deploy ulang setiap kali ada collection Firestore baru
- Jangan hardcode path collection — gunakan konstanta dari `src/constants/collections.ts`

## GOOGLE MAPS & HYPERLOCAL
- Lokasi Default: **Surakarta (Solo), Jawa Tengah** (`lat: -7.5755, lng: 110.8243`)
- Gunakan **Places API (New)** — bukan Places API legacy (`google.maps.places.Autocomplete`)
- Untuk autocomplete lokasi, gunakan komponen `<PlaceAutocomplete>` di `src/components/map/`
- Array `libraries` untuk `useJsApiLoader` WAJIB dideklarasikan sebagai `const` di luar komponen
- Jangan panggil `google.maps.*` tanpa terlebih dahulu memastikan `isLoaded === true`

## DESIGN SYSTEM (SIGAP UI/UX TOKENS)
- Tenant Token: Menggunakan `[data-tenant="sigap"]` dengan tema Dark Canvas (`dark`)
- Background: `bg-background` (Slate 900 Elegan), Card: `.sg-card` / `bg-card`
- Utility Classes: Gunakan `.sg-card`, `.sg-btn`, `.sg-btn-primary`, `.sg-editorial-title`, `.sg-text-gradient`, `.sg-hover-lift`, `.sg-glass-panel`
- Warna aksen: `--sg-emerald` (aktif/CTA), `--sg-blue` (info/identity), Amber (reward/poin), Rose (danger/cancel)
- Selalu sertakan loading state (`<Loader2 className="animate-spin">`) saat menunggu async
- Desain harus responsif: mobile-first dengan safe-area padding dan `.sigap-scrollable`

## TYPESCRIPT

- Tidak boleh menggunakan `any` untuk type baru. Pengecualian hanya untuk interop Google Maps, dan harus diberi komentar `// @gmaps-interop`
- Gunakan `interface` untuk data model (dokumen Firestore), dan `type` untuk union types
- Service function wajib mendeklarasikan return type secara eksplisit: `Promise<string>`, `Promise<void>`, dll.

## NEXT.JS

- Baca `node_modules/next/dist/docs/` sebelum menggunakan fitur Next.js yang belum familiar
- Gunakan `"use client"` hanya pada komponen yang membutuhkan interaktivitas browser (state, event handler, map)
- Untuk `params` di dynamic routes, gunakan React `use()` hook karena params bersifat Promise di Next.js 16+

## KEAMANAN

- Jangan pernah hardcode API key dalam kode — gunakan `process.env.NEXT_PUBLIC_*`
- Jangan expose nomor telepon asli driver kepada pelanggan (masking call/chat in-app — Phase 2)
- Selalu validasi role user sebelum menampilkan halaman yang di-protect

---

## MCP SERVER (HERMES AGENT)

### Struktur & Lokasi
- MCP server berada di `mcp-server/` — **project Node.js TERPISAH** dari Next.js
- Entry point TUNGGAL: `mcp-server/src/index.ts` — semua tools WAJIB didaftarkan di sini
- Firebase Admin SDK diinit via `mcp-server/serviceAccountKey.json` — **JANGAN commit ke git**
- Build output: `mcp-server/build/` — jalankan `npm run build` sebelum register ke Antigravity
- Untuk develop: `npm run dev` di dalam folder `mcp-server/`

### Konvensi Penamaan Tool
- Format: `{verb}_{ekosistem}_{entitas}` dalam snake_case
- Verb yang diizinkan: `get_`, `list_`, `assign_`, `verify_`, `reject_`, `update_`, `calculate_`
- Contoh BENAR: `get_pending_orders`, `verify_gov_order`, `get_driver_karcis_status`
- Contoh SALAH: `fetchOrders`, `govVerify`, `driverKarcis`

### Grouping Tools MCP (wajib diikuti)
Setiap tool harus dikategorikan dalam salah satu dari 5 ekosistem:
- **[CORE]** — Orders, driver dispatch, status management
- **[GOV]** — Civic orders, verifikasi dinas, audit trail
- **[DRIVER]** — Karcis, wallet, KYC status, performa
- **[MERCHANT]** — UMKM orders, menu, stats
- **[ADMIN]** — Analytics, user management, ecosystem stats

### TypeScript di MCP Server
- DILARANG menggunakan `any` untuk `request.params.arguments` — gunakan interface:
  ```typescript
  interface AssignOrderArgs { orderId: string; driverId: string; }
  const { orderId, driverId } = request.params.arguments as AssignOrderArgs;
  ```
- Setiap tool WAJIB memiliki: `name`, `description` (Bahasa Indonesia), dan `inputSchema` yang ketat
- Error handling wajib menggunakan: `error instanceof Error ? error.message : String(error)`

### Keamanan & Data Integrity
- Tool yang mengubah data berpotensi race condition (mis. assign_order) **WAJIB** pakai `db.runTransaction()`
- Tool untuk gov orders **WAJIB** menulis audit log ke subcollection `orders/{id}/auditLog` setelah setiap aksi
- Data sensitif (NIK, nomor telepon) **WAJIB** di-mask di output tool sebelum dikembalikan ke agent
- **DILARANG** membuat tool yang melakukan delete dokumen — hanya update ke status tertentu
- Gunakan konstanta collection yang di-copy dari `src/constants/collections.ts` (jangan hardcode string)

### Integrasi Antigravity IDE
- Register MCP server di Antigravity IDE settings dengan:
  ```json
  { "command": "node", "args": ["d:/Project/OJEK LOKAL/mcp-server/build/index.js"] }
  ```
- Build dulu (`npm run build`) setiap kali ada perubahan di `mcp-server/src/`
- Baca `ridesolo-mcp-server` skill untuk panduan lengkap penambahan tool baru
- Baca `ridesolo-hermes` skill untuk panduan persona dan operasional Hermes Agent

---

## 🏛️ Government OPD Dedicated Workspace Architecture
- Seluruh panel kelola 18 Dinas Pemkot Surakarta berpusat di `src/app/(government)/gov/layout.tsx`.
- **Dual Compatibility**:
  - **Desktop**: Left Sidebar 260px (`GovSidebar.tsx`) + Top Bar (`GovHeader.tsx`) + Main Area.
  - **Mobile**: Dynamic Floating Pill Bottom Nav (`GovBottomNav.tsx`) + Drawer OPD Switcher (`GovOPDDrawer.tsx`).
- **5 Pilar Menu**:
  1. `workspace` — Alur operasional dinas, verifikasi, assign driver, tolak berkas, dan SLA.
  2. `orders` — Antrean & filter live permohonan warga.
  3. `catalog` — Manajemen katalog & template sub-layanan OPD (Toggle On/Off, Edit SLA, Tarif, Output Mode, Tambah Custom).
  4. `broadcast` — Pusat siaran geofenced resmi per dinas.
  5. `audit` — Buku ekspedisi digital sub-collection `orders/{id}/auditLog`.
- **Direct Route**: Dukung direct URL per dinas `/gov/[opdId]` (misal `/gov/gov_dinkes`).

---

## 📦 Multi-Modal Output Fulfillment Engine
Setiap sub-layanan dari 18 dinas wajib didefinisikan ke dalam salah satu dari 6 `CivicOutputMode`:
- `delivery`: Pengantaran fisik berkas/obat mitra kurir + verifikasi PIN 6-digit OTP.
- `emergency_dispatch`: Reaksi cepat satgas 24 jam + GPS realtime + SLA monitor.
- `digital_issuance`: E-Certificate/surat izin resmi Pemkot Solo ber-QR Code & PDF Download.
- `field_visit`: Surat penugasan resmi petugas lapangan + jadwal inspeksi + privacy masking.
- `subsidy_voucher`: Barcode digital token voucher sembako pasar / dividen SHU koperasi.
- `civic_ticket`: Nomor tiket pengaduan publik ULAS / booking tiket wisata resmi.

---

## ⚙️ Dynamic OPD Service Catalog & Real-Time Sync
- **Sinkronisasi Dua Arah**: Setiap perubahan status (buka/tutup) atau penambahan sub-layanan kustom dari admin OPD langsung tersinkronisasi ke portal warga (`/services/gov/[id]`) secara realtime melalui hook `useOpdServices(agencyId)`.
- **Custom Services**: Dinas dapat membuat inovasi layanan baru dengan identifier `isCustom: true` di collection `opd_services`.

---

## 🍲 Dedicated Merchant & Pasar Tradisional Workspace (`/merchant`)
- **4 Pilar Menu Operasional**:
  1. `kitchen`: Live Kitchen POS Kanban stream (Pesanan Masuk, Dimasak, Siap Diambil, Kurir OTW, Selesai) + Web Audio alerts.
  2. `catalog`: Manajemen menu makanan/sembako pasar, switch toggle ketersediaan stok instan, dan editor modal.
  3. `voucher`: Scanner pemindai barcode token voucher bansos pangan dari Dinsos & Koperasi untuk pasar tradisional.
  4. `finance`: Laporan omzet bersih 100% (Zero Commission model) & saldo dompet koperasi.
- **Dual Compatibility**: Desktop Sidebar 260px (`MerchantSidebar.tsx`) + Mobile Floating Pill Nav (`MerchantBottomNav.tsx`).

---

## 🗺️ Smart Hyperlocal Geofencing 5 Kecamatan & Demand Heatmap Radar
- **Master Geofencing**: 5 Kecamatan Kota Surakarta (*Banjarsari, Jebres, Laweyan, Pasar Kliwon, Serengan*) di `src/constants/geofencing.ts`.
- **Live Demand Hotspot Pins**: Marker titik keramaian strategis (UNS Kentingan, Stasiun Balapan, Pasar Gede, Stadion Manahan, Solo Paragon, RS Moewardi, Balaikota).
- **Interactive Camera Pan**: Filter kecamatan (`KecamatanFilterPill.tsx`) otomatis memindahkan kamera peta driver (`DriverRadarMap.tsx`) ke batas wilayah distrik dengan highlight radius lingkaran.
- **Hotspot Leaderboard**: Menghitung jarak spasial GPS driver ke zona demand tertinggi dengan rekomendasi titik mangkal.

---

## 📢 Pojok Rembug & Live Road Traffic Intel (`/community`)
- **5 Kategori Insiden**: `flood` (banjir), `roadblock` (hajatan/penutupan jalan), `event` (CFD Slamet Riyadi/pawai), `roadwork` (perbaikan jalan/pohon tumbang), `traffic` (kemacetan padat).
- **Crowdsourced Verification**: Tombol voting warga/driver (*"Masih Macet"* & *"Sudah Lancar"*).
- **Integrasi Resmi Dishub**: Laporan yang divalidasi petugas Dishub/BPBD memiliki badge resmi *"Diverifikasi Dishub"*.





