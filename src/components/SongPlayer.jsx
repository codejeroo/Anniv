import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function SongPlayer({ songs = [] }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const rafRef = useRef(null)
  const barRefs = useRef([])

  useEffect(() => {
    // update background CSS var per song
    const colors = [
      'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)',
      'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
      'linear-gradient(135deg,#fbc2eb 0%,#a6c1ee 100%)'
    ]
    const c = colors[index % colors.length]
    document.documentElement.style.setProperty('--app-bg', c)
  }, [index])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress((audio.currentTime / Math.max(1, audio.duration)) * 100)
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
      setIndex((i) => (i + 1) % songs.length)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
    }
  }, [songs.length])

  // (reverted) keep audio loading simple: rely on URLs provided in data

  useEffect(() => {
    // listen for Easter egg play event
    function onEgg() {
      setPlaying(true)
      // create a small sparkle burst near the player
      const root = document.body
      const s = document.createElement('div')
      s.className = 'sparkle'
      s.style.left = '60px'
      s.style.top = '60px'
      root.appendChild(s)
      requestAnimationFrame(() => s.classList.add('show'))
      setTimeout(() => s.remove(), 900)
    }
    window.addEventListener('relationship:play-egg', onEgg)
    return () => window.removeEventListener('relationship:play-egg', onEgg)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const src = songs[index]?.audioUrl || ''
    try { console.debug('[SongPlayer] setting audio.src ->', src) } catch (e) {}
    audio.src = src
    const onError = (ev) => { try { console.error('[SongPlayer] audio element error', ev, audio.error && audio.error.message) } catch (e) {} }
    audio.addEventListener('error', onError)
    if (playing) audio.play().catch((err) => { try { console.error('[SongPlayer] play() failed', err) } catch(e){}; setPlaying(false) })
    else audio.pause()
    setProgress(0)
    return () => audio.removeEventListener('error', onError)
  }, [index, songs, playing])

  // respond to global play-song events: { index }
  useEffect(() => {
    function onPlay(ev) {
      const idx = ev?.detail?.index
      if (typeof idx === 'number' && idx >= 0 && idx < songs.length) {
        setIndex(idx)
        setPlaying(true)
      }
    }
    window.addEventListener('relationship:play-song', onPlay)
    return () => window.removeEventListener('relationship:play-song', onPlay)
  }, [songs.length])

  // Audio analyser setup: create context, analyser and animation loop when playing
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function setupAnalyser() {
      if (audioCtxRef.current) return
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const src = ctx.createMediaElementSource(audio)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      src.connect(analyser)
      analyser.connect(ctx.destination)
      analyserRef.current = analyser
      const bufferLength = analyser.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
    }

    function animate() {
      const analyser = analyserRef.current
      const dataArray = dataArrayRef.current
      if (!analyser || !dataArray) return
      analyser.getByteFrequencyData(dataArray)
      // map frequency bins to bars
      const bars = barRefs.current
      const len = bars.length
      if (len) {
        const step = Math.max(1, Math.floor(dataArray.length / len))
        for (let i = 0; i < len; i++) {
          let sum = 0
          for (let j = 0; j < step; j++) sum += dataArray[i * step + j] || 0
          const avg = sum / step
          const h = Math.max(4, Math.round((avg / 255) * 36))
          const el = bars[i]
          if (el) {
            el.setAttribute('height', String(h))
            el.setAttribute('y', String(40 - h))
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    if (playing) {
      // user gesture may be required to resume
      setupAnalyser()
      const ctx = audioCtxRef.current
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
      // start animation
      rafRef.current = requestAnimationFrame(animate)
    } else {
      // stop animation and reset bars
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      const bars = barRefs.current
      if (bars && bars.length) bars.forEach((el) => { if (el) { el.setAttribute('height', '6'); el.setAttribute('y', '34') } })
    }

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [playing])

  const current = songs[index] || { title: '—', artist: '' }

  return (
    <div className="flex items-center gap-4">
      <audio ref={audioRef} />
      <div className="w-64">
        <div className="text-sm opacity-90">Our Song</div>
        <div className="text-xs font-semibold">{current.title} — {current.artist}</div>
        <div className="mt-2 flex items-center gap-3">
          {/* SVG waveform driven by analyser */}
          <svg width="90" height="44" viewBox="0 0 90 44" className="pointer-events-none" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <rect key={i} ref={(el) => (barRefs.current[i] = el)} x={i * 7 + 4} y={34} width={5} height={6} rx={2} fill="url(#g)" />
            ))}
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#ffd1dc" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="w-full h-1 bg-white bg-opacity-20 rounded overflow-hidden">
            <motion.div style={{ width: `${progress}%` }} className="h-1 bg-white" />
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setIndex((index-1+songs.length)%songs.length)} className="px-2 py-1 rounded bg-white bg-opacity-10">◀</button>
          <button onClick={() => setPlaying((p) => !p)} className="px-3 py-1 rounded bg-white bg-opacity-10">{playing ? 'Pause' : 'Play'}</button>
          <button onClick={() => setIndex((index+1)%songs.length)} className="px-2 py-1 rounded bg-white bg-opacity-10">▶</button>
        </div>
      </div>
    </div>
  )
}
