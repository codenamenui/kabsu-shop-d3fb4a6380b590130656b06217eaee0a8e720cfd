"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FullMerch } from "@/constants/type";
import MerchPictureDisplay from "./merch-pictures-display";
import ShopCard from "./shop-card";
import ConfirmOrderDialog from "./confirm-order";
import { createClient } from "@/supabase/clients/createClient";
import { createWorker } from "tesseract.js";
import OrderCountDisplay from "@/app/(app)/merch/[merchId]/orderCount";

interface TransactionDetails {
  mobileNumber: string | null;
  amount: string | null;
  referenceNumber: string | null;
  date: string | null;
}

function extractTransactionDetails(text: string): TransactionDetails {
  // Extract mobile number (starts with +63)
  // const mobileNumberMatch = text.match(/\+63\s*\d{3}\s*\d{7}/);
  const mobileNumberMatch = text.match(/\+63.*/);
  const mobileNumber = mobileNumberMatch ? mobileNumberMatch[0] : null;

  // Extract amount
  const amountMatch = text.match(/Amount\s*(\d{1,3}(?:,\d{3})*\.\d{2})/);
  const amount = amountMatch ? amountMatch[1] : null;

  // Extract reference number
  const refNoMatch = text.match(/Ref\s*No\.\s*(\d{4}\s*\d{3}\s*\d{6})/);
  const referenceNumber = refNoMatch ? refNoMatch[1] : null;

  // Extract date
  const dateMatch = text.match(/(\w{3}\s*\d{2},\s*\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  return {
    mobileNumber,
    amount,
    referenceNumber,
    date,
  };
}

const FullMerchDisplay = ({
  merch,
  membership,
}: {
  merch: FullMerch;
  membership: boolean;
}) => {
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [paymentOption, setPaymentOption] = useState<string>("none");
  const [selectedMainImage, setSelectedMainImage] = useState<number>(0);

  // const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [ocrStatus, setOcrStatus] = useState<string>("");

  const [errMsg, setErrMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (e: { target: { value: string } }) => {
    const value = parseInt(e.target.value);
    setQuantity(Math.max(1, value));
  };

  function handleCartUpload() {
    const cartUpload = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        return;
      }

      const { error } = await supabase.from("cart_orders").insert([
        {
          user_id: user?.id,
          quantity: quantity,
          variant_id: merch.variants[selectedVariant].id,
          merch_id: merch.id,
          shop_id: merch.shops.id,
        },
      ]);

      if (error) {
        console.error(error);
        return;
      }
    };
    cartUpload();
  }

  async function handleOrderSubmit() {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      return false;
    }

    const { data: membership, error: mem_error } = await supabase
      .from("memberships")
      .select()
      .eq("email", user?.email)
      .eq("shop_id", merch?.shops.id);

    const variant = merch.variants[selectedVariant];

    let price =
      mem_error == null ? variant?.membership_price : variant?.original_price;

    price *= quantity;

    if (paymentOption === "irl") {
      const {
        data: { id: status_id },
        error: statusError,
      } = await supabase
        .from("order_statuses")
        .insert([{ paid: false }])
        .select()
        .single();

      if (statusError) {
        console.error(statusError);
        return false;
      }

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            quantity: quantity,
            online_payment: paymentOption == "online",
            physical_payment: paymentOption == "irl",
            variant_id: merch.variants[selectedVariant].id,
            merch_id: merch.id,
            shop_id: merch.shops.id,
            status_id: status_id,
            price: price,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        return false;
      }
      setOpenConfirmation(false);

      const { error: notificationError1 } = await supabase
        .from("shop_notifications")
        .insert([
          {
            order_id: data.id,
            shop_id: merch.shops.id,
            message: "You have a new order!",
            seen: false,
          },
        ]);
      toast.success(`${merch.name} ordered successfully!`);
      return true;
    }
    const worker = await createWorker("eng", 1, {
      logger: (m) => console.log(m), // Add logger here
    });
    const {
      data: { text },
    } = await worker.recognize(paymentReceipt);
    const details = extractTransactionDetails(text);
    console.log(details);
    console.log("Mobile Number:", details.mobileNumber);
    console.log("Amount:", Number(details.amount?.replace(",", "")));
    console.log("Reference Number:", details.referenceNumber);
    console.log("Date:", details.date);

    if (
      !details.mobileNumber ||
      !details.amount ||
      !details.referenceNumber ||
      !details.date
    ) {
      console.log("HERRE");
      setErrMsg("Invalid receipt");
      return false;
    }

    const insert = async () => {
      if (paymentOption == "online") {
        if (paymentReceipt == null) {
          return false;
        }
      }

      const {
        data: { id: status_id },
        error: statusError,
      } = await supabase
        .from("order_statuses")
        .insert([{ paid: true }])
        .select()
        .single();

      if (statusError) {
        console.error(statusError);
        return false;
      }

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            quantity: quantity,
            online_payment: paymentOption == "online",
            physical_payment: paymentOption == "irl",
            variant_id: merch.variants[selectedVariant].id,
            merch_id: merch.id,
            shop_id: merch.shops.id,
            status_id: status_id,
            price: price,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        return false;
      }

      if (paymentOption == "online") {
        const url = `payment_${data.id}_${Date.now()}`;
        const { error: storageError } = await supabase.storage
          .from("payment-picture")
          .upload(url, paymentReceipt);

        if (storageError) {
          console.error(storageError);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("payment-picture").getPublicUrl(url);

        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert([{ picture_url: publicUrl, order_id: data.id }]);

        if (paymentError) {
          console.error(paymentError);
          return false;
        }
      }
      const { error: errorReceipt } = await supabase
        .from("receipts")
        .insert([
          {
            order_id: data.id,
            mobile_number: details.mobileNumber,
            amount: parseFloat(details.amount?.replace(",", "") || ""),
            reference_number: details.referenceNumber,
          },
        ])
        .select();

      const { error: notificationError2 } = await supabase
        .from("shop_notifications")
        .insert([
          {
            order_id: data.id,
            shop_id: merch.shops.id,
            message: "You have a new order!",
            seen: false,
          },
        ]);
    };
    insert();
    setErrMsg("");
    setOpenConfirmation(false);
    toast.success(`${merch.name} ordered successfully!`);
    return true;
  }

  const getPrice = (discount: boolean, quantity?: number): string => {
    let price;
    if (discount) {
      price = merch.variants[selectedVariant].membership_price;
    } else {
      price = merch.variants[selectedVariant].original_price;
    }
    if (quantity) {
      price *= quantity;
    }
    const displayPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(price);
    return displayPrice;
  };

  const handleImageChange = (file: File | null) => {
    setPaymentReceipt(file);
    setOcrResult(""); // Reset OCR result
    setOcrStatus(""); // Reset status
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-8 md:flex-row">
        <MerchPictureDisplay
          merch={merch}
          selectedMainImage={selectedMainImage}
          setSelectedMainImage={setSelectedMainImage}
        />

        <div className="w-full space-y-6 md:w-1/2">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{merch.name}</h1>
            <div className="text-2xl font-semibold text-emerald-800">
              {getPrice(false)} {" | "} {getPrice(true)}
            </div>
            <div className="mt-1">
              <OrderCountDisplay merchId={merch.id}></OrderCountDisplay>
            </div>
          </div>

          <form className="space-y-4">
            <div className="flex gap-4">
              {/* Variants Field */}
              <div className="flex-1">
                <Label htmlFor="variant">{merch.variant_name}</Label>
                <Select
                  value={`${merch.variants[selectedVariant].id}`}
                  onValueChange={(val) => {
                    const id = merch.variants.findIndex((variant) => {
                      return variant.id == Number.parseInt(val);
                    });
                    setSelectedVariant(id);
                  }}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Variant" />
                  </SelectTrigger>

                  <SelectContent>
                    {merch.variants.map((variant) => (
                      <SelectItem key={variant.id} value={`${variant.id}`}>
                        {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quantity Field */}
            <div className="w-full">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full"
                required
              />
            </div>

            {/* Confirm Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={() => {
                  handleCartUpload();
                  toast.success(`${merch.name} Added to cart successfully!`);
                }}
                variant="outline"
                className="flex-1"
              >
                Add to Cart
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setOpenConfirmation(true);
                }}
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>
          </form>

          <ShopCard shop={merch.shops} manage={false} />

          <div>
            <h2 className="mb-2 text-xl font-semibold">Description</h2>
            <p className="text-gray-700">{merch.description}</p>
          </div>
        </div>
      </div>

      <ConfirmOrderDialog
        openConfirmation={openConfirmation}
        setOpenConfirmation={setOpenConfirmation}
        merch={merch}
        paymentOption={paymentOption}
        setPaymentOption={setPaymentOption}
        setPaymentReceipt={handleImageChange}
        selectedVariant={selectedVariant}
        getPrice={getPrice}
        quantity={quantity}
        handleOrderSubmit={handleOrderSubmit}
        paymentReceipt={paymentReceipt}
        membership_status={membership}
        errMsg={errMsg}
        loading={loading}
      />
    </div>
  );
};

export default FullMerchDisplay;
