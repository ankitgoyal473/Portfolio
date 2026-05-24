import { NextResponse } from "next/server";

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

    // Log formatted "email" that would be sent to Ankit
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AGentX Lead] New lead — ${problem}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Problem: ${problem}
Workflow: ${workflow}
Budget: ${budget}
Timeline: ${timeline}
Complexity: ${complexity}
Delivery: ${delivery}
Stack: ${stack}
Estimate: $${estimateLow.toLocaleString()} – $${estimateHigh.toLocaleString()}
Email: ${userEmail || "Not provided"}
Notes: ${notes || "None"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    return NextResponse.json({
      success: true,
      id: crypto.randomUUID(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
