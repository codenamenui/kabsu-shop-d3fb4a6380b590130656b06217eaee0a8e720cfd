import React from "react";
import Image from "next/image";
import { CartOrder } from "@/constants/type";

const CartShopDisplay = ({
  acronym,
  items,
}: {
  acronym: string;
  items: CartOrder[];
}) => {
  return (
    <div className="relative border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 p-4">
      <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white shadow-md">
            <Image
              src={items[0].shops.logo_url}
              alt={`${acronym} Shop Logo`}
              width={112}
              height={112}
              className="rounded-full object-cover"
            />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-gray-800">
            {acronym} Shop
          </h3>
        </div>
        <div className="rounded-full bg-white/50 px-2 py-1 text-sm text-gray-600">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default CartShopDisplay;
