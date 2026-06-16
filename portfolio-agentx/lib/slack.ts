// Slack notifier — posts to an Incoming Webhook if SLACK_WEBHOOK_URL is set.
// Graceful no-op when unset (mirrors lib/email.ts behaviour). Never throws.

export async function notifySlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return; // not configured — skip silently
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("[slack] notify failed:", err);
  }
}

export function leadSlackMessage(opts: {
  name?: string;
  email?: string;
  company?: string;
  summary: string;
  source: string;
}): string {
  const { name, email, company, summary, source } = opts;
  const who = [name, company && `(${company})`].filter(Boolean).join(" ") || "Unknown";
  const contact = email ? `📧 ${email}` : "⚠️ no email captured";
  return `🟢 *New lead — ${source}*\n*From:* ${who}  ·  ${contact}\n${summary}`;
}

export function saleSlackMessage(opts: {
  productName: string;
  email: string;
  paymentId: string;
}): string {
  return `💰 *New sale — ${opts.productName}*\n*Buyer:* ${opts.email}\n*Payment:* ${opts.paymentId}`;
}
