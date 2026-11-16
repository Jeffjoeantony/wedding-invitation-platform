import { WG } from './tokens'

/**
 * Natural deckle / torn-paper edge, matched to the reference:
 * low on the left, peak at ~57%, dip at ~87%, fine fibrous teeth.
 * Used between the photo hero and ivory body.
 */

const W = 1440
const H = 42

// Large-scale silhouette: [x as fraction of width, y in viewBox units]
const PROFILE: [number, number][] = [
  [0.0, 18],
  [0.06, 21],
  [0.12, 19],
  [0.2, 16],
  [0.3, 13],
  [0.4, 10],
  [0.48, 7],
  [0.55, 4],
  [0.6, 5],
  [0.66, 10],
  [0.73, 17],
  [0.8, 24],
  [0.87, 31],
  [0.91, 27],
  [0.96, 23],
  [1.0, 25],
]

// Seeded PRNG so output is identical on server and client
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function profileY(x: number) {
  const f = x / W
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [x0, y0] = PROFILE[i]
    const [x1, y1] = PROFILE[i + 1]
    if (f >= x0 && f <= x1) {
      const t = (f - x0) / (x1 - x0)
      const s = (1 - Math.cos(t * Math.PI)) / 2 // smooth interpolation
      return y0 + (y1 - y0) * s
    }
  }
  return PROFILE[PROFILE.length - 1][1]
}

function buildTornPath() {
  const rand = mulberry32(20260912)
  const pts: string[] = []
  let x = 0

  while (x < W) {
    const base = profileY(x)
    const mid = Math.sin(x * 0.045) * 1.2          // medium waviness
    const fine = (rand() - 0.5) * 5                 // fibre-level jitter
    const spike = rand() > 0.82 ? (rand() - 0.5) * 5 : 0 // occasional sharper tear
    const y = Math.min(H - 2, Math.max(1, base + mid + fine + spike))
    pts.push(`L${x.toFixed(1)} ${y.toFixed(1)}`)
    x += 4 + rand() * 7 // irregular spacing 4–11 units
  }

  const endY = profileY(W) + (rand() - 0.5) * 2
  return `M0 ${profileY(0).toFixed(1)} ${pts.slice(1).join(' ')} L${W} ${endY.toFixed(1)} L${W} ${H} L0 ${H} Z`
}

const TORN_PATH = buildTornPath()

export function TornEdge({
  fill = WG.champagne,
  placement = 'bottom',
}: {
  fill?: string
  /** `top` flips the edge for the start of a photo section */
  placement?: 'top' | 'bottom'
}) {
  const isTop = placement === 'top'
  return (
    <div
      className={
        isTop
          ? 'pointer-events-none absolute inset-x-0 top-0 z-[2] w-full -translate-y-[1px] rotate-180 leading-[0]'
          : 'pointer-events-none absolute inset-x-0 bottom-0 z-[2] w-full translate-y-[1px] leading-[0]'
      }
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-8 w-full sm:h-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill={fill} d={TORN_PATH} />
      </svg>
    </div>
  )
}