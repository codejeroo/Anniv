import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function Quiz({ questions = [] }) {
  const [selected, setSelected] = useState({})
  const [showGif, setShowGif] = useState(null)

  function answer(qi, idx) {
    if (selected[qi] != null) return
    const q = questions[qi]
    const correct = q.answer === idx
    setSelected((s) => ({ ...s, [qi]: { idx, correct } }))
    if (!correct) {
      setShowGif(q.wrongGif)
      setTimeout(() => setShowGif(null), 3000)
    }
  }

  return (
    <div>
      {questions.map((q, i) => {
        const sel = selected[i]
        return (
          <div key={q.id} className="mb-4 card p-4">
            <div className="font-bold mb-2">{q.question}</div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, idx) => {
                const isSelected = sel && sel.idx === idx
                const correct = sel && sel.correct && sel.idx === idx
                return (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={opt} onClick={() => answer(i, idx)} className={`quiz-option p-3 rounded-lg text-left ${isSelected ? (correct ? 'bg-pink-500 bg-opacity-75 text-white border-pink-400' : 'bg-red-500 bg-opacity-75 text-white border-red-400') : 'text-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${isSelected ? (correct ? 'bg-white text-pink-600' : 'bg-white text-red-500') : 'bg-white bg-opacity-10 text-white opacity-80'}`}> {isSelected ? (correct ? '♥' : '×') : ''} </div>
                      <div className="flex-1">{opt}</div>
                    </div>
                    {correct && <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-2 text-sm handwritten">{q.rightFeedback}</motion.div>}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}

      {showGif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black bg-opacity-60 absolute inset-0" onClick={() => setShowGif(null)} />
          <div className="card relative z-10 p-4">
            <img src={showGif} alt="silly" className="max-w-xs" />
          </div>
        </div>
      )}
    </div>
  )
}
