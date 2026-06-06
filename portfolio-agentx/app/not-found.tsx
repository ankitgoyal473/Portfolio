"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-8xl font-bold text-[#F97316] mb-4">404</h1>
      <p className="text-lg text-[#71717A] mb-8">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="inline-block bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-150"
      >
        Back to home &rarr;
      </Link>
    </main>
  );
}
