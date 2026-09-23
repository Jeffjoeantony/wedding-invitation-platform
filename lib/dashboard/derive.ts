import {
  Calendar,
  Clock,
  Heart,
  IndianRupee,
  Users,
} from 'lucide-react'
import type {
  DashboardProject,
  DashboardStat,
  InvitationStatusKey,
  InvitationStatusSlice,
  RecentInvitationRow,
  RevenueMetric,
  RevenuePoint,
} from '@/lib/dashboard/types'

/** Demo revenue — no payments API in this project yet. */
export const DEMO_REVENUE_SERIES: RevenuePoint[] = [
  { month: 'Jan', revenue: 420_000 },
  { month: 'Feb', revenue: 510_000 },
  { month: 'Mar', revenue: 480_000 },
  { month: 'Apr', revenue: 620_000 },
  { month: 'May', revenue: 710_000 },
  { month: 'Jun', revenue: 680_000 },
  { month: 'Jul', revenue: 790_000 },
  { month: 'Aug', revenue: 860_000 },
  { month: 'Sep', revenue: 1_254_100 },
  { month: 'Oct', revenue: 940_000 },
  { month: 'Nov', revenue: 1_020_000 },
  { month: 'Dec', revenue: 1_180_000 },
]

export const DEMO_REVENUE_METRICS: RevenueMetric[] = [
  { label: 'This Month', value: '₹1,24,800' },
  { label: 'Weekly', value: '₹3,28,500' },
  { label: 'Monthly', value: '₹14,76,200' },
  { label: 'Avg. Order Value', value: '₹850' },
  { label: 'Total Revenue', value: '₹8,42,000', highlight: true },
]

const DEMO_RECENT: RecentInvitationRow[] = [
  {
    id: 'demo-1',
    couple: 'Aarav & Nithya',
    client: 'Priya Sharma',
    eventDate: 'Sep 14, 2025',
    template: 'Serene Minimal',
    status: 'published',
    lastUpdated: '2 hours ago',
    href: '/admin/projects',
  },
  {
    id: 'demo-2',
    couple: 'Daniel & Maria',
    client: 'Daniel Varghese',
    eventDate: 'Sep 21, 2025',
    template: 'Classic Elegance',
    status: 'in_review',
    lastUpdated: '5 hours ago',
    href: '/admin/projects',
  },
  {
    id: 'demo-3',
    couple: 'Rohan & Meera',
    client: 'Rohan Pillai',
    eventDate: 'Oct 05, 2025',
    template: 'Modern Bliss',
    status: 'draft',
    lastUpdated: '1 day ago',
    href: '/admin/projects',
  },
  {
    id: 'demo-4',
    couple: 'Kevin & Alisha',
    client: 'Kevin Mathew',
    eventDate: 'Oct 12, 2025',
    template: 'Royal Contemporary',
    status: 'draft',
    lastUpdated: '1 day ago',
    href: '/admin/projects',
  },
  {
    id: 'demo-5',
    couple: 'Jithin & Stella',
    client: 'Jithin George',
    eventDate: 'Oct 26, 2025',
    template: 'Botanical Grace',
    status: 'published',
    lastUpdated: '2 days ago',
    href: '/admin/projects',
  },
]

function formatCouple(p: DashboardProject) {
  const a = (p.couple_1 || '').trim()
  const b = (p.couple_2 || '').trim()
  if (a && b) return `${a} & ${b}`
  return a || b || p.name
}

function mapProjectStatus(status: string): InvitationStatusKey {
  if (status === 'active') return 'published'
  if (status === 'paused') return 'in_review'
  if (status === 'completed') return 'expired'
  return 'draft'
}

