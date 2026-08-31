# BPBD Kota Surakarta — Blueprint Operasional

**additionalRole**: `gov_bpbd`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**PRIORITAS**: 🔴 Selesai — Layanan Bencana  
**Tipe Interaksi**: Kelompok E — Emergency/Darurat

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Badan Penanggulangan Bencana Daerah Kota Surakarta |
| Alamat | Jl. Yap. Cuwiri No. 2, Surakarta |
| Telepon Darurat | (0271) 711091 |
| Monitoring Bengawan Solo | BBWS Bengawan Solo — level siaga real-time |
| Avatar/Emoji | 🌊 |
| Warna Tema | Teal (`text-teal-500`, `bg-teal-500/10`) |

---

## Layanan yang Tersedia

### 1. `bpbd_peringatan_dini_banjir` — EWS Bengawan Solo + Bantuan Darurat
- **Mode A**: Cek level siaga sungai (informasional, tanpa form)
- **Mode B**: Minta bantuan logistik darurat (form ringkas)
- **Sifat**: Mode B adalah emergency — skip verifikasi

---

## Peta Rawan Banjir Surakarta

```typescript
// Titik-titik rawan banjir yang perlu ditampilkan di workspace BPBD:
const FLOOD_RISK_AREAS = [
  { nama: "Semanggi - Jebres", sungai: "Bengawan Solo", risiko: "tinggi" },
  { nama: "Sangkrah - Pasar Kliwon", sungai: "Bengawan Solo", risiko: "tinggi" },
  { nama: "Gandekan - Jebres", sungai: "Kali Pepe", risiko: "sedang" },
  { nama: "Banyuanyar", sungai: "Kali Jenes", risiko: "sedang" },
  { nama: "Laweyan", sungai: "Kali Kaliwingko", risiko: "rendah" },
];

// Status siaga EWS Bengawan Solo (embed dari BBWS):
// Siaga 4 = Waspada (masih aman)
// Siaga 3 = Siaga (perlu pemantauan)
// Siaga 2 = Awas (mulai evakuasi)
// Siaga 1 = Bahaya (evakuasi penuh)
```

---

## Spesifikasi `BpbdCivicModal.tsx`

```tsx
// Mode: Toggle antara "Cek Status EWS" dan "Minta Bantuan"

// Mode Cek Status (default):
// Tampilkan level siaga Bengawan Solo real-time
// Tampilkan level siaga Kali Pepe dan Kali Jenes
// Tampilkan peta rawan banjir Mini
// Tombol "Minta Bantuan" → switch ke Mode Bantuan

// Mode Minta Bantuan (emergency form):
<input namaKontakDarurat />
<input lokasiTerdampak />
<button>Bagikan GPS Saya</button>        {/* GPS auto-detect */}
<select jenisBencana />
<input jumlahKK type="number" />
<select bantuanDiminta multiple>          {/* Checkbox: Tenda/Selimut/Sembako/dll */}
<input kontakWa />
<button className="emergency-red">🌊 Kirim Permohonan Bantuan</button>
<a href="tel:02717110911">Telepon BPBD Langsung</a>
```

---

## Spesifikasi `GovBpbdWorkspace.tsx`

### Tab 1: EWS DASHBOARD (default)
```
- Widget level siaga Bengawan Solo (embed API BBWS atau scraping)
- Widget Kali Pepe dan Kali Jenes
- Peta Solo dengan overlay rawan banjir
- Tombol "Kirim Siaran Peringatan ke Warga" → trigger broadcast publik
- Status terakhir diperbarui: [timestamp]
```

### Tab 2: PERMINTAAN BANTUAN TRIAGE
```
- Daftar permohonan bantuan dengan lokasi GPS
- Urut berdasarkan waktu (terbaru di atas)
- Alokasi logistik dari stok gudang BPBD
- Dispatch driver untuk distribusi
```

### Tab 3: LOGISTIK INVENTORY
```
- Stok: Tenda darurat [X] unit
- Stok: Selimut [X] lembar
- Stok: Paket sembako [X] paket
- Alert: Stok kritis (< 10 unit)
- Tombol "Request Restock" → notif ke admin
```
