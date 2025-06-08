import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FullMerch } from "@/constants/type";
import { CreditCard, LoaderIcon, Upload, Wallet } from "lucide-react";
import { Button } from "./ui/button";

const ConfirmOrderDialog = ({
  openConfirmation,
  setOpenConfirmation,
  merch,
  paymentOption,
  setPaymentOption,
  setPaymentReceipt,
  selectedVariant,
  getPrice,
  quantity,
  handleOrderSubmit,
  paymentReceipt,
  membership_status,
  errMsg,
  loading,
}: {
  openConfirmation: boolean;
  setOpenConfirmation: (e: boolean) => void;
  merch: FullMerch;
  paymentOption: string;
  setPaymentOption: (e: string) => void;
  setPaymentReceipt: (e: File | null) => void;
  selectedVariant: number;
  getPrice: (discount: boolean, quantity?: number) => string;
  quantity: number;
  handleOrderSubmit: () => void;
  paymentReceipt: File | null;
  membership_status: boolean;
  errMsg: string;
  loading: boolean;
}) => {
  return (
    <Dialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
      <DialogContent className="flex max-h-[90vh] flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl">Confirm Purchase</DialogTitle>
        </DialogHeader>

        <div className="-mr-4 flex-1 overflow-y-auto pr-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative h-32 w-32 flex-shrink-0">
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
                      {merch.variant_name}:{" "}
                      {merch.variants[selectedVariant].name}
                    </p>
                    <p>Quantity: {quantity}</p>
                  </div>
                  <p className="text-xl font-bold">
                    {getPrice(membership_status, quantity)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 font-medium">Pickup Location</p>
              <p className="text-sm text-gray-600">
                {merch.receiving_information}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-3 font-medium">Payment Method</p>
            <div className="space-y-3">
              {merch.physical_payment && (
                <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`payment`}
                    value="irl"
                    checked={paymentOption === "irl"}
                    onChange={() => {
                      setPaymentOption("irl");
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
                    name={`payment`}
                    value="online"
                    checked={paymentOption === "online"}
                    onChange={() => {
                      setPaymentOption("online");
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
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="w-full rounded-lg border border-dashed border-gray-300 px-6 py-8">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                    <label
                      htmlFor={`gcash-receipt`}
                      className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                    >
                      <span>Upload GCash Receipt</span>
                      <input
                        id={`gcash-receipt`}
                        name={`gcash-receipt`}
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => {
                          setPaymentReceipt(e.target.files?.[0] || null);
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
                <div className="flex justify-center">
                  <img
                    src={URL.createObjectURL(paymentReceipt)}
                    alt="Payment Receipt"
                    className="max-h-[200px] max-w-[200px] rounded-md object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {errMsg && (
            <div className="mt-4 rounded-lg p-3 text-sm text-red-800">
              {errMsg}
            </div>
          )}
        </div>

        <div className="mt-4 flex-shrink-0 border-t pt-4">
          <Button
            onClick={handleOrderSubmit}
            disabled={
              paymentOption === "none" ||
              (paymentOption === "online" && paymentReceipt === null)
            }
            className="w-full"
          >
            {loading ? (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Purchase
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderDialog;
