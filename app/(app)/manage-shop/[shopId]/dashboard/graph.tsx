"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

import { Orders as Order } from "@/constants/type";

type Orders = Order[];

const Dashboard = ({ ini }: { ini: Orders }) => {
  const [orders, setOrders] = useState<Orders>(ini);

  const totalOrders = orders.length;
  const ordersPerMerch = orders.reduce((acc, order) => {
    acc[order.merchandises.name] =
      (acc[order.merchandises.name] || 0) + order.quantity;
    return acc;
  }, {});

  const orderStatuses = {
    pending: orders.filter(
      (order) =>
        !order.order_statuses.received && !order.order_statuses.cancelled,
    ).length,
    completed: orders.filter((order) => order.order_statuses.received).length,
    cancelled: orders.filter((order) => order.order_statuses.cancelled).length,
  };

  const customersByCollege = orders.reduce((acc, order) => {
    const college = order.profiles.colleges.name;
    acc[college] = (acc[college] || 0) + 1;
    return acc;
  }, {});

  const ordersByMerchChart = {
    labels: Object.keys(ordersPerMerch),
    datasets: [
      {
        label: "Orders per Merchandise",
        data: Object.values(ordersPerMerch),
        backgroundColor: "rgba(4, 120, 87, 0.6)", // emerald-800 with opacity
      },
    ],
  };

  const orderStatusesChart = {
    labels: ["Pending", "Completed", "Cancelled"],
    datasets: [
      {
        data: Object.values(orderStatuses),
        backgroundColor: ["#064e3b", "#10b981", "#6ee7b7"], // Emerald color palette
      },
    ],
  };

  const customersByCollegeChart = {
    labels: Object.keys(customersByCollege),
    datasets: [
      {
        label: "Customers by College",
        data: Object.values(customersByCollege),
        backgroundColor: "rgba(4, 120, 87, 0.6)", // emerald-800 with opacity
      },
    ],
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-900">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="border-emerald-600 text-emerald-800"
          >
            Export
          </Button>
          <Button className="bg-emerald-700 hover:bg-emerald-600">
            New Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-emerald-100">
          <TabsTrigger value="overview" className="text-emerald-800">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-emerald-800">
            Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-emerald-800">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Quick Stats */}
            <Card className="border-emerald-100 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-emerald-800">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    Total Orders:{" "}
                    <span className="font-bold text-emerald-700">
                      {totalOrders}
                    </span>
                  </p>
                  <p>
                    Pending:{" "}
                    <span className="text-yellow-600">
                      {orderStatuses.pending}
                    </span>
                  </p>
                  <p>
                    Completed:{" "}
                    <span className="text-emerald-600">
                      {orderStatuses.completed}
                    </span>
                  </p>
                  <p>
                    Cancelled:{" "}
                    <span className="text-red-600">
                      {orderStatuses.cancelled}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Orders by Merchandise */}
            <Card className="border-emerald-100 bg-white shadow-md md:col-span-2">
              <CardHeader>
                <CardTitle className="text-emerald-800">
                  Orders by Merchandise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={ordersByMerchChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#064e3b",
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Order Statuses */}
            <Card className="border-emerald-100 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-emerald-800">
                  Order Statuses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Pie
                  data={orderStatusesChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#064e3b",
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Customers by College */}
            <Card className="border-emerald-100 bg-white shadow-md md:col-span-2">
              <CardHeader>
                <CardTitle className="text-emerald-800">
                  Customers by College
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={customersByCollegeChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#064e3b",
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-emerald-100 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-emerald-800">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for orders table or list */}
              <p className="text-gray-500">No recent orders to display.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Carousel>
            <CarouselContent>
              <CarouselItem>
                <Card className="border-emerald-100 bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">
                      Detailed Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* More advanced analytics could go here */}
                    <p className="text-gray-500">Swipe for more insights.</p>
                  </CardContent>
                </Card>
              </CarouselItem>
              {/* Additional carousel items could be added */}
            </CarouselContent>
          </Carousel>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
