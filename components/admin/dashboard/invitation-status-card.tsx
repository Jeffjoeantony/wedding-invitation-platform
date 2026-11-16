'use client'

import type { InvitationStatusSlice } from '@/lib/dashboard/types'

export function InvitationStatusCard({
  slices,
  isDemo,
}: {
  slices: InvitationStatusSlice[]
  isDemo?: boolean
}) {
  const total = slices.reduce((s, x) => s + x.count, 0) || 1
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_1px_3px_rgba(23,35,63,0.04)]">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#17233F]">Invitation Status</h3>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Total: {slices.reduce((s, x) => s + x.count, 0)}
            {isDemo ? <span className="ml-1 text-[#CBD5E1]">· demo mix</span> : null}
          </p>
        </div>
      </div>

      <div className="mt-4 flex h-3 shrink-0 overflow-hidden rounded-full bg-[#F1F5F9]">
        {slices.map((slice) => {
          const pct = (slice.count / total) * 100
          if (pct <= 0) return null
          return (
            <div
              key={slice.key}
              title={`${slice.label}: ${slice.count}`}
              style={{ width: `${pct}%`, background: slice.color }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          )
        })}
      </div>

      <ul className="mt-4 flex flex-1 flex-col justify-evenly divide-y divide-[#F1F5F9]">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between py-2.5 text-sm">
            <span className="inline-flex items-center gap-2.5 text-[#334155]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: slice.color }}
                aria-hidden
              />
              {slice.label}
            </span>
            <span className="font-semibold tabular-nums text-[#17233F]">{slice.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
