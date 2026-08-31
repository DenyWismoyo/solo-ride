# Bapenda Kota Surakarta — Blueprint Operasional

**additionalRole**: `gov_bapenda`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok F — Transaksional/Pajak

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Badan Pendapatan Daerah Kota Surakarta |
| Alamat | Jl. Jenderal Sudirman No. 2, Surakarta |
| Telepon | (0271) 644534 |
| Avatar/Emoji | 💰 |
| Warna Tema | Indigo (`text-indigo-500`, `bg-indigo-500/10`) |

---

## Layanan yang Tersedia

### 1. `bapenda_pbb_online` — Bayar PBB-P2 Online
- **Target**: Seluruh wajib pajak PBB di Kota Surakarta
- **Biaya Admin**: Bebas admin (tidak ada charge tambahan)
- **Integrasi**: Perlu integrasi dengan SIMPATDA (Sistem Manajemen Pajak Daerah) Kota Surakarta

### 2. `bapenda_retribusi_pasar` — Retribusi Kios Pasar QRIS
- **Target**: Pedagang Pasar Gede, Pasar Legi, Pasar Klewer, Pasar Nusukan
- **Frekuensi**: Harian (pedagang bayar setiap hari buka)
- **Nilai**: Sesuai Perda Kota Surakarta (bervariasi per tipe kios)

### 3. `bapenda_konsultasi_insentif` — Konsultasi Pajak + Reward Poin
- **Reward**: Wajib pajak taat mendapat stamp poin loyalitas
- **Konsultasi**: Gratis untuk NPWPD baru, keberatan pajak, dan insentif UMKM

---

## Aturan Pembayaran Digital

```typescript
// Untuk PBB Online — tidak butuh driver fisik:
// 1. Customer cek SPPT dari aplikasi → tampilkan tagihan
// 2. Customer pilih metode bayar (QRIS/wallet/VA)
// 3. Payment confirmed → generate bukti bayar digital (PDF)
// 4. Status order langsung "completed" tanpa dispatch driver

// Untuk retribusi pasar — bisa dilakukan pedagang dari HP sendiri:
// Tidak butuh driver, cukup in-app payment flow

// Yang BUTUH driver: antar fisik bukti bayar ke pedagang yang tidak punya HP
// → Ini skenario edge case, bukan mayoritas
```

---

## Insentif Wajib Pajak

```typescript
// Reward sistem untuk mendorong kepatuhan pajak:
const TAX_LOYALTY_REWARDS = {
  pbb_tepat_waktu: 500,         // 500 poin untuk bayar PBB sebelum jatuh tempo
  retribusi_rutin_30hari: 200,  // 200 poin untuk 30 hari retribusi berturut-turut
  konsultasi_npwpd: 100,        // 100 poin setelah sesi konsultasi
};
// Poin ini masuk ke ekosistem poin koperasi yang bisa dipakai di UMKM mitra
```
