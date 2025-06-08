import ModifyMerch from "@/components/modify-merch";
import { Category, FetchedMerch } from "@/constants/type";
import { createServerClient } from "@/supabase/clients/createServer";
import React from "react";

const Merch = async ({
  params,
}: {
  params: { merchId: string; shopId: string };
}) => {
  const supabase = createServerClient();
  const { data: merch, error } = await supabase
    .from("merchandises")
    .select(
      "id, name, description, receiving_information, variant_name, online_payment, physical_payment, cancellable, merchandise_pictures(picture_url), variants(id, picture_url, name, original_price, membership_price), merchandise_categories(cat_id), shops(id)",
    )
    .eq("id", params.merchId)
    .returns<FetchedMerch>()
    .single();
  const { data: categories } = await supabase
    .from("categories")
    .select()
    .returns<Category[]>();

  return (
    <div className="flex justify-center py-4">
      <ModifyMerch
        merch={merch ?? null}
        categories={categories ?? []}
        shopId={params.shopId}
      />
    </div>
  );
};

export default Merch;
