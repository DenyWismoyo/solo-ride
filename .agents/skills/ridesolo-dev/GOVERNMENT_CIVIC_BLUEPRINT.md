# Ride-Solo: Blueprint Layanan Pemerintahan (Government Civic Services)

> Dokumen ini adalah **referensi arsitektur tunggal** untuk pengembangan fitur Additional Role Pemerintahan Kota Surakarta (Government Sectors) dan antarmuka layanan publik kepada warga (Customer Civic Services) di platform Ride-Solo.

---

## 🏛️ Filosofi: Civic Technology & "Killing Machine" Platform

Integrasi layanan publik dengan ekosistem transportasi dan logistik hyperlocal adalah keunggulan mutlak yang tidak dapat direplikasi oleh aplikator swasta nasional karena:
1. **Legalitas & Wewenang**: Hanya dinas terkait yang berwenang memvalidasi dan memproses dokumen resmi negara (KTP, KK, Rekam Medis, Bansos, PBB, KIR).
2. **Subsidi APBD & Koperasi**: Pendanaan subsidi murni dari pos anggaran publik dan SHU Koperasi, membebaskan biaya bagi warga yang membutuhkan (lansia, difabel, dhuafa).
3. **Hyperlocal First**: Setiap alur disesuaikan dengan regulasi dan simpul fisik Kota Surakarta (17 Puskesmas, 5 Kecamatan, Pasar Tradisional, Kawasan Cagar Budaya).

---

## 📋 18 Dinas & Badan Publik Pemkot Surakarta & Matriks Layanan

### 1. Disdukcapil (`gov_dukcapil`)
- **Fokus**: Administrasi Kependudukan & Catatan Sipil Door-to-Door.
- **Layanan Utama**:
  - `dukcapil_antar_ktp`: Antar KTP-el, KK, KIA, Akte Kelahiran/Kematian ke rumah warga.
  - `dukcapil_mobile_perekaman`: Layanan jemput bola perekaman biometrik lansia/difabel.
  - `dukcapil_legalisir`: Pengantaran berkas legalisir dokumen kependudukan.
- **Data Contract**: `DukcapilDetails` (NIK, jenis dokumen, asal kantor/kecamatan, kode OTP serah-terima fisik).

### 2. Dinas Kesehatan (`gov_dinkes`)
- **Fokus**: Distribusi Farmasi Puskesmas, Antar Obat Pasien Kronis & Donor Darah.
- **Layanan Utama**:
  - `dinkes_resep_puskesmas`: Pengantaran obat resep bersegel farmasi dari 17 Puskesmas se-Solo.
  - `dinkes_prolanis`: Distribusi obat rutin pasien Prolanis BPJS (Hipertensi/Diabetes).
  - `dinkes_donor_darah`: Kurir siaga spesimen darah PMI ke rumah sakit rujukan.
  - `dinkes_lab_puskesmas`: Antar hasil uji laboratorium faskes ke rumah warga.
- **Data Contract**: `DinkesDetails` (No. Rekam Medis, asal Puskesmas, jenis obat, catatan alergi, nomor BPJS).

### 3. Dinas Sosial (`gov_dinsos`)
- **Fokus**: Bantuan Pangan, Perlindungan Difabel/Lansia, dan Tanggap Bencana.
- **Layanan Utama**:
  - `dinsos_bansos_pasar`: Kupon tebus sembako pasar tradisional & verifikasi PKH.
  - `dinsos_ojek_difabel`: Armada antar-jemput siaga 100% bersubsidi bagi penyandang disabilitas dan lansia.
  - `dinsos_tanggap_bencana`: Mobilisasi logistik dapur umum & relawan bencana ke kelurahan terdampak.
  - `dinsos_lapor_ppks`: Pengaduan warga rentan yang membutuhkan asesmen sosial darurat.
- **Data Contract**: `DinsosDetails` (Kategori penumpang/difabel, alat bantu, jenis bansos, token verifikasi).

### 4. Dinas Koperasi & UMKM (`gov_diskop`)
- **Fokus**: Legalitas Usaha Mikro, Dana Bergulir, dan Dividen SHU Koperasi.
- **Layanan Utama**:
  - `diskop_shu_koperasi`: Alokasi stamp poin, subsidi karcis driver, dan dividen SHU tahunan.
  - `diskop_nib_pendampingan`: Pendampingan pendaftaran Nomor Induk Berusaha (NIB) OSS di tempat.
  - `diskop_modal_bergulir`: Fasilitasi pengajuan dana bergulir dan kurasi usaha mikro.
  - `diskop_pelatihan_umkm`: Pendaftaran pelatihan kemasan, higienitas, dan pembukuan digital.
