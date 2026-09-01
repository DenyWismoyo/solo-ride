export interface AssignOrderArgs {
  orderId: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
}

export interface ListOnlineDriversArgs {
  limit?: number;
}

export interface GetOrderDetailArgs {
  orderId: string;
}

export interface GetOrdersByStatusArgs {
  status: string;
  limit?: number;
}

export interface GetRecentOrdersArgs {
  limit?: number;
  serviceType?: string;
}

export interface UpdateOrderStatusArgs {
  orderId: string;
  newStatus: string;
  actorRole?: string;
  actorName?: string;
}

export interface ListGovOrdersArgs {
  additionalRole?: string;
  status?: string;
  limit?: number;
}

export interface GetGovOrderDetailArgs {
  orderId: string;
  requestorRole?: string;
}

export interface VerifyGovOrderArgs {
  orderId: string;
  verifiedByName: string;
  verifiedByUid?: string;
}

export interface RejectGovOrderArgs {
  orderId: string;
  rejectedByName: string;
  rejectedByUid?: string;
  rejectionReason: string;
}

export interface ListPendingVerificationArgs {
  additionalRole?: string;
  limit?: number;
}

export interface GetGovStatsArgs {
  additionalRole?: string;
}

export interface GetDriverKarcisStatusArgs {
  driverId: string;
}

export interface GetDriverWalletArgs {
  driverId: string;
}

export interface ListDriverLedgerArgs {
  driverId: string;
  limit?: number;
}

export interface ListKycRequestsArgs {
  status?: "pending" | "verified" | "rejected" | "unverified";
  limit?: number;
}

export interface VerifyDriverKycArgs {
  driverUid: string;
  approved: boolean;
  notes?: string;
}

export interface GetDriverPerformanceArgs {
  driverId: string;
}

export interface ListMerchantsArgs {
  isVerified?: boolean;
  limit?: number;
}

export interface ListMerchantOrdersArgs {
  merchantId: string;
  status?: string;
  limit?: number;
}

export interface GetMerchantStatsArgs {
  merchantId: string;
}

export interface GetEcosystemStatsArgs {
  periodDays?: number;
}

export interface ListUsersByRoleArgs {
  role: "customer" | "driver" | "merchant" | "government" | "industry" | "admin";
  limit?: number;
}

export interface GetUserDetailArgs {
  uid: string;
}
