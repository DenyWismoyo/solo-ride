# PRIVACY_COMPLIANCE.md — DP3A Anonim Mode + Data Masking

> Panduan implementasi fitur privacy-first untuk layanan DP3APM SAPA 129.
> Semua identitas pelapor WAJIB terlindungi secara default.

---

## Prinsip Privacy-First DP3A

1. Default anonim: isAnonymous = true saat form dibuka
2. Identitas hanya boleh tampil di workspace setelah aksi eksplisit petugas
3. Semua nomor telepon SELALU dimasking, bahkan untuk non-anonim
4. Audit log akses identitas dicatat ke sub-collection
5. Retensi data kasus: minimum 1 tahun di Firestore

---

## src/lib/privacy.ts — Helper Functions [BUAT FILE INI]

```typescript
// src/lib/privacy.ts

export const maskName = (name?: string, isAnon?: boolean): string => {
  if (!name || name.trim() === "") return "—";
  if (isAnon || name.startsWith("Pemohon-")) return name; // Sudah anonim
  if (name.length <= 2) return name.charAt(0) + "*";
  return `${name.charAt(0)}${"*".repeat(name.length - 2)}${name.slice(-1)}`;
};

export const maskPhone = (phone?: string): string => {
  if (!phone || phone.trim() === "") return "—";
  const cleaned = phone.replace(/\s|-/g, "");
  if (cleaned.length < 7) return "****";
  return `${cleaned.slice(0, 4)}****${cleaned.slice(-3)}`;
};

export const generateAnonCode = (): string =>
  `Pemohon-${Math.floor(1000 + Math.random() * 9000)}`;

// Validasi: apakah kode anonim?
export const isAnonCode = (name?: string): boolean =>
  !name || name.startsWith("Pemohon-");
```

---

## Dp3aSapa129Form.tsx — Upgrade Kritikal (P0)

```typescript
// TAMBAHKAN state baru:
const [isAnonymous, setIsAnonymous] = useState(true); // DEFAULT ANONIM!
const [jenisKasus, setJenisKasus] = useState("kdrt");
const [butuhPendampingan, setButuhPendampingan] = useState(false);
const [lokasiAman, setLokasiAman] = useState("");
const [anonCode] = useState(generateAnonCode()); // Generate sekali

// IMPORT dari privacy.ts:
import { generateAnonCode, isAnonCode } from "@/lib/privacy";

// TAMBAHKAN di atas form (PALING ATAS sebelum semua input):
<div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 space-y-2">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
        🛡️ Mode Anonim
      </p>
      <p className="text-[11px] text-purple-600 dark:text-purple-400">
        Identitas Anda tidak akan diketahui siapapun
      </p>
    </div>
    <Switch
      checked={isAnonymous}
      onCheckedChange={setIsAnonymous}
    />
  </div>
  {isAnonymous && (
    <p className="text-[10px] text-purple-500 dark:text-purple-400">
      Kode laporan Anda: <span className="font-mono font-bold">{anonCode}</span>
    </p>
  )}
</div>

// FIELD nama — kondisional berdasarkan isAnonymous:
{!isAnonymous && (
  <CivicTextField
    label="Nama Lengkap (Opsional)"
    value={reporterName}
    onChange={setReporterName}
    placeholder="Nama Anda (kosongkan jika ingin tetap anonim)"
  />
)}

// jenisKasus — UBAH dari text input ke CivicSelectField:
<CivicSelectField
  label="Jenis Kasus / Situasi"
  value={jenisKasus}
  onChange={setJenisKasus}
  options={[
    { value: "kdrt", label: "Kekerasan Dalam Rumah Tangga (KDRT)" },
    { value: "kekerasan_seksual", label: "Kekerasan Seksual" },
    { value: "perdagangan_orang", label: "Perdagangan Orang (Trafficking)" },
    { value: "kekerasan_anak", label: "Kekerasan terhadap Anak" },
    { value: "penelantaran", label: "Penelantaran" },
    { value: "darurat_perlindungan", label: "Butuh Perlindungan Fisik Segera" }
  ]}
/>

// TAMBAHKAN field butuhPendampingan:
// Toggle/Checkbox: "Saya membutuhkan pendampingan fisik segera"

// TAMBAHKAN field lokasiAman:
// "Lokasi Anda Sekarang" — bukan alamat rumah! Untuk tujuan penjemputan pendamping
// Gunakan read-only input + MapLocationPickerModal (sesuai aturan AGENTS.md)

// Di handleSubmit:
const effectiveName = isAnonymous
  ? anonCode
  : (reporterName.trim() || anonCode);

// citizenDetails yang disimpan ke Firestore:
const citizenDetails = {
  serviceId: service.id,
  serviceName: service.name,
  isAnonymous,
  namaAtauKode: effectiveName,   // "Pemohon-XXXX" atau nama asli
  jenisKasus,                    // Enum
  lokasiAman,                    // Lokasi SEKARANG, bukan rumah
  butuhPendampingan,
  kontakWa: phone,               // Tersimpan tapi SELALU masked di workspace
  submittedAt: new Date().toISOString()
};
```

