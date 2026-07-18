'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// Elegant opening-envelope loader that transitions into the hero.
export function Loader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      setHidden(true)
      onDoneRef.current()
    }

    if (reduce) {
      const t = setTimeout(finish, 400)
      return () => clearTimeout(t)
    }

    const t1 = setTimeout(() => setOpen(true), 900)
    const t2 = setTimeout(finish, 2600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reduce])

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--gold-soft)_28%,var(--background)),var(--background))]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ pointerEvents: 'none' }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 35%), radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--gold-soft) 30%, transparent), transparent 40%)',
            }}
          />
          <div className="relative flex flex-col items-center gap-7">
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-28 w-40"
              style={{ perspective: 800 }}
            >
              <div className="absolute inset-0 rounded-sm border border-gold/50 bg-card shadow-[0_20px_60px_-30px_rgba(0,0,0,0.4)]" />
              <motion.div
                className="absolute inset-x-3 bottom-2 top-3 rounded-sm border border-gold/30 bg-[color-mix(in_oklab,var(--gold-soft)_18%,white)]"
                initial={{ y: 0 }}
                animate={open ? { y: -26, opacity: 1 } : { y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-1">
                  <span className="font-serif text-2xl leading-none text-foreground">R &amp; A</span>
                  <span className="h-px w-8 bg-gold/60" />
                </div>
              </motion.div>
              <motion.div
                className="absolute left-0 top-0 h-14 w-full origin-top"
                style={{ transformStyle: 'preserve-3d' }}
                initial={{ rotateX: 0 }}
                animate={open ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="h-full w-full border border-gold/50 bg-card"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                />
              </motion.div>
            </motion.div>
            <motion.span
              className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Cordially invites you
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
