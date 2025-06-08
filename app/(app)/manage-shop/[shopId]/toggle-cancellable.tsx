"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { createClient } from "@/supabase/clients/createClient";

const ToggleCancellableButton = ({ merchId }) => {
  const [isCancellable, setIsCancellable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getCancellableStatus = async () => {
      const { data, error } = await supabase
        .from("merchandises")
        .select("cancellable")
        .eq("id", merchId)
        .single();

      if (error) {
        console.error("Error fetching cancellable status:", error);
        return;
      }

      setIsCancellable(data?.cancellable ?? false);
    };

    getCancellableStatus();
  }, [merchId]);

  const toggleCancellable = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("merchandises")
        .update({ cancellable: !isCancellable })
        .eq("id", merchId)
        .select();

      if (error) {
        console.error("Error updating cancellable status:", error);
        return;
      }

      setIsCancellable(!isCancellable);
    } catch (error) {
      console.error("Error toggling cancellable status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleCancellable}
      variant="outline"
      disabled={isLoading}
      className={`w-full ${
        isCancellable
          ? "text-blue-600 hover:text-blue-700"
          : "text-gray-500 hover:text-gray-600"
      }`}
    >
      {isCancellable ? (
        <Unlock className="h-4 w-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ToggleCancellableButton;
