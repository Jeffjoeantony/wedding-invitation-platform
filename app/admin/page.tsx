'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NotificationSystem from '@/components/NotificationSystem'
import { addNotification, playNotificationSound } from '@/lib/notifications'
import { formatBirthdayPersonsDisplay, serializeAdditionalBirthdayPersons } from '@/lib/birthdayPersons'

interface ProjectStats {
  total: number
  confirmed: number
  declined: number
  pending: number
  totalPax: number
}

interface Project {
  id: string
  name: string
  couple_1: string
  couple_2: string
  date?: string
  time?: string
  venue?: string
  location?: string
  contact?: string
  maps_url?: string
  event_template?: string
  status: 'active' | 'paused' | 'completed'
  created_at: string
  _stats: ProjectStats
}

// ── Event type config ─────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: 'Wedding',        label: 'Wedding',        emoji: '💍', color: '#D72660', bg: '#F4E7EC' },
  { value: 'Engagement',     label: 'Engagement',     emoji: '💑', color: '#7C3AED', bg: '#EDE9FE' },
  { value: 'Reception',      label: 'Reception',      emoji: '🥂', color: '#0891B2', bg: '#E0F7FA' },
  { value: 'Mehendi',        label: 'Mehendi',        emoji: '🌿', color: '#059669', bg: '#D1FAE5' },
  { value: 'Haldi',          label: 'Haldi',          emoji: '🌼', color: '#D97706', bg: '#FEF3C7' },
  { value: 'Save The Date',  label: 'Save The Date',  emoji: '📅', color: '#DB2777', bg: '#FCE7F3' },
  { value: 'Birthday',       label: 'Birthday',       emoji: '🎂', color: '#EA580C', bg: '#FEE2E2' },
  { value: 'Housewarming',   label: 'Housewarming',   emoji: '🏡', color: '#0D9488', bg: '#CCFBF1' },
  { value: 'Corporate Event',label: 'Corporate Event',emoji: '🏢', color: '#1D4ED8', bg: '#DBEAFE' },
  { value: 'Custom Event',   label: 'Custom Event',   emoji: '✨', color: '#6B7280', bg: '#F3F4F6' },
]

