"use client";
import { Orders } from "@/constants/type";
import { createClient } from "@/supabase/clients/createClient";

export const handleOrderAction = async (
  order: Orders,
  action: "receive" | "cancel",
  setOrders: React.Dispatch<React.SetStateAction<Orders[]>>,
  cancelReason?: string,
) => {
  const supabase = createClient();

  const updateData =
    action === "receive"
      ? {
          received: true,
          received_at: new Date().toISOString(),
          paid: true,
        }
      : {
          cancelled: true,
          cancelled_at: new Date().toISOString(),
          cancel_reason: cancelReason || "No reason provided",
        };

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

  const { error } = await supabase
    .from("order_statuses")
    .update(updateData)
    .eq("id", order.order_statuses.id);

  if (error) {
    console.error("Error updating order:", error);
  }
};
