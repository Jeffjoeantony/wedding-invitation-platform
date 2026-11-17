'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { GALLERY_CAROUSEL } from './constants'

const N = GALLERY_CAROUSEL.length
const COPIES = [-1, 0, 1] as const
const STEP_MS = 3200
const MOTION = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease, box-shadow 650ms ease'

type Slot = { x: number; y: number; scale: number; rot: number; z: number }

type Layout = {
  stageW: number
  cardW: number
  cardH: number
  stageH: number
  slots: Slot[]
}

/** Desktop arc — center dominates; neighbors drop and shrink. */
const DESKTOP_SLOTS: Slot[] = [
  { x: 0, y: 0, scale: 1, rot: 0, z: 100 },
  { x: 190, y: 12, scale: 0.94, rot: 3, z: 80 },
  { x: 365, y: 24, scale: 0.86, rot: 7, z: 60 },
  { x: 515, y: 36, scale: 0.76, rot: 12, z: 40 },
]

const TABLET_SLOTS: Slot[] = [
  { x: 0, y: 0, scale: 1, rot: 0, z: 100 },
  { x: 150, y: 12, scale: 0.92, rot: 3, z: 80 },
  { x: 280, y: 22, scale: 0.82, rot: 7, z: 60 },
]

const MOBILE_SLOTS: Slot[] = [
  { x: 0, y: 0, scale: 1, rot: 0, z: 100 },
  { x: 105, y: 14, scale: 0.84, rot: 5, z: 80 },
]

function layoutFor(stageWidth: number): Layout {
  const desktop = stageWidth >= 1024
  const tablet = stageWidth >= 640
  const cardW = desktop ? 225 : tablet ? 196 : 168
  const cardH = Math.round(cardW * (4 / 3))
  const base = desktop ? DESKTOP_SLOTS : tablet ? TABLET_SLOTS : MOBILE_SLOTS
  const outer = base[base.length - 1]
  const halfCard = (cardW * outer.scale) / 2
  const maxX = Math.max(cardW * 0.55, stageWidth / 2 - halfCard - 10)
  const fit = outer.x > maxX ? maxX / outer.x : 1
  return {
    stageW: stageWidth,
    cardW,
    cardH,
    stageH: desktop ? 330 : cardH + 64,
    slots: base.map((slot) => ({ ...slot, x: slot.x * fit })),
  }
}

function sample(offset: number, slots: Slot[]) {
  const max = slots.length - 1
  const sign = offset < 0 ? -1 : 1
  const abs = Math.abs(offset)
  const edge = slots[max]

  if (abs >= max + 0.55) {
    return {
      x: sign * edge.x,
      y: edge.y,
      rotY: -sign * edge.rot,
      scale: edge.scale,
      opacity: 0,
      zIndex: 0,
      shadow: '0 10px 30px rgba(0,0,0,0.08)',
    }
  }

  const pos = Math.min(abs, max)
  const i0 = Math.min(max - 1, Math.floor(pos))
  const t = pos - i0
  const a = slots[i0]
  const b = slots[Math.min(max, i0 + 1)]
  const lerp = (from: number, to: number) => from + (to - from) * t

  let x = lerp(a.x, b.x)
  let y = lerp(a.y, b.y)
  let rot = lerp(a.rot, b.rot)
  let scale = lerp(a.scale, b.scale)
  const zIndex = Math.round(lerp(a.z, b.z))

  if (abs > max) {
    const extra = abs - max
    const step = slots[max].x - slots[max - 1].x
    x = slots[max].x + extra * step * 0.35
    y = slots[max].y
    rot = slots[max].rot
    scale = slots[max].scale
  }

  const opacity = abs <= max ? 1 : Math.max(0, 1 - (abs - max) / 0.55)
  const shadow =
    abs < 0.5
      ? '0 16px 36px rgba(0,0,0,0.12)'
      : '0 10px 30px rgba(0,0,0,0.08)'

  return {
    x: sign * x,
    y,
    rotY: -sign * rot,
    scale,
    opacity,
    zIndex,
    shadow,
  }
}

