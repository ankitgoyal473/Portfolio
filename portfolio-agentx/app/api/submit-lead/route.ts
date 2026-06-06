import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, company, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"AGentX Hire" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New hire inquiry from ${name}${company ? ` (${company})` : ""}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "—"}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #F97316;">New Hire Inquiry</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px 0; color: #71717A; width: 80px;">Name</td><td style="padding: 8px 0; color: #F8FAFC;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #71717A;">Email</td><td style="padding: 8px 0; color: #F8FAFC;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #71717A;">Company</td><td style="padding: 8px 0; color: #F8FAFC;">${company || "—"}</td></tr>
          </table>
          <hr style="border-color: #27272A; margin: 16px 0;" />
          <p style="color: #F8FAFC; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submit-lead email error:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
