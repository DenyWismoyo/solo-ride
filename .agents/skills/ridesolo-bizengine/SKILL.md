---
name: ridesolo-bizengine
description: |
  Formula Engine dan Panduan Business Logic untuk Ride-Solo Smart Hub.
  Mencakup rumus kalkulasi ongkir adaptif, mekanisme diskon & promo,
  sistem karcis harian driver, royalti SHU koperasi, dan formula flash sale UMKM
  yang memastikan SEMUA pihak ekosistem (Customer, Driver, UMKM, Koperasi, Industri) diuntungkan.

  Aktifkan skill ini ketika:
  - Menghitung tarif final untuk setiap layanan (ojek, mobil, kirim, kuliner, mart)
  - Merancang mekanisme promo, flash sale, atau voucher
  - Membangun fitur Karcis Harian driver atau Dompet Driver
  - Menghitung distribusi SHU / royalti koperasi
  - Membuat panel admin BizConfig untuk manajemen rumus harga dinamis
  - Menulis Firebase Cloud Functions untuk kalkulasi harga server-side
  - Memastikan tidak ada pihak yang dirugikan dari setiap rumus bisnis

  File pendukung di folder ini:
  - PRICING_FORMULAS.md  → Rumus tarif lengkap per layanan + surge pricing
  - PROMO_ENGINE.md      → Logika diskon, flash sale, voucher, reward poin
  - KARCIS_ROYALTY.md    → Sistem karcis driver + distribusi SHU koperasi
---

# Skill: Ride-Solo Business Logic Engine (BizEngine)

## 🎯 Filosofi: "Semua Pihak Harus Untung"

Setiap formula di sistem ini dirancang dengan prinsip:

```
Customer → mendapat harga wajar & transparan
Driver   → take-home minimal di atas UMR per jam
UMKM     → margin produk terjaga, tidak rugi dari promo
Koperasi → pendapatan karcis menutupi operasional + SHU
Platform → sustainable fee tanpa mematikan ekosistem
```

---

## Ringkasan Formula

Baca `PRICING_FORMULAS.md` untuk detail implementasi lengkap.
Baca `PROMO_ENGINE.md` untuk detail diskon dan flash sale.
Baca `KARCIS_ROYALTY.md` untuk detail karcis driver dan SHU koperasi.

---

## Implementasi BizEngine di Firebase Functions

```typescript
// functions/src/lib/bizengine.ts
// ← File ini adalah pusat kalkulasi semua logika bisnis Ride-Solo

export interface PriceParams {
  serviceType: "ojek" | "mobil" | "kirim" | "kuliner" | "mart" | "titip";
  distanceKm: number;
  weightKg?: number;       // Untuk layanan kirim
  promoCode?: string;
  userId?: string;
  timeOfDay?: Date;        // Untuk surge pricing malam/peak hour
  isFlashSale?: boolean;
}

export interface PriceResult {
  basePrice: number;        // Harga sebelum promo
  discountAmount: number;   // Potongan promo (sudah validasi tidak rugi)
  finalPrice: number;       // Yang dibayar customer
  driverTakeHome: number;   // Yang diterima driver (100% dari final)
  platformFee: number;      // Dari karcis (0 dari per-trip)
  breakdown: PriceBreakdown;
}

export const BizEngine = {
  calculatePrice: (params: PriceParams): PriceResult => {
    // Baca PRICING_FORMULAS.md untuk detail setiap formula
    // Implementasi ada di file ini, diuji via emulator
    const base = calculateBase(params);
    const surge = calculateSurge(params.timeOfDay);
    const discount = validateDiscount(params.promoCode, base);

    return {
      basePrice: base,
      discountAmount: discount,
      finalPrice: Math.max(base * surge - discount, getMinFare(params.serviceType)),
      driverTakeHome: Math.max(base * surge - discount, getMinFare(params.serviceType)), // 100%
      platformFee: 0, // Platform dapat dari karcis, BUKAN per-trip
      breakdown: { base, surge, discount }
    };
  }
};
```

---

## Panel Admin BizConfig

Admin dapat mengubah nilai-nilai formula melalui Firestore collection `bizConfig`:

```typescript
// Firestore: bizConfig/{configId}
interface BizConfigDocument {
  id: string;
  key: string;           // e.g. "BASE_FARE_OJEK", "KARCIS_HARIAN", "FLASH_SALE_MAX_DISC"
  value: number;
  description: string;
  category: "pricing" | "promo" | "karcis" | "royalty";
  updatedBy: string;     // admin UID
  updatedAt: Timestamp;
  history: Array<{ value: number; updatedAt: Timestamp; updatedBy: string }>;
}
```

Panel admin akan bisa mengubah semua nilai ini secara real-time tanpa deploy ulang kode.
