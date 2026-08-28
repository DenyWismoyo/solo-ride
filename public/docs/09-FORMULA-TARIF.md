# 📐 Formula Tarif Transparansi Ride-Solo
## Dokumen Publik: Cara Kami Menghitung Harga — Tanpa Rahasia

> _"Di Ride-Solo, tidak ada 'algoritma misterius'. Setiap sen yang Anda bayar bisa dihitung ulang dengan kalkulator."_

---

## 🧮 Prinsip Dasar Tarif

```
FORMULA MASTER:

Tarif Final = max(
    (Tarif Dasar + (Jarak × Tarif per KM) + Surcharge) × Surge Multiplier - Diskon,
    Tarif Minimum
)

Di mana:
  • Tarif Dasar     = Biaya tetap per perjalanan (berbeda per layanan)
  • Tarif per KM    = Biaya per kilometer jarak
  • Surcharge       = Biaya tambahan (berat, malam, dll.)
  • Surge Multiplier= Pengali jam sibuk (1.0x hingga maks 1.5x)
  • Diskon          = Potongan promo (divalidasi server, tidak bisa dimanipulasi)
  • Tarif Minimum   = Batas bawah tarif yang selalu berlaku
```

**Penting:** Seluruh tarif `Tarif Final` pergi ke **Driver (100%)**.
Platform mendapat pendapatan dari Karcis Harian — bukan dari potongan per trip.

---

## 🏍️ 1. Ojek Motor

| Parameter | Nilai |
|-----------|-------|
| Biaya Awal | Rp 3.000 |
| Per KM | Rp 2.500 |
| Tarif Minimum | Rp 10.000 |

**Kalkulator Cepat:**

| Jarak | Tarif |
|-------|-------|
| 1 km | Rp 10.000 (minimum) |
| 2 km | Rp 10.000 (minimum) |
| 3 km | Rp 10.500 |
| 5 km | Rp 15.500 |
| 10 km | Rp 28.000 |
| 15 km | Rp 40.500 |

**Bonus Jam Sepi (Senin–Kamis, 10.00–15.00):**
```
Tarif pelanggan = Tarif Normal × 0.9 (diskon 10%)
Tarif driver    = Tarif Normal (100% — subsidi koperasi menutup 10%)
```

---

## 🚗 2. Mobil Warga

| Parameter | Nilai |
|-----------|-------|
| Biaya Awal | Rp 5.000 |
| Per KM | Rp 4.500 |
| Tarif Minimum | Rp 15.000 |

**Kalkulator Cepat:**

| Jarak | Tarif (Normal) | Tarif (Malam +Rp 5.000) |
|-------|----------------|--------------------------|
| 1 km | Rp 15.000 | Rp 20.000 |
| 3 km | Rp 18.500 | Rp 23.500 |
| 5 km | Rp 27.500 | Rp 32.500 |
| 10 km | Rp 50.000 | Rp 55.000 |

---

## 📦 3. Kirim Kilat

| Parameter | Nilai |
|-----------|-------|
| Biaya Awal | Rp 5.000 |
| Per KM | Rp 3.000 |
| Tarif Minimum | Rp 12.000 |

**Tabel Surcharge Berat:**

| Berat Paket | Surcharge |
|-------------|-----------|
| ≤ 5 kg | Rp 0 (gratis) |
| 5–10 kg | +Rp 5.000 |
| 10–20 kg | +Rp 12.000 |
| 21 kg | +Rp 13.000 |
| 25 kg | +Rp 17.000 |
| 30 kg | +Rp 22.000 |
| N kg (N > 20) | +Rp 12.000 + (N-20) × Rp 1.000 |

**Kalkulator (3 kg, 4 km):**
```
= Rp 5.000 + (4 × Rp 3.000) + Rp 0 (berat ≤5kg)
= Rp 5.000 + Rp 12.000
= Rp 17.000
```

**Kalkulator (12 kg, 5 km):**
```
= Rp 5.000 + (5 × Rp 3.000) + Rp 12.000 (berat 10-20kg)
= Rp 5.000 + Rp 15.000 + Rp 12.000
= Rp 32.000
```

---

## 🍜 4. Kuliner Warga & Apotek/Mart

| Parameter | Nilai |
|-----------|-------|
| Tarif Flat (≤ 3 km) | Rp 8.000 |
| Tarif Tambahan (> 3 km) | +Rp 2.000/km |
| Tarif Minimum | Rp 8.000 |

**Kalkulator:**

| Jarak | Ongkir |
|-------|--------|
| 1 km | Rp 8.000 |
| 2 km | Rp 8.000 |
| 3 km | Rp 8.000 |
| 4 km | Rp 10.000 (+1km × Rp 2.000) |
| 5 km | Rp 12.000 |
| 7 km | Rp 16.000 |

*Catatan: Radius maksimal layanan Kuliner adalah 7 km. Di atas itu, platform merekomendasikan driver terdekat ke merchant.*

---

## 🤝 5. Titip Tetangga (Batch Order)

Untuk pengiriman multi-paket dalam satu rute, driver mendapat insentif efisiensi:

| Jumlah Paket Searah | Diskon per Pengirim | Bonus Driver |
|--------------------|---------------------|--------------|
| 1 paket (biasa) | 0% | 0% |
| 2 paket | -20% untuk customer | +10% untuk driver |
| 3 paket | -30% untuk customer | +10% untuk driver |
| 4+ paket | -35% untuk customer | +10% untuk driver |

