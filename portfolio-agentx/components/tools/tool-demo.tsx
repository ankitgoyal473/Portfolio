"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const warrenOutput = `> Analyzing AAPL (Apple Inc.)...

=== WARREN BUFFETT STYLE ANALYSIS ===

BUSINESS QUALITY: A+
Apple possesses one of the strongest consumer
brands ever built. The ecosystem lock-in creates
a switching cost moat that competitors cannot
replicate easily.

MOAT ASSESSMENT: Wide & Durable
- Brand Power: 9.5/10
- Switching Costs: 9/10
- Network Effects: 8/10
- Cost Advantages: 7/10

FINANCIAL HEALTH:
- Revenue: $383B (growing 8% YoY)
- FCF Margin: 26.4%
- ROIC: 58.7% (exceptional)
- Debt/Equity: 1.73 (manageable)

INTRINSIC VALUE ESTIMATE:
Using a 10-year DCF with 7% growth declining
to 3% terminal: ~$198/share

VERDICT: BUY at current levels.
Apple remains a wonderful business at a fair
price. The Services segment provides recurring
revenue visibility that Mr. Market undervalues.

"Price is what you pay. Value is what you get."
— Warren Buffett`;

interface ToolDemoProps {
  slug: string;
}

export function ToolDemo({ slug }: ToolDemoProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRunning && slug === "warren") {
      intervalRef.current = setInterval(() => {
        setCharIndex((prev) => {
          if (prev >= warrenOutput.length) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          setDisplayText(warrenOutput.slice(0, prev + 1));
          return prev + 1;
        });
      }, 15);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, slug]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  const handleRun = () => {
    setDisplayText("");
    setCharIndex(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (slug !== "warren") {
    return (
      <div className="rounded-xl border border-border bg-[#0D0D0D] p-8 font-mono text-sm h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-secondary text-lg mb-2">
            Demo Coming Soon
          </p>
          <p className="text-foreground-secondary/60 text-xs">
            This tool is currently in development.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-[#0D0D0D] overflow-hidden h-full min-h-[400px] flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
        </div>
        <span className="text-xs text-foreground-secondary font-mono">
          warren-analysis.sh
        </span>
        <div className="w-12" />
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm text-green-400 whitespace-pre-wrap"
      >
        {displayText || (
          <span className="text-foreground-secondary">
            {`$ Click "Run Analysis" to start...\n\n`}
            {`Enter a stock ticker and get a Buffett-style\n`}
            {`fundamental analysis powered by AI.`}
          </span>
        )}
        {isRunning && (
          <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5" />
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-border p-4">
        {!isRunning ? (
          <Button onClick={handleRun} size="sm" className="w-full">
            <Play className="h-4 w-4" />
            Run Analysis (AAPL)
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
