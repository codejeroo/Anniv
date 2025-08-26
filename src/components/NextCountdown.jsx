import React, { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function addMonthsSafe(date, months) {
  const d = new Date(date.getTime())
  const targetMonth = d.getMonth() + months
  const y = d.getFullYear() + Math.floor(targetMonth / 12)
  const m = (targetMonth % 12 + 12) % 12
  // try to set same date; if overflow (e.g., Feb 30) pick last day of month
  const lastDay = new Date(y, m + 1, 0).getDate()
  const day = Math.min(d.getDate(), lastDay)
  return new Date(y, m, day, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())
}

function daysBetween(a, b) {
  const ms = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((b.setHours(0,0,0,0) - a.setHours(0,0,0,0)) / ms))
}

export default function NextCountdown({ anniversary, milestones = [] }) {
  const info = useMemo(() => {
    try {
      // normalize anniversary base to local midnight so all targets fall at 00:00
      const a = new Date(anniversary)
      a.setHours(0,0,0,0)
      const now = new Date()

      // days together (full days since anniversary at local midnight)
      const msDay = 1000 * 60 * 60 * 24
      const daysTogether = Math.max(0, Math.floor((now - a) / msDay))

      // next monthiversary: find smallest n >= 0 such that addMonthsSafe(a, n) > now
      let n = 0
      let candidate = addMonthsSafe(a, n)
      // ensure candidate is also at midnight
      candidate.setHours(0,0,0,0)
      while (candidate <= now && n < 1200) {
        n += 1
        candidate = addMonthsSafe(a, n)
        candidate.setHours(0,0,0,0)
      }
      const daysToMonthiversary = daysBetween(new Date(now), new Date(candidate))

      // next milestone from milestones array (sorted)
  const sorted = Array.isArray(milestones) ? [...milestones].sort((x,y)=>x-y) : []
      const nextMilestone = sorted.find((m) => m > daysTogether) || null
      const daysToMilestone = nextMilestone ? Math.max(0, nextMilestone - daysTogether) : null

      // choose which to show (soonest)
      let type = 'monthiversary'
  if (nextMilestone && daysToMilestone <= daysToMonthiversary) type = 'milestone'

      return {
        daysTogether,
        monthiversary: { date: candidate, daysLeft: daysToMonthiversary },
        milestone: nextMilestone ? { value: nextMilestone, daysLeft: daysToMilestone } : null,
        nextType: type
      }
    } catch (e) {
      return null
    }
  }, [anniversary, milestones])

  if (!info) return null

  const { nextType, monthiversary, milestone } = info
  // compute target date for the next event
  const targetDate = useMemo(() => {
    try {
      // ensure base anniversary at local midnight so milestone target is at 00:00
      const a = new Date(anniversary)
      a.setHours(0,0,0,0)
      if (nextType === 'monthiversary') return new Date(monthiversary.date)
      if (nextType === 'milestone' && milestone) return new Date(a.getTime() + milestone.value * 24 * 60 * 60 * 1000)
      return null
    } catch (e) {
      return null
    }
  }, [nextType, monthiversary, milestone, anniversary])

  const [secsLeft, setSecsLeft] = useState(() => {
    if (!targetDate) return null
    return Math.max(0, Math.floor((new Date(targetDate) - new Date()) / 1000))
  })
  const [reached, setReached] = useState(false)
  const [showHeart, setShowHeart] = useState(false)

  useEffect(() => {
    if (!targetDate) return
    setSecsLeft(Math.max(0, Math.floor((new Date(targetDate) - new Date()) / 1000)))
    const t = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(targetDate) - new Date()) / 1000))
      setSecsLeft(left)
      if (left <= 0) {
        clearInterval(t)
        setReached(true)
        setShowHeart(true)
        // dispatch confetti event
        window.dispatchEvent(new CustomEvent('relationship:confetti', { detail: { count: 260, reason: nextType } }))
        // hide heart after a short time
        setTimeout(() => setShowHeart(false), 4200)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  function formatLeft(s) {
    if (s == null) return ''
    const days = Math.floor(s / 86400)
    const hours = Math.floor((s % 86400) / 3600)
    const mins = Math.floor((s % 3600) / 60)
    const secs = s % 60
    if (days > 0) return `${days}d ${String(hours).padStart(2,'0')}h ${String(mins).padStart(2,'0')}m`
    return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }

  // calendar helpers
  function toUTCStringForICS(d) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  }

  function makeICS(title, startDate, endDate) {
    const uid = `relwrapped-${Date.now()}@local`
    const dtstart = toUTCStringForICS(startDate)
    const dtend = toUTCStringForICS(endDate)
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Relationship Wrapped//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${toUTCStringForICS(new Date())}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${title}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ]
    return lines.join('\r\n')
  }

  function googleCalendarUrl(title, startDate, endDate, details = '') {
    const fmt = (d) => toUTCStringForICS(d)
    const start = fmt(startDate)
    const end = fmt(endDate)
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      details,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm mt-2">
      <div className="inline-flex items-center gap-3 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
        {nextType === 'monthiversary' ? (
          <>
            <span className="opacity-90">Next Monthiversary:</span>
            <span className="font-semibold">{formatLeft(secsLeft)} left</span>
            <span>💕</span>
          </>
        ) : (
          <>
            <span className="opacity-90">Next Milestone:</span>
            <span className="font-semibold">{milestone.value} days — {formatLeft(secsLeft)} left</span>
            <span>🎉</span>
          </>
        )}

        {/* celebratory heart */}
        {showHeart && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: [1.2, 0.9, 1.05] }} transition={{ duration: 1.2 }} className="text-pink-300 text-xl ml-2 drop-shadow-lg">❤️</motion.span>
        )}
      </div>
      {/* add-to-calendar links (show when we have a computed targetDate) */}
      {targetDate && (
        <div className="mt-2 flex gap-2">
          {(() => {
            const start = new Date(targetDate)
            const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour event
            let title = ''
            let details = ''
            if (nextType === 'monthiversary') {
              title = `Monthiversary — ${start.toLocaleDateString()}`
              details = 'Celebrating our monthiversary!'
            } else if (nextType === 'milestone' && milestone) {
              title = `Milestone — ${milestone.value} days`
              details = `Reached ${milestone.value} days together` 
            } else {
              title = `Special day — ${start.toLocaleDateString()}`
            }

            const ics = makeICS(title, start, end)
            const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`
            const gcal = googleCalendarUrl(title, start, end, details)
            return (
              <>
                <a href={gcal} target="_blank" rel="noreferrer" className="text-xs bg-white/90 text-black px-2 py-1 rounded shadow-sm hover:scale-105 transition-transform">Add to Google Calendar</a>
                <a href={icsUrl} download="event.ics" className="text-xs bg-white/90 text-black px-2 py-1 rounded shadow-sm hover:scale-105 transition-transform">Download .ics</a>
              </>
            )
          })()}
        </div>
      )}
      {reached && <div className="text-xs opacity-80 mt-2">It's here — celebrate! 🎉</div>}
    </motion.div>
  )
}