**Contoh (3 paket, masing-masing 4 km, 2 kg):**
```
Tarif normal 1 paket: Rp 5.000 + (4 × Rp 3.000) = Rp 17.000

Customer 1: Rp 17.000 × 70% = Rp 11.900 (hemat 30%)
Customer 2: Rp 17.000 × 70% = Rp 11.900
Customer 3: Rp 17.000 × 70% = Rp 11.900

Total driver terima: (Rp 11.900 × 3) × 1.10 = Rp 39.270
→ Driver dapat Rp 39.270 vs Rp 17.000 jika kirim sendiri-sendiri
```

**Semua menang:** Customer hemat 30%, Driver dapat lebih banyak, jalan lebih efisien.

---

## ⚡ Surge Pricing — Transparan & Berkeadilan

```
TABEL SURGE MULTIPLIER:

Waktu                    | Multiplier | Keterangan
─────────────────────────┼────────────┼──────────────────────────────
06.00–17.00 (semua hari) │    1.0x    │ Tarif normal
17.00–20.00              │    1.2x    │ Puncak sore (+20%)
20.00–00.00              │    1.1x    │ Malam hari (+10%)
00.00–05.00              │    1.3x    │ Dini hari (+30%)
Event Besar (manual)     │   ≤1.5x    │ Lebaran, konser besar — ada BATAS ATAS

ATURAN PENTING:
  1. Surge TIDAK berlaku untuk order pertama pengguna baru
  2. Batas atas (surge cap) = 1.5x — TIDAK BISA lebih tinggi
  3. Selisih surge = insentif TAMBAHAN 100% untuk driver
  4. Admin dapat mengaktifkan Event Surge secara manual
  5. Event Surge otomatis berakhir setelah 6 jam
```

**Contoh Kalkulasi Surge:**
```
Order Ojek, 5 km, jam 18.00:

Tarif Dasar = max(Rp 3.000 + 5 × Rp 2.500, Rp 10.000)
            = max(Rp 15.500, Rp 10.000)
            = Rp 15.500

Surge 17.00-20.00 = 1.2x

Tarif Final = Rp 15.500 × 1.2 = Rp 18.600
```

---

## 🎁 Mekanisme Diskon & Promo

### Jenis Promo yang Tersedia

| Tipe | Disubsidi Oleh | Berlaku Untuk |
|------|----------------|---------------|
| `VOUCHER_PLATFORM` | Platform (kas koperasi) | Semua layanan |
| `VOUCHER_MERCHANT` | Merchant UMKM sendiri | Kuliner & Mart |
| `POIN_STAMP` | Platform (penukaran reward) | Semua layanan + UMKM |
| `FLASH_SALE` | Merchant (diskon stok) | Event Flash Sale |
| `SUBSIDI_SEPI` | Koperasi | Senin–Kamis 10.00–15.00 |
| `FIRST_ORDER` | Platform (akuisisi) | Order pertama saja |
| `REFERRAL` | Platform | Per referral berhasil |
| `B2B_CONTRACT` | Industri mitra | Akun bisnis terverifikasi |

### Aturan Anti-Rugi (untuk Driver & Merchant)

```
VALIDASI DISKON TRANSPORTASI (dijalankan di server, tidak bisa dimanipulasi):

  diskon_efektif = min(
    diskon_yang_diminta,
    tarif_dasar - Rp 8.000  // Driver harus dapat minimal Rp 8.000
  )
  
  tarif_final = max(tarif_dasar - diskon_efektif, tarif_minimum_layanan)
  driver_take_home = tarif_final  // Selalu 100%

VALIDASI DISKON MERCHANT (untuk Flash Sale dan Voucher Merchant):

  margin_kotor_item = harga_jual × 70%  // Asumsi HPP 30%
  maks_diskon_merchant = margin_kotor_item × 50%  // Maks 50% dari margin
  
  diskon_efektif = min(diskon_nominal, maks_diskon_merchant)
```

**Artinya:** Platform **secara teknis tidak memungkinkan** Anda memberi diskon yang membuat Anda rugi.

---

## 🔄 BizConfig — Tarif yang Bisa Diupdate Tanpa Deploy

Semua nilai tarif di atas disimpan di sistem dan bisa diubah oleh Super Admin melalui **BizConfig Panel** kapanpun, tanpa perlu update aplikasi.

Dokumen ini akan selalu sinkron dengan nilai yang berlaku saat ini.

**Nilai aktif terakhir diperbarui:** Agustus 2026

---

## 🧾 Simulasi Tagihan Lengkap

### Contoh: Customer pesan ojek, malam hari, pakai voucher

```
Input:
  Layanan      : Ojek Motor
  Jarak        : 7 km
  Waktu        : 21.30 WIB (malam)
  Voucher      : SOLO10 (diskon Rp 10.000, minimum order Rp 20.000)

Kalkulasi:
  Tarif Dasar  = Rp 3.000 + (7 × Rp 2.500) = Rp 20.500
  Minimum      = Rp 10.000 ← tidak berlaku (sudah di atas minimum)
  Surge Malam  = 1.1x
  Tarif × Surge = Rp 20.500 × 1.1 = Rp 22.550

  Validasi Voucher (server-side):
    Order amount = Rp 22.550 ≥ min Rp 20.000 ✅
    Diskon = Rp 10.000
    Anti-rugi check: Rp 22.550 - Rp 10.000 = Rp 12.550 ≥ Rp 8.000 ✅
  
  TARIF FINAL  = Rp 22.550 - Rp 10.000 = Rp 12.550

  Yang Anda Bayar     : Rp 12.550
  Driver Take-Home    : Rp 12.550 (100%)
  Diskon Ditanggung   : Rp 10.000 (kas koperasi)
```

---

> _"Transparansi bukan hanya slogan kami — ini adalah fitur teknis yang dibangun ke dalam sistem. Formula ini berjalan di server, bukan di browser Anda, sehingga tidak bisa dimanipulasi oleh siapapun."_