---

## Dp3aWorkspace.tsx — Data Masking + Reveal (P0)

```typescript
// IMPORT helper di awal file:
import { maskName, maskPhone, isAnonCode } from "@/lib/privacy";

// State untuk track order yang identitasnya sudah di-reveal:
const [revealedOrderIds, setRevealedOrderIds] = useState<string[]>([]);

// Helper render identitas:
const renderIdentity = (order: OrderDocument) => {
  const details = order.citizenDetails as any || {};
  const isAnon = details.isAnonymous;
  const namaAtauKode = details.namaAtauKode || details.reporterName || "";
  const isRevealed = revealedOrderIds.includes(order.id || "");

  // Tampilan default (masked):
  const displayName = isRevealed
    ? namaAtauKode
    : maskName(namaAtauKode, isAnon);
  const displayPhone = isRevealed
    ? (details.kontakWa || "—")
    : maskPhone(details.kontakWa);

  return {
    displayName,
    displayPhone,
    isAnon,
    isRevealed,
    canReveal: !isAnon && !isAnonCode(namaAtauKode)
  };
};

// Di render card order — SELALU gunakan renderIdentity():
const identity = renderIdentity(order);

// Tampilkan nama masked:
<span>{identity.displayName}</span>

// Tombol reveal (hanya muncul untuk non-anonim):
{identity.canReveal && !identity.isRevealed && (
  <button
    onClick={async () => {
      setRevealedOrderIds(prev => [...prev, order.id!]);
      // Tulis ke audit log:
      const auditRef = collection(db, COLLECTIONS.ORDERS, order.id!, "auditLog");
      await addDoc(auditRef, {
        action: "identity_revealed",
        actorId: currentUser.uid,
        actorName: userData?.displayName || "Petugas DP3A",
        actorRole: "gov_dp3a",
        timestamp: serverTimestamp(),
        notes: "Petugas mengakses identitas pelapor"
      });
    }}
    className="text-xs text-purple-600 dark:text-purple-400 underline hover:no-underline"
  >
    Klik untuk lihat identitas
  </button>
)}

// Phone SELALU masked, tidak ada tombol reveal untuk phone:
<span className="font-mono">{identity.displayPhone}</span>

// Tab workspace DP3A yang direkomendasikan:
// Tab "Kasus Aktif" — status pending_verification + pending + accepted
// Tab "Jadwal Konseling Puspaga" — booking konseling
// Tab "Selesai Ditangani"
```

---

## dp3a_konseling_puspaga — Form Booking Konseling

```typescript
// Form terpisah: src/components/civic/forms/dp3a/Dp3aKonselingPuspagaForm.tsx
// Mode anonim: OPSIONAL (default OFF untuk konseling reguler)
// Field: jenisKonseling, jadwalKonsultasi (date + time), catatan
// Status awal: "pending_verification" (konfirmasi slot)

const JENIS_KONSELING = [
  { value: "pernikahan", label: "Konseling Pernikahan & Keluarga" },
  { value: "pola_asuh", label: "Pola Asuh Anak" },
  { value: "trauma", label: "Pemulihan Trauma" },
  { value: "remaja", label: "Permasalahan Remaja" },
  { value: "lansia", label: "Pendampingan Lansia" }
];
```

---

## Catatan Keamanan Khusus DP3A

> WAJIB DIBACA sebelum mengubah kode apapun di folder dp3a/

1. JANGAN expose lokasiAman di workspace tanpa konfirmasi
2. JANGAN tambah fitur print/export data kasus tanpa autentikasi ulang
3. Audit log akses identitas WAJIB ditulis ke sub-collection
4. Data kasus DP3A disimpan minimum 1 tahun (jangan hapus di cleanup script)
5. rejectedByDinasName untuk DP3A: gunakan kode petugas, bukan nama asli
