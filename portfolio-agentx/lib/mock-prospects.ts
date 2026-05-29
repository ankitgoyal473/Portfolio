export interface Prospect {
  name: string;
  company: string;
  title: string;
  opener: string;
}

interface ProspectBase {
  name: string;
  company: string;
  title: string;
}

const PROSPECT_BASES: ProspectBase[] = [
  { name: "Sarah Chen", company: "Stripe", title: "VP of Engineering" },
  { name: "Marcus Johnson", company: "Figma", title: "Head of Growth" },
  { name: "Priya Patel", company: "Notion", title: "Director of Product" },
  { name: "David Kim", company: "Linear", title: "CTO" },
  { name: "Rachel Torres", company: "Vercel", title: "VP of Sales" },
  { name: "James Wright", company: "Plaid", title: "Chief Revenue Officer" },
  { name: "Aisha Mohammed", company: "Retool", title: "Head of Partnerships" },
  { name: "Ben Schwartz", company: "Supabase", title: "VP of Marketing" },
  { name: "Lisa Nakamura", company: "Datadog", title: "Director of Engineering" },
  { name: "Carlos Rivera", company: "Amplitude", title: "Head of Product" },
  { name: "Emily Foster", company: "Webflow", title: "Chief Strategy Officer" },
  { name: "Derek Okafor", company: "Airtable", title: "VP of Business Development" },
  { name: "Hannah Petrov", company: "Loom", title: "Director of Sales" },
  { name: "Alex Nguyen", company: "Clerk", title: "Head of Engineering" },
  { name: "Megan Walsh", company: "Resend", title: "VP of Operations" },
];

const EXECUTIVE_OPENERS: string[] = [
  "Your Q4 earnings call mentioned a 23% efficiency gap in outbound — our clients close that in 6 weeks. Worth 15 minutes?",
  "I noticed {company} expanded headcount 40% this year. Most teams at that scale lose 18% pipeline velocity — we prevent that.",
  "Three of your direct competitors adopted AI-driven outbound last quarter. The early movers are seeing 3.2x reply rates.",
  "Your board deck likely shows CAC trending up. We reduced CAC by 34% for a company at your exact stage and ACV.",
  "{name}, your LinkedIn post on scaling GTM resonated. The data backs it — teams using personalized AI outreach see 2.8x conversions.",
  "At {company}'s revenue scale, every 1% improvement in reply rate equals ~$420K ARR. We typically deliver 3-5%.",
  "I analyzed {company}'s ICP overlap with our top performer — 89% match. Their pipeline grew 67% in 90 days.",
  "Your Series C signals aggressive growth targets. The #1 bottleneck at this stage is outbound quality at scale — solved.",
  "ROI question: if Harvey wrote 500 personalized openers per week at your current close rate, that is $1.2M net new pipeline.",
  "{name}, the {title} role at {company} means you own pipeline. What if your reps never wrote a cold email again?",
  "Benchmarking {company} against peers: you are likely leaving 40% of addressable pipeline on the table with templated outreach.",
  "Your Glassdoor reviews mention rep burnout on prospecting. Harvey eliminates 4 hours per rep per day of manual writing.",
  "I mapped {company}'s TAM expansion into enterprise — the outbound motion that got you here will not get you there. New approach needed.",
  "Post-funding, {company} needs to show efficient growth. Our AI outreach cuts cost-per-meeting by 52% vs SDR-written.",
  "The {company} pricing page change last month suggests market pressure. Winning on outbound quality is how you fight back.",
];

