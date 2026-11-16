'use client'

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarHeart,
  ClipboardList,
  FolderKanban,
  Heart,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Palette,
  Receipt,
  Settings,
  UserRound,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardNavItem = {
  id: string
  label: string
  href?: string
  icon: LucideIcon
  badge?: number
  comingSoon?: boolean
}

export const DASHBOARD_NAV: {
  section?: string
  items: DashboardNavItem[]
}[] = [
  {
    items: [{ id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    section: 'Manage',
    items: [
      { id: 'clients', label: 'Clients', href: '/admin/projects', icon: Users },
      { id: 'guests', label: 'Guests', href: '/admin/guests', icon: UserRound },
      { id: 'invitations', label: 'Invitations', href: '/admin/projects', icon: Heart },
      { id: 'events', label: 'Events', href: '/admin/events', icon: CalendarHeart },
      { id: 'templates', label: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
      { id: 'media', label: 'Media Library', icon: ImageIcon, comingSoon: true },
      { id: 'orders', label: 'Orders & Payments', icon: Receipt, comingSoon: true },
      { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { id: 'customization', label: 'Customization', href: '/admin/templates', icon: Palette },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 12, comingSoon: true },
      { id: 'tasks', label: 'Tasks', icon: ClipboardList, comingSoon: true },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
      { id: 'reports', label: 'Reports', href: '/admin/analytics', icon: FolderKanban },
      { id: 'help', label: 'Help & Support', icon: HelpCircle, comingSoon: true },
    ],
  },
]

export function VowStudioMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#17233F] text-white shadow-sm',
        className,
      )}
      aria-hidden
    >
      <Heart className="h-4.5 w-4.5 h-[18px] w-[18px] fill-white" strokeWidth={0} />
    </span>
  )
}

export function ProfileCard({
  name,
  role,
  onLogout,
}: {
  name: string
  role: string
  onLogout: () => void
}) {
  const initial = (name.trim()[0] || 'A').toUpperCase()
  return (
    <div className="border-t border-[#EEF2F7] pt-4">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17233F] text-sm font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#17233F]">{name}</p>
          <p className="truncate text-[11px] text-[#94A3B8]">{role}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#64748B] transition hover:bg-[#FEF2F2] hover:text-[#DC2626]"
      >
        Sign out
      </button>
    </div>
  )
}
