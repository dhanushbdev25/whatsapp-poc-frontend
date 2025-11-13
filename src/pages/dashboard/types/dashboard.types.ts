export interface DashboardStats {
  totalCustomers: number;
  totalSales: number;
  activeUsers: number;
  newCustomersThisMonth?: number; // optional example
}
export interface SalesChartPoint {
  label: string;   // e.g., "Jan" or "Week 1" or "Today"
  value: number;   // numeric metric
}

export interface TopCustomer {
  customerId: string;
  name: string;
  orders: number;
  totalSpent: number; // store as number, format later as ₹ or $
}

export interface DashboardDataState {
  loading: boolean;
  stats: DashboardStats | null;
  salesData: SalesChartPoint[];
  topCustomers: TopCustomer[];
}
