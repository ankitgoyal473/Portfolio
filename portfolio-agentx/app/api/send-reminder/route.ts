import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, expiryReminderEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { subscriptionId, userEmail, userName, expiresAt, daysLeft, appUrl } =
    await request.json();

  if (!subscriptionId || !userEmail) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    const reminderEmail = expiryReminderEmail({ name: userName ?? "there", expiresAt, daysLeft, appUrl });
    await sendEmail({ to: userEmail, ...reminderEmail });
    await supabaseAdmin
      .from("subscriptions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", subscriptionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-reminder error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
