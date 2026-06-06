import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getProduct } from "@/lib/products";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { product_slug, email } = await req.json();

  if (!product_slug || !email) {
    return NextResponse.json({ error: "product_slug and email required" }, { status: 400 });
  }

  const product = getProduct(product_slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 400 });
  }

  const order = await razorpay.orders.create({
    amount: product.price,
    currency: "INR",
    receipt: `${product_slug}-${Date.now()}`,
    notes: { product_slug, email },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    productName: product.name,
  });
}
