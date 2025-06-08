"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import MerchandiseDisplay from "@/components/merchandise-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Merch } from "@/constants/type";

const FeaturedProducts = () => {
  const [newArrivals, setNewArrivals] = useState<Merch[]>([]);
  const [popularItems, setPopularItems] = useState<Merch[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Merch[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClientComponentClient();

      // Fetch new arrivals
      const { data: newData } = await supabase
        .from("merchandises")
        .select(
          `
          id,
          name,
          description,
          shops(name, acronym),
          merchandise_pictures(picture_url),
          variants(original_price, membership_price)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(8);

      // Fetch popular items (based on number of orders)
      const { data: merch, error } = await supabase.from("merchandises").select(
        `
        id,
        name,
        description,
        shops(name, acronym),
        merchandise_pictures(picture_url),
        variants(original_price, membership_price)
      `,
      );

      if (error) {
        console.error("Error fetching merchandise:", error);
        return;
      }

      // Fetch orders to calculate merchandise popularity
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("merch_id");

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      // Calculate popularity based on order count
      const merchWithOrderCount = merch.map((item) => {
        const orderCount = orders.filter(
          (order) => order.merch_id === item.id,
        ).length;
        return {
          ...item,
          orderCount,
        };
      });

      // Sort by order count in descending order
      const sortedMerch = merchWithOrderCount.sort(
        (a, b) => b.orderCount - a.orderCount,
      );

      // Take the top 8 most popular items
      const popularData = sortedMerch.slice(0, 8);

      // Fetch featured items (ready for purchase)
      const { data: featuredData } = await supabase
        .from("merchandises")
        .select(
          `
          id,
          name,
          description,
          shops(name, acronym),
          merchandise_pictures(picture_url),
          variants(original_price, membership_price)
        `,
        )
        .eq("ready", true)
        .limit(8);

      if (newData) setNewArrivals(newData as Merch[]);
      if (popularData) setPopularItems(popularData as Merch[]);
      if (featuredData) setFeaturedItems(featuredData as Merch[]);

      if (error) {
        console.error("Error fetching popular items:", error);
      }
    };

    fetchProducts();
  }, []);

  const ProductGrid = ({ products }: { products: Merch[] }) => (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <MerchandiseDisplay key={product.id} merch={product} />
        ))}
      </div>
    </div>
  );

  return (
    <section className="flex flex-col items-center justify-center px-6 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-emerald-800">
        Discover Products
      </h1>
      <Tabs defaultValue="new" className="w-3/4">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="featured">Featured Products</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <ProductGrid products={newArrivals} />
        </TabsContent>
        <TabsContent value="popular">
          <ProductGrid products={popularItems} />
        </TabsContent>
        <TabsContent value="featured">
          <ProductGrid products={featuredItems} />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default FeaturedProducts;
