# EMERGENCY_SERVICE_RULES.md — GPS Bypass + Audio Alert + SLA Rules

> Panduan implementasi layanan darurat (Damkar, BPBD) yang profesional.
> Emergency services WAJIB bypass pending_verification dan respons dalam SLA ketat.

---

## Arsitektur Emergency Flow

```
Customer submit form darurat (Damkar/BPBD)
        |
        v
useCivicOrder detects isEmergencyService() === true
        |
        v
status: "pending"  <-- LANGSUNG! Skip pending_verification
        |
        v
Driver Radar (realtime) -- Audio Alert di Damkar Workspace
        |
        v
Driver accept -> status: "accepted"
        |
        v
Driver dispatch -> status: "in_progress"
        |
        v
status: "completed"
```

---

## isEmergencyService() — Wajib Implementasi

```typescript
// src/constants/emergencyServices.ts  [BUAT FILE INI]

export const EMERGENCY_SERVICE_PREFIXES = ["damkar", "bpbd"] as const;
export type EmergencyPrefix = typeof EMERGENCY_SERVICE_PREFIXES[number];

// Service IDs yang tergolong emergency (expanded list):
export const EMERGENCY_SERVICE_IDS = [
  "damkar_panic_button",
  "damkar_fire_emergency",
  "damkar_lapor_kebakaran",
  "bpbd_lapor_banjir",
  "bpbd_bantuan_darurat",
  "bpbd_evakuasi"
] as const;

export const isEmergencyService = (serviceId: string): boolean =>
  EMERGENCY_SERVICE_PREFIXES.some(prefix => serviceId.toLowerCase().includes(prefix));

// SLA per kategori darurat (menit):
export const EMERGENCY_SLA: Record<string, number> = {
  damkar: 5,   // Max 5 menit dari submit ke driver accept
  bpbd: 10,    // Max 10 menit
};

export const getSLAMinutes = (serviceId: string): number => {
  for (const [prefix, sla] of Object.entries(EMERGENCY_SLA)) {
    if (serviceId.toLowerCase().includes(prefix)) return sla;
  }
  return 15; // Default SLA non-emergency
};
```

---

## useCivicOrder.ts — Emergency Bypass

```typescript
// Di src/hooks/useCivicOrder.ts
// Tambahkan logika ini di function submitCivicOrder/submitOrder:

import { isEmergencyService } from "@/constants/emergencyServices";

const initialStatus = isEmergencyService(service.id)
  ? "pending"               // Emergency: langsung ke driver radar!
  : "pending_verification"; // Normal: tunggu verifikasi OPD dulu

// Di addDoc order:
await addDoc(collection(db, COLLECTIONS.ORDERS), {
  ...orderData,
  status: initialStatus,    // <-- gunakan variable ini
  isEmergency: isEmergencyService(service.id), // Flag untuk filter workspace
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
```

---

## DamkarPanicDispatchForm.tsx — GPS Auto-Detect (UPGRADE P0)

```typescript
// Tambahkan state GPS di DamkarPanicDispatchForm.tsx

const [gpsLat, setGpsLat] = useState<number | null>(null);
const [gpsLng, setGpsLng] = useState<number | null>(null);
const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "found" | "error">("idle");
const [jenisDarurat, setJenisDarurat] = useState<string>("kebakaran");
const [tingkatKeparahan, setTingkatKeparahan] = useState<string>("besar");

// Auto-detect GPS saat komponen mount:
useEffect(() => {
  setGpsStatus("detecting");
  if (!navigator.geolocation) {
    setGpsStatus("error");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setGpsLat(pos.coords.latitude);
      setGpsLng(pos.coords.longitude);
      setGpsStatus("found");
    },
    () => setGpsStatus("error"),
    { timeout: 8000, enableHighAccuracy: true }
  );
}, []);

// GPS Status Banner di UI (tampilkan di atas form):
// gpsStatus === "detecting": "📡 Mendeteksi lokasi GPS..."
// gpsStatus === "found": "✅ Lokasi GPS berhasil dideteksi" (emerald)
// gpsStatus === "error": "⚠️ GPS tidak tersedia — isi alamat manual" (amber)

// jenisDarurat — ubah dari text bebas ke dropdown enum:
const JENIS_DARURAT = [
  { value: "kebakaran", label: "🔥 Kebakaran" },
  { value: "ledakan", label: "💥 Ledakan / Gas Bocor" },
  { value: "orang_terjebak", label: "🆘 Orang Terjebak" },
  { value: "gas_bocor", label: "⚠️ Gas Bocor" },
];

// tingkatKeparahan:
const TINGKAT_KEPARAHAN = [
  { value: "besar", label: "Besar / Tidak Terkendali" },
  { value: "sedang", label: "Sedang / Masih Bisa Dikendalikan" },
  { value: "kecil", label: "Kecil / Awal Mula" },
];

// Nomor darurat yang bisa diklik — WAJIB tampilkan:
// <a href="tel:02717630133">📞 Hubungi Damkar: 0271-7630133</a>
// <a href="tel:113">📞 Darurat Nasional: 113</a>

// citizenDetails yang disimpan:
const citizenDetails = {
  serviceId: service.id,
  serviceName: service.name,
  gpsLat,             // Koordinat GPS
  gpsLng,
  gpsDetected: gpsStatus === "found",
  jenisDarurat,       // Enum
  tingkatKeparahan,   // Enum
  alamatManual: emergencyAddress,
  reporterName: userData?.displayName || "Pelapor Anonim",
  kontakWa: phone,
  submittedAt: new Date().toISOString()
};
```

