---
name: ridesolo-functions
description: |
  Panduan setup, pengembangan, dan deployment Firebase Cloud Functions
  untuk Ride-Solo. Mencakup instalasi, struktur file, pola penulisan Cloud Functions,
  dan integrasi dengan Firestore Triggers, Callable Functions, dan Scheduled Functions.

  Aktifkan skill ini ketika:
  - Menginstal atau inisialisasi Firebase Functions di proyek
  - Menulis fungsi yang berjalan secara async (Firestore trigger, HTTP callable, Scheduler)
  - Membangun logika backend yang tidak bisa dilakukan dari client-side
  - Integrasi dengan external API dari server (payment gateway, SMS OTP, dll)
  - Melakukan validasi & kalkulasi harga final di server sebelum order dibuat
---

# Skill: Firebase Cloud Functions — Ride-Solo Backend

> Dokumen ini adalah panduan single-source-of-truth untuk seluruh pengembangan
> backend asinkron di Ride-Solo menggunakan Firebase Cloud Functions v2.

---

## 1. Instalasi & Setup Pertama Kali

### Step 1: Install Firebase CLI

```bash
# Install global (skip jika sudah terinstall)
npm install -g firebase-tools

# Login ke Firebase (akan redirect browser)
firebase login

# Verifikasi versi (harus >= 13.x)
firebase --version
```

### Step 2: Init Firebase Functions di Root Proyek

```bash
# Jalankan dari d:\Project\OJEK LOKAL\
firebase init functions
```

**Pilihan saat interactive prompt:**
| Prompt | Pilihan |
|--------|---------|
| Use existing project? | **Yes** → pilih project `ride-solo` |
| Language | **TypeScript** |
| Use ESLint? | **Yes** |
| Install dependencies? | **Yes** |

### Step 3: Struktur Direktori yang Terbentuk

```
/functions
  ├── src/
  │   └── index.ts          ← ENTRY POINT: semua exports Cloud Functions
  ├── lib/                  ← TypeScript compiled output (auto-generated, jangan edit)
  ├── package.json          ← Dependencies functions (TERPISAH dari Next.js)
  ├── tsconfig.json
  └── .eslintrc.js
```

> ⚠️ **PENTING**: `functions/package.json` adalah **project Node.js TERPISAH**
> dari root `package.json`. Install dependencies functions harus dari dalam folder `functions/`.

---

## 2. Konfigurasi Firebase Admin SDK

```typescript
// functions/src/lib/admin.ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Admin SDK hanya perlu diinit sekali
if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
export const auth = getAuth();
```

---

## 3. Pola Cloud Functions Standar Ride-Solo

### Pattern A: Firestore Trigger (Auto-run saat data berubah)

Gunakan untuk: notifikasi otomatis, kalkulasi ulang, audit log.

```typescript
// functions/src/index.ts
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { db } from "./lib/admin";

// TRIGGER: Saat order baru dibuat → cari driver terdekat & kirim notifikasi
export const onOrderCreated = onDocumentCreated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const order = event.data?.data();
    if (!order) return;

    const orderId = event.params.orderId;

    // 1. Hitung harga final (validasi di server)
    // 2. Cari driver online terdekat
    // 3. Push notification ke driver
    // 4. Update status order menjadi "matching"

    await db.collection("orders").doc(orderId).update({
      status: "matching",
      updatedAt: new Date(),
    });
  }
);

// TRIGGER: Saat order selesai → update poin customer & statistik driver
export const onOrderCompleted = onDocumentUpdated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (before?.status !== "completed" && after?.status === "completed") {
      // Tambah poin ke customer
      // Update total trip driver
      // Catat ke ledger karcis
    }
  }
);
```

### Pattern B: HTTP Callable Function (Dipanggil dari client)

Gunakan untuk: kalkulasi harga sebelum order, validasi promo, generate QRIS.

```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { BizEngine } from "./lib/bizengine"; // lihat skill ridesolo-bizengine

export const calculateFinalPrice = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    // Verifikasi user sudah login
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Harus login untuk memesan.");
    }

    const { serviceType, distanceKm, promoCode } = request.data;

    // Hitung harga di server (tidak bisa dimanipulasi client)
    const result = BizEngine.calculatePrice({
      serviceType,
      distanceKm,
      promoCode,
      userId: request.auth.uid,
    });

    return result;
  }
);

export const validatePromoCode = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

    const { code, serviceType } = request.data;
    const promo = await db.collection("promos").where("code", "==", code).get();

    if (promo.empty) {
      throw new HttpsError("not-found", "Kode promo tidak ditemukan.");
    }

    const promoData = promo.docs[0].data();
    const isValid = promoData.isActive && promoData.validFor.includes(serviceType);

    return { isValid, discount: isValid ? promoData.discountAmount : 0, promoData };
  }
);
```

### Pattern C: Scheduled Function (Cron Job)

Gunakan untuk: reset karcis harian, bersihkan data lama, kirim laporan mingguan.

