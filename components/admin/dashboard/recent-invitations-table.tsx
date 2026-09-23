'use client'

import { Eye, MoreHorizontal, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StatusBadge } from '@/components/admin/dashboard/status-badge'
import type { RecentInvitationRow } from '@/lib/dashboard/types'

export function RecentInvitationsTable({
  rows,
  isDemo,
  onViewAll,
}: {
  rows: RecentInvitationRow[]
  isDemo?: boolean
  onViewAll: () => void
}) {
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E6EAF0] bg-white shadow-[0_1px_3px_rgba(23,35,63,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[15px] font-semibold text-[#17233F]">Recent Invitations</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#15803D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            Live
          </span>
          {isDemo ? (
            <span className="text-[10px] font-medium text-[#94A3B8]">demo rows</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-[#4D91FF] transition hover:text-[#2563EB]"
        >
          View all →
        </button>
      </div>

      <div className="admin-table-scroll overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Couple</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Event Date</th>
              <th className="px-4 py-3 font-semibold">Template</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last Updated</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-t border-[#F1F5F9] hover:bg-[#FAFBFC]">
                <td className="px-4 py-3.5 tabular-nums text-[#94A3B8]">{index + 1}</td>
                <td className="px-4 py-3.5 font-semibold text-[#17233F]">{row.couple}</td>
                <td className="px-4 py-3.5 text-[#64748B]">{row.client}</td>
                <td className="px-4 py-3.5 text-[#64748B]">{row.eventDate}</td>
                <td className="px-4 py-3.5 text-[#64748B]">{row.template}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3.5 text-[#94A3B8]">{row.lastUpdated}</td>
                <td className="px-4 py-3.5">
                  <div className="relative flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="View invitation"
                      onClick={() => router.push(row.href)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#17233F]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit invitation"
                      onClick={() => router.push(row.href)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#17233F]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="More actions"
                      onClick={() => setOpenMenu((id) => (id === row.id ? null : row.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#17233F]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenu === row.id ? (
                      <div className="absolute right-0 top-9 z-20 min-w-[140px] rounded-xl border border-[#E6EAF0] bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-[#334155] hover:bg-[#F8FAFC]"
                          onClick={() => {
                            setOpenMenu(null)
                            router.push(row.href)
                          }}
                        >
                          Open project
                        </button>
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-[#334155] hover:bg-[#F8FAFC]"
                          onClick={() => {
                            setOpenMenu(null)
                            onViewAll()
                          }}
                        >
                          View all projects
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
