const steps = [
  {
    number: "01",
    title: "Buy",
    body: "Click Buy Now, enter your email, and pay with UPI, card, or netbanking. Takes 30 seconds.",
  },
  {
    number: "02",
    title: "Unzip",
    body: "You'll get a download link instantly. Unzip it into any folder on your Mac or Windows machine.",
  },
  {
    number: "03",
    title: "Run with Claude",
    body: 'Open your terminal in that folder and type "claude". The AI reads the instructions and gets to work.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-[#0D0D0D] border-y border-[#27272A]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="text-4xl font-black text-[#27272A]">{step.number}</span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
