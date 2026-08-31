# Ride-Solo: Ecosystem Roles — Feature Matrix Lengkap per 6 Role

> Dokumen ini adalah **referensi tunggal** untuk mengetahui fitur apa yang dimiliki,
> sedang dikembangkan, dan direncanakan untuk setiap role di platform Ride-Solo.
> Selalu periksa dokumen ini sebelum membangun fitur baru untuk menghindari
> duplikasi scope dan memastikan fitur berada di role yang tepat.

---

## 🧑 CUSTOMER (Warga Pengguna)

**Filosofi Role:** Customer adalah pengguna harian yang menggerakkan seluruh ekosistem.
Setiap transaksi Customer menguntungkan Driver (pendapatan), Merchant (omset),
dan Koperasi (ekosistem berputar). Customer harus merasakan kemudahan super-app
dengan sentuhan hyperlocal yang personal — bukan aplikasi generik.

### ✅ Sudah Ada (Phase 1)
| Fitur | File | Status |
|---|---|---|
| Super-App Home (8 layanan) | `ServicesGrid.tsx` | ✅ |
| Ride Booking dengan Google Maps (Places API New) | `RideBookingDrawer.tsx` | ✅ |
| Real-time order history listener | `page.tsx` + `useOrder.ts` | ✅ |
| Poin Stamp display + kupon UMKM | `WalletQuickCard.tsx` | ✅ |
| Merchant Spotlight (UMKM lokal Surakarta) | `MerchantSpotlight.tsx` | ✅ |
| Promo & News Banner | `PromoBanner.tsx` | ✅ |
| Bottom Navigation (Home, Orders, Rewards, Profile) | `BottomNav.tsx` | ✅ |
| Profile Drawer + Theme Switcher | `ProfileDrawer.tsx` | ✅ |

### 🔲 Phase 2 — Prioritas Tinggi
| Fitur | Deskripsi | Data Required |
|---|---|---|
| `serviceType` selector di booking | Customer pilih ojek / kirim / kuliner / titip | `OrderDocument.serviceType` |
| Rating & review pasca order | Bintang 1-5 + komentar ke driver & merchant | `reviews` collection |
| Notifikasi realtime order | Driver accepted, driver tiba, order selesai | `notifications` collection |
| Live tracking driver di peta | Posisi driver bergerak real-time saat in_progress | `drivers` collection GPS |
| Saved Address | Simpan Rumah, Kantor, Favorit | `UserDocument.savedAddresses` |

### 🔲 Phase 3+ — Visioner
| Fitur | Deskripsi |
|---|---|
| Dompet Warga (top-up saldo) | Bayar non-cash dari dompet koperasi |
| Langganan Premium | Bebas biaya antar / prioritas driver |
| Flash Deal Notifikasi | Terima notif Flash Sale UMKM dalam radius 2km |
| Forum Review UMKM | Beri ulasan warung mitra koperasi |
| Riwayat Poin + Redeem Detail | Kapan dapat poin, kapan ditukar, ke mana |
| Titip Tetangga Consumer Side | Buat order paket batching hemat 50% |

---

## 🏍️ DRIVER (Mitra Koperasi)

**Filosofi Role:** Driver adalah tulang punggung ekosistem. Model Karcis Harian menggantikan
komisi yang mencekik — driver bebas ambil order sebanyak mungkin tanpa potongan.
Driver juga adalah pemilik koperasi yang mendapat SHU tahunan. Ini yang membedakan
Ride-Solo secara fundamental dari Gojek/Grab.

