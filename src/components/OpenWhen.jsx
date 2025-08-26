import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OpenWhen({ items = [] }) {
  const [open, setOpen] = useState(null)

  const itemVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1 },
    float: { y: [0, -6, 0], transition: { duration: 4, repeat: Infinity } }
  }

  function openItem(it) {
    setOpen(it)
    // trigger a confetti burst for fun
    window.dispatchEvent(new CustomEvent('relationship:confetti', { detail: { count: 60, reason: 'openWhen' } }))
  }

  return (
    <>
      {/* scattered letter buttons with entrance + floating */}
      {items.map((it, i) => (
        <motion.button key={it.id} onClick={() => openItem(it)} initial="hidden" animate="show" variants={itemVariants} whileHover={{ scale: 1.08 }} style={{ left: it.left, top: it.top }} className="openwhen-btn fixed w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold drop-shadow-2xl" aria-label={it.label}>
          <motion.div style={{ background: it.color }} className="w-full h-full rounded-full flex items-center justify-center text-white" whileHover={{ scale: 1.05 }}>{it.label.split(' ').slice(-1)[0].slice(0,2).toUpperCase()}</motion.div>
        </motion.button>
      ))}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="bg-black/70 p-6 rounded-lg max-w-xl w-full">
              <div className="flex items-start gap-4">
                <div style={{ background: open.color }} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">{open.label.split(' ').slice(-1)[0].slice(0,2).toUpperCase()}</div>
                <div>
                  <div className="font-bold text-lg">{open.label}</div>
                  <div className="mt-3 text-sm opacity-90">
                    {open.type === 'gif' ? (
                      <img src={open.content} alt={open.label} className="max-h-60 rounded shadow-lg" />
                    ) : (
                      <div className="text-white/90 bg-white/5 p-3 rounded">{open.content}</div>
                    )}
                  </div>
                </div>
                <div className="ml-auto">
                  <button onClick={() => setOpen(null)} className="px-3 py-1 bg-white bg-opacity-10 rounded">Close</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .openwhen-btn { z-index: 40; cursor: pointer; }
        .openwhen-btn > div { transition: transform 0.18s ease; }
        .openwhen-btn:hover > div { transform: scale(1.06); }
      `}</style>
    </>
  )
}
