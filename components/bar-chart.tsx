"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "@/supabase/clients/createClient";

const chartConfig = {
  orders: {
    label: "Total Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type OrderData = {
  college: string;
  orders: number;
};

interface BarChartProps {
  orders: OrderData[];
  shopId: string;
}

export function BarChartComponent({ orders, shopId }: BarChartProps) {
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    const countOrders = async () => {
      const supabase = createClient();
      const { data: orders, error: orderStatusError } = await supabase
        .from("orders")
        .select(`created_at`)
        .eq("shop_id", shopId);
      if (orders && orders.length > 0) {
        // Assuming each order has a 'date' field in ISO format
        const dates = orders.map((order) => new Date(order.created_at));

        const earliestDate = new Date(Math.min(...dates));
        const latestDate = new Date(Math.max(...dates));
        console.log(earliestDate);
        // Format dates
        const formatDate = (date) => {
          return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        };

        // Create date range string
        const range = `${formatDate(earliestDate)} - ${formatDate(latestDate)}`;

        setDateRange(range);
      }
    };
    countOrders();
  }, [orders]);

  // Sort data by number of orders descending
  const sortedData = [...orders].sort((a, b) => b.orders - a.orders);

  if (!orders || orders.length === 0) {
    return (
      <Card className="flex min-h-[400px] flex-col">
        <CardHeader className="items-center">
          <CardTitle>Orders per College</CardTitle>
          <CardDescription>No orders found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Orders Per College</CardTitle>
        <CardDescription>
          {dateRange != "INVALID" ? dateRange : "No orders found"}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={chartConfig}>
         b <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-muted"
              />
              <XAxis
                dataKey="college"
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="orders"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default BarChartComponent;
