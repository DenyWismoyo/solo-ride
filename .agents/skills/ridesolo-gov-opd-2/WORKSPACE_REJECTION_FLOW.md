# WORKSPACE_REJECTION_FLOW.md — Tombol Tolak + Rejection Modal Pattern

> Panduan implementasi alur penolakan permohonan untuk semua 18 workspace OPD.
> Rejection flow adalah fondasi proses bisnis yang profesional dan akuntabel.

---

## Kenapa Rejection Flow Penting

Saat ini hampir semua workspace hanya punya tombol "Setujui". Akibatnya:
- Customer tidak tahu kenapa ditolak — frustasi + kepercayaan turun
- Tidak ada accountability untuk petugas dinas
- Tidak ada data statistik penolakan per kategori alasan
- Tidak ada notifikasi ke customer saat ditolak

---

## RejectionModal.tsx — Komponen Reusable [BUAT BARU]

```typescript
// src/components/government/shared/RejectionModal.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderInfo?: {
    serviceName?: string;
    customerName?: string;
    orderId?: string;
  };
}

export function RejectionModal({ isOpen, onClose, onConfirm, orderInfo }: RejectionModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const MIN_REASON_LENGTH = 10;
  const MAX_REASON_LENGTH = 300;

  const handleConfirm = async () => {
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setError(`Alasan penolakan minimal ${MIN_REASON_LENGTH} karakter`);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menolak permohonan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Tolak Permohonan</h3>
                  {orderInfo?.customerName && (
                    <p className="text-[10px] text-slate-500">{orderInfo.customerName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {orderInfo?.serviceName && (
                <div className="p-2.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Layanan:</p>
                  <p className="text-xs text-slate-800 dark:text-zinc-200 font-semibold mt-0.5">
                    {orderInfo.serviceName}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Alasan Penolakan <span className="text-rose-500">*</span></span>
                  <span className={`text-[10px] font-normal ${reason.length > MAX_REASON_LENGTH ? "text-rose-500" : "text-slate-400"}`}>
                    {reason.length}/{MAX_REASON_LENGTH}
                  </span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => { setReason(e.target.value); setError(""); }}
                  placeholder="Jelaskan alasan penolakan secara jelas agar pemohon dapat memahami dan mengambil tindakan korektif..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500/60 resize-none"
                />
                {error && <p className="text-[10px] text-rose-500 font-semibold">{error}</p>}
                <p className="text-[10px] text-slate-400">
                  Alasan ini akan dikirimkan ke pemohon sebagai notifikasi. Minimal {MIN_REASON_LENGTH} karakter.
                </p>
              </div>

              {/* Quick Reason Templates */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Template Alasan Umum:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "NIK tidak terdaftar di sistem kependudukan",
                    "Dokumen tidak lengkap / perlu dilengkapi",
                    "Tidak memenuhi syarat eligibilitas",
                    "Data yang dimasukkan tidak valid"
                  ].map(template => (
                    <button
                      key={template}
                      onClick={() => setReason(template)}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors text-left"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || reason.trim().length < MIN_REASON_LENGTH || reason.length > MAX_REASON_LENGTH}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Tolak Permohonan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

---

## Cara Menggunakan RejectionModal di Workspace

```typescript
// Di setiap WorkspaceXxx.tsx:

import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { useAuthContext } from "@/components/AuthProvider";

// State:
const { user, userData } = useAuthContext();
const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);

// Handler reject:
const handleReject = async (reason: string) => {
  if (!rejectionTarget?.id) return;

  // 1. Update order status
  await updateDoc(doc(db, COLLECTIONS.ORDERS, rejectionTarget.id), {
    status: "rejected",
    rejectionReason: reason,
    rejectedByDinasAt: serverTimestamp(),
    rejectedByDinasName: userData?.displayName || "Petugas Dinas",
    updatedAt: serverTimestamp()
  });

  // 2. Tulis ke auditLog sub-collection
  const auditRef = collection(db, COLLECTIONS.ORDERS, rejectionTarget.id, "auditLog");
  await addDoc(auditRef, {
    action: "rejected",
    actorId: user?.uid || "",
    actorName: userData?.displayName || "Petugas Dinas",
    actorRole: userData?.additionalRole || "government",
    timestamp: serverTimestamp(),
    notes: reason
  });

  // 3. (Optional) Notifikasi ke customer via notificationService
  // await notificationService.sendNotification(rejectionTarget.customerId, "order_rejected", ...)
};

