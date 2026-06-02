import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, expiryReminderEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Internal-only endpoint — requires secret header set by edge stream route
  const token = request.headers.get("x-internal-token");
  if (!token || token !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriptionId, userId, userEmail, userName, expiresAt, daysLeft, appUrl } =
    await request.json();

  if (!subscriptionId || !userId || !userEmail) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    const reminderEmail = expiryReminderEmail({ name: userName ?? "there", expiresAt, daysLeft, appUrl });
    await sendEmail({ to: userEmail, ...reminderEmail });
    // Ownership filter: only update the subscription belonging to this user
    await supabaseAdmin
      .from("subscriptions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", subscriptionId)
      .eq("user_id", userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-reminder error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
