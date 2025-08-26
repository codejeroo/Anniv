import React, { useEffect, useMemo, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

export default function DaysCounter({ anniversary, milestones = [], onMilestone }) {
  const targetDays = useMemo(() => {
    try {
      const a = new Date(anniversary)
      const now = new Date()
      return Math.max(0, Math.floor((now - a) / (1000 * 60 * 60 * 24)))
    } catch (e) {
      return 0
    }
  }, [anniversary])

  const motionVal = useMotionValue(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    // animate the motion value to the targetDays and update state on each frame
    const controls = animate(motionVal, targetDays, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate(v) {
        setCurrent(Math.floor(v))
      }
    })

    // immediate milestone check (App dedupes via seenMilestones)
    milestones.forEach((m) => {
      if (targetDays >= m) onMilestone && onMilestone(m)
    })

    return () => controls.stop()
  }, [targetDays])

  return (
    <div className="text-right">
      <div className="text-sm opacity-80">Days together</div>
      <motion.div className="text-3xl font-bold">{current}</motion.div>
    </div>
  )
}
