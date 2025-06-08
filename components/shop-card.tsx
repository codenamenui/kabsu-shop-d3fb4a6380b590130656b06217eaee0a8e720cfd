import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ManagedShop } from "@/constants/type";
import { ArrowRight } from "lucide-react";

export const ShopCard = ({
  shop,
  manage,
}: {
  shop: ManagedShop;
  manage?: boolean;
}) => {
  const getLink = (manage) => {
    if (manage) return `/manage-shop/${shop.id}`;
    return `/shop/${shop.id}`;
  };

  return (
    <Card className={cn("w-full transition-colors hover:bg-gray-50")}>
      <CardHeader className="flex-row items-center space-x-4 space-y-0">
        <Image
          src={shop.logo_url ?? ""}
          alt={`${shop.name} logo`}
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Link href={getLink(manage)} className="mr-2 hover:underline">
                {shop.name}
              </Link>
              {shop.acronym && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {shop.acronym}
                </span>
              )}
            </CardTitle>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default ShopCard;
