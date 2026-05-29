"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { getAgentBySlug } from "@/lib/agents";
import { AgentSidebar } from "@/components/agents/AgentSidebar";
import { ChatThread } from "@/components/agents/ChatThread";
import { AgentChatbar } from "@/components/agents/AgentChatbar";
import { PaywallSheet } from "@/components/agents/PaywallSheet";
import { useMockAuth } from "@/lib/mock-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAgentStream } from "@/lib/use-agent-stream";
import type { ChatMessage, ThinkingStep, SessionRecord } from "@/lib/mock-sessions";
import { generateSessionId } from "@/lib/mock-sessions";
import type { Pillar, CaseFileData } from "@/lib/agent-types";
import {
  type UsageState,
  getUsage,
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

async function loadSessions(
  agentId: string,
  userId: string
): Promise<SessionRecord[]> {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("agent_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!data) return [];
    return data.map((row) => ({
      id: row.id,
      agentId: row.agent_id,
      createdAt: row.created_at,
      name: row.title ?? "Session",
      messages: (row.messages as ChatMessage[]) ?? [],
      inputSummary: row.title ?? "",
      usageCount: 0,
    }));
  } catch {
    return [];
  }
}

export default function AgentPage() {
  const params = useParams<{ name: string }>();
  const agentSlug = params.name;
  const agent = getAgentBySlug(agentSlug);
  const { user } = useMockAuth();
  const { stream } = useAgentStream();

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

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    if (!agent || !user?.id) return;

    getUsage(agentSlug, user.id).then((u) => {
      setUsage(u);
      const isPremiumUser = !!user?.user_metadata?.is_premium;
      if (isPremiumUser) {
        setLocked(false);
        setPaywallOpen(false);
        // still load usage for display but never lock
      } else {
        // existing logic: check stage, setLocked, setPaywallOpen
        const isLockedNow = checkIsLocked(u.stage);
        setLocked(isLockedNow);
        if (isLockedNow) setPaywallOpen(true);
      }
    });

    loadSessions(agentSlug, user.id).then((loadedSessions) => {
      setSessions(loadedSessions);
      if (loadedSessions.length > 0) {
        // Restore the most recent session
        const recent = loadedSessions[0];
        sessionRef.current = recent.id;
        setActiveSessionId(recent.id);
        setMessages(recent.messages);
        setChips([]);
        setHarveyContext({});
      } else {
        startNewSession();
      }
    });

    // Check for ?unlocked=1 query param (post-Stripe redirect)
    const search = window.location.search;
    if (search.includes("unlocked=1")) {
      window.history.replaceState({}, "", window.location.pathname);
      setMessages((prev) => [
        ...prev,
        createMessage("system", "You're unlocked. Welcome back — all 3 agents are yours."),
      ]);
      getUsage(agentSlug, user.id).then((u) => {
        setUsage(u);
        if (!checkIsLocked(u.stage)) setLocked(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentSlug, user?.id]);

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
      setMessages(session.messages);
      setChips([]);
    },
    [sessions]
  );

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const reloadSessionsFromSupabase = useCallback(
    async (userId: string) => {
      const updated = await loadSessions(agentSlug, userId);
      setSessions(updated);
    },
    [agentSlug]
  );

  const runWarren = useCallback(
    async (ticker: string) => {
      if (locked && !user?.user_metadata?.is_premium) {
        setPaywallOpen(true);
        return;
      }

      setIsRunning(true);
      addMessage(createMessage("agent", `${ticker} it is. Let me walk you through what I see...`));

      const collectedPillars: Pillar[] = [];

      addMessage(
        createMessage("thinking", "", {
          thinkingSteps: WARREN_THINKING,
        })
      );

      await stream(
        "warren",
        { ticker },
        (event) => {
          if (event.event === "pillar") {
            collectedPillars.push({
              name: event.data.name as string,
              icon: "📊",
              signal: event.data.signal as "BULLISH" | "BEARISH" | "NEUTRAL",
              body: event.data.summary as string,
            });
          }
        },
        async () => {
          // onDone
          setMessages((prev) => prev.filter((m) => m.role !== "thinking"));

          if (user?.id) {
            const newUsage = await getUsage(agentSlug, user.id);
            setUsage(newUsage);
            const isNowLocked = checkIsLocked(newUsage.stage) && !user?.user_metadata?.is_premium;

            addMessage(
              createMessage("agent", ticker, {
                type: "pillar-cards",
                ticker,
                pillars: collectedPillars.length > 0 ? collectedPillars : undefined,
              })
            );

            if (newUsage.stage === "warning" || newUsage.stage === "locked") {
              await delay(500);
              addMessage(createMessage("paywall", PAYWALL_MESSAGES[agentSlug]));
              setLocked(isNowLocked);
              if (isNowLocked) setPaywallOpen(true);
            }
          } else {
            addMessage(
              createMessage("agent", ticker, { type: "pillar-cards", ticker })
            );
          }

          setIsRunning(false);

          if (user?.id) {
            setMessages((currentMessages) => {
              const supabase = createBrowserSupabaseClient();
              const sessionId = sessionRef.current ?? generateSessionId();
              supabase
                .from("agent_sessions")
                .upsert(
                  {
                    id: sessionId,
                    user_id: user.id,
                    agent_id: agentSlug,
                    title: `${ticker} · Quick scan`,
                    messages: currentMessages,
                  },
                  { onConflict: "id" }
                )
                .then(() => {
                  reloadSessionsFromSupabase(user.id!);
                });
              return currentMessages;
            });
          }
        },
        (error) => {
          console.error("Warren stream error:", error);
          setMessages((prev) => prev.filter((m) => m.role !== "thinking"));
          addMessage(
            createMessage(
              "agent",
              `I couldn't pull that ticker right now. Try again — WARRen 🧐`
            )
          );
          setIsRunning(false);
        }
      );
    },
    [locked, agentSlug, addMessage, stream, user, reloadSessionsFromSupabase]
  );

  const runSherlock = useCallback(
    async (input: string) => {
      if (locked && !user?.user_metadata?.is_premium) {
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
    [locked, addMessage]
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

      const collectedSections: Array<{
        type: string;
        title?: string;
        findings: Array<{ text: string; badge: string; severity: string }>;
      }> = [];
      let threat = "MEDIUM";

      await stream(
        "sherlock",
        { url },
        (event) => {
          if (event.event === "section") {
            collectedSections.push({
              type: event.data.type as string,
              title: event.data.title as string | undefined,
              findings: event.data.findings as Array<{
                text: string;
                badge: string;
                severity: string;
              }>,
            });
          } else if (event.event === "threat") {
            threat = event.data.level as string;
          }
        },
        async () => {
          // onDone
          setMessages((prev) => prev.filter((m) => m.role !== "thinking"));

          const caseFile: CaseFileData = {
            threatLevel: threat as "LOW" | "MEDIUM" | "HIGH",
            summary: "Intelligence report complete.",
            sections: collectedSections.map((s) => ({
              title: s.title ?? s.type,
              badge: s.findings[0]?.badge,
              badgeColor:
                s.findings[0]?.severity === "high"
                  ? "red"
                  : s.findings[0]?.severity === "medium"
                  ? "yellow"
                  : "green",
              bullets: s.findings.map((f) => f.text),
            })),
          };

          addMessage(
            createMessage("agent", url, {
              type: "case-file",
              caseFile,
            })
          );

          if (user?.id) {
            const newUsage = await getUsage(agentSlug, user.id);
            setUsage(newUsage);
            const isNowLocked = checkIsLocked(newUsage.stage) && !user?.user_metadata?.is_premium;

            if (newUsage.stage === "warning" || newUsage.stage === "locked") {
              await delay(500);
              addMessage(createMessage("paywall", PAYWALL_MESSAGES[agentSlug]));
              setLocked(isNowLocked);
              if (isNowLocked) setPaywallOpen(true);
            }
          }

          setIsRunning(false);

          if (user?.id) {
            setMessages((currentMessages) => {
              const supabase = createBrowserSupabaseClient();
              const sessionId = sessionRef.current ?? generateSessionId();
              supabase
                .from("agent_sessions")
                .upsert(
                  {
                    id: sessionId,
                    user_id: user.id,
                    agent_id: agentSlug,
                    title: `${url} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
                    messages: currentMessages,
                  },
                  { onConflict: "id" }
                )
                .then(() => {
                  reloadSessionsFromSupabase(user.id!);
                });
              return currentMessages;
            });
          }
        },
        (error) => {
          console.error("Sherlock stream error:", error);
          setMessages((prev) => prev.filter((m) => m.role !== "thinking"));
          addMessage(
            createMessage(
              "agent",
              "I couldn't investigate that URL right now. Double-check the address and try again — Sherlock 🔎"
            )
          );
          setIsRunning(false);
        }
      );
    },
    [agentSlug, addMessage, stream, user, reloadSessionsFromSupabase]
  );

  const runHarvey = useCallback(
    async (prospectCount: number, tone: string) => {
      if (locked && !user?.user_metadata?.is_premium) {
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

      const collectedProspects: Array<{
        name: string;
        company: string;
        title: string;
        opener: string;
      }> = [];

      await stream(
        "harvey",
        {
          offer: harveyContext.offer ?? "software product",
          tone,
          count: Math.min(prospectCount, 5),
        },
        (event) => {
          if (event.event === "prospect") {
            collectedProspects.push({
              name: event.data.name as string,
              company: event.data.company as string,
              title: event.data.title as string,
              opener: event.data.opener as string,
            });
          }
        },
        async () => {
          // onDone
          setMessages((prev) => prev.filter((m) => m.role !== "thinking"));

          addMessage(
            createMessage("agent", "", {
              type: "results-table",
              prospects: collectedProspects,
            })
          );

          if (user?.id) {
            const newUsage = await getUsage(agentSlug, user.id);
            setUsage(newUsage);
            const isNowLocked = checkIsLocked(newUsage.stage) && !user?.user_metadata?.is_premium;

            if (newUsage.stage === "warning" || newUsage.stage === "locked") {
              await delay(500);
              addMessage(createMessage("paywall", PAYWALL_MESSAGES[agentSlug]));
              setLocked(isNowLocked);
              if (isNowLocked) setPaywallOpen(true);
            }
          }

          setIsRunning(false);

          if (user?.id) {
            setMessages((currentMessages) => {
              const supabase = createBrowserSupabaseClient();
              const sessionId = sessionRef.current ?? generateSessionId();
              supabase
                .from("agent_sessions")
                .upsert(
                  {
                    id: sessionId,
                    user_id: user.id,
                    agent_id: agentSlug,
                    title: `${prospectCount} prospects · ${tone}`,
                    messages: currentMessages,
                  },
                  { onConflict: "id" }
                )
                .then(() => {
                  reloadSessionsFromSupabase(user.id!);
                });
              return currentMessages;
            });
          }
        },
        (error) => {
          console.error("Harvey stream error:", error);
          setMessages((prev) => prev.filter((m) => m.role !== "thinking"));
          addMessage(
            createMessage(
              "agent",
              "I couldn't generate those openers right now. Try again — Harvey 💼"
            )
          );
          setIsRunning(false);
        }
      );
    },
    [locked, agentSlug, addMessage, stream, harveyContext.offer, user, reloadSessionsFromSupabase]
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
        userId={user?.id}
        userEmail={user?.email ?? ""}
        userName={user?.user_metadata?.full_name ?? ""}
        onUnlocked={() => {
          if (user?.id) {
            getUsage(agentSlug, user.id).then((u) => {
              setUsage(u);
              setLocked(false);
              addMessage(createMessage("system", "You're unlocked. Welcome back — all 3 agents are yours."));
            });
          }
        }}
      />
    </div>
  );
}
