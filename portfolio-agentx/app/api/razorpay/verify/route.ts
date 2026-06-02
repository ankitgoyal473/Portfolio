import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  sendEmail,
  buyerConfirmationEmail,
  adminNotificationEmail,
} from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    await request.json();

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Insert subscription row (30-day active subscription)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await supabaseAdmin.from("subscriptions").insert({
    user_id: user.id,
    status: "active",
    expires_at: expiresAt.toISOString(),
    razorpay_payment_id,
    razorpay_order_id,
    amount: 99900,
    currency: "INR",
  });

  // Set is_premium: true in user metadata
  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { is_premium: true },
  });

  // Reset usage for all 3 agents (non-critical — subscription is active regardless)
  try {
    await supabaseAdmin
      .from("agent_usage")
      .delete()
      .eq("user_id", user.id)
      .in("agent_id", ["warren", "sherlock", "harvey"]);
  } catch (resetErr) {
    // Non-critical — subscription is active. Log and continue.
    console.error("verify: failed to reset agent_usage (non-fatal)", resetErr);
  }

  // Send confirmation emails (graceful — never throws)
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://portfolio-one-topaz-65.vercel.app";
  const userName =
    user.user_metadata?.full_name ?? user.email ?? "there";

  const buyerEmail = buyerConfirmationEmail({
    name: userName,
    expiresAt: expiresAt.toISOString(),
    paymentId: razorpay_payment_id,
    appUrl,
  });
  await sendEmail({ to: user.email!, ...buyerEmail });

  const adminEmail = adminNotificationEmail({
    name: userName,
    email: user.email!,
    expiresAt: expiresAt.toISOString(),
    paymentId: razorpay_payment_id,
    appUrl,
  });
  await sendEmail({
    to: process.env.GMAIL_USER ?? "ankitgoyal473@gmail.com",
    ...adminEmail,
  });

  return NextResponse.json({ success: true });
}
