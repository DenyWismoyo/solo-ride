import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { db } from "./firebase.js";
import {
  COLLECTIONS,
  maskPhone,
  maskNIK,
  maskName,
  maskEmail,
  formatTimestamp,
  isEmergency,
} from "./constants.js";
import type {
  AssignOrderArgs,
  ListOnlineDriversArgs,
  GetOrderDetailArgs,
  GetOrdersByStatusArgs,
  GetRecentOrdersArgs,
  UpdateOrderStatusArgs,
  ListGovOrdersArgs,
  GetGovOrderDetailArgs,
  VerifyGovOrderArgs,
  RejectGovOrderArgs,
  ListPendingVerificationArgs,
  GetGovStatsArgs,
  GetDriverKarcisStatusArgs,
  GetDriverWalletArgs,
  ListDriverLedgerArgs,
  ListKycRequestsArgs,
  VerifyDriverKycArgs,
  GetDriverPerformanceArgs,
  ListMerchantsArgs,
  ListMerchantOrdersArgs,
  GetMerchantStatsArgs,
  GetEcosystemStatsArgs,
  ListUsersByRoleArgs,
  GetUserDetailArgs,
} from "./types.js";

const server = new Server(
  {
    name: "ridesolo-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// -----------------------------------------------------------------------------
// LIST TOOLS
// -----------------------------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // === [CORE] Orders & Dispatch ===
      {
        name: "get_pending_orders",
        description: "Mendapatkan daftar pesanan transportasi/layanan yang masih berstatus 'pending' (siap di-dispatch).",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_driver_stats",
        description: "Mendapatkan statistik ringkas driver (total mitra, driver online, dan karcis aktif).",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "assign_order_to_driver",
        description: "Menugaskan (assign) pesanan ke seorang driver mitra secara atomic/transaksional untuk mencegah race condition.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "ID dokumen pesanan di Firestore",
            },
            driverId: {
              type: "string",
              description: "UID dari driver yang akan menerima pesanan",
            },
            driverName: {
              type: "string",
              description: "Nama mitra driver (opsional)",
            },
            driverPhone: {
              type: "string",
              description: "Nomor kontak mitra driver (opsional)",
            },
          },
          required: ["orderId", "driverId"],
        },
      },
      {
        name: "list_online_drivers",
        description: "Mendapatkan daftar driver mitra yang sedang online, lengkap dengan koordinat GPS dan tipe kendaraan.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Batas jumlah driver yang diambil (default 20)",
            },
          },
          required: [],
        },
      },
      {
        name: "get_order_detail",
        description: "Mendapatkan detail lengkap satu pesanan berdasarkan ID.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "ID dokumen pesanan",
            },
          },
          required: ["orderId"],
        },
      },
      {
        name: "get_orders_by_status",
        description: "Mendapatkan daftar pesanan berdasarkan status tertentu (pending, accepted, in_progress, completed, cancelled, rejected).",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Status pesanan (misal: pending, accepted, in_progress, completed, cancelled, rejected)",
            },
            limit: {
              type: "number",
              description: "Maksimal data yang diambil (default 20)",
            },
          },
          required: ["status"],
        },
      },
      {
        name: "get_recent_orders",
        description: "Mendapatkan N pesanan terbaru lintas status untuk pemantauan realtime.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Jumlah pesanan terbaru yang diambil (default 15)",
            },
            serviceType: {
              type: "string",
              description: "Filter jenis layanan (opsional, misal: ojek, mobil, kirim, kuliner)",
            },
          },
          required: [],
        },
      },
      {
        name: "update_order_status",
        description: "Memperbarui status pesanan secara administratif (misal: in_progress, completed, cancelled) beserta audit log.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "ID dokumen pesanan",
            },
            newStatus: {
              type: "string",
              description: "Status baru pesanan (misal: in_progress, completed, cancelled)",
            },
            actorRole: {
              type: "string",
              description: "Role aktor yang mengubah status (misal: admin, hermes_agent)",
            },
            actorName: {
              type: "string",
              description: "Nama penanggung jawab pengubahan",
            },
          },
          required: ["orderId", "newStatus"],
        },
      },

      // === [GOV] Government / OPD Civic Services ===
      {
        name: "list_gov_orders",
        description: "Mendapatkan daftar permohonan layanan warga pemerintahan untuk dinas tertentu (Dukcapil, Dinkes, Damkar, BPBD, dll).",
        inputSchema: {
          type: "object",
          properties: {
            additionalRole: {
              type: "string",
              description: "Kode dinas (misal: gov_dukcapil, gov_dinkes, gov_dinsos, gov_damkar, gov_bpbd, gov_dp3a, dll). Kosongkan untuk semua dinas.",
            },
            status: {
              type: "string",
              description: "Filter status (misal: pending_verification, pending, accepted, completed, rejected)",
            },
            limit: {
              type: "number",
              description: "Batas permohonan yang diambil (default 20)",
            },
          },
          required: [],
        },
      },
      {
        name: "get_gov_order_detail",
        description: "Mendapatkan rincian lengkap permohonan layanan warga beserta formulir spesifik dinas (citizenDetails) dengan proteksi privasi.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "ID dokumen permohonan",
            },
            requestorRole: {
              type: "string",
              description: "Role pemohon akses (misal: gov_dukcapil, gov_dp3a, admin)",
            },
          },
          required: ["orderId"],
        },
      },
      {
        name: "verify_gov_order",
        description: "Memverifikasi permohonan layanan warga oleh petugas dinas (mengubah pending_verification menjadi pending dan mencatat audit trail).",
        inputSchema: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "ID dokumen permohonan",
            },
            verifiedByName: {
              type: "string",
              description: "Nama petugas dinas yang memverifikasi",
            },
            verifiedByUid: {
              type: "string",
              description: "UID petugas dinas (opsional)",
            },
          },
          required: ["orderId", "verifiedByName"],
        },
      },
      {
        name: "reject_gov_order",
        description: "Menolak permohonan layanan warga dengan alasan yang jelas, mencatat riwayat penolakan dan audit trail (tanpa hard-delete).",
        inputSchema: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "ID dokumen permohonan",
            },
            rejectedByName: {
              type: "string",
              description: "Nama petugas dinas yang menolak",
            },
            rejectionReason: {
              type: "string",
              description: "Alasan penolakan berkas/permohonan secara rinci",
            },
            rejectedByUid: {
              type: "string",
              description: "UID petugas dinas (opsional)",
            },
          },
          required: ["orderId", "rejectedByName", "rejectionReason"],
        },
      },
      {
        name: "list_pending_verification",
        description: "Mendapatkan daftar semua permohonan layanan sipil yang sedang menunggu verifikasi dinas (status: pending_verification).",
        inputSchema: {
          type: "object",
          properties: {
            additionalRole: {
              type: "string",
              description: "Filter kode dinas spesifik (opsional)",
            },
            limit: {
              type: "number",
              description: "Batas jumlah permohonan (default 20)",
            },
          },
          required: [],
        },
      },
      {
        name: "get_gov_stats",
        description: "Mendapatkan ringkasan statistik permohonan layanan warga per dinas dan status pelayanan.",
        inputSchema: {
          type: "object",
          properties: {
            additionalRole: {
              type: "string",
              description: "Filter kode dinas (opsional)",
            },
          },
          required: [],
        },
      },

      // === [DRIVER] Driver Management & Karcis ===
      {
        name: "get_driver_karcis_status",
        description: "Mengecek status masa berlaku Karcis Harian flat Rp 5.000 milik mitra driver.",
        inputSchema: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              description: "UID dari driver mitra",
            },
          },
          required: ["driverId"],
        },
      },
      {
        name: "get_driver_wallet",
        description: "Mendapatkan saldo dompet digital internal koperasi mitra driver.",
        inputSchema: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              description: "UID dari driver mitra",
            },
          },
          required: ["driverId"],
        },
      },
      {
        name: "list_driver_ledger",
        description: "Melihat riwayat mutasi transaksi (kredit/debit, topup, karcis) pada dompet driver.",
        inputSchema: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              description: "UID driver",
            },
            limit: {
              type: "number",
              description: "Maksimal data mutasi (default 10)",
            },
          },
          required: ["driverId"],
        },
      },
      {
        name: "list_kyc_requests",
        description: "Mendapatkan daftar pengajuan verifikasi identitas (KTP/SIM) driver yang menunggu persetujuan.",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Status KYC (pending, verified, rejected, unverified)",
            },
            limit: {
              type: "number",
              description: "Maksimal data yang diambil (default 20)",
            },
          },
          required: [],
        },
      },
      {
        name: "verify_driver_kyc",
        description: "Menyetujui atau menolak pengajuan KYC driver (KTP & SIM).",
        inputSchema: {
          type: "object",
          properties: {
            driverUid: {
              type: "string",
              description: "UID driver yang diverifikasi",
            },
            approved: {
              type: "boolean",
              description: "True jika disetujui, False jika ditolak",
            },
            notes: {
              type: "string",
              description: "Catatan verifikasi atau alasan penolakan",
            },
          },
          required: ["driverUid", "approved"],
        },
      },
      {
        name: "get_driver_performance",
        description: "Melihat performa mitra driver: rating pelanggan, total trip, dan tabungan stamp poin.",
        inputSchema: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              description: "UID driver",
            },
          },
          required: ["driverId"],
        },
      },

      // === [MERCHANT] UMKM & Kuliner ===
      {
        name: "list_merchants",
        description: "Mendapatkan daftar warung/toko UMKM mitra yang terdaftar di Surakarta.",
        inputSchema: {
          type: "object",
          properties: {
            isVerified: {
              type: "boolean",
              description: "Filter UMKM yang sudah terverifikasi",
            },
            limit: {
              type: "number",
              description: "Batas jumlah data (default 20)",
            },
          },
          required: [],
        },
      },
      {
        name: "list_merchant_orders",
        description: "Mendapatkan daftar pesanan kuliner/belanjaan untuk warung UMKM tertentu.",
        inputSchema: {
          type: "object",
          properties: {
            merchantId: {
              type: "string",
              description: "ID toko / merchant UMKM",
            },
            status: {
              type: "string",
              description: "Filter status pesanan (misal: pending_merchant, cooking, ready_for_pickup, completed)",
            },
            limit: {
              type: "number",
              description: "Maksimal data yang diambil (default 20)",
            },
          },
          required: ["merchantId"],
        },
      },
      {
        name: "get_merchant_stats",
        description: "Mendapatkan statistik ringkas penjualan dan pesanan dari merchant UMKM.",
        inputSchema: {
          type: "object",
          properties: {
            merchantId: {
              type: "string",
              description: "ID toko / merchant UMKM",
            },
          },
          required: ["merchantId"],
        },
      },

      // === [ADMIN] Ecosystem Overview ===
      {
        name: "get_ecosystem_stats",
        description: "Mendapatkan ringkasan statistik komprehensif 360 derajat seluruh ekosistem Ride-Solo (Transportasi, UMKM, Layanan Warga).",
        inputSchema: {
          type: "object",
          properties: {
            periodDays: {
              type: "number",
              description: "Periode analisa hari (default 7 hari)",
            },
          },
          required: [],
        },
      },
      {
        name: "list_users_by_role",
        description: "Mendapatkan daftar pengguna berdasarkan kategori role (customer, driver, merchant, government, industry, admin).",
        inputSchema: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role pengguna (customer, driver, merchant, government, industry, admin)",
            },
            limit: {
              type: "number",
              description: "Batas jumlah data (default 20)",
            },
          },
          required: ["role"],
        },
      },
      {
        name: "get_user_detail",
        description: "Melihat rincian profil pengguna berdasarkan UID dengan perlindungan privasi data.",
        inputSchema: {
          type: "object",
          properties: {
            uid: {
              type: "string",
              description: "UID pengguna",
            },
          },
          required: ["uid"],
        },
      },
    ],
  };
});

