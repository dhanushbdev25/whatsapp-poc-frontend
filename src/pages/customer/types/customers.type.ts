export interface NotificationPreferences {
  id: string;
  customerID: string;
  orderUpdates: boolean;
  loyaltyRewards: boolean;
  promotionalMessages: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAccount {
  id: string;
  customerID: string;
  points_balance: number;
  points_redeemed: number;
  lifetime_points: number;
  last_transaction_at: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrder {
  id: string;
  customerID: string;
  orderNo: string;
  orderName?: string;
  orderCreatedAt: string;
  status: "inprogress" | "completed" | string;
  trackingNo?: string;
  paymentType?: string;
  shipToAddress?: string;
  shipToAddressCoord?: {
    lat: number;
    lng: number;
  } | null;
  carrier?: string | null;
  metadata?: unknown;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  loyaltyTransactions: any;
  id: string;
  customerID: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  pincode: string;
  gender: string;
  createdBy: string;
  updatedBy: string;
  latestActive: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  notificationPreferences?: NotificationPreferences;
  loyaltyAccounts?: LoyaltyAccount;
  orders: CustomerOrder[];
  customerGroupMembers: unknown[];
}

export interface CustomerResponse {
  success: boolean;
  timestamp: string;
  data: Customer;
  message: string;
}
