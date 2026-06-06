"use client";

import { useEffect, useState } from "react";
import { Download, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getProduct } from "@/lib/products";

export default function SuccessPage() {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("your solution");
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const slug = params.get("product");
    const isFallback = params.get("fallback") === "1";

    if (url) setDownloadUrl(decodeURIComponent(url));
    if (slug) {
      const p = getProduct(slug);
      if (p) setProductName(p.name);
    }
    setFallback(isFallback);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        <CheckCircle size={48} className="text-[#00c896] mx-auto mb-6" />

        <h1 className="text-3xl font-bold mb-3">Payment successful</h1>
        <p className="text-[#71717A] mb-8">
          {fallback
            ? `Your download link for ${productName} will arrive in your email within 5 minutes.`
            : `Your ${productName} is ready. Download link also sent to your email.`}
        </p>

        {downloadUrl && !fallback && (
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-150 cursor-pointer mb-6"
          >
            <Download size={18} />
            Download {productName}
          </a>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-[#71717A] mb-8">
          <Mail size={14} />
          <span>Check your email for a backup link (valid 24h)</span>
        </div>

        <p className="text-xs text-[#71717A]">
          Link expired?{" "}
          <a
            href="mailto:ankitgoyal473@gmail.com"
            className="underline hover:text-[#F8FAFC] transition-colors"
          >
            Email for a new one
          </a>
        </p>

        <div className="mt-10 pt-6 border-t border-[#27272A]">
          <Link
            href="/"
            className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors"
          >
            ← Browse all solutions
          </Link>
        </div>
      </div>
    </main>
  );
}
