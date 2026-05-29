import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status, note } = body;

    if (!id || !["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid id or status" },
        { status: 400 }
      );
    }

    const updatePayload: { status: string; ankit_note?: string } = { status };
    if (note !== undefined && note !== null) {
      updatePayload.ankit_note = note;
    }

    const { error } = await supabaseAdmin
      .from("leads")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
