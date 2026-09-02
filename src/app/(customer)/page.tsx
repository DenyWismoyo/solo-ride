"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { authService } from "@/services/auth.service";
import { AnimatePresence } from "motion/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { SavedAddressesModal } from "@/components/profile/SavedAddressesModal";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { HistoryDetailReceiptModal } from "@/components/history/HistoryDetailReceiptModal";
import { HomeExploreTab } from "@/components/home/HomeExploreTab";
import { HomeActivityTab } from "@/components/home/HomeActivityTab";
import { HomeRewardsTab } from "@/components/home/HomeRewardsTab";
import { HomeProfileTab } from "@/components/home/HomeProfileTab";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";
import { AppService } from "@/constants/services";
import { Merchant } from "@/types/merchant.types";
import { Loader2 } from "lucide-react";

export default function CustomerHome() {
  const router = useRouter();
  const { user, userData, loading, setImpersonatedRole } = useAuthContext();
  const [activeTab, setActiveTab] = useState("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<OrderDocument | null>(null);

  // Real-time broadcasts for customers
  const { broadcasts } = useBroadcasts("customer");

  // Customer recent/active orders
  const [customerOrders, setCustomerOrders] = useState<OrderDocument[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("customerId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() } as OrderDocument));
      
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setCustomerOrders(docs);
    });
    return () => unsub();
  }, [user]);

  const handleSelectService = (service: AppService) => {
    router.push(`/services/${service.id}`);
  };

  const handleOpenMerchant = (merchant: Merchant) => {
    router.push(`/services/food`);
  };

  const handleLogout = async () => {
    await authService.logout();
    setImpersonatedRole(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#030712] text-emerald-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const userPoints = (userData as any)?.points || 120;

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-24 transition-colors duration-200">
      {/* Impersonation Bar if Active */}
      <AdminImpersonationBar />

      {/* Top App Header */}
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Tab Switcher */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Super-App Home Explore */}
        {activeTab === "home" && (
          <HomeExploreTab
            broadcasts={broadcasts}
            onOpenRewards={() => setActiveTab("rewards")}
            onSelectService={handleSelectService}
            onSelectMerchant={handleOpenMerchant}
          />
        )}

        {/* Tab 2: Orders Activity Feed */}
        {activeTab === "orders" && (
          <HomeActivityTab
            customerOrders={customerOrders}
            onSelectOrderReceipt={setSelectedOrderForReceipt}
          />
        )}

        {/* Tab 3: Rewards & Poin UMKM */}
        {activeTab === "rewards" && (
          <HomeRewardsTab userPoints={userPoints} />
        )}

        {/* Tab 4: Profile & Settings */}
        {activeTab === "profile" && (
          <HomeProfileTab
            user={user}
            userData={userData}
            onOpenAddressesModal={() => setIsAddressesModalOpen(true)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav */}
      <BottomNav
        role="customer"
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "profile") {
            setIsProfileOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* Saved Addresses Modal */}
      <SavedAddressesModal
        isOpen={isAddressesModalOpen}
        onClose={() => setIsAddressesModalOpen(false)}
      />

      {/* History Detail Digital Receipt Modal */}
      <HistoryDetailReceiptModal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
        currentRole="customer"
      />
    </div>
  );
}
