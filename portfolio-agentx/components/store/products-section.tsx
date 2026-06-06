import { PRODUCTS } from "@/lib/products";
import ProductCard from "./product-card";

export default function ProductsSection() {
  return (
    <section id="products" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Choose your solution</h2>
        <p className="text-center text-[#71717A] mb-12">
          Each solution is a self-contained Claude Code workspace. Buy, unzip, run.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
