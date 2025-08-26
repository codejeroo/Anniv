import React from 'react'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, x: -8, scale: 0.995 },
  show: { opacity: 1, x: 0, scale: 1 },
  hover: { scale: 1.03, y: -6 }
}

export default function WrappedSection({ title, items, renderItem }) {
  return (
    <section className="card">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="grid gap-3">
        {items.map((it, i) => (
          <motion.div key={i} initial="hidden" animate="show" whileHover="hover" variants={itemVariants} transition={{ delay: i * 0.05, type: 'spring', stiffness: 120 }} className="p-3 rounded-lg bg-white bg-opacity-5">
            {renderItem(it, i)}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
