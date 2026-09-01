# FIREBASE_PATTERNS.md — Pola Firebase Admin SDK untuk MCP Server

> Panduan ini khusus untuk Firebase Admin SDK (server-side) yang digunakan di `mcp-server/`.
> Berbeda dari Firebase client SDK yang digunakan di aplikasi Next.js.

---

## 1. Import yang Benar

```typescript
// mcp-server/src/index.ts — import dari firebase-admin, bukan firebase
import { db } from "./firebase.js";  // Sudah menggunakan Admin SDK
```

**Perbedaan kritis Admin SDK vs Client SDK:**
| Aspek | Admin SDK (MCP Server) | Client SDK (Next.js) |
|-------|------------------------|----------------------|
| Import | `firebase-admin/firestore` | `firebase/firestore` |
| Auth bypass | ✅ Bypass security rules | ❌ Ikuti security rules |
| Timestamp | `new Date()` atau `admin.firestore.FieldValue.serverTimestamp()` | `serverTimestamp()` dari `firebase/firestore` |
| Transaction | `db.runTransaction(async (t) => { ... })` | `runTransaction(db, async (t) => { ... })` |
| Batch | `db.batch()` | `writeBatch(db)` |
| Collection ref | `db.collection("orders")` | `collection(db, "orders")` |
| Doc ref | `db.collection("orders").doc(id)` | `doc(db, "orders", id)` |

---

## 2. Query Patterns

### Get All Documents (dengan filter)
```typescript
// Semua order pending
const snapshot = await db.collection("orders")
  .where("status", "==", "pending")
  .orderBy("createdAt", "desc")
  .limit(50)
  .get();

const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Get Single Document
```typescript
const orderRef = db.collection("orders").doc(orderId);
const orderDoc = await orderRef.get();

if (!orderDoc.exists) {
  throw new Error(`Order ${orderId} tidak ditemukan.`);
}

const data = orderDoc.data()!; // Non-null assertion aman setelah exists check
```

### Query dengan Multiple Conditions
```typescript
// Driver online dengan karcis aktif
const driversSnap = await db.collection("users")
  .where("role", "==", "driver")
  .where("isOnline", "==", true)
  .get();
```

### Subcollection Query
```typescript
// Audit log dari order tertentu
const auditSnap = await db.collection("orders").doc(orderId)
  .collection("auditLog")
  .orderBy("timestamp", "desc")
  .get();
```

---

## 3. Transaction Pattern (untuk operasi yang berisiko race condition)

**WAJIB digunakan untuk: assign order ke driver, verifikasi gov order, update karcis**

```typescript
await db.runTransaction(async (transaction) => {
  // 1. BACA SEMUA yang dibutuhkan DAHULU (di atas sebelum write)
  const orderSnap = await transaction.get(orderRef);
  const driverSnap = await transaction.get(driverRef);
  
  // 2. VALIDASI berdasarkan data yang dibaca
  if (!orderSnap.exists) throw new Error("Order tidak ditemukan.");
  const orderData = orderSnap.data()!;
  if (orderData.status !== "pending") {
    throw new Error(`Order tidak pending (saat ini: ${orderData.status}).`);
  }
  
  // 3. WRITE (setelah semua validasi selesai)
  transaction.update(orderRef, {
    driverId: driverId,
    status: "accepted",
    updatedAt: new Date(),
  });
  
  transaction.update(driverRef, {
    currentOrderId: orderId,
    updatedAt: new Date(),
  });
  
  // ⚠️ JANGAN async operation lain di dalam transaction (seperti .add() ke collection lain)
  // Sebaiknya lakukan operasi tambahan SETELAH transaction selesai
});

// Operasi non-transactional setelah transaction berhasil
await db.collection("orders").doc(orderId)
  .collection("auditLog").add({ action: "assigned", ... });
```

---

## 4. Batch Pattern (untuk update atomik tanpa konflik)

**Gunakan untuk: complete order (update beberapa dokumen sekaligus)**

```typescript
const batch = db.batch();

// Update order
batch.update(db.collection("orders").doc(orderId), {
  status: "completed",
  completedAt: new Date(),
  updatedAt: new Date(),
});

// Award points driver
batch.update(db.collection("users").doc(driverId), {
  points: admin.firestore.FieldValue.increment(10),
  updatedAt: new Date(),
});

// Award points customer
if (customerId) {
  batch.update(db.collection("users").doc(customerId), {
    points: admin.firestore.FieldValue.increment(5),
    updatedAt: new Date(),
  });
}

