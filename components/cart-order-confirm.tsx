"use client";

import { CartOrder } from "@/constants/type";
import { Button } from "./ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/clients/createClient";
import { CreditCard, Upload, Wallet } from "lucide-react";

const CartOrderConfirmCard = ({
  order,
  paymentUpdate,
}: {
  order: CartOrder;
  paymentUpdate: (
    orderId: string,
    paymentOption: string,
    paymentReceipt?: File,
  ) => void;
}) => {
  const [membership, setMembership] = useState<boolean>(false);
  const [paymentOption, setPaymentOption] = useState<string>("none");
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

  useEffect(() => {
    const getStatus = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("memberships")
        .select()
        .eq("user_id", user?.id)
        .eq("shop_id", order.shops.id);

      setMembership(error != null);
    };
    getStatus();
  }, [order.shops.id]);

  const merch = order.merchandises;
  const selectedVariant = merch.variants.findIndex(
    (variant) => variant.id === order.variant_id,
  );

  const getPrice = (discount: boolean, quantity?: number) => {
    const variant = merch.variants[selectedVariant];
    const price = discount ? variant.membership_price : variant.original_price;
    const displayPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(price * (quantity || order.quantity));
    return displayPrice;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative h-32 w-32">
              <Image
                src={merch.merchandise_pictures[0].picture_url}
                alt={merch.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold">{merch.name}</h3>
              <div className="text-sm text-gray-600">
                <p>
                  {merch.variant_name}: {merch.variants[selectedVariant].name}
                </p>
                <p>Quantity: {order.quantity}</p>
              </div>
              <p className="text-xl font-bold">{getPrice(membership)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="mb-2 font-medium">Pickup Location</p>
          <p className="text-sm text-gray-600">{merch.receiving_information}</p>
        </div>

        <div>
          <p className="mb-3 font-medium">Payment Method</p>
          <div className="space-y-3">
            {merch.physical_payment && (
              <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                <input
                  type="radio"
                  name={`payment-${order.id}`}
                  value="irl"
                  checked={paymentOption === "irl"}
                  onChange={() => {
                    setPaymentOption("irl");
                    paymentUpdate(order.id.toString(), "irl", paymentReceipt);
                  }}
                  className="mr-3"
                />
                <Wallet className="mr-2 h-5 w-5" />
                <span>In-Person Payment</span>
              </label>
            )}

            {merch.online_payment && (
              <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                <input
                  type="radio"
                  name={`payment-${order.id}`}
                  value="online"
                  checked={paymentOption === "online"}
                  onChange={() => {
                    setPaymentOption("online");
                    paymentUpdate(
                      order.id.toString(),
                      "online",
                      paymentReceipt,
                    );
                  }}
                  className="mr-3"
                />
                <CreditCard className="mr-2 h-5 w-5" />
                <span>GCash Payment</span>
              </label>
            )}
          </div>
        </div>

        {paymentOption === "online" && (
          <div className="flex justify-center gap-5 space-y-2">
            <div className="m mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                  <label
                    htmlFor={`gcash-receipt-${order.id}`}
                    className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                  >
                    <span>Upload GCash Receipt</span>
                    <input
                      id={`gcash-receipt-${order.id}`}
                      name={`gcash-receipt-${order.id}`}
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={(e) => {
                        setPaymentReceipt(e.target.files?.[0] || null);
                        paymentUpdate(
                          order.id.toString(),
                          paymentOption,
                          e.target.files?.[0],
                        );
                      }}
                      required
                    />
                  </label>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
            {paymentReceipt && (
              <div className="mt-4 flex justify-center">
                <img
                  src={URL.createObjectURL(paymentReceipt)} // Create URL for the file
                  alt="Payment Receipt"
                  className="max-h-[200px] max-w-[200px] rounded-md object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOrderConfirmCard;
