import React, { useState } from 'react'

export default function EasterEggs({ onPlaySong = () => {}, secretNote = 'You are my favorite person.' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="easter" style={{ right: 24, bottom: 24 }} onClick={(e) => { e.stopPropagation(); onPlaySong(); }} title="Surprise song">
        <div className="emoji">⭐</div>
      </div>

      <div className="easter" style={{ left: 20, bottom: 120 }} onClick={(e) => { e.stopPropagation(); setOpen(true); }} title="Secret note">
        <div className="emoji">🧸</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black bg-opacity-60 absolute inset-0" onClick={() => setOpen(false)} />
          <div className="card relative z-10 max-w-sm p-6 handwritten">
            <div className="text-lg font-bold mb-2">A secret note</div>
            <div className="text-sm">{secretNote}</div>
            <div className="mt-4 text-right">
              <button className="px-3 py-1 bg-white bg-opacity-10 rounded" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
