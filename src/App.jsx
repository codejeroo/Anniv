import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DaysCounter from './components/DaysCounter'
import NextCountdown from './components/NextCountdown'
import WrappedSection from './components/WrappedSection'
import Carousel from './components/Carousel'
import PolaroidGallery from './components/PolaroidGallery'
import ConfettiTrigger from './components/ConfettiTrigger'
import SongPlayer from './components/SongPlayer'
import EasterEggs from './components/EasterEggs'
import OpenWhen from './components/OpenWhen'
import Quiz from './components/Quiz'
import BigLetter from './components/BigLetter'
import LockUntil from './components/LockUntil'

export default function App() {
  const [data, setData] = useState(null)
  const [seenMilestones, setSeenMilestones] = useState(new Set())
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/relationship.json')
        if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`)
        const json = await r.json()
  // images will be served from public/images and JSON contains absolute /images/ URLs
        setData(json)
      } catch (err) {
        console.error('Failed to load relationship.json', err)
        setError(err.message || String(err))
      }
    }

    load()
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="text-red-200">
              <div className="text-2xl font-bold mb-2">Failed to load data</div>
              <div className="text-sm opacity-80">{error}</div>
              <div className="mt-3 text-xs opacity-70">Check browser console / network for "/relationship.json"</div>
            </div>
          ) : (
            <div className="text-xl">Loading…</div>
          )}
        </div>
      </div>
    )
  }

  function handleMilestone(m) {
    if (seenMilestones.has(m)) return
    // mark seen and dispatch confetti event
    setSeenMilestones((s) => new Set(s).add(m))
    window.dispatchEvent(new CustomEvent('relationship:confetti', { detail: { count: 180, milestone: m } }))
  }

  return (
    <div className="min-h-screen p-8">
      {/* Parallax background layers */}
      <div className="parallax-wrap">
        <div className="parallax-layer layer-back" data-speed="0.2" />
        <div className="parallax-layer layer-mid" data-speed="0.5" />
        <div className="parallax-layer layer-front" data-speed="0.9" />
      </div>
      <ConfettiTrigger />

      <header className="max-w-4xl mx-auto mb-8">
        <div className="header-gradient card flex items-center gap-6">
          <div className="flex-1 flex items-center gap-6">
            <SongPlayer songs={data.songs} />
            <div>
              <h1 className="huge">Relationship Wrapped</h1>
              <p className="opacity-80">A little recap of our time together</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <DaysCounter anniversary={data.anniversary} milestones={data.milestones} onMilestone={handleMilestone} />
            <NextCountdown anniversary={data.anniversary} milestones={data.milestones} />
          </div>
        </div>
      </header>

  <EasterEggs onPlaySong={() => window.dispatchEvent(new CustomEvent('relationship:play-egg'))} secretNote={data.secretNote || 'You are my favorite person.'} />

      <main className="max-w-4xl mx-auto grid gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Trips: clicking certain trips will focus a matching polaroid */}
          <WrappedSection title="Trips Taken" items={data.trips} renderItem={(t) => {
            function handleClick() {
              // simple mapping: CDO 2023 -> photo with "First CDO Trip" or last photo containing 'CDO'
              const photos = data.photos || []
              let idx = -1
              const title = (t.title || '').toLowerCase()
              if (title.includes('cdo')) {
                if (t.year === 2023) {
                  idx = photos.findIndex(p => (p.name || '').toLowerCase().includes('first cdo') || (p.caption || '').toLowerCase().includes('first cdo'))
                }
                if (idx === -1 && t.year === 2024) {
                  idx = photos.findIndex(p => (p.caption || '').toLowerCase().includes('got lost') || (p.caption || '').toLowerCase().includes('got lost in cdo') || (p.name || '').toLowerCase().includes('cdo'))
                }
                // fallback: find any photo related to cdo
                if (idx === -1) idx = photos.findIndex(p => ((p.name || '') + ' ' + (p.caption || '')).toLowerCase().includes('cdo'))
                if (idx === -1) idx = 0
              }
              if (idx >= 0) {
                window.dispatchEvent(new CustomEvent('relationship:focus-photo', { detail: { index: idx } }))
              }
            }

            return (
              <div onClick={handleClick} className="cursor-pointer">
                <div className="font-bold">{t.title} <span className="text-sm font-normal">({t.year})</span></div>
                <div className="text-sm opacity-80">{t.notes}</div>
              </div>
            )
          }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <BigLetter letter={data.anniversaryLetter} />
          <div className="mt-4">
            <Quiz questions={data.quiz || []} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <WrappedSection title="Songs We Love" items={data.songs} renderItem={(s, idx) => (
            <div className="font-semibold cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('relationship:play-song', { detail: { index: idx } }))}>
              {s.title} <span className="text-sm font-normal">— {s.artist}</span>
            </div>
          )} />
        </motion.div>

    {/* Memories removed from the flow — polaroids are rendered globally */}
      </main>
  {/* Open when letters scattered on the page */}
  <OpenWhen items={data.openWhen} />
  {/* Global scattered polaroids overlay */}
  <PolaroidGallery photos={data.photos} />
  {/* Lock overlay until anniversary midnight */}
  <LockUntil targetISO={(() => {
    // compute the next occurrence of anniversary date at 00:00
    try {
      const ann = new Date(data.anniversary)
      const now = new Date()
      const target = new Date(now.getFullYear(), ann.getMonth(), ann.getDate(), 0, 0, 0, 0)
      // if that target is in the past, pick next year
      if (target.getTime() <= now.getTime()) target.setFullYear(target.getFullYear() + 1)
      return target.toISOString()
    } catch(e){ return null }
  })()} />
    </div>
  )
}
