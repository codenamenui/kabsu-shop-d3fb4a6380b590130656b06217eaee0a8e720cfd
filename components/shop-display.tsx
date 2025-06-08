"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { Merch, Shop, Category, FullShopInfo } from "@/constants/type";
import SearchSidebar from "@/components/searchpage/sidebar";
import ResultsDisplay from "@/components/searchpage/results";
import { Card } from "@/components/ui/card";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const ShopDisplayCard = ({ shop }: { shop: FullShopInfo | null }) => {
  if (!shop) return null;

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex-shrink-0">
          <Image
            src={shop.logo_url}
            width={100}
            height={100}
            alt={shop.name}
            className="rounded-full object-cover"
          />
        </div>
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
            <p className="text-sm text-gray-600">{shop.colleges?.name}</p>
          </div>
          <div className="space-y-2">
            <a
              href={shop.socmed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <FaFacebook className="h-4 w-4 text-blue-600" />
              <span className="break-all">{shop.socmed_url}</span>
            </a>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MdEmail className="h-4 w-4" />
              <span>{shop.email}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShopDisplayCard;
