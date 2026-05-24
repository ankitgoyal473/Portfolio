import { NextResponse } from "next/server";

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

    if (status === "accepted") {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AGentX] Lead ACCEPTED — ${id}
Sending acceptance email with Calendly link
${note ? `Note: ${note}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } else {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AGentX] Lead DECLINED — ${id}
Sending decline email
${note ? `Note: ${note}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
