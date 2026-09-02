"use client";

import React, { useState } from "react";
import { PackageCheck, Clock, MapPin, Truck, CheckCircle2, Loader2, Inbox, QrCode, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDocument } from "@/types/order.types";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { ManifestQrModal } from "./ManifestQrModal";

interface IndustryOrdersStreamProps {
  orders: OrderDocument[];
  loading: boolean;
  activeSector: SectorDefinition;
  onDispatchOrder: (orderId: string) => Promise<void>;
  dispatchingId: string | null;
}

export function IndustryOrdersStream({
  orders,
  loading,
  activeSector,
  onDispatchOrder,
  dispatchingId
}: IndustryOrdersStreamProps) {
  const [manifestOrder, setManifestOrder] = useState<OrderDocument | null>(null);

  return (
    <div className="p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            Permintaan Masuk: {activeSector.name}
          </h3>
        </div>
        <Badge variant="teal" size="sm" className="font-bold">
          {orders.length} Berkas
        </Badge>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Memuat berkas permintaan B2B...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-2">
          <Inbox className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p>Belum ada permohonan logistik masuk untuk sektor ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isPendingVerification = order.status === "pending_verification";
            const isDispatching = dispatchingId === order.id;

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {order.serviceTitle || "Layanan B2B"}
                      </span>
                      <Badge
                        variant={order.status === "pending_verification" ? "amber" : order.status === "completed" ? "emerald" : "blue"}
                        size="sm"
                        className="text-[9px] font-bold"
                      >
                        {order.status === "pending_verification" ? "Menunggu Konfirmasi" : order.status === "completed" ? "Selesai" : "Sedang Berjalan"}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: #{order.id?.slice(0, 8).toUpperCase()} | Pemohon: {order.customerName}
                    </span>
                  </div>

                  <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                    {order.price === 0 ? "Subsidi" : `Rp ${order.price?.toLocaleString("id-ID")}`}
                  </span>
                </div>

                {order.dropoffLocation && (
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{order.dropoffLocation.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setManifestOrder(order)}
                    className="h-8 rounded-xl text-[11px] font-bold gap-1 cursor-pointer border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <QrCode className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Surat Jalan QR</span>
                  </Button>

                  {isPendingVerification && (
                    <Button
                      size="sm"
                      onClick={() => onDispatchOrder(order.id!)}
                      disabled={isDispatching}
                      className="flex-1 h-8 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isDispatching ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Truck className="h-3.5 w-3.5" />
                      )}
                      <span>Dispatch Armada B2B</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manifest QR Code Modal */}
      <ManifestQrModal
        isOpen={!!manifestOrder}
        onClose={() => setManifestOrder(null)}
        order={manifestOrder}
        sectorName={activeSector.name}
      />
    </div>
  );
}
