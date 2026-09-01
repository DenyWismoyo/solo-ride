---
name: ridesolo-mcp-server
description: |
  Panduan lengkap untuk mengembangkan, memperluas, dan memaintain MCP Server
  Ride-Solo yang digunakan oleh Hermes Agent di Antigravity IDE.
  Mencakup semua tools yang tersedia, cara menambah tool baru,
  pola Firebase Admin SDK, tool contract tiap ekosistem, dan rules keamanan.

  Aktifkan skill ini ketika:
  - Menambahkan tool baru ke mcp-server/src/index.ts
  - Memperluas kapabilitas Hermes Agent untuk ekosistem baru (Gov/UMKM/Driver/Industry)
  - Debugging tool yang error atau tidak mengembalikan data yang diharapkan
  - Merancang tool schema (inputSchema) untuk domain baru
  - Menjalankan atau build MCP server untuk testing
  - Mengintegrasikan MCP server baru ke konfigurasi Antigravity IDE

  File pendukung di folder ini:
  - TOOL_REGISTRY.md    → Master daftar semua tools (existing + planned) per ekosistem
  - FIREBASE_PATTERNS.md → Pola Firebase Admin SDK: query, transaction, batch, audit log

  Skill terkait yang harus dibaca bersamaan:
  - ridesolo-hermes    → Persona & operasional Hermes Agent, kapan pakai tool mana
  - ridesolo-dev       → Arsitektur 4-layer, types, services, collections
  - ridesolo-functions → Firebase Cloud Functions (berbeda dari MCP, tapi saling melengkapi)
---

# Skill: Ride-Solo MCP Server — Panduan Pengembangan Hermes Agent Tools

> MCP Server adalah **jembatan antara Hermes Agent dan Firebase Firestore**.
> Agent membaca status ekosistem Ride-Solo dan melakukan tindakan melalui tools ini.

---

## 1. Arsitektur MCP Server

```
Antigravity IDE (Hermes Agent)
        ↓ MCP Protocol (stdio)
mcp-server/src/index.ts
        ↓ Firebase Admin SDK
Firestore DB: "ride-solo"
        ↓
Collections: orders, users, drivers, karcis, wallets, ledger,
             merchants, kyc_requests, notifications, ...
```

### Lokasi File
```
d:\Project\OJEK LOKAL\
└── mcp-server/
    ├── src/
    │   ├── index.ts           ← ENTRY POINT: semua tools didaftarkan di sini
    │   └── firebase.ts        ← Firebase Admin SDK init (via serviceAccountKey.json)
    ├── build/
    │   ├── index.js           ← Compiled output (hasil `npm run build`)
    │   └── firebase.js
    ├── serviceAccountKey.json ← ⚠️ RAHASIA — jangan commit ke git
    ├── package.json
    └── tsconfig.json
```

### Cara Menjalankan
```bash
# Development (auto-compile dari TypeScript)
cd mcp-server
npm run dev

# Production build + run
npm run build
npm run start
```

### Konfigurasi Antigravity IDE
Tambahkan ke konfigurasi MCP di Antigravity IDE settings:
```json
{
  "mcpServers": {
    "ridesolo": {
      "command": "node",
      "args": ["d:/Project/OJEK LOKAL/mcp-server/build/index.js"]
    }
  }
}
```

---

## 2. Struktur Tool yang Benar

Setiap tool WAJIB mengikuti template berikut:

