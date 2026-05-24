"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { getAgentBySlug } from "@/lib/agents";
import { AgentSidebar } from "@/components/agents/AgentSidebar";
import { ChatThread } from "@/components/agents/ChatThread";
import { AgentChatbar } from "@/components/agents/AgentChatbar";
import { PaywallSheet } from "@/components/agents/PaywallSheet";
import {
  type ChatMessage,
  type ThinkingStep,
  type SessionRecord,
  getSessions,
  saveSession,
  generateSessionId,
} from "@/lib/mock-sessions";
import {
  type UsageState,
  getUsage,
  incrementUsage,
  isLocked as checkIsLocked,
  PAYWALL_MESSAGES,
} from "@/lib/paywall";

const WARREN_THINKING: ThinkingStep[] = [
  { icon: "📊", label: "Reading price data...", status: "pending" },
  { icon: "🏰", label: "Analysing the moat...", status: "pending" },
  { icon: "📰", label: "Scanning market sentiment...", status: "pending" },
  { icon: "⚙️", label: "Checking options chain...", status: "pending" },
  { icon: "🌍", label: "Assessing global impact...", status: "pending" },
  { icon: "🎯", label: "Forming my verdict...", status: "pending" },
];

const SHERLOCK_THINKING: ThinkingStep[] = [
  { icon: "🔍", label: "Examining their website...", status: "pending" },
  { icon: "📋", label: "Comparing to last snapshot...", status: "pending" },
  { icon: "💼", label: "Checking job postings...", status: "pending" },
  { icon: "📰", label: "Reading the news...", status: "pending" },
  { icon: "🎯", label: "Scoring the threat level...", status: "pending" },
  { icon: "📝", label: "Writing your case file...", status: "pending" },
];

const HARVEY_THINKING: ThinkingStep[] = [
  { icon: "📋", label: "Parsing prospects...", status: "pending" },
  { icon: "🔍", label: "Researching companies...", status: "pending" },
  { icon: "✍️", label: "Writing openers...", status: "pending" },
  { icon: "⚡", label: "Processing batch...", status: "pending" },
];

function getGreeting(agentSlug: string): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  switch (agentSlug) {
    case "warren":
      return `Good ${timeOfDay}. Give me a ticker and I will tell you what the market is missing. — WARRen 🧐`;
    case "sherlock":
      return "I am ready. Give me a rival to watch — a URL or company name. — Sherlock 🔎";
    case "harvey":
      return "Drop your prospect list. I will make every single one feel personal. — Harvey 💼";
    default:
      return "";
  }
}

function getPlaceholder(agentSlug: string): string {
  switch (agentSlug) {
    case "warren":
      return "Ask WARRen... (e.g. AAPL)";
    case "sherlock":
      return "Give Sherlock a rival URL...";
    case "harvey":
      return "Describe what you're selling...";
    default:
      return "Type a message...";
  }
}

function createMessage(
  role: ChatMessage["role"],
  content: string,
  metadata?: ChatMessage["metadata"]
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    timestamp: Date.now(),
    metadata,
  };
}

