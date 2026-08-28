# Blueprint Layanan Ekosistem Warga (Customer Services)

Dokumen ini memetakan alur, komponen, dan skema URL untuk 8 layanan utama warga di platform Ride-Solo. Blueprint ini harus menjadi acuan ketika mengembangkan halaman detail atau alur pemesanan (booking flow) untuk masing-masing layanan.

## 1. Ojek Motor & 2. Mobil Warga (Ride Hailing)
- **Fungsi**: Layanan transportasi antar-jemput penumpang langsung (Ride Hailing).
- **URL Flow**: `/` -> Klik Menu (Ojek/Mobil) -> Membuka `RideBookingDrawer.tsx` (Bottom Sheet).
- **Komponen Utama**:
  - `<PlaceAutocomplete>` untuk Titik Jemput & Tujuan.
  - Peta rute (Google Maps Directions) dan estimasi harga.
- **Data Contract**: `serviceType: "ojek" | "mobil"`.

## 3. Kirim Kilat (Package Delivery)
- **Fungsi**: Pengiriman barang/dokumen point-to-point instan secara kilat.
- **URL Flow**: `/` -> Klik Menu -> `/services/send` -> Checkout -> `/order/[id]`
- **Komponen Utama (Baru)**:
  - Halaman Khusus: `app/(customer)/services/send/page.tsx`
  - Form: `PackageDetailForm` (Nama Barang, Berat, Detail Kontak Pengirim & Penerima).
- **Data Contract**: 
  - `serviceType: "kirim"`
  - Tambahan Field Order: `itemDescription`, `senderPhone`, `recipientPhone`, `recipientName`.

## 4. Kuliner Warga (Food Delivery)
- **Fungsi**: Memesan makanan/minuman dari UMKM Lokal.
- **URL Flow**: `/` -> Klik Merchant di Spotlight / Menu -> `MerchantDetailDrawer.tsx` (Keranjang) -> Checkout -> `/order/[id]`
- **Komponen Utama**:
  - Halaman List Merchant: `app/(customer)/services/food/page.tsx` (opsional jika ingin list full)
  - `<MerchantSpotlight>` (Daftar warung)
  - `<CartSummary>` (Perhitungan total & ongkir flat ojek).
- **Data Contract**: 
  - `serviceType: "kuliner"`
  - Field Order: array `items` yang berisi detail menu, jumlah, harga diskon, `merchantId`.

## 5. Titip Tetangga (Batching / Errand)
- **Fungsi**: Layanan nitip belanjaan, barang, atau pesanan dari tetangga (model *batching* searah rute driver atau titip beli bebas).
- **URL Flow**: `/` -> Klik Menu -> `/services/titip` -> Checkout -> `/order/[id]`
- **Komponen Utama (Baru)**:
  - Halaman Khusus: `app/(customer)/services/titip/page.tsx`
  - Form: `<ErrandForm>` (Input manual "Tolong belikan X di Y, perkiraan harga Z").
  - UI Opsional: `<BatchingRadar>` (Melihat driver terdekat yang sedang menuju ke arah rumah).
- **Data Contract**: 
  - `serviceType: "titip"`
  - Tambahan Field Order: `errandNotes` (catatan belanjaan), `estimatedItemPrice` (maksimum harga barang talangan).

## 6. Pasar Warga (Flash Sale Marketplace)
- **Fungsi**: Etalase produk bahan pokok atau barang UMKM lokal yang sedang menggelar *Flash Sale* atau disubsidi oleh Pemerintah/Koperasi.
- **URL Flow**: `/` -> Klik Menu -> `/services/pasar` -> Cart -> Checkout -> `/order/[id]`
- **Komponen Utama (Baru)**:
  - Halaman Khusus: `app/(customer)/services/pasar/page.tsx`
  - Tampilan Katalog: `<FlashSaleCountdown>`, `<SubsidizedProductCard>` (menampilkan harga coret/diskon).
- **Data Contract**: 
  - `serviceType: "pasar"`
  - Field: mirip seperti `kuliner` dengan penekanan pada status promo dari merchant/pemerintah.

## 7. Apotek & Mart (Daily Needs)
- **Fungsi**: Belanja kebutuhan harian, sembako, atau obat-obatan (mirip Kuliner tapi beda kategori merchant).
- **URL Flow**: `/` -> Klik Menu -> `/services/mart` -> Cart -> Checkout -> `/order/[id]`
- **Komponen Utama (Baru)**:
  - Halaman Khusus: `app/(customer)/services/mart/page.tsx`
  - Modifikasi `MerchantDetailDrawer.tsx` dengan filter `category: "mart" | "apotek"`.
- **Data Contract**: 
  - `serviceType: "mart"`
  - Field: array `items` seperti pemesanan kuliner.

## 8. Semua Layanan (All Services Grid)
- **Fungsi**: Halaman atau drawer tambahan jika layanan bertambah melebihi grid utama di Home.
- **URL Flow**: `/` -> Klik Semua Layanan -> Menampilkan modal/page grid lengkap.
- **Komponen Utama**:
  - Modal: `AllServicesDrawer.tsx` atau Page: `app/(customer)/services/page.tsx`
