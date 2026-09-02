"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Clock, FileCheck, Layers, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function GovAuditTab() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchAudit() {
      try {
        const q = query(
          collection(db, "audit_logs"),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);
        const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAuditLogs(logs);
      } catch (err) {
        console.warn("Audit logs query fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, []);

  const filteredLogs = auditLogs.filter(log => 
    !searchQuery.trim() ||
    log.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="sg-bento-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.04] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Buku Log Audit Pemerintahan (Immutable Audit Trail)
            </h3>
            <p className="text-xs text-slate-400">
              Rekaman mutasi status layanan publik yang terenkripsi dan tidak dapat diubah
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, nama petugas, aksi..."
            className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Memuat rekam jejak audit...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Belum ada rekaman log audit yang cocok dengan filter pencarian.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm" className="font-mono text-[9px]">
                    {log.action}
                  </Badge>
                  <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                    {log.orderId}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    oleh <strong>{log.actorName || "Petugas Dinas"}</strong> ({log.actorRole || "Petugas"})
                  </span>
                </div>
                {log.notes && (
                  <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                    {log.notes}
                  </p>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                <span>Tercatat</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
