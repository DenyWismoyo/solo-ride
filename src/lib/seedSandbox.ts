import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "@/constants/collections";
import { SANDBOX_PERSONAS } from "@/types/sandbox.types";

export async function seedEcosystemSandbox(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    let operationCount = 0;

    // 1. SEED ALL 12 PERSONAS (Users Collection)
    // -------------------------------------------------------------
    for (const persona of SANDBOX_PERSONAS) {
      await setDoc(doc(db, COLLECTIONS.USERS, persona.id), {
        uid: persona.id,
        email: `${persona.id}@ridesolo.id`,
        displayName: persona.name,
        role: persona.role,
        additionalRole: persona.additionalRole || null,
        isVerified: true,
        ...persona.attributes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      operationCount++;
    }

    // 2. SEED DRIVER WALLET & ACTIVE KARCIS
    // -------------------------------------------------------------
    await setDoc(doc(db, COLLECTIONS.WALLETS, "sandbox-driver-solo"), {
      userId: "sandbox-driver-solo",
      balance: 150000,
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    // 24-Hour Active Karcis for Driver
    const expiry24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await setDoc(doc(db, COLLECTIONS.KARCIS, "karcis-sandbox-driver-solo"), {
      userId: "sandbox-driver-solo",
      purchasedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiry24h),
      fee: 5000,
      isFreeTrial: false,
      status: "active"
    }, { merge: true });
    operationCount++;

    // 3. SEED MERCHANT WALLETS
    // -------------------------------------------------------------
    await setDoc(doc(db, COLLECTIONS.WALLETS, "sandbox-merchant-manto"), {
      userId: "sandbox-merchant-manto",
      balance: 780000,
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    await setDoc(doc(db, COLLECTIONS.WALLETS, "sandbox-merchant-pasar"), {
      userId: "sandbox-merchant-pasar",
      balance: 420000,
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    // 4. SEED MENU ITEMS FOR PAK MANTO & PASAR GEDE
    // -------------------------------------------------------------
    const sampleMenus = [
      // Pak Manto
      {
        id: "menu-manto-1",
        merchantId: "sandbox-merchant-manto",
        name: "Tengkleng Rica-Rica Spesial Pak Manto",
        description: "Olahan tulang sumsum kambing dengan bumbu rica pedas manis khas legendaris Solo.",
        price: 65000,
        category: "makanan",
        isAvailable: true,
        soldToday: 34
      },
      {
        id: "menu-manto-2",
        merchantId: "sandbox-merchant-manto",
        name: "Sate Buntel Kambing Muda (2 Tusuk Besar)",
        description: "Daging kambing cincang dibungkus lemak tipis, dibakar dengan kecap manis Solo.",
        price: 60000,
        category: "makanan",
        isAvailable: true,
        soldToday: 28
      },
      {
        id: "menu-manto-3",
        merchantId: "sandbox-merchant-manto",
        name: "Tongseng Kambing Kuah Santan Gurih",
        description: "Potongan daging empuk disiram kuah gulai kental dengan kubis segar dan irisan tomat.",
        price: 45000,
        category: "makanan",
        isAvailable: true,
        soldToday: 19
      },
      {
        id: "menu-manto-4",
        merchantId: "sandbox-merchant-manto",
        name: "Es Beras Kencur & Es Teh Solo Segar",
        description: "Minuman herbal pereda lelah dan teh melati wangi khas Solo.",
        price: 8000,
        category: "minuman",
        isAvailable: true,
        soldToday: 42
      },
      // Pasar Gede Mbok Darmi
      {
        id: "menu-pasar-1",
        merchantId: "sandbox-merchant-pasar",
        name: "Paket Sayur Asem & Lodeh Segar Komplit",
        description: "Sayuran panen subuh dataran tinggi Merbabu lengkap dengan bumbu dapur siap masak.",
        price: 15000,
        category: "sayuran",
        isAvailable: true,
        soldToday: 56
      },
      {
        id: "menu-pasar-2",
        merchantId: "sandbox-merchant-pasar",
        name: "Beras Delanggu Raja Lele Wangi (5 Kg)",
        description: "Beras pulen alami tanpa pemutih langsung dari petani Klaten/Solo.",
        price: 72000,
        category: "sembako",
        isAvailable: true,
        soldToday: 23
      }
    ];

    for (const menu of sampleMenus) {
      await setDoc(doc(db, COLLECTIONS.MENU_ITEMS, menu.id), {
        ...menu,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      operationCount++;
    }

    // 5. SEED CIVIC BROADCASTS FROM DINAS PEMKOT SOLO
    // -------------------------------------------------------------
    await setDoc(doc(db, COLLECTIONS.BROADCASTS, "broadcast-solo-cfd"), {
      title: "Car Free Day (CFD) Jl. Slamet Riyadi Solo — Rekayasa Shelter Mitra",
      body: "Setiap hari Minggu pukul 06.00-09.00 WIB, Jl. Slamet Riyadi steril kendaraan bermotor. Titik penjemputan mitra dialihkan ke koridor Jl. Gajah Mada & Jl. Bhayangkara.",
      author: "Dinas Perhubungan Kota Surakarta",
      targetRoles: ["driver", "customer", "merchant"],
      priority: "high",
      createdAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    await setDoc(doc(db, COLLECTIONS.BROADCASTS, "broadcast-koperasi-subsidi"), {
      title: "Program Subsidi Karcis Harian & SHU Koperasi Mitra Surakarta 2026",
      body: "Pemkot Surakarta bekerjasama dengan Koperasi Ojek Solo memberikan cashback 20% bagi driver yang mengumpulkan stamp UMKM di pasar tradisional.",
      author: "Dinas Koperasi & UKM Kota Surakarta",
      targetRoles: ["driver", "merchant"],
      priority: "normal",
      createdAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    await setDoc(doc(db, COLLECTIONS.BROADCASTS, "broadcast-dispar-heritage"), {
      title: "Solo Great Sale 2026 — Diskon Belanja di 50+ UMKM Mitra",
      body: "Nikmati potongan belanja kuliner dan batik khas Solo di seluruh merchant mitra Ride-Solo yang bertanda stiker resmi Dinas Pariwisata.",
      author: "Dinas Kebudayaan & Pariwisata Kota Surakarta",
      targetRoles: ["customer", "merchant"],
      priority: "high",
      createdAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    // 6. SEED B2B INDUSTRY CONTRACTS
    // -------------------------------------------------------------
    await setDoc(doc(db, COLLECTIONS.CONTRACTS, "contract-sritex-solo"), {
      industryId: "sandbox-industry-solo",
      companyName: "PT Bengawan Kargo Logistik",
      title: "Distribusi Bahan Baku Kain Tekstil (Solo - Semarang)",
      description: "Kargo muatan kain katun 1.200 kg rute Pabrik Palur ke Pelabuhan Tanjung Emas.",
      origin: "Kawasan Industri Palur, Surakarta",
      destination: "Pelabuhan Tanjung Emas, Semarang",
      value: 4500000,
      totalValue: 4500000,
      vehicleCount: 2,
      cargoWeightKg: 1200,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    await setDoc(doc(db, COLLECTIONS.CONTRACTS, "contract-klinik-medika"), {
      industryId: "sandbox-ind-klinik",
      companyName: "Klinik Medika Pratama Solo",
      title: "Pengantaran Sampel Lab & E-Resep Pasien Kronis",
      description: "Pengiriman spesimen darah coolbox suhu 2-8°C rute 5 faskes se-Solo.",
      origin: "Klinik Pratama Solo",
      destination: "RSUD Dr. Moewardi & Lab Darah",
      value: 1800000,
      totalValue: 1800000,
      vehicleCount: 2,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    // 7. SEED REALISTIC ORDERS IN SURAKARTA
    // -------------------------------------------------------------
    await setDoc(doc(db, COLLECTIONS.ORDERS, "order-demo-ride-1"), {
      customerId: "sandbox-customer-solo",
      customerName: "Danu Setyawan",
      serviceType: "ojek",
      price: 15000,
      status: "pending",
      pickupLocation: {
        lat: -7.5583,
        lng: 110.8219,
        address: "Stasiun Solo Balapan, Jl. Wolter Monginsidi, Kestalan"
      },
      dropoffLocation: {
        lat: -7.5621,
        lng: 110.8547,
        address: "Universitas Sebelas Maret (UNS), Jl. Ir. Sutami No. 36, Jebres"
      },
      distanceKm: 4.8,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    await setDoc(doc(db, COLLECTIONS.ORDERS, "order-demo-kuliner-1"), {
      customerId: "sandbox-customer-solo",
      customerName: "Danu Setyawan",
      serviceType: "kuliner",
      price: 73000,
      status: "pending",
      merchantId: "sandbox-merchant-manto",
      merchantName: "Sate Kambing Pak Manto",
      items: [
        { id: "menu-manto-1", name: "Tengkleng Rica-Rica Spesial", price: 65000, qty: 1 },
        { id: "menu-manto-4", name: "Es Teh Solo Segar", price: 8000, qty: 1 }
      ],
      pickupLocation: {
        lat: -7.5701,
        lng: 110.8142,
        address: "Sate Kambing Pak Manto, Jl. Honggowongso No. 36, Sriwedari"
      },
      dropoffLocation: {
        lat: -7.5521,
        lng: 110.8351,
        address: "Perumahan Manahan Regency, Jl. Bone, Manahan, Banjarsari"
      },
      customerNote: "Tengkleng minta kuah pedas sedang ya mas 🙏",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    operationCount++;

    return {
      success: true,
      count: operationCount,
      message: `Berhasil menginisialisasi ${operationCount} dokumen Sandbox Ekosistem Surakarta (12 Persona Multi-Dinas & B2B, Menu Pak Manto & Pasar Gede, Kontrak Kargo & Klinik, serta Siaran Pemkot Solo)!`
    };
  } catch (error: any) {
    console.error("Gagal seed sandbox ekosistem:", error);
    throw new Error(`Gagal seeding sandbox: ${error.message || error}`);
  }
}
