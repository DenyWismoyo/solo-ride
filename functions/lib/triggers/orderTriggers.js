"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrderCompleted = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const admin_1 = require("../lib/admin");
exports.onOrderCompleted = (0, firestore_1.onDocumentUpdated)({
    document: "orders/{orderId}",
    region: "asia-southeast1",
}, async (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    // Pastikan status berubah DARI apapun KE "completed"
    if (!beforeData || !afterData)
        return;
    if (beforeData.status !== "completed" && afterData.status === "completed") {
        const customerId = afterData.customerId;
        try {
            // Berikan Poin/Stamp +10 ke Customer
            const userRef = admin_1.db.collection("users").doc(customerId);
            await userRef.set({
                points: firestore_2.FieldValue.increment(10)
            }, { merge: true });
            // Kirim Notifikasi Internal
            await admin_1.db.collection("notifications").add({
                userId: customerId,
                type: "point_reward",
                title: "Order Selesai, Poin Bertambah! 🎉",
                body: "Terima kasih telah berkendara dengan Ride-Solo. Anda mendapatkan +10 Poin Stamp UMKM.",
                isRead: false,
                createdAt: firestore_2.FieldValue.serverTimestamp()
            });
            console.log(`Successfully added 10 points to customer: ${customerId} for order: ${event.params.orderId}`);
        }
        catch (error) {
            console.error("Error updating customer points:", error);
        }
    }
});
//# sourceMappingURL=orderTriggers.js.map