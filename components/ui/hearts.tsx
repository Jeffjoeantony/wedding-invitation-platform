'use client'

import { useEffect, useMemo, useState } from 'react'

type Heart = {
  left: number
  size: number
  fallDuration: number
  swayDuration: number
  delay: number
  drift: number
  opacity: number
  tone: 'gold' | 'soft' | 'deep' | 'blush'
}

const tones: Record<Heart['tone'], string> = {
  gold: 'var(--gold)',
  soft: 'color-mix(in oklab, var(--gold-soft) 90%, white)',
  deep: 'color-mix(in oklab, var(--gold) 72%, var(--foreground))',
  blush: 'color-mix(in oklab, var(--gold) 55%, oklch(0.72 0.08 25))',
}

/** Small gold-toned hearts drifting down across the invite. */
export function Hearts({ count = 28 }: { count?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const hearts = useMemo<Heart[]>(() => {
    const round = (n: number) => Math.round(n * 100) / 100
    const toneList: Heart['tone'][] = ['gold', 'soft', 'deep', 'blush']
    return Array.from({ length: count }).map((_, i) => {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * n) * 10000
        return x - Math.floor(x)
      }
      return {
        left: round(r(12.9898) * 100),
        size: round(7 + r(78.233) * 9),
        fallDuration: round(10 + r(37.719) * 14),
        swayDuration: round(3.2 + r(51.31) * 3.8),
        delay: round(r(4.113) * -24),
        drift: round(12 + r(93.11) * 28),
        opacity: round(0.28 + r(19.02) * 0.42),
        tone: toneList[Math.floor(r(63.77) * 4) % 4],
      }
    })
  }, [count])

  if (!mounted) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[25] overflow-hidden"
    >
      {hearts.map((h, i) => (
        <span
          key={i}
          className="animate-heart-fall absolute top-0 block will-change-transform"
          style={
            {
              left: `${h.left}%`,
              '--heart-duration': `${h.fallDuration}s`,
              '--heart-opacity': h.opacity,
              animationDelay: `${h.delay}s`,
            } as React.CSSProperties
          }
        >
          <span
            className="animate-heart-sway block will-change-transform"
            style={
              {
                '--heart-drift': `${h.drift}px`,
                '--heart-sway-duration': `${h.swayDuration}s`,
              } as React.CSSProperties
            }
          >
            <svg
              width={h.size}
              height={h.size}
              viewBox="0 0 24 24"
              fill={tones[h.tone]}
              style={{
                filter: 'drop-shadow(0 1px 3px color-mix(in oklab, var(--gold) 28%, transparent))',
              }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  )
}
