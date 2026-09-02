# Blueprint Layanan OPD: Dinas Perdagangan Kota Surakarta (`gov_disdag`)

## 1. Profil Instansi
- **Nama OPD**: Dinas Perdagangan (Disdag) Kota Surakarta
- **Fokus Utama**: Pengelolaan 44 Pasar Tradisional, Stabilisasi Pasokan dan Harga Pangan (SPHP), Tera Metrologi Legalitas Timbangan, dan Gerakan Pangan Murah (GPM) Terpadu bersama Perum BULOG KC Surakarta.
- **SLA Respon**: 24 Jam (Verifikasi E-Voucher) / Real-time Posko GPM.

---

## 2. Fitur Unggulan Workspace OPD (`/gov/gov_disdag`)
1. **Scanner E-Voucher GPM**:
   - Pemindai Barcode QR / Input PIN 4-digit untuk memvalidasi voucher tebus sembako subsidi di posko kelurahan.
2. **SIPAHAP (Sistem Informasi Pantauan Harga Pasar)**:
   - Input harga harian beras, cabai, minyak, gula, dan telur di 44 pasar tradisional Kota Solo.
   - Pemicu otomatis intervensi operasi pasar jika harga melampaui ambang batas 15% di atas HET.
3. **Peta 44 Pasar Tradisional & Data Kios/Los**:
   - Database blok los pedagang dan penerbitan sertifikasi Tera Metrologi resmi.
4. **Alokasi Kuota SPHP Bulog**:
   - Pengaturan kuota sak beras SPHP 5kg dan Minyakita per titik posko kelurahan/kecamatan.

---

## 3. Data Contracts & Audit Logs
- Setiap penebusan e-voucher dicatat ke sub-collection `orders/{orderId}/auditLog` dengan aksi `gpm_voucher_redeemed` dan nama petugas posko yang melayani.
