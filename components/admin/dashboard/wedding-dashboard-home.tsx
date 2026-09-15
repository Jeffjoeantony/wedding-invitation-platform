'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'
import NotificationSystem from '@/components/NotificationSystem'
import { DashboardHeader } from '@/components/admin/dashboard/dashboard-header'
import { WelcomeBanner } from '@/components/admin/dashboard/welcome-banner'
import { StatCard } from '@/components/admin/dashboard/stat-card'
import { InvitationStatusCard } from '@/components/admin/dashboard/invitation-status-card'
import { RevenueAnalytics } from '@/components/admin/dashboard/revenue-analytics'
import { RecentInvitationsTable } from '@/components/admin/dashboard/recent-invitations-table'
import {
  DEMO_REVENUE_METRICS,
  DEMO_REVENUE_SERIES,
  deriveDashboardStats,
  deriveInvitationStatus,
  deriveRecentInvitations,
} from '@/lib/dashboard/derive'
import type { DashboardProject } from '@/lib/dashboard/types'

function currentMonthRange(): DateRange {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  }
}

export function WeddingDashboardHome({
  projects,
  userName,
  onRefresh,
  refreshing,
}: {
  projects: DashboardProject[]
  userName: string
  onRefresh: () => void
  refreshing?: boolean
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(currentMonthRange)

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return projects
    return projects.filter((p) => {
      const hay = [p.name, p.couple_1, p.couple_2, p.event_template, p.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(term)
    })
  }, [projects, search])

  const stats = useMemo(() => deriveDashboardStats(filteredProjects), [filteredProjects])
  const statusSlices = useMemo(
    () => deriveInvitationStatus(filteredProjects),
    [filteredProjects],
  )
  const recent = useMemo(() => deriveRecentInvitations(filteredProjects), [filteredProjects])

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        search={search}
        onSearchChange={setSearch}
        onRefresh={onRefresh}
        refreshing={refreshing}
        notifications={<NotificationSystem />}
      />

      <WelcomeBanner name={userName} />

      {/* Row 1 — five equal-width stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:items-stretch">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            growth={stat.growth}
            icon={stat.icon}
            accent={stat.accent}
            sparkline={stat.sparkline}
            isDemo={stat.isDemo}
          />
        ))}
      </div>

      {/* Row 2 — 1:2 Invitation Status | Revenue Analytics */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
        <div className="min-h-[320px] min-w-0 xl:col-span-1">
          <InvitationStatusCard
            slices={statusSlices}
            isDemo={filteredProjects.length === 0}
          />
        </div>
        <div className="min-h-[320px] min-w-0 xl:col-span-2">
          <RevenueAnalytics series={DEMO_REVENUE_SERIES} metrics={DEMO_REVENUE_METRICS} />
        </div>
      </div>

      {/* Row 3 — full-width table */}
      <RecentInvitationsTable
        rows={recent.rows}
        isDemo={recent.isDemo}
        onViewAll={() => router.push('/admin/projects')}
      />
    </div>
  )
}
