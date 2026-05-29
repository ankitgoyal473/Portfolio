import type { Pillar, CaseFileData, Prospect } from "@/lib/agent-types";

export type { Pillar, CaseFileData, Prospect };

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system" | "thinking" | "paywall";
  content: string;
  agentId?: string;
  timestamp: number;
  metadata?: {
    type?: "pillar-cards" | "case-file" | "results-table" | "text";
    thinkingSteps?: ThinkingStep[];
    chips?: string[];
    ticker?: string;
    url?: string;
    totalCount?: number;
    pillars?: Pillar[];
    caseFile?: CaseFileData;
    prospects?: Array<{
      name: string;
      company: string;
      title?: string;
      opener: string;
    }>;
  };
}

export interface ThinkingStep {
  icon: string;
  label: string;
  status: "pending" | "active" | "done";
}

export interface SessionRecord {
  id: string;
  agentId: string;
  createdAt: string;
  name: string;
  messages: ChatMessage[];
  inputSummary: string;
  usageCount: number;
}

const STORAGE_PREFIX = "agentx_sessions_";
const MAX_SESSIONS = 20;

export function getSessions(agentId: string): SessionRecord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${agentId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as SessionRecord[];
  } catch {
    return [];
  }
}

export function saveSession(session: SessionRecord): void {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_PREFIX}${session.agentId}`;
  const sessions = getSessions(session.agentId);

  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }

  const trimmed = sessions.slice(0, MAX_SESSIONS);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

export function getSession(
  agentId: string,
  sessionId: string
): SessionRecord | null {
  const sessions = getSessions(agentId);
  return sessions.find((s) => s.id === sessionId) ?? null;
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
