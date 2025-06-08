import React from "react";
import { useEffect, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "@/supabase/clients/createClient";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function PieChartComponent({ orders, shopId }) {
  const [dateRange, setDateRange] = useState("");

  const statusColorMap = {
    pending: "#FFA500", // Orange
    received: "#4CAF50", // Green
    paid: "#2196F3", // Blue
    cancelled: "#F44336", // Red
  };

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

  const chartData =
    orders?.map((order) => {
      let quantity =
        order?.quantities -
        (orders?.find((o) => o.status === "Received")?.quantities || 0);
      if (quantity < 0) quantity = 0;
      return {
        status: order?.status,
        quantity: order?.status === "Paid" ? quantity : order?.quantities,
        fill: statusColorMap[order?.status.toLowerCase()] || "#9E9E9E", // Gray for undefined
      };
    }) ?? [];

  const totalOrders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Order Status</CardTitle>
        <CardDescription>
          {dateRange != "INVALID" ? dateRange : "No orders found"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="quantity"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Orders
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="capitalize">
              {item.status}: {item.quantity}
            </span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
