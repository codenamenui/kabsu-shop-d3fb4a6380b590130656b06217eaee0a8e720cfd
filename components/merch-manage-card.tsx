import { Merch } from "@/constants/type";
import React from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { deleteMerch } from "@/app/(app)/manage-shop/[shopId]/actions";
import { Edit } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

const MerchManageCard = ({
  merch,
  params,
}: {
  merch: Merch;
  params: { shopId: string };
}) => {
  const originalPrice = Math.min(
    ...merch.variants.map((variant) => variant.original_price ?? 0),
  );
  const membershipPrice = Math.min(
    ...merch.variants.map((variant) => variant.membership_price ?? 0),
  );
  const displayOriginalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(originalPrice);
  const displayMembershipPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(membershipPrice);

  return (
    <Card className="flex h-full w-52 flex-col transition-all duration-300 hover:shadow-lg">
      <CardContent className="flex-grow p-5">
        <Link
          href={`/merch/${merch.id}`}
          className="block transition-opacity hover:opacity-80"
        >
          <div className="mb-4 flex justify-center">
            {merch.merchandise_pictures &&
            merch.merchandise_pictures.length > 0 ? (
              <Image
                alt={merch.name}
                width={192}
                height={192}
                src={merch.merchandise_pictures[0].picture_url}
                className="h-48 w-48 rounded-md object-cover"
                priority
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-md bg-gray-100">
                <p className="text-gray-500">No image</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="mb-1 line-clamp-2 text-lg font-bold">{merch.name}</p>
            <p className="mb-2 text-sm text-gray-600">{merch.shops.acronym}</p>
            <div className="flex justify-center gap-2">
              <p className="text-sm text-gray-500">{displayOriginalPrice}</p>
              <p className="font-semibold text-emerald-800">
                {displayMembershipPrice}
              </p>
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex-col">
        <div className="mt-3 flex w-full gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="flex-1 transition-colors hover:bg-gray-100"
          >
            <Link href={`/manage-shop/${params.shopId}/merch/${merch.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <form action={deleteMerch} className="flex-1">
            <Button
              type="submit"
              name="id"
              value={merch.id}
              variant="destructive"
              size="icon"
              className="w-full transition-colors hover:bg-red-600"
            >
              <MdDelete />
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MerchManageCard;
