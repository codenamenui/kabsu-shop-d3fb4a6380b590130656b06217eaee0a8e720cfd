import { CartOrder, Order } from "@/constants/type";
import React, { useState } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MdDelete } from "react-icons/md";
import { createClient } from "@/supabase/clients/createClient";

const OrderInfo = ({
  order,
  status,
  setCart,
}: {
  order: CartOrder;
  status: boolean;
  setCart: React.Dispatch<React.SetStateAction<CartOrder[]>>;
}) => {
  const getPrice = (discount: boolean, quantity?: number): string => {
    const variant = order.merchandises.variants.find(
      (variant) => variant.id == order.variant_id,
    );

    let price = 0;
    if (discount) {
      price = variant?.membership_price ?? -1;
    } else {
      price = variant?.original_price ?? -1;
    }
    if (quantity) {
      price = price * quantity;
    }
    const displayPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(price);
    return displayPrice;
  };

  const deleteOrder = (id: number) => {
    const supabase = createClient();
    const deleteCartOrder = async () => {
      const { error } = await supabase
        .from("cart_orders")
        .delete()
        .eq("id", id);
    };
    deleteCartOrder();
    setCart(
      (prevOrders) => prevOrders?.filter((order) => order.id !== id) || [],
    );
  };

  const updateOrderInCart =
    (orderId: number, updates: Partial<CartOrder>) =>
    (prevOrders: CartOrder[]) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));

  const updateCart = (cartOrder: CartOrder) => {
    const update = async () => {
      const supabase = createClient();
      const { data, error: databaseError } = await supabase
        .from("cart_orders")
        .update([
          {
            quantity: cartOrder.quantity,
            variant_id: cartOrder.variant_id,
          },
        ])
        .eq("id", cartOrder.id)
        .select();

      if (databaseError) {
        console.error(databaseError);
        return;
      }
    };

    // Local state update
    const updatedCartMap = updateOrderInCart(cartOrder.id, {
      quantity: cartOrder.quantity,
      variant_id: cartOrder.variant_id,
    });
    setCart(updatedCartMap);

    // Database update
    update();
  };

  return (
    <div className="flex flex-1 justify-between gap-2">
      <div>
        <h3 className="text-lg font-semibold">{order.merchandises.name}</h3>
        <p className="text-sm text-gray-500">{order.shops.acronym}</p>
        <div className="flex space-x-2 text-lg">
          <span
            className={`${
              status
                ? "text-gray-400 line-through opacity-60"
                : "font-semibold text-emerald-800"
            } `}
          >
            {getPrice(false, order.quantity)}
          </span>
          <div className="select-none text-gray-400">|</div>
          <span
            className={`${
              !status
                ? "text-gray-400 line-through opacity-60"
                : "font-semibold text-emerald-800"
            } `}
          >
            {getPrice(true, order.quantity)}
          </span>
        </div>

        <div className="flex gap-4">
          <div className="space-y-2">
            <Label>{order.merchandises.variant_name}</Label>
            <Select
              name="variant"
              value={`${order.variant_id}`}
              onValueChange={(val) => {
                const newVariantId = Number.parseInt(val);
                const updatedCartMap = updateOrderInCart(order.id, {
                  variant_id: newVariantId,
                });
                setCart(updatedCartMap);
                updateCart({
                  ...order,
                  variant_id: newVariantId,
                });
              }}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue
                  placeholder={`Enter ${order.merchandises.variant_name}...`}
                />
              </SelectTrigger>
              <SelectContent>
                {order.merchandises.variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id.toString()}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              name="quantity"
              value={order.quantity}
              onChange={(e) => {
                // Usage for quantity
                const newQuantity = Number.parseInt(e.target.value) || 1;
                const updatedCartMap = updateOrderInCart(order.id, {
                  quantity: newQuantity,
                });
                setCart(updatedCartMap);
                updateCart({
                  ...order,
                  quantity: newQuantity,
                });
              }}
              min="1"
              className="w-[240px]"
            />
          </div>
        </div>
      </div>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => deleteOrder(order.id)}
        className="self-start"
      >
        <MdDelete className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default OrderInfo;
