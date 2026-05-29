import { FileText, Bot, type LucideIcon } from "lucide-react";

export interface Tool {
  name: string;
  description: string;
  price: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  features: string[];
}

export interface Project {
  name: string;
  description: string;
  tags: string[];
  client: string;
  category: "ai-automation" | "data-engineering" | "ml-ops" | "chatbots";
  image?: string;
}

export const tools: Tool[] = [
  {
    name: "Report Bot",
    description:
      "Transform raw Excel data into polished PDF reports with AI-generated insights and charts.",
    price: "$9/mo",
    slug: "reports",
    icon: FileText,
    color: "#F59E0B",
    features: ["Excel upload", "Auto-charts", "AI summaries", "PDF export"],
  },
  {
    name: "AI Chatbot Builder",
    description: "Build and deploy custom AI chatbots trained on your data. No code required.",
    price: "$49/mo",
    slug: "chatbot",
    icon: Bot,
    color: "#EC4899",
    features: ["Custom training", "Multi-platform", "Analytics", "White-label"],
  },
];

export const projects: Project[] = [
  {
    name: "Enterprise RAG System",
    description:
      "Built a retrieval-augmented generation system processing 2M+ documents for a Fortune 500 bank. 94% accuracy on complex financial queries.",
    tags: ["Python", "LangChain", "AWS", "Pinecone"],
    client: "Fortune 500 Bank",
    category: "ai-automation",
  },
  {
    name: "Automated Trading Signals",
    description:
      "Real-time AI trading signal engine analyzing 500+ stocks. Backtested 12% alpha over S&P 500.",
    tags: ["Claude API", "FastAPI", "Redis", "WebSockets"],
    client: "Hedge Fund",
    category: "ai-automation",
  },
  {
    name: "Multi-Agent Customer Support",
    description:
      "Deployed AI agent system handling 80% of tier-1 support tickets autonomously. Reduced response time from 4hrs to 30s.",
    tags: ["GPT-4", "LangGraph", "PostgreSQL", "React"],
    client: "SaaS Startup",
    category: "chatbots",
  },
  {
    name: "MLOps Pipeline",
    description:
      "End-to-end ML pipeline with auto-retraining, A/B testing, and drift detection. Serves 10M+ predictions/day.",
    tags: ["Kubernetes", "MLflow", "Airflow", "Terraform"],
    client: "E-commerce Platform",
    category: "ml-ops",
  },
  {
    name: "Data Lake Migration",
    description:
      "Migrated 50TB data lake from on-prem Hadoop to AWS. 40% cost reduction with improved query performance.",
    tags: ["PySpark", "AWS Glue", "Delta Lake", "dbt"],
    client: "Insurance Corp",
    category: "data-engineering",
  },
  {
    name: "AI Content Engine",
    description:
      "Automated content pipeline generating 1000+ SEO-optimized articles/month with human-quality output.",
    tags: ["Claude API", "Next.js", "Vercel", "Stripe"],
    client: "Marketing Agency",
    category: "ai-automation",
  },
];

export const services = [
  {
    title: "AI Automation",
    description: "Custom AI systems that automate repetitive tasks and unlock new capabilities",
    priceRange: "$3K – $8K",
    timeline: "2-4 weeks",
  },
  {
    title: "AI Chatbots & Agents",
    description: "Intelligent conversational agents trained on your data, deployed anywhere",
    priceRange: "$2K – $5K",
    timeline: "1-3 weeks",
  },
  {
    title: "Data Pipelines",
    description: "Scalable ETL/ELT pipelines, data lakes, and real-time streaming architectures",
    priceRange: "$4K – $8K",
    timeline: "2-5 weeks",
  },
  {
    title: "ML Model Development",
    description: "Custom ML models from prototype to production with monitoring and retraining",
    priceRange: "$5K – $8K",
    timeline: "3-6 weeks",
  },
];

export const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "12", label: "AI Tools Built" },
  { value: "$2M+", label: "Revenue Generated" },
];

export const pricing = {
  free: {
    name: "Free",
    price: "$0",
    uses: 3,
    features: ["3 uses per tool", "Limited output", "No export", "Community support"],
  },
  individual: {
    name: "Individual Tool",
    price: "$9–49",
    uses: "Unlimited",
    features: ["Unlimited uses", "Full output", "Export enabled", "Email support"],
  },
  pro: {
    name: "Pro Bundle",
    price: "$49",
    uses: "Unlimited",
    features: [
      "All tools included",
      "Unlimited uses",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
  },
};

export const navLinks = [
  { label: "Agents", href: "/agents" },
  { label: "Projects", href: "/projects" },
  { label: "Tools", href: "/tools" },
  { label: "Work With Me", href: "/hire" },
];

export const typewriterPhrases = [
  "I turn business problems into AI-powered products",
  "I build systems that think, learn, and scale",
  "I automate what others do manually",
  "I ship AI tools that generate revenue",
  "I make complex AI feel simple",
];
