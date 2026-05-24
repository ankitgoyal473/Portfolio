import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: Verify Stripe webhook signature
  // const sig = request.headers.get("stripe-signature");
  // const body = await request.text();
  // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  // TODO: Handle specific event types
  // switch (event.type) {
  //   case "checkout.session.completed":
  //     // Grant access to tool
  //     break;
  //   case "customer.subscription.deleted":
  //     // Revoke access
  //     break;
  // }

  return NextResponse.json({ received: true });
}
