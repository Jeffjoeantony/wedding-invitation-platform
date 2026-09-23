'use client'

import { cn } from '@/lib/utils'
import type { InvitationStatusKey } from '@/lib/dashboard/types'

const STATUS_STYLES: Record<
  InvitationStatusKey,
  { label: string; className: string }
> = {
  published: {
    label: 'Published',
    className: 'bg-[#DCFCE7] text-[#15803D] ring-[#86EFAC]',
  },
  in_review: {
    label: 'In Review',
    className: 'bg-[#FEF3C7] text-[#B45309] ring-[#FCD34D]',
  },
  draft: {
    label: 'Draft',
    className: 'bg-[#F1F5F9] text-[#475569] ring-[#E2E8F0]',
  },
  expired: {
    label: 'Expired',
    className: 'bg-[#FCE7F3] text-[#BE185D] ring-[#F9A8D4]',
  },
}

export function StatusBadge({ status }: { status: InvitationStatusKey }) {
  const cfg = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  )
}
