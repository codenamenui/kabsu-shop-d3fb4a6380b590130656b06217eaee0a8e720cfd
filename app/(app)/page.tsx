"use client";

import FeaturedProducts from "@/components/features";
import Categories from "@/components/homepage/categories-bar";
import Welcome from "@/components/homepage/greetings-bar";
import Shops from "@/components/homepage/shops-bar";
import { createClient } from "@/supabase/clients/createClient";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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
    <div className="flex flex-col">
      <Welcome user={user} />
      <Categories />
      <Shops />
      <FeaturedProducts />
    </div>
  );
}
