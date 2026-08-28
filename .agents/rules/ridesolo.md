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
