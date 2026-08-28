# PRICING_FORMULAS.md — Rumus Tarif Ride-Solo

> Sumber kebenaran tunggal untuk semua formula tarif di ekosistem Ride-Solo.
> Setiap perubahan harus diuji di emulator sebelum deploy ke production.

---

## Prinsip Dasar Tarif

```
Tarif Final = (Base Fare + (Jarak × Per KM Rate)) × Surge Multiplier - Diskon
Tarif Final  ≥ Minimum Fare (selalu berlaku)
Driver Take-Home = 100% dari Tarif Final (platform TIDAK potong per trip)
```

---

## 1. Tarif Per Layanan

### 🛵 Ojek Motor
```
BASE_FARE_OJEK   = Rp 3.000
RATE_PER_KM_OJEK = Rp 2.500
MIN_FARE_OJEK    = Rp 10.000
```

**Formula:**
```
tarif = max(BASE_FARE_OJEK + (jarak × RATE_PER_KM_OJEK), MIN_FARE_OJEK)
```

**Insentif Senin–Kamis (Low Traffic):**
```
if hari in [Senin, Selasa, Rabu, Kamis] AND jam in [10:00–15:00]:
  tarif = tarif × 0.9  // Diskon 10% untuk customer, driver tetap 100% karena ada subsidi koperasi
```

### 🚗 Mobil Warga
```
BASE_FARE_MOBIL   = Rp 5.000
RATE_PER_KM_MOBIL = Rp 4.500
MIN_FARE_MOBIL    = Rp 15.000
```

**Formula:**
```
tarif = max(BASE_FARE_MOBIL + (jarak × RATE_PER_KM_MOBIL), MIN_FARE_MOBIL)
```

**Malam Hari (20:00–05:00):**
```
tarif_malam = tarif + 5000  // Tambahan malam Rp 5.000 (100% untuk driver)
```

### 📦 Kirim Kilat
```
BASE_FARE_KIRIM   = Rp 5.000
RATE_PER_KM_KIRIM = Rp 3.000
MIN_FARE_KIRIM    = Rp 12.000
```

**Formula Berat:**
```
if berat_kg <= 5:
  tarif_berat = 0
elif berat_kg <= 10:
  tarif_berat = Rp 5.000
elif berat_kg <= 20:
  tarif_berat = Rp 12.000
else:
  tarif_berat = Rp 12.000 + (berat_kg - 20) × Rp 1.000

tarif = max(BASE_FARE_KIRIM + (jarak × RATE_PER_KM_KIRIM) + tarif_berat, MIN_FARE_KIRIM)
```

**Titip Tetangga (Batch):**
```
// Jika driver mengambil >1 paket searah, biaya per pengirim dikurangi
if jumlah_batch == 2: diskon_per_paket = 20%
if jumlah_batch == 3: diskon_per_paket = 30%
if jumlah_batch >= 4: diskon_per_paket = 35%
driver_total = Σ (tarif_per_paket × (1 - diskon_per_paket)) × 1.1  // Driver dapat +10% bonus efisiensi
```

### 🍜 Kuliner Warga
```
BASE_ONGKIR_KULINER = Rp 8.000   // Flat, tidak bergantung jarak (radius maks 3 km)
// Jarak di atas 3 km → tambah Rp 2.000/km
```

**Formula:**
```
if jarak <= 3:
  ongkir = BASE_ONGKIR_KULINER
else:
  ongkir = BASE_ONGKIR_KULINER + ((jarak - 3) × Rp 2.000)
```

**Ketentuan Margin Merchant:**
```
harga_menu   = harga yang di-set merchant (bebas, tidak dipotong platform)
margin_min   = 30% dari HPP (diverifikasi saat onboarding merchant)
// Platform TIDAK memotong margin merchant dari per-order
// Merchant hanya bayar keanggotaan koperasi UMKM (flat/bulan)
```

### 💊 Apotek & Mart
```
BASE_ONGKIR_MART = Rp 8.000   // Flat (sama dengan kuliner)
// Logika jarak sama dengan kuliner
```

---

