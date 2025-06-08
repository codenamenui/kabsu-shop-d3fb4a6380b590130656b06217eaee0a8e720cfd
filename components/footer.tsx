"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signOut } from "./actions";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  HelpCircle,
  Instagram,
  Twitter,
  Facebook,
  ShoppingCart,
  Info,
  Shield,
} from "lucide-react";

// FAQ Modal Component
const FAQModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const faqItems = [
    {
      question: "How do I order?",
      answer:
        "Browse our products, add to cart, and checkout. Create an account to track your orders.",
    },
    {
      question: "Shipping Information",
      answer:
        "We ship within 2-3 business days. Delivery typically takes 5-7 business days.",
    },
    {
      question: "Return Policy",
      answer:
        "Returns are accepted within 30 days of purchase. Item must be unused and in original packaging.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-900">
            Frequently Asked Questions
          </h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            Close
          </button>
        </div>
        {faqItems.map((faq, index) => (
          <div key={index} className="border-b py-3 last:border-b-0">
            <h3 className="font-semibold text-emerald-800">{faq.question}</h3>
            <p className="mt-1 text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("Sign in error:", error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <>
      {isFAQOpen && (
        <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      )}
      <footer className="flex items-center justify-center bg-emerald-900 p-5 text-sm text-zinc-200">
        <div className="flex items-center gap-4">
          <Link href={"/"} className="transition-colors hover:text-white">
            The Kabsu Shop
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/FAQ"
              className="flex items-center gap-1 hover:text-white"
              title="About Us"
            >
              <Info size={16} />
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
