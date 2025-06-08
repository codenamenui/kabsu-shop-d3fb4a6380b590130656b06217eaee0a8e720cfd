"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Building2 } from "lucide-react";
import ShopCard from "./shop-card";
import { ManagedShop } from "@/constants/type";

const ManageShops = () => {
  const [managedShops, setManagedShops] = useState<
    { shops: ManagedShop }[] | null
  >(null);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchManagedShops = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("officers")
          .select("shops(id, name, acronym, logo_url)")
          .eq("user_id", user?.id)
          .returns<{ shops: ManagedShop }[]>();

        if (error) throw error;
        setManagedShops(data);
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchManagedShops();
  }, []);

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Managed Shops</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage the shops you are an officer of
        </p>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-600">
              Error loading managed shops: {error.message}
            </p>
          </Card>
        )}

        {managedShops === null ? (
          <div>Loading...</div>
        ) : managedShops.length === 0 ? (
          <Card className="bg-gray-50 py-12">
            <div className="text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                You are not managing any shops yet.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {managedShops.map((s) => {
              const shop = s.shops;
              return <ShopCard shop={shop} manage={true} key={shop?.id} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageShops;
