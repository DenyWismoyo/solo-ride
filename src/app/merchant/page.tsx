"use client";

import React from "react";
import { useMerchantContext } from "@/components/merchant/layout/MerchantContext";
import { KitchenOrderStream } from "@/components/merchant/kitchen/KitchenOrderStream";
import { ProductCatalogManager } from "@/components/merchant/catalog/ProductCatalogManager";
import { VoucherScannerModal } from "@/components/merchant/voucher/VoucherScannerModal";
import { MerchantFinancialSummary } from "@/components/merchant/finance/MerchantFinancialSummary";

export default function MerchantDashboardPage() {
  const { activeTab } = useMerchantContext();

  return (
    <div className="w-full space-y-6">
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
