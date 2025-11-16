import Hero from './components/Hero'
import Chat from './components/Chat'
import Features from './components/Features'

function App() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <header className="sticky top-0 z-20 bg-[#0A0F1E]/70 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_12px_#00FFFF]"/>
            <span className="font-semibold tracking-tight text-cyan-200">GPM</span>
          </div>
          <nav className="text-cyan-100/80 text-sm">
            <a href="#chat" className="hover:text-cyan-300">Chat</a>
            <span className="mx-3 opacity-30">•</span>
            <a href="#about" className="hover:text-cyan-300">About</a>
          </nav>
        </div>
      </header>

      <Hero />
      <Chat />
      <Features />

      <footer className="bg-[#0A0F1E] border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 text-cyan-200/70 text-sm">
          Built for private, ephemeral communication. No persistence. No keys on server.
        </div>
      </footer>
    </div>
  )
}

export default App
