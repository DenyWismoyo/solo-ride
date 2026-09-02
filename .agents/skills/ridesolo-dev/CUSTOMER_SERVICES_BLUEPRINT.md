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

## 6. Pasar Warga (Hyperlocal Traditional Market 0% Komisi)
- **Fungsi**: Digitalisasi belanja sayur mayur segar, bumbu giling, daging segar, dan jajanan dari 44 Pasar Tradisional Kota Surakarta tanpa potongan komisi ke pedagang.
- **URL Flow**: `/` -> Klik Menu Pasar Warga -> `/services/pasar` -> Pilih Pasar & Multi-Los Cart -> Checkout -> `/order/[id]`
- **Fitur Visioner**:
  - *Multi-Lapak Single-Trip Checkout*: Menggabungkan belanjaan dari beberapa los (Los Sayur, Lapak Daging, Kios Bumbu) di pasar yang sama dalam 1 pesanan tunggal & 1 tarif pengantaran driver.
  - *Interactive Custom Request*: Opsi bumbu racik giling (Halus/Kasar/Pedas) & variasi potong daging (Utuh/Potong 8/Fillet/Giling).
  - *Subuh-Fresh Time Slots*: Pilihan jadwal pengantaran subuh (05.30 - 08.00 WIB) untuk persiapan masak keluarga.
  - *E-Tera Guarantee*: Sertifikasi timbangan jujur binaan Disdag Solo.
- **Data Contract**: 
  - `serviceType: "pasar"`
  - Field: `marketId`, `items` (termasuk `kiosName`, `note`, `customOption`), `deliverySlot: "now" | "subuh"`.

## 7. Apotek & Mart (Daily Needs)
- **Fungsi**: Belanja kebutuhan harian, sembako, atau obat-obatan dari warung tetangga dan apotek lokal.
- **URL Flow**: `/` -> Klik Menu -> `/services/mart` -> Cart -> Checkout -> `/order/[id]`
- **Data Contract**: 
  - `serviceType: "mart"`
  - Field: array `items`.

## 8. Semua Layanan (All Services Grid)
- **Fungsi**: Katalog menyeluruh seluruh 16+ modul ekosistem warga, mitra industri, dan dinas kota.
- **URL Flow**: `/` -> Klik Semua Layanan -> `/services/more`

## 9. Program Pasar Murah Pemkot (Gerakan Pangan Murah - GPM & SPHP Bulog)
- **Fungsi**: Penyaluran sembako subsidi dan beras SPHP Bulog harga HET resmi pemerintah untuk warga KTP Solo terdaftar.
- **URL Flow**: `/` -> Klik Banner Pasar Murah -> `/services/pasar-murah` -> Verifikasi NIK & Kuota KK -> Terbitkan E-Voucher -> `/order/[id]`
- **Fitur Visioner**:
  - *SIPAHAP Live Inflation Tracker*: Komparasi harga pasar vs HET subsidi.
  - *Family NIK Vault & DTKS Smart Subsidy*: Kuota maksimal per KK per bulan anti-tengkulak.
  - *Dynamic QR Security Token*: Barcode e-voucher dengan countdown 24 jam & token keamanan.
  - *Titip Tebus Driver Carpooling*: Opsi serah terima kuasa tebus sembako ke Mitra Driver Ride-Solo.
- **Data Contract**:
  - `serviceType: "pasar"`
  - Field: `isSubsidizedGpm: true`, `nikKtp`, `voucherCode`, `pin`, `deliveryMethod: "pickup" | "delivery"`.
