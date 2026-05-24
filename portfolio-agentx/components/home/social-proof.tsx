import { stats } from "@/lib/constants";

export function SocialProof() {
  return (
    <section className="border-y border-border bg-background-secondary py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-accent sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-foreground-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
