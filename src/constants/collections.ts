export const COLLECTIONS = {
  // Core Collections
  USERS: "users",
  ORDERS: "orders",
  DRIVERS: "drivers",
  KARCIS: "karcis",
  MERCHANTS: "merchants",
  FORUM: "forum",
  WALLETS: "wallets",
  LEDGER: "ledger",

  // Integrated Ecosystem
  MENU_ITEMS: "menu_items",
  NOTIFICATIONS: "notifications",
  BROADCASTS: "broadcasts",
  CONTRACTS: "contracts",
  REVIEWS: "reviews",
  STAMPS: "stamps",
  KYC_REQUESTS: "kyc_requests"
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;