await batch.commit(); // Semua dieksekusi atomik
```

---

## 5. Audit Log Pattern (wajib untuk Gov Orders)

Setiap aksi pada gov order WAJIB mencatat audit trail ke subcollection:

```typescript
// ✅ BENAR — subcollection (scalable, queryable, immutable)
await db.collection("orders").doc(orderId)
  .collection("auditLog")
  .add({
    action: "verified_by_opd",           // Deskripsi aksi
    actorUid: verifiedByUid,             // UID pelaku (bisa null untuk system)
    actorName: verifiedByName,           // Nama yang readable
    actorRole: "government",             // Role pelaku
    additionalRole: "gov_dukcapil",      // Role spesifik dinas
    previousStatus: "pending_verification",
    newStatus: "pending",
    notes: "Dokumen persyaratan lengkap",
    timestamp: new Date(),               // Admin SDK: new Date() atau FieldValue.serverTimestamp()
    source: "hermes_agent",              // Source of action
  });
```

---

## 6. Data Masking Helper

Selalu mask data sensitif sebelum dikirim ke agent:

```typescript
// Fungsi masking - letakkan di atas file index.ts
function maskPhone(phone: string | undefined): string {
  if (!phone) return "***";
  if (phone.length < 8) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-3);
}

function maskNIK(nik: string | undefined): string {
  if (!nik) return "***";
  if (nik.length < 8) return "***";
  return nik.slice(0, 4) + "****" + nik.slice(-4);
}

function maskEmail(email: string | undefined): string {
  if (!email) return "***";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return local.slice(0, 2) + "***@" + domain;
}

// Penggunaan:
const safeOrder = {
  id: doc.id,
  customerName: data.customerName || "Anonim",
  customerPhone: maskPhone(data.customerPhone),
  serviceType: data.serviceType,
  status: data.status,
  // NIK dari citizenDetails:
  nikDisplay: data.citizenDetails?.nikOrRef 
    ? maskNIK(data.citizenDetails.nikOrRef) 
    : "N/A",
};
```

---

## 7. Timestamp Handling (Admin SDK)

```typescript
// Admin SDK — Timestamp ke readable string
import { Timestamp } from "firebase-admin/firestore";

function formatTimestamp(ts: any): string {
  if (!ts) return "N/A";
  if (ts instanceof Timestamp) {
    return ts.toDate().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  }
  if (ts._seconds) {
    return new Date(ts._seconds * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  }
  return String(ts);
}

// Contoh output: "1 Sep 2026, 17.30.00"
```

---

## 8. FieldValue (Admin SDK)

```typescript
import { FieldValue } from "firebase-admin/firestore";

// Increment (untuk points, counter)
batch.update(userRef, {
  points: FieldValue.increment(10),
});

// Server timestamp
await orderRef.update({
  updatedAt: FieldValue.serverTimestamp(),
});

// Array union / remove
await userRef.update({
  tags: FieldValue.arrayUnion("verified"),
});
```

---

## 9. Error Handling Pattern Standar

```typescript
// Template error handling yang konsisten di semua tools
if (request.params.name === "nama_tool") {
  const { param1, param2 } = request.params.arguments as NamaToolArgs;
  
  try {
    // ... logika bisnis ...
    
    return {
      content: [{
        type: "text",
        text: `✅ Sukses: [deskripsi apa yang terjadi dengan data konkret]`,
      }],
    };
    
  } catch (error: unknown) {
    // ✅ Handle error tanpa menggunakan `any`
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    return {
      content: [{
        type: "text",
        text: `❌ Error pada ${request.params.name}: ${errorMessage}`,
      }],
      isError: true,
    };
  }
}
```

---

## 10. Query Pagination (untuk data besar)

```typescript
// Gunakan limit + startAfter untuk pagination
const PAGE_SIZE = 20;

// Halaman pertama
const firstPage = await db.collection("orders")
  .where("status", "==", "pending")
  .orderBy("createdAt", "desc")
  .limit(PAGE_SIZE)
  .get();

// Halaman berikutnya (jika ada lastDoc dari halaman sebelumnya)
const lastDoc = firstPage.docs[firstPage.docs.length - 1];
const nextPage = await db.collection("orders")
  .where("status", "==", "pending")
  .orderBy("createdAt", "desc")
  .startAfter(lastDoc)
  .limit(PAGE_SIZE)
  .get();
```

---

## 11. Aggregate Query (Count tanpa ambil semua dokumen)

```typescript
// Hitung total order pending tanpa fetch semua data
const countQuery = db.collection("orders").where("status", "==", "pending");
const countSnapshot = await countQuery.count().get();
const total = countSnapshot.data().count;
```