## 2. Surge Pricing (Jam Sibuk & Event)

```
SURGE_TABLE = {
  "normal":     1.0,   // 06:00–08:00, 15:00–17:00 (tidak sibuk)
  "morning":    1.0,   // 08:00–10:00 (sibuk pagi → tetap 1x, jangan bebani warga)
  "peak":       1.2,   // 17:00–20:00 (puncak sore)
  "night":      1.1,   // 20:00–00:00
  "late_night": 1.3,   // 00:00–05:00
  "event":      1.5,   // Event besar (Piala Dunia, Lebaran) — admin aktifkan manual
}

// Surge TIDAK berlaku untuk:
// - Order pertama pengguna baru (first-order promo)
// - Driver berdasarkan jarak, hanya tarif customer yang naik
// - Selisih surge = insentif TAMBAHAN ke driver (100% untuk driver)
```

---

## 3. Perbandingan Kompetitif (Transparansi)

| Komponen | Gojek/Grab | Ride-Solo |
|----------|-----------|-----------|
| Potongan per trip | 20–25% | **0%** |
| Biaya driver per hari | Rp 0 (komisi) | **Rp 15.000 flat (karcis)** |
| Transparansi tarif | ❌ Algoritmik | **✅ Formula publik** |
| Surge maks | 4x | **1.5x (capped)** |
| Take-home driver (trip Rp 25.000) | Rp 18.750 | **Rp 25.000** |

---

## 4. Formula Kalkulasi TypeScript (Referensi Implementasi)

```typescript
// functions/src/lib/pricing.ts
import { ServiceType } from "../../shared/types";

const CONFIG = {
  ojek:   { base: 3000, perKm: 2500, min: 10000 },
  mobil:  { base: 5000, perKm: 4500, min: 15000 },
  kirim:  { base: 5000, perKm: 3000, min: 12000 },
  kuliner:{ base: 8000, perKm: 2000, min: 8000, flatRadius: 3 },
  mart:   { base: 8000, perKm: 2000, min: 8000, flatRadius: 3 },
  titip:  { base: 5000, perKm: 3000, min: 12000 },
};

export function calculateBaseFare(serviceType: ServiceType, distanceKm: number): number {
  const c = CONFIG[serviceType];
  if (!c) throw new Error(`Unknown serviceType: ${serviceType}`);

  if (serviceType === "kuliner" || serviceType === "mart") {
    const extraKm = Math.max(0, distanceKm - (c.flatRadius || 3));
    return Math.max(c.base + extraKm * c.perKm, c.min);
  }

  return Math.max(c.base + distanceKm * c.perKm, c.min);
}

export function calculateWeightSurcharge(weightKg: number): number {
  if (weightKg <= 5)  return 0;
  if (weightKg <= 10) return 5000;
  if (weightKg <= 20) return 12000;
  return 12000 + (weightKg - 20) * 1000;
}

export function getSurgeMultiplier(time: Date, isEvent: boolean): number {
  if (isEvent) return 1.5;
  const hour = time.getHours();
  if (hour >= 0  && hour < 5)  return 1.3;
  if (hour >= 17 && hour < 20) return 1.2;
  if (hour >= 20 && hour < 24) return 1.1;
  return 1.0;
}
```

---

## 5. Konfigurasi Dinamis via Firestore (BizConfig Panel)

Nilai-nilai tarif di atas TIDAK di-hardcode. Mereka dibaca dari Firestore:

```typescript
// Firestore: bizConfig/pricing
{
  BASE_FARE_OJEK:    3000,
  RATE_PER_KM_OJEK:  2500,
  MIN_FARE_OJEK:    10000,
  BASE_FARE_MOBIL:   5000,
  // ... semua nilai ada di sini
  SURGE_CAP:          1.5,   // Admin bisa ubah batas surge maximum
  lastUpdatedBy:    "admin-uid",
  lastUpdatedAt:    Timestamp
}
```

Admin Super dapat mengubah nilai ini melalui **BizConfig Panel** di dashboard admin.
Setiap perubahan masuk ke history log untuk audit trail.
