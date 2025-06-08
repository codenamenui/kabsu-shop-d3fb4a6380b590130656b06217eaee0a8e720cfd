"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Orders } from "@/constants/type";
import { createClient } from "@/supabase/clients/createClient";
import React from "react";
import { Label } from "@/components/ui/label";

const OrderActions = ({
  order,
  setOrders,
}: {
  order: Orders;
  setOrders: React.Dispatch<React.SetStateAction<Orders[]>>;
}) => {
  const handleOrderAction = async (
    order: Orders,
    action: "receive" | "cancel" | "paid",
    setOrders: React.Dispatch<React.SetStateAction<Orders[]>>,
    isToggled: boolean,
    cancelReason?: string,
  ) => {
    const supabase = createClient();

    let updateData;
    let notificationMessage = "";

    switch (action) {
      case "receive":
        updateData = {
          received: isToggled,
          received_at: isToggled ? new Date().toISOString() : null,
        };
        notificationMessage = isToggled
          ? "Your order has been marked as received."
          : "Your order's received status has been removed.";
        break;
      case "paid":
        updateData = {
          paid: isToggled,
        };
        notificationMessage = isToggled
          ? "Your order has been marked as paid."
          : "Your order's payment status has been marked as unpaid.";
        break;
      case "cancel":
        updateData = {
          cancelled: true,
          cancelled_at: new Date().toISOString(),
          cancel_reason: cancelReason || "No reason provided",
        };
        notificationMessage = "Your order has been cancelled.";
        break;
    }

    // Update local state
    setOrders((prev) =>
      prev.map((existingOrder) =>
        existingOrder.order_statuses.id === order.order_statuses.id
          ? {
              ...existingOrder,
              order_statuses: {
                ...existingOrder.order_statuses,
                ...updateData,
              },
            }
          : existingOrder,
      ),
    );

    // Update order status
    const { error: statusError } = await supabase
      .from("order_statuses")
      .update(updateData)
      .eq("id", order.order_statuses.id);

    if (statusError) {
      console.error("Error updating order status:", statusError);
      return;
    }

    // Get the customer's user ID from the order
    const customerId = order.profiles.user_id;

    // Create user notification for the customer
    const { error: customerNotificationError } = await supabase
      .from("user_notifications")
      .insert([
        {
          user_id: customerId,
          merch_id: order.merchandises.id,
          order_id: order.id,
          message: notificationMessage,
          seen: false,
        },
      ]);

    if (customerNotificationError) {
      console.error(
        "Error creating customer notification:",
        customerNotificationError,
      );
    }

    // Get the admin user who performed the action
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const adminId = user?.id;

    // Create admin notification
    const adminNotificationMessage = `Order #${order.id} - ${notificationMessage.toLowerCase()}`;
    const { error: adminNotificationError } = await supabase
      .from("user_notifications")
      .insert([
        {
          user_id: adminId,
          merch_id: order.merchandises.id,
          order_id: order.id,
          message: adminNotificationMessage,
          seen: false,
        },
      ]);

    if (adminNotificationError) {
      console.error(
        "Error creating admin notification:",
        adminNotificationError,
      );
    }
  };

  const handleToggle = async (
    action: "receive" | "paid",
    isToggled: boolean,
  ) => {
    await handleOrderAction(order, action, setOrders, isToggled);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id={`paid-${order.id}`}
          checked={order.order_statuses.paid}
          onCheckedChange={(checked) => handleToggle("paid", checked)}
          disabled={
            (order.order_statuses.paid && order.order_statuses.received) ||
            order.order_statuses.cancelled
          }
        />
        <Label htmlFor={`paid-${order.id}`}>Paid</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id={`received-${order.id}`}
          checked={order.order_statuses.received}
          onCheckedChange={(checked) => handleToggle("receive", checked)}
          disabled={
            !order.order_statuses.paid || order.order_statuses.cancelled
          }
        />
        <Label htmlFor={`received-${order.id}`}>Received</Label>
      </div>

      {!order.order_statuses.cancelled && !order.order_statuses.received && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">No, Keep Order</Button>
              </DialogClose>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOrderAction(order, "cancel", setOrders, true);
                }}
              >
                <Button type="submit" variant="destructive">
                  Yes, Cancel Order
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrderActions;
