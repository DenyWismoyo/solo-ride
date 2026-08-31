"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Sparkles, 
  MapPin, 
  Plus, 
  Megaphone, 
  CheckCircle2, 
  Compass, 
  Bike, 
  Eye,
  Camera,
  Users,
  Loader2
} from "lucide-react";

import { OrderDocument } from "@/types/order.types";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovDisparWorkspaceProps {
  orders?: OrderDocument[];
  loading?: boolean;
}

export function GovDisparWorkspace({ orders = [], loading = false }: GovDisparWorkspaceProps) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"orders" | "events" | "shelters">("orders");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const pendingVerificationOrders = orders.filter(o => o.status === "pending_verification");
  const inProgressOrders = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");

  const handleApproveTourRequest = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Permohonan Wisata / Pemandu Disetujui! Order diteruskan ke Radar Driver Mitra Ramah Wisata.");
    } catch (err: any) {
      alert(`Gagal memproses: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };
  const [events, setEvents] = useState([
    {
      id: "evt-1",
      title: "Kirab Pusaka Malam 1 Suro 1958 Jawa",
      date: "19 Juli 2026",
      location: "Keraton Kasunanan Surakarta",
      status: "Live & Terjadwal",
      attendees: "45.000 Wisatawan"
    },
    {
      id: "evt-2",
      title: "Solo Batik Carnival XV: Mahakarya Bumi Solo",
      date: "15 Agustus 2026",
      location: "Jl. Slamet Riyadi (Stadion Sriwedari - Balaikota)",
      status: "Persiapan Rundown",
      attendees: "30.000 Wisatawan"
    },
    {
      id: "evt-3",
      title: "Solo Great Sale (Diskon Serentak Se-Kota Solo)",
      date: "1 - 31 Oktober 2026",
      location: "Seluruh Pasar Tradisional & Mall Solo",
      status: "Registrasi Merchant",
      attendees: "120.000 Transaksi"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setEvents([
      ...events,
      {
        id: `evt-${Date.now()}`,
        title: newTitle,
        date: newDate,
        location: newLocation || "Kota Surakarta",
        status: "Live Terpublikasi",
        attendees: "Est. 10.000 Warga"
      }
    ]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDate("");
    setNewLocation("");
    alert("✅ Agenda Budaya Berhasil Ditambahkan ke Kalender Pariwisata Resmi!");
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Agenda Budaya 2026</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{events.length} Event</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Shelter Ojek Heritage</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">4 Shelter</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Wisatawan Heritage</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">1.450 / Bulan</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Rute Paling Diminati</span>
          <div className="text-xs font-black text-purple-600 dark:text-purple-400 mt-1 truncate">Dua Istana Mataram</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl">
        <button
          onClick={() => setActiveWorkspaceTab("orders")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeWorkspaceTab === "orders"
              ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Antrean Paket Wisata & Guide ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveWorkspaceTab("events")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeWorkspaceTab === "events"
              ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Kalender Budaya ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveWorkspaceTab("shelters")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeWorkspaceTab === "shelters"
              ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Shelter Wisata</span>
        </button>
      </div>

      {/* TAB 1: ORDERS / BOOKING QUEUE */}
      {activeWorkspaceTab === "orders" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memeriksa permohonan wisata...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Belum ada permohonan paket wisata atau booking pemandu baru dari warga/wisatawan.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.serviceTitle || "Paket Wisata Solo"}
                      </span>
                      <Badge variant={order.status === "pending_verification" ? "rose" : "emerald"} size="sm">
                        {order.status === "pending_verification" ? "Perlu Verifikasi Dinas" : "Telah Disetujui"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Wisatawan: <strong>{order.customerName}</strong> • {order.customerPhone}
                    </p>
                  </div>

                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    Rp {(order.price || 0).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Titik Jemput Wisatawan:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.pickupLocation.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Tujuan Destinasi:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.dropoffLocation.address}</span>
                  </div>
                  {order.citizenDetails?.notes && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">Catatan Khusus:</span>
                      <span className="text-slate-800 dark:text-zinc-200">{order.citizenDetails.notes}</span>
                    </div>
                  )}
                </div>

                {order.status === "pending_verification" && (
                  <Button
                    size="sm"
                    onClick={() => order.id && handleApproveTourRequest(order.id)}
                    disabled={dispatchingId === order.id}
                    className="w-full h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {dispatchingId === order.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menugaskan Driver Pemandu...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Konfirmasi Booking & Dispatch ke Driver Ramah Wisata
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: EVENT MANAGEMENT SECTION */}
      {activeWorkspaceTab === "events" && (
      <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Kalender Agenda Budaya & Promosi Wisata Solo
            </h3>
          </div>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Event
          </Button>
        </div>

        <div className="space-y-2.5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{evt.date} • {evt.location}</p>
                </div>
                <Badge variant="amber" size="sm">{evt.status}</Badge>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700 text-[10px] text-slate-500">
                <span>Target Partisipasi: <strong>{evt.attendees}</strong></span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">Terhubung ke Aplikasi Warga</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* TAB 3: HERITAGE SHELTER STATUS */}
      {activeWorkspaceTab === "shelters" && (
      <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1">
          Posko & Shelter Ojek Ramah Wisata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Keraton Kasunanan Solo</span>
              <span className="text-[10px] text-slate-500">12 Driver Standby • Siap Antar Tur</span>
            </div>
            <Badge variant="emerald" size="sm">AKTIF</Badge>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Pura Mangkunegaran</span>
              <span className="text-[10px] text-slate-500">8 Driver Standby • Akses Pamedan</span>
            </div>
            <Badge variant="emerald" size="sm">AKTIF</Badge>
          </div>
        </div>
      </div>
      )}

      {/* MODAL ADD EVENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Agenda Budaya Baru</h3>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">Nama Festival / Kirab</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Festival Payung Indonesia 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">Tanggal Pelaksanaan</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="Contoh: 20 - 22 November 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">Lokasi Destinasi</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Contoh: Taman Balekambang Surakarta"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="flex-1 h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
                  Simpan & Publikasikan
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 text-xs rounded-xl">
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
