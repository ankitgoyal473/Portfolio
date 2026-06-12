export type Product = {
  slug: string
  name: string
  tagline: string
  description: string
  price: number          // paise (99900 = ₹999)
  color: string          // persona accent hex
  whatYouGet: string[]
}

export const PRODUCTS: Product[] = [
  {
    slug: "rudy",
    name: "Rudy",
    tagline: "Autonomous job search & apply",
    description: "Runs on your laptop daily. Searches Naukri, Hirist, and LinkedIn for roles matching your salary and location targets. Scores every listing, tailors your resume with ATS keywords, applies via Playwright, and logs each application to a CSV tracker — all unattended.",
    price: 99900,
    color: "#a855f7",
    whatYouGet: [
      "CLAUDE.md — full pipeline (Phases 0–7: search → score → tailor → apply → track)",
      "buyer-config.example.json — your profile, CTC targets, locations, and portal list",
      "docs/portals.md — 5 platform playbooks (Naukri, Hirist, LinkedIn, Wellfound, Instahyre)",
      "resume/master_resume.md — ATS-optimized template + keyword upgrade map",
      "tracker.csv + state/ — application log, dedup store, session state",
      "start-chrome.ps1 / .sh — one-command Chrome launcher (Windows + Mac/Linux)",
    ],
  },
  {
    slug: "warren",
    name: "Warren",
    tagline: "Stock research agent",
    description: "Give it any ticker. It pulls fundamentals, technicals, and web sentiment — and returns a full investment research report in minutes.",
    price: 99900,
    color: "#f0b429",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "config.json template",
      "6-pillar analysis framework",
      "NSE + NYSE + NASDAQ support",
    ],
  },
  {
    slug: "sherlock",
    name: "Sherlock",
    tagline: "Deep research & investigation",
    description: "Give it a topic, person, or company. It searches the web, synthesises sources, and delivers a structured research report.",
    price: 99900,
    color: "#4a9eff",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "config.json template",
      "Research report template",
      "Source citation guide",
    ],
  },
  {
    slug: "harvey",
    name: "Harvey",
    tagline: "Email & outreach agent",
    description: "Drafts cold emails, follow-ups, and LinkedIn messages tailored to each prospect. Tracks threads and suggests next actions.",
    price: 99900,
    color: "#00c896",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "config.json template",
      "Cold email playbook",
      "Follow-up sequence templates",
    ],
  },
]

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}
