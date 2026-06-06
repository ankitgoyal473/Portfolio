import { FileText, Bot, BarChart2, Users, FileSearch, Mic, type LucideIcon } from "lucide-react";

export interface Tool {
  name: string;
  description: string;
  price: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  features: string[];
  comingSoon?: boolean;
}

export const tools: Tool[] = [
  {
    name: "Report Bot",
    description: "Transform raw Excel data into polished PDF reports with AI-generated insights and charts.",
    price: "₹999",
    slug: "reports",
    icon: FileText,
    color: "#f0b429",
    features: ["Excel upload", "Auto-charts", "AI summaries", "PDF export"],
  },
  {
    name: "AI Chatbot Builder",
    description: "Build and deploy custom AI chatbots trained on your data. No code required.",
    price: "₹3,999",
    slug: "chatbot",
    icon: Bot,
    color: "#a855f7",
    features: ["Custom training", "Multi-platform", "Analytics", "White-label"],
  },
  {
    name: "Data Insights Bot",
    description: "Ask your spreadsheet anything. Get answers in seconds.",
    price: "Coming Soon",
    slug: "data-insights",
    icon: BarChart2,
    color: "#4a9eff",
    features: ["CSV & Excel upload", "Natural language queries", "Auto-charts", "AI commentary"],
    comingSoon: true,
  },
  {
    name: "Resume Screener AI",
    description: "Upload 100 CVs. Get a ranked shortlist in 30 seconds.",
    price: "Coming Soon",
    slug: "resume-screener",
    icon: Users,
    color: "#00c896",
    features: ["Bulk CV upload", "Job description matching", "Fit score ranking", "Export shortlist"],
    comingSoon: true,
  },
  {
    name: "Contract Reviewer",
    description: "Plain-English breakdown of any contract. Flag risks instantly.",
    price: "Coming Soon",
    slug: "contract-reviewer",
    icon: FileSearch,
    color: "#F97316",
    features: ["PDF upload", "Clause breakdown", "Risk flagging", "Plain-English summary"],
    comingSoon: true,
  },
  {
    name: "Meeting Notes Summariser",
    description: "From transcript to action items in one click.",
    price: "Coming Soon",
    slug: "meeting-notes",
    icon: Mic,
    color: "#ec4899",
    features: ["Transcript upload", "Auto-summary", "Action item extraction", "Attendee tagging"],
    comingSoon: true,
  },
];

export interface Project {
  name: string;
  tag: string;
  description: string;
  impact: string;
  stack: string[];
  category: "genai" | "agentic-ai" | "mcps";
  color: string;
}

export const projects: Project[] = [
  {
    name: "Enterprise RAG System",
    tag: "GenAI · AWS",
    description:
      "Natural language interface over structured and unstructured enterprise data. Built on AWS Bedrock — analysts query internal knowledge bases without writing SQL or searching through documents.",
    impact: "50+ analysts · 250+ hours saved per week",
    stack: ["AWS Bedrock", "Python", "S3", "Lambda"],
    category: "genai",
    color: "#f0b429",
  },
  {
    name: "Hypothesis Testing Agent",
    tag: "Agentic AI · Statistics",
    description:
      "Conversational statistical analysis for non-technical teams. Business users run A/B tests and significance testing through natural language — no code, no analyst dependency.",
    impact: "40+ hours/week of manual analysis automated",
    stack: ["Python", "LLMs", "AWS", "Statistical libraries"],
    category: "agentic-ai",
    color: "#4a9eff",
  },
  {
    name: "QA Testing Agent",
    tag: "Agentic AI · DevOps",
    description:
      "Agentic system that reads code changes, generates test cases, and executes them autonomously. Integrated into CI/CD pipelines — 3-day QA cycles reduced to hours.",
    impact: "~70% reduction in QA cycle time",
    stack: ["AWS Bedrock Agents", "Python", "CI/CD"],
    category: "agentic-ai",
    color: "#00c896",
  },
  {
    name: "Developer MCP Suite",
    tag: "MCPs · Developer Tools",
    description:
      "Custom MCP servers for JIRA, AWS, and GitLab. Engineers manage sprints, provision infrastructure, and review PRs through conversation — built before MCP was mainstream.",
    impact: "20+ engineers · 50+ hours/week reclaimed",
    stack: ["Python", "MCP Protocol", "JIRA API", "AWS SDK", "GitLab API"],
    category: "mcps",
    color: "#a855f7",
  },
  {
    name: "Multi-Agent Support System",
    tag: "Agentic AI · Customer Success",
    description:
      "Agent system handling tier-1 support tickets autonomously. Triages, resolves, and escalates — reducing human load while improving response consistency.",
    impact: "80% of tier-1 tickets resolved autonomously",
    stack: ["Claude API", "Python", "FastAPI", "PostgreSQL"],
    category: "agentic-ai",
    color: "#F97316",
  },
  {
    name: "Automated Trading Signals",
    tag: "GenAI · Finance",
    description:
      "Real-time AI signal engine analyzing 500+ stocks daily. Combines technical analysis, news sentiment, and fundamental data into actionable signals.",
    impact: "12% alpha over benchmark in backtests",
    stack: ["Claude API", "FastAPI", "Redis", "yfinance"],
    category: "genai",
    color: "#ec4899",
  },
];