const FRIENDLY_OPENERS: string[] = [
  "Hey {name}! Saw your talk at SaaStr — the bit about scaling culture while growing fast was spot on. Quick thought on making your outbound just as thoughtful.",
  "Hi {name} — congrats on the {company} rebrand, it looks incredible! Random question: are your reps spending more time writing emails or actually selling?",
  "Love what {company} is building. Quick one — what if every cold email your team sent felt as polished as your product?",
  "{name}! Your tweet about hiring challenges cracked me up. What if I told you AI could take prospecting off your team's plate entirely?",
  "Hey! Fellow {company} fan here (seriously, use it daily). Thought you might geek out over what AI-written cold emails are doing for reply rates.",
  "Hi {name} — saw you just hit your 3-year anniversary at {company}. That is awesome! Quick question about how your outbound has evolved since you joined.",
  "Your product is delightful — figured your outreach should match. We help teams like yours sound human at scale (not robotic, promise).",
  "Hey {name}! Noticed {company} is hiring 4 SDRs. Before you ramp them: what if each one had an AI writing partner from day one?",
  "Hi! Huge fan of {company}'s approach to developer experience. We took that same obsession with craft and applied it to cold outreach.",
  "{name}! Your LinkedIn post about remote work got me thinking — remote sales teams need even better outbound since they cannot rely on event intros.",
  "Congrats on the G2 leader badge! Your customers clearly love {company}. Let us help your prospects feel that love in the first email too.",
  "Hey {name}, quick story: one of your competitors told us their top SDR was being outperformed by our AI. She was not mad — she was relieved.",
  "Hi! I keep seeing {company} pop up in my feed (great content team!). Curious if your outbound gets the same creative energy as your marketing.",
  "{name} — your Substack on GTM strategy was chef's kiss. One thing I would add: personalization at scale is now possible without sacrificing quality.",
  "Hey! Weird opener but — I asked Harvey to write a cold email to you, and honestly it was better than anything I could write. Want to see it?",
];

const DIRECT_OPENERS: string[] = [
  "{name} — AI-written cold emails. 3x reply rates. 15 min demo. Interested?",
  "Your outbound is underperforming. I can prove it in one email. Let Harvey write to your top prospect and compare.",
  "{company} is scaling outbound. You need personalization at volume. Harvey does both. Free trial, no card.",
  "Two numbers: 47% average reply rate. Zero hours writing. That is Harvey for {company}.",
  "{name}, quick pitch: Harvey writes better cold emails than your best SDR. We will prove it or buy you lunch.",
  "Saw {company} hiring SDRs. Before you spend $80K per head: Harvey costs $29/mo and never calls in sick.",
  "Your competitors are using AI outbound. You are not. That gap widens every week. Fix it?",
  "{name} — 500 personalized emails per week. Each one researched. Each one different. $29/month. Demo?",
  "I will be direct: {company} is leaving money on the table with templated outreach. Harvey fixes that today.",
  "One question, {name}: if you could 3x your pipeline without hiring, would you take 15 minutes to see how?",
  "Harvey wrote 15 openers for {company}'s ICP in 30 seconds. They are good. Want to see them?",
  "{company} + Harvey = pipeline problem solved. Seriously. 5-minute demo, you will see.",
  "Skip the pleasantries: AI-personalized outbound is 3.2x more effective. {company} should be using it. Link below.",
  "{name}, your team writes 50 cold emails a day. Harvey writes 500, better. Math is math.",
  "Not going to waste your time: Harvey makes cold email effortless. {company} is a perfect fit. 10 minutes?",
];

function getOpeners(tone: string): string[] {
  switch (tone.toLowerCase()) {
    case "executive":
      return EXECUTIVE_OPENERS;
    case "friendly":
      return FRIENDLY_OPENERS;
    case "direct":
      return DIRECT_OPENERS;
    default:
      return FRIENDLY_OPENERS;
  }
}

function interpolateOpener(template: string, prospect: ProspectBase): string {
  return template
    .replace(/\{name\}/g, prospect.name.split(" ")[0])
    .replace(/\{company\}/g, prospect.company)
    .replace(/\{title\}/g, prospect.title);
}

export function generateProspects(tone: string): Prospect[] {
  const openers = getOpeners(tone);

  return PROSPECT_BASES.map((base, index) => ({
    name: base.name,
    company: base.company,
    title: base.title,
    opener: interpolateOpener(openers[index % openers.length], base),
  }));
}
