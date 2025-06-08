import React from "react";
import Image from "next/image";
import { FullMerch } from "@/constants/type";

const MerchPictureDisplay = ({
  merch,
  selectedMainImage,
  setSelectedMainImage,
}: {
  merch: FullMerch;
  selectedMainImage: number;
  setSelectedMainImage: (id: number) => void;
}) => {
  return (
    <div className="flex w-full flex-col items-center md:w-1/2">
      <div className="mb-4">
        <Image
          src={merch.merchandise_pictures[selectedMainImage].picture_url}
          width={500}
          height={500}
          alt={merch.name}
          className="h-[500px] w-full rounded-lg object-cover"
        />
      </div>
      <div className="flex space-x-2 overflow-x-auto">
        {merch.merchandise_pictures.map((pic) => (
          <Image
            key={pic.id}
            src={pic.picture_url}
            width={80}
            height={80}
            alt={`${merch.name} thumbnail`}
            className={`h-20 w-20 cursor-pointer rounded-md object-cover ${
              merch.merchandise_pictures[selectedMainImage].picture_url ===
              pic.picture_url
                ? "border-2 border-emerald-500"
                : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => {
              const id = merch.merchandise_pictures.findIndex((picture) => {
                return picture.id === pic.id;
              });
              setSelectedMainImage(id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MerchPictureDisplay;