function getEventType(value?: string) {
  return EVENT_TYPES.find((e) => e.value === value) ?? EVENT_TYPES[0]
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><path d="M2 20h20" />
    </svg>
  ),
  Templates: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  List: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Dots: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  ),
  Heart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  TrendUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Folder: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    active:    { label: 'Active',    dot: '#16A34A', bg: '#DCFCE7', color: '#15803D' },
    paused:    { label: 'Paused',    dot: '#F59E0B', bg: '#FEF3C7', color: '#B45309' },
    completed: { label: 'Completed', dot: '#6366F1', bg: '#EEF2FF', color: '#4338CA' },
  }[status] ?? { label: status, dot: '#6B7280', bg: '#F3F4F6', color: '#374151' }

  return (
    <span
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.dot}40` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen, onToggleStatus, onDelete }: {
  project: Project
  onOpen: () => void
  onToggleStatus: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const eventType = getEventType(project.event_template)

  const dateStr = project.date
    ? new Date(project.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const confirmedPct = project._stats.total > 0
    ? Math.round((project._stats.confirmed / project._stats.total) * 100) : 0
  const declinedPct = project._stats.total > 0
    ? Math.round((project._stats.declined / project._stats.total) * 100) : 0
  const pendingPct = project._stats.total > 0
    ? Math.round((project._stats.pending / project._stats.total) * 100) : 0

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: hovered ? '1.5px solid #D72660' : '1.5px solid #E5E7EB',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.22s ease',
        boxShadow: hovered
          ? '0 8px 32px rgba(215,38,96,0.10), 0 2px 8px rgba(31,41,55,0.06)'
          : '0 1px 4px rgba(31,41,55,0.06), 0 0 0 0 transparent',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!menuOpen) onOpen() }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Event icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: eventType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {eventType.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: '#1F2937', fontWeight: 700, fontSize: '15px', margin: 0 }} className="truncate">{project.name}</p>
            {(project.couple_1 || project.couple_2) && (
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: 2 }} className="truncate">
                {project.event_template === 'Birthday'
                  ? formatBirthdayPersonsDisplay(project.couple_1, project.couple_2)
                  : `${project.couple_1}${project.couple_1 && project.couple_2 ? ' & ' : ''}${project.couple_2}`}
              </p>
            )}
          </div>
        </div>

        {/* Context menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              color: '#9CA3AF', background: menuOpen ? '#F3F4F6' : 'transparent',
              border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#6B7280' }}
            onMouseLeave={(e) => { if (!menuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF' } }}
          >
            <Icon.Dots />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '4px',
              background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
              padding: '6px', minWidth: '170px', zIndex: 50,
              boxShadow: '0 10px 40px rgba(31,41,55,0.12), 0 2px 8px rgba(31,41,55,0.06)',
            }}>
              <button className="ctx-item" onClick={() => { setMenuOpen(false); onOpen() }}>Open project</button>
              <button className="ctx-item" onClick={() => { setMenuOpen(false); onToggleStatus() }}>
                {project.status === 'paused' ? 'Mark as active' : 'Pause project'}
              </button>
              <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
              <button className="ctx-item ctx-danger" onClick={() => { setMenuOpen(false); onDelete() }}>Delete project</button>
            </div>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span style={{
          background: eventType.bg, color: eventType.color,
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
          letterSpacing: '0.03em',
        }}>
          {eventType.label}
        </span>
        {dateStr && (
          <span style={{ color: '#6B7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.Calendar /> {dateStr}
          </span>
        )}
        {project.location && (
          <span style={{ color: '#6B7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }} className="truncate max-w-[140px]">
            <Icon.MapPin /> {project.location}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: '#9CA3AF', fontSize: 11 }}>
            {project._stats.total > 0 ? `${project._stats.total} guests invited` : 'No guests yet'}
          </span>
          {project._stats.total > 0 && (
            <span style={{ color: '#16A34A', fontSize: 11, fontWeight: 600 }}>{confirmedPct}% confirmed</span>
          )}
        </div>
        <div style={{ height: 5, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
          {project._stats.confirmed > 0 && (
            <div style={{ width: `${confirmedPct}%`, background: '#16A34A', borderRadius: '999px 0 0 999px', transition: 'width 0.5s ease' }} />
          )}
          {project._stats.declined > 0 && (
            <div style={{ width: `${declinedPct}%`, background: '#EF4444' }} />
          )}
          {project._stats.pending > 0 && (
            <div style={{ width: `${pendingPct}%`, background: '#F59E0B', borderRadius: '0 999px 999px 0' }} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <StatusBadge status={project.status} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
          {project._stats.total > 0 && (
            <>
              <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon.CheckCircle /> {project._stats.confirmed}
              </span>
              <span style={{ color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon.Clock /> {project._stats.pending}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, trend }: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: string
  trend?: string
}) {
  return (
    <div
      className="dashboard-stat-card"
      style={{
      background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 16,
      padding: '18px 16px',
      boxShadow: '0 1px 4px rgba(31,41,55,0.06)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      minWidth: 0,
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(31,41,55,0.09)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(31,41,55,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: accent + '18', color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#16A34A', fontSize: 11, fontWeight: 600,
            background: '#DCFCE7', padding: '3px 8px', borderRadius: 999,
          }}>
            <Icon.TrendUp /> {trend}
          </span>
        )}
      </div>
      <p style={{ color: '#1F2937', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
      <p style={{ color: '#6B7280', fontSize: 13, marginTop: 6, marginBottom: 0 }}>{label}</p>
    </div>
  )
}

// ── New Project Modal ─────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (p: Project) => void
}) {
  const [form, setForm] = useState({
    name: '', couple_1: '', couple_2: '', event_template: 'Wedding',
    date: '', venue: '', location: '', contact: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const selectedType = getEventType(form.event_template)

  const today = new Date().toISOString().split('T')[0]
  const isWeddingLike = ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Haldi', 'Save The Date'].includes(form.event_template)
  const isBirthday = form.event_template === 'Birthday'

  // Additional birthday persons (stored serialised into couple_2)
  const [additionalBirthdayPersons, setAdditionalBirthdayPersons] = useState<string[]>([])

  // Validates that a text value is not purely numeric (must contain at least one letter)
  const isTextOnlyValid = (val: string) => val === '' || /[a-zA-Z]/.test(val)

  const validateField = (key: string, value: string): string => {
    const textFields: Record<string, string> = {
      name: 'Project name',
      couple_1: isWeddingLike ? 'Partner 1' : 'Organizer',
      couple_2: isWeddingLike ? 'Partner 2' : 'Co-host',
      venue: 'Venue',
      location: 'City / Location',
    }
    if (textFields[key]) {
      if (value.trim() && !isTextOnlyValid(value.trim())) {
        return `${textFields[key]} must contain letters, not numbers only`
      }
    }
    if (key === 'contact') {
      if (value && !/^\d+$/.test(value)) return 'Contact must contain digits only'
      if (value && value.length > 10) return 'Contact number must be at most 10 digits'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Run all field validations on submit
    const newFieldErrors: Record<string, string> = {}
    // For birthday, couple_1 = primary person, couple_2 is managed separately
    const textKeys = isBirthday
      ? ['name', 'venue', 'location']
      : ['name', 'couple_1', 'couple_2', 'venue', 'location']
    for (const key of textKeys) {
      const msg = validateField(key, (form as any)[key])
      if (msg) newFieldErrors[key] = msg
    }
    // Validate birthday primary person name if filled
    if (isBirthday && form.couple_1.trim() && !isTextOnlyValid(form.couple_1.trim())) {
      newFieldErrors['couple_1'] = 'Birthday person name must contain letters, not numbers only'
    }
    const contactMsg = validateField('contact', form.contact)
    if (contactMsg) newFieldErrors['contact'] = contactMsg
    if (form.contact && form.contact.length < 10) newFieldErrors['contact'] = 'Contact number must be exactly 10 digits'

    if (!form.name.trim()) {
      newFieldErrors['name'] = 'Project name is required'
    }

    setFieldErrors(newFieldErrors)
    if (Object.keys(newFieldErrors).length > 0) {
      setErr('Please fix the errors above before creating the project.')
      return
    }

    if (form.date && form.date < today) { setErr('Event date cannot be in the past.'); return }
    setSaving(true)
    setErr('')
    // For birthday, serialise additional persons into couple_2
    const payload = isBirthday
      ? { ...form, couple_2: serializeAdditionalBirthdayPersons(additionalBirthdayPersons) }
      : form
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      onCreate(data)
      onClose()
    } else {
      const d = await res.json().catch(() => ({}))
      setErr(d.error || 'Failed to create project. Please try again.')
    }
    setSaving(false)
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, [k]: val }))
    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [k]: '' }))
    setErr('')
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(31,41,55,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 540,
        boxShadow: '0 24px 64px rgba(31,41,55,0.18), 0 4px 16px rgba(31,41,55,0.08)',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        {/* Modal header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: selectedType.bg, fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedType.emoji}
            </div>
            <div>
              <h2 style={{ color: '#1F2937', fontWeight: 700, fontSize: 18, margin: 0 }}>Create new project</h2>
              <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2, marginBottom: 0 }}>Set up your digital invitation project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, marginTop: -2 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF' }}
          >
            <Icon.X />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Event type */}
            <div>
              <label className="modal-label">Event type</label>
              <div className="modal-select-wrap">
                <select value={form.event_template} onChange={f('event_template')} className="modal-input">
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                  ))}
                </select>
                <span className="modal-select-chevron"><Icon.ChevronDown /></span>
              </div>
            </div>

            {/* Project name */}
            <div>
              <label className="modal-label">Project name <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                value={form.name}
                onChange={(e) => {
                  f('name')(e)
                  const msg = validateField('name', e.target.value)
                  setFieldErrors((prev) => ({ ...prev, name: msg }))
                }}
                required
                placeholder={isWeddingLike ? 'e.g. Priya & Arjun Wedding' : 'e.g. Annual Tech Summit 2025'}
                className="modal-input"
                style={fieldErrors.name ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              />
              {fieldErrors.name && (
                <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.name}</p>
              )}
            </div>

            {/* Person names — Birthday vs Wedding/other */}
            {isBirthday ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label className="modal-label">🎂 Birthday Person</label>
                <input
                  value={form.couple_1}
                  onChange={(e) => {
                    f('couple_1')(e)
                    const msg = isTextOnlyValid(e.target.value.trim()) ? '' : 'Name must contain letters, not numbers only'
                    setFieldErrors((prev) => ({ ...prev, couple_1: e.target.value.trim() ? msg : '' }))
                  }}
                  placeholder="Name of the birthday person"
                  className="modal-input"
                  style={fieldErrors.couple_1 ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                />
                {fieldErrors.couple_1 && (
                  <p style={{ color: '#EF4444', fontSize: 11, marginTop: -4, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.couple_1}</p>
                )}

                {/* Additional birthday persons */}
                {additionalBirthdayPersons.map((name, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>&</span>
                    <input
                      value={name}
                      onChange={(e) => {
                        const next = [...additionalBirthdayPersons]
                        next[index] = e.target.value
                        setAdditionalBirthdayPersons(next)
                      }}
                      placeholder="Person name"
                      className="modal-input"
                      style={{ flex: 1, margin: 0 }}
                    />
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => setAdditionalBirthdayPersons(additionalBirthdayPersons.filter((_, i) => i !== index))}
                      style={{
                        flexShrink: 0, width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 10, border: '1px solid #FECACA',
                        background: 'transparent', color: '#F87171',
                        cursor: 'pointer', fontSize: 14, transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#F87171' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setAdditionalBirthdayPersons((prev) => [...prev, ''])}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    border: '1.5px dashed #C4B5FD',
                    background: 'transparent', color: '#7C3AED',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.borderColor = '#7C3AED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#C4B5FD' }}
                >
                  + More
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="modal-label">{isWeddingLike ? 'Partner 1' : 'Organizer'}</label>
                  <input
                    value={form.couple_1}
                    onChange={(e) => {
                      f('couple_1')(e)
                      const msg = validateField('couple_1', e.target.value)
                      setFieldErrors((prev) => ({ ...prev, couple_1: msg }))
                    }}
                    placeholder="Name"
                    className="modal-input"
                    style={fieldErrors.couple_1 ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                  />
                  {fieldErrors.couple_1 && (
                    <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.couple_1}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">{isWeddingLike ? 'Partner 2' : 'Co-host'}</label>
                  <input
                    value={form.couple_2}
                    onChange={(e) => {
                      f('couple_2')(e)
                      const msg = validateField('couple_2', e.target.value)
                      setFieldErrors((prev) => ({ ...prev, couple_2: msg }))
                    }}
                    placeholder="Name"
                    className="modal-input"
                    style={fieldErrors.couple_2 ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                  />
                  {fieldErrors.couple_2 && (
                    <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.couple_2}</p>
                  )}
                </div>
              </div>
            )}

            {/* Date & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="modal-label">Event date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && val < today) {
                      setErr('Event date cannot be in the past.')
                    } else {
                      setErr('')
                    }
                    setForm((prev) => ({ ...prev, date: val }))
                  }}
                  min={today}
                  className="modal-input"
                  style={form.date && form.date < today ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                />
                {form.date && form.date < today && (
                  <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ⚠ Date must be today or in the future
                  </p>
                )}
              </div>
              <div>
                <label className="modal-label">City / Location</label>
                <input
                  value={form.location}
                  onChange={(e) => {
                    f('location')(e)
                    const msg = validateField('location', e.target.value)
                    setFieldErrors((prev) => ({ ...prev, location: msg }))
                  }}
                  placeholder="Chennai"
                  className="modal-input"
                  style={fieldErrors.location ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                />
                {fieldErrors.location && (
                  <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.location}</p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="modal-label">Venue</label>
              <input
                value={form.venue}
                onChange={(e) => {
                  f('venue')(e)
                  const msg = validateField('venue', e.target.value)
                  setFieldErrors((prev) => ({ ...prev, venue: msg }))
                }}
                placeholder="Grand Ballroom, Hotel..."
                className="modal-input"
                style={fieldErrors.venue ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              />
              {fieldErrors.venue && (
                <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.venue}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="modal-label">Contact number</label>
              <input
                value={form.contact}
                inputMode="numeric"
                maxLength={10}
                onChange={(e) => {
                  // Allow only digits, max 10
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setForm((prev) => ({ ...prev, contact: digits }))
                  setFieldErrors((prev) => ({ ...prev, contact: '' }))
                  setErr('')
                }}
                placeholder="10-digit number"
                className="modal-input"
                style={fieldErrors.contact ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {fieldErrors.contact
                  ? <p style={{ color: '#EF4444', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {fieldErrors.contact}</p>
                  : <span />}
                <p style={{ color: form.contact.length === 10 ? '#16A34A' : '#9CA3AF', fontSize: 11, textAlign: 'right' }}>
                  {form.contact.length}/10
                </p>
              </div>
            </div>

            {err && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
                padding: '10px 14px', color: '#B91C1C', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ⚠ {err}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button" onClick={onClose}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="modal-btn-primary"
                style={{ opacity: saving ? 0.75 : 1 }}
              >
                {saving ? 'Creating…' : 'Create project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Dashboard Stats View ──────────────────────────────────────────────────────
function DashboardView({ projects }: { projects: Project[] }) {
  const totalGuests = projects.reduce((s, p) => s + p._stats.total, 0)
  const totalConfirmed = projects.reduce((s, p) => s + p._stats.confirmed, 0)
  const totalPending = projects.reduce((s, p) => s + p._stats.pending, 0)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const recent = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div>
      {/* Welcome */}
      <div
        className="dashboard-hero"
        style={{
        background: 'linear-gradient(135deg, #D72660 0%, #9B1C4C 100%)',
        borderRadius: 20, padding: '22px 20px', marginBottom: 22,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: 60, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 6px', fontWeight: 500 }}>{dateLabel}</p>
        <h2 className="dashboard-hero-title" style={{ color: '#FFFFFF', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
          {greeting} ✦
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0, lineHeight: 1.45 }}>
          You have {projects.filter(p => p.status === 'active').length} active project{projects.filter(p => p.status === 'active').length !== 1 ? 's' : ''} running.
        </p>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats">
        <StatCard
          label="Total Projects"
          value={projects.length}
          icon={<Icon.Folder />}
          accent="#D72660"
        />
        <StatCard
          label="Total Guests"
          value={totalGuests.toLocaleString()}
          icon={<Icon.Users />}
          accent="#7C3AED"
        />
        <StatCard
          label="Confirmed RSVPs"
          value={totalConfirmed.toLocaleString()}
          icon={<Icon.CheckCircle />}
          accent="#16A34A"
        />
        <StatCard
          label="Pending RSVPs"
          value={totalPending.toLocaleString()}
          icon={<Icon.Clock />}
          accent="#F59E0B"
        />
      </div>

      {/* Recent Projects */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(31,41,55,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ color: '#1F2937', fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Projects</h3>
          <span style={{ color: '#6B7280', fontSize: 13 }}>{projects.length} total</span>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No projects yet. Create your first one!
          </div>
        ) : (
          <div>
            {recent.map((p, i) => {
              const et = getEventType(p.event_template)
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 24px',
                    borderBottom: i < recent.length - 1 ? '1px solid #F9FAFB' : 'none',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'background 0.15s', cursor: 'default',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: et.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {et.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1F2937', fontWeight: 600, fontSize: 14, margin: 0 }} className="truncate">{p.name}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 12, margin: '2px 0 0' }}>
                      {et.label} · {p._stats.total} guests
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                  <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 700, minWidth: 40, textAlign: 'right' }}>
                    {p._stats.confirmed} ✓
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(31,41,55,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="skeleton-pulse" style={{ width: 40, height: 40, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-pulse" style={{ height: 15, width: '65%', borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton-pulse" style={{ height: 12, width: '40%', borderRadius: 6 }} />
        </div>
      </div>
      <div className="skeleton-pulse" style={{ height: 5, borderRadius: 999, marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton-pulse" style={{ height: 22, width: 72, borderRadius: 999 }} />
        <div className="skeleton-pulse" style={{ height: 22, width: 90, borderRadius: 6 }} />
      </div>
    </div>
  )
}

// ── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ onLogout }: { onLogout: () => void }) {
  const supabase = createClient()
  const [section, setSection] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'danger'>('profile')
  const [userEmail, setUserEmail] = useState('')
  const [displayName, setDisplayName] = useState('Admin')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Password change state
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  // Notification toggles
  const [notifs, setNotifs] = useState({
    rsvpEmail: true,
    rsvpSummary: false,
    marketingEmails: false,
    projectActivity: true,
  })

  // Appearance
  const [compactMode, setCompactMode] = useState(false)

  // Load user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? '')
        setDisplayName(data.user.user_metadata?.full_name || 'Admin')
      }
    })
    // Load prefs from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('goldleaf_settings') || localStorage.getItem('inviteos_settings') || '{}')
      if (saved.notifs) setNotifs((prev) => ({ ...prev, ...saved.notifs }))
      if (saved.compactMode !== undefined) setCompactMode(saved.compactMode)
    } catch { /* ignore */ }
  }, [])

  const savePrefs = (newNotifs = notifs, newCompact = compactMode) => {
    localStorage.setItem('goldleaf_settings', JSON.stringify({ notifs: newNotifs, compactMode: newCompact }))
  }

  const toggleNotif = (key: keyof typeof notifs) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    savePrefs(updated)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } })
    setMsg(error
      ? { text: 'Failed to update profile.', type: 'error' }
      : { text: 'Profile updated successfully.', type: 'success' }
    )
    setSaving(false)
    setTimeout(() => setMsg(null), 3000)
  }

  const handleChangePassword = async () => {
    if (!pwNew || pwNew !== pwConfirm) {
      setMsg({ text: 'New passwords do not match.', type: 'error' }); return
    }
    if (pwNew.length < 8) {
      setMsg({ text: 'Password must be at least 8 characters.', type: 'error' }); return
    }
    setPwSaving(true)
    setMsg(null)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    if (error) {
      setMsg({ text: error.message || 'Failed to change password.', type: 'error' })
    } else {
      setMsg({ text: 'Password changed successfully. You may need to log in again.', type: 'success' })
      setPwNew(''); setPwConfirm('')
    }
    setPwSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  const sidebarItems = [
    { id: 'profile',       label: 'Profile & Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications',     icon: '🔔' },
    { id: 'security',      label: 'Security',           icon: '🔒' },
    { id: 'appearance',    label: 'Appearance',         icon: '🎨' },
    { id: 'danger',        label: 'Danger Zone',        icon: '⚠️' },
  ] as const

  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: on ? '#D72660' : '#E5E7EB',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </button>
  )

  const SectionCard = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 16,
      padding: '24px 28px', marginBottom: 16,
      boxShadow: '0 1px 4px rgba(31,41,55,0.05)',
    }}>
      {(title || desc) && (
        <div style={{ marginBottom: 20 }}>
          {title && <h3 style={{ color: '#1F2937', fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>}
          {desc && <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>{desc}</p>}
        </div>
      )}
      {children}
    </div>
  )

  const FieldRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#1F2937', fontSize: 14, fontWeight: 500, margin: 0 }}>{label}</p>
        {desc && <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  )

  return (
    <div className="settings-layout">
      {/* ── Settings sidebar ── */}
      <div className="settings-nav" style={{
        background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 16,
        padding: 10, boxShadow: '0 1px 4px rgba(31,41,55,0.05)',
      }}>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSection(item.id); setMsg(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 12px', border: 'none', borderRadius: 10,
              background: section === item.id ? '#F4E7EC' : 'transparent',
              color: section === item.id ? '#D72660' : '#4B5563',
              fontFamily: 'inherit', fontSize: 13, fontWeight: section === item.id ? 600 : 500,
              cursor: 'pointer', textAlign: 'left', marginBottom: 2,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (section !== item.id) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#1F2937' }}}
            onMouseLeave={(e) => { if (section !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5563' }}}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Inline message */}
        {msg && (
          <div style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
            background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: msg.type === 'success' ? '#15803D' : '#B91C1C',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {msg.type === 'success' ? '✓' : '⚠'} {msg.text}
          </div>
        )}

        {/* ══ PROFILE ══════════════════════════════════ */}
        {section === 'profile' && (
          <>
            <SectionCard title="Profile" desc="Your name and email address shown in the admin panel.">
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D72660, #9B1C4C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 24, fontWeight: 700, flexShrink: 0,
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: '#1F2937', fontWeight: 600, fontSize: 16, margin: 0 }}>{displayName}</p>
                  <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>{userEmail || 'Loading…'}</p>
                  <span style={{ display: 'inline-block', marginTop: 4, background: '#F4E7EC', color: '#D72660', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>ADMIN</span>
                </div>
              </div>

              {/* Name field */}
              <div style={{ marginBottom: 16 }}>
                <label className="modal-label">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="modal-input"
                  placeholder="Your name"
                />
              </div>

              {/* Email (read-only) */}
              <div style={{ marginBottom: 20 }}>
                <label className="modal-label">Email Address</label>
                <input
                  value={userEmail}
                  readOnly
                  className="modal-input"
                  style={{ background: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed' }}
                />
                <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4 }}>Email cannot be changed here. Contact your Supabase admin.</p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  padding: '10px 20px', background: '#D72660', border: 'none',
                  borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  fontFamily: 'inherit', transition: 'background 0.15s',
                  boxShadow: '0 2px 8px rgba(215,38,96,0.25)',
                }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </SectionCard>

            <SectionCard title="Account Details">
              <FieldRow label="Account type" desc="Your current plan">
                <span style={{ background: '#F4E7EC', color: '#D72660', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>Workspace Owner</span>
              </FieldRow>
              <FieldRow label="Member since">
                <span style={{ color: '#6B7280', fontSize: 13 }}>June 2026</span>
              </FieldRow>
              <FieldRow label="Platform" desc="Goldleaf Admin Dashboard">
                <span style={{ color: '#6B7280', fontSize: 13 }}>v1.0.0</span>
              </FieldRow>
            </SectionCard>
          </>
        )}

        {/* ══ NOTIFICATIONS ════════════════════════════ */}
        {section === 'notifications' && (
          <SectionCard title="Notification Preferences" desc="Choose what updates you want to receive. Changes are saved instantly.">
            <FieldRow label="New RSVP alerts" desc="Get notified when a guest responds">
              <Toggle on={notifs.rsvpEmail} onChange={() => toggleNotif('rsvpEmail')} />
            </FieldRow>
            <FieldRow label="Daily RSVP summary" desc="Receive a daily digest of all RSVP activity">
              <Toggle on={notifs.rsvpSummary} onChange={() => toggleNotif('rsvpSummary')} />
            </FieldRow>
            <FieldRow label="Project activity" desc="Updates on project status changes">
              <Toggle on={notifs.projectActivity} onChange={() => toggleNotif('projectActivity')} />
            </FieldRow>
            <FieldRow label="Marketing emails" desc="Tips, new features, and product news">
              <Toggle on={notifs.marketingEmails} onChange={() => toggleNotif('marketingEmails')} />
            </FieldRow>
            <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 16 }}>
              ✓ Preferences saved automatically to your browser.
            </p>
          </SectionCard>
        )}

        {/* ══ SECURITY ═════════════════════════════════ */}
        {section === 'security' && (
          <>
            <SectionCard title="Change Password" desc="Use a strong password with at least 8 characters.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="modal-label">New Password</label>
                  <input
                    type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)}
                    className="modal-input" placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="modal-label">Confirm New Password</label>
                  <input
                    type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)}
                    className="modal-input" placeholder="Repeat new password"
                  />
                  {pwConfirm && pwNew !== pwConfirm && (
                    <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>⚠ Passwords do not match</p>
                  )}
                  {pwConfirm && pwNew === pwConfirm && pwNew.length >= 8 && (
                    <p style={{ color: '#16A34A', fontSize: 11, marginTop: 4 }}>✓ Passwords match</p>
                  )}
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pwNew || pwNew !== pwConfirm || pwNew.length < 8}
                  style={{
                    padding: '10px 20px', background: '#D72660', border: 'none',
                    borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: (pwSaving || !pwNew || pwNew !== pwConfirm || pwNew.length < 8) ? 'not-allowed' : 'pointer',
                    opacity: (pwSaving || !pwNew || pwNew !== pwConfirm || pwNew.length < 8) ? 0.6 : 1,
                    fontFamily: 'inherit', alignSelf: 'flex-start',
                    boxShadow: '0 2px 8px rgba(215,38,96,0.25)',
                  }}
                >
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Sessions">
              <FieldRow label="Current session" desc="Active now · This device">
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>Active</span>
              </FieldRow>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={onLogout}
                  style={{
                    padding: '10px 20px', background: '#FEF2F2', border: '1.5px solid #FECACA',
                    borderRadius: 10, color: '#B91C1C', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                >
                  Sign out of all sessions
                </button>
              </div>
            </SectionCard>
          </>
        )}

        {/* ══ APPEARANCE ═══════════════════════════════ */}
        {section === 'appearance' && (
          <SectionCard title="Display Preferences" desc="Customise how the admin panel looks and feels.">
            <FieldRow label="Compact mode" desc="Reduce spacing for a denser layout">
              <Toggle on={compactMode} onChange={() => {
                const next = !compactMode
                setCompactMode(next)
                savePrefs(notifs, next)
              }} />
            </FieldRow>
            <FieldRow label="Color theme" desc="Premium light theme">
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { color: '#D72660', label: 'Rose' },
                  { color: '#7C3AED', label: 'Violet' },
                  { color: '#2563EB', label: 'Blue' },
                  { color: '#16A34A', label: 'Green' },
                ].map((t) => (
                  <div
                    key={t.color}
                    title={t.label}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: t.color,
                      cursor: 'pointer', border: t.color === '#D72660' ? '2px solid #1F2937' : '2px solid transparent',
                      transition: 'border 0.15s',
                    }}
                  />
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Date format" desc="How dates appear across the dashboard">
              <div className="filter-select-wrap">
                <select className="filter-sel" style={{ fontSize: 12 }}>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
                <span className="filter-sel-chev"><Icon.ChevronDown /></span>
              </div>
            </FieldRow>
            <FieldRow label="Default sort" desc="How projects are sorted on load">
              <div className="filter-select-wrap">
                <select className="filter-sel" style={{ fontSize: 12 }}>
                  <option>Most recent</option>
                  <option>Name A–Z</option>
                  <option>Event date</option>
                </select>
                <span className="filter-sel-chev"><Icon.ChevronDown /></span>
              </div>
            </FieldRow>
          </SectionCard>
        )}

        {/* ══ DANGER ZONE ══════════════════════════════ */}
        {section === 'danger' && (
          <div style={{
            background: '#FFF8F8', border: '1.5px solid #FECACA',
            borderRadius: 16, padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <h3 style={{ color: '#991B1B', fontSize: 15, fontWeight: 700, margin: 0 }}>Danger Zone</h3>
            </div>
            <p style={{ color: '#B91C1C', fontSize: 13, marginBottom: 24 }}>
              These actions are irreversible. Proceed with extreme caution.
            </p>

            {[
              {
                title: 'Sign out',
                desc: 'End your current session and return to the login page.',
                label: 'Sign Out',
                action: onLogout,
                color: '#B91C1C',
              },
              {
                title: 'Export all data',
                desc: 'Download a JSON export of all your projects and guest data.',
                label: 'Export JSON',
                action: () => {
                  const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), note: 'Full data export — coming soon.' }, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'goldleaf-export.json'; a.click()
                  URL.revokeObjectURL(url)
                },
                color: '#B45309',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  padding: '18px 20px', background: '#FFFFFF', borderRadius: 12,
                  border: '1.5px solid #FECACA', marginBottom: 12,
                }}
              >
                <div>
                  <p style={{ color: '#1F2937', fontSize: 14, fontWeight: 600, margin: 0 }}>{item.title}</p>
                  <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 3 }}>{item.desc}</p>
                </div>
                <button
                  onClick={item.action}
                  style={{
                    padding: '8px 16px', background: '#FEF2F2', border: `1.5px solid #FECACA`,
                    borderRadius: 8, color: item.color, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Navigation items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: Icon.Dashboard  },
  { id: 'projects',   label: 'Projects',   Icon: Icon.Grid       },
  { id: 'guests',     label: 'Guests',     Icon: Icon.Users      },
  { id: 'analytics',  label: 'Analytics',  Icon: Icon.Analytics  },
  { id: 'templates',  label: 'Templates',  Icon: Icon.Templates  },
  { id: 'settings',   label: 'Settings',   Icon: Icon.Settings   },
]


