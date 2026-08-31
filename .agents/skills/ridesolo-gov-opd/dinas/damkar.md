# Dinas Pemadam Kebakaran & Penyelamatan Surakarta — Blueprint Operasional

**additionalRole**: `gov_damkar`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**PRIORITAS**: 🔴 Selesai — Layanan Darurat  
**Tipe Interaksi**: Kelompok E — Emergency / Darurat

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Pemadam Kebakaran dan Penyelamatan Kota Surakarta |
| Telepon Darurat | (0271) 7630133 / 113 |
| Pos Utama | Jl. Brigjend Slamet Riyadi No. 445, Solo |
| Pos Cabang | Pos Jebres, Pos Banjarsari, Pos Pasar Kliwon |
| Jam Operasional | 24 jam / 7 hari |
| Avatar/Emoji | 🚒 |
| Warna Tema | Rose (`text-rose-500`, `bg-rose-500/10`) |

---

## Layanan yang Tersedia

### 1. `damkar_panic_button` — Tombol Darurat Kebakaran (PANIC GPS)
- **Sifat**: EMERGENCY — tidak ada verifikasi OPD, langsung dispatch!
- **Flow khusus**: Submit → status langsung "pending" (skip "pending_verification")
- **SLA**: Respons dalam 5 menit sejak submit
- **Form**: Ultra ringkas — GPS + jenis darurat + konfirmasi alamat (MAKSIMAL 3 field)
- **UI khusus**: Latar merah menyala, tombol submit besar, tampilkan nomor darurat yang bisa diklik

### 2. `damkar_animal_rescue` — Animal Rescue & Evakuasi Non-Api
- **Sifat**: Non-darurat, bisa dijadwalkan
- **SLA**: Respons dalam 2 jam (bukan emergency)
- **Form**: Jenis rescue + lokasi + deskripsi + pilih jadwal (opsional)
- **Biaya**: Gratis (layanan Pemkot)

---

## Spesifikasi `DamkarCivicModal.tsx` yang Harus Dibuat

```tsx
// RENDERING BERBEDA berdasarkan serviceId yang di-pass:
interface DamkarCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: "damkar_panic_button" | "damkar_animal_rescue";
}

// Jika serviceId === "damkar_panic_button":
// → Render PanicButton mode: warna merah, GPS auto-detect, form ultra ringkas
// → Auto-submit setelah GPS terkunci (countdown 3 detik dengan cancel option)
// → Tampilkan: "Menyambungkan ke Pos Damkar Terdekat..."
// → Tampilkan nomor 0271-7630133 yang bisa langsung di-tap untuk telepon

// Jika serviceId === "damkar_animal_rescue":
// → Render Normal mode: form standar dengan pilih jenis rescue
// → Pilih jadwal (opsional)
```

### Form Panic Button (WAJIB ULTRA RINGKAS):

```tsx
// HANYA 3 FIELD + GPS AUTO:
<GPSAutoDetect />                 {/* Peta kecil + koordinat */}
<input alamatManual />            {/* Konfirmasi manual */}
<select jenisDarurat />           {/* Kebakaran/Ledakan/Orang Terjebak/Gas Bocor */}
<button>🔴 KIRIM DARURAT</button>  {/* BESAR, merah, mudah ditekan */}
<a href="tel:02717630133">Telepon Damkar Langsung</a>
```

### Form Animal Rescue:

```tsx
<select jenisRescue />
<textarea deskripsiDetail />
<input lokasiRescue />
<input waktuPilihan optional />
<input kontakWa />
```

---

## Spesifikasi `GovDamkarWorkspace.tsx` yang Harus Dibuat

### Tab 1: LIVE PANIC MAP (default active)
```
- Peta real-time koordinat semua panic button aktif hari ini
- Marker animasi merah berkedip untuk yang < 10 menit
- Tombol "Dispatch [Nama Pos Terdekat]" per marker
- Audio alert Web Audio API saat laporan baru masuk
- Badge counter laporan aktif di tab header
```

### Tab 2: TRIAGE DARURAT
```
- List permohonan: Panic Button (merah) dan Animal Rescue (oranye)
- Urut berdasarkan waktu masuk (terbaru di atas)
- Field yang ditampilkan: Jenis darurat, Alamat, GPS, Waktu masuk
- Tombol aksi: "Dispatch Pos [X]" + input nama petugas yang dikirim
- Response time counter (detik yang berlalu)
```

### Tab 3: RIWAYAT PENANGANAN
```
- Log semua penanganan dengan response time
- Statistik: rata-rata response time hari ini
- Filter: Kebakaran / Animal Rescue / Semua
```

### Audio Alert (WAJIB):
```typescript
// Di GovDamkarWorkspace, subscribe real-time ke orders baru
// Saat order baru dengan additionalRole === "gov_damkar" masuk:
import { playOrderAlertSound } from "@/lib/sound";
useEffect(() => {
  if (newPanicOrder) {
    playOrderAlertSound();
    // Juga tampilkan browser notification jika tab tidak aktif
  }
}, [newPanicOrder]);
```

---

## Registrasi di more/page.tsx

```typescript
// State yang perlu ditambahkan:
const [isDamkarOpen, setIsDamkarOpen] = useState(false);
const [damkarServiceId, setDamkarServiceId] = useState<string>("damkar_panic_button");

// Di handleCardClick():
if (service.additionalRole === "gov_damkar" || service.id.startsWith("damkar_")) {
  setDamkarServiceId(service.id);
  setIsDamkarOpen(true);
  return;
}

// Render modal:
<DamkarCivicModal
  isOpen={isDamkarOpen}
  onClose={() => setIsDamkarOpen(false)}
  serviceId={damkarServiceId}
/>
```

## Registrasi di gov/page.tsx

```typescript
// Di section 3 workspace, tambahkan:
{selectedDinasId === "gov_damkar" && (
  <GovDamkarWorkspace orders={citizenRequests} loading={loadingRequests} />
)}

// Hapus "gov_damkar" dari exclude list GovOpdModularWorkspace
```
