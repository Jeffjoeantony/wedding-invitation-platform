import type { LucideIcon } from 'lucide-react'

export type StatAccent = 'teal' | 'pink' | 'blue' | 'purple' | 'amber'

export type InvitationStatusKey = 'draft' | 'in_review' | 'published' | 'expired'

export type DashboardProject = {
  id: string
  name: string
  couple_1: string
  couple_2: string
  date?: string
  event_template?: string
  status: 'active' | 'paused' | 'completed' | string
  created_at: string
  _stats: {
    total: number
    confirmed: number
    declined: number
    pending: number
    totalPax: number
  }
}

export type DashboardStat = {
  id: string
  title: string
  value: string
  description: string
  growth: string
  accent: StatAccent
  icon: LucideIcon
  sparkline: number[]
  /** When true, value is demo / illustrative */
  isDemo?: boolean
}

export type InvitationStatusSlice = {
  key: InvitationStatusKey
  label: string
  count: number
  color: string
}

export type RevenuePoint = {
  month: string
  revenue: number
}

export type RevenueMetric = {
  label: string
  value: string
  highlight?: boolean
}

export type RecentInvitationRow = {
  id: string
  couple: string
  client: string
  eventDate: string
  template: string
  status: InvitationStatusKey
  lastUpdated: string
  href: string
}