// ── Main Admin Hub ────────────────────────────────────────────────────────────
export default function AdminHubPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'created'>('created')
  const [showNewModal, setShowNewModal] = useState(false)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/projects')
    if (res.ok) setProjects(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [navOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const handleToggleStatus = async (project: Project) => {
    const newStatus = project.status === 'paused' ? 'active' : 'paused'
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, status: newStatus } : p))
    }
  }

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This will permanently delete all guests and data.`)) return
    const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== project.id))
  }

  const filtered = projects
    .filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const term = search.toLowerCase()
      const matchSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        (p.couple_1 || '').toLowerCase().includes(term) ||
        (p.couple_2 || '').toLowerCase().includes(term) ||
        (p.venue || '').toLowerCase().includes(term) ||
        (p.location || '').toLowerCase().includes(term)
      return matchStatus && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') {
        if (!a.date) return 1; if (!b.date) return -1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const pageTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label ?? 'Dashboard'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #F8F7F4 !important; }

        .admin-root {
          font-family: 'Inter', -apple-system, sans-serif;
          min-height: 100vh;
          background: #F8F7F4;
          display: flex;
          color: #1F2937;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 224px;
          background: #FFFFFF;
          border-right: 1.5px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          padding: 20px 12px;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 40;
          transition: transform 0.25s ease;
        }
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.45);
          z-index: 35;
          border: none; padding: 0; cursor: pointer;
        }
        .menu-toggle {
          display: none;
          width: 40px; height: 40px; border-radius: 10px;
          align-items: center; justify-content: center;
          color: #374151; background: #FFFFFF;
          border: 1.5px solid #E5E7EB; cursor: pointer;
          flex-shrink: 0;
        }
        .settings-layout {
          display: flex; gap: 24px; align-items: flex-start;
        }
        .settings-nav { width: 210px; flex-shrink: 0; }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px 20px;
          border-bottom: 1px solid #F3F4F6;
          margin-bottom: 12px;
        }
        .sidebar-logo-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #D72660 0%, #9B1C4C 100%);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .sidebar-logo-text {
          font-size: 15px; font-weight: 800; color: #1F2937; letter-spacing: -0.2px;
        }
        .sidebar-logo-badge {
          font-size: 9px; font-weight: 700; color: #D72660;
          background: #F4E7EC; padding: 1px 5px; border-radius: 4px;
          letter-spacing: 0.04em; margin-top: 1px;
        }

        .nav-section-label {
          font-size: 10px; font-weight: 700; color: #9CA3AF;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0 10px; margin: 4px 0 4px;
        }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #6B7280;
          cursor: pointer; border: none; background: transparent;
          width: 100%; text-align: left;
          transition: all 0.15s ease;
          font-family: inherit;
          position: relative;
        }
        .nav-item:hover { background: #F9FAFB; color: #1F2937; }
        .nav-item.active {
          background: #F4E7EC;
          color: #D72660;
          font-weight: 600;
        }
        .nav-item.active::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: #D72660;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #F3F4F6;
        }
        .user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
        }
        .user-chip:hover { background: #F9FAFB; }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #D72660, #9B1C4C);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .user-name { font-size: 13px; font-weight: 600; color: #1F2937; }
        .user-role { font-size: 11px; color: #9CA3AF; }
        .logout-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 9px 12px; border-radius: 10px;
          font-size: 13px; font-weight: 500; color: #6B7280;
          cursor: pointer; border: none; background: transparent;
          transition: all 0.15s; font-family: inherit;
        }
        .logout-btn:hover { background: #FEF2F2; color: #EF4444; }

        /* ── Main ── */
        .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .topbar {
          height: 60px;
          background: rgba(248,247,244,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1.5px solid #E5E7EB;
          display: flex; align-items: center;
          padding: 0 32px; gap: 16px;
          position: sticky; top: 0; z-index: 5;
        }
        .topbar-title { font-size: 16px; font-weight: 700; color: #1F2937; }
        .topbar-crumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9CA3AF; }
        .topbar-spacer { flex: 1; }
        .topbar-icon-btn {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #6B7280; background: transparent; border: none; cursor: pointer;
          transition: all 0.15s;
        }
        .topbar-icon-btn:hover { background: #F3F4F6; color: #1F2937; }

        /* ── Page body ── */
        .page-body { padding: 32px; flex: 1; overflow-y: auto; overflow-x: hidden; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 800; color: #1F2937; letter-spacing: -0.3px; }
        .page-header p { font-size: 13px; color: #6B7280; margin-top: 4px; }

        .dashboard-hero-title { font-size: 22px; }
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }
        @media (min-width: 900px) {
          .dashboard-hero { padding: 28px 32px !important; margin-bottom: 28px !important; }
          .dashboard-hero-title { font-size: 26px; }
          .dashboard-stats {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }
          .dashboard-stat-card { padding: 22px 24px !important; }
        }

        /* ── Toolbar ── */
        .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 280px; }
        .search-wrap input {
          width: 100%; padding: 9px 12px 9px 36px;
          background: #FFFFFF; border: 1.5px solid #E5E7EB;
          border-radius: 10px; color: #1F2937; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .search-wrap input:focus { border-color: #D72660; box-shadow: 0 0 0 3px rgba(215,38,96,0.08); }
        .search-wrap input::placeholder { color: #9CA3AF; }
        .search-icon-pos { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }

        .filter-select-wrap { position: relative; }
        .filter-sel {
          appearance: none; padding: 8px 30px 8px 12px;
          background: #FFFFFF; border: 1.5px solid #E5E7EB;
          border-radius: 10px; color: #4B5563; font-size: 13px;
          cursor: pointer; outline: none; font-family: inherit;
          transition: border-color 0.15s;
        }
        .filter-sel:focus, .filter-sel:hover { border-color: #D4D4D8; }
        .filter-sel-chev { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; }

        .toolbar-spacer { flex: 1; }

        .view-toggle { display: flex; background: #FFFFFF; border: 1.5px solid #E5E7EB; border-radius: 10px; overflow: hidden; }
        .view-btn {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #9CA3AF; border: none; background: transparent; transition: all 0.15s;
        }
        .view-btn:hover { color: #6B7280; }
        .view-btn.active { background: #F4E7EC; color: #D72660; }

        .create-btn {
          padding: 9px 16px;
          background: #D72660; border: none; border-radius: 10px;
          color: #fff; font-size: 13px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          font-family: inherit; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(215,38,96,0.25);
        }
        .create-btn:hover { background: #B91C4C; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(215,38,96,0.35); }
        .create-btn:active { transform: translateY(0); }

        /* ── Grid / List ── */
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
        .projects-list { display: flex; flex-direction: column; gap: 8px; }

        /* List view header */
        .list-header {
          display: grid;
          grid-template-columns: 1fr 130px 110px 80px 90px 80px;
          gap: 12px; padding: 8px 20px;
          font-size: 11px; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: 0.06em;
          border-bottom: 1px solid #E5E7EB; margin-bottom: 6px;
        }
        .list-row {
          background: #FFFFFF; border: 1.5px solid #E5E7EB; border-radius: 12px;
          padding: 14px 20px;
          display: grid; grid-template-columns: 1fr 130px 110px 80px 90px 80px;
          gap: 12px; align-items: center;
          cursor: pointer; transition: all 0.15s;
        }
        .list-row:hover { border-color: #D72660; box-shadow: 0 2px 8px rgba(215,38,96,0.06); }

        /* ── Empty state ── */
        .empty-state { text-align: center; padding: 80px 24px; }
        .empty-icon {
          width: 68px; height: 68px; border-radius: 18px;
          background: #F4E7EC; border: 1.5px solid #F9D0DC;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 28px;
        }
        .empty-title { color: #374151; font-size: 16px; font-weight: 700; margin: 0 0 8px; }
        .empty-sub { color: #9CA3AF; font-size: 13px; margin: 0 0 22px; }

        /* ── Skeleton ── */
        .skeleton-pulse {
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── Context menu ── */
        .ctx-item {
          width: 100%; text-align: left; padding: 8px 12px;
          background: transparent; border: none;
          color: #374151; font-size: 13px; cursor: pointer;
          border-radius: 8px; transition: background 0.1s;
          display: block; font-family: inherit;
        }
        .ctx-item:hover { background: #F9FAFB; }
        .ctx-danger { color: #DC2626 !important; }
        .ctx-danger:hover { background: #FEF2F2 !important; }

        /* ── Modal inputs ── */
        .modal-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #374151; margin-bottom: 6px; letter-spacing: 0.01em;
        }
        .modal-input {
          width: 100%; padding: 9px 12px;
          background: #F9FAFB; border: 1.5px solid #E5E7EB;
          border-radius: 10px; color: #1F2937; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .modal-input:focus { border-color: #D72660; background: #fff; box-shadow: 0 0 0 3px rgba(215,38,96,0.08); }
        .modal-input::placeholder { color: #9CA3AF; }
        select.modal-input { appearance: none; cursor: pointer; }
        select.modal-input option { background: #fff; color: #1F2937; }
        input[type="date"].modal-input { color-scheme: light; }

        .modal-select-wrap { position: relative; }
        .modal-select-chevron {
          position: absolute; right: 11px; top: 50%;
          transform: translateY(-50%); pointer-events: none; color: #9CA3AF;
        }

        .modal-btn-cancel {
          flex: 1; padding: 11px;
          background: #F3F4F6; border: 1.5px solid #E5E7EB;
          border-radius: 10px; color: #6B7280; font-size: 14px;
          cursor: pointer; font-weight: 600; transition: all 0.15s;
          font-family: inherit;
        }
        .modal-btn-cancel:hover { background: #E5E7EB; color: #374151; }

        .modal-btn-primary {
          flex: 1; padding: 11px;
          background: #D72660; border: none;
          border-radius: 10px; color: #fff; font-size: 14px;
          cursor: pointer; font-weight: 700; transition: background 0.15s;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(215,38,96,0.25);
        }
        .modal-btn-primary:hover:not(:disabled) { background: #B91C4C; }
        .modal-btn-primary:disabled { cursor: not-allowed; }

        /* ── Scrollbar (visible, clean) ── */
        .page-body,
        .admin-scroll {
          scrollbar-width: thin;
          scrollbar-color: #D1D5DB transparent;
        }
        .page-body::-webkit-scrollbar,
        .admin-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .page-body::-webkit-scrollbar-track,
        .admin-scroll::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 999px;
        }
        .page-body::-webkit-scrollbar-thumb,
        .admin-scroll::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 999px;
          border: 2px solid #F3F4F6;
        }
        .page-body::-webkit-scrollbar-thumb:hover,
        .admin-scroll::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

        /* ── Coming soon ── */
        .coming-soon {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px 24px; text-align: center; gap: 12px;
        }
        .coming-soon-icon { font-size: 40px; margin-bottom: 4px; }
        .coming-soon h2 { font-size: 18px; font-weight: 700; color: #1F2937; }
        .coming-soon p { font-size: 14px; color: #9CA3AF; }

        /* ── Mobile / tablet ── */
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: 0; top: 0;
            transform: translateX(-100%);
            box-shadow: 8px 0 32px rgba(15, 23, 42, 0.12);
          }
          .admin-root.nav-open .sidebar { transform: translateX(0); }
          .admin-root.nav-open .sidebar-overlay { display: block; }
          .menu-toggle { display: inline-flex; }
          .topbar { padding: 0 14px; gap: 10px; height: 56px; }
          .topbar-title { font-size: 15px; }
          .page-body { padding: 16px 14px 28px; }
          .page-header h1 { font-size: 20px; }
          .search-wrap { min-width: 100%; max-width: none; flex: 1 1 100%; }
          .toolbar-spacer { display: none; }
          .create-btn { flex: 1 1 auto; justify-content: center; }
          .projects-grid { grid-template-columns: 1fr; gap: 12px; }
          .list-header { display: none; }
          .list-row {
            grid-template-columns: 1fr auto;
            gap: 8px 12px;
            padding: 12px 14px;
          }
          .list-row > *:nth-child(n+3) { display: none; }
          .settings-layout { flex-direction: column; gap: 14px; }
          .settings-nav { width: 100%; display: flex; flex-wrap: wrap; gap: 4px; }
          .settings-nav button { width: auto !important; flex: 1 1 auto; margin-bottom: 0 !important; }
        }
        @media (max-width: 480px) {
          .view-toggle { display: none; }
          .page-body { padding: 14px 12px 24px; }
        }
      `}</style>

      <div className={`admin-root${navOpen ? ' nav-open' : ''}`}>
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Icon.Heart />
            </div>
            <div>
              <div className="sidebar-logo-text">Goldleaf</div>
              <div className="sidebar-logo-badge">ADMIN</div>
            </div>
            <button
              type="button"
              className="menu-toggle"
              style={{ marginLeft: 'auto' }}
              aria-label="Close menu"
              onClick={() => setNavOpen(false)}
            >
              <Icon.X />
            </button>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => { setActiveNav(item.id); setNavOpen(false) }}
              >
                <item.Icon />
                {item.label}
              </button>
            ))}
          </div>

          {/* Bottom */}
          <div className="sidebar-bottom">
            <div className="user-chip">
              <div className="user-avatar">A</div>
              <div>
                <div className="user-name">Admin</div>
                <div className="user-role">Workspace owner</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <Icon.Logout /> Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main-content">
          {/* Topbar */}
          <header className="topbar">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <Icon.Menu />
            </button>
            <div className="topbar-crumb">
              <span style={{ color: '#D72660', fontSize: 16 }}>✦</span>
              <span style={{ color: '#D4D4D8' }}>/</span>
              <span className="topbar-title">{pageTitle}</span>
            </div>
            <div className="topbar-spacer" />
            <NotificationSystem />
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D72660, #9B1C4C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              flexShrink: 0,
            }}>A</div>
          </header>

          {/* Page body */}
          <div className="page-body">
            {/* ── Dashboard ── */}
            {activeNav === 'dashboard' && (
              <>

                {loading ? (
                  <div className="dashboard-stats">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="dashboard-stat-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 18 }}>
                        <div className="skeleton-pulse" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 16 }} />
                        <div className="skeleton-pulse" style={{ height: 28, width: '60%', borderRadius: 6, marginBottom: 8 }} />
                        <div className="skeleton-pulse" style={{ height: 13, width: '50%', borderRadius: 6 }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <DashboardView projects={projects} />
                )}
              </>
            )}

            {/* ── Projects ── */}
            {activeNav === 'projects' && (
              <>
                <div className="page-header">
                  <h1>Projects</h1>
                  <p>Manage all your digital invitation projects.</p>
                </div>

                {/* Toolbar */}
                <div className="toolbar">
                  <div className="search-wrap">
                    <span className="search-icon-pos"><Icon.Search /></span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search projects…"
                    />
                  </div>

                  <div className="filter-select-wrap">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="filter-sel">
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                    <span className="filter-sel-chev"><Icon.ChevronDown /></span>
                  </div>

                  <div className="filter-select-wrap">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="filter-sel">
                      <option value="created">Sort: Recent</option>
                      <option value="name">Sort: Name A–Z</option>
                      <option value="date">Sort: Event date</option>
                    </select>
                    <span className="filter-sel-chev"><Icon.ChevronDown /></span>
                  </div>

                  <div className="toolbar-spacer" />

                  <div className="view-toggle">
                    <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                      <Icon.Grid />
                    </button>
                    <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                      <Icon.List />
                    </button>
                  </div>

                  <button className="create-btn" onClick={() => setShowNewModal(true)}>
                    <Icon.Plus /> Create Project
                  </button>
                </div>

                {/* Content */}
                {loading ? (
                  <div className="projects-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💍</div>
                    <p className="empty-title">
                      {search || statusFilter !== 'all' ? 'No projects match your filters' : 'No projects yet'}
                    </p>
                    <p className="empty-sub">
                      {search || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Create your first digital invitation project to get started.'}
                    </p>
                    {!search && statusFilter === 'all' && (
                      <button className="create-btn" style={{ margin: '0 auto' }} onClick={() => setShowNewModal(true)}>
                        <Icon.Plus /> Create Project
                      </button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="projects-grid">
                    {filtered.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={() => router.push(`/admin/projects/${project.id}`)}
                        onToggleStatus={() => handleToggleStatus(project)}
                        onDelete={() => handleDelete(project)}
                      />
                    ))}
                  </div>
                ) : (
                  /* List view */
                  <div className="projects-list">
                    <div className="list-header">
                      <span>Project</span>
                      <span>Event type</span>
                      <span>Status</span>
                      <span style={{ textAlign: 'right' }}>Guests</span>
                      <span style={{ textAlign: 'right' }}>Confirmed</span>
                      <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>
                    {filtered.map((project) => {
                      const et = getEventType(project.event_template)
                      return (
                        <div
                          key={project.id}
                          className="list-row"
                          onClick={() => router.push(`/admin/projects/${project.id}`)}
                        >
                          <div className="min-w-0">
                            <p style={{ color: '#1F2937', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                            {project.date && (
                              <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                                {new Date(project.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <span style={{
                            background: et.bg, color: et.color,
                            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                            display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 2,
                          }}>
                            {et.emoji} {et.label}
                          </span>
                          <StatusBadge status={project.status} />
                          <span style={{ color: '#6B7280', fontSize: 13, textAlign: 'right', fontWeight: 500 }}>{project._stats.total}</span>
                          <span style={{ color: '#16A34A', fontSize: 13, textAlign: 'right', fontWeight: 700 }}>{project._stats.confirmed}</span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/admin/projects/${project.id}`)}
                              style={{
                                padding: '5px 12px', background: '#F3F4F6', border: '1.5px solid #E5E7EB',
                                borderRadius: 8, color: '#6B7280', fontSize: 12, cursor: 'pointer',
                                fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#F4E7EC'; e.currentTarget.style.color = '#D72660'; e.currentTarget.style.borderColor = '#D72660' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                            >
                              Open →
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Guests / Analytics / Templates (coming soon) ── */}
            {['guests', 'analytics', 'templates'].includes(activeNav) && (
              <div className="coming-soon">
                <div className="coming-soon-icon">
                  {activeNav === 'guests' ? '👥' : activeNav === 'analytics' ? '📊' : '🎨'}
                </div>
                <h2>{pageTitle}</h2>
                <p>This section is coming soon. Stay tuned for updates.</p>
              </div>
            )}

            {/* ── Settings ── */}
            {activeNav === 'settings' && (
              <SettingsPanel onLogout={handleLogout} />
            )}

          </div>
        </div>
      </div>

      {/* New project modal */}
      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreate={(project) => {
            setProjects((prev) => [project, ...prev])
            addNotification({
              type: 'project_created',
              title: 'Project Created! 🎉',
              message: `${project.name} has been set up and is ready to use.`,
              projectName: project.name,
              projectId: project.id,
            })
            playNotificationSound('success')
          }}
        />
      )}
    </>
  )
}