function relativeTime(iso: string) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const diff = Date.now() - t
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatEventDate(date?: string) {
  if (!date) return 'TBD'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function deriveInvitationStatus(projects: DashboardProject[]): InvitationStatusSlice[] {
  const counts: Record<InvitationStatusKey, number> = {
    draft: 0,
    in_review: 0,
    published: 0,
    expired: 0,
  }
  for (const p of projects) {
    counts[mapProjectStatus(p.status)] += 1
  }
  // If empty workspace, show reference proportions as demo
  if (projects.length === 0) {
    return [
      { key: 'draft', label: 'Draft', count: 56, color: '#94A3B8' },
      { key: 'in_review', label: 'In Review', count: 42, color: '#F4AD32' },
      { key: 'published', label: 'Published', count: 128, color: '#22C58B' },
      { key: 'expired', label: 'Expired', count: 22, color: '#E86B91' },
    ]
  }
  return [
    { key: 'draft', label: 'Draft', count: counts.draft, color: '#94A3B8' },
    { key: 'in_review', label: 'In Review', count: counts.in_review, color: '#F4AD32' },
    { key: 'published', label: 'Published', count: counts.published, color: '#22C58B' },
    { key: 'expired', label: 'Expired', count: counts.expired, color: '#E86B91' },
  ]
}

export function deriveDashboardStats(projects: DashboardProject[]): DashboardStat[] {
  const totalProjects = projects.length
  const active = projects.filter((p) => p.status === 'active').length
  const totalGuests = projects.reduce((s, p) => s + (p._stats?.total ?? 0), 0)
  const pending = projects.reduce((s, p) => s + (p._stats?.pending ?? 0), 0)
  const now = Date.now()
  const upcoming = projects.filter((p) => {
    if (!p.date) return false
    const t = new Date(`${p.date}T00:00:00`).getTime()
    return t >= now && t <= now + 30 * 86_400_000
  }).length

  const useDemo = totalProjects === 0

  return [
    {
      id: 'clients',
      title: 'Total Clients',
      value: useDemo ? '96' : String(totalProjects),
      description: useDemo ? '+12 this month' : `${active} active`,
      growth: useDemo ? '12%' : active > 0 ? `${Math.round((active / Math.max(totalProjects, 1)) * 100)}%` : '0%',
      accent: 'teal',
      icon: Users,
      sparkline: [12, 18, 15, 22, 28, 26, 34, 40],
      isDemo: useDemo,
    },
    {
      id: 'invitations',
      title: 'Active Invitations',
      value: useDemo ? '248' : String(active || totalProjects),
      description: useDemo ? '+28 this month' : `${totalGuests} guests invited`,
      growth: useDemo ? '18.4%' : '—',
      accent: 'pink',
      icon: Heart,
      sparkline: [20, 24, 22, 30, 36, 42, 48, 55],
      isDemo: useDemo,
    },
    {
      id: 'events',
      title: 'Upcoming Events',
      value: useDemo ? '32' : String(upcoming),
      description: 'in next 30 days',
      growth: useDemo ? '7%' : '—',
      accent: 'blue',
      icon: Calendar,
      sparkline: [8, 10, 9, 12, 14, 13, 16, 18],
      isDemo: useDemo,
    },
    {
      id: 'revenue',
      title: 'Revenue This Month',
      value: '₹1,24,800',
      description: 'vs last month',
      growth: '28%',
      accent: 'purple',
      icon: IndianRupee,
      sparkline: [30, 34, 32, 40, 48, 52, 60, 72],
      isDemo: true,
    },
    {
      id: 'approvals',
      title: 'Pending Approvals',
      value: useDemo ? '14' : String(pending),
      description: 'needs attention',
      growth: useDemo ? '-27%' : '—',
      accent: 'amber',
      icon: Clock,
      sparkline: [18, 16, 20, 22, 19, 24, 28, 30],
      isDemo: useDemo,
    },
  ]
}

export function deriveRecentInvitations(projects: DashboardProject[]): {
  rows: RecentInvitationRow[]
  isDemo: boolean
} {
  if (projects.length === 0) {
    return { rows: DEMO_RECENT, isDemo: true }
  }
  const rows = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      couple: formatCouple(p),
      client: p.name,
      eventDate: formatEventDate(p.date),
      template: p.event_template?.trim() || 'Wedding',
      status: mapProjectStatus(p.status),
      lastUpdated: relativeTime(p.created_at),
      href: `/admin/projects/${p.id}`,
    }))
  return { rows, isDemo: false }
}
