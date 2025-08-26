import React, { useEffect, useRef, useState } from 'react'

export default function LockUntil({ targetISO }) {
  const [now, setNow] = useState(() => Date.now())
  const mountRef = useRef(Date.now())

  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  // unlocked is in-memory only (cleared on refresh) so entering the code
  // before midnight will unlock until the page is reloaded
  const [unlocked, setUnlocked] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!targetISO) return null
  const target = new Date(targetISO).getTime()
  if (now >= target || unlocked) return null

  const remaining = Math.max(0, Math.floor((target - now) / 1000))
  const hrs = Math.floor(remaining / 3600)
  const mins = Math.floor((remaining % 3600) / 60)
  const secs = remaining % 60

  // handle submit
  function tryCode(e) {
    e && e.preventDefault()
    const code = String(input || '').trim()
    if (code.toLowerCase() === 'codezero') {
      // unlock for this session (will re-lock on full page refresh if it's still before target)
      setUnlocked(true)
      if (Date.now() >= target) {
        setMessage('Unlocked — happy anniversary 💖')
      } else {
        setMessage("Unlocked for this session — will re-lock on refresh until midnight")
      }
    } else {
      // wrong code: small shake and message
      setMessage('Wrong code')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    setInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white p-6">
      <style>{`
        .heart-main { transform-origin: 50% 50%; }
        @keyframes heartbeat { 0% { transform: scale(1); } 30% { transform: scale(1.06); } 60% { transform: scale(1); } 100% { transform: scale(1); } }
        .heart-pulse { animation: heartbeat 1.2s ease-in-out infinite; }
        @keyframes floatUp { 0% { transform: translateY(0) scale(0.9); opacity: 0.9 } 100% { transform: translateY(-60px) scale(1.1); opacity: 0 } }
        .mini-heart { width:14px; height:14px; position:absolute; }
        .mini-heart svg { width:100%; height:100%; }
        .float-1 { left:18%; bottom:28%; animation: floatUp 2.4s linear infinite; animation-delay:0s }
        .float-2 { left:68%; bottom:26%; animation: floatUp 2.8s linear infinite; animation-delay:0.6s }
        .float-3 { left:50%; bottom:18%; animation: floatUp 2.2s linear infinite; animation-delay:0.3s }
        .shake { animation: shakeX .6s; }
        @keyframes shakeX { 0% { transform: translateX(0) } 25% { transform: translateX(-6px) } 50% { transform: translateX(6px) } 75% { transform: translateX(-4px) } 100% { transform: translateX(0) } }
      `}</style>

      <div className="relative max-w-md text-center">
        {/* floating mini hearts */}
        <div className="mini-heart float-1" aria-hidden>
          <svg viewBox="0 0 24 24" fill="#ff2d55"><path d="M12 21s-7-4.35-9-7.28C-0.2 9.97 3.3 6 6.5 7.5 8 8.25 9 10 12 11.5c3-1.5 4-3.25 5.5-4 3.2-1.5 6.7 2.47 3.5 6.22C19 16.65 12 21 12 21z"/></svg>
        </div>
        <div className="mini-heart float-2" aria-hidden>
          <svg viewBox="0 0 24 24" fill="#ff6b6b"><path d="M12 21s-7-4.35-9-7.28C-0.2 9.97 3.3 6 6.5 7.5 8 8.25 9 10 12 11.5c3-1.5 4-3.25 5.5-4 3.2-1.5 6.7 2.47 3.5 6.22C19 16.65 12 21 12 21z"/></svg>
        </div>
        <div className="mini-heart float-3" aria-hidden>
          <svg viewBox="0 0 24 24" fill="#ff8fa3"><path d="M12 21s-7-4.35-9-7.28C-0.2 9.97 3.3 6 6.5 7.5 8 8.25 9 10 12 11.5c3-1.5 4-3.25 5.5-4 3.2-1.5 6.7 2.47 3.5 6.22C19 16.65 12 21 12 21z"/></svg>
        </div>

        <div className="mb-4">
          <svg viewBox="0 0 100 90" width="160" height="144" className={`mx-auto heart-pulse ${shake ? 'shake' : ''}`}>
            <path className="heart-main" d="M50 80 L20 50 C5 35, 12 15, 30 20 C40 22, 45 35, 50 42 C55 35, 60 22, 70 20 C88 15, 95 35, 80 50 Z" fill="#ff2d55" stroke="#fff" strokeWidth="2.2" />
          </svg>
        </div>

        <div className="text-4xl font-mono mb-4">{String(hrs).padStart(2,'0')}:{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>

        <form onSubmit={tryCode} className="mt-2">
          <label className="block text-sm mb-2">Type the secret code</label>
          <div className="flex items-center justify-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="px-3 py-2 rounded text-black w-48"
              placeholder="enter code"
              aria-label="unlock code"
            />
            <button type="submit" className="px-3 py-2 bg-white text-black rounded">Try</button>
          </div>
        </form>

        <div className="mt-3 min-h-[1.2rem] text-sm text-gray-200">{message}</div>
      </div>
    </div>
  )
}
