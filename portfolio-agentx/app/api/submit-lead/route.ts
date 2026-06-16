import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifySlack, leadSlackMessage } from "@/lib/slack";

type LeadPayload = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  // structured fields from the Discovery chat widget
  problem?: string;
  workflow?: string;
  timeline?: string;
  budget?: string;
  complexity?: string;
  delivery?: string;
  stack?: string;
  estimateLow?: number;
  estimateHigh?: number;
  source?: string; // "hire" | "discovery"
  website?: string; // honeypot — real users leave this empty
};

export async function POST(req: Request) {
  const body = (await req.json()) as LeadPayload;
  const {
    name,
    email,
    company,
    message,
    problem,
    workflow,
    timeline,
    budget,
    complexity,
    delivery,
    stack,
    estimateLow,
    estimateHigh,
    source = "hire",
    website,
  } = body;

  // Honeypot — bots fill hidden fields; humans don't. Pretend success.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  // A lead is only useful if we can reach them. Require email + something to act on.
  const description = (problem || message || "").trim();
  if (!email || !description) {
    return NextResponse.json(
      { error: "Email and a description of what you need are required." },
      { status: 400 }
    );
  }

  const notesParts = [
    name && `Name: ${name}`,
    company && `Company: ${company}`,
    `Source: ${source}`,
    message && problem && `Message: ${message}`,
  ].filter(Boolean);

  // 1. Persist to leads table FIRST — this is the durable record of truth.
  let dbOk = false;
  try {
    const { error } = await supabaseAdmin.from("leads").insert({
      problem: description,
      workflow: workflow ?? null,
      timeline: timeline ?? null,
      budget: budget ?? null,
      complexity: complexity ?? null,
      delivery: delivery ?? null,
      stack: stack ?? null,
      estimate_low: estimateLow ?? null,
      estimate_high: estimateHigh ?? null,
      user_email: email,
      notes: notesParts.join(" · "),
      status: "pending",
    });
    if (error) console.error("[submit-lead] DB insert error:", error.message);
    else dbOk = true;
  } catch (err) {
    console.error("[submit-lead] DB insert threw:", err);
  }

  // 2. Notify by email (best-effort).
  let emailOk = false;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const summaryRows = [
      ["Name", name || "—"],
      ["Email", email],
      ["Company", company || "—"],
      ["Source", source],
      ["Problem", description],
      ["Workflow", workflow || "—"],
      ["Timeline", timeline || "—"],
      ["Budget", budget || "—"],
      estimateLow && estimateHigh
        ? ["Estimate", `$${estimateLow.toLocaleString()}–$${estimateHigh.toLocaleString()} (${complexity || "?"} · ${delivery || "?"})`]
        : null,
      stack ? ["Stack", stack] : null,
    ].filter(Boolean) as [string, string][];

    await transporter.sendMail({
      from: `"AGentX Lead" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New ${source} lead from ${name || email}${company ? ` (${company})` : ""}`,
      text: summaryRows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #F97316;">New ${source} lead${dbOk ? "" : " ⚠️ (DB save failed — this email is the only copy)"}</h2>
          <table style="border-collapse: collapse; width: 100%;">
            ${summaryRows
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:8px 0;color:#71717A;width:90px;vertical-align:top;">${k}</td><td style="padding:8px 0;color:#111;">${v}</td></tr>`
              )
              .join("")}
          </table>
        </div>`,
    });
    emailOk = true;
  } catch (err) {
    console.error("[submit-lead] email error:", err);
  }

  // 3. Slack ping (best-effort, graceful no-op without webhook).
  void notifySlack(
    leadSlackMessage({
      name,
      email,
      company,
      source,
      summary: [description, budget && `Budget: ${budget}`, timeline && `Timeline: ${timeline}`]
        .filter(Boolean)
        .join(" · "),
    })
  );

  // Success only if the lead is durably captured somewhere.
  if (!dbOk && !emailOk) {
    return NextResponse.json(
      { error: "Could not save your message. Please email ankitgoyal473@gmail.com directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
