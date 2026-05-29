import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(
      `Webhook signature verification failed: ${(err as Error).message}`,
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (!userId) {
      return new Response("No client_reference_id in session", { status: 400 });
    }

    // Delete rows for all 3 agents — fully resets usage so getUsage returns 'fresh' stage
    const { error } = await supabaseAdmin
      .from("agent_usage")
      .delete()
      .eq("user_id", userId)
      .in("agent_id", ["warren", "sherlock", "harvey"]);

    if (error) {
      console.error("Failed to reset usage:", error);
      return new Response("DB error", { status: 500 });
    }

    console.log(`Unlocked user ${userId} after payment`);
  }

  return new Response("ok", { status: 200 });
}
