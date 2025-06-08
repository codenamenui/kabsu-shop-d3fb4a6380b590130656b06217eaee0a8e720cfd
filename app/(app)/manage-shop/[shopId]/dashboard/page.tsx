"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAdminDashboardData } from "./data";
import { BarChartComponent } from "@/components/bar-chart";
import { PieChartComponent } from "@/components/pie-chart";
import { createClient } from "@/supabase/clients/createClient";

// Type definitions
interface ShopOverview {
  id: number;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface OrderStatus {
  status: string;
  count: number;
  totalRevenue: number;
}

interface TopSellingMerchandise {
  order_id: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface CollegeOrderSummary {
  collegeId: number;
  collegeName: string;
  totalOrders: number;
  totalRevenue: number;
}

interface DashboardData {
  shopOverview: ShopOverview[];
  orderStatus: OrderStatus[];
  topSellingMerchandise: TopSellingMerchandise[];
  collegeOrderSummary: CollegeOrderSummary[];
}

// Stats card component for reusability
interface StatsCardProps {
  title: string;
  description: string;
  value: string | number;
  trend: "up" | "neutral" | "down";
}

const StatsCard = ({ title, description, value, trend }: StatsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <span className="text-3xl font-bold">{value}</span>
      <TrendingUp
        className={
          trend === "up"
            ? "text-green-500"
            : trend === "down"
              ? "text-red-500"
              : "text-yellow-500"
        }
      />
    </CardContent>
  </Card>
);

// Export function with proper typing
const exportToCSV = async (orders: any[], filename: string) => {
  const csvData = orders.map((item) => ({
    "ORDER ID": item.id,
    "ORDER DATE": item.created_at,
    "USER ID": item.profiles.id,
    "USER FIRST NAME": item.profiles.first_name,
    "USER LAST NAME": item.profiles.last_name,
    "USER EMAIL": item.profiles.email,
    "PAYMENT METHOD": item.online_payment ? "Online" : "COD",
    "MERCH ID": item.merchandises.id,
    "MERCH NAME": item.merchandises.name,
    "VARIANT ID": item.variants.id,
    "VARIANT NAME": item.variants.name,
    QUANTITY: item.quantity,
    PRICE: item.price,
    STATUS: item.order_statuses.received
      ? "Received"
      : item.order_statuses.paid
        ? "Paid"
        : item.order_statuses.cancelled
          ? "Cancelled"
          : "Pending",
    "CANCEL DATE": item.order_statuses.cancelled_at ?? "",
    "CANCEL REASON": item.order_statuses.cancel_reason ?? "",
  }));

  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) =>
      headers.map((header) => `"${row[header]}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function AdminDashboard({
  params,
}: {
  params: { shopId: string };
}) {
  const [dashboardData, setDashboardData] = useState<DashboardData>();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchAdminDashboardData(parseInt(params.shopId));
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [params.shopId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const supabase = createClient();
      const { data: orders, error } = await supabase.from("orders").select(
        `
          id, created_at, quantity, price, online_payment,
          profiles(id, first_name, last_name, email),
          merchandises(id, name),
          variants(id, name),
          order_statuses(received, paid, cancelled, cancelled_at, cancel_reason)
          `,
      );

      if (error) throw error;
      if (!orders) throw new Error("No orders found");

      await exportToCSV(
        orders,
        `sales-report-${new Date().toISOString().split("T")[0]}.csv`,
      );
    } catch (error) {
      console.error("Failed to export orders:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const {
    shopOverview,
    orderStatus,
    topSellingMerchandise,
    collegeOrderSummary,
  } = dashboardData;
  const overview = shopOverview[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export to CSV"}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Orders"
          description="Shop Performance"
          value={overview.totalOrders}
          trend="up"
        />
        <StatsCard
          title="Total Revenue"
          description="Sales Performance"
          value={`₱${overview.totalRevenue.toLocaleString()}`}
          trend="up"
        />
        <StatsCard
          title="Pending Orders"
          description="Awaiting Action"
          value={overview.pendingOrders}
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BarChartComponent
          orders={collegeOrderSummary.map((college) => ({
            college: college.collegeName,
            orders: college.totalOrders,
          }))}
          shopId={params.shopId}
        />
        <PieChartComponent
          orders={orderStatus.map((status) => ({
            status: status.status,
            quantities: status.count,
          }))}
          shopId={params.shopId}
        />
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Merchandise</CardTitle>
          <CardDescription>Best Performing Products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="p-3 text-right font-medium text-muted-foreground">
                    Total Quantity
                  </th>
                  <th className="p-3 text-right font-medium text-muted-foreground">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSellingMerchandise.map((merch) => (
                  <tr
                    key={merch.order_id}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-3">{merch.name}</td>
                    <td className="p-3 text-right">
                      {merch.totalQuantity.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      ₱{merch.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
