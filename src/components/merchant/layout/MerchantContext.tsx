"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { useMerchant } from "@/hooks/useMerchant";
import { useMerchantOrders } from "@/hooks/useMerchantOrders";
import { merchantService, MerchantProfile, ProductItem } from "@/services/merchant.service";
import { OrderDocument } from "@/types/order.types";
import { playOrderAlertSound, playSuccessChime } from "@/lib/sound";

export type MerchantTab = "kitchen" | "catalog" | "voucher" | "finance";

interface MerchantContextType {
  merchant: MerchantProfile | null;
  products: ProductItem[];
  orders: OrderDocument[];
  activeTab: MerchantTab;
  setActiveTab: (tab: MerchantTab) => void;
  loading: boolean;
  isStoreOpen: boolean;
  toggleStoreStatus: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: any, reason?: string) => Promise<void>;
  saveProduct: (product: Partial<ProductItem>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  readyOrdersCount: number;
  activeOwnerUid: string | null;
}

const MerchantContext = createContext<MerchantContextType | null>(null);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const { user, userData, effectiveUid } = useAuthContext();
  const activeOwnerUid = effectiveUid || user?.uid || null;

  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MerchantTab>("kitchen");

  // Load merchant profile
  useEffect(() => {
    if (activeOwnerUid) {
      merchantService.getMerchantProfileByOwner(activeOwnerUid).then((profile) => {
        if (profile) {
          setMerchantId(profile.id);
        } else if (activeOwnerUid.includes("merchant")) {
          setMerchantId(activeOwnerUid);
        }
      });
    }
  }, [activeOwnerUid]);

  const { merchant, products, loading: merchantLoading } = useMerchant(merchantId || undefined);
  const { orders, loading: ordersLoading } = useMerchantOrders(merchantId || undefined);

  // Audio alerts on new pending orders
  const pendingOrders = useMemo(() => orders.filter(o => o.status === "pending_merchant"), [orders]);
  const preparingOrders = useMemo(() => orders.filter(o => o.status === "preparing"), [orders]);
  const readyOrders = useMemo(() => orders.filter(o => o.status === "ready_for_pickup"), [orders]);

  useEffect(() => {
    if (pendingOrders.length > 0) {
      try {
        playOrderAlertSound();
      } catch (e) {
        // Audio policy ignore
      }
    }
  }, [pendingOrders.length]);

  const isStoreOpen = merchant?.isOpen ?? true;

  const toggleStoreStatus = useCallback(async () => {
    if (!merchantId) return;
    try {
      await merchantService.toggleStoreStatus(merchantId, !isStoreOpen);
    } catch (err) {
      console.error("Gagal mengubah status toko:", err);
    }
  }, [merchantId, isStoreOpen]);

  const updateOrderStatus = useCallback(async (orderId: string, status: any, reason?: string) => {
    if (!activeOwnerUid) return;
    try {
      await merchantService.updateMerchantOrderStatus(
        orderId,
        status,
        activeOwnerUid,
        "merchant",
        merchant?.name || userData?.displayName || "Merchant",
        reason
      );
      playSuccessChime();
    } catch (err: any) {
      throw new Error(err.message || "Gagal memperbarui status pesanan");
    }
  }, [activeOwnerUid, merchant?.name, userData?.displayName]);

  const saveProduct = useCallback(async (product: Partial<ProductItem>) => {
    if (!merchantId) return;
    const targetProduct: ProductItem = {
      id: product.id || `prod_${Date.now()}`,
      merchantId: merchantId,
      name: product.name || "Menu Baru",
      description: product.description || "",
      price: product.price || 0,
      category: product.category || "Makanan",
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
    };
    await merchantService.saveProduct(targetProduct);
  }, [merchantId]);

  const deleteProduct = useCallback(async (productId: string) => {
    await merchantService.deleteProduct(productId);
  }, []);

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        products,
        orders,
        activeTab,
        setActiveTab,
        loading: merchantLoading || ordersLoading,
        isStoreOpen,
        toggleStoreStatus,
        updateOrderStatus,
        saveProduct,
        deleteProduct,
        pendingOrdersCount: pendingOrders.length,
        preparingOrdersCount: preparingOrders.length,
        readyOrdersCount: readyOrders.length,
        activeOwnerUid
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchantContext() {
  const ctx = useContext(MerchantContext);
  if (!ctx) {
    throw new Error("useMerchantContext must be used within a MerchantProvider");
  }
  return ctx;
}
