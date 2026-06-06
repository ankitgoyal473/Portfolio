"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import BuyModal from "./buy-modal";

export default function ProductCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        id={product.slug}
        className="relative bg-[#141414] border border-[#27272A] rounded-xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-150 group"
        style={{
          borderTop: `3px solid ${product.color}`,
          boxShadow: `0 0 0 0 ${product.color}`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px 0 ${product.color}22`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Header */}
        <div>
          <h3
            className="text-xl font-bold tracking-tight mb-1"
            style={{ color: product.color }}
          >
            {product.name}
          </h3>
          <p className="text-sm text-[#71717A] font-medium">{product.tagline}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-[#F8FAFC] leading-relaxed">{product.description}</p>

        {/* What you get */}
        <ul className="flex flex-col gap-2 flex-1">
          {product.whatYouGet.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#F8FAFC]">
              <Check size={14} className="mt-0.5 shrink-0" style={{ color: product.color }} />
              {item}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
          <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors duration-150 cursor-pointer"
          >
            Buy Now →
          </button>
        </div>
      </div>

      {modalOpen && (
        <BuyModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
