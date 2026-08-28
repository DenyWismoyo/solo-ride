# PROMO_ENGINE.md — Mesin Diskon, Flash Sale & Voucher

> Panduan lengkap untuk merancang, memvalidasi, dan mengeksekusi semua
> mekanisme promosi di ekosistem Ride-Solo tanpa merugikan pihak manapun.

---

## Filosofi: "Diskon yang Jujur"

```
Diskon di Ride-Solo TIDAK boleh:
  ❌ Memotong take-home driver di bawah minimum
  ❌ Membuat margin merchant negatif
  ❌ Mengorbankan kas koperasi

Diskon HARUS:
  ✅ Disubsidi pihak yang memberikan promo (platform/merchant/koperasi)
  ✅ Transparan — customer tahu siapa yang menanggung diskon
  ✅ Memiliki batas atas yang jelas (MAX_DISC)
  ✅ Tervalidasi di server-side (Firebase Function), bukan client
```

---

## 1. Tipe Promo yang Tersedia

| Tipe Promo | Siapa yang Menanggung | Berlaku Untuk |
|-----------|----------------------|---------------|
| `VOUCHER_PLATFORM` | Platform (dari kas koperasi) | Semua layanan |
| `VOUCHER_MERCHANT` | Merchant UMKM (dari margin mereka) | Kuliner & Mart |
| `POIN_STAMP` | Platform (reward) | Penukaran poin customer |
| `FLASH_SALE_PASAR` | Merchant (diskon stok) | Pasar Warga event |
| `SUBSIDI_SEPI` | Koperasi (isi lembah sepi) | Jam non-peak Senin–Kamis |
| `FIRST_ORDER` | Platform (akuisisi user baru) | Order pertama saja |
| `REFERRAL` | Platform | Setiap referral berhasil |
| `B2B_CONTRACT` | Industri mitra (volume) | Akun bisnis terverifikasi |

---

## 2. Formula Validasi Diskon (Anti-Rugi)

### Untuk layanan transportasi (Ojek, Mobil, Kirim):

```
KARCIS_HARIAN = Rp 15.000
MIN_DRIVER_TAKE_HOME_PER_TRIP = Rp 8.000   // Batas bawah yang wajar

// Diskon tidak boleh membuat driver menerima di bawah minimum
diskon_efektif = min(
  diskon_nominal,                                    // Diskon yang diminta
  tarif_base - MIN_DRIVER_TAKE_HOME_PER_TRIP         // Batas agar driver tidak rugi
)

tarif_final = max(tarif_base - diskon_efektif, MIN_FARE_SERVICE)
```

### Untuk kuliner & mart (Merchant menanggung diskon):

```
HPP_MIN_RATIO = 0.30   // Asumsi HPP minimal 30% dari harga jual

// Margin yang bisa didiskon = harga_jual - HPP
margin_kotor_item = harga_jual × (1 - HPP_MIN_RATIO)  // 70% dari harga

// Diskon maksimum yang diperbolehkan (tidak boleh makan HPP)
MAX_DISCOUNT_MERCHANT = margin_kotor_item × 0.50   // Maks 50% dari margin kotor

// Diskon efektif
diskon_efektif = min(diskon_nominal, MAX_DISCOUNT_MERCHANT)
```

---

## 3. Sistem Kode Voucher

### Firestore Schema: `promos/{promoId}`

```typescript
interface PromoDocument {
  id: string;
  code: string;              // e.g. "SOLO10", "WARUNG30"
  type: "percentage" | "flat";
  discountValue: number;     // Persentase (0-1) atau nominal (Rp)
  maxDiscountAmount: number; // Batas atas diskon (penting untuk voucher %)
  minOrderAmount: number;    // Order minimum untuk pakai voucher
  validFor: ServiceType[];   // Layanan yang berlaku
  merchantId?: string;       // Null = berlaku semua merchant
  validFrom: Timestamp;
  validUntil: Timestamp;
  usageLimit: number;        // Total penggunaan maksimal
  usageCount: number;        // Sudah digunakan berapa kali (atomic increment)
  perUserLimit: number;      // Maks penggunaan per user (default: 1)
  fundedBy: "platform" | "merchant" | "koperasi" | "industry";
  isActive: boolean;
  createdBy: string;         // admin/merchant UID
}
```

### Callable Function: `validatePromoCode`

