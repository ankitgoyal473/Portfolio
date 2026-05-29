import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { ClientFooter } from "@/components/layout/client-footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { BlackholeRing } from "@/components/shared/blackhole-ring";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGentX — AI Solutions & Agentic Systems",
  description:
    "I turn business problems into AI-powered products. Custom AI automation, chatbots, data pipelines, and ML systems.",
  keywords: ["AI Engineer", "Freelance", "Claude API", "Machine Learning", "Automation"],
  openGraph: {
    title: "AGentX — AI Solutions & Agentic Systems",
    description: "I turn business problems into AI-powered products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased">
        {/* Site-wide ambient black hole background */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <BlackholeRing size={900} opacity={0.07} />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <ClientFooter />
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
