import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LIMITS } from "@/lib/paywall";
import { NextResponse } from "next/server";

const analysisContent = `> Analyzing AAPL (Apple Inc.)...

=== WARREN BUFFETT STYLE ANALYSIS ===

BUSINESS QUALITY: A+
Apple possesses one of the strongest consumer brands ever built. The ecosystem lock-in creates a switching cost moat that competitors cannot replicate easily.

MOAT ASSESSMENT: Wide & Durable
- Brand Power: 9.5/10
- Switching Costs: 9/10
- Network Effects: 8/10
- Cost Advantages: 7/10

FINANCIAL HEALTH:
- Revenue: $383B (growing 8% YoY)
- FCF Margin: 26.4%
- ROIC: 58.7% (exceptional)
- Debt/Equity: 1.73 (manageable)

INTRINSIC VALUE ESTIMATE:
Using a 10-year DCF with 7% growth declining to 3% terminal: ~$198/share

VERDICT: BUY at current levels.
Apple remains a wonderful business at a fair price. The Services segment provides recurring revenue visibility that Mr. Market undervalues.

"Price is what you pay. Value is what you get." — Warren Buffett`;

export async function GET() {
  // Server-side paywall enforcement
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: usageRow } = await supabase
      .from("agent_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("agent_id", "warren")
      .single();

    const usedCount = usageRow?.count ?? 0;
    const limit = LIMITS["warren"] ?? 1;

    if (usedCount >= limit) {
      return NextResponse.json(
        { error: "paywall", message: "Usage limit reached" },
        { status: 403 }
      );
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const words = analysisContent.split(" ");

      for (const word of words) {
        const chunk = encoder.encode(word + " ");
        controller.enqueue(chunk);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
