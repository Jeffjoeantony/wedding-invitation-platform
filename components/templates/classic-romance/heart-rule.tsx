import { Heart } from 'lucide-react'
import { CR } from './tokens'

export function HeartRule({ onDark = false }: { onDark?: boolean }) {
  const line = onDark ? 'rgba(246,239,228,0.45)' : 'rgba(92,16,24,0.28)'
  const heart = onDark ? CR.onDark : CR.burgundy
  return (
    <div className="mx-auto flex w-full max-w-[12rem] items-center gap-3" aria-hidden>
      <span className="h-px flex-1" style={{ background: line }} />
      <Heart className="h-3 w-3" style={{ color: heart }} fill="currentColor" strokeWidth={0} />
      <span className="h-px flex-1" style={{ background: line }} />
    </div>
  )
}
