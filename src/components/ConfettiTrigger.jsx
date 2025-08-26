import { useEffect } from 'react'
import confetti from 'canvas-confetti'

function burst(count = 80, origin = { y: 0.3 }) {
  confetti({ particleCount: Math.min(count, 300), spread: 80, origin })
}

export default function ConfettiTrigger() {
  useEffect(() => {
    // initial burst
    burst(100, { y: 0.25 })

    function handler(e) {
      const { detail } = e
      const amount = (detail && detail.count) || 90
      burst(amount, { y: 0.3 })
    }

    window.addEventListener('relationship:confetti', handler)
    return () => window.removeEventListener('relationship:confetti', handler)
  }, [])

  return null
}
