"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function signOut() {
    const sOut = async () => {
        const supabase = createServerComponentClient({ cookies });
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error();
        }
        return error;
    };
    return await sOut();
}