export function LandingGalleryCarousel() {
  const reduceMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const progressRef = useRef(3)
  const layoutRef = useRef<Layout>(layoutFor(1280))
  const motionRef = useRef(true)
  const dragRef = useRef<{ pointerId: number; x: number; progress: number } | null>(null)
  const paintRef = useRef<() => void>(() => {})
  const [broken, setBroken] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const paint = () => {
      const width = stage.clientWidth || window.innerWidth
      const prev = layoutRef.current
      const next = prev.stageW === width ? prev : layoutFor(width)
      layoutRef.current = next
      stage.style.height = `${next.stageH}px`

      const progress = progressRef.current
      const transition = !motionRef.current || reduceMotion ? 'none' : MOTION
      let node = 0

      for (let index = 0; index < N; index += 1) {
        for (const copy of COPIES) {
          const el = cardRefs.current[node]
          node += 1
          if (!el) continue
          const pose = sample(index + copy * N - progress, next.slots)
          el.style.width = `${next.cardW}px`
          el.style.height = `${next.cardH}px`
          el.style.marginLeft = `${-next.cardW / 2}px`
          el.style.marginTop = `${-next.cardH / 2}px`
          el.style.transition = transition
          el.style.transform = `translate3d(${pose.x}px, ${pose.y}px, 0) rotateY(${pose.rotY}deg) scale(${pose.scale})`
          el.style.zIndex = String(pose.zIndex)
          el.style.opacity = String(pose.opacity)
          el.style.boxShadow = pose.shadow
          el.style.pointerEvents = pose.opacity > 0.45 ? 'auto' : 'none'
          el.setAttribute('aria-hidden', pose.opacity < 0.5 ? 'true' : 'false')
        }
      }
    }

    paintRef.current = paint
    paint()

    const observer = new ResizeObserver(() => paint())
    observer.observe(stage)

    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!dragRef.current && !reduceMotion) {
          motionRef.current = true
          progressRef.current = (progressRef.current + 1) % N
          paint()
        }
        schedule()
      }, STEP_MS)
    }
    if (!reduceMotion) schedule()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [reduceMotion])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    motionRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      progress: progressRef.current,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    paintRef.current()
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const step = Math.max(140, layoutRef.current.slots[1]?.x ?? layoutRef.current.cardW)
    let next = drag.progress - (event.clientX - drag.x) / step
    next = ((next % N) + N) % N
    progressRef.current = next
    paintRef.current()
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    const target = ((Math.round(progressRef.current) % N) + N) % N
    progressRef.current = target
    requestAnimationFrame(() => {
      motionRef.current = true
      paintRef.current()
    })
  }

  return (
    <div
      className="landing-coverflow relative w-full"
      aria-label="Wedding photography gallery"
    >
      <div
        ref={stageRef}
        className="landing-coverflow-scene relative mx-auto flex w-full touch-pan-y items-center justify-center"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          perspective: '1600px',
          perspectiveOrigin: '50% 46%',
          height: 330,
          overflow: 'visible',
          cursor: 'grab',
        }}
      >
        <div
          className="landing-coverflow-stage absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {GALLERY_CAROUSEL.map((item, index) =>
            COPIES.map((copy) => {
              const node = index * COPIES.length + (copy + 1)
              const src = item.image
              return (
                <figure
                  key={`${src}-${copy}`}
                  ref={(el) => {
                    cardRefs.current[node] = el
                  }}
                  className="landing-coverflow-card absolute left-1/2 top-1/2 m-0 overflow-hidden bg-[#E6DDD0]"
                  style={{ width: 225, height: 300 }}
                >
                  {broken[src] ? null : (
                    <img
                      src={src}
                      alt={copy === 0 ? item.alt : ''}
                      className="h-full w-full object-cover"
                      draggable={false}
                      onError={() => setBroken((prev) => ({ ...prev, [src]: true }))}
                    />
                  )}
                </figure>
              )
            }),
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2.5" aria-hidden>
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="block rounded-full"
            style={{
              width: 5,
              height: 5,
              background: d === 1 ? '#1C1916' : '#C5BDB2',
            }}
          />
        ))}
      </div>
    </div>
  )
}
