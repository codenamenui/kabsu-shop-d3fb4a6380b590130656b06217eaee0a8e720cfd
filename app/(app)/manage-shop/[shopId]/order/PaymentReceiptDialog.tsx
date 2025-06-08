import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PaymentReceiptDialog = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={imageUrl}
          alt="Payment Receipt"
          className="h-16 w-16 cursor-pointer rounded-md object-cover transition-opacity hover:opacity-80"
        />
      </DialogTrigger>
      <DialogContent className="h-5/6">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          <img
            src={imageUrl}
            alt="Payment Receipt"
            className="h-[45%] rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceiptDialog;
