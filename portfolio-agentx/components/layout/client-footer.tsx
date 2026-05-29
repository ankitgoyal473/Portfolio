"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ClientFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/agents/")) return null;
  return <Footer />;
}
