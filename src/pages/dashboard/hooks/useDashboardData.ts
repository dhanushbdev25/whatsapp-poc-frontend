import { useEffect, useState } from "react";
import { DashboardDataState } from "../types/dashboard.types";

export function useDashboardData(): DashboardDataState {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardDataState["stats"]>(null);
  const [salesData, setSalesData] = useState<DashboardDataState["salesData"]>([]);
  const [topCustomers, setTopCustomers] = useState<DashboardDataState["topCustomers"]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Example API responses
      setStats({
        totalCustomers: 1200,
        totalSales: 550000,
        activeUsers: 985
      });

      setSalesData([
        { label: "Jan", value: 150 },
        { label: "Feb", value: 210 },
        { label: "Mar", value: 300 }
      ]);

      setTopCustomers([
        { customerId: "1", name: "Varsha", orders: 12, totalSpent: 14200 },
        { customerId: "2", name: "Prakash", orders: 8, totalSpent: 9850 }
      ]);

      setLoading(false);
    }

    load();
  }, []);

  return { loading, stats, salesData, topCustomers };
}
