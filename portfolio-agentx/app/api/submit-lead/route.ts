import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      problem,
      workflow,
      timeline,
      budget,
      notes,
      userEmail,
      complexity,
      delivery,
      stack,
      estimateLow,
      estimateHigh,
    } = body;

    if (!problem || !userEmail) {
      return NextResponse.json(
        { success: false, error: "problem and userEmail are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        problem,
        workflow,
        budget,
        timeline,
        complexity,
        delivery,
        stack,
        estimate_low: estimateLow,
        estimate_high: estimateHigh,
        user_email: userEmail,
        notes,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
