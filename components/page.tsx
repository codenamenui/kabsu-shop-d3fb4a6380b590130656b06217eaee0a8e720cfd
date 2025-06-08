import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewProfile from "@/components/new-profile";
import Membership from "@/components/membership";
import ManagedShops from "@/components/managed-shops";
import Orders from "@/components/orders";

type Shop = {
  id: number;
  name: string;
};

const UserPage = () => {
  return (
    <div className="flex justify-center p-3">
      <Tabs defaultValue="profile" className="w-1/2">
        <div className="mb-2 flex justify-center">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="membership">Membership Request</TabsTrigger>
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
              <ManagedShops />
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