### ✅ Sudah Ada (Phase 1)
| Fitur | File | Status |
|---|---|---|
| Toggle Online/Offline | `driver/page.tsx` | ✅ |
| Karcis Harian Flat Fee (free trial) | `wallet.service.ts` + `useDriverWallet.ts` | ✅ |
| Radar Pesanan Realtime (onSnapshot pending orders) | `usePendingOrders` in `useOrder.ts` | ✅ |
| Preferensi Layanan (Ojek / Kirim / Kuliner toggle) | `driver/page.tsx` | ✅ |
| Riwayat Trip (listener dari orders) | `driver/page.tsx` | ✅ |
| Dashboard Dompet Koperasi + Karcis | `driver/page.tsx` (wallet tab) | ✅ |
| Demand Hotspot Surakarta | `DEMAND_HOTSPOTS_SURAKARTA` constants | ✅ |
| Terima & mulai trip | `orderService.acceptOrder` | ✅ |
| Active Trip page | `driver/active-trip/[id]/page.tsx` | ✅ |

### 🔲 Phase 2 — Prioritas Tinggi
| Fitur | Deskripsi | Data Required |
|---|---|---|
| Filter order berdasarkan `serviceType` | Radar hanya tampil order yang cocok preferensi | `OrderDocument.serviceType` |
| Update GPS lokasi driver realtime | Posisi dikirim ke `drivers` collection setiap N detik | `drivers/{uid}.location` |
| Notifikasi suara order masuk baru | Alert audio + push ketika ada pending order baru | `notifications` collection |
| Earnings summary harian | Breakdown pendapatan hari ini / minggu ini | Aggregate dari `orders` |
| Navigasi GPS saat in_progress | Buka Google Maps navigasi ke pickup → dropoff | Google Maps deeplink |

### 🔲 Phase 3+ — Visioner
| Fitur | Deskripsi |
|---|---|
| Karcis Berbayar (deduct dompet) | Bayar karcis harian dari saldo dompet koperasi |
| SHU Calculator | Lihat estimasi bagi hasil koperasi tahunan |
| KYC Upload KTP + SIM | Upload dokumen untuk verifikasi identitas |
| Forum Driver Komunitas | Chat sesama driver, laporan kondisi jalan |
| Geofencing kecamatan | Hanya terima order dalam radius kerja yang dipilih |
| Anti-fraud GPS tuyul | Deteksi jika driver tidak benar-benar bergerak |
| Titip Tetangga batching | Ambil multiple order searah rute sekaligus |

---

## 🏪 MERCHANT UMKM (Penjual Lokal)

**Filosofi Role:** UMKM adalah jantung ekonomi lokal Surakarta. Platform memberi UMKM
akses ke ribuan customer lokal tanpa biaya listing dan komisi. Flash Sale geofenced
memungkinkan UMKM "berteriak" ke warga sekitar dalam hitungan detik. Titip Tetangga
memberi UMKM pasar baru tanpa armada pengiriman sendiri.

### ✅ Sudah Ada (Phase 1)
| Fitur | File | Status |
|---|---|---|
| Dashboard warung (nama, area, rating, metrics) | `merchant/page.tsx` | ✅ |
| Toggle buka/tutup warung | `merchant/page.tsx` | ✅ |
| Kelola menu & stok (toggle ketersediaan) | `merchant/page.tsx` (state lokal) | ✅ |
| Flash Sale Pasar Warga launcher (UI) | `merchant/page.tsx` | ✅ |
| Pesanan masuk statis (hardcoded demo) | `merchant/page.tsx` | ✅ |

### 🔲 Phase 2 — Prioritas Tinggi
| Fitur | Deskripsi | Data Required |
|---|---|---|
| Pesanan masuk REALTIME | `onSnapshot` dari `orders` dimana `merchantId == uid` | `orders.merchantId` field |
| Notifikasi pesanan baru | Suara + badge saat order kuliner masuk | `notifications` collection |
| Menu CRUD ke Firestore | Tambah / edit / hapus menu disimpan ke `menu_items` | `menu_items` collection |
| Riwayat penjualan harian | List order selesai hari ini + total omset | Aggregate `orders` |
| Flash Sale ke Firestore | Simpan status flash sale + broadcast notif ke customer | `broadcasts` collection |

