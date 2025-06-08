"use client";

import React from "react";
import { createServerClient } from "@/supabase/clients/createServer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Clock, Package, XCircle, CheckCircle } from "lucide-react";
import { Order } from "@/constants/type";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/supabase/clients/createClient";
import ExpandableText from "./expandable-text";

const OrderCard = ({ order }: { order: Order }) => {
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleCancelOrder = async () => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data: o, error: orderError } = await supabase
        .from("orders")
        .select("status_id")
        .eq("id", order.id)
        .single();
      const { error: statusError } = await supabase
        .from("order_statuses")
        .update({
          cancelled: true,
          cancelled_at: new Date().toISOString(),
          cancel_reason: cancelReason || "No reason provided",
        })
        .eq("id", o.status_id);

      if (statusError) throw statusError;

      const { error: notificationError } = await supabase
        .from("shop_notifications")
        .insert({
          shop_id: order.shops.id,
          order_id: order.id,
          message: `Order #${order.id} was cancelled. ${cancelReason ? `Reason: ${cancelReason}` : "No reason provided"}`,
          seen: false,
        });

      if (notificationError) throw notificationError;

      setIsAlertOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(order.price);

  const getOrderStatus = () => {
    if (order.order_statuses.cancelled) {
      return {
        label: "Cancelled",
        color: "text-red-500",
        bgColor: "bg-red-50",
        icon: XCircle,
        details: order.order_statuses.cancel_reason,
      };
    }
    if (order.order_statuses.received) {
      return {
        label: "Received",
        color: "text-green-500",
        bgColor: "bg-green-50",
        icon: CheckCircle,
        details: `Received on ${new Date(order.order_statuses.received_at).toLocaleDateString()}`,
      };
    }
    if (order.order_statuses.paid) {
      return {
        label: "Paid",
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        icon: Package,
      };
    }
    return {
      label: "Pending",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      icon: Clock,
    };
  };

  const status = getOrderStatus();
  const StatusIcon = status.icon;
  const pictureUrl = order.merchandises.merchandise_pictures?.[0]?.picture_url;

  const canCancel =
    order.merchandises.cancellable &&
    !order.order_statuses.cancelled &&
    !order.order_statuses.received;

  return (
    <Card className="w-full bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg font-semibold text-gray-900">
              Order #{order.id}
            </CardTitle>
            <CardDescription className="truncate text-sm text-gray-500">
              {order.shops.name}{" "}
              {order.shops.acronym && `(${order.shops.acronym})`}
            </CardDescription>
          </div>
          <div
            className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 ${status.bgColor} ${status.color}`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="whitespace-nowrap text-sm font-medium">
              {status.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-4 py-4">
        <div className="flex gap-4">
          {pictureUrl && (
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
              <img
                src={pictureUrl}
                alt={order.merchandises.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="mb-2 font-medium text-gray-900">
              {order.merchandises.name}
            </h3>
            <div className="flex flex-col space-y-1 text-sm text-gray-500">
              <p>Variant: {order.variants.name}</p>
              <p>Quantity: {order.quantity}</p>
              <p className="mt-1 text-base font-medium text-gray-900">
                {displayPrice}
              </p>
            </div>
          </div>
        </div>

        {/* {status.details && <ExpandableText text={status.details} />} */}
      </CardContent>

      {canCancel && (
        <CardFooter className="border-t border-gray-100">
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Optionally provide a reason for cancelling this order. The
                  shop will be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
                  Never mind
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderCard;
