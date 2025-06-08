"use client";

import { Button } from "@/components/ui/button";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import React from "react";
import { FaGoogle } from "react-icons/fa";

export default function Welcome({ user }: { user: User | null }) {
  const logInGoogle = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClientComponentClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
      },
    });
  };

  return (
    <section className="flex h-96 flex-col items-center justify-center gap-2 border-b border-zinc-200 px-10 text-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-zinc-50 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <h1 className="w-11/12 text-6xl font-bold text-emerald-800">
        Your One-Stop Shop for Student Organization Merchandise
      </h1>
      <p className="text-lg">
        A digital marketplace exclusive for all student organization merchandise
        in Cavite State University
      </p>
      <div className="flex gap-4">
        {!user && (
          <Button onClick={logInGoogle} variant="outline">
            <FaGoogle />
            Sign in
          </Button>
        )}
        <Button>
          <Link href={"/search"}>Shop now</Link>
        </Button>
      </div>
    </section>
  );
}
