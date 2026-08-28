"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDailyKarcis = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const admin_1 = require("../lib/admin");
const bizengine_1 = require("../lib/bizengine");
exports.resetDailyKarcis = (0, scheduler_1.onSchedule)({ schedule: "0 17 * * *", timeZone: "UTC", region: "asia-southeast1" }, async () => {
    const bizConfig = await bizengine_1.BizEngine.getBizConfig();
    const FULL_KARCIS_AMOUNT = bizConfig.KARCIS_HARIAN || 15000;
    // 17:00 UTC = 00:00 WIB
    const now = new Date();
    // Yesterday's date in local WIB (UTC+7)
    const yesterday = new Date(now.getTime() - 86400000 + (7 * 3600000));
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    // Ambil semua driver yang memiliki ledger hari kemarin
    const snap = await admin_1.db.collection("driverLedger")
        .where("date", "==", yesterdayStr)
        .get();
    if (snap.empty) {
        console.log(`Tidak ada data driverLedger untuk tanggal ${yesterdayStr}.`);
        return;
    }
    const batch = admin_1.db.batch();
    snap.forEach((doc) => {
        const data = doc.data();
        let karcisAmount = FULL_KARCIS_AMOUNT;
        let karcisStatus = "penuh";
        // Logika pemotongan karcis berdasarkan menit online
        if (data.onlineMinutes === 0) {
            karcisAmount = 0;
            karcisStatus = "tidak_online";
        }
        else if (data.onlineMinutes >= 360) {
            // >= 6 jam -> Gratis
            karcisAmount = 0;
            karcisStatus = "gratis";
        }
        else if (data.onlineMinutes >= 240) {
            // >= 4 jam -> Diskon 50%
            karcisAmount = FULL_KARCIS_AMOUNT / 2;
            karcisStatus = "diskon50";
        }
        // 1. Update ledger kemarin dengan karcis final
        batch.update(doc.ref, {
            karcisAmount,
            karcisStatus,
            netRevenue: data.grossRevenue - karcisAmount,
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        });
        // 2. Potong dari dompet driver jika karcisAmount > 0
        if (karcisAmount > 0) {
            const walletRef = admin_1.db.collection("driverWallet").doc(data.driverId);
            batch.set(walletRef, {
                balance: firestore_1.FieldValue.increment(-karcisAmount),
                totalKarcis: firestore_1.FieldValue.increment(karcisAmount),
                lastKarcisDeduction: karcisAmount,
                lastKarcisDate: yesterdayStr,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        else if (karcisStatus === "gratis") {
            // Catat sebagai karcis gratis (reward)
            const walletRef = admin_1.db.collection("driverWallet").doc(data.driverId);
            batch.set(walletRef, {
                totalKarcisGratis: firestore_1.FieldValue.increment(FULL_KARCIS_AMOUNT),
                lastKarcisDate: yesterdayStr,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    });
    await batch.commit();
    console.log(`Karcis harian untuk ${snap.size} driver pada tanggal ${yesterdayStr} berhasil diproses.`);
});
//# sourceMappingURL=karcis.schedule.js.map