### 🔲 Phase 3+ — Visioner
| Fitur | Deskripsi |
|---|---|
| Statistik penjualan (chart) | Grafik omset harian / mingguan / bulanan |
| Katalog publik (bisa dilihat semua customer) | Halaman toko online yang shareable |
| Supply Order dari Industry | Terima penawaran bahan baku dari mitra industri |
| Titip Tetangga batching | Order dari customer searah dikumpul ke satu driver |
| Rating & Review Management | Balas ulasan, tampilkan bintang rata-rata |
| Laporan Pajak UMKM | Ekspor laporan penjualan untuk pelaporan Pemda |
| Program Pasar Murah | Terima subsidi harga dari Government untuk produk tertentu |

---

## 🏭 INDUSTRY B2B (Distributor & Industri Lokal)

**Filosofi Role:** Industri lokal Surakarta (tekstil Laweyan, pengolahan makanan, dll.)
membutuhkan armada distribusi yang fleksibel dan terpercaya. Ride-Solo menjadi
"marketplace logistik lokal" yang menghubungkan industri langsung dengan driver
koperasi — jauh lebih efisien dan murah dari ekspedisi nasional untuk pengiriman lokal.

### ✅ Sudah Ada (Phase 1)
| Fitur | File | Status |
|---|---|---|
| Dashboard perusahaan (nama, area, metrics) | `industry/page.tsx` | ✅ |
| Tampil kontrak distribusi statis | `industry/page.tsx` | ✅ |
| Tombol Order Batch (UI saja) | `industry/page.tsx` | ✅ |

### 🔲 Phase 2 — Prioritas Tinggi
| Fitur | Deskripsi | Data Required |
|---|---|---|
| Buat kontrak distribusi ke Firestore | Form → simpan ke `contracts` collection | `contracts` collection |
| Assign driver pool ke kontrak | Pilih driver yang tersedia untuk kontrak | `contracts.assignedDrivers` |
| Status kontrak realtime | Berapa titik sudah terkirim, berapa pending | `contracts.deliveryPoints[]` |
| Export laporan pengiriman | Download PDF/CSV riwayat distribusi | Client-side PDF generation |

### 🔲 Phase 3+ — Visioner
| Fitur | Deskripsi |
|---|---|
| B2B Marketplace | Tawarkan bahan baku ke merchant UMKM binaan |
| Invoice Otomatis | Faktur digital saat kontrak selesai |
| GPS Tracking Armada | Pantau semua driver kontrak di peta |
| SLA Monitoring | Alert jika ada driver terlambat dari jadwal |
| Rating Driver Armada | Evaluasi performa mitra driver per kontrak |
| Integrasi Supply ke Pemda | Laporkan distribusi ke program binaan Dinas UMKM |
| Kontrak Berjangka | Kontrak distribusi mingguan / bulanan otomatis |

---

## 🏛️ GOVERNMENT / KOPERASI (Pemda & Koperasi Warga)

**Filosofi Role:** Pemerintah bukan hanya regulator — di Ride-Solo, Pemda adalah
**partner aktif** yang bisa mensubsidi karcis driver, mengumumkan program pasar murah,
memantau kesehatan ekonomi lokal, dan berkolaborasi dengan koperasi untuk program SHU.
Ini adalah civic technology yang nyata.

### ✅ Sudah Ada & Terintegrasi
| Fitur | Komponen / File | Status |
|---|---|---|
| Dashboard Civic Multi-Dinas (7 Dinas Pemkot Solo) | `gov/page.tsx` | ✅ |
| Broadcast Pengumuman Resmi ke Seluruh Warga (Firestore) | `broadcast.service.ts` + `useBroadcasts.ts` | ✅ |
| Disdukcapil Workspace: Antar KTP/KK & Validasi OTP | `GovDukcapilWorkspace.tsx` + `DukcapilCivicModal.tsx` | ✅ |
| Dinkes Workspace: Resep Obat 17 Puskesmas & Medis | `GovDinkesWorkspace.tsx` + `DinkesCivicModal.tsx` | ✅ |
| Dinsos Workspace: Bansos Pasar & Ojek Difabel/Lansia | `GovDinsosWorkspace.tsx` + `DinsosCivicModal.tsx` | ✅ |
| Diskop Workspace: NIB OSS & SHU Koperasi Mitra | `GovDiskopWorkspace.tsx` + `DiskopCivicModal.tsx` | ✅ |
| Dispar Workspace: Kalender Budaya & Paket Wisata | `GovDisparWorkspace.tsx` + `DisparCivicModal.tsx` | ✅ |
| Dishub Workspace: Shelter CFD & Integrasi BST | `GovDishubWorkspace.tsx` + `DishubCivicModal.tsx` | ✅ |
| Bapenda Workspace: PBB-P2, e-Retribusi Pasar & PAD | `GovBapendaWorkspace.tsx` + `BapendaCivicModal.tsx` | ✅ |
| Audit Log Terpadu & Riwayat Berkas Warga | `UnifiedHistoryModal.tsx` | ✅ |