export const stackItems = [
  { name: "Claude API", role: "Core AI reasoning — Sonnet 4.6 for all agents", color: "#D97706" },
  { name: "Strands", role: "Agent orchestration framework (AWS open-source)", color: "#10B981" },
  { name: "Supabase", role: "Auth, real-time DB, RLS, and Storage", color: "#3ECF8E" },
  { name: "Razorpay", role: "One-time payments and order lifecycle", color: "#3395FF" },
  { name: "Vercel", role: "Edge deployment and serverless functions", color: "#FFFFFF" },
  { name: "Railway", role: "Python microservice hosting (Warren agent)", color: "#7C3AED" },
  { name: "Tavily", role: "Web search and content extraction for agents", color: "#6366F1" },
  { name: "Next.js 16", role: "App Router framework with SSR and edge runtime", color: "#FFFFFF" },
  { name: "Nodemailer", role: "Transactional email via Gmail SMTP", color: "#EA4335" },
  { name: "yfinance", role: "Real-time and historical stock data", color: "#F59E0B" },
];

export const mcpProjects = [
  {
    name: "Developer MCP Suite",
    description: "MCP servers for JIRA, GitLab, and AWS — engineers manage sprints, PRs, and infra through conversation.",
    status: "Live",
    color: "#a855f7",
  },
  {
    name: "Warren MCP Tools",
    description: "Custom tools for stock data retrieval, web search, and financial analysis — powers the Warren agent.",
    status: "Live",
    color: "#f0b429",
  },
  {
    name: "HR Automation MCP",
    description: "MCP server connecting to HRMS and ATS — automates resume screening, interview scheduling, and offer generation.",
    status: "Built for client",
    color: "#00c896",
  },
];

export const services = [
  {
    title: "Agentic AI Systems",
    description: "End-to-end agentic workflows that automate multi-step business processes. From research agents to autonomous decision systems.",
    tags: ["Claude API", "Strands", "FastAPI", "MCP"],
  },
  {
    title: "RAG & Knowledge Systems",
    description: "Natural language interfaces over your internal data. Teams query documents, databases, and knowledge bases through conversation.",
    tags: ["AWS Bedrock", "Vector DBs", "Python", "LLMs"],
  },
  {
    title: "MCP Development",
    description: "Custom MCP servers that connect Claude to your existing tools — JIRA, Salesforce, internal APIs, databases.",
    tags: ["Python", "MCP Protocol", "API Integration"],
  },
  {
    title: "Claude Code Solutions",
    description: "Production-ready Claude Code workspaces for specific use cases. Buy once, run forever in your own terminal.",
    tags: ["CLAUDE.md", "Claude Code", "ZIP delivery"],
  },
];