```typescript
// Di dalam ListToolsRequestSchema handler:
{
  name: "nama_tool",                          // snake_case, verb_ekosistem_entitas
  description: "Deskripsi singkat Bahasa Indonesia — apa yang dilakukan tool ini.",
  inputSchema: {
    type: "object",
    properties: {
      paramName: {
        type: "string",                       // string | number | boolean | array | object
        description: "Deskripsi parameter",
      },
    },
    required: ["paramName"],                  // Array field yang wajib ada
  },
},

// Di dalam CallToolRequestSchema handler:
if (request.params.name === "nama_tool") {
  // ✅ Gunakan interface, bukan `any`
  const { paramName } = request.params.arguments as NamaToolArgs;
  try {
    // ... logika Firebase Admin
    return {
      content: [{ type: "text", text: "Hasil dalam format yang mudah dibaca agent" }],
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${msg}` }],
      isError: true,
    };
  }
}
```

### Naming Convention Tools
| Format | Contoh |
|--------|--------|
| `get_{entitas}` | `get_pending_orders`, `get_driver_stats` |
| `list_{ekosistem}_{entitas}` | `list_gov_orders`, `list_online_drivers` |
| `assign_{verb}` | `assign_order_to_driver` |
| `verify_{ekosistem}_{aksi}` | `verify_gov_order`, `verify_driver_kyc` |
| `reject_{ekosistem}_{aksi}` | `reject_gov_order` |
| `get_{driver}_{resource}` | `get_driver_karcis_status`, `get_driver_wallet` |
| `calculate_{resource}` | `calculate_order_price` |
| `get_ecosystem_stats` | `get_ecosystem_stats` |

---

## 3. Grouping Tools per Ekosistem

### [CORE] — Orders & Dispatch
Tool inti untuk pemantauan dan dispatch order ojek/mobil:

| Tool | Deskripsi | Status |
|------|-----------|--------|
| `get_pending_orders` | Daftar order status `pending` | ✅ Ada |
| `get_driver_stats` | Jumlah driver online | ✅ Ada |
| `assign_order_to_driver` | Assign order ke driver (pakai transaction) | ⚠️ Ada tapi belum pakai transaction |
| `list_online_drivers` | Detail semua driver online + lokasi | 🔲 Perlu dibuat |
| `get_order_detail` | Detail lengkap satu order by ID | 🔲 Perlu dibuat |
| `update_order_status` | Update status order (in_progress/completed/cancelled) | 🔲 Perlu dibuat |
| `get_orders_by_status` | Filter orders by status apapun | 🔲 Perlu dibuat |
| `get_recent_orders` | Orders terbaru (semua status, limit N) | 🔲 Perlu dibuat |

### [GOV] — Government/OPD Civic Services
Tool untuk workflow 18 Dinas Pemkot Surakarta:

| Tool | Deskripsi | Status |
|------|-----------|--------|
| `list_gov_orders` | Daftar permohonan warga per dinas | 🔲 Perlu dibuat |
| `get_gov_order_detail` | Detail permohonan + citizenDetails | 🔲 Perlu dibuat |
| `verify_gov_order` | Verifikasi permohonan oleh petugas OPD | 🔲 Perlu dibuat |
| `reject_gov_order` | Tolak permohonan + catat alasan + audit log | 🔲 Perlu dibuat |
| `list_pending_verification` | Semua order berstatus `pending_verification` | 🔲 Perlu dibuat |
| `get_gov_stats` | Statistik permohonan per dinas/status | 🔲 Perlu dibuat |

### [DRIVER] — Driver Management
Tool untuk manajemen driver, karcis, dan wallet:

| Tool | Deskripsi | Status |
|------|-----------|--------|
| `get_driver_karcis_status` | Cek status karcis harian driver | 🔲 Perlu dibuat |
| `get_driver_wallet` | Saldo dompet koperasi driver | 🔲 Perlu dibuat |
| `list_driver_ledger` | Riwayat mutasi dompet driver | 🔲 Perlu dibuat |
| `list_kyc_requests` | Daftar pengajuan KYC driver pending | 🔲 Perlu dibuat |
| `verify_driver_kyc` | Verifikasi KYC driver (ubah status) | 🔲 Perlu dibuat |
| `get_driver_performance` | Rating, total trip, poin driver | 🔲 Perlu dibuat |

### [MERCHANT] — UMKM
Tool untuk monitoring merchant dan order kuliner:

| Tool | Deskripsi | Status |
|------|-----------|--------|
| `list_merchants` | Daftar merchant UMKM terdaftar | 🔲 Perlu dibuat |
| `list_merchant_orders` | Order kuliner per merchant | 🔲 Perlu dibuat |
| `get_merchant_stats` | Statistik penjualan merchant | 🔲 Perlu dibuat |

### [ADMIN] — Analytics & Management
Tool untuk admin monitoring ekosistem:

| Tool | Deskripsi | Status |
|------|-----------|--------|
| `get_ecosystem_stats` | Statistik keseluruhan (orders, users, revenue) | 🔲 Perlu dibuat |
| `list_users_by_role` | Daftar user berdasarkan role | 🔲 Perlu dibuat |
| `get_user_detail` | Detail profil user by UID | 🔲 Perlu dibuat |

---

## 4. Rules Keamanan Tool

### ✅ WAJIB
- **Transaction untuk write yang berpotensi race condition** — terutama `assign_order_to_driver`
- **Audit log untuk aksi gov** — setiap verify/reject gov order WAJIB tulis ke subcollection `auditLog`
- **Data masking** — nomor telpon dan NIK di-mask sebelum dikembalikan ke agent (kecuali tool eksplisit "get_sensitive")
- **Error handling** — setiap tool punya try-catch, kembalikan `isError: true` jika gagal
- **Validasi dokumen exists** sebelum update/delete

### ❌ DILARANG
- Jangan gunakan `any` untuk type arguments — gunakan interface
- Jangan hardcode nama collection — gunakan konstanta (copy dari `src/constants/collections.ts`)
- Jangan expose nomor telpon atau NIK mentah tanpa masking
- Jangan buat tool yang bisa `delete` dokumen — hanya `update` ke status tertentu

---

## 5. Constants yang Harus Di-copy ke MCP Server

Karena MCP server adalah project Node.js TERPISAH dari Next.js, duplikasikan konstanta ini
langsung di dalam `mcp-server/src/index.ts` atau buat file `mcp-server/src/constants.ts`:

```typescript
// mcp-server/src/constants.ts
export const COLLECTIONS = {
  USERS: "users",
  ORDERS: "orders",
  DRIVERS: "drivers",
  KARCIS: "karcis",
  MERCHANTS: "merchants",
  WALLETS: "wallets",
  LEDGER: "ledger",
  MENU_ITEMS: "menu_items",
  NOTIFICATIONS: "notifications",
  KYC_REQUESTS: "kyc_requests",
  REVIEWS: "reviews",
  CONTRACTS: "contracts",
} as const;

