import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Zap, Shield, Timer, Trash2 } from 'lucide-react';

const WS_URL = (() => {
  const base = import.meta.env.VITE_BACKEND_URL || window.location.origin.replace('3000', '8000');
  const u = new URL(base);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/ws';
  return u;
})();

function makeRoomId() {
  return crypto.randomUUID().slice(0, 8);
}

// Minimal E2EE demo (NOT production Signal). For PRD demo only: encrypt in-client and relay opaque blobs.
async function encryptBlob(key, data) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(data)));
  return { iv: Array.from(iv), ciphertext: Array.from(new Uint8Array(ciphertext)) };
}

async function decryptBlob(key, payload) {
  const { iv, ciphertext } = payload;
  const dec = new TextDecoder();
  const buf = new Uint8Array(ciphertext);
  const ivArr = new Uint8Array(iv);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivArr }, key, buf);
  return JSON.parse(dec.decode(plaintext));
}

async function deriveRoomKey(roomSecret) {
  const enc = new TextEncoder();
  const raw = await crypto.subtle.importKey('raw', enc.encode(roomSecret), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('gpm-demo'), iterations: 100000, hash: 'SHA-256' },
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export default function Chat() {
  const [roomId, setRoomId] = useState(makeRoomId());
  const [roomSecret, setRoomSecret] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ttl, setTtl] = useState(60);
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const roomKeyPromise = useMemo(() => roomSecret ? deriveRoomKey(roomSecret) : null, [roomSecret]);

  useEffect(() => {
    if (!roomId) return;
    const url = new URL(WS_URL);
    url.pathname += `/${roomId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = async (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'cipher' && roomKeyPromise) {
          try {
            const key = await roomKeyPromise;
            const plain = await decryptBlob(key, { iv: data.iv, ciphertext: data.ciphertext });
            addMessage({ ...plain, inbound: true });
          } catch {
            // ignore undecipherable payloads
          }
        } else if (data.type === 'dust') {
          setMessages([]);
        }
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [roomId, roomKeyPromise]);

  function addMessage(msg) {
    const id = crypto.randomUUID();
    const expiresAt = Date.now() + (msg.ttl ?? ttl) * 1000;
    setMessages((prev) => [...prev, { id, ...msg, expiresAt }]);
  }

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => prev.filter(m => m.expiresAt > now));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  async function sendMessage() {
    if (!input || !wsRef.current || wsRef.current.readyState !== 1 || !roomKeyPromise) return;
    const key = await roomKeyPromise;
    const payload = { text: input, ts: Date.now(), ttl };
    const blob = await encryptBlob(key, payload);
    wsRef.current.send(JSON.stringify({ type: 'cipher', ...blob, ttl, ts: Date.now() }));
    addMessage({ ...payload, inbound: false });
    setInput('');
  }

  function dustAll() {
    wsRef.current?.send(JSON.stringify({ type: 'dust' }));
    setMessages([]);
  }

  // Leak detection (basic): clipboard and visibility screenshot hint
  useEffect(() => {
    function onCopy(e) {
      alert('Leak detection: Copy action noticed.');
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') return;
      // Could hint screenshot; browsers do not expose direct screenshot events
    }
    window.addEventListener('copy', onCopy);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('copy', onCopy);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <section id="chat" className="relative bg-[#0A0F1E] text-cyan-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-cyan-300">Mask Room: {roomId}</h2>
            <p className="text-sm text-cyan-200/70">Rooms auto-destroy when empty. Messages self-destruct per TTL.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={dustAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-400/30 text-pink-300 hover:bg-pink-500/20 transition">
              <Trash2 size={16}/> Dust
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            <div className="space-y-3">
              <label className="block text-sm text-cyan-200/80">Shared Secret</label>
              <input value={roomSecret} onChange={e=>setRoomSecret(e.target.value)} placeholder="Agree on a secret" className="w-full bg-black/40 rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-cyan-400/60"/>

              <label className="block text-sm text-cyan-200/80 mt-4">Room ID</label>
              <div className="flex gap-2">
                <input value={roomId} onChange={e=>setRoomId(e.target.value)} className="flex-1 bg-black/40 rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-cyan-400/60"/>
                <button onClick={()=>setRoomId(makeRoomId())} className="px-3 rounded-lg bg-white/5 border border-white/10 text-white">New</button>
              </div>

              <label className="block text-sm text-cyan-200/80 mt-4">Default TTL (sec)</label>
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-cyan-300"/>
                <input type="number" min={5} value={ttl} onChange={e=>setTtl(parseInt(e.target.value||'0'))} className="w-24 bg-black/40 rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-cyan-400/60"/>
              </div>

              <div className="mt-6 text-xs text-cyan-200/60">
                <p className="flex items-center gap-2"><Shield size={14}/> E2EE demo with client-side AES‑GCM. Server relays opaque blobs only.</p>
                <p className="mt-2">Share Room ID + Secret out‑of‑band. Messages vaporize per TTL.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur min-h-[480px] flex flex-col">
            <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map(m => (
                <div key={m.id} className={`max-w-[75%] rounded-xl px-4 py-3 border backdrop-blur ${m.inbound ? 'self-start bg-cyan-400/10 border-cyan-300/30 text-cyan-100' : 'self-end bg-white/10 border-white/20 text-white'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  <div className="mt-1 text-[10px] opacity-70">shreds in {Math.max(0, Math.ceil((m.expiresAt - Date.now())/1000))}s</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') sendMessage(); }} placeholder={connected? 'Type an encrypted message...' : 'Connecting...'} className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-cyan-400/60" />
              <button onClick={sendMessage} className="inline-flex items-center gap-2 px-4 rounded-xl bg-cyan-400/20 border border-cyan-300/40 text-cyan-200 hover:bg-cyan-400/30 transition">
                <Send size={16}/> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
