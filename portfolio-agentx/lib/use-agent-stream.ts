import { useCallback, useRef } from "react";

export interface StreamEvent {
  event: string;
  data: Record<string, unknown>;
}

export function useAgentStream() {
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (
      agentSlug: string,
      body: Record<string, unknown>,
      onEvent: (event: StreamEvent) => void,
      onDone: () => void,
      onError?: (error: Error) => void
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`/api/agents/${agentSlug}/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              try {
                const data = JSON.parse(dataStr);
                if (currentEvent === "done") {
                  onDone();
                } else {
                  onEvent({ event: currentEvent, data });
                }
              } catch {
                // skip malformed JSON
              }
              currentEvent = "";
            }
          }
        }

        onDone();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          onError?.(err as Error);
        }
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { stream, cancel };
}
