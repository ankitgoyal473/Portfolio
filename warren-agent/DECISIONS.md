# warren-agent — Architectural Decisions

---

## 2026-06-02 — Strands over LangChain/CrewAI

**Decision:** AWS Strands SDK with explicit AnthropicModel for orchestration.
**Why:** Strands is lightweight, tool-call native, and talks directly to Anthropic API. LangChain adds abstraction overhead and churn. CrewAI is multi-agent — overkill for a single-agent analysis pipeline.

---

## 2026-06-02 — Thread-local queue as SSE bridge

**Decision:** Strands `@tool` functions (`report_pillar`, `report_verdict`) communicate with the async SSE stream via `threading.Queue` in thread-local storage (`_reporting_local.q`).
**Why:** Strands runs tool calls synchronously in a thread. FastAPI SSE runs in async context. A thread-local queue is the correct bridge without modifying Strands internals. `asyncio.Queue` would not be visible across thread boundaries.

---

## 2026-06-02 — Supabase Storage for research file persistence

**Decision:** Research files saved to Supabase Storage `warren-research/{user_id}/{SYMBOL}/{YYYYMMDD}/`.
**Why:** Supabase Storage integrates with existing auth (user isolation via RLS). Avoids a separate file storage service. Signed URLs provided in `files` SSE event for frontend display.

---

## 2026-06-02 — yfinance + screener.in + Tavily as data sources

**Decision:** Three data sources in order: yfinance (technicals), screener.in via Jina Reader (Indian fundamentals), Tavily (news/web context).
**Why:** yfinance is free and accurate for price/volume data. screener.in has India-specific fundamental data (P/E, ROE, promoter holding) unavailable via yfinance. Tavily fills the qualitative news/sentiment gap.

---

## 2026-06-02 — FastAPI over Flask

**Decision:** FastAPI as the Python web framework.
**Why:** Native async support (needed for SSE streaming). Automatic OpenAPI docs. Pydantic models. Better performance than Flask for I/O-heavy workloads.

---

## Template

## YYYY-MM-DD — [Short title]

**Decision:** [What was decided]
**Why:** [Reason / tradeoff / constraint]
