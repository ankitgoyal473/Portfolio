import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
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
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping");
    return;
  }
  try {
    await transporter.sendMail({ from: `"AGentX" <${process.env.GMAIL_USER}>`, ...opts });
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}

export function downloadEmail(opts: {
  productName: string;
  downloadUrl: string;
  paymentId: string;
}): { subject: string; html: string } {
  return {
    subject: `Your ${opts.productName} download is ready`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#0A0A0A">Your download is ready</h2>
        <p>Thanks for buying <strong>${opts.productName}</strong>. Your download link is below — it expires in 24 hours.</p>
        <div style="margin:24px 0">
          <a href="${opts.downloadUrl}"
             style="display:inline-block;background:#F97316;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">
            Download ${opts.productName} →
          </a>
        </div>
        <p style="color:#666;font-size:13px">
          Payment ID: <code>${opts.paymentId}</code><br>
          If your link has expired, reply to this email and I'll send a new one.
        </p>
        <p style="color:#666;font-size:13px">— Ankit, AGentX</p>
      </div>
    `,
  };
}

export function adminSaleEmail(opts: {
  productName: string;
  email: string;
  paymentId: string;
}): { subject: string; html: string } {
  return {
    subject: `Sale: ${opts.productName} — ${opts.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2>New Sale</h2>
        <p><strong>${opts.productName}</strong> sold to ${opts.email}</p>
        <p style="font-family:monospace;font-size:13px;color:#666">Payment ID: ${opts.paymentId}</p>
      </div>
    `,
  };
}
