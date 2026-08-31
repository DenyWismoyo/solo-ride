# Dinas Kesehatan Kota Surakarta — Blueprint Operasional

**additionalRole**: `gov_dinkes`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok B — Antar Farmasi/Medis

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Kesehatan Kota Surakarta |
| Alamat | Jl. Muwardi No. 12, Surakarta |
| Telepon | (0271) 638831 |
| 17 Puskesmas | Penumping, Jayengan, Kratonan, Gajahan, Sangkrah, Purwosari, Sondakan, Laweyan, Pajang, Banyuanyar, Manahan, Nusukan, Sibela, Gilingan, Gambirsari, Pucangsawit, Jebres |
| Avatar/Emoji | 🏥 |
| Warna Tema | Teal (`text-teal-500`, `bg-teal-500/10`) |

---

## Layanan yang Tersedia

### 1. `dinkes_resep_puskesmas` — Antar Obat Resep dari 17 Puskesmas
- **Biaya**: Ongkir Koperasi Rp 8.000
- **Driver requirement**: Driver dengan pemahaman protokol farmasi (paket tersegel, tidak boleh dibuka)
- **OTP**: WAJIB — kode OTP dikirim ke WA penerima, dimasukkan driver saat serah terima

### 2. `dinkes_prolanis` — Obat Rutin Pasien Prolanis BPJS
- **Biaya**: Subsidi Rp 8.000 (dari Dana Kapitasi BPJS)
- **Target**: Pasien hipertensi dan diabetes yang terdaftar di Puskesmas
- **Jadwal**: Terjadwal bulanan — bukan on-demand

### 3. `dinkes_donor_darah` — Kurir Darah Siaga PMI
- **Sifat**: DARURAT — skip verifikasi OPD, langsung dispatch
- **Koordinasi**: Antara PMI Surakarta dan RS rujukan
- **Driver requirement**: Driver dengan motor yang bisa bawa termos/kantong darah dengan aman

---

## Form Fields (Lihat DinkesCivicModal.tsx)

```typescript
// Sub: resep_puskesmas + prolanis
noRekamMedis: string;        // WAJIB
noBpjs?: string;
asalPuskesmas: PuskesmasSolo; // Dropdown 17 Puskesmas
namaWaliPenerima: string;
alamatPengantaran: string;
catatanAlergi?: string;       // Privasi — opsional

// Sub: donor_darah (emergency ringkas)
rsujuanDarah: string;
golDarah: GolonganDarah;
rhesus: "+" | "-";
jumlahKantong: number;
namaKontakPMI: string;
notesUrgency: string;
```

---

## Catatan Penting

- **Paket obat WAJIB tersegel** dari farmasi Puskesmas sebelum diserahkan ke driver
- Driver tidak boleh membuka kemasan obat dalam kondisi apapun
- Nama obat bersifat privasi — tampilkan "Obat Rutin [Nama Puskesmas]" saja ke driver, bukan jenis obat
- Untuk kurir darah: driver harus segera hubungi nomor kontak di PMI jika ada masalah di jalan
