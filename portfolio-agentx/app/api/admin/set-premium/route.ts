import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Auth check — must be admin
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.is_admin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, premium } = await request.json();
  if (!userId || typeof premium !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Update raw_user_meta_data
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { is_premium: premium },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId, premium });
}