```typescript
import { onSchedule } from "firebase-functions/v2/scheduler";

// Reset karcis harian driver — setiap tengah malam WIB (17:00 UTC)
export const resetDailyKarcis = onSchedule(
  { schedule: "0 17 * * *", region: "asia-southeast1", timeZone: "Asia/Jakarta" },
  async () => {
    const snapshot = await db.collection("drivers")
      .where("isOnline", "==", true)
      .get();

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Driver yang online >= 6 jam hari ini → karcis gratis
      const isActive = (data.todayActiveMinutes || 0) >= 360;
      batch.update(doc.ref, {
        karcisStatus: isActive ? "gratis" : "berbayar",
        todayActiveMinutes: 0, // reset untuk hari berikutnya
        lastKarcisReset: new Date(),
      });
    });

    await batch.commit();
  }
);

// Kirim laporan mingguan ke UMKM — setiap Senin 08:00 WIB
export const sendWeeklyMerchantReport = onSchedule(
  { schedule: "0 1 * * 1", region: "asia-southeast1", timeZone: "Asia/Jakarta" },
  async () => {
    // Aggregasi data order per merchant
    // Kirim email/notifikasi ringkasan mingguan
  }
);
```

### Pattern D: Pub/Sub Trigger (Event Bus antar microservice)

Gunakan untuk: integrasi Industri B2B, trigger eksternal dari sistem koperasi.

```typescript
import { onMessagePublished } from "firebase-functions/v2/pubsub";

export const onB2BOrderEvent = onMessagePublished(
  { topic: "b2b-logistics-events", region: "asia-southeast1" },
  async (event) => {
    const message = JSON.parse(
      Buffer.from(event.data.message.data, "base64").toString()
    );
    // Handle event dari sistem industri mitra
  }
);
```

---

## 4. Local Development dengan Emulator

```bash
# Jalankan emulator (dari root proyek)
firebase emulators:start --only functions,firestore,auth

# Emulator UI tersedia di: http://localhost:4000
# Functions endpoint: http://localhost:5001
```

### Integrasi Emulator ke Next.js

```typescript
// src/lib/firebase.ts — tambahkan blok ini
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

export const functions = getFunctions(app, "asia-southeast1");

if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}
```

```bash
# .env.local — tambahkan variabel ini
NEXT_PUBLIC_USE_EMULATOR=true
```

---

## 5. Memanggil Callable Function dari Client

```typescript
// src/services/functions.service.ts
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { PriceParams, PriceResult, PromoValidationResult } from "@/types/biz.types";

export const functionsService = {
  // Hitung harga final via server (tidak bisa dimanipulasi)
  calculateFinalPrice: async (params: PriceParams): Promise<PriceResult> => {
    const fn = httpsCallable<PriceParams, PriceResult>(functions, "calculateFinalPrice");
    const result = await fn(params);
    return result.data;
  },

  // Validasi kode promo
  validatePromoCode: async (code: string, serviceType: string) => {
    const fn = httpsCallable(functions, "validatePromoCode");
    const result = await fn({ code, serviceType });
    return result.data as PromoValidationResult;
  },
};
```

---

## 6. Deploy ke Production

```bash
# Deploy semua functions
firebase deploy --only functions

# Deploy function tertentu
firebase deploy --only functions:calculateFinalPrice,functions:onOrderCreated

# Check logs di Cloud Console
firebase functions:log
```

---

## 7. Struktur File Functions yang Direkomendasikan

```
functions/src/
├── index.ts                    ← Export semua functions
├── lib/
│   ├── admin.ts                ← Firebase Admin SDK instance
│   └── bizengine.ts            ← Business Logic Engine (lihat skill ridesolo-bizengine)
├── triggers/
│   ├── order.triggers.ts       ← Firestore triggers untuk orders
│   ├── driver.triggers.ts      ← Triggers untuk status driver
│   └── merchant.triggers.ts    ← Triggers untuk UMKM
├── callables/
│   ├── pricing.callable.ts     ← Kalkulasi harga final
│   ├── promo.callable.ts       ← Validasi & apply promo
│   └── kyc.callable.ts         ← Upload & verifikasi KYC driver
└── scheduled/
    ├── karcis.schedule.ts      ← Reset karcis harian
    └── reports.schedule.ts     ← Laporan mingguan UMKM & driver
```

---

## 8. Rules Penting

- ✅ **Selalu gunakan `region: "asia-southeast1"`** (Jakarta) untuk latensi minimal
- ✅ Validasi `request.auth` di setiap callable function
- ✅ Gunakan `writeBatch` untuk operasi atomik multi-dokumen
- ✅ Export semua functions dari `index.ts` — satu entry point
- ❌ Jangan hardcode Firebase config di functions — pakai `initializeApp()` tanpa parameter (auto-detect dari environment)
- ❌ Jangan deploy dengan `--force` tanpa review diff terlebih dahulu
