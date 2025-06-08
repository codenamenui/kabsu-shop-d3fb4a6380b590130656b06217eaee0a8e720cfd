import React, { use } from "react";
import { createServerClient } from "@/supabase/clients/createServer";
import { FullMerch } from "@/constants/type";
import FullMerchDisplay from "@/components/merch-find-display";

const MerchandisePage = async ({ params }: { params: { merchId: string } }) => {
  const merchId = params.merchId;
  const supabase = createServerClient();
  let { data: merch, error: merchandiseError } = (await supabase
    .from("merchandises")
    .select(
      `
        id,
        name, 
        description,
        receiving_information,
        online_payment,
        physical_payment,
        merchandise_pictures(id, picture_url), 
        variant_name,
        variants(id, name, picture_url, original_price, membership_price), 
        shops(id, name, logo_url, acronym)
        `,
    )
    .eq("id", merchId)
    .single()) as { data: FullMerch | null; error: any };
  if (merchandiseError || !merch) {
    return <p>No merch found!</p>;
  }

  let {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return <p>Not logged in!</p>;
  }

  let { data: membership_status, error: membershipError } = await supabase
    .from("memberships")
    .select()
    .eq("email", user?.email)
    .eq("shop_id", merch?.shops.id);

  return (
    <>
      {merch ? (
        <FullMerchDisplay
          merch={merch}
          membership={membership_status != null}
        />
      ) : (
        <p>No Merchandise Found!</p>
      )}
    </>
  );
};

export default MerchandisePage;
