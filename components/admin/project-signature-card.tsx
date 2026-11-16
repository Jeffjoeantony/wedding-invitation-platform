'use client'

import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { formatBirthdayPersonsDisplay } from '@/lib/birthdayPersons'
import { cn } from '@/lib/utils'

export type ProjectCardModel = {
  id: string
  name: string
  couple_1: string
  couple_2: string
  date?: string
  location?: string
  contact?: string
  event_template?: string
  status: 'active' | 'paused' | 'completed' | string
  _stats: {
    total: number
    confirmed: number
    pending: number
  }
}

const EVENT_META: Record<string, { label: string; accent: string; soft: string }> = {
  Wedding: { label: 'Wedding', accent: '#0D9F6E', soft: '#E8F8F2' },
  Engagement: { label: 'Engagement', accent: '#6D52E0', soft: '#EFEAFE' },
  Reception: { label: 'Reception', accent: '#3B7DFF', soft: '#E8F1FF' },
  Mehendi: { label: 'Mehendi', accent: '#059669', soft: '#D1FAE5' },
  Haldi: { label: 'Haldi', accent: '#D97706', soft: '#FEF3C7' },
  Birthday: { label: 'Birthday', accent: '#D94874', soft: '#FCE8EF' },
}

function eventMeta(template?: string) {
  return EVENT_META[template || ''] ?? { label: template || 'Invitation', accent: '#4D91FF', soft: '#E8F1FF' }
}

function coupleLine(project: ProjectCardModel) {
  if (project.event_template === 'Birthday') {
    return formatBirthdayPersonsDisplay(project.couple_1, project.couple_2) || 'Birthday celebration'
  }
  const a = (project.couple_1 || '').trim()
  const b = (project.couple_2 || '').trim()
  if (a && b) return `${a} & ${b}`
  return a || b || 'Client project'
}

function statusStyle(status: string) {
  if (status === 'active') {
    return { label: 'Published', className: 'bg-[#DCFCE7] text-[#166534]' }
  }
  if (status === 'paused') {
    return { label: 'Draft', className: 'bg-[#FFEDD5] text-[#9A3412]' }
  }
  if (status === 'completed') {
    return { label: 'Completed', className: 'bg-[#EEF2FF] text-[#4338CA]' }
  }
  return { label: status, className: 'bg-[#F1F5F9] text-[#475569]' }
}

function initialFrom(project: ProjectCardModel) {
  const source = coupleLine(project)
  return (source.trim()[0] || project.name.trim()[0] || 'P').toUpperCase()
}

export function CreateProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[280px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D5DCE6] bg-[#F8FAFC] px-6 py-10 text-center transition hover:border-[#94A3B8] hover:bg-[#F1F5F9]"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm">
        <Plus className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <p className="mt-1 text-[15px] font-semibold text-[#17233F]">Create new project</p>
      <p className="text-[12px] text-[#94A3B8]">Start a wedding invitation workspace</p>
    </button>
  )
}

export function ProjectSignatureCard({
  project,
  onOpen,
  onDelete,
}: {
  project: ProjectCardModel
  onOpen: () => void
  onDelete: () => void
}) {
  const meta = eventMeta(project.event_template)
  const status = statusStyle(project.status)
  const dateStr = project.date
    ? new Date(project.date + 'T00:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null
  const detailLine = [meta.label, dateStr].filter(Boolean).join(' · ')
  const guests = project._stats.total

  return (
    <article className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[#E6EAF0] bg-white shadow-[0_1px_3px_rgba(23,35,63,0.04)] transition hover:border-[#CBD5E1] hover:shadow-[0_8px_24px_rgba(23,35,63,0.06)]">
      {/* Identity */}
      <div className="flex items-start gap-3 px-5 py-4">
        <div
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
          style={{ background: meta.soft, color: meta.accent }}
        >
          {initialFrom(project)}
        </div>
        <div className="min-w-0 flex-1 border-l-2 pl-3" style={{ borderColor: meta.accent }}>
          <p className="truncate text-[14px] font-semibold text-[#17233F]">{coupleLine(project)}</p>
          <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
            {meta.label}
            {project.location ? ` · ${project.location}` : ''}
          </p>
          {project.contact ? (
            <p className="mt-0.5 truncate text-[11px] text-[#94A3B8]">{project.contact}</p>
          ) : (
            <p className="mt-0.5 truncate text-[11px] text-[#94A3B8]">Invitation project</p>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col border-t border-[#EEF2F7] px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-[16px] font-bold tracking-tight text-[#17233F]">{project.name}</p>
          </button>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', status.className)}>
              {status.label}
            </span>
            <button
              type="button"
              aria-label="Delete project"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFC] text-[#94A3B8] transition hover:bg-[#FEF2F2] hover:text-[#EF4444]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-[12px] text-[#94A3B8]">{detailLine || 'Digital invitation'}</p>
        <p className="mt-1 text-[11px] text-[#CBD5E1]">
          {project._stats.confirmed} confirmed · {project._stats.pending} pending
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-end justify-between border-t border-[#EEF2F7] px-5 py-4">
        <div>
          <p className="text-[22px] font-bold leading-none tabular-nums text-[#17233F]">{guests}</p>
          <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">
            {guests === 1 ? 'guest' : 'guests'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4D91FF] transition hover:text-[#2563EB]"
        >
          Edit
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  )
}
