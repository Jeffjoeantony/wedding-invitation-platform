'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Guest {
  id: string
  name: string
  phone?: string
  email?: string
  unique_token: string
  rsvp_status: 'pending' | 'yes' | 'no'
  pax_count: number
  guest_category?: string
  opened_at?: string
  responded_at?: string
}

interface Project {
  id: string
  name: string
  couple_1: string
  couple_2: string
  date: string
  time: string
  venue: string
  location: string
  contact: string
  maps_url?: string
  event_template?: 'Wedding' | 'Engagement'
  status: string
}

// ── Avatar component ─────────────────────────────────────────────────────────
function GuestAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  const palette = [
    'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700', 'bg-pink-100 text-pink-700',
    'bg-cyan-100 text-cyan-700', 'bg-orange-100 text-orange-700',
  ]
  const c = palette[name.charCodeAt(0) % palette.length]
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c}`}>
      {initials}
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, textColor, iconBg }: {
  label: string; value: number | string; sub: string; icon: string
  accent: string; textColor: string; iconBg: string
}) {
  return (
    <Card className={`bg-white/90 border-l-4 ${accent} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${textColor}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>
          </div>
          <span className={`text-xl p-2.5 rounded-xl ${iconBg} shrink-0`}>{icon}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [guests, setGuests] = useState<Guest[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'yes' | 'no'>('all')
  const [search, setSearch] = useState('')
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestPhone, setNewGuestPhone] = useState('')
  const [newGuestCategory, setNewGuestCategory] = useState('Friends')
  const [adding, setAdding] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importPreviewCols, setImportPreviewCols] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState('')
  const [addGuestError, setAddGuestError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deletingProject, setDeletingProject] = useState(false)

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    const [guestRes, projectRes] = await Promise.all([
      fetch(`/api/projects/${projectId}/guests`),
      fetch(`/api/projects/${projectId}/event`),
    ])
    if (guestRes.ok) setGuests(await guestRes.json())
    if (projectRes.ok) setProject(await projectRes.json())
    setLoading(false)
    setRefreshing(false)
    setLastUpdated(new Date())
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchData()
      intervalRef.current = setInterval(fetchData, 30_000)
      return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }
  }, [fetchData, projectId])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddGuestError('')
    setAdding(true)
    const res = await fetch(`/api/projects/${projectId}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGuestName, phone: newGuestPhone || null, guest_category: newGuestCategory }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setAddGuestError(err.error || 'Failed to add guest. Please try again.')
    } else {
      const data = await res.json()
      setGuests([data, ...guests])
      setNewGuestName('')
      setNewGuestPhone('')
      setAddGuestError('')
    }
    setAdding(false)
  }

  const deleteGuest = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from the guest list? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/projects/${projectId}/guests?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setGuests((prev) => prev.filter((g) => g.id !== id))
    } else {
      setDeleteError(`Failed to delete "${name}". Please try again.`)
      setTimeout(() => setDeleteError(''), 4000)
    }
    setDeletingId(null)
  }

  const updateProject = async (updates: Partial<Project>) => {
    await fetch(`/api/projects/${projectId}/event`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setProject({ ...project!, ...updates })
  }

  const handleDeleteProject = async () => {
    if (!confirm(`Permanently delete "${project?.name}"? All guests and data will be lost. This cannot be undone.`)) return
    setDeletingProject(true)
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin')
    } else {
      alert('Failed to delete project. Please try again.')
      setDeletingProject(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportResult('')
    setImportPreview([])
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const preview = rows.slice(0, 5)
      setImportPreview(preview)
      setImportPreviewCols(preview.length > 0 ? Object.keys(preview[0]) : [])
    }
    reader.readAsArrayBuffer(file)
  }

  const handleBulkImport = () => {
    if (!importFile) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
        const guestList = rows
          .map((row) => {
            const norm: Record<string, string> = {}
            Object.keys(row).forEach((k) => { norm[k.toLowerCase().trim()] = String(row[k]) })
            return {
              name: norm.name || norm['guest name'] || norm['full name'] || '',
              phone: norm.phone || norm['phone number'] || norm.mobile || norm.contact || '',
              email: norm.email || norm['email address'] || '',
              guest_category: norm.category || norm['guest category'] || norm.group || 'Other',
            }
          })
          .filter((g) => g.name.trim())
        const res = await fetch(`/api/projects/${projectId}/guests/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guests: guestList }),
        })
        if (res.ok) {
          const result = await res.json()
          setImportResult(result.skipped > 0 ? `✓ ${result.message}` : `✓ Successfully imported ${result.count} guests`)
          setImportFile(null)
          setImportPreview([])
          setImportPreviewCols([])
          fetchData()
        } else {
          const err = await res.json()
          setImportResult(`✗ Import failed: ${err.error}`)
        }
      } catch {
        setImportResult('✗ Could not read file. Make sure it is a valid Excel or CSV.')
      } finally {
        setImporting(false)
      }
    }
    reader.readAsArrayBuffer(importFile)
  }

  const handleExportExcel = () => {
    const origin = window.location.origin
    const rows = guests.map((g) => ({
      Name: g.name, Phone: g.phone || '', Email: g.email || '',
      Category: g.guest_category || '', Status: g.rsvp_status,
      'Pax Count': g.pax_count, 'Invite Link': `${origin}/invite/${g.unique_token}`,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Guests')
    XLSX.writeFile(wb, `${project?.name ?? 'guests'}-links.xlsx`)
  }

  const handleExportCSV = () => {
    const origin = window.location.origin
    const header = 'Name,Phone,Email,Category,Status,Guests,Invite Link'
    const rows = guests.map((g) =>
      [`"${g.name}"`, `"${g.phone || ''}"`, `"${g.email || ''}"`,
       `"${g.guest_category || ''}"`, g.rsvp_status, g.pax_count,
       `${origin}/invite/${g.unique_token}`].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.name ?? 'guests'}-links.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const responded = guests.filter((g) => g.rsvp_status !== 'pending').length
  const stats = {
    total: guests.length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
    confirmed: guests.filter((g) => g.rsvp_status === 'yes').length,
    declined: guests.filter((g) => g.rsvp_status === 'no').length,
    totalPax: guests.filter((g) => g.rsvp_status === 'yes').reduce((s, g) => s + g.pax_count, 0),
    opened: guests.filter((g) => g.opened_at).length,
    responseRate: guests.length > 0 ? Math.round((responded / guests.length) * 100) : 0,
    openRate: guests.length > 0 ? Math.round((guests.filter((g) => g.opened_at).length / guests.length) * 100) : 0,
    confirmedRate: guests.length > 0 ? Math.round((guests.filter((g) => g.rsvp_status === 'yes').length / guests.length) * 100) : 0,
    declinedRate: guests.length > 0 ? Math.round((guests.filter((g) => g.rsvp_status === 'no').length / guests.length) * 100) : 0,
    pendingRate: guests.length > 0 ? Math.round((guests.filter((g) => g.rsvp_status === 'pending').length / guests.length) * 100) : 0,
  }

  const categoryMap: Record<string, { total: number; yes: number; no: number; pending: number }> = {}
  guests.forEach((g) => {
    const cat = g.guest_category || 'Other'
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, yes: 0, no: 0, pending: 0 }
    categoryMap[cat].total++
    categoryMap[cat][g.rsvp_status]++
  })
  const categories = Object.entries(categoryMap).sort((a, b) => b[1].total - a[1].total)

  const recentActivity = [...guests]
    .filter((g) => g.responded_at)
    .sort((a, b) => new Date(b.responded_at!).getTime() - new Date(a.responded_at!).getTime())
    .slice(0, 4)

  const filteredGuests = guests.filter((g) => {
    const matchFilter = filter === 'all' || g.rsvp_status === filter
    const term = search.toLowerCase()
    const matchSearch = !term || g.name.toLowerCase().includes(term) ||
      (g.phone || '').includes(term) || (g.guest_category || '').toLowerCase().includes(term)
    return matchFilter && matchSearch
  })

  const projectDateStr = project?.date
    ? new Date(project.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/20 to-rose-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
          <p className="text-sm text-gray-400">Loading project…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/20 to-rose-50">

      {/* ── Sticky header ── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-rose-100/80 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 md:px-6 md:py-3.5">
          <div className="flex items-center justify-between gap-4">

            {/* Back + Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all"
              >
                ← Projects
              </button>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-white text-base md:text-lg shadow-md shrink-0">
                  {project?.event_template === 'Engagement' ? '💑' : '💍'}
                </div>
                <div>
                  <h1 className="text-sm md:text-base font-semibold text-gray-900 leading-tight tracking-tight">
                    {project?.name || 'Project Dashboard'}
                  </h1>
                  <p className="text-[11px] text-gray-400 leading-tight">
                    {project?.couple_1 && project?.couple_2
                      ? `${project.couple_1} & ${project.couple_2}`
                      : 'Invitation & RSVP Management'}
                    {projectDateStr && ` · ${projectDateStr}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-[11px] text-gray-400 hidden lg:block">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all disabled:opacity-50"
              >
                <span className={`text-base ${refreshing ? 'animate-spin' : ''}`}>↻</span>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">

          {/* Tab bar */}
          <TabsList className="flex w-full overflow-x-auto justify-start sm:justify-center bg-white/90 shadow-sm border border-rose-100 rounded-2xl p-1 mb-6">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'guests', label: `Guest List${stats.total > 0 ? ` (${stats.total})` : ''}` },
              { value: 'add-guest', label: 'Add Guest' },
              { value: 'import-export', label: 'Import / Export' },
              { value: 'event', label: 'Event Details' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-shrink-0 px-4 rounded-xl text-sm data-[state=active]:bg-rose-700 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">

            {/* Hero — Response Rate */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-700 via-rose-800 to-rose-900 text-white shadow-xl p-6">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <p className="text-rose-300 text-xs font-semibold uppercase tracking-widest mb-1">Overall Response Rate</p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl font-bold tabular-nums">{stats.responseRate}%</span>
                    <span className="text-rose-300 text-sm mb-2">{responded} of {stats.total} guests responded</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                    {stats.confirmed > 0 && <div className="bg-emerald-400 rounded-l-full transition-all duration-700" style={{ width: `${stats.confirmedRate}%` }} />}
                    {stats.declined > 0 && <div className="bg-red-400 transition-all duration-700" style={{ width: `${stats.declinedRate}%` }} />}
                    {stats.pending > 0 && <div className="bg-amber-300 rounded-r-full transition-all duration-700" style={{ width: `${stats.pendingRate}%` }} />}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-rose-300 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Confirmed</span>
                    <span className="text-xs text-rose-300 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Declined</span>
                    <span className="text-xs text-rose-300 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" /> Pending</span>
                  </div>
                </div>
                <div className="flex gap-0 md:flex-col md:gap-0 border border-white/20 rounded-2xl overflow-hidden shrink-0">
                  {[
                    { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-300', bg: 'bg-white/5' },
                    { label: 'Declined', value: stats.declined, color: 'text-red-300', bg: 'bg-white/10' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-300', bg: 'bg-white/5' },
                    { label: 'Attendees', value: stats.totalPax, color: 'text-white', bg: 'bg-white/10' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} px-6 py-3 text-center flex md:flex-row items-center gap-3`}>
                      <span className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</span>
                      <span className="text-rose-300 text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6 Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Invited" value={stats.total} sub="Unique invitations sent" icon="💌" accent="border-violet-400" textColor="text-violet-700" iconBg="bg-violet-50" />
              <StatCard label="Invite Opened" value={stats.opened} sub={`${stats.openRate}% open rate`} icon="👁️" accent="border-blue-400" textColor="text-blue-700" iconBg="bg-blue-50" />
              <StatCard label="Confirmed" value={stats.confirmed} sub={`${stats.confirmedRate}% acceptance`} icon="✅" accent="border-emerald-400" textColor="text-emerald-700" iconBg="bg-emerald-50" />
              <StatCard label="Declined" value={stats.declined} sub="Sent their regrets" icon="❌" accent="border-red-400" textColor="text-red-600" iconBg="bg-red-50" />
              <StatCard label="Awaiting Reply" value={stats.pending} sub="Haven't responded yet" icon="⏳" accent="border-amber-400" textColor="text-amber-600" iconBg="bg-amber-50" />
              <StatCard label="Total Attendees" value={stats.totalPax} sub="Confirmed headcount" icon="👥" accent="border-rose-400" textColor="text-rose-700" iconBg="bg-rose-50" />
            </div>

            {/* Category breakdown + Recent activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 shadow-sm rounded-2xl border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Guests by Category</CardTitle>
                      <CardDescription className="text-xs">{categories.length} group{categories.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <span className="text-2xl">📊</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No guests added yet</p>}
                  {categories.map(([cat, data]) => (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-800">{cat}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-emerald-600 font-semibold">✓{data.yes}</span>
                          <span className="text-red-500 font-semibold">✗{data.no}</span>
                          <span className="text-amber-600 font-semibold">⏳{data.pending}</span>
                          <span className="text-gray-400 font-bold w-5 text-right">{data.total}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        {data.yes > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${(data.yes / data.total) * 100}%` }} />}
                        {data.no > 0 && <div className="bg-red-300 transition-all" style={{ width: `${(data.no / data.total) * 100}%` }} />}
                        {data.pending > 0 && <div className="bg-amber-200 transition-all" style={{ width: `${(data.pending / data.total) * 100}%` }} />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/90 shadow-sm rounded-2xl border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Recent Responses</CardTitle>
                      <CardDescription className="text-xs">Latest guest replies</CardDescription>
                    </div>
                    <span className="text-2xl">🔔</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No responses yet</p>}
                  {recentActivity.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <GuestAvatar name={g.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{g.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {g.guest_category || 'Other'}
                          {g.responded_at ? ` · ${new Date(g.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        g.rsvp_status === 'yes' ? 'bg-emerald-100 text-emerald-700' :
                        g.rsvp_status === 'no' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {g.rsvp_status === 'yes' ? '✓ Attending' : g.rsvp_status === 'no' ? '✗ Declined' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Not-opened banner */}
            {guests.filter((g) => !g.opened_at).length > 0 && (
              <Card className="bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl shrink-0">📭</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {guests.filter((g) => !g.opened_at).length} guest{guests.filter((g) => !g.opened_at).length !== 1 ? 's' : ''} haven't opened their invite yet
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">Consider sending a reminder via WhatsApp or SMS.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ══ GUEST LIST ════════════════════════════════════════════════════ */}
          <TabsContent value="guests" className="space-y-4">
            <Card className="bg-white/90 shadow-sm rounded-2xl border-0">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Guest List</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Showing <span className="font-semibold text-gray-700">{filteredGuests.length}</span> of <span className="font-semibold text-gray-700">{guests.length}</span> guests
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none">🔍</span>
                    <Input
                      placeholder="Search name, phone, category…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 w-64 h-9 text-sm border-gray-200 focus:border-rose-300 rounded-xl"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter pills */}
                <div className="flex gap-2 flex-wrap">
                  {([
                    { key: 'all', label: 'All', count: guests.length },
                    { key: 'pending', label: 'Pending', count: stats.pending },
                    { key: 'yes', label: 'Confirmed', count: stats.confirmed },
                    { key: 'no', label: 'Declined', count: stats.declined },
                  ] as const).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filter === f.key ? 'bg-rose-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        filter === f.key ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>{f.count}</span>
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Guest</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Category</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Pax</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Opened</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Responded</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl">🔍</span>
                              <p className="text-sm">{search ? 'No guests match your search.' : 'No guests in this category.'}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredGuests.map((guest) => (
                        <TableRow key={guest.id} className="hover:bg-rose-50/40 transition-colors group border-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <GuestAvatar name={guest.name} />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{guest.name}</p>
                                {guest.phone && <p className="text-xs text-gray-400 font-mono">{guest.phone}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                              {guest.guest_category || 'Other'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              guest.rsvp_status === 'yes' ? 'bg-emerald-100 text-emerald-700' :
                              guest.rsvp_status === 'no' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {guest.rsvp_status === 'yes' ? '✓ Yes' : guest.rsvp_status === 'no' ? '✗ No' : '⏳ Pending'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {guest.rsvp_status === 'yes' ? (
                              <span className="text-sm font-semibold text-emerald-700">
                                {guest.pax_count}<span className="text-xs font-normal text-gray-400 ml-1">{guest.pax_count === 1 ? 'person' : 'people'}</span>
                              </span>
                            ) : <span className="text-gray-300 text-sm">—</span>}
                          </TableCell>
                          <TableCell>
                            {guest.opened_at ? (
                              <div className="text-xs">
                                <p className="font-medium text-gray-700">{new Date(guest.opened_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                <p className="text-gray-400">{new Date(guest.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            ) : <span className="text-xs text-gray-300 italic">Not yet</span>}
                          </TableCell>
                          <TableCell>
                            {guest.responded_at ? (
                              <div className="text-xs">
                                <p className="font-medium text-gray-700">{new Date(guest.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                <p className="text-gray-400">{new Date(guest.responded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline" size="sm"
                                className={`text-xs h-7 px-3 rounded-lg transition-all ${
                                  copiedId === guest.id ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                }`}
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/invite/${guest.unique_token}`)
                                  setCopiedId(guest.id)
                                  setTimeout(() => setCopiedId(null), 2000)
                                }}
                              >
                                {copiedId === guest.id ? '✓ Copied!' : 'Copy Link'}
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="text-xs h-7 px-3 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                disabled={deletingId === guest.id}
                                onClick={() => deleteGuest(guest.id, guest.name)}
                              >
                                {deletingId === guest.id ? 'Deleting…' : 'Delete'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delete error toast */}
          {deleteError && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
              <span>⚠</span> {deleteError}
            </div>
          )}

          {/* ══ ADD GUEST ═════════════════════════════════════════════════════ */}
          <TabsContent value="add-guest" className="mt-0">
            <div className="max-w-md">
              <Card className="bg-white/90 shadow-sm rounded-2xl border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <CardTitle>Add New Guest</CardTitle>
                      <CardDescription>Create a personalised invitation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addGuest} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Guest Name *</Label>
                      <Input id="name" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)}
                        placeholder="Full name" className="mt-2 rounded-xl" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone" type="tel" value={newGuestPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setNewGuestPhone(digits)
                          setPhoneError(digits.length > 0 && digits.length < 10 ? 'Phone number must be exactly 10 digits' : '')
                        }}
                        placeholder="10-digit number" maxLength={10} inputMode="numeric"
                        className={`mt-2 rounded-xl font-mono ${phoneError ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                      />
                      {phoneError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {phoneError}</p>}
                      {newGuestPhone.length === 10 && !phoneError && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><span>✓</span> Valid number</p>}
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newGuestCategory} onValueChange={setNewGuestCategory}>
                        <SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Family', 'Friends', 'Bride Side', 'Groom Side', 'Neighbours', 'Office', 'Other'].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {addGuestError && (
                      <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
                        <span className="shrink-0 mt-0.5">⚠</span><span>{addGuestError}</span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={!newGuestName || adding || !!phoneError || (newGuestPhone.length > 0 && newGuestPhone.length < 10)}
                      className="w-full bg-rose-700 hover:bg-rose-800 text-white rounded-xl"
                    >
                      {adding ? 'Adding…' : '+ Add Guest'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══ IMPORT / EXPORT ═══════════════════════════════════════════════ */}
          <TabsContent value="import-export" className="mt-0 space-y-6">
            <Card className="bg-white/90 shadow-sm rounded-2xl border-0 max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📥</span>
                  <div>
                    <CardTitle>Import from Excel / CSV</CardTitle>
                    <CardDescription>Upload a spreadsheet — tokens and links are auto-generated.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <label htmlFor="import-file" className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-rose-200 rounded-2xl p-10 cursor-pointer hover:bg-rose-50/40 transition-colors">
                  <span className="text-4xl">📂</span>
                  <p className="text-gray-700 font-light text-sm">{importFile ? importFile.name : 'Click to upload or drag & drop'}</p>
                  <p className="text-xs text-gray-400">Accepts .xlsx · .xls · .csv</p>
                  <input id="import-file" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                </label>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-amber-900 mb-1">Expected columns (case-insensitive):</p>
                  <p className="font-mono text-amber-800 text-xs">Name · Phone · Email · Category</p>
                  <p className="text-amber-700 text-xs mt-1">Only <strong>Name</strong> is required.</p>
                </div>
                {importPreview.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Preview — first {importPreview.length} rows:</p>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="text-xs w-full">
                        <thead className="bg-gray-50">
                          <tr>{importPreviewCols.map((col) => <th key={col} className="px-3 py-2 text-left text-gray-700 font-semibold border-b border-gray-200">{col}</th>)}</tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                              {importPreviewCols.map((col) => <td key={col} className="px-3 py-2 text-gray-700">{String(row[col] ?? '')}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {importResult && (
                  <p className={`text-sm font-semibold px-4 py-3 rounded-xl ${importResult.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {importResult}
                  </p>
                )}
                <Button onClick={handleBulkImport} disabled={!importFile || importing} className="w-full bg-rose-700 hover:bg-rose-800 text-white rounded-xl">
                  {importing ? 'Importing…' : importFile ? `Import "${importFile.name}"` : 'Select a file first'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/90 shadow-sm rounded-2xl border-0 max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📤</span>
                  <div>
                    <CardTitle>Export Guest Links</CardTitle>
                    <CardDescription>Download the full guest list with unique invite URLs.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <p className="text-gray-700"><strong>{guests.length}</strong> guests · links will use:</p>
                  <p className="font-mono text-xs text-gray-500 mt-1 break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/invite/<em>TOKEN</em>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleExportExcel} disabled={guests.length === 0} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">
                    ⬇ Export Excel (.xlsx)
                  </Button>
                  <Button onClick={handleExportCSV} disabled={guests.length === 0} variant="outline" className="border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-xl">
                    ⬇ Export CSV
                  </Button>
                </div>
                {guests.length === 0 && <p className="text-xs text-gray-400">Add or import guests first to enable export.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ EVENT DETAILS ═════════════════════════════════════════════════ */}
          <TabsContent value="event" className="mt-0 space-y-6">
            {project && (
              <Card className="bg-white/90 shadow-sm rounded-2xl border-0 max-w-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎊</span>
                    <div>
                      <CardTitle>Event Details</CardTitle>
                      <CardDescription>
                        {project.event_template === 'Engagement'
                          ? 'Update your engagement ceremony information'
                          : 'Update your wedding information'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* Project name */}
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input id="project-name" defaultValue={project.name}
                      onChange={(e) => updateProject({ name: e.target.value })}
                      className="mt-2 rounded-xl" />
                  </div>

                  {/* Event type */}
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={project.event_template ?? 'Wedding'}
                      onValueChange={(val) => updateProject({ event_template: val as 'Wedding' | 'Engagement' })}
                    >
                      <SelectTrigger id="event-type" className="mt-2 rounded-xl">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wedding">💍 Wedding</SelectItem>
                        <SelectItem value="Engagement">💑 Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1.5">Changes all wording on the invitation cards automatically.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Partner 1</Label>
                      <Input defaultValue={project.couple_1} onChange={(e) => updateProject({ couple_1: e.target.value })} className="mt-2 rounded-xl" />
                    </div>
                    <div>
                      <Label>Partner 2</Label>
                      <Input defaultValue={project.couple_2} onChange={(e) => updateProject({ couple_2: e.target.value })} className="mt-2 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input type="date" min={new Date().toISOString().split('T')[0]} defaultValue={project.date}
                        onChange={(e) => updateProject({ date: e.target.value })} className="mt-2 rounded-xl" />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input type="time" defaultValue={project.time} onChange={(e) => updateProject({ time: e.target.value })} className="mt-2 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <Input defaultValue={project.venue} onChange={(e) => updateProject({ venue: e.target.value })} className="mt-2 rounded-xl" />
                  </div>
                  <div>
                    <Label>Location / City</Label>
                    <Input defaultValue={project.location} onChange={(e) => updateProject({ location: e.target.value })} className="mt-2 rounded-xl" />
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <Input defaultValue={project.contact} onChange={(e) => updateProject({ contact: e.target.value })} className="mt-2 rounded-xl" />
                  </div>
                  <div>
                    <Label>Google Maps URL</Label>
                    <Input defaultValue={project.maps_url || ''} onChange={(e) => updateProject({ maps_url: e.target.value })}
                      placeholder="https://maps.google.com/…" className="mt-2 rounded-xl" />
                  </div>
                  <p className="text-xs text-gray-400 italic flex items-center gap-1.5"><span>✓</span> Changes are saved automatically</p>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="bg-red-50 border border-red-200 rounded-2xl max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <CardTitle className="text-red-800">Danger Zone</CardTitle>
                    <CardDescription className="text-red-600">Irreversible actions — proceed with caution</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-red-200">
                  <div>
                    <p className="text-sm font-semibold text-red-800">Delete this project</p>
                    <p className="text-xs text-red-600 mt-0.5">Permanently deletes all guests, RSVP data, and invitation links.</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingProject}
                    onClick={handleDeleteProject}
                    className="shrink-0 rounded-xl"
                  >
                    {deletingProject ? 'Deleting…' : 'Delete Project'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </main>
  )
}