// -----------------------------------------------------------------------------
// CALL TOOL HANDLER
// -----------------------------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments || {};

  try {
    // -------------------------------------------------------------------------
    // [CORE] get_pending_orders
    // -------------------------------------------------------------------------
    if (toolName === "get_pending_orders") {
      const snap = await db
        .collection(COLLECTIONS.ORDERS)
        .where("status", "==", "pending")
        .limit(30)
        .get();

      const orders = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          serviceType: d.serviceType || "ojek",
          serviceTitle: d.serviceTitle || "Layanan Solo",
          isEmergency: Boolean(d.isEmergency || isEmergency(d.serviceType)),
          price: d.price || 0,
          customerName: maskName(d.customerName),
          customerPhone: maskPhone(d.customerPhone),
          pickupAddress: d.pickupLocation?.address || "Titik Jemput",
          dropoffAddress: d.dropoffLocation?.address || "Titik Tujuan",
          createdAt: formatTimestamp(d.createdAt),
          agencyName: d.agencyName || null,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                totalPending: orders.length,
                orders,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] get_driver_stats
    // -------------------------------------------------------------------------
    if (toolName === "get_driver_stats") {
      const [allDriversSnap, onlineDriversSnap, karcisSnap] = await Promise.all([
        db.collection(COLLECTIONS.USERS).where("role", "==", "driver").get(),
        db.collection(COLLECTIONS.USERS).where("role", "==", "driver").where("isOnline", "==", true).get(),
        db.collection(COLLECTIONS.KARCIS).where("status", "==", "active").get(),
      ]);

      const now = new Date();
      let activeKarcisCount = 0;
      karcisSnap.docs.forEach((doc) => {
        const exp = doc.data().expiresAt?.toDate ? doc.data().expiresAt.toDate() : new Date(doc.data().expiresAt);
        if (exp > now) activeKarcisCount++;
      });

      const responseText = [
        `📊 STATISTIK DRIVER MITRA SURAKARTA:`,
        `• Total Driver Terdaftar : ${allDriversSnap.size} mitra`,
        `• Driver Online Saat Ini  : ${onlineDriversSnap.size} mitra`,
        `• Karcis Harian Aktif     : ${activeKarcisCount} driver (Bebas Komisi 100%)`,
      ].join("\n");

      return {
        content: [{ type: "text", text: responseText }],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] assign_order_to_driver (Atomic Transaction)
    // -------------------------------------------------------------------------
    if (toolName === "assign_order_to_driver") {
      const { orderId, driverId, driverName, driverPhone } = args as unknown as AssignOrderArgs;
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const driverRef = db.collection(COLLECTIONS.USERS).doc(driverId);

      let updatedServiceType = "";

      await db.runTransaction(async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists) {
          throw new Error(`Order #${orderId} tidak ditemukan di database.`);
        }

        const orderData = orderSnap.data()!;
        updatedServiceType = orderData.serviceType;

        const allowedStatuses = ["pending", "cooking", "ready_for_pickup", "pending_verification"];
        if (orderData.driverId && orderData.driverId !== driverId) {
          throw new Error(`Order #${orderId} sudah diambil oleh mitra driver lain (${orderData.driverId}).`);
        }
        if (!allowedStatuses.includes(orderData.status)) {
          throw new Error(`Order #${orderId} berada dalam status '${orderData.status}' yang tidak dapat di-assign.`);
        }

        const driverSnap = await transaction.get(driverRef);
        const fetchedDriverName = driverName || (driverSnap.exists ? driverSnap.data()?.displayName : "Mitra Driver");
        const fetchedDriverPhone = driverPhone || (driverSnap.exists ? driverSnap.data()?.phone : "");

        const updatePayload: Record<string, any> = {
          driverId,
          driverName: fetchedDriverName,
          updatedAt: new Date(),
        };

        if (fetchedDriverPhone) {
          updatePayload.driverPhone = fetchedDriverPhone;
        }

        if (orderData.status === "pending") {
          updatePayload.status = "accepted";
        }

        transaction.update(orderRef, updatePayload);
      });

      // Write audit log if civic or standard order
      await orderRef.collection("auditLog").add({
        action: "assigned_by_hermes",
        actorRole: "hermes_agent",
        assignedDriverId: driverId,
        serviceType: updatedServiceType,
        timestamp: new Date(),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Sukses! Order #${orderId} telah berhasil ditugaskan ke driver ${driverName || driverId} secara aman (atomic transaction).`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] list_online_drivers
    // -------------------------------------------------------------------------
    if (toolName === "list_online_drivers") {
      const { limit = 20 } = args as unknown as ListOnlineDriversArgs;
      const snap = await db
        .collection(COLLECTIONS.USERS)
        .where("role", "==", "driver")
        .where("isOnline", "==", true)
        .limit(limit)
        .get();

      const drivers = snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.displayName || "Mitra Driver",
          phone: maskPhone(data.phone),
          vehiclePlate: data.vehiclePlate || "AD **** XX",
          vehicleModel: data.vehicleModel || "Motor",
          location: data.location || { lat: -7.5755, lng: 110.8243 },
          points: data.points || 0,
          kycStatus: data.kycStatus || "unverified",
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ totalOnline: drivers.length, drivers }, null, 2),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] get_order_detail
    // -------------------------------------------------------------------------
    if (toolName === "get_order_detail") {
      const { orderId } = args as unknown as GetOrderDetailArgs;
      const doc = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();

      if (!doc.exists) {
        throw new Error(`Order #${orderId} tidak ditemukan.`);
      }

      const data = doc.data()!;
      const sanitized = {
        id: doc.id,
        ...data,
        customerName: maskName(data.customerName),
        customerPhone: maskPhone(data.customerPhone),
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
        completedAt: formatTimestamp(data.completedAt),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(sanitized, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] get_orders_by_status
    // -------------------------------------------------------------------------
    if (toolName === "get_orders_by_status") {
      const { status, limit = 20 } = args as unknown as GetOrdersByStatusArgs;
      const snap = await db
        .collection(COLLECTIONS.ORDERS)
        .where("status", "==", status)
        .limit(limit)
        .get();

      const orders = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          serviceType: d.serviceType,
          serviceTitle: d.serviceTitle,
          status: d.status,
          price: d.price,
          customerName: maskName(d.customerName),
          pickup: d.pickupLocation?.address,
          dropoff: d.dropoffLocation?.address,
          driverId: d.driverId || null,
          createdAt: formatTimestamp(d.createdAt),
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status, count: orders.length, orders }, null, 2),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] get_recent_orders
    // -------------------------------------------------------------------------
    if (toolName === "get_recent_orders") {
      const { limit = 15, serviceType } = args as unknown as GetRecentOrdersArgs;
      let query = db.collection(COLLECTIONS.ORDERS).orderBy("createdAt", "desc").limit(limit);

      if (serviceType) {
        query = db
          .collection(COLLECTIONS.ORDERS)
          .where("serviceType", "==", serviceType)
          .limit(limit);
      }

      const snap = await query.get();
      const orders = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          serviceType: d.serviceType,
          status: d.status,
          price: d.price,
          customer: maskName(d.customerName),
          createdAt: formatTimestamp(d.createdAt),
        };
      });

      return {
        content: [{ type: "text", text: JSON.stringify(orders, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [CORE] update_order_status
    // -------------------------------------------------------------------------
    if (toolName === "update_order_status") {
      const { orderId, newStatus, actorRole = "hermes_agent", actorName = "Hermes AI" } =
        args as unknown as UpdateOrderStatusArgs;
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const snap = await orderRef.get();

      if (!snap.exists) {
        throw new Error(`Order #${orderId} tidak ditemukan.`);
      }

      const oldStatus = snap.data()?.status;

      await orderRef.update({
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === "completed" ? { completedAt: new Date() } : {}),
      });

      await orderRef.collection("auditLog").add({
        action: "status_updated",
        actorRole,
        actorName,
        previousStatus: oldStatus,
        newStatus,
        timestamp: new Date(),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Status order #${orderId} berhasil diubah: '${oldStatus}' ➔ '${newStatus}' (Aktor: ${actorName}).`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [GOV] list_gov_orders
    // -------------------------------------------------------------------------
    if (toolName === "list_gov_orders") {
      const { additionalRole, status, limit = 20 } = args as unknown as ListGovOrdersArgs;
      let q = db.collection(COLLECTIONS.ORDERS).where("targetRole", "==", "government");

      if (additionalRole) {
        q = q.where("additionalRole", "==", additionalRole);
      }
      if (status) {
        q = q.where("status", "==", status);
      }

      const snap = await q.limit(limit).get();
      const orders = snap.docs.map((doc) => {
        const d = doc.data();
        const isDp3a = d.additionalRole === "gov_dp3a";
        return {
          id: doc.id,
          dinas: d.agencyName || d.additionalRole,
          serviceTitle: d.serviceTitle,
          status: d.status,
          isEmergency: Boolean(d.isEmergency),
          customerName: isDp3a ? "Warga Terlindungi (DP3A)" : maskName(d.customerName),
          customerPhone: isDp3a ? "***" : maskPhone(d.customerPhone),
          createdAt: formatTimestamp(d.createdAt),
          nikSummary: d.citizenDetails?.nikOrRef ? maskNIK(d.citizenDetails.nikOrRef) : undefined,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: orders.length, orders }, null, 2),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [GOV] get_gov_order_detail
    // -------------------------------------------------------------------------
    if (toolName === "get_gov_order_detail") {
      const { orderId, requestorRole } = args as unknown as GetGovOrderDetailArgs;
      const doc = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();

      if (!doc.exists) {
        throw new Error(`Permohonan #${orderId} tidak ditemukan.`);
      }

      const data = doc.data()!;
      const isDp3a = data.additionalRole === "gov_dp3a";

      const sanitized = {
        id: doc.id,
        agencyName: data.agencyName,
        serviceTitle: data.serviceTitle,
        serviceType: data.serviceType,
        status: data.status,
        isEmergency: Boolean(data.isEmergency),
        customerName: isDp3a ? "Warga Terlindungi (DP3A)" : maskName(data.customerName),
        customerPhone: isDp3a ? "***" : maskPhone(data.customerPhone),
        pickupLocation: data.pickupLocation?.address,
        dropoffLocation: data.dropoffLocation?.address,
        citizenDetails: {
          ...data.citizenDetails,
          nikOrRef: data.citizenDetails?.nikOrRef ? maskNIK(data.citizenDetails.nikOrRef) : undefined,
        },
        verifiedBy: data.verifiedByDinasName || null,
        rejectionReason: data.rejectionReason || null,
        createdAt: formatTimestamp(data.createdAt),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(sanitized, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [GOV] verify_gov_order
    // -------------------------------------------------------------------------
    if (toolName === "verify_gov_order") {
      const { orderId, verifiedByName, verifiedByUid } = args as unknown as VerifyGovOrderArgs;
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const snap = await orderRef.get();

      if (!snap.exists) {
        throw new Error(`Permohonan #${orderId} tidak ditemukan.`);
      }

      const currentData = snap.data()!;
      if (currentData.status !== "pending_verification") {
        throw new Error(
          `Permohonan #${orderId} tidak dalam status 'pending_verification' (status saat ini: ${currentData.status}).`
        );
      }

      await orderRef.update({
        status: "pending",
        verifiedByDinasName: verifiedByName,
        verifiedByDinasUid: verifiedByUid || null,
        verifiedByDinasAt: new Date(),
        updatedAt: new Date(),
      });

      await orderRef.collection("auditLog").add({
        action: "verified_by_opd",
        actorName: verifiedByName,
        actorUid: verifiedByUid || null,
        actorRole: "government",
        previousStatus: "pending_verification",
        newStatus: "pending",
        timestamp: new Date(),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Permohonan #${orderId} (${currentData.serviceTitle || "Layanan"}) berhasil diverifikasi oleh ${verifiedByName}. Status diubah menjadi 'pending' untuk penugasan kurir/driver.`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [GOV] reject_gov_order
    // -------------------------------------------------------------------------
    if (toolName === "reject_gov_order") {
      const { orderId, rejectedByName, rejectionReason, rejectedByUid } =
        args as unknown as RejectGovOrderArgs;
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const snap = await orderRef.get();

      if (!snap.exists) {
        throw new Error(`Permohonan #${orderId} tidak ditemukan.`);
      }

      const currentData = snap.data()!;

      await orderRef.update({
        status: "rejected",
        rejectedByDinasName: rejectedByName,
        rejectedByDinasUid: rejectedByUid || null,
        rejectionReason: rejectionReason,
        rejectedByDinasAt: new Date(),
        updatedAt: new Date(),
      });

      await orderRef.collection("auditLog").add({
        action: "rejected_by_opd",
        actorName: rejectedByName,
        actorUid: rejectedByUid || null,
        actorRole: "government",
        previousStatus: currentData.status,
        newStatus: "rejected",
        rejectionReason,
        timestamp: new Date(),
      });

      return {
        content: [
          {
            type: "text",
            text: `🚫 Permohonan #${orderId} telah DITOLAK oleh ${rejectedByName}.\nAlasan: "${rejectionReason}"\nStatus diubah menjadi 'rejected' dan dicatat dalam audit trail.`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [GOV] list_pending_verification
    // -------------------------------------------------------------------------
    if (toolName === "list_pending_verification") {
      const { additionalRole, limit = 20 } = args as unknown as ListPendingVerificationArgs;
      let q = db
        .collection(COLLECTIONS.ORDERS)
        .where("status", "==", "pending_verification");

      if (additionalRole) {
        q = q.where("additionalRole", "==", additionalRole);
      }

      const snap = await q.limit(limit).get();
      const items = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          dinas: d.agencyName || d.additionalRole,
          serviceTitle: d.serviceTitle,
          customer: maskName(d.customerName),
          createdAt: formatTimestamp(d.createdAt),
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                totalWaiting: items.length,
                items,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [GOV] get_gov_stats
    // -------------------------------------------------------------------------
    if (toolName === "get_gov_stats") {
      const { additionalRole } = args as unknown as GetGovStatsArgs;
      let q = db.collection(COLLECTIONS.ORDERS).where("targetRole", "==", "government");

      if (additionalRole) {
        q = q.where("additionalRole", "==", additionalRole);
      }

      const snap = await q.limit(100).get();
      const byStatus: Record<string, number> = {};
      const byAgency: Record<string, number> = {};

      snap.docs.forEach((doc) => {
        const d = doc.data();
        byStatus[d.status] = (byStatus[d.status] || 0) + 1;
        const agency = d.agencyName || d.additionalRole || "Lainnya";
        byAgency[agency] = (byAgency[agency] || 0) + 1;
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                totalCivicOrders: snap.size,
                statusBreakdown: byStatus,
                agencyBreakdown: byAgency,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [DRIVER] get_driver_karcis_status
    // -------------------------------------------------------------------------
    if (toolName === "get_driver_karcis_status") {
      const { driverId } = args as unknown as GetDriverKarcisStatusArgs;
      const snap = await db
        .collection(COLLECTIONS.KARCIS)
        .where("driverId", "==", driverId)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (snap.empty) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Driver #${driverId} TIDAK memiliki Karcis Harian aktif. Driver perlu membeli karcis Rp 5.000 / klaim trial sebelum menerima pesanan.`,
            },
          ],
        };
      }

      const karcis = snap.docs[0].data();
      const exp = karcis.expiresAt?.toDate ? karcis.expiresAt.toDate() : new Date(karcis.expiresAt);
      const now = new Date();
      const isExpired = exp < now;
      const hoursLeft = isExpired ? 0 : Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60));

      if (isExpired) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Karcis Harian Driver #${driverId} telah EXPIRED pada ${formatTimestamp(exp)}.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Karcis Harian AKTIF!\n• Tipe: ${karcis.type || "daily"}\n• Berlaku hingga: ${formatTimestamp(exp)}\n• Sisa waktu: ~${hoursLeft} jam\n• Bebas komisi 100% aktif.`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [DRIVER] get_driver_wallet
    // -------------------------------------------------------------------------
    if (toolName === "get_driver_wallet") {
      const { driverId } = args as unknown as GetDriverWalletArgs;
      const snap = await db.collection(COLLECTIONS.WALLETS).doc(driverId).get();
      const balance = snap.exists ? snap.data()?.balance || 0 : 0;

      return {
        content: [
          {
            type: "text",
            text: `💳 Saldo Dompet Koperasi Driver #${driverId}: Rp ${balance.toLocaleString("id-ID")}`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [DRIVER] list_driver_ledger
    // -------------------------------------------------------------------------
    if (toolName === "list_driver_ledger") {
      const { driverId, limit = 10 } = args as unknown as ListDriverLedgerArgs;
      const snap = await db
        .collection(COLLECTIONS.LEDGER)
        .where("userId", "==", driverId)
        .limit(limit)
        .get();

      const items = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          type: d.type,
          amount: `Rp ${(d.amount || 0).toLocaleString("id-ID")}`,
          category: d.category,
          description: d.description,
          date: formatTimestamp(d.createdAt),
        };
      });

      return {
        content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [DRIVER] list_kyc_requests
    // -------------------------------------------------------------------------
    if (toolName === "list_kyc_requests") {
      const { status = "pending", limit = 20 } = args as unknown as ListKycRequestsArgs;
      const snap = await db
        .collection(COLLECTIONS.USERS)
        .where("role", "==", "driver")
        .where("kycStatus", "==", status)
        .limit(limit)
        .get();

      const requests = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          uid: doc.id,
          name: d.displayName,
          phone: maskPhone(d.phone),
          vehiclePlate: d.vehiclePlate,
          hasKTP: Boolean(d.ktpUrl),
          hasSIM: Boolean(d.simUrl),
          kycStatus: d.kycStatus,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status, count: requests.length, requests }, null, 2),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [DRIVER] verify_driver_kyc
    // -------------------------------------------------------------------------
    if (toolName === "verify_driver_kyc") {
      const { driverUid, approved, notes } = args as unknown as VerifyDriverKycArgs;
      const driverRef = db.collection(COLLECTIONS.USERS).doc(driverUid);

      await driverRef.update({
        kycStatus: approved ? "verified" : "rejected",
        isVerified: approved,
        kycNotes: notes || null,
        kycVerifiedAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        content: [
          {
            type: "text",
            text: approved
              ? `✅ KYC Driver #${driverUid} BERHASIL DISETUJUI. Akun telah aktif dan terverifikasi.`
              : `🚫 KYC Driver #${driverUid} DITOLAK. Catatan: ${notes || "Dokumen tidak sesuai"}.`,
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [DRIVER] get_driver_performance
    // -------------------------------------------------------------------------
    if (toolName === "get_driver_performance") {
      const { driverId } = args as unknown as GetDriverPerformanceArgs;
      const driverDoc = await db.collection(COLLECTIONS.USERS).doc(driverId).get();

      if (!driverDoc.exists) {
        throw new Error(`Driver #${driverId} tidak ditemukan.`);
      }

      const d = driverDoc.data()!;
      const completedOrdersSnap = await db
        .collection(COLLECTIONS.ORDERS)
        .where("driverId", "==", driverId)
        .where("status", "==", "completed")
        .get();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                driverName: d.displayName,
                vehiclePlate: d.vehiclePlate,
                isVerified: Boolean(d.isVerified),
                stampPoints: d.points || 0,
                totalCompletedTrips: completedOrdersSnap.size,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [MERCHANT] list_merchants
    // -------------------------------------------------------------------------
    if (toolName === "list_merchants") {
      const { isVerified, limit = 20 } = args as unknown as ListMerchantsArgs;
      let q = db.collection(COLLECTIONS.USERS).where("role", "==", "merchant");

      if (typeof isVerified === "boolean") {
        q = q.where("isVerified", "==", isVerified);
      }

      const snap = await q.limit(limit).get();
      const merchants = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          storeName: d.storeName || d.businessName || "Warung UMKM",
          ownerName: maskName(d.displayName),
          phone: maskPhone(d.phone),
          isVerified: Boolean(d.isVerified),
          address: d.address || "Surakarta",
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: merchants.length, merchants }, null, 2),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [MERCHANT] list_merchant_orders
    // -------------------------------------------------------------------------
    if (toolName === "list_merchant_orders") {
      const { merchantId, status, limit = 20 } = args as unknown as ListMerchantOrdersArgs;
      let q = db.collection(COLLECTIONS.ORDERS).where("merchantId", "==", merchantId);

      if (status) {
        q = q.where("status", "==", status);
      }

      const snap = await q.limit(limit).get();
      const orders = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          status: d.status,
          items: d.items || [],
          subtotal: d.subtotal || d.price,
          customer: maskName(d.customerName),
          createdAt: formatTimestamp(d.createdAt),
        };
      });

      return {
        content: [{ type: "text", text: JSON.stringify(orders, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [MERCHANT] get_merchant_stats
    // -------------------------------------------------------------------------
    if (toolName === "get_merchant_stats") {
      const { merchantId } = args as unknown as GetMerchantStatsArgs;
      const snap = await db
        .collection(COLLECTIONS.ORDERS)
        .where("merchantId", "==", merchantId)
        .get();

      let totalTurnover = 0;
      let completedCount = 0;

      snap.docs.forEach((doc) => {
        const d = doc.data();
        if (d.status === "completed") {
          completedCount++;
          totalTurnover += d.subtotal || d.price || 0;
        }
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                merchantId,
                totalOrders: snap.size,
                completedOrders: completedCount,
                grossTurnover: `Rp ${totalTurnover.toLocaleString("id-ID")}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // -------------------------------------------------------------------------
    // [ADMIN] get_ecosystem_stats
    // -------------------------------------------------------------------------
    if (toolName === "get_ecosystem_stats") {
      const [
        ordersSnap,
        onlineDriversSnap,
        merchantsSnap,
        pendingGovSnap,
        activeKarcisSnap,
      ] = await Promise.all([
        db.collection(COLLECTIONS.ORDERS).limit(100).get(),
        db.collection(COLLECTIONS.USERS).where("role", "==", "driver").where("isOnline", "==", true).get(),
        db.collection(COLLECTIONS.USERS).where("role", "==", "merchant").get(),
        db.collection(COLLECTIONS.ORDERS).where("status", "==", "pending_verification").get(),
        db.collection(COLLECTIONS.KARCIS).where("status", "==", "active").get(),
      ]);

      const statusMap: Record<string, number> = {};
      ordersSnap.docs.forEach((doc) => {
        const s = doc.data().status || "unknown";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });

      const report = {
        waktuLaporan: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        transportasi: {
          driverOnline: onlineDriversSnap.size,
          karcisAktif: activeKarcisSnap.size,
          pesananPending: statusMap["pending"] || 0,
          pesananAktif: (statusMap["accepted"] || 0) + (statusMap["in_progress"] || 0),
          pesananSelesai: statusMap["completed"] || 0,
        },
        umkm: {
          totalMitraWarung: merchantsSnap.size,
        },
        layananPemerintahan: {
          menungguVerifikasiDinas: pendingGovSnap.size,
        },
      };

      return {
        content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [ADMIN] list_users_by_role
    // -------------------------------------------------------------------------
    if (toolName === "list_users_by_role") {
      const { role, limit = 20 } = args as unknown as ListUsersByRoleArgs;
      const snap = await db
        .collection(COLLECTIONS.USERS)
        .where("role", "==", role)
        .limit(limit)
        .get();

      const users = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          uid: doc.id,
          name: maskName(d.displayName),
          email: maskEmail(d.email),
          role: d.role,
          additionalRole: d.additionalRole || null,
          isVerified: Boolean(d.isVerified),
          createdAt: formatTimestamp(d.createdAt),
        };
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ role, count: users.length, users }, null, 2) }],
      };
    }

    // -------------------------------------------------------------------------
    // [ADMIN] get_user_detail
    // -------------------------------------------------------------------------
    if (toolName === "get_user_detail") {
      const { uid } = args as unknown as GetUserDetailArgs;
      const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();

      if (!doc.exists) {
        throw new Error(`User #${uid} tidak ditemukan.`);
      }

      const d = doc.data()!;
      const safeData = {
        uid: doc.id,
        name: maskName(d.displayName),
        email: maskEmail(d.email),
        phone: maskPhone(d.phone),
        role: d.role,
        additionalRole: d.additionalRole || null,
        isVerified: Boolean(d.isVerified),
        kycStatus: d.kycStatus || "unverified",
        points: d.points || 0,
        createdAt: formatTimestamp(d.createdAt),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(safeData, null, 2) }],
      };
    }

    throw new Error(`Tool '${toolName}' tidak dikenali.`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error mengeksekusi '${toolName}': ${errorMsg}`,
        },
      ],
      isError: true,
    };
  }
});

// -----------------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Ride-Solo MCP Server 2.0 running on stdio (Hermes Agent Connected)");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
