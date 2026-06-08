'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

// ── Icons ────────────────────────────────────────────────────────────────────
function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  )
}
function IconRing() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: 'Active', dot: '#22c55e', bg: 'rgba(34,197,94,0.1)', color: '#86efac' },
    paused: { label: 'Paused', dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)', color: '#fcd34d' },
    completed: { label: 'Completed', dot: '#6366f1', bg: 'rgba(99,102,241,0.1)', color: '#a5b4fc' },
  }[status] ?? { label: status, dot: '#6b7280', bg: 'rgba(107,114,128,0.1)', color: '#9ca3af' }

  return (
    <span
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.dot}30` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: config.dot }} />
      {config.label}
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

  const dateStr = project.date
    ? new Date(project.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const responseRate = project._stats.total > 0
    ? Math.round(((project._stats.confirmed + project._stats.declined) / project._stats.total) * 100)
    : 0

  return (
    <div
      className="project-card"
      style={{
        background: '#161616',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid #3a3a3a'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid #2a2a2a'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onClick={() => { if (!menuOpen) onOpen() }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-white font-semibold text-[15px] truncate leading-tight">{project.name}</p>
          {(project.couple_1 || project.couple_2) && (
            <p style={{ color: '#6b7280', fontSize: '12px' }} className="mt-0.5 truncate">
              {project.couple_1}{project.couple_1 && project.couple_2 ? ' & ' : ''}{project.couple_2}
            </p>
          )}
        </div>

        {/* Context menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ color: '#4b5563', background: 'transparent', border: 'none', padding: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#9ca3af' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563' }}
          >
            <IconDots />
          </button>
          {menuOpen && (
            <div
              style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '4px', minWidth: '160px', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
            >
              <button
                className="context-menu-item"
                onClick={() => { setMenuOpen(false); onOpen() }}
              >
                Open project
              </button>
              <button
                className="context-menu-item"
                onClick={() => { setMenuOpen(false); onToggleStatus() }}
              >
                {project.status === 'paused' ? 'Mark as active' : 'Pause project'}
              </button>
              <div style={{ height: '1px', background: '#2a2a2a', margin: '4px 0' }} />
              <button
                className="context-menu-item context-menu-danger"
                onClick={() => { setMenuOpen(false); onDelete() }}
              >
                Delete project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4" style={{ color: '#6b7280', fontSize: '12px' }}>
        {project.event_template && (
          <span>{project.event_template === 'Engagement' ? '💑' : '💍'} {project.event_template}</span>
        )}
        {dateStr && <span>📅 {dateStr}</span>}
        {project.venue && <span className="truncate max-w-[160px]">📍 {project.venue}</span>}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4">
        <div style={{ flex: 1, height: '4px', background: '#2a2a2a', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
          {project._stats.confirmed > 0 && (
            <div style={{ width: `${(project._stats.confirmed / project._stats.total) * 100}%`, background: '#22c55e' }} />
          )}
          {project._stats.declined > 0 && (
            <div style={{ width: `${(project._stats.declined / project._stats.total) * 100}%`, background: '#ef4444' }} />
          )}
          {project._stats.pending > 0 && (
            <div style={{ width: `${(project._stats.pending / project._stats.total) * 100}%`, background: '#f59e0b' }} />
          )}
        </div>
        <span style={{ color: '#9ca3af', fontSize: '11px', whiteSpace: 'nowrap' }}>
          {project._stats.total} invited
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <StatusBadge status={project.status} />
        <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#4b5563' }}>
          {project._stats.total > 0 && (
            <>
              <span style={{ color: '#22c55e' }}>✓ {project._stats.confirmed}</span>
              <span style={{ color: '#f59e0b' }}>⏳ {project._stats.pending}</span>
              <span style={{ color: '#9ca3af' }}>{responseRate}% responded</span>
            </>
          )}
          {project._stats.total === 0 && (
            <span style={{ color: '#374151' }}>No guests yet</span>
          )}
        </div>
      </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr('Project name is required'); return }
    setSaving(true)
    setErr('')
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      onCreate(data)
      onClose()
    } else {
      const d = await res.json().catch(() => ({}))
      setErr(d.error || 'Failed to create project')
    }
    setSaving(false)
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
        {/* Modal header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 600, fontSize: '17px', margin: 0 }}>New project</h2>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>Create a new wedding or engagement invitation project</p>
          </div>
          <button onClick={onClose} style={{ color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Project name */}
            <div>
              <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Project name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                value={form.name} onChange={f('name')} required
                placeholder="e.g. Priya & Arjun Wedding"
                className="modal-input"
              />
            </div>

            {/* Event type */}
            <div>
              <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Event type</label>
              <select value={form.event_template} onChange={f('event_template')} className="modal-input">
                <option value="Wedding">💍 Wedding</option>
                <option value="Engagement">💑 Engagement</option>
              </select>
            </div>

            {/* Couple names */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Partner 1</label>
                <input value={form.couple_1} onChange={f('couple_1')} placeholder="Name" className="modal-input" />
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Partner 2</label>
                <input value={form.couple_2} onChange={f('couple_2')} placeholder="Name" className="modal-input" />
              </div>
            </div>

            {/* Date & Venue */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Event date</label>
                <input type="date" value={form.date} onChange={f('date')} className="modal-input" />
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Location / City</label>
                <input value={form.location} onChange={f('location')} placeholder="Chennai" className="modal-input" />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Venue</label>
              <input value={form.venue} onChange={f('venue')} placeholder="Grand Ballroom, Hotel..." className="modal-input" />
            </div>

            {/* Contact */}
            <div>
              <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Contact number</label>
              <input value={form.contact} onChange={f('contact')} placeholder="+91 98765 43210" className="modal-input" />
            </div>

            {err && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px' }}>
                ⚠ {err}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button" onClick={onClose}
                style={{ flex: 1, padding: '10px', background: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                style={{ flex: 1, padding: '10px', background: saving ? '#15803d' : '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
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
  const [activeNav, setActiveNav] = useState('projects')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/projects')
    if (res.ok) setProjects(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

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

  // Filter + sort
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
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const navItems = [
    { id: 'projects', icon: <IconGrid />, label: 'Projects' },
    { id: 'guests', icon: <IconUsers />, label: 'All Guests' },
    { id: 'settings', icon: <IconSettings />, label: 'Settings' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background: #0a0a0a !important; }
        .admin-hub { font-family: 'Inter', sans-serif; min-height: 100vh; background: #0a0a0a; display: flex; }

        /* Sidebar */
        .sidebar { width: 56px; background: #111; border-right: 1px solid #1f1f1f; display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 4px; position: sticky; top: 0; height: 100vh; }
        .sidebar-logo { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #16a34a, #15803d); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .nav-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563; border: none; background: transparent; transition: all 0.15s; }
        .nav-icon:hover { background: #1f1f1f; color: #9ca3af; }
        .nav-icon.active { background: #1f1f1f; color: #fff; }
        .sidebar-spacer { flex: 1; }
        .sidebar-logout { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563; border: none; background: transparent; transition: all 0.15s; font-size: 18px; }
        .sidebar-logout:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

        /* Main */
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .topbar { height: 52px; background: #111; border-bottom: 1px solid #1f1f1f; display: flex; align-items: center; padding: 0 24px; gap: 16px; }
        .topbar-org { color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .topbar-divider { width: 1px; height: 16px; background: #2a2a2a; }
        .topbar-spacer { flex: 1; }

        /* Page body */
        .page-body { padding: 32px; flex: 1; overflow-y: auto; }
        .page-title { color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; }

        /* Toolbar */
        .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
        .search-box input { width: 100%; padding: 8px 12px 8px 34px; background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; color: #fff; font-size: 13px; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .search-box input:focus { border-color: #3a3a3a; }
        .search-box input::placeholder { color: #4b5563; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #4b5563; pointer-events: none; }

        .filter-btn { padding: 7px 12px; background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; color: #9ca3af; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
        .filter-btn:hover { border-color: #3a3a3a; color: #d1d5db; }
        .filter-btn.active-filter { border-color: #16a34a; color: #86efac; background: rgba(22,163,74,0.1); }

        .view-toggle { display: flex; background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden; }
        .view-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563; border: none; background: transparent; transition: all 0.15s; }
        .view-btn:hover { color: #9ca3af; }
        .view-btn.active { background: #2a2a2a; color: #fff; }

        .toolbar-spacer { flex: 1; }

        .new-project-btn { padding: 8px 14px; background: #16a34a; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s; font-family: inherit; white-space: nowrap; }
        .new-project-btn:hover { background: #15803d; }

        /* Grid */
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .projects-list { display: flex; flex-direction: column; gap: 8px; }

        /* List item */
        .list-item { background: #161616; border: 1px solid #2a2a2a; border-radius: 10px; padding: 14px 18px; display: flex; align-items: center; gap-16px; cursor: pointer; transition: all 0.15s; }
        .list-item:hover { border-color: #3a3a3a; }

        /* Empty state */
        .empty-state { text-align: center; padding: 80px 24px; }
        .empty-icon { width: 64px; height: 64px; border-radius: 16px; background: #161616; border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #374151; }
        .empty-title { color: #9ca3af; font-size: 16px; font-weight: 500; margin: 0 0 8px; }
        .empty-sub { color: #4b5563; font-size: 13px; margin: 0 0 20px; }

        /* Skeleton */
        .skeleton { background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Context menu items */
        .context-menu-item { width: 100%; text-align: left; padding: 8px 12px; background: transparent; border: none; color: #d1d5db; font-size: 13px; cursor: pointer; border-radius: 6px; transition: background 0.1s; display: block; font-family: inherit; }
        .context-menu-item:hover { background: #2a2a2a; }
        .context-menu-danger { color: #fca5a5 !important; }
        .context-menu-danger:hover { background: rgba(239,68,68,0.1) !important; }

        /* Modal input */
        .modal-input { width: 100%; padding: 9px 12px; background: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 8px; color: #fff; font-size: 13px; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .modal-input:focus { border-color: #3a3a3a; }
        .modal-input::placeholder { color: #4b5563; }
        select.modal-input option { background: #1f1f1f; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
      `}</style>

      <div className="admin-hub">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <IconRing />
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-icon ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
          <div className="sidebar-spacer" />
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">⏻</button>
        </aside>

        {/* ── Main ── */}
        <div className="main-content">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-org">
              <span style={{ fontSize: '16px' }}>💍</span>
              <span>Wedding Platform</span>
              <span style={{ color: '#374151', fontSize: '11px', background: '#1f1f1f', border: '1px solid #2a2a2a', padding: '2px 7px', borderRadius: '4px', fontWeight: 500 }}>
                ADMIN
              </span>
            </div>
            <div className="topbar-divider" />
            <span style={{ color: '#6b7280', fontSize: '13px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
            <div className="topbar-spacer" />
            <button
              onClick={handleLogout}
              style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#6b7280' }}
            >
              Sign out
            </button>
          </header>

          {/* Page body */}
          <div className="page-body">
            <h1 className="page-title">Projects</h1>

            {/* Toolbar */}
            <div className="toolbar">
              {/* Search */}
              <div className="search-box">
                <span className="search-icon"><IconSearch /></span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a project"
                />
              </div>

              {/* Status filter */}
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="filter-btn"
                  style={{ appearance: 'none', paddingRight: '28px' }}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }}>
                  <IconChevronDown />
                </span>
              </div>

              {/* Sort */}
              <div style={{ position: 'relative' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="filter-btn"
                  style={{ appearance: 'none', paddingRight: '28px' }}
                >
                  <option value="created">Sort: Recent</option>
                  <option value="name">Sort: Name</option>
                  <option value="date">Sort: Event date</option>
                </select>
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }}>
                  <IconChevronDown />
                </span>
              </div>

              <div className="toolbar-spacer" />

              {/* View toggle */}
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <IconGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <IconList />
                </button>
              </div>

              {/* New project */}
              <button className="new-project-btn" onClick={() => setShowNewModal(true)}>
                <IconPlus /> New project
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="projects-grid">
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="skeleton" style={{ height: '18px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '13px', width: '40%' }} />
                    <div className="skeleton" style={{ height: '4px', marginTop: '8px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <div className="skeleton" style={{ height: '22px', width: '70px' }} />
                      <div className="skeleton" style={{ height: '22px', width: '80px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><IconGrid /></div>
                <p className="empty-title">
                  {search || statusFilter !== 'all' ? 'No projects match your filters' : 'No projects yet'}
                </p>
                <p className="empty-sub">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'Create your first wedding invitation project to get started'}
                </p>
                {!search && statusFilter === 'all' && (
                  <button className="new-project-btn" style={{ margin: '0 auto' }} onClick={() => setShowNewModal(true)}>
                    <IconPlus /> New project
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
                {/* List header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 80px 80px', gap: '12px', padding: '8px 18px', color: '#4b5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', marginBottom: '4px' }}>
                  <span>Project</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span style={{ textAlign: 'right' }}>Guests</span>
                  <span style={{ textAlign: 'right' }}>Confirmed</span>
                  <span style={{ textAlign: 'right' }}>Actions</span>
                </div>
                {filtered.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                    style={{
                      background: '#161616', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px 18px',
                      display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 80px 80px', gap: '12px',
                      alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3a3a3a' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                  >
                    <div className="min-w-0">
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                      {project.date && (
                        <p style={{ color: '#4b5563', fontSize: '12px', margin: '2px 0 0' }}>
                          {new Date(project.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{project.event_template || 'Wedding'}</span>
                    <StatusBadge status={project.status} />
                    <span style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'right' }}>{project._stats.total}</span>
                    <span style={{ color: '#22c55e', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>{project._stats.confirmed}</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                        style={{ padding: '5px 10px', background: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#1f1f1f'; e.currentTarget.style.color = '#9ca3af' }}
                      >
                        Open →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New project modal */}
      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreate={(project) => setProjects((prev) => [project, ...prev])}
        />
      )}
    </>
  )
}
