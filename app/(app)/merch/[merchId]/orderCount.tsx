import { createClient } from "@/supabase/clients/createClient";
import { createServerClient } from "@/supabase/clients/createServer";
import { useState, useEffect } from "react";

const OrderCountDisplay = ({ merchId }) => {
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        // Replace with your actual API endpoint
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select()
          .eq("merch_id", merchId);
        setOrderCount(data?.length ?? 0);
      } catch (error) {
        console.error("Error fetching order count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (merchId) {
      fetchOrderCount();
    }
  }, [merchId]);

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <div className="text-gray-500">Counting</div>
      ) : (
        <>
          <span className="font-medium">Pre-orders:</span>
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            {orderCount}
          </span>
        </>
      )}
    </div>
  );
};

export default OrderCountDisplay;
