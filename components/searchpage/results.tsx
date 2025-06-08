import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Merch, Shop } from "@/constants/type";
import MerchandiseDisplay from "../merchandise-display";

const ResultsDisplay = ({
  setSort,
  query,
  results,
  inShop,
}: {
  setSort: React.Dispatch<React.SetStateAction<string>>;
  query: string;
  results: Merch[];
  inShop?: boolean;
}) => {
  return (
    <div className={`${!inShop && "px-6"} flex-1 space-y-2 py-2`}>
      <div className="flex items-center gap-2">
        <Select onValueChange={(val) => setSort(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Latest</SelectItem>
            <SelectItem value="ascending">Price: ascending</SelectItem>
            <SelectItem value="descending">Price: descending</SelectItem>
          </SelectContent>
        </Select>
        {query && (
          <h5 className="text-zinc-500">
            Search Results for:{" "}
            <span className="font-semibold text-zinc-600">{query}</span>
          </h5>
        )}
      </div>
      <div className="">
        <div className="grid grid-cols-4 gap-4">
          {results?.map((merch: Merch) => {
            if (merch.ready)
              return <MerchandiseDisplay merch={merch} key={merch.id} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
