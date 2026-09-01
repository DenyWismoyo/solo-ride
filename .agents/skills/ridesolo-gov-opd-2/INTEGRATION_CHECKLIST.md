# INTEGRATION_CHECKLIST.md — Master Checklist End-to-End Q4 2026

> Checklist komprehensif untuk memastikan integrasi antara customer, driver, dan OPD
> berjalan profesional dari ujung ke ujung.

---

## CHECKLIST P0 — Critical (Harus Selesai Sprint 1)

### DP3A Privacy
- [ ] `src/lib/privacy.ts` — buat file dengan maskName(), maskPhone(), generateAnonCode()
- [ ] `Dp3aSapa129Form.tsx` — tambah isAnonymous toggle (default: true)
- [ ] `Dp3aSapa129Form.tsx` — ubah jenisKasus dari text ke dropdown enum
- [ ] `Dp3aSapa129Form.tsx` — tambah generateAnonCode() untuk effectiveName
- [ ] `Dp3aWorkspace.tsx` — implementasikan data masking via maskName/maskPhone
- [ ] `Dp3aWorkspace.tsx` — tambah "Reveal Identity" button + write auditLog identity_revealed

### Emergency Bypass
- [ ] `src/constants/emergencyServices.ts` — buat file dengan isEmergencyService()
- [ ] `useCivicOrder.ts` — implementasikan initialStatus = isEmergencyService() ? "pending" : "pending_verification"
- [ ] `DamkarPanicDispatchForm.tsx` — tambah GPS auto-detect (useEffect + navigator.geolocation)
- [ ] `DamkarPanicDispatchForm.tsx` — ubah jenisDarurat dari text ke enum dropdown
- [ ] `DamkarPanicDispatchForm.tsx` — tambah tombol klik darurat: tel:02717630133

---

## CHECKLIST P1 — High (Sprint 2)

