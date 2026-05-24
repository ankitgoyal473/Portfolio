import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
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
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
