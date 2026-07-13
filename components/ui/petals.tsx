'use client'

import { useEffect, useMemo, useState } from 'react'

type Petal = {
  left: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
}

// Very subtle drifting petals/dust for ambient depth.
export function Petals({ count = 14 }: { count?: number }) {
  // Render only after mount: the randomized inline styles differ between the
  // server and client number serializers, so keep this purely client-side.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const petals = useMemo<Petal[]>(() => {
    const round = (n: number) => Math.round(n * 100) / 100
    return Array.from({ length: count }).map((_, i) => {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * n) * 10000
        return x - Math.floor(x)
      }
      return {
        left: round(r(12.9898) * 100),
        size: round(6 + r(78.233) * 9),
        duration: round(13 + r(37.719) * 10),
        delay: round(r(4.113) * -18),
        drift: round((r(93.11) - 0.5) * 120),
        opacity: round(0.25 + r(19.02) * 0.35),
      }
    })
  }, [count])

  if (!mounted) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="animate-petal absolute top-0 block rounded-full bg-gold-soft/70 blur-[0.5px]"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.25}px`,
              borderRadius: '60% 60% 62% 62% / 80% 80% 40% 40%',
              '--petal-duration': `${p.duration}s`,
              '--petal-drift': `${p.drift}px`,
              '--petal-opacity': p.opacity,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
