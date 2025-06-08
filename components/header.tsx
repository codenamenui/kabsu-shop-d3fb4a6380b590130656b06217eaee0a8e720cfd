"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { signOut } from "./actions";
import placeholder from "@/assets/placeholder.webp";
import { Bell, Info, ShoppingCart, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

type Category = {
  id: number;
  name: string;
  picture: string;
};

type Shop = {
  id: number;
  acronym: string;
};

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const path = usePathname();
  const params = useParams();
  const shopId = params.slug ?? params.shopId;
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getCategories = async () => {
      const { data, error } = await supabase.from("categories").select();
      setCategories(data);
    };
    getCategories();
  }, []);

  useEffect(() => {
    const getShops = async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("id, acronym");
      setShops(data);
    };
    getShops();
  }, []);

  useEffect(() => {
    const getAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error) {
        setUser(user);
      }
    };
    getAuth();
  }, []);

  // Check for cart items count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }

      const { count } = await supabase
        .from("cart_orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setCartCount(count || 0);
    };

    fetchCartCount();

    // Set up real-time subscription for cart updates
    const channel = supabase
      .channel("cart-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_orders",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          fetchCartCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Check for unseen notifications
  useEffect(() => {
    const checkNotifications = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_notifications")
        .select("seen")
        .eq("user_id", user.id)
        .eq("seen", false)
        .limit(1);

      setHasUnseenNotifications(data && data.length > 0);
    };

    checkNotifications();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          checkNotifications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    const error = await signOut();
    if (!error) {
      setUser(null);
    }
    router.push("/");
  };

  const logInGoogle = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("query", query);
    if (path.includes("/shop")) {
      router.push(`/shop/${shopId}?${queryParams.toString()}`);
    } else {
      router.push(`/search?${queryParams.toString()}`);
    }
  };

  const redirectCategory = (category: Category) => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("category", category.id.toString());
    router.push(`/search?${queryParams.toString()}`);
  };

  const redirectShop = (shop: Shop) => {
    router.push(`/shop/${shop.id}`);
  };

  const redirectAbout = () => {
    router.push(`/FAQ`);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-28">
      <div>
        <Link href={"/"} className="font-bold text-emerald-800">
          The Kabsu Shop
        </Link>
      </div>
      <nav className="flex gap-4">
        <ul className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1" asChild>
              <Button variant="ghost">
                <p>Categories</p>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories?.map((category) => (
                <DropdownMenuItem
                  onClick={() => redirectCategory(category)}
                  key={category.id}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1" asChild>
              <Button variant="ghost">
                <p>Shops</p>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {shops?.map((shop) => (
                <DropdownMenuItem
                  key={shop.id}
                  onClick={() => redirectShop(shop)}
                >
                  {shop.acronym}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" onClick={redirectAbout}>
            <Info size={16} className="" /> <p>FAQ</p>
          </Button>
        </ul>
        <div className="flex">
          <Link href={"/notifications"}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell />
              {hasUnseenNotifications && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </Link>
          <Link href={"/cart"}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href={"/account"}>Go to profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" onClick={logInGoogle}>
              <User />
            </Button>
          )}
        </div>
        <form className="relative" onSubmit={handleSubmit}>
          <button className="absolute left-2 top-2.5" type="submit">
            <Search size={16} />
          </button>
          <Input
            type="search"
            placeholder="Search for a product..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </nav>
    </header>
  );
};

export default Header;