- **Data Contract**: `DiskopDetails` (Nama usaha, kategori produk, jenis bantuan, omzet estimasi).

### 5. Dinas Kebudayaan & Pariwisata (`gov_dispar`)
- **Fokus**: Promosi Heritage, Kalender Budaya Solo, dan Integrasi Wisatawan.
- **Layanan Utama**:
  - `dispar_heritage_tour`: Paket rute wisata heritage keliling Keraton, Mangkunegaran, dan Pasar Triwindu.
  - `dispar_tiket_event`: Tiket resmi & informasi kalender budaya (Kirab 1 Suro, Solo Batik Carnival).
  - `dispar_pemandu_wisata`: Booking pemandu wisata resmi terkurasi dinas HPI.
- **Data Contract**: `DisparDetails` (Nama paket, tanggal kunjungan, preferensi bahasa, ID event budaya).

### 6. Dinas Perhubungan (`gov_dishub`)
- **Fokus**: Rekayasa Lalin CFD, Shelter Ojek Resmi, dan Uji KIR Digital.
- **Layanan Utama**:
  - `dishub_cfd_shelter`: Titik kumpul dan manajemen shelter resmi saat CFD Slamet Riyadi.
  - `dishub_lapor_lalin`: Laporan kemacetan, jalan rusak, dan rambu lalu lintas secara real-time.
  - `dishub_kir_digital`: Booking antrean uji berkala kendaraan bermotor (KIR).
  - `dishub_parkir_qris`: Retribusi parkir resmi non-tunai.
- **Data Contract**: `DishubDetails` (Jenis laporan/layanan, lokasi titik jalan, bukti foto, nomor uji KIR).

### 7. Badan Pendapatan Daerah (`gov_bapenda`)
- **Fokus**: Optimalisasi PAD, Pajak Daerah, dan Retribusi Pasar Digital.
- **Layanan Utama**:
  - `bapenda_pbb_online`: Cek tagihan dan pembayaran Pajak Bumi & Bangunan (PBB) via aplikasi.
  - `bapenda_retribusi_pasar`: Pembayaran retribusi kios pasar tradisional berbasis QRIS.
  - `bapenda_konsultasi_pajak`: Konsultasi perpajakan daerah dan pendaftaran NPWPD usaha baru.
  - `bapenda_insentif_kepatuhan`: Reward stamp poin loyalitas bagi wajib pajak taat waktu.
- **Data Contract**: `BapendaDetails` (Jenis pajak/retribusi, nomor NOP/SPPT, ID kios pasar, tahun pajak, nominal).

### 8. Dinas Pendidikan (`gov_disdik`)
- **Fokus**: Antar-Jemput Sekolah Zonasi Bersubsidi & Distribusi Legalisir Ijazah.
- **Layanan Utama**: `disdik_antar_jemput_sekolah`, `disdik_antar_ijazah_buku`, `disdik_beasiswa_bpmks`.
- **Data Contract**: `DisdikDetails` (Nama siswa, NISN, sekolah, zonasi, legalisir).

### 9. Dinas Lingkungan Hidup (`gov_dlh`)
- **Fokus**: Jemput Sampah Daur Ulang Bank Sampah RW & Poin Lingkungan.
- **Layanan Utama**: `dlh_jemput_sampah_daur_ulang`, `dlh_lapor_pohon_tumbang`, `dlh_uji_emisi_driver`.
- **Data Contract**: `DlhDetails` (Jenis sampah, estimasi berat kg, RW bank sampah).

### 10. Dinas Pemadam Kebakaran & Penyelamatan (`gov_damkar`)
- **Fokus**: Panic Button Kebakaran 24 Jam, Animal Rescue, dan Evakuasi Cincin.
- **Layanan Utama**: `damkar_panic_button`, `damkar_animal_rescue`, `damkar_inspeksi_apar_umkm`.
- **Data Contract**: `DamkarDetails` (Kategori darurat, tingkat urgensi, koordinat GPS).

### 11. Dinas Perpustakaan dan Kearsipan (`gov_dispusip`)
- **Fokus**: Kurir Pustaka (Antar/Pinjam Buku ke Rumah) & Preservasi Naskah Kuno.
- **Layanan Utama**: `dispusip_kurir_buku`, `dispusip_kartu_anggota_digital`, `dispusip_restorasi_arsip`.
- **Data Contract**: `DispusipDetails` (Judul buku, barcode pustaka, durasi peminjaman).

