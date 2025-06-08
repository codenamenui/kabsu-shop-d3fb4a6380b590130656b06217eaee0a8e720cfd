"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/supabase/clients/createClient";

const ToggleReadyButton = ({ merchId }) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const get = async () => {
      const { data, error } = await supabase
        .from("merchandises")
        .select("ready")
        .eq("id", merchId)
        .single();
      setIsReady(data?.ready ?? false);
    };
    get();
  }, []);

  const toggleReady = async () => {
    setIsLoading(true);
    try {
      const { data: ready, error: update } = await supabase
        .from("merchandises")
        .update({ ready: !isReady })
        .eq("id", merchId)
        .select();
      console.log(ready);
      if (update) console.log(update);
      setIsReady(!isReady);
    } catch (error) {
      console.error("Error toggling ready status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleReady}
      variant="outline"
      disabled={isLoading}
      className={`w-full ${isReady ? "text-green-600 hover:text-green-700" : "text-gray-500 hover:text-gray-600"}`}
    >
      {isReady ? (
        <>
          <Eye className="h-4 w-4" />
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
        </>
      )}
    </Button>
  );
};

export default ToggleReadyButton;
