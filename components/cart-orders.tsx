"use client";

import { CartOrder } from "@/constants/type";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import Image from "next/image";
import OrderInfo from "./order-info";
import { createClient } from "@/supabase/clients/createClient";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

const CartOrderDisplay = ({
  order,
  selectedOrders,
  handleCheckboxChange,
  setCart,
}: {
  order: CartOrder;
  selectedOrders: string[];
  handleCheckboxChange: (id: string) => void;
  setCart: React.Dispatch<React.SetStateAction<CartOrder[]>>;
}) => {
  const [status, setStatus] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

  useEffect(() => {
    const getStatus = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: membership, error } = await supabase
        .from("memberships")
        .select()
        .eq("user_id", user?.id)
        .eq("shop_id", order.shops.id);
      setStatus(error != null);
    };
    getStatus();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <Checkbox
          id={`${order.id}`}
          onClick={() => handleCheckboxChange(order.id.toString())}
          checked={selectedOrders.includes(order.id.toString())}
        />

        <Image
          src={order.merchandises.merchandise_pictures[0].picture_url}
          alt={order.merchandises.name}
          width={112}
          height={112}
          className="object-cover"
        />

        <OrderInfo order={order} status={status} setCart={setCart} />
      </CardContent>
    </Card>
  );
};

export default CartOrderDisplay;