export default function AgentPage() {
  const params = useParams<{ name: string }>();
  const agentSlug = params.name;
  const agent = getAgentBySlug(agentSlug);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [usage, setUsage] = useState<UsageState>({ used: 0, limit: 1, stage: "fresh" });
  const [locked, setLocked] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const [harveyContext, setHarveyContext] = useState<{
    file?: File;
    offer?: string;
    tone?: string;
    prospectCount?: number;
  }>({});

  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!agent) return;
    const u = getUsage(agentSlug);
    setUsage(u);
    const isLockedNow = checkIsLocked(agentSlug);
    setLocked(isLockedNow);
    if (isLockedNow) setPaywallOpen(true);
    setSessions(getSessions(agentSlug));
    startNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentSlug]);

  const startNewSession = useCallback(() => {
    if (!agent) return;
    const id = generateSessionId();
    sessionRef.current = id;
    setActiveSessionId(id);
    setMessages([
      createMessage("system", "Session started"),
      createMessage("agent", getGreeting(agentSlug)),
    ]);
    setChips([]);
    setHarveyContext({});
  }, [agent, agentSlug]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      sessionRef.current = sessionId;
      setActiveSessionId(sessionId);
      setMessages([
        createMessage("system", `Replaying session from ${new Date(session.createdAt).toLocaleDateString()}`),
        ...session.messages,
      ]);
      setChips([]);
    },
    [sessions]
  );

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runWarren = useCallback(
    async (ticker: string) => {
      if (locked) {
        setPaywallOpen(true);
        return;
      }

      setIsRunning(true);
      addMessage(createMessage("agent", `${ticker} it is. Let me walk you through what I see...`));
      await delay(400);

      addMessage(
        createMessage("thinking", "", {
          thinkingSteps: WARREN_THINKING,
        })
      );
      await delay(WARREN_THINKING.length * 800 + 400);

      setMessages((prev) => prev.filter((m) => m.role !== "thinking"));

      const newUsage = incrementUsage(agentSlug);
      setUsage(newUsage);

      const isNowLocked = newUsage.stage === "locked";
      addMessage(
        createMessage("agent", "", {
          type: "pillar-cards",
        })
      );

      if (newUsage.stage === "warning") {
        await delay(500);
        addMessage(createMessage("paywall", PAYWALL_MESSAGES[agentSlug]));
        await delay(800);
        setLocked(true);
        setPaywallOpen(true);
      }

      setLocked(isNowLocked);
      setIsRunning(false);

      const session: SessionRecord = {
        id: sessionRef.current ?? generateSessionId(),
        agentId: agentSlug,
        createdAt: new Date().toISOString(),
        name: `${ticker} · Quick scan`,
        messages: messages,
        inputSummary: `${ticker} · Deep dive`,
        usageCount: newUsage.used,
      };
      saveSession(session);
      setSessions(getSessions(agentSlug));
    },
    [locked, agentSlug, addMessage, messages]
  );

  const runSherlock = useCallback(
    async (input: string) => {
      if (locked) {
        setPaywallOpen(true);
        return;
      }

      const isUrl = input.includes(".") && input.length > 3;
      if (!isUrl) {
        addMessage(
          createMessage("agent", `Do you mean ${input}.com? I will need the URL to investigate properly.`)
        );
        return;
      }

      addMessage(
        createMessage("agent", `Adding ${input} to your watchlist. Scan now or wait for Monday digest?`)
      );
      setChips(["Scan now", "Add to watchlist"]);
    },
    [locked, agentSlug, addMessage]
  );

  const runSherlockScan = useCallback(
    async (url: string) => {
      setIsRunning(true);
      addMessage(createMessage("agent", "On it. Give me a moment..."));
      await delay(400);

      addMessage(
        createMessage("thinking", "", {
          thinkingSteps: SHERLOCK_THINKING,
        })
      );
      await delay(SHERLOCK_THINKING.length * 1000 + 400);

      setMessages((prev) => prev.filter((m) => m.role !== "thinking"));

      const newUsage = incrementUsage(agentSlug);
      setUsage(newUsage);

      const isNowLocked = newUsage.stage === "locked";
      addMessage(
        createMessage("agent", "", {
          type: "case-file",
        })
      );

      if (newUsage.stage === "warning") {
        await delay(500);
        addMessage(createMessage("paywall", PAYWALL_MESSAGES[agentSlug]));
        await delay(800);
        setLocked(true);
        setPaywallOpen(true);
      }

      setLocked(isNowLocked);
      setIsRunning(false);

      const session: SessionRecord = {
        id: sessionRef.current ?? generateSessionId(),
        agentId: agentSlug,
        createdAt: new Date().toISOString(),
        name: `${url} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        messages: messages,
        inputSummary: url,
        usageCount: newUsage.used,
      };
      saveSession(session);
      setSessions(getSessions(agentSlug));
    },
    [agentSlug, addMessage, messages]
  );

  const runHarvey = useCallback(
    async (prospectCount: number, tone: string) => {
      if (locked) {
        setPaywallOpen(true);
        return;
      }

      setIsRunning(true);
      addMessage(createMessage("agent", `${tone} it is. Let me work...`));
      await delay(400);

      addMessage(
        createMessage("thinking", "", {
          thinkingSteps: HARVEY_THINKING,
        })
      );
      await delay(HARVEY_THINKING.length * 600 + 400);

      setMessages((prev) => prev.filter((m) => m.role !== "thinking"));

      const newUsage = incrementUsage(agentSlug);
      setUsage(newUsage);

      const isNowLocked = newUsage.stage === "locked";
      addMessage(
        createMessage("agent", "", {
          type: "results-table",
        })
      );

      if (newUsage.stage === "warning") {
        await delay(500);
        addMessage(createMessage("paywall", PAYWALL_MESSAGES[agentSlug]));
        await delay(800);
        setLocked(true);
        setPaywallOpen(true);
      }

      setLocked(isNowLocked);
      setIsRunning(false);

      const session: SessionRecord = {
        id: sessionRef.current ?? generateSessionId(),
        agentId: agentSlug,
        createdAt: new Date().toISOString(),
        name: `${prospectCount} prospects · ${tone}`,
        messages: messages,
        inputSummary: `${prospectCount} prospects · ${tone}`,
        usageCount: newUsage.used,
      };
      saveSession(session);
      setSessions(getSessions(agentSlug));
    },
    [locked, agentSlug, addMessage, messages]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!agent || isRunning) return;

      addMessage(createMessage("user", text));
      setChips([]);

      if (agentSlug === "warren") {
        const isTicker = /^[A-Z]{1,5}(\.NS|\.BSE)?$/i.test(text.trim());
        if (isTicker) {
          await runWarren(text.trim().toUpperCase());
        } else {
          addMessage(
            createMessage("agent", "I work best with stock tickers. Try typing AAPL or RELIANCE.NS")
          );
        }
      } else if (agentSlug === "sherlock") {
        if (text.toLowerCase() === "scan now") {
          const urlMsg = messages.findLast(
            (m) => m.role === "user" && m.content !== "Scan now"
          );
          await runSherlockScan(urlMsg?.content ?? "competitor.com");
        } else if (text.toLowerCase() === "add to watchlist") {
          addMessage(
            createMessage("agent", "Added. I will send you a case file on Monday morning. The game is afoot. — Sherlock 🔎")
          );
        } else {
          await runSherlock(text);
        }
      } else if (agentSlug === "harvey") {
        if (!harveyContext.prospectCount) {
          addMessage(
            createMessage(
              "agent",
              "I need a CSV file with your prospects. Click the 📎 button to upload, or tell me what you're selling and I'll use sample data."
            )
          );
          setHarveyContext((prev) => ({ ...prev, offer: text }));
          setChips(["🎩 Executive", "🤝 Friendly", "⚡ Direct"]);
          addMessage(
            createMessage("agent", "What tone? Pick one:")
          );
        } else if (!harveyContext.tone) {
          const tone = text.replace(/[🎩🤝⚡]\s*/g, "").trim();
          setHarveyContext((prev) => ({ ...prev, tone }));
          await runHarvey(harveyContext.prospectCount ?? 23, tone);
        }
      }
    },
    [
      agent,
      agentSlug,
      isRunning,
      addMessage,
      messages,
      harveyContext,
      runWarren,
      runSherlock,
      runSherlockScan,
      runHarvey,
    ]
  );

  const handleChipSelect = useCallback(
    (chip: string) => {
      handleSend(chip);
    },
    [handleSend]
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      setHarveyContext((prev) => ({ ...prev, file, prospectCount: 23 }));
      addMessage(createMessage("user", `📎 ${file.name}`));
      addMessage(
        createMessage(
          "agent",
          `Got it — 23 prospects loaded. I can see: name, company, title, website.\n\nWhat are you selling? Give me 2-3 sentences and I will make every opener land.`
        )
      );
    },
    [addMessage]
  );

  if (!agent) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <AgentSidebar
        agentId={agentSlug}
        agentColor={agent.color}
        sessions={sessions}
        usage={usage}
        onNewSession={startNewSession}
        onSelectSession={handleSelectSession}
        activeSessionId={activeSessionId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat thread */}
        <div className="flex-1 overflow-y-auto">
          <ChatThread
            messages={messages}
            agentId={agentSlug}
            agentColor={agent.color}
            isRunning={isRunning}
          />
        </div>

        {/* Fixed chatbar */}
        <AgentChatbar
          agentId={agentSlug}
          agentColor={agent.color}
          usageCount={usage.used}
          usageLimit={usage.limit}
          isLocked={locked}
          onSend={handleSend}
          onFileUpload={agentSlug === "harvey" ? handleFileUpload : undefined}
          onLockClick={() => setPaywallOpen(true)}
          placeholder={getPlaceholder(agentSlug)}
          chips={chips}
          onChipSelect={handleChipSelect}
        />
      </div>

      {/* Paywall sheet */}
      <PaywallSheet
        agentId={agentSlug}
        agentColor={agent.color}
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );
}
