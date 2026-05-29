import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.is_admin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name: u.user_metadata?.full_name ?? u.email ?? "Unknown",
    is_premium: u.user_metadata?.is_premium === true,
    is_admin: u.user_metadata?.is_admin === true,
    created_at: u.created_at,
  }));

  return NextResponse.json(users);
}
