# TOOL_REGISTRY.md — Master Daftar Tools MCP Server Ride-Solo

> Dokumen ini adalah **single source of truth** untuk semua tools di MCP Server Ride-Solo (`mcp-server/src/index.ts`).
>
> Status: ✅ Terimplementasi & Aktif (Total: 26 Tools)

---

## EKOSISTEM 1: CORE — Orders & Dispatch

### `get_pending_orders` ✅
- **Deskripsi**: Mendapatkan daftar pesanan transportasi/layanan yang berstatus `pending` siap dispatch.
- **Input**: `{}`
- **Proteksi**: Data kontak & nama pemohon disanitasi/dimask.

### `get_driver_stats` ✅
- **Deskripsi**: Statistik ringkas jumlah driver terdaftar, driver online, dan karcis harian aktif.
- **Input**: `{}`

### `assign_order_to_driver` ✅
- **Deskripsi**: Menugaskan pesanan ke seorang driver mitra secara **atomic/transaksional** (`runTransaction`) untuk mencegah *double-claim* / race condition.
- **Input**: `{ orderId: string, driverId: string, driverName?: string, driverPhone?: string }`
- **Audit Trail**: Mencatat entri penugasan otomatis ke subcollection `orders/{orderId}/auditLog`.

### `list_online_drivers` ✅
- **Deskripsi**: Mendapatkan daftar lengkap driver mitra yang sedang online, koordinat GPS, plat nomor, model kendaraan, dan stamp point.
- **Input**: `{ limit?: number }`

### `get_order_detail` ✅
- **Deskripsi**: Rincian lengkap dokumen pesanan tunggal berdasarkan ID.
- **Input**: `{ orderId: string }`

### `get_orders_by_status` ✅
- **Deskripsi**: Filter daftar pesanan berdasarkan status tertentu (`pending`, `accepted`, `in_progress`, `completed`, `cancelled`, `rejected`).
- **Input**: `{ status: string, limit?: number }`

### `get_recent_orders` ✅
- **Deskripsi**: Mengambil N pesanan terbaru lintas status untuk monitoring platform real-time.
- **Input**: `{ limit?: number, serviceType?: string }`

### `update_order_status` ✅
- **Deskripsi**: Memperbarui status pesanan administratif dengan pencatatan audit log aktor.
- **Input**: `{ orderId: string, newStatus: string, actorRole?: string, actorName?: string }`

---

## EKOSISTEM 2: GOV — Layanan Warga Pemerintahan (18 Dinas Pemkot Surakarta)

### `list_gov_orders` ✅
- **Deskripsi**: Mengambil daftar permohonan layanan warga untuk dinas tertentu (Dukcapil, Dinkes, Damkar, BPBD, dll).
- **Input**: `{ additionalRole?: string, status?: string, limit?: number }`
- **Privasi**: Proteksi privasi DP3A otomatis.

### `get_gov_order_detail` ✅
- **Deskripsi**: Rincian lengkap permohonan dinas beserta form spesifik (`citizenDetails`).
- **Input**: `{ orderId: string, requestorRole?: string }`

### `verify_gov_order` ✅
- **Deskripsi**: Memverifikasi permohonan oleh petugas OPD (`pending_verification` ➔ `pending`).
- **Input**: `{ orderId: string, verifiedByName: string, verifiedByUid?: string }`
- **Audit Trail**: Menulis log `verified_by_opd` ke subcollection `auditLog`.

### `reject_gov_order` ✅
- **Deskripsi**: Menolak permohonan warga dengan alasan penolakan tanpa hard-delete dokumen (`status: "rejected"`).
- **Input**: `{ orderId: string, rejectedByName: string, rejectionReason: string, rejectedByUid?: string }`
- **Audit Trail**: Menulis log penolakan ke subcollection `auditLog`.

### `list_pending_verification` ✅
- **Deskripsi**: Monitoring cepat seluruh permohonan yang sedang menunggu verifikasi petugas OPD.
- **Input**: `{ additionalRole?: string, limit?: number }`

### `get_gov_stats` ✅
- **Deskripsi**: Rekapitulasi statistik permohonan per dinas dan status penanganan.
- **Input**: `{ additionalRole?: string }`

---

## EKOSISTEM 3: DRIVER — Manajemen Kemitraan & Karcis

### `get_driver_karcis_status` ✅
- **Deskripsi**: Mengecek masa berlaku Karcis Harian flat Rp 5.000 (24 Jam Bebas Komisi).
- **Input**: `{ driverId: string }`

### `get_driver_wallet` ✅
- **Deskripsi**: Memeriksa saldo dompet digital internal koperasi driver.
- **Input**: `{ driverId: string }`

### `list_driver_ledger` ✅
- **Deskripsi**: Mutasi pembukuan dompet driver (kredit, debit karcis, top-up).
- **Input**: `{ driverId: string, limit?: number }`

### `list_kyc_requests` ✅
- **Deskripsi**: Antrian verifikasi dokumen legalitas KTP & SIM mitra driver.
- **Input**: `{ status?: string, limit?: number }`

### `verify_driver_kyc` ✅
- **Deskripsi**: Persetujuan / penolakan KYC driver oleh admin/operator.
- **Input**: `{ driverUid: string, approved: boolean, notes?: string }`

### `get_driver_performance` ✅
- **Deskripsi**: Metrik performa driver (total trip selesai, rating, stamp points komunitas).
- **Input**: `{ driverId: string }`

---

## EKOSISTEM 4: MERCHANT — UMKM & Kuliner

### `list_merchants` ✅
- **Deskripsi**: Daftar warung & toko UMKM binaan di Surakarta.
- **Input**: `{ isVerified?: boolean, limit?: number }`

### `list_merchant_orders` ✅
- **Deskripsi**: Daftar pesanan makanan / belanjaan pada warung tertentu.
- **Input**: `{ merchantId: string, status?: string, limit?: number }`

### `get_merchant_stats` ✅
- **Deskripsi**: Ringkasan omzet kotor dan total pesanan terselesaikan warung mitra.
- **Input**: `{ merchantId: string }`

---

## EKOSISTEM 5: ADMIN — Pemantauan Ekosistem 360°

### `get_ecosystem_stats` ✅
- **Deskripsi**: Laporan eksekutif ringkas mencakup seluruh pilar (Transportasi, UMKM, Layanan Pemkot).
- **Input**: `{ periodDays?: number }`

### `list_users_by_role` ✅
- **Deskripsi**: Lookup akun pengguna per kategori peran (`customer`, `driver`, `merchant`, `government`, `industry`, `admin`).
- **Input**: `{ role: string, limit?: number }`

### `get_user_detail` ✅
- **Deskripsi**: Profil detail pengguna dengan enkapsulasi data privasi.
- **Input**: `{ uid: string }`
