"use client";

import React, { useEffect } from "react";
import { BadgeCheck, ShoppingCart, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import OrderCard from "./order-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Order } from "@/constants/type";
import { createClient } from "@/supabase/clients/createClient";

const Orders = () => {
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          "id, quantity, price, merchandises(name, cancellable, merchandise_pictures(picture_url)), variants(name), shops(name, acronym, id), order_statuses(paid, received, received_at, cancelled, cancelled_at, cancel_reason)",
        )
        .eq("user_id", user?.id);

      setOrders(orders);
      setError(error);
    };
    getData();
  }, []);

  return (
    <div className="p-5">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">My Orders</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          View and track your order history
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading orders: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {!orders || orders.length === 0 ? (
          <Card className="bg-gray-50 py-12">
            <div className="text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                When you place orders, they will appear here
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
