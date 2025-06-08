import { SupabaseClient } from "@supabase/supabase-js";

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
