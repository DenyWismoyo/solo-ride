---
name: ridesolo-ui-design-system
description: Standarisasi UI/UX, Design System, Arsitektur Pemisahan Komponen 5-Layer, dan Pola Thin Page Controller untuk ekosistem Ride-Solo Smart Hub.
---

# 🎨 Ride-Solo UI Design System & Reusable Component Architecture

Dokumen ini adalah **standar baku dan panduan referensi utama** untuk seluruh antarmuka pengguna (UI), hierarki komponen, token estetika, dan pola orkestrasi halaman di proyek **Ride-Solo**.

---

## 🏛️ 1. Centralized Semantic CSS Token Invariant (`sigap.css` Single Source of Truth)

Seluruh komponen antarmuka pengguna (UI Primitives & Domain Feature Components) **WAJIB** mengonsumsi class semantic yang terhubung langsung ke CSS custom properties di [`src/styles/sigap.css`](file:///d:/Project/OJEK%20LOKAL/src/styles/sigap.css):

### Semantic Utility Classes:
- **Kartu Standar / Elevasi**: `.sg-card` (glassmorphism blur, soft shadow, border subtle)
- **Kartu Borderless Clean**: `.sg-card-borderless` (ultra-luxe borderless surface)
- **Kartu Bento Fintech**: `.sg-bento-card` (kartu metrik saldo dompet, order status, dan dashboard bento)
- **Panel & Floating Capsule**: `.sg-glass-panel`, `.sg-floating-capsule` (header dan dynamic floating bottom nav)
- **Tombol Aksi**: `.sg-btn`, `.sg-btn-primary`, `.sg-btn-sigap`, `.sg-btn-secondary`, `.sg-btn-danger`, `.sg-btn-glass`
- **Haptic Feedback Sentuhan**: `.sg-tactile-press` (spring physics `scale: 0.93 - 0.95` saat ditekan)
- **Micro-Interaksi Melayang**: `.sg-hover-lift` (`translateY(-2px)`)
- **Form Controls**: `.sg-input`, `.sg-textarea`, `.sg-select`
- **Badges Status**: `.sg-badge`, `.sg-badge-emerald`, `.sg-badge-blue`, `.sg-badge-amber`, `.sg-badge-rose`, `.sg-badge-teal`, `.sg-badge-neutral`
- **Tipografi Editorial**: `.sg-editorial-title`, `.sg-text-gradient`

---

## 🏛️ 2. Arsitektur Pemisahan Komponen 5-Layer (Clean Architecture)

Setiap fitur dalam sistem Ride-Solo wajib mengikuti pemisahan tanggung jawab 5-layer:

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: src/app/**/page.tsx (PAGE CONTROLLER & ORCHESTRATOR)         │
│  - Guard Auth & Role, Dispatch Tabs/Pillars, Koordinasi Bisnis         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mengimpor & Mengoordinasikan
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────┐
│ LAYER 2: src/components/[dom]/│               │ LAYER 4: src/hooks/   │
│ (Domain Feature Organisms)    │               │ (Reactive State Hooks)│
│ - KitchenOrderStream.tsx      │               │ - useMerchantOrders() │
│ - HotspotDemandLeaderboard.tsx│               │ - useOpdServices()    │
│ - CivicOutputViewer.tsx       │               │ - useRoadIncidents()  │
└───────────────┬───────────────┘               └───────────┬───────────┘
                │ Menggunakan Primitives                    │ Memanggil API
                ▼                                           ▼
┌───────────────────────────────┐               ┌───────────────────────┐
│ LAYER 3: src/components/ui/   │               │ LAYER 5: src/services/│
│ (Atom Primitives & Layout)    │               │ (Pure API & Firestore)│
│ - Button, Badge, Card, Modal  │               │ - orderService        │
│ - AppHeader, Sidebar, BottomNav               │ - merchantService     │
└───────────────────────────────┘               └───────────────────────┘
```

### Aturan Setiap Layer:

#### Layer 1: Page Controller & Business Orchestrator (`src/app/**/page.tsx`)
- **Tanggung Jawab**: Memeriksa otentikasi/role (`userData.role`), memanggil hooks data, mengatur active tab/filter, dan mengoper data/callback ke komponen Layer 2.
- **Prinsip "Thin Controller"**: File `page.tsx` DILARANG berisi tumpukan markup JSX mentah yang panjang (> 300 baris). Seluruh tampilan didelegasikan ke komponen Layer 2.

#### Layer 2: Domain Feature Modules (`src/components/[domain]/`)
- Folder: `driver/`, `merchant/`, `government/`, `civic/`, `community/`, `order/`, `map/`, `industry/`, `admin/`.
- **Tanggung Jawab**: Komponen fungsional spesifik per domain yang menerima props terstruktur (`order`, `hotspot`, `products`, `onAction`).
- **Prinsip**: Modular, dapat digunakan kembali di halaman modal, drawer, atau panel dashboard.

#### Layer 3: UI Primitives & Atoms (`src/components/ui/` & `src/components/layout/`)
- Folder: `src/components/ui/` (`button.tsx`, `badge.tsx`, `card.tsx`, `input.tsx`, `modal.tsx`) dan `src/components/layout/` (`AppHeader.tsx`, `BottomNav.tsx`, `ProfileDrawer.tsx`, `Sidebar.tsx`).
- **Tanggung Jawab**: Komponen presentasional murni tanpa dependensi ke bisnis logic atau database.

#### Layer 4: Custom Hooks (`src/hooks/`)
- **Tanggung Jawab**: Menampung lifecycle React (`useEffect`, `useState`, `useMemo`), Firestore realtime listener (`onSnapshot`), dan kalkulasi lokal.
- **Pattern Return**: Selalu return `{ data, loading, error, actions... }`.

#### Layer 5: Services Layer (`src/services/`)
- **Tanggung Jawab**: Fungsi pure async JavaScript/TypeScript untuk membaca/menulis ke Firestore atau external API. DILARANG menggunakan React hooks di file service.

---

## 💎 3. Filosofi Estetika: "Borderless Tactile Obsidian Glass"

Antarmuka Ride-Solo mengusung estetika ultra-premium kelas dunia dengan prinsip-prinsip berikut:

### 1. Borderless Elevation (Tonal Over Harsh Borders)
- ❌ **DILARANG**: Menggunakan garis pembatas kaku 1px solid gelap (`border-slate-300` / `border-black`).
- ✅ **WAJIB**: Menggunakan kombinasi:
  1. **Tonal Glass Canvas**: `bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-2xl`
  2. **Inner Specular Lighting**: `shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]` (light) / `dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]` (dark)
  3. **Soft Ambient Shadow**: `shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)]`

### 2. Continuous Squircle Radius
- Kartu & Modal Container: `rounded-[1.75rem]` atau `rounded-[2rem]`.
- Bottom Sheet Mobile: `rounded-t-[2.5rem]`.
- Tombol Aksi & Badge Kapsul: `rounded-2xl` atau `rounded-full`.

### 3. Tactile Spring Physics (Haptic Feedback)
- Setiap tombol, tab, dan kartu interaktif wajib memiliki feedback fisik via `.sg-tactile-press` (`active:scale-[0.93]`).

### 4. Bespoke Duotone Iconography & Zen Minimalist Chrome
- Seluruh icon fitur utama, 8 layanan warga, dan dompet koperasi menggunakan komponen vektor internal `src/components/icons/` dengan lapisan duotone (primary stroke + soft 20% opacity fill).
- **Zen Ultra-Minimalist Header**: Logo branding pada `AppHeader` menggunakan `SoloAppLogoIcon` berdimensi 38px secara mandiri (*Icon-Only*, tanpa teks brand/role badge) untuk memaksimalkan area pandang mobile (*screen real estate*) dan menyajikan estetika modern kelas atas.
- **Role-Tailored Account Management Pattern**: Menu profil (`ProfileDrawer.tsx` & `RoleAccountSettingsModal.tsx`) menyediakan pengelolaan akun mandiri yang memvalidasi data spesifik domain masing-masing role (Customer NIK KTP Solo, Driver plat nomor & KYC, Merchant los pasar & tera metrologi, OPD NIP & bidang, Industry NIB B2B).

### 5. Color Tokens & Semantic Variants

| Varian Token | Palette Light / Dark | Konteks Penggunaan |
|---|---|---|
| **Emerald (Primary)** | `#10b981` / `emerald-500` | Transportasi Ojek/Mobil, Selesai, Lunas, Online |
| **Royal Blue** | `#2563eb` / `blue-500` | Layanan 19 Dinas Pemkot, Verifikasi, Kurir OTW |
| **Orange** | `#ea580c` / `orange-500` | Merchant UMKM, Kuliner, Pantauan Jalan Live |
| **Amber** | `#d97706` / `amber-500` | Karcis Harian, Poin Stamp, Sedang Dimasak, Promo |
| **Rose (Destructive)**| `#e11d48` / `rose-500` | Batalkan, Tolak, Bahaya, Darurat Satgas |
| **Teal (Civic)** | `#0d9488` / `teal-500` | Siaran Resmi Pemda, Dompet Koperasi |

