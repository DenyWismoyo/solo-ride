import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../lib/admin";

export const onOrderCompleted = onDocumentUpdated(
  {
    document: "orders/{orderId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Pastikan status berubah DARI apapun KE "completed"
    if (!beforeData || !afterData) return;
    if (beforeData.status !== "completed" && afterData.status === "completed") {
      const customerId = afterData.customerId;
      
      try {
        // Berikan Poin/Stamp +10 ke Customer
        const userRef = db.collection("users").doc(customerId);
        await userRef.set({
          points: FieldValue.increment(10)
        }, { merge: true });

        // Kirim Notifikasi Internal
        await db.collection("notifications").add({
          userId: customerId,
          type: "point_reward",
          title: "Order Selesai, Poin Bertambah! 🎉",
          body: "Terima kasih telah berkendara dengan Ride-Solo. Anda mendapatkan +10 Poin Stamp UMKM.",
          isRead: false,
          createdAt: FieldValue.serverTimestamp()
        });

        console.log(`Successfully added 10 points to customer: ${customerId} for order: ${event.params.orderId}`);
      } catch (error) {
        console.error("Error updating customer points:", error);
      }
    }
  }
);
