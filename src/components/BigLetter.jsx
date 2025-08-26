import React, { useState } from 'react'

export default function BigLetter({ letter, password = '092708' }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function tryOpen(e) {
    e.preventDefault()
    if (input.trim() === password) {
      setError(false)
      setOpen(true)
    } else {
      setError(true)
      // clear after a short delay so user can try again
      setTimeout(() => setError(false), 1800)
    }
  }

  if (open) {
    return (
      <div className="card max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">A Letter For You</h2>
        <div className="whitespace-pre-wrap text-sm opacity-95">{letter}</div>
      </div>
    )
  }

  return (
    <div className="card max-w-xl mx-auto text-center">
      <div className="text-6xl font-extrabold mb-4">Secret</div>
      <p className="mb-3 opacity-80">hint password sa phone ko</p>
      <form onSubmit={tryOpen} className="flex items-center justify-center gap-3">
        <input aria-label="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="say the password" className="px-3 py-2 rounded-md text-black" />
        <button type="submit" className="px-3 py-2 bg-pink-400 rounded-md text-black">Open</button>
      </form>
      {error ? (
        <div className="mt-4">
          <div className="text-red-300 font-semibold">Wrong password!</div>
          <img src="https://media.giphy.com/media/3o6gbbuLW76jkt8vIc/giphy.gif" alt="cute error" className="mt-2 w-40 mx-auto rounded" />
        </div>
      ) : null}
    </div>
  )
}