### 🔲 Tahap Lanjutan
| Fitur | Deskripsi | Data Required |
|---|---|---|
| Webhook SIAK Dukcapil | Sinkronisasi status cetak KTP otomatis | Cloud Functions Webhook |
| Live IoT BST Tracker | Posisi bus Batik Solo Trans real-time di peta | Dishub API Feed |
| Host-to-Host Bank Jateng PAD | Rekonsiliasi mutasi PBB & retribusi harian | Bapenda Banking Bridge |

---

## 👑 SUPER ADMIN

**Filosofi Role:** Super Admin adalah "mata dan tangan" platform. Ia bisa melihat
dan beroperasi sebagai role manapun (impersonation) untuk debugging dan QA,
serta memiliki akses penuh ke semua data. Trust Engine ada di sini — dari
approval KYC hingga suspend driver fraud.

### ✅ Sudah Ada (Phase 1)
| Fitur | File | Status |
|---|---|---|
| Role Impersonation Engine (sessionStorage) | `AuthProvider.tsx` | ✅ |
| Floating Impersonation Bar | `AdminImpersonationBar.tsx` | ✅ |
| Firestore user list (onSnapshot) | `admin/page.tsx` | ✅ |
| Role changer (update role di Firestore) | `admin/page.tsx` + `authService` | ✅ |
| System-wide metrics statis | `admin/page.tsx` | ✅ |

### 🔲 Phase 2 — Prioritas Tinggi
| Fitur | Deskripsi | Data Required |
|---|---|---|
| KYC Approval Workflow | Review dokumen driver, approve/reject | `kyc_requests` collection |
| Fraud Flag Dashboard | Lihat driver yang dilaporkan fraud | `fraud_reports` collection |
| Geofencing Config UI | Set batas radius kerja per kecamatan | Config di Firestore |

### 🔲 Phase 3+ — Visioner
| Fitur | Deskripsi |
|---|---|
| System-Wide Analytics | Semua role, semua ekosistem dalam satu dashboard |
| Anti-Fraud Alert | Real-time alert GPS tuyul, pola order mencurigakan |
| Driver Whitelist/Blacklist | Suspend atau aktifkan kembali akun driver |
| A/B Test Flag Manager | Toggle fitur eksperimental per grup user |
| Data Export & Backup | Download seluruh data ekosistem untuk audit |
| Multi-Tenant Admin | Bisa kelola beberapa kota/wilayah dari satu panel |

---

## 📊 Ringkasan Feature Readiness Matrix

| Ekosistem | Phase 1 ✅ | Phase 2 🔲 | Phase 3+ 🌱 |
|---|---|---|---|
| Customer | 8 fitur | 5 fitur | 6 fitur |
| Driver | 9 fitur | 5 fitur | 7 fitur |
| Merchant UMKM | 5 fitur | 5 fitur | 7 fitur |
| Industry B2B | 3 fitur | 4 fitur | 7 fitur |
| Government/Koperasi | 4 fitur | 4 fitur | 6 fitur |
| Super Admin | 5 fitur | 3 fitur | 5 fitur |
| **TOTAL** | **34 fitur** | **26 fitur** | **38 fitur** |
