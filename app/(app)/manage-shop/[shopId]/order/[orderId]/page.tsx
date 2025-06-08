"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Save, Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const EditOrder = ({
  params,
}: {
  params: {
    orderId: string;
  };
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variants, setVariants] = useState<
    Array<{
      id: number;
      name: string;
      original_price: number;
      membership_price: number;
    }>
  >([]);
  const [formData, setFormData] = useState({
    quantity: 0,
    online_payment: false,
    physical_payment: false,
    variant_id: 0,
    price: 0,
    merchandiseName: "",
    variantName: "",
    user_id: "",
    merch_id: 0,
  });
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      const supabase = createClient();

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          merchandises(id, name),
          variants(id, name)
        `,
        )
        .eq("id", params.orderId)
        .single();

      if (orderError) {
        toast.error("Error fetching order data");
        return;
      }

      if (orderData) {
        // Fetch all variants for this merchandise
        const { data: variantData } = await supabase
          .from("variants")
          .select("*")
          .eq("merch_id", orderData.merchandises.id);

        if (variantData) {
          setVariants(variantData);
        }

        // Check membership status
        const { data: membershipData } = await supabase
          .from("memberships")
          .select("*")
          .eq("shop_id", orderData.shop_id)
          .eq("email", orderData.user_id);

        setIsMember(!!membershipData?.length);

        // Set initial form data
        setFormData({
          quantity: orderData.quantity,
          online_payment: orderData.online_payment,
          physical_payment: orderData.physical_payment,
          variant_id: orderData.variant_id,
          price: orderData.price,
          merchandiseName: orderData.merchandises.name,
          variantName: orderData.variants.name,
          user_id: orderData.user_id,
          merch_id: orderData.merchandises.id,
        });
      }

      setIsLoading(false);
    };

    fetchOrderData();
  }, [params.orderId]);

  const calculatePrice = (quantity: number, variantId: number) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return 0;
    return (
      quantity * (isMember ? variant.membership_price : variant.original_price)
    );
  };

  const handleVariantChange = (variantId: string) => {
    const newPrice = calculatePrice(formData.quantity, parseInt(variantId));
    setFormData((prev) => ({
      ...prev,
      variant_id: parseInt(variantId),
      price: newPrice,
    }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    const newPrice = calculatePrice(newQuantity, formData.variant_id);
    setFormData((prev) => ({
      ...prev,
      quantity: newQuantity,
      price: newPrice,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("orders")
        .update({
          quantity: formData.quantity,
          online_payment: formData.online_payment,
          physical_payment: formData.physical_payment,
          variant_id: formData.variant_id,
          price: formData.price,
        })
        .eq("id", params.orderId);

      if (error) throw error;

      toast.success("Order updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex justify-center py-4">
      <Card className="w-full max-w-3xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShoppingCart className="h-6 w-6" />
              Edit Order
            </CardTitle>
            <CardDescription className="text-base">
              Update order #{params.orderId} details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Package className="h-5 w-5" />
                Order Information
              </h3>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Merchandise</Label>
                    <Input value={formData.merchandiseName} disabled />
                  </div>
                  <div>
                    <Label>Variant</Label>
                    <Select
                      value={formData.variant_id.toString()}
                      onValueChange={handleVariantChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem
                            key={variant.id}
                            value={variant.id.toString()}
                          >
                            {variant.name} ({"P "}
                            {isMember
                              ? variant.membership_price
                              : variant.original_price}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label>Total Price</Label>
                    <Input value={`P ${formData.price}`} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Methods
                  </Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.online_payment ? "default" : "outline"}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          online_payment: !prev.online_payment,
                        }))
                      }
                    >
                      Online Payment
                    </Button>
                    <Button
                      type="button"
                      variant={
                        formData.physical_payment ? "default" : "outline"
                      }
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          physical_payment: !prev.physical_payment,
                        }))
                      }
                    >
                      Physical Payment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting ||
                (!formData.online_payment && !formData.physical_payment)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Order
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditOrder;
