import React from "react";
import Image from "next/image";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Card } from "./ui/card";
import { ShopManagement } from "@/constants/type";

const ShopManageCard = ({ shop }: { shop: ShopManagement }) => {
  return (
    <div className="flex flex-col">
      <Card className="flex w-full items-center gap-3 p-3">
        <Image
          src={shop.logo_url}
          width={80}
          height={80}
          alt={`${shop.name} logo`}
          className="rounded-full"
        />
        <div className="text-xs">
          <p className="text-lg font-semibold">{shop.name}</p>
          <p>{shop.colleges.name || "No College"}</p>
          {shop.socmed_url && (
            <a href={shop.socmed_url} target="_blank" rel="noopener noreferrer">
              <span className="flex items-center gap-1">
                <FaFacebook size={20} />
                <p>{shop.socmed_url}</p>
              </span>
            </a>
          )}
          {shop.email && (
            <span className="flex items-center gap-1">
              <MdEmail size={20} />
              <p>{shop.email}</p>
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ShopManageCard;