---

## DamkarAnimalRescueForm.tsx — Form Baru (P2)

```typescript
// src/components/civic/forms/damkar/DamkarAnimalRescueForm.tsx
// Status awal: "pending_verification" (bukan emergency, bisa dijadwalkan)

const JENIS_RESCUE = [
  "Sarang Tawon / Vespa Agresif",
  "Ular Berbisa Masuk Rumah",
  "Hewan Terjebak / Terperangkap",
  "Cincin / Benda Terjepit (non-medis)",
  "Lainnya"
];

// citizenDetails:
// jenisRescue, lokasiRescue, deskripsiDetail, waktuPilihan (opsional), kontakWa

// Daftarkan di CivicFormDispatcher.tsx:
// if (serviceId === "damkar_animal_rescue") return <DamkarAnimalRescueForm .../>
// PENTING: letakkan SEBELUM catch-all: if (serviceId.includes("damkar"))
```

---

## DamkarWorkspace.tsx — Audio Alert + Elapsed Time (UPGRADE P1)

```typescript
// Tambahkan ke DamkarWorkspace.tsx

import { playOrderAlertSound } from "@/lib/sound";

const previousPanicCountRef = useRef(0);

// Deteksi order panic baru untuk audio alert:
useEffect(() => {
  const currentPanic = orders.filter(o =>
    o.status === "pending" && isEmergencyService(o.serviceType || "")
  );
  if (currentPanic.length > previousPanicCountRef.current && previousPanicCountRef.current !== 0) {
    playOrderAlertSound(); // BUNYI ALERT!
  }
  previousPanicCountRef.current = currentPanic.length;
}, [orders]);

// Elapsed time helper:
const getElapsedMinutes = (createdAt: any): number => {
  const created = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  return Math.floor((Date.now() - created.getTime()) / 60000);
};

// Badge elapsed time per order (tampilkan di card):
const elapsed = getElapsedMinutes(order.createdAt);
const isOverSLA = elapsed > 5;

// UI Badge:
// <span className={isOverSLA ? "text-red-600 animate-pulse font-black" : "text-emerald-600 font-bold"}>
//   {elapsed} menit lalu {isOverSLA && "⚠️ LEWAT SLA 5 MENIT!"}
// </span>

// 3 Tab workspace Damkar:
// Tab 1: "DARURAT AKTIF" — panic button, badge merah berkedip
// Tab 2: "Animal Rescue" — laporan non-api
// Tab 3: "Riwayat" — log penanganan + response time
```

---

## BpbdLaporBanjirForm.tsx — Upgrade Signifikan (P2)

```typescript
// Tambahkan toggle EWS vs Bantuan di atas form:
const [mode, setMode] = useState<"ews" | "bantuan">("ews");

// Mode EWS (Early Warning System): info saja, tidak ada form
// Tampilkan status siaga sungai Bengawan Solo:
const EWS_STATUS_DATA = [
  { nama: "Bengawan Solo (Jembatan Jurug)", level: "Normal", siaga: "4", warna: "emerald" },
  { nama: "Kali Pepe (Pintu Air Demangan)", level: "Waspada", siaga: "3", warna: "amber" },
  { nama: "Kali Jenes (Pintu Air Nusukan)", level: "Normal", siaga: "4", warna: "emerald" },
];

// Mode Bantuan Darurat: form dengan:
// - GPS auto-detect (opsional, bukan wajib seperti Damkar)
// - levelSiaga: "siaga_1" | "siaga_2" | "siaga_3" | "siaga_4"
// - bantuanDiminta: string[] — multi-select checkbox
//   ["Tenda Darurat", "Selimut", "Air Mineral 1 Dus", "Sembako Paket", "Perahu Karet", "Evakuasi Medis"]
// - jumlahKK: number (berapa kepala keluarga terdampak)
// - alamatTerdampak: string

// Status awal: "pending" (emergency, skip verifikasi)
```
