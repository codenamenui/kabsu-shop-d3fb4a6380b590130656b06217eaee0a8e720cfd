import React from "react";
import ShopProfilePage from "./shop";
import { createServerClient } from "@/supabase/clients/createServer";
import { College, FullShopInfo } from "@/constants/type";

const Profile = async ({ params }: { params: { shopId: string } }) => {
  const supabase = createServerClient();
  const { data: shop, error } = await supabase
    .from("shops")
    .select(
      "id, name, acronym, email, logo_url, socmed_url, colleges(id, name)",
    )
    .eq("id", params.shopId)
    .returns<FullShopInfo[]>();
  const { data: colleges } = await supabase
    .from("colleges")
    .select()
    .returns<College>();
  return <ShopProfilePage shop={shop?.[0]} colleges={colleges ?? []} />;
};

export default Profile;