```typescript
// functions/src/callables/promo.callable.ts
export const validatePromoCode = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

  const { code, serviceType, orderAmount, merchantId } = request.data;

  // 1. Cari promo di Firestore
  const snap = await db.collection("promos")
    .where("code", "==", code.toUpperCase())
    .where("isActive", "==", true)
    .get();

  if (snap.empty) throw new HttpsError("not-found", "Kode promo tidak ditemukan.");

  const promo = snap.docs[0].data() as PromoDocument;
  const now = new Date();

  // 2. Validasi waktu
  if (promo.validFrom.toDate() > now || promo.validUntil.toDate() < now) {
    throw new HttpsError("failed-precondition", "Promo sudah kedaluwarsa.");
  }

  // 3. Validasi service type
  if (!promo.validFor.includes(serviceType)) {
    throw new HttpsError("failed-precondition", "Promo tidak berlaku untuk layanan ini.");
  }

  // 4. Validasi minimum order
  if (orderAmount < promo.minOrderAmount) {
    throw new HttpsError("failed-precondition",
      `Minimum order Rp ${promo.minOrderAmount.toLocaleString("id-ID")}.`);
  }

  // 5. Cek batas penggunaan total
  if (promo.usageCount >= promo.usageLimit) {
    throw new HttpsError("resource-exhausted", "Kuota promo sudah habis.");
  }

  // 6. Cek batas penggunaan per user (cek di sub-collection)
  const userUsage = await db
    .collection("promos").doc(snap.docs[0].id)
    .collection("usage").doc(request.auth.uid).get();

  if (userUsage.exists && (userUsage.data()?.count || 0) >= promo.perUserLimit) {
    throw new HttpsError("already-exists", "Anda sudah menggunakan promo ini.");
  }

  // 7. Hitung diskon efektif
  let discountAmount = promo.type === "percentage"
    ? orderAmount * promo.discountValue
    : promo.discountValue;

  discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);

  return {
    isValid: true,
    promoId: snap.docs[0].id,
    discountAmount: Math.round(discountAmount),
    promoName: promo.code,
    fundedBy: promo.fundedBy,
  };
});
```

---

## 4. Flash Sale Pasar Warga

Flash Sale adalah mekanisme di mana **UMKM menawarkan diskon stok** secara broadcast ke warga dalam radius tertentu.

### Aturan Flash Sale yang Aman:

```
FLASH_SALE_MAX_DURATION = 2 jam   // Maks durasi per event flash sale
FLASH_SALE_MAX_DISC     = 40%     // Maks diskon yang diperbolehkan
FLASH_SALE_MIN_MARGIN   = 25%     // Platform tidak izinkan flash sale jika margin < 25%
FLASH_SALE_STOCK_LIMIT  = true    // Wajib set kuota stok maksimal

// Sebelum izinkan flash sale, validasi:
if (harga_flash_sale < HPP_produk × 1.15):
  tolak = true   // Menjual di bawah 15% keuntungan dari HPP tidak diizinkan
```

### Alur Flash Sale:

```
1. Merchant aktifkan Flash Sale di dashboard
2. Platform validasi: margin produk ≥ 25%?
3. Broadcast notifikasi ke warga radius 2 km (via FCM / Firestore listener)
4. Customer order dalam window waktu → harga flash sale otomatis diterapkan
5. Setelah window habis → harga kembali normal otomatis (scheduled function)
6. Merchant terima laporan: total penjualan, item terjual, rating kepuasan
```

---

## 5. Sistem Poin Stamp

```
POIN_PER_RUPIAH  = 1 poin per Rp 10.000 transaksi (dibulatkan ke bawah)
POIN_BONUS_OJEK  = +5 poin (insentif driver berhasil)
POIN_BONUS_UMKM  = +10 poin (insentif beli dari UMKM lokal)
POIN_EXPIRED     = 12 bulan sejak terakhir transaksi

// Penukaran Poin:
TUKAR_NILAI_POIN = Rp 100 per poin (1 poin = Rp 100)
TUKAR_MIN_POIN   = 50 poin (= Rp 5.000)
TUKAR_BERLAKU    = Semua layanan + Toko UMKM mitra
```

---

## 6. Promo Referral

```
REFERRAL_REWARD_REFERRER = +Rp 10.000 saldo dompet (setelah referee selesai 3 trip)
REFERRAL_REWARD_REFEREE  = Diskon 20% untuk 3 trip pertama (batas Rp 15.000/trip)
REFERRAL_FRAUD_GUARD:
  - Satu device tidak bisa klaim referral dari dirinya sendiri
  - Verifikasi nomor HP unik
  - Max 10 referral aktif per user per bulan
```

---

## 7. B2B Contract Pricing (Industri Mitra)

```
// Industri yang mendaftar sebagai mitra B2B mendapat tarif khusus
B2B_DISC_TIER_1 = 10%   // 100–499 trip/bulan
B2B_DISC_TIER_2 = 15%   // 500–999 trip/bulan
B2B_DISC_TIER_3 = 20%   // 1000+ trip/bulan

// Driver yang mengambil job B2B mendapat bonus:
B2B_DRIVER_BONUS_PER_TRIP = Rp 2.000 (dari subsidi kontrak B2B)
```
