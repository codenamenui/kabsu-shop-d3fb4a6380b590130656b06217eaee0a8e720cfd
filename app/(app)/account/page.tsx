"use client";

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewProfile from "@/components/new-profile";
import Membership from "@/components/membership";
import ManageShops from "@/components/managed-shop";
import Orders from "@/components/orders";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const UserPage = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectReason = searchParams?.get("redirectReason");
    const timestamp = searchParams?.get("timestamp");

    if (redirectReason) {
      switch (redirectReason) {
        case "unauthorized":
          toast.error("Please log in to access this page");
          break;
        case "incomplete_profile":
          toast.warning("Please complete your profile to continue");
          break;
        case "merch_not_ready":
          toast.info("This merchandise is not yet available");
          break;
        case "admin_access_denied":
          toast.error("You do not have permission to access admin pages");
          break;
        case "shop_management_denied":
          toast.error("You do not have permission to manage this shop");
          break;
        default:
          toast.warning("Unexpected redirect occurred");
      }
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center p-3">
      <Tabs defaultValue="profile" className="w-1/2">
        <div className="mb-2 flex justify-center">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="membership">Memberships</TabsTrigger>
            <TabsTrigger value="shops">Manage Shops</TabsTrigger>
            <TabsTrigger value="orders">View Orders</TabsTrigger>
          </TabsList>
        </div>
        <Card className="">
          <CardContent className="p-4">
            <TabsContent value="profile">
              <NewProfile />
            </TabsContent>
            <TabsContent value="membership">
              <Membership />
            </TabsContent>
            <TabsContent value="shops">
              <ManageShops />
            </TabsContent>
            <TabsContent value="orders">
              <Orders />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default UserPage;
