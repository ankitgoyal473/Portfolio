import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email send");
    return;
  }
  try {
    await transporter.sendMail({
      from: `"AGentX" <${process.env.GMAIL_USER}>`,
      ...opts,
    });
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}

export function buyerConfirmationEmail(opts: {
  name: string;
  expiresAt: string;
  paymentId: string;
  appUrl: string;
}): { subject: string; html: string } {
  const expiryFormatted = new Date(opts.expiresAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  return {
    subject: "You're in — AGentX Pro is active ✓",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#E8D5B8">AGentX Pro — Active</h2>
        <p>Hi ${opts.name},</p>
        <p>Your AGentX Pro subscription is now active. Warren, Sherlock &amp; Harvey are all yours — unlimited runs.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px 0;color:#666">Active until</td><td style="padding:8px 0;font-weight:bold">${expiryFormatted}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Payment ID</td><td style="padding:8px 0;font-family:monospace;font-size:13px">${opts.paymentId}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Amount</td><td style="padding:8px 0;font-weight:bold">₹999</td></tr>
        </table>
        <a href="${opts.appUrl}/agents/warren" style="display:inline-block;background:#E8D5B8;color:#0A0A0A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Open AGentX →</a>
        <p style="margin-top:24px;color:#666;font-size:13px">Questions? Reply to this email.<br>— Ankit</p>
      </div>
    `,
  };
}

export function adminNotificationEmail(opts: {
  name: string;
  email: string;
  expiresAt: string;
  paymentId: string;
  appUrl: string;
}): { subject: string; html: string } {
  const expiryFormatted = new Date(opts.expiresAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  return {
    subject: `💰 New AGentX subscriber — ${opts.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2>New Subscriber 🎉</h2>
        <p><strong>${opts.name}</strong> (${opts.email}) just paid ₹999 for AGentX Pro.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px 0;color:#666">Expires</td><td style="padding:8px 0">${expiryFormatted}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Payment ID</td><td style="padding:8px 0;font-family:monospace;font-size:13px">${opts.paymentId}</td></tr>
        </table>
        <a href="${opts.appUrl}/admin" style="display:inline-block;background:#1a1a1a;color:#E8D5B8;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View in Admin →</a>
      </div>
    `,
  };
}

export function expiryReminderEmail(opts: {
  name: string;
  expiresAt: string;
  daysLeft: number;
  appUrl: string;
}): { subject: string; html: string } {
  const expiryFormatted = new Date(opts.expiresAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  return {
    subject: `Your AGentX Pro expires in ${opts.daysLeft} days`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#f0b429">⚠ Subscription Expiring Soon</h2>
        <p>Hi ${opts.name},</p>
        <p>Your AGentX Pro subscription expires on <strong>${expiryFormatted}</strong> — ${opts.daysLeft} days from now.</p>
        <p>Renew now to keep Warren, Sherlock &amp; Harvey running without interruption.</p>
        <a href="${opts.appUrl}/agents/warren" style="display:inline-block;background:#E8D5B8;color:#0A0A0A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Renew for ₹999 →</a>
        <p style="margin-top:24px;color:#666;font-size:13px">— Ankit, AGentX</p>
      </div>
    `,
  };
}
