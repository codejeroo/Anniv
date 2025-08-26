import React, { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function PolaroidGallery({ photos = [] }) {
  const containerRef = useRef(null)
  // photos now expected as objects: { src, caption, name, back }
  // generate initial random positions (percent) and rotations
  const initialItems = useMemo(() => {
    const half = Math.ceil(photos.length / 2)
    return photos.map((p, i) => {
      const isLeft = i < half
      return {
        id: i,
        src: p.src,
        caption: p.caption || `Memory #${i + 1}`,
        name: p.name || '',
        back: p.back || '',
        // left column near the left edge, right column near the right edge
        left: isLeft ? randomBetween(4, 18) : randomBetween(82, 96),
        top: randomBetween(8, 86),
        rot: randomBetween(-16, 16)
      }
    })
  }, [photos])

  const [itemsState, setItemsState] = useState(initialItems)
  useEffect(() => setItemsState(initialItems), [initialItems])

  const [zCounter, setZCounter] = useState(1)
  const [zMap, setZMap] = useState(() => initialItems.reduce((acc, it) => (acc[it.id] = 1, acc), {}))
  const [flipped, setFlipped] = useState({})
  const [focused, setFocused] = useState(null)
  const controlsRef = useRef({})

  useEffect(() => {
    function onFocus(ev) {
      const idx = ev?.detail?.index
      if (typeof idx !== 'number') return
      setFocused(idx)
      // clear focus after a few seconds
      setTimeout(() => setFocused(null), 3000)
    }
    window.addEventListener('relationship:focus-photo', onFocus)
    return () => window.removeEventListener('relationship:focus-photo', onFocus)
  }, [])

  function bringToFront(id) {
    setZCounter((c) => {
      const next = c + 1
  setZMap((m) => ({ ...m, [id]: next }))
      return next
    })
  }

  const rendered = itemsState.map((it, i) => {
    const isFocused = focused === i
    return (
      <motion.div
        key={it.id}
        className="polaroid absolute pointer-events-auto"
        style={{ left: `${it.left}%`, top: `${it.top}%`, zIndex: isFocused ? 9999 : (zMap[it.id] || 1) }}
        initial={{ rotate: it.rot, x: '-50%', y: '-50%', scale: 1 }}
        animate={isFocused ? { left: '50%', top: '50%', x: '-50%', y: '-50%', scale: 2.2, rotate: 0 } : { left: `${it.left}%`, top: `${it.top}%`, x: '-50%', y: '-50%', scale: 1, rotate: it.rot }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        whileTap={{ scale: 1.04 }}
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        onDragStart={() => bringToFront(it.id)}
        onDragEnd={(e, info) => {
          try {
            const rect = containerRef.current && containerRef.current.getBoundingClientRect()
            if (!rect) return
            // info.point is the pointer position; compute new left/top as percent within container
            const x = info.point.x - rect.left
            const y = info.point.y - rect.top
            const newLeft = (x / rect.width) * 100
            const newTop = (y / rect.height) * 100
            setItemsState((prev) => prev.map((it2) => it2.id === it.id ? { ...it2, left: Math.max(0, Math.min(100, newLeft)), top: Math.max(0, Math.min(100, newTop)) } : it2))
          } catch (err) {
            // ignore
          }
        }}
      >
        <div className={`polaroid-inner ${flipped[it.id] ? 'flipped' : ''}`} onClick={() => { setFlipped((s) => ({ ...s, [it.id]: !s[it.id] })); bringToFront(it.id) }}>
          <div className="polaroid-front">
            <img src={it.src} alt={it.caption} className="polaroid-img" onError={(e) => {
              try { console.warn('[PolaroidGallery] image failed to load', it.src) } catch(e){}
              e.currentTarget.onerror = null
              e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" font-size="18" fill="#fff" text-anchor="middle" alignment-baseline="middle">Image not found</text></svg>'
            }} />
            <div className="polaroid-caption">
              <div className="font-semibold">{it.caption}</div>
              {it.name ? <div className="text-xs opacity-80">{it.name}</div> : null}
            </div>
          </div>
          <div className="polaroid-back">
            <div className="p-3 text-sm">{it.back || 'A little note...'}</div>
          </div>
        </div>
      </motion.div>
    )
  })

  return (
  // full viewport overlay so polaroids appear scattered across the whole page
  // keep container pointer-events disabled so it doesn't block the central UI;
  // individual polaroids are pointer-events-auto so they remain interactive
  <div ref={containerRef} className="polaroid-container fixed inset-0 pointer-events-none z-30">
      {/* subtle hint to show interactivity */}
      <div className="polaroid-hint" aria-hidden="true">
        <span className="dot" />
        <span>Click or drag photos</span>
      </div>
  {rendered}
    </div>
  )
}
