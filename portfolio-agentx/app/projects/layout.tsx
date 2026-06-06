import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | AGentX",
  description: "Production AI systems built by Ankit Goyal — RAG, agentic workflows, and MCP tooling at enterprise scale.",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