// Di tombol Approve juga, setelah approve — tulis auditLog:
const handleApprove = async (order: OrderDocument) => {
  await updateDoc(doc(db, COLLECTIONS.ORDERS, order.id!), {
    status: "pending",
    verifiedByDinasAt: serverTimestamp(),
    verifiedByDinasName: userData?.displayName || "Petugas Dinas",
    updatedAt: serverTimestamp()
  });
  // Audit log:
  const auditRef = collection(db, COLLECTIONS.ORDERS, order.id!, "auditLog");
  await addDoc(auditRef, {
    action: "verified",
    actorId: user?.uid || "",
    actorName: userData?.displayName || "Petugas Dinas",
    actorRole: userData?.additionalRole || "government",
    timestamp: serverTimestamp()
  });
};

// Di render tombol per order (ganti tombol lama dengan 2 tombol):
<div className="flex items-center gap-2">
  <Button
    size="sm"
    onClick={() => handleApprove(order)}
    className="flex-1 h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
  >
    ✓ Verifikasi & Dispatch
  </Button>
  <Button
    size="sm"
    variant="outline"
    onClick={() => setRejectionTarget(order)}
    className="h-8 px-3 text-xs font-bold rounded-xl border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
  >
    ✗ Tolak
  </Button>
</div>

// Di JSX return — tambahkan modal:
<RejectionModal
  isOpen={!!rejectionTarget}
  onClose={() => setRejectionTarget(null)}
  onConfirm={handleReject}
  orderInfo={{
    serviceName: (rejectionTarget as any)?.serviceTitle,
    customerName: (rejectionTarget as any)?.customerName,
    orderId: rejectionTarget?.id
  }}
/>
```

---

## Urutan Workspace yang Harus Diupgrade (Prioritas)

```
Priority 1 (Layanan dengan volume tinggi + dokumen penting):
- DukcapilWorkspace.tsx    ← Tertinggi, dokumen KTP/KK
- DinkesWorkspace.tsx      ← Resep obat, donor darah
- DinsosWorkspace.tsx      ← Bansos, difabel
- DiskopWorkspace.tsx      ← NIB, dana bergulir

Priority 2:
- BapendaWorkspace.tsx     ← Pajak PBB
- DisdikWorkspace.tsx      ← Dokumen sekolah
- DisnakerWorkspace.tsx    ← Kartu Kuning, BLK
- DpmptspWorkspace.tsx     ← Izin usaha

Priority 3 (Laporan/Pengaduan):
- DishubWorkspace.tsx
- DlhWorkspace.tsx
- DiskominfoWorkspace.tsx
- SatpolppWorkspace.tsx

Priority 4:
- DisparWorkspace.tsx      ← Heritage tour booking
- DispertanWorkspace.tsx   ← Puskeswan
- DispusipWorkspace.tsx    ← Kurir buku
- BpbdWorkspace.tsx
- DamkarWorkspace.tsx      ← Sudah ada P0 upgrade sendiri
- Dp3aWorkspace.tsx        ← Sudah ada P0 upgrade sendiri
```

---

## Field Baru di OrderDocument (setelah rejection)

```typescript
// Tambahkan ke src/types/order.types.ts:
interface OrderDocument {
  // ... existing fields ...
  
  // Verification tracking:
  verifiedByDinasAt?: Timestamp;
  verifiedByDinasName?: string;
  
  // Rejection tracking:
  rejectedByDinasAt?: Timestamp;
  rejectedByDinasName?: string;
  rejectionReason?: string;
  
  // Emergency flag:
  isEmergency?: boolean;
}
```