### 12. Dinas Ketahanan Pangan dan Pertanian (`gov_dispertan`)
- **Fokus**: Dokter Hewan Homecare Puskeswan Solo & Gerakan Pangan Murah (GPM).
- **Layanan Utama**: `dispertan_klinik_hewan_homecare`, `dispertan_gerakan_pangan_murah`, `dispertan_bibit_urban_farming`.
- **Data Contract**: `DispertanDetails` (Jenis hewan, gejala sakit, bibit KWT).

### 13. Dinas Tenaga Kerja dan Perindustrian (`gov_disnaker`)
- **Fokus**: Antar Kartu Kuning AK-1, Pendaftaran Kursus BLK, dan Pengaduan THR.
- **Layanan Utama**: `disnaker_kartu_kuning_ak1`, `disnaker_pelatihan_blk`, `disnaker_lapor_ketenagakerjaan`.
- **Data Contract**: `DisnakerDetails` (NIK pencari kerja, jurusan pelatihan, laporan UMK/THR).

### 14. Diskominfo & Statistik (`gov_diskominfo`)
- **Fokus**: Kanal Aduan ULAS (Unit Layanan Aduan Surakarta) & Cek Fakta Anti-Hoaks.
- **Layanan Utama**: `diskominfo_ulas_terpadu`, `diskominfo_cek_hoaks_solo`, `diskominfo_wifi_rw`.
- **Data Contract**: `DiskominfoDetails` (Kategori tiket, judul aduan, kelurahan target).

### 15. Satuan Polisi Pamong Praja (`gov_satpolpp`)
- **Fokus**: Lapor Trantibum Geotag, Izin Keramaian, dan Patroli Humanis.
- **Layanan Utama**: `satpolpp_lapor_trantib`, `satpolpp_pengawalan_event`.
- **Data Contract**: `SatpolppDetails` (Jenis gangguan, lokasi kejadian, penyelenggara).

### 16. Badan Penanggulangan Bencana Daerah (`gov_bpbd`)
- **Fokus**: Radar EWS Bengawan Solo & Kali Pepe, Distribusi Tenda/Logistik Darurat.
- **Layanan Utama**: `bpbd_peringatan_dini_banjir`, `bpbd_logistik_darurat`, `bpbd_lapor_bencana_alam`.
- **Data Contract**: `BpbdDetails` (Jenis bencana, level EWS, item logistik darurat).

### 17. DP3APM (Perlindungan Perempuan & Anak) (`gov_dp3a`)
- **Fokus**: Hotline Sahabat Perempuan & Anak, Konseling Psikolog Puspaga Gratis.
- **Layanan Utama**: `dp3a_hotline_sahabat_perempuan`, `dp3a_konseling_puspaga`.
- **Data Contract**: `Dp3aDetails` (Jenis kasus kekerasan, kerahasiaan identitas).

### 18. DPMPTSP (Mal Pelayanan Publik Balai Kota) (`gov_dpmptsp`)
- **Fokus**: Antar Fisik SK Izin Usaha / IMB MPP Sudirman ke Kantor Pemohon.
- **Layanan Utama**: `dpmptsp_antar_sk_izin`, `dpmptsp_booking_antrean_mpp`.
- **Data Contract**: `DpmptspDetails` (Nomor registrasi MPP, jenis izin usaha).

---

## 🔄 Siklus Status Order Layanan Pemerintah

Semua permohonan layanan pemerintah melewati tahapan:
```
Customer Mengajukan Form
        ↓
status: "pending_verification" (Masuk ke Workspace Dinas terkait)
        ↓ (Petugas memverifikasi fisik/berkas/resep/subsidi)
status: "pending" (Terdispatch otomatis ke Radar Driver Mitra Solo)
        ↓ (Driver menerima order)
status: "in_progress" (Driver mengambil berkas/paket dan menuju lokasi warga)
        ↓ (Serah terima fisik dengan kode OTP/tanda tangan)
status: "completed" (Tercatat di Audit Log Riwayat Berkas & Ledger Koperasi)
```

---

## 🛡️ Aturan Arsitektur & Workspace

1. **Type-Safe Contract**: Dilarang menggunakan `[key: string]: any` tanpa interface terdefinisi di `src/types/order.types.ts`.
2. **Tidak Boleh Fallback Sembarangan**: Setiap dinas (`selectedDinasId`) wajib merender workspace komponen spesifiknya masing-masing.
3. **Auditability**: Setiap status perubahan wajib mencatat `verifiedByDinasAt` dan timestamp Firestore.

---

