"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Category = {
  id: number;
  name: string;
  picture_url: string;
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getCategories = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase.from("categories").select();
      setCategories(data);
    };
    getCategories();
  }, []);

  const redirectCategory = (category: Category) => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("category", `${category.id}`);
    router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <section className="flex h-64 flex-col items-center justify-center gap-6 border-b border-zinc-200 bg-zinc-50">
      <h1 className="text-3xl font-bold text-emerald-800">Categories</h1>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-4/5"
      >
        <CarouselContent>
          {categories?.map((category) => {
            return (
              <CarouselItem
                key={category.id}
                className="md:basis-1/2 lg:basis-1/4"
              >
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-auto items-center justify-center p-6">
                      <div
                        role="button"
                        onClick={() => redirectCategory(category)}
                        className="flex flex-col items-center justify-center"
                      >
                        <div className="flex h-16 w-16 items-center justify-center">
                          <Image
                            src={category.picture_url}
                            alt={category.name}
                            width={40}
                            height={40}
                            priority
                          />
                        </div>
                        <h2 className="text-center font-semibold">
                          {category.name}
                        </h2>
                      </div>
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

export default Categories;
