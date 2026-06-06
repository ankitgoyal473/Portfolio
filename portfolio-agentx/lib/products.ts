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
    description: "Searches LinkedIn, Naukri, and Indeed daily. Scores each role, tailors your resume, and applies — all while you sleep.",
    price: 99900,
    color: "#a855f7",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "buyer-config.json template",
      "5 portal playbooks (LinkedIn, Naukri, Indeed, Wellfound, Instahyre)",
      "Resume tailoring guide",
      "Application tracker (CSV)",
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
