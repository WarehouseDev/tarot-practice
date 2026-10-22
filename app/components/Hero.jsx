export default function Hero() {
  return (
    <section className="relative z-10 text-center px-5 sm:px-10 pt-16 sm:pt-20 pb-12 sm:pb-16">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold opacity-85 mb-6">
        Besplatno online tumačenje
      </p>

      <h1 className="font-serif text-[40px] sm:text-[64px] font-light leading-[1.1] text-[#F0E8D8] mb-5 -tracking-[0.01em]">
        Pitaj <em className="italic text-gold">zvezde</em>
        <br />
        Slušaj karte
      </h1>

      <div className="flex items-center gap-4 justify-center max-w-[300px] mx-auto my-8">
        <span className="flex-1 h-px divider-line" />
        <span className="text-gold text-base opacity-70">✦</span>
        <span className="flex-1 h-px divider-line" />
      </div>

      <p className="text-[13px] sm:text-sm text-cream-dim font-light tracking-[0.04em]">
        Postavi pitanje ili prepusti se toku — karte uvek znaju put
      </p>
    </section>
  );
}
