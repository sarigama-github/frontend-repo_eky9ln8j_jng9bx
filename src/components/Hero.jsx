import Spline from '@splinetool/react-spline';

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] bg-[#0A0F1E] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/Ao-qpnKUMOxV2eTA/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-6 md:px-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-cyan-300 drop-shadow-[0_0_20px_#00FFFF66]">
            Ghost Protocol Messenger
          </h1>
          <p className="mt-4 text-cyan-100/80 md:text-lg">
            Ephemeral, zero-knowledge, end‑to‑end encrypted messaging with Dust‑level self‑destruct.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="#chat" className="px-5 py-3 rounded-xl bg-cyan-400/10 border border-cyan-300/30 text-cyan-200 hover:bg-cyan-400/20 transition">
              Start a Mask
            </a>
            <a href="#about" className="px-5 py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition">
              Learn More
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1E]/40 to-[#0A0F1E]" />
    </section>
  );
}
