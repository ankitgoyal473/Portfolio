export default function HeroSection() {
  return (
    <section className="pt-40 pb-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-medium text-[#71717A] uppercase tracking-widest mb-4">
          Claude Code Solutions
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          AI that runs in{" "}
          <span className="text-[#F97316]">your terminal.</span>
        </h1>
        <p className="text-lg text-[#71717A] mb-10 max-w-xl mx-auto">
          Buy once. Download. Run with Claude Code. No subscriptions, no servers, no accounts.
          Your AI, on your machine.
        </p>
        <a
          href="#products"
          className="inline-block bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          See the solutions ↓
        </a>
      </div>
    </section>
  );
}
