import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.is_admin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, premium } = await request.json();
  if (!userId || typeof premium !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Update user_metadata flag
  const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { is_premium: premium },
  });
  if (metaError) {
    return NextResponse.json({ error: metaError.message }, { status: 500 });
  }

  if (premium) {
    // Create a permanent admin-granted subscription row so the stream route
    // finds an active subscription and does NOT clear is_premium on first use.
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: "2099-12-31T23:59:59.000Z",
          amount: 0,
          currency: "INR",
          razorpay_payment_id: "admin_grant",
          razorpay_order_id: "admin_grant",
        },
        { onConflict: "user_id", ignoreDuplicates: false }
      );
    if (subError) {
      console.error("set-premium: failed to upsert subscription", subError);
    }
  } else {
    // Revoke: mark the admin-granted subscription as expired
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("razorpay_payment_id", "admin_grant");
  }

  return NextResponse.json({ success: true, userId, premium });
}