// Masking helper
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-3);
}

export function maskNIK(nik: string): string {
  if (!nik || nik.length < 6) return "***";
  return nik.slice(0, 4) + "****" + nik.slice(-4);
}
```

---

## 6. Cara Menambah Tool Baru (Step-by-Step)

### Step 1: Definisikan interface arguments
```typescript
// Di bagian atas index.ts, tambahkan interface
interface VerifyGovOrderArgs {
  orderId: string;
  verifiedByName: string;
}
```

### Step 2: Daftarkan di ListToolsRequestSchema
```typescript
{
  name: "verify_gov_order",
  description: "Memverifikasi permohonan layanan warga oleh petugas OPD. Mengubah status dari 'pending_verification' menjadi 'pending' dan mencatat audit log.",
  inputSchema: {
    type: "object",
    properties: {
      orderId: { type: "string", description: "ID order permohonan warga" },
      verifiedByName: { type: "string", description: "Nama petugas OPD yang memverifikasi" },
    },
    required: ["orderId", "verifiedByName"],
  },
},
```

### Step 3: Implementasikan di CallToolRequestSchema
```typescript
if (request.params.name === "verify_gov_order") {
  const { orderId, verifiedByName } = request.params.arguments as VerifyGovOrderArgs;
  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) throw new Error(`Order ${orderId} tidak ditemukan.`);
    
    const data = orderDoc.data()!;
    if (data.status !== "pending_verification") {
      throw new Error(`Order tidak dalam status pending_verification (saat ini: ${data.status}).`);
    }

    // Update status
    await orderRef.update({
      status: "pending",
      verifiedByDinasName: verifiedByName,
      verifiedByDinasAt: new Date(),
      updatedAt: new Date(),
    });

    // ✅ Audit log (subcollection)
    await orderRef.collection("auditLog").add({
      action: "verified_by_opd",
      actorName: verifiedByName,
      actorRole: "government",
      previousStatus: "pending_verification",
      newStatus: "pending",
      timestamp: new Date(),
    });

    return {
      content: [{ type: "text", text: `✅ Order ${orderId} berhasil diverifikasi oleh ${verifiedByName}. Status: pending_verification → pending.` }],
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}
```

### Step 4: Build & Test
```bash
cd mcp-server
npm run build   # Compile TypeScript
npm run start   # Jalankan server
# Atau gunakan dev mode:
npm run dev     # tsx watch (auto-reload)
```

---

## 7. Pattern: assign_order_to_driver yang Benar (dengan Transaction)

Tool yang ada saat ini **TIDAK AMAN** karena tidak menggunakan transaction.
Jika 2 driver menekan "Terima" bersamaan, keduanya bisa mengambil order yang sama.

**Implementasi yang benar**:
```typescript
if (request.params.name === "assign_order_to_driver") {
  const { orderId, driverId } = request.params.arguments as AssignOrderArgs;
  try {
    const orderRef = db.collection("orders").doc(orderId);
    
    await db.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) throw new Error(`Order ${orderId} tidak ditemukan.`);
      
      const data = orderSnap.data()!;
      
      // Guard: cek apakah sudah ada driver lain
      if (data.driverId && data.driverId !== driverId) {
        throw new Error(`Order sudah diambil driver lain (driverId: ${data.driverId}).`);
      }
      if (data.status !== "pending") {
        throw new Error(`Order tidak dalam status pending (saat ini: ${data.status}).`);
      }
      
      transaction.update(orderRef, {
        driverId,
        status: "accepted",
        updatedAt: new Date(),
      });
    });

    return {
      content: [{ type: "text", text: `✅ Order ${orderId} berhasil di-assign ke driver ${driverId}.` }],
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}
```
