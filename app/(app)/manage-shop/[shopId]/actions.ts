"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function deleteMerch(formData: FormData) {
  const id = formData.get("id");
  const supabase = createServerComponentClient({ cookies });
  const { error } = await supabase.from("merchandises").delete().eq("id", id);
  if (error) {
    console.error(error);
  }
  revalidatePath("");
}
