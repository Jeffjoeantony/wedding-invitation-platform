'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatAccent } from '@/lib/dashboard/types'

const ACCENT: Record<
  StatAccent,
  { iconBg: string; iconFg: string; badge: string; spark: string }
> = {
  teal: {
    iconBg: '#E8F8F2',
    iconFg: '#0D9F6E',
    badge: '#DCFCE7',
    spark: '#22C58B',
  },
  pink: {
    iconBg: '#FCE8EF',
    iconFg: '#D94874',
    badge: '#FCE7F3',
    spark: '#E86B91',
  },
  blue: {
    iconBg: '#E8F1FF',
    iconFg: '#3B7DFF',
    badge: '#DBEAFE',
    spark: '#4D91FF',
  },
  purple: {
    iconBg: '#EFEAFE',
    iconFg: '#6D52E0',
    badge: '#EDE9FE',
    spark: '#8B70F5',
  },
  amber: {
    iconBg: '#FEF3E0',
    iconFg: '#D97706',
    badge: '#FEF3C7',
    spark: '#F4AD32',
  },
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 64
  const h = 28
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w
      const y = h - ((v - min) / span) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      className="block shrink-0 overflow-visible"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.9}
      />
    </svg>
  )
}

export function StatCard({
  title,
  value,
  description,
  growth,
  icon: Icon,
  accent,
  sparkline,
  isDemo,
  className,
}: {
  title: string
  value: string
  description: string
  growth: string
  icon: LucideIcon
  accent: StatAccent
  sparkline: number[]
  isDemo?: boolean
  className?: string
}) {
  const theme = ACCENT[accent]
  const showGrowth = growth !== '—'
  const isDown = growth.trim().startsWith('-')

  return (
    <article
      className={cn(
        'flex h-full min-h-[148px] min-w-0 flex-col rounded-2xl border border-[#E6EAF0] bg-white p-4 shadow-[0_1px_3px_rgba(23,35,63,0.04)]',
        className,
      )}
    >
      {/* Row 1: icon + growth badge */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: theme.iconBg, color: theme.iconFg }}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span
          className={cn(
            'inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[11px] font-semibold',
            !showGrowth && 'invisible',
          )}
          style={{
            background: isDown ? '#FEE2E2' : theme.badge,
            color: isDown ? '#DC2626' : theme.iconFg,
          }}
          aria-hidden={!showGrowth}
        >
          {isDown ? '↓' : '↑'} {showGrowth ? growth.replace(/^-/, '') : '0%'}
        </span>
      </div>

      {/* Row 2: title + value */}
      <div className="mt-3 min-w-0">
        <p className="truncate text-[12px] font-medium text-[#64748B]">{title}</p>
        <p className="mt-1 truncate text-[24px] font-bold leading-none tracking-tight text-[#17233F]">
          {value}
        </p>
      </div>

      {/* Row 3: description + sparkline */}
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <p className="min-w-0 truncate text-[11px] leading-4 text-[#94A3B8]">
          {description}
          {isDemo ? <span className="ml-1 text-[10px] text-[#CBD5E1]">· demo</span> : null}
        </p>
        <Sparkline values={sparkline} color={theme.spark} />
      </div>
    </article>
  )
}