---

## 📱 4. Mobile-First Ergonomics & Desktop Compatibility

1. **Floating Pill Navigation**:
   - Komponen navigasi bawah wajib bertipe **Floating Dynamic Capsule** (`.sg-floating-capsule`) dengan `backdrop-blur-2xl`.
2. **Card List Layout over Tight Grids**:
   - Untuk daftar metrik atau titik ramai di mobile, utamakan **Vertical Card List** (`flex flex-col gap-3`) lebar penuh agar judul panjang dan badge angka tidak berdempetan atau terpotong.
3. **Bottom Sheet over Center Dialog on Mobile**:
   - Interaksi sekunder (seperti filter atau detail hotspot) menggunakan sheet yang muncul dari bawah layar pada perangkat mobile.

---

## 📋 5. Checklist Pembuatan Komponen Baru

Sebelum membuat file komponen baru, pastikan:
- [ ] Apakah komponen menggunakan class semantic dari `sigap.css` (`.sg-card`, `.sg-bento-card`, `.sg-btn-*`, `.sg-input`)?
- [ ] Apakah komponen ini Atomik murni? ➡️ Masukkan ke `src/components/ui/`.
- [ ] Apakah komponen ini kerangka navigasi global? ➡️ Masukkan ke `src/components/layout/`.
- [ ] Apakah komponen ini modul fitur bisnis tertentu? ➡️ Masukkan ke `src/components/[domain]/`.
- [ ] Apakah komponen ini berisi state/query Firestore? ➡️ Pisahkan logika ke `src/hooks/use[Feature].ts`.
- [ ] Apakah halaman `page.tsx` sudah tipis (< 300 baris) dan hanya mengimpor komponen modular?
- [ ] **DILARANG** menggunakan `alert()`, `confirm()`, atau `prompt()` native browser untuk feedback — gunakan komponen `Toast` / `useToast` dari `src/components/ui/` atau Radix toast untuk feedback sukses/error.
- [ ] Error blocking: gunakan `ErrorCard` atau modal dengan `.sg-btn-danger`, bukan `alert()`.
- [ ] Untuk form yang membutuhkan lokasi pengiriman: **WAJIB** tampilkan `savedAddresses` (opsi Rumah/Kantor) sebagai pilihan pertama sebelum input manual. Gunakan `DeliveryAddressPickerModal` atau `SavedAddressesModal`.
- [ ] Untuk penentuan lokasi baru (bukan dari saved address): **WAJIB** gunakan `MapLocationPickerModal` atau tombol GPS — **DILARANG** menggunakan `PlaceAutocomplete` text input sebagai satu-satunya input lokasi di form utama.
