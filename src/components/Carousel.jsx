import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Carousel({ photos = [] }) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState({ open: false, index: 0 })
  const timeout = useRef(null)

  useEffect(() => {
    start()
    return stop
    function start() {
      stop()
      timeout.current = setInterval(() => {
        setIndex((i) => (i + 1) % photos.length)
      }, 3500)
    }
    function stop() {
      if (timeout.current) clearInterval(timeout.current)
    }
  }, [photos.length])

  useEffect(() => {
    function onKey(e) {
      if (!lightbox.open) return
      if (e.key === 'ArrowRight') setLightbox((s) => ({ ...s, index: (s.index + 1) % photos.length }))
      if (e.key === 'ArrowLeft') setLightbox((s) => ({ ...s, index: (s.index - 1 + photos.length) % photos.length }))
      if (e.key === 'Escape') setLightbox({ open: false, index: 0 })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox.open, photos.length])

  if (!photos.length) return null

  return (
    <>
      <div className="relative w-full h-64 overflow-hidden rounded-lg">
        <AnimatePresence>
          <motion.img key={index} src={photos[index]} alt={`photo-${index}`} className="absolute inset-0 w-full h-full object-cover rounded-lg cursor-zoom-in"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} onClick={() => setLightbox({ open: true, index })} />
        </AnimatePresence>

        <div className="absolute left-3 bottom-3 flex gap-2">
          {photos.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white bg-opacity-40'}`} aria-label={`goto-${i}`} />
          ))}
        </div>

        <div className="absolute right-3 bottom-3 flex gap-2">
          <button onClick={() => setIndex((index-1+photos.length)%photos.length)} className="bg-white bg-opacity-20 px-3 py-1 rounded">Prev</button>
          <button onClick={() => setIndex((index+1)%photos.length)} className="bg-white bg-opacity-20 px-3 py-1 rounded">Next</button>
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="max-w-4xl w-full">
              <div className="relative">
                <img src={photos[lightbox.index]} alt={`lightbox-${lightbox.index}`} className="w-full h-[70vh] object-contain rounded-lg" />
                <button onClick={() => setLightbox({ open: false, index: 0 })} className="absolute right-2 top-2 bg-white bg-opacity-20 px-3 py-1 rounded">Close</button>
                <button onClick={() => setLightbox((s) => ({ ...s, index: (s.index - 1 + photos.length) % photos.length }))} className="absolute left-2 top-2 bg-white bg-opacity-20 px-3 py-1 rounded">◀</button>
                <button onClick={() => setLightbox((s) => ({ ...s, index: (s.index + 1) % photos.length }))} className="absolute left-12 top-2 bg-white bg-opacity-20 px-3 py-1 rounded">▶</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