## 📐 Standar Implementasi Form & Workspace per Dinas (WAJIB DIBACA)

> Referensi lengkap ada di skill terpisah: **`.agents/skills/ridesolo-gov-opd/`**

Setiap dinas yang ditambahkan ke ekosistem WAJIB mengikuti standar:

### Checklist Implementasi Dinas Baru

1. **Customer Side**: Buat `<Dinas>CivicModal.tsx` di `src/components/civic/`
   - Form field sesuai spesifikasi di `ridesolo-gov-opd/FORM_SPECIFICATIONS.md`
   - Sub-service routing via `serviceId` prop jika ada > 1 layanan berbeda
   
2. **OPD Side**: Buat `Gov<Dinas>Workspace.tsx` di `src/components/government/`
   - Panel spec sesuai `ridesolo-gov-opd/OPD_WORKSPACE_SPECS.md`
   - `GovOpdModularWorkspace` HANYA sementara sambil workspace spesifik dibuat
   
3. **Data Contract**: Definisikan `<Dinas>Details` interface di `src/types/gov.types.ts`
   - Referensi: `ridesolo-gov-opd/DATA_CONTRACTS_EXTENDED.md`
   
4. **Registrasi di more/page.tsx**:
   - Tambah state modal: `const [is<Dinas>Open, setIs<Dinas>Open] = useState(false);`
   - Tambah routing di `handleCardClick()` berdasarkan `additionalRole`
   - Render modal di bawah

5. **Registrasi di gov/page.tsx**:
   - Tambah conditional render workspace di section 3
   - Hapus dinas dari exclude list `GovOpdModularWorkspace`

6. **Business Rules**: Ikuti status flow sesuai kategori dinas:
   - Referensi: `ridesolo-gov-opd/STATUS_FLOW_RULES.md`

### Status Implementasi Per Dinas

| Dinas | additionalRole | CivicModal | Workspace | Prioritas |
|-------|---------------|------------|-----------|-----------|
| Disdukcapil | `gov_dukcapil` | ✅ | ✅ | — |
| Dinkes | `gov_dinkes` | ✅ | ✅ | — |
| Dinsos | `gov_dinsos` | ✅ | ✅ | — |
| Diskop | `gov_diskop` | ✅ | ✅ | — |
| Dispar | `gov_dispar` | ✅ | ✅ | — |
| Dishub | `gov_dishub` | ✅ | ✅ | — |
| Bapenda | `gov_bapenda` | ✅ | ✅ | — |
| **Damkar** | `gov_damkar` | ✅ | ✅ | 🔴 Selesai |
| **BPBD** | `gov_bpbd` | ✅ | ✅ | 🔴 Selesai |
| **DP3APM** | `gov_dp3a` | ✅ | ✅ | 🔴 Selesai (Privacy) |
| Disdik | `gov_disdik` | ❌ | ❌ | 🟡 Sedang |
| DLH | `gov_dlh` | ❌ | ❌ | 🟡 Sedang |
| Diskominfo | `gov_diskominfo` | ❌ | ❌ | 🟡 Sedang |
| Satpol PP | `gov_satpolpp` | ❌ | ❌ | 🟡 Sedang |
| DPMPTSP | `gov_dpmptsp` | ❌ | ❌ | 🟡 Sedang |
| Dispusip | `gov_dispusip` | ❌ | ❌ | 🟢 Rendah |
| Dispertan | `gov_dispertan` | ❌ | ❌ | 🟢 Rendah |
| Disnaker | `gov_disnaker` | ❌ | ❌ | 🟢 Rendah |

### Pengelompokan 8 Tipe Interaksi Form

Gunakan ini untuk menentukan template form yang tepat saat membuat modal baru:

| Tipe | Dinas | Template Form |
|------|-------|--------------|
| A. Delivery/Dokumen | Dukcapil, Disdik, Dispusip, Disnaker | NIK + jenis dokumen + alamat |
| B. Farmasi/Medis | Dinkes | No. RM + Puskesmas + BPJS + alergi |
| C. Bansos | Dinsos | Kategori difabel + jenis bansos + token |
| D. Pengaduan | Dishub, DLH, Diskominfo, Satpol PP | Kategori + RT/RW + foto |
| E. Darurat | Damkar, BPBD, DP3A | GPS auto + tombol besar + minimal field |
| F. Pajak | Bapenda | No. SPPT + jenis pajak + nominal |
| G. Booking | Dispar, Dispertan | Tanggal + jumlah + preferensi |
| H. Legalitas | Diskop, DPMPTSP | Nama usaha + NIB + jenis layanan |
