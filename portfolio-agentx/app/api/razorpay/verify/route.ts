import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/products";
import { sendEmail, downloadEmail, adminSaleEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, product_slug, email } =
    await req.json();

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !product_slug || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. HMAC verify
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // 2. Validate product
  const product = getProduct(product_slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 400 });
  }

  // 3. Insert purchase (idempotent — unique constraint on payment_id)
  await supabaseAdmin
    .from("purchases")
    .upsert(
      { email, product_slug, razorpay_payment_id, razorpay_order_id },
      { onConflict: "razorpay_payment_id", ignoreDuplicates: true }
    );

  // 4. Generate signed download URL (24h)
  const { data: urlData, error: urlError } = await supabaseAdmin.storage
    .from("solutions")
    .createSignedUrl(`${product_slug}.zip`, 60 * 60 * 24);

  if (urlError || !urlData?.signedUrl) {
    console.error("[verify] Storage signed URL error:", urlError);
    // Fire admin alert, return fallback message
    await sendEmail({
      to: process.env.GMAIL_USER!,
      ...adminSaleEmail({ productName: product.name, email, paymentId: razorpay_payment_id }),
    });
    return NextResponse.json({
      downloadUrl: null,
      productSlug: product_slug,
      fallback: true,
    });
  }

  // 5. Send download email (fire-and-forget)
  sendEmail({
    to: email,
    ...downloadEmail({
      productName: product.name,
      downloadUrl: urlData.signedUrl,
      paymentId: razorpay_payment_id,
    }),
  });

  // 6. Send admin notification
  sendEmail({
    to: process.env.GMAIL_USER!,
    ...adminSaleEmail({ productName: product.name, email, paymentId: razorpay_payment_id }),
  });

  return NextResponse.json({ downloadUrl: urlData.signedUrl, productSlug: product_slug });
}
