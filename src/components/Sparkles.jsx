import React, { useEffect } from 'react'

export default function Sparkles({ x = 0, y = 0, count = 8 }) {
  useEffect(() => {
    // simple client-side mount effect; actual DOM sparkles managed by parent via CSS classes
  }, [])

  // Render invisible container; sparkles will be appended dynamically by event handlers in components
  return <div aria-hidden className="sparkles-root" style={{ position: 'absolute', left: x, top: y }} />
}
