import { ShieldCheck, Lock, Zap, Trash2, Timer, EyeOff } from 'lucide-react';

const items = [
  { icon: ShieldCheck, title: 'End‑to‑End Encryption', desc: 'All content is encrypted on your device and relayed as opaque blobs.' },
  { icon: Timer, title: 'Ephemeral by Design', desc: 'Per‑message TTL with auto‑shred after read. Rooms vanish when empty.' },
  { icon: Trash2, title: 'Dust Button', desc: 'Instant vaporize — triggers a synchronized wipe for everyone in the room.' },
  { icon: EyeOff, title: 'Leak Detection', desc: 'Detect copy events and visibility changes to warn about potential leaks.' },
  { icon: Zap, title: 'Masks', desc: 'Disposable one‑time rooms for mission‑specific exchanges.' },
  { icon: Lock, title: 'Zero‑Knowledge', desc: 'Server holds no keys and stores nothing persistent.' },
];

export default function Features(){
  return (
    <section id="about" className="bg-[#0A0F1E] text-cyan-100 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-2xl md:text-3xl font-semibold text-cyan-300 mb-8">Holo‑Stealth Protocol</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({icon:Icon, title, desc}) => (
            <div key={title} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition">
              <div className="flex items-center gap-3">
                <Icon className="text-cyan-300" />
                <h4 className="text-lg font-semibold text-cyan-200">{title}</h4>
              </div>
              <p className="mt-2 text-sm text-cyan-100/80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
