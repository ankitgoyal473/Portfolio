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

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select(
      "id, user_id, status, started_at, expires_at, razorpay_payment_id, amount, currency"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with user emails from auth.users
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const userMap = Object.fromEntries(
    (users?.users ?? []).map((u) => [
      u.id,
      {
        email: u.email ?? "",
        name: u.user_metadata?.full_name ?? u.email ?? "",
      },
    ])
  );

  const enriched = (data ?? []).map((s) => ({
    ...s,
    user_email: userMap[s.user_id]?.email ?? "",
    user_name: userMap[s.user_id]?.name ?? "",
    amount_formatted: `₹${(s.amount / 100).toFixed(0)}`,
  }));

  return NextResponse.json(enriched);
}
