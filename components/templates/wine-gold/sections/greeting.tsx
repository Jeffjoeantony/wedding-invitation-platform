import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'

export function GreetingSection({ data }: { data: WineGoldData }) {
  const { greeting } = data

  return (
    <div className="relative px-7 pb-2 pt-8 text-center sm:px-10 sm:pt-10">
      <h2
        className="text-[clamp(1.65rem,6.5vw,2.05rem)] font-light leading-tight"
        style={{ color: WG.burgundy, fontFamily: SERIF }}
      >
        {greeting.title}
      </h2>
      <p
        className="mx-auto mt-5 max-w-[32ch] text-[0.92rem] font-light leading-[1.7]"
        style={{ color: WG.muted, fontFamily: SANS }}
      >
        {greeting.body}
      </p>
    </div>
  )
}