### Rejection Flow
- [ ] `src/components/government/shared/RejectionModal.tsx` — buat komponen reusable
- [ ] `DukcapilWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DinkesWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DinsosWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DiskopWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `BapendaWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DisdikWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DisnakerWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DpmptspWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DishubWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DlhWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DiskominfoWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `SatpolppWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DisparWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DispertanWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DispusipWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `BpbdWorkspace.tsx` — tambah RejectionModal + rejection handler
- [ ] `DamkarWorkspace.tsx` — tambah RejectionModal + rejection handler (animal rescue)

### Audit Trail
- [ ] `src/types/audit.types.ts` — buat file interfaces AuditEntry, AuditAction, SLAConfig
- [ ] `src/constants/slaConfig.ts` — buat file SLA per dinas
- [ ] `src/lib/auditLog.ts` — buat helper writeAuditLog()
- [ ] Update semua workspace handleApprove() — tambah writeAuditLog(action: "verified")
- [ ] Update semua workspace handleReject() — tambah writeAuditLog(action: "rejected")
- [ ] `firestore.rules` — tambah rule untuk sub-collection auditLog

### Damkar Workspace Upgrade
- [ ] `DamkarWorkspace.tsx` — tambah playOrderAlertSound() on new panic order
- [ ] `DamkarWorkspace.tsx` — tambah elapsed time badge per order
- [ ] `DamkarWorkspace.tsx` — pisahkan 3 tab: DARURAT AKTIF / Animal Rescue / Riwayat
- [ ] `DamkarWorkspace.tsx` — bento metrik: laporan aktif + avg response time

### Customer History
- [ ] `src/constants/serviceCategories.ts` — buat file dengan getOrderCategory()
- [ ] `src/components/history/HistoryFilterBar.tsx` — buat komponen filter kategori
- [ ] `src/app/(customer)/page.tsx` tab "orders" — integrasikan HistoryFilterBar
- [ ] `src/app/(customer)/page.tsx` — update order card untuk gov orders (tampil dinas + layanan)
- [ ] `src/app/(customer)/page.tsx` — tampilkan rejectionReason jika status "rejected"
- [ ] Update Badge status untuk GOV_STATUS_LABELS

---

## CHECKLIST P2 — Medium (Sprint 3-4)

### Missing Forms
- [ ] `DamkarAnimalRescueForm.tsx` — buat + daftarkan di CivicFormDispatcher
- [ ] `BapendaRetribusiPasarForm.tsx` — buat + daftarkan
- [ ] `BapendaKonsultasiPajakForm.tsx` — buat + daftarkan
- [ ] `DisdikAntarIjazahForm.tsx` — buat + daftarkan (requiresOtp: true)
- [ ] `Dp3aKonselingPuspagaForm.tsx` — buat + daftarkan
- [ ] `BpbdLaporBanjirForm.tsx` — refactor: tambah toggle EWS/Bantuan + GPS + multi-select

### OTP Display
- [ ] `src/components/civic/shared/OTPDisplayCard.tsx` — buat komponen premium
- [ ] Update semua page layanan dokumen (Dukcapil, Disdik, Dispusip) — tampilkan OTPDisplayCard setelah submit

### Shared Controls Upgrade
- [ ] `CivicFormControls.tsx` — tambah `MultiSelectCheckboxField` untuk DLH, Dinsos, BPBD
- [ ] `CivicFormControls.tsx` — tambah `GPSDetectField` untuk Damkar/BPBD

### Workspace Audit Log Display
- [ ] `src/components/government/shared/WorkspaceAuditLog.tsx` — buat komponen
- [ ] Integrasikan WorkspaceAuditLog ke DukcapilWorkspace + DamkarWorkspace sebagai pilot

### Form Gaps Phase 2 (dari FORM_SPECIFICATIONS.md)
- [ ] `DukcapilAntarKtpForm.tsx` — tambah field kecamatanAsal (dropdown 5 kecamatan)
- [ ] `DukcapilAntarKtpForm.tsx` — enforce validasi NIK prefix 3372
- [ ] `DispertanPuskeswanForm.tsx` — tambah layananDiminta enum dropdown
- [ ] `DisparHeritageTourForm.tsx` — ubah destinasi dari single ke multi-select
- [ ] `DlhBankSampahForm.tsx` — ubah jenisSampah dari single ke multi-select checkbox
- [ ] `SatpolppTrantibForm.tsx` — tambah RT/RW + kondisional izin acara

---

## CHECKLIST P3 — Backlog

### Advanced Workspace Features
- [ ] `DiskominfoWorkspace.tsx` — SLA 24 jam countdown timer per order
- [ ] `DiskominfoWorkspace.tsx` — "Forward ke Dinas Lain" feature
- [ ] `DlhWorkspace.tsx` — Eco Points calculator setelah verifikasi berat
- [ ] `DispusipWorkspace.tsx` — H-3/H-1 alert buku hampir jatuh tempo
- [ ] `DinsosWorkspace.tsx` — verifikasi PKH/DTKS sebelum dispatch
- [ ] `DinkesWorkspace.tsx` — flag "Obat Disiapkan Farmasi" pre-dispatch

### Backlog Form Fields
- [ ] `DiskominfoUlasForm.tsx` — tambah judulAduan + kelurahan + kecamatan
- [ ] `SatpolppTrantibForm.tsx` — kondisional fields izin keramaian (namaAcara, dll)
- [ ] `DisnakerKartuKuningForm.tsx` — tambah pendidikanTerakhir dropdown
- [ ] `DpmptspMppIzinForm.tsx` — tambah nomorRegistrasiMPP + jenisIzin dropdown
- [ ] `BapendaPbbForm.tsx` — validasi format NOP (33.71.xxx.xxx.xxx-xxxx.x)

### Driver App (OTP Confirmation)
- [ ] Driver app — tambah UI konfirmasi OTP serah terima untuk order gov delivery
- [ ] `order.service.ts` — tambah method confirmOTPHandover(orderId, otpInput)

---

## INTEGRATION TEST SCENARIOS (Wajib ditest setelah setiap sprint)

### Scenario 1: Damkar Emergency Flow
1. Login sebagai customer sandbox
2. Buka layanan Damkar — Tombol Darurat Kebakaran
3. GPS terdeteksi otomatis
4. Submit → status langsung "pending" (bukan pending_verification)
5. Login workspace Damkar → order masuk dengan audio alert
6. Badge elapsed time terlihat + merah jika >5 menit
7. Driver accept order

### Scenario 2: DP3A Anonim SAPA 129
1. Login sebagai customer sandbox
2. Buka layanan DP3A — SAPA 129
3. Mode Anonim = ON (default)
4. Pilih jenisKasus dari dropdown
5. Submit → nama tersimpan sebagai "Pemohon-XXXX"
6. Login workspace DP3A → nama tampil masked (Pemohon-XXXX)
7. Nomor telepon masked (08****xxx)
8. Tombol "Reveal Identity" hanya muncul jika tidak anonim

### Scenario 3: Rejection Flow Dukcapil
1. Login sebagai customer → submit form KTP (NIK salah)
2. Login workspace Dukcapil → order di tab "Perlu Tindakan"
3. Klik tombol "Tolak" → RejectionModal muncul
4. Isi alasan penolakan minimal 10 karakter
5. Konfirmasi → status order = "rejected" + rejectionReason tersimpan
6. AuditLog sub-collection tercatat dengan action "rejected"
7. Login kembali sebagai customer → history tampilkan "Ditolak: [alasan]"

### Scenario 4: Customer History Terstruktur
1. Login sebagai customer dengan beberapa order dari kategori berbeda
2. Tab "Pesanan & Aktivitas" → HistoryFilterBar tampil di atas
3. Klik filter "Layanan Publik" → hanya tampil order gov
4. Order gov card menampilkan nama dinas + layanan, bukan pickup/dropoff
5. Klik filter "Transportasi" → hanya tampil order ride/car

---

## TYPE SAFETY UPGRADE — OrderDocument

```typescript
// Tambahkan ke src/types/order.types.ts:
interface OrderDocument {
  // ... existing ...

  // Gov tracking fields (tambahkan):
  agencyName?: string;
  serviceTitle?: string;
  targetRole?: "government" | "industry" | "merchant" | string;
  isEmergency?: boolean;

  // Verification fields:
  verifiedByDinasAt?: Timestamp;
  verifiedByDinasName?: string;

  // Rejection fields:
  rejectedByDinasAt?: Timestamp;
  rejectedByDinasName?: string;
  rejectionReason?: string;

  // OTP field:
  otpCode?: string;          // Hanya ada jika requiresOtp: true
  otpConfirmedAt?: Timestamp;

  // citizenDetails — generic, tiap dinas punya schema sendiri (lihat gov.types.ts)
  citizenDetails?: Record<string, unknown>;
}
```
