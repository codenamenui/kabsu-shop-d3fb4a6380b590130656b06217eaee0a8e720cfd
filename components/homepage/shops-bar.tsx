"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import placeholder from "@/assets/placeholder.webp";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Shop = {
  id: number;
  acronym: string;
  logo_url: string;
};

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const getShops = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("shops")
        .select("id, acronym, logo_url");
      setShops(data);
    };
    getShops();
  }, []);

  return (
    <section className="flex h-64 flex-col items-center justify-center gap-6 border-b border-zinc-200 bg-zinc-50">
      <h1 className="text-3xl font-bold text-emerald-800">Shops</h1>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-4/5"
      >
        <CarouselContent>
          {shops?.map((shop) => {
            return (
              <CarouselItem key={shop.id} className="md:basis-1/2 lg:basis-1/4">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-auto items-center justify-center p-6">
                      <Link
                        className="space-y-2"
                        key={shop.id}
                        href={`/shop/${shop.id}`}
                      >
                        <Image
                          width={64}
                          height={64}
                          src={shop.logo_url}
                          alt={`${shop.acronym} logo`}
                          priority
                          className="rounded-full"
                        />
                        <p className="text-center font-semibold">
                          {shop.acronym}
                        </p>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default Shops;
