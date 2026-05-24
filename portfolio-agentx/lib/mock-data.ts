export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro";
  joinedAt: string;
}

export interface AgentUsage {
  used: number;
  limit: number;
  unit: string;
}

export interface MockSession {
  id: string;
  agentId: string;
  createdAt: string;
  inputSummary: string;
  rowCount: number;
  status: "complete" | "in_progress" | "failed";
}

export interface MockLead {
  id: string;
  problem: string;
  budget: string;
  estimateLow: number;
  estimateHigh: number;
  status: "pending" | "accepted" | "declined";
  calendlyUrl?: string;
  createdAt: string;
}

export const mockUser: MockUser = {
  id: "mock_user_1",
  name: "Ankit Goyal",
  email: "ankit@agentx.ai",
  avatar: "AG",
  plan: "free",
  joinedAt: "2025-01-01",
};

export const mockUsage: Record<string, AgentUsage> = {
  warren: { used: 0, limit: 1, unit: "reports" },
  sherlock: { used: 0, limit: 1, unit: "rivals" },
  harvey: { used: 3, limit: 10, unit: "rows" },
};

export const mockStats = {
  reportsRun: 3,
  rivalsTracked: 0,
  emailsWritten: 47,
  sessionsSaved: 4,
};

export const mockSessions: MockSession[] = [
  {
    id: "s1",
    agentId: "harvey",
    createdAt: "2025-05-20T10:30:00",
    inputSummary: "23 prospects · SaaS founders",
    rowCount: 23,
    status: "complete",
  },
  {
    id: "s2",
    agentId: "harvey",
    createdAt: "2025-05-18T14:00:00",
    inputSummary: "24 prospects · Dental practices",
    rowCount: 24,
    status: "complete",
  },
  {
    id: "s3",
    agentId: "warren",
    createdAt: "2025-05-15T09:00:00",
    inputSummary: "AAPL · Deep dive",
    rowCount: 1,
    status: "complete",
  },
];

export const mockLeads: MockLead[] = [
  {
    id: "l1",
    problem: "Automate lead follow-up workflow",
    budget: "$1,500–$3,000",
    estimateLow: 2500,
    estimateHigh: 4000,
    status: "pending",
    createdAt: "2025-05-22T11:00:00",
  },
  {
    id: "l2",
    problem: "Custom AI chatbot for dental practice",
    budget: "$3,000–$6,000",
    estimateLow: 3000,
    estimateHigh: 5000,
    status: "accepted",
    calendlyUrl: "https://calendly.com/ankitgoyal",
    createdAt: "2025-05-17T09:00:00",
  },
  {
    id: "l3",
    problem: "Stock research automation tool",
    budget: "$6,000+",
    estimateLow: 7000,
    estimateHigh: 12000,
    status: "declined",
    createdAt: "2025-05-10T14:00:00",
  },
];
