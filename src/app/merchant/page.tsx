"use client";

import React from "react";
import { useMerchantContext } from "@/components/merchant/layout/MerchantContext";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { CivicBroadcastBanner } from "@/components/civic/broadcast/CivicBroadcastBanner";
import { KitchenOrderStream } from "@/components/merchant/kitchen/KitchenOrderStream";
import { ProductCatalogManager } from "@/components/merchant/catalog/ProductCatalogManager";
import { VoucherScannerModal } from "@/components/merchant/voucher/VoucherScannerModal";
import { MerchantFinancialSummary } from "@/components/merchant/finance/MerchantFinancialSummary";

export default function MerchantDashboardPage() {
  const { activeTab } = useMerchantContext();
  const { broadcasts } = useBroadcasts("merchant");

  return (
    <div className="w-full space-y-5">
      {/* Official Civic Broadcast Alert for Merchants & Pasar */}
      {broadcasts.length > 0 && (
        <CivicBroadcastBanner broadcasts={broadcasts} role="merchant" />
      )}

      {/* 1. KITCHEN / POS ORDER STREAM */}
      {activeTab === "kitchen" && <KitchenOrderStream />}

      {/* 2. CATALOG & MENU MANAGEMENT */}
      {activeTab === "catalog" && <ProductCatalogManager />}

      {/* 3. VOUCHER PANGAN & BANSOS DINSOS SCANNER */}
      {activeTab === "voucher" && <VoucherScannerModal />}

      {/* 4. FINANCIAL SUMMARY & REVENUE REPORT */}
      {activeTab === "finance" && <MerchantFinancialSummary />}
    </div>
  );
}
