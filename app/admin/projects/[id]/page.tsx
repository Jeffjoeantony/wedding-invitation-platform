'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import * as XLSX from 'xlsx'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link2, Pencil, Trash2 } from 'lucide-react'
import NotificationSystem from '@/components/NotificationSystem'
import { addNotification, playNotificationSound } from '@/lib/notifications'
import { getDashboardTheme } from '@/lib/dashboardTheme'
import {
  formatBirthdayPersonsDisplay,
  parseAdditionalBirthdayPersons,
  serializeAdditionalBirthdayPersons,
} from '@/lib/birthdayPersons'
import { buildOpenInviteUrl } from '@/lib/inviteLinks'
import { MediaUploader } from '@/components/admin/media-uploader'
import { GuestMomentsEditor } from '@/components/admin/guest-moments-editor'
import { EventsIncludedEditor } from '@/components/admin/events-included-editor'
import { GuestInvitePanel } from '@/components/admin/guest-invite-panel'
import {
  MAX_GALLERY_IMAGES,
  MAX_GUEST_MOMENTS,
  parseMediaList,
  type MediaItem,
} from '@/lib/invite-media'
import {
  buildGuestExportRows,
  guestExportColumnOrder,
  invitedToLabels,
  parseRsvpByEvent,
  resetEventsToPrimary,
  resolveProjectEvents,
  type ProjectEvent,
} from '@/lib/project-events'

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
  moments?: MediaItem[] | unknown
  /** Count from Storage — set by guests list API */
  moments_count?: number
  invited_to?: string[] | unknown
  rsvp_by_event?: unknown
  rsvp_headline?: string | null
  greeting_line?: string | null
  hide_greeting?: boolean | null
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
  event_template?: 'Wedding' | 'Engagement' | 'Reception' | 'Mehendi' | 'Haldi' |
    'Save The Date' | 'Birthday' | 'Housewarming' | 'Corporate Event' | 'Custom Event'
  status: string
  gallery_images?: MediaItem[] | unknown
  events?: ProjectEvent[] | unknown
}


function BirthdayPersonsFields({
  couple1,
  couple2,
  onUpdatePrimary,
  onUpdateAdditional,
}: {
  couple1: string
  couple2: string
  onUpdatePrimary: (name: string) => void
  onUpdateAdditional: (names: string[]) => void
}) {
  const [additional, setAdditional] = useState<string[]>(() => parseAdditionalBirthdayPersons(couple2))

  useEffect(() => {
    setAdditional(parseAdditionalBirthdayPersons(couple2))
  }, [couple2])

  const persistAdditional = (names: string[]) => {
    setAdditional(names)
    onUpdateAdditional(names)
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="birthday-person-1">🎂 Birthday Person</Label>
        <Input
          id="birthday-person-1"
          defaultValue={couple1}
          onChange={(e) => onUpdatePrimary(e.target.value)}
          placeholder="Name of the birthday person"
          className="mt-2 rounded-xl"
        />
      </div>
      {additional.map((name, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500 shrink-0">&</span>
          <Input
            value={name}
            onChange={(e) => {
              const next = [...additional]
              next[index] = e.target.value
              persistAdditional(next)
            }}
            placeholder="Person name"
            className="rounded-xl flex-1"
          />
          <button
            type="button"
            title="Remove"
            onClick={() => persistAdditional(additional.filter((_, i) => i !== index))}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-base"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setAdditional((prev) => [...prev, ''])}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-violet-200 text-violet-600 text-sm font-medium hover:bg-violet-50 hover:border-violet-300 transition-all"
      >
        More
      </button>
    </div>
  )
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
    <Card
      className={`bg-white/50 backdrop-blur-xl border border-white/70 border-l-4 ${accent} shadow-[0_8px_28px_rgba(31,41,55,0.07)] hover:shadow-[0_12px_36px_rgba(31,41,55,0.12)] hover:bg-white/65 transition-all duration-300 hover:-translate-y-0.5`}
    >
      <CardContent className="pt-4 pb-3 sm:pt-5 sm:pb-4 px-3.5 sm:px-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${textColor}`}>{value}</p>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1 leading-snug line-clamp-2">{sub}</p>
          </div>
          <span className={`text-lg sm:text-xl p-2 sm:p-2.5 rounded-xl ${iconBg} shrink-0`}>{icon}</span>
        </div>
      </CardContent>
    </Card>
  )
}

/** Soft enter animation when switching dashboard tabs */
function AnimatedTabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  return (
    <TabsContent value={value} className={`mt-0 outline-none ${className ?? ''}`}>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </TabsContent>
  )
}

// ── Send Invitations – Campaign Builder ───────────────────────────────────────
type SendStep = 'select' | 'compose' | 'review'
type SendChannel = 'whatsapp' | 'sms' | 'email'

function SendInvitationsPanel({
  guests,
  project,
  theme,
}: {
  guests: Guest[]
  project: Project | null
  theme: any
}) {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<SendStep>('select')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Step 1 selection filters
  const [selSearch, setSelSearch] = useState('')
  const [selCategory, setSelCategory] = useState('all')

  // Step 2 compose
  const [channel, setChannel] = useState<SendChannel>('whatsapp')
  const [defaultTemplate, setDefaultTemplate] = useState(
    `Hi {name} ❤️,

I have some wonderful news to share! With the blessings of our families, I'm getting engaged, and it would mean so much to have you with me on this special day.

Here's my invitation with all the details:
{link}

Your presence and blessings would make this occasion even more special. I truly hope you can join me in celebrating this beautiful new chapter of my life.

Looking forward to seeing you! 😊`
  )
  const [overrides, setOverrides] = useState<Record<string, string>>({}) // guestId → custom msg
  const [previewGuestId, setPreviewGuestId] = useState<string>('')
  const [custSearch, setCustSearch] = useState('')
  const [custOpenId, setCustOpenId] = useState<string | null>(null) // expanded override

  // Step 3 review
  const [reviewIdx, setReviewIdx] = useState(0)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [openLinkCopied, setOpenLinkCopied] = useState(false)

  // ── Derived ─────────────────────────────────────────────────────────────────
  const categories = Array.from(new Set(guests.map((g) => g.guest_category || 'Other'))).sort()
  const selectedGuests = guests.filter((g) => selectedIds.has(g.id))

  const filteredForSelect = guests.filter((g) => {
    const matchCat = selCategory === 'all' || (g.guest_category || 'Other') === selCategory
    const term = selSearch.toLowerCase()
    const matchSearch = !term || g.name.toLowerCase().includes(term) || (g.phone || '').includes(term)
    return matchCat && matchSearch
  })

  const reviewGuests = selectedGuests
  const currentReviewGuest = reviewGuests[reviewIdx] ?? null

  // Set first preview guest when entering compose
  useEffect(() => {
    if (step === 'compose' && selectedGuests.length > 0 && !previewGuestId) {
      setPreviewGuestId(selectedGuests[0].id)
    }
  }, [step])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const buildMsg = (guest: Guest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/invite/${guest.unique_token}`
    const template = overrides[guest.id] ?? defaultTemplate
    return template.replace(/\{name\}/g, guest.name).replace(/\{link\}/g, link)
  }

  const doSend = (guest: Guest) => {
    const msg = buildMsg(guest)
    const enc = encodeURIComponent(msg)
    if (channel === 'whatsapp') {
      // Use api.whatsapp.com (not wa.me) — wa.me redirects corrupt 4-byte emoji to �
      const digits = (guest.phone || '').replace(/\D/g, '')
      const phone = digits
        ? digits.startsWith('91')
          ? digits
          : `91${digits}`
        : ''
      const url = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${enc}`
        : `https://api.whatsapp.com/send?text=${enc}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } else if (channel === 'sms') {
      window.open(`sms:${(guest.phone || '').replace(/\D/g, '')}?&body=${enc}`, '_blank')
    } else {
      const sub = encodeURIComponent(`You're invited to our ${project?.event_template ?? 'Wedding'}!`)
      window.open(`mailto:${guest.email || ''}?subject=${sub}&body=${enc}`, '_blank')
    }
    setSentIds((prev) => new Set([...prev, guest.id]))
  }

  const channelMeta = {
    whatsapp: { icon: '💬', label: 'WhatsApp', color: '#25D366', bg: '#F0FFF4', border: '#BBF7D0' },
    sms:      { icon: '📱', label: 'SMS',       color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
    email:    { icon: '📧', label: 'Email',     color: '#D72660', bg: '#FFF0F5', border: '#F9D0DC' },
  }
  const ch = channelMeta[channel]

  const stepOrder: SendStep[] = ['select', 'compose', 'review']
  const stepLabels = ['Select Guests', 'Compose Message', 'Review & Send']
  const stepIdx = stepOrder.indexOf(step)

  // ── Styles ───────────────────────────────────────────────────────────────────
  const card = { background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, boxShadow: '0 2px 16px rgba(31,41,55,0.06)' }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid #E5E7EB', background: '#F9FAFB',
    color: '#1F2937', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }
  const btnPrimary: React.CSSProperties = {
    padding: '10px 22px', background: '#D72660', border: 'none',
    borderRadius: 11, color: '#fff', fontWeight: 700, fontSize: 13,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    boxShadow: '0 4px 14px rgba(215,38,96,0.30)', transition: 'all 0.2s',
  }
  const btnSecondary: React.CSSProperties = {
    padding: '10px 22px', background: '#F3F4F6', border: '1.5px solid #E5E7EB',
    borderRadius: 11, color: '#6B7280', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'all 0.15s',
  }

  const openInviteUrl = project?.id && typeof window !== 'undefined'
    ? buildOpenInviteUrl(window.location.origin, project.id)
    : project?.id
      ? `/invite/open/${project.id}`
      : ''

  const copyOpenLink = () => {
    if (!project?.id) return
    const url = typeof window !== 'undefined'
      ? buildOpenInviteUrl(window.location.origin, project.id)
      : `/invite/open/${project.id}`
    navigator.clipboard.writeText(url)
    setOpenLinkCopied(true)
    setTimeout(() => setOpenLinkCopied(false), 2000)
  }

  const OpenInviteLinkBar = () => {
    if (!project?.id) return null
    return (
      <div style={{
        ...card,
        padding: '16px 20px',
        marginBottom: 20,
        background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
        border: '1.5px solid #BBF7D0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 220 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🔗</div>
            <div>
              <p style={{ color: '#14532D', fontWeight: 800, fontSize: 14, margin: 0 }}>
                Open invitation link
              </p>
              <p style={{ color: '#166534', fontSize: 12, margin: '4px 0 0', lineHeight: 1.5 }}>
                Share with anyone — no guest name, no RSVP or headcount. Unique to this project.
              </p>
              <p style={{
                color: '#15803D', fontSize: 11, margin: '8px 0 0', fontFamily: 'monospace',
                wordBreak: 'break-all', opacity: 0.85,
              }}>
                {openInviteUrl}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={copyOpenLink}
              style={{
                padding: '9px 16px', borderRadius: 10, border: '1.5px solid #86EFAC',
                background: openLinkCopied ? '#DCFCE7' : '#fff',
                color: openLinkCopied ? '#15803D' : '#166534',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {openLinkCopied ? '✓ Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => window.open(openInviteUrl, '_blank')}
              style={{
                padding: '9px 16px', borderRadius: 10, border: 'none',
                background: '#16A34A', color: '#fff',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 10px rgba(22,163,74,0.25)',
              }}
            >
              Preview ↗
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Header + Stepper ─────────────────────────────────────────────────────────
  const Header = () => (
    <div style={{
      background: 'linear-gradient(135deg, #D72660 0%, #7C3AED 100%)',
      borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden', marginBottom: 24,
    }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
      <div style={{ position:'absolute', bottom:-20, left:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <span style={{ fontSize:28 }}>📨</span>
          <div>
            <h2 style={{ color:'#fff', fontSize:20, fontWeight:800, margin:0, letterSpacing:'-0.3px' }}>Campaign Builder</h2>
            <p style={{ color:'rgba(255,255,255,0.72)', fontSize:13, margin:'3px 0 0' }}>
              Personalised bulk invitations via WhatsApp, SMS or Email
            </p>
          </div>
        </div>
        {/* Stepper */}
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          {stepLabels.map((label, i) => {
            const isDone = i < stepIdx
            const isActive = i === stepIdx
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0,
                    background: isDone ? '#fff' : isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                    color: isDone ? '#16A34A' : isActive ? '#D72660' : 'rgba(255,255,255,0.5)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:800, transition:'all 0.3s',
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize:12, fontWeight: isActive ? 700 : 500,
                    color: isActive || isDone ? '#fff' : 'rgba(255,255,255,0.55)',
                    whiteSpace:'nowrap',
                  }}>{label}</span>
                </div>
                {i < 2 && (
                  <div style={{
                    flex:1, height:2, margin:'0 12px',
                    background: isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                    borderRadius:999, transition:'background 0.3s',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── Sticky Selection Summary Bar ──────────────────────────────────────────────
  const SummaryBar = () => {
    if (step === 'select') return null
    return (
      <div style={{
        background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:14,
        padding:'12px 20px', marginBottom:20,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
        boxShadow:'0 2px 8px rgba(31,41,55,0.05)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:36, height:36, borderRadius:10, background:'#F4E7EC',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
          }}>👥</div>
          <div>
            <p style={{ color:'#1F2937', fontWeight:700, fontSize:14, margin:0 }}>
              {selectedIds.size} guest{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
            <p style={{ color:'#9CA3AF', fontSize:12, marginTop:2 }}>
              {Array.from(new Set(selectedGuests.map(g => g.guest_category || 'Other'))).join(', ') || 'No categories'}
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Category chips */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {Array.from(new Set(selectedGuests.map(g => g.guest_category || 'Other'))).slice(0, 3).map(cat => (
              <span key={cat} style={{
                background:'#F4E7EC', color:'#D72660', fontSize:11, fontWeight:600,
                padding:'3px 10px', borderRadius:999,
              }}>{cat}</span>
            ))}
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              padding:'7px 16px', background:'#F4E7EC', border:'1.5px solid #F9D0DC',
              borderRadius:10, color:'#D72660', fontWeight:700, fontSize:12,
              cursor:'pointer', display:'flex', alignItems:'center', gap:5,
              transition:'all 0.15s', flexShrink:0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9D0DC' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F4E7EC' }}
          >
            ✏️ Edit Selection
          </button>
        </div>
      </div>
    )
  }

  // ── Edit Drawer ───────────────────────────────────────────────────────────────
  const EditDrawer = () => {
    if (!drawerOpen) return null
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.45)', backdropFilter:'blur(4px)', zIndex:200 }}
        />
        {/* Drawer */}
        <div style={{
          position:'fixed', top:0, right:0, bottom:0, width:420,
          background:'#fff', zIndex:201, display:'flex', flexDirection:'column',
          boxShadow:'-8px 0 40px rgba(31,41,55,0.18)',
        }}>
          {/* Drawer header */}
          <div style={{ padding:'20px 24px', borderBottom:'1.5px solid #F3F4F6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <h3 style={{ color:'#1F2937', fontSize:16, fontWeight:800, margin:0 }}>Edit Guest Selection</h3>
              <p style={{ color:'#9CA3AF', fontSize:12, marginTop:3 }}>{selectedIds.size} of {guests.length} selected</p>
            </div>
            <button onClick={() => setDrawerOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:20, padding:4 }}>✕</button>
          </div>
          {/* Search + filter */}
          <div style={{ padding:'14px 24px', borderBottom:'1px solid #F3F4F6', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }}>🔍</span>
              <input
                value={selSearch} onChange={e => setSelSearch(e.target.value)}
                placeholder="Search guests…" style={{ ...inputStyle, paddingLeft:32 }}
              />
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['all', ...categories].map(cat => (
                <button key={cat} onClick={() => setSelCategory(cat)} style={{
                  padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid',
                  background: selCategory === cat ? '#D72660' : '#F9FAFB',
                  color: selCategory === cat ? '#fff' : '#6B7280',
                  borderColor: selCategory === cat ? '#D72660' : '#E5E7EB',
                }}>{cat === 'all' ? 'All' : cat}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setSelectedIds(new Set(filteredForSelect.map(g => g.id)))} style={{ ...btnSecondary, flex:1, justifyContent:'center', fontSize:12, padding:'7px' }}>
                ☑ Select All ({filteredForSelect.length})
              </button>
              <button onClick={() => {
                const next = new Set(selectedIds)
                filteredForSelect.forEach(g => next.delete(g.id))
                setSelectedIds(next)
              }} style={{ ...btnSecondary, flex:1, justifyContent:'center', fontSize:12, padding:'7px' }}>
                ☐ Deselect All
              </button>
            </div>
          </div>
          {/* Guest list */}
          <div style={{ flex:1, overflowY:'auto', padding:'8px 12px' }}>
            {filteredForSelect.map(g => {
              const checked = selectedIds.has(g.id)
              return (
                <div key={g.id} onClick={() => {
                  const next = new Set(selectedIds)
                  if (checked) next.delete(g.id); else next.add(g.id)
                  setSelectedIds(next)
                }} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'11px 12px', borderRadius:12, cursor:'pointer',
                  background: checked ? '#FFF0F5' : 'transparent',
                  border: checked ? '1px solid #F9D0DC' : '1px solid transparent',
                  marginBottom:4, transition:'all 0.15s',
                }}>
                  <div style={{
                    width:20, height:20, borderRadius:5, flexShrink:0, transition:'all 0.15s',
                    background: checked ? '#D72660' : '#fff',
                    border: checked ? '2px solid #D72660' : '2px solid #D1D5DB',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {checked && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
                  </div>
                  <div style={{
                    width:34, height:34, borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg, #F4E7EC, #FDE7EF)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:13, fontWeight:700, color:'#D72660',
                  }}>
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#1F2937', fontWeight:600, fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}</p>
                    <p style={{ color:'#9CA3AF', fontSize:11, marginTop:1 }}>{g.guest_category || 'Other'}{g.phone ? ` · ${g.phone}` : ''}</p>
                  </div>
                </div>
              )
            })}
            {filteredForSelect.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#9CA3AF', fontSize:13 }}>No guests match</div>
            )}
          </div>
          {/* Footer */}
          <div style={{ padding:'16px 24px', borderTop:'1.5px solid #F3F4F6', display:'flex', gap:10 }}>
            <button onClick={() => setDrawerOpen(false)} style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
              Done — {selectedIds.size} selected
            </button>
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 1 – SELECT GUESTS
  // ════════════════════════════════════════════════════════════════════
  if (step === 'select') {
    return (
      <div style={{ fontFamily:'inherit' }}>
        <Header />
        <OpenInviteLinkBar />
        <EditDrawer />
        <div style={{ ...card, padding:'24px 28px' }}>
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#F4E7EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👥</div>
              <div>
                <h3 style={{ color:'#1F2937', fontSize:15, fontWeight:700, margin:0 }}>Select Guests</h3>
                <p style={{ color:'#9CA3AF', fontSize:12, marginTop:2 }}>{selectedIds.size} selected · {guests.length} total</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setSelectedIds(new Set(filteredForSelect.map(g => g.id)))} style={{ ...btnSecondary, fontSize:12, padding:'7px 14px' }}>
                ☑ Select All
              </button>
              <button onClick={() => {
                const next = new Set(selectedIds)
                filteredForSelect.forEach(g => next.delete(g.id))
                setSelectedIds(next)
              }} style={{ ...btnSecondary, fontSize:12, padding:'7px 14px' }}>
                ☐ Deselect
              </button>
            </div>
          </div>

          {/* Search + Filter */}
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }}>🔍</span>
              <input
                value={selSearch} onChange={e => setSelSearch(e.target.value)}
                placeholder="Search by name or phone…"
                style={{ ...inputStyle, paddingLeft:32 }}
              />
            </div>
            <div style={{ position:'relative' }}>
              <select
                value={selCategory}
                onChange={e => setSelCategory(e.target.value)}
                style={{ ...inputStyle, width:'auto', paddingRight:30, cursor:'pointer', appearance:'none' }}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', pointerEvents:'none' }}>▾</span>
            </div>
          </div>

          {/* Category quick-select chips */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            {categories.map(cat => {
              const catGuests = guests.filter(g => (g.guest_category || 'Other') === cat)
              const allCatSelected = catGuests.every(g => selectedIds.has(g.id))
              return (
                <button key={cat} onClick={() => {
                  const next = new Set(selectedIds)
                  if (allCatSelected) catGuests.forEach(g => next.delete(g.id))
                  else catGuests.forEach(g => next.add(g.id))
                  setSelectedIds(next)
                }} style={{
                  padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:600,
                  cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
                  background: allCatSelected ? '#D72660' : '#F9FAFB',
                  color: allCatSelected ? '#fff' : '#6B7280',
                  borderColor: allCatSelected ? '#D72660' : '#E5E7EB',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  {allCatSelected ? '☑' : '☐'} {cat}
                  <span style={{
                    background: allCatSelected ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                    color: allCatSelected ? '#fff' : '#9CA3AF',
                    fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:999,
                  }}>{catGuests.length}</span>
                </button>
              )
            })}
          </div>

          {/* Guest list */}
          {guests.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 0', color:'#9CA3AF' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👤</div>
              <p style={{ fontSize:14 }}>No guests yet. Add guests first.</p>
            </div>
          ) : (
            <div style={{ maxHeight:380, overflowY:'auto', marginBottom:20, borderRadius:12, border:'1.5px solid #F3F4F6' }}>
              {filteredForSelect.map((g, idx) => {
                const checked = selectedIds.has(g.id)
                return (
                  <div key={g.id} onClick={() => {
                    const next = new Set(selectedIds)
                    if (checked) next.delete(g.id); else next.add(g.id)
                    setSelectedIds(next)
                  }} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                    cursor:'pointer', transition:'background 0.12s',
                    background: checked ? '#FFF0F5' : idx % 2 === 0 ? '#fff' : '#FAFAFA',
                    borderBottom: idx < filteredForSelect.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#F9FAFB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = checked ? '#FFF0F5' : idx % 2 === 0 ? '#fff' : '#FAFAFA' }}
                  >
                    <div style={{
                      width:20, height:20, borderRadius:5, flexShrink:0, transition:'all 0.15s',
                      background: checked ? '#D72660' : '#fff',
                      border: checked ? '2px solid #D72660' : '2px solid #D1D5DB',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {checked && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
                    </div>
                    <div style={{
                      width:36, height:36, borderRadius:'50%', flexShrink:0,
                      background:'linear-gradient(135deg, #F4E7EC, #FDE7EF)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, fontWeight:700, color:'#D72660',
                    }}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:'#1F2937', fontWeight:600, fontSize:14, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}</p>
                      <p style={{ color:'#9CA3AF', fontSize:12, marginTop:1 }}>{g.guest_category || 'Other'}{g.phone ? ` · ${g.phone}` : ''}</p>
                    </div>
                    <span style={{
                      background: g.rsvp_status === 'yes' ? '#DCFCE7' : g.rsvp_status === 'no' ? '#FEE2E2' : '#FEF3C7',
                      color: g.rsvp_status === 'yes' ? '#15803D' : g.rsvp_status === 'no' ? '#DC2626' : '#B45309',
                      fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                    }}>
                      {g.rsvp_status === 'yes' ? '✓ Going' : g.rsvp_status === 'no' ? '✗ Declined' : '⏳ Pending'}
                    </span>
                  </div>
                )
              })}
              {filteredForSelect.length === 0 && (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#9CA3AF', fontSize:13 }}>No guests match your search</div>
              )}
            </div>
          )}

          {/* Footer CTA */}
          {selectedIds.size > 0 && (
            <div style={{
              background:'linear-gradient(135deg, #FFF0F5, #FDE7EF)',
              border:'1px solid #F9D0DC', borderRadius:14, padding:'16px 20px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div>
                <p style={{ color:'#9B1C4C', fontWeight:800, fontSize:16, margin:0 }}>{selectedIds.size} guests selected</p>
                <p style={{ color:'#D72660', fontSize:12, marginTop:2 }}>
                  Ready to compose your message
                </p>
              </div>
              <button onClick={() => { setPreviewGuestId(''); setStep('compose') }} style={btnPrimary}>
                Compose Message →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 2 – COMPOSE (Channel + Message Template + Live Preview)
  // ════════════════════════════════════════════════════════════════════
  if (step === 'compose') {
    const previewGuest = guests.find(g => g.id === previewGuestId) ?? selectedGuests[0] ?? null

    return (
      <div style={{ fontFamily:'inherit' }}>
        <Header />
        <OpenInviteLinkBar />
        <EditDrawer />
        <SummaryBar />

        {/* Two-column layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

          {/* ── Left: Channel + Template ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Channel picker */}
            <div style={{ ...card, padding:'20px 24px' }}>
              <h3 style={{ color:'#1F2937', fontSize:14, fontWeight:700, margin:'0 0 14px' }}>📡 Send via</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(['whatsapp', 'sms', 'email'] as SendChannel[]).map(ch => {
                  const m = channelMeta[ch]
                  const isActive = channel === ch
                  return (
                    <button key={ch} onClick={() => setChannel(ch)} style={{
                      display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
                      borderRadius:12, cursor:'pointer', textAlign:'left',
                      border: isActive ? `2px solid ${m.color}` : '1.5px solid #E5E7EB',
                      background: isActive ? m.bg : '#FAFAFA',
                      transition:'all 0.2s', boxShadow: isActive ? `0 2px 12px ${m.color}20` : 'none',
                    }}>
                      <span style={{ fontSize:20 }}>{m.icon}</span>
                      <span style={{ flex:1, color:'#1F2937', fontSize:14, fontWeight:600 }}>{m.label}</span>
                      <div style={{
                        width:18, height:18, borderRadius:'50%', flexShrink:0,
                        border: isActive ? `5px solid ${m.color}` : '2px solid #D1D5DB',
                        background: '#fff', transition:'all 0.2s',
                      }} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Template editor */}
            <div style={{ ...card, padding:'20px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <h3 style={{ color:'#1F2937', fontSize:14, fontWeight:700, margin:0 }}>✏️ Default Message Template</h3>
                <div style={{ display:'flex', gap:6 }}>
                  {['{name}', '{link}'].map(v => (
                    <button key={v} onClick={() => {
                      const ta = document.getElementById('template-ta') as HTMLTextAreaElement
                      if (ta) {
                        const start = ta.selectionStart, end = ta.selectionEnd
                        const next = defaultTemplate.slice(0, start) + v + defaultTemplate.slice(end)
                        setDefaultTemplate(next)
                        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + v.length, start + v.length) }, 0)
                      }
                    }} style={{
                      padding:'3px 10px', background:'#EEF2FF', border:'1px solid #C7D2FE',
                      borderRadius:6, color:'#4F46E5', fontSize:11, fontWeight:700, cursor:'pointer',
                    }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                id="template-ta"
                value={defaultTemplate}
                onChange={e => setDefaultTemplate(e.target.value)}
                rows={8}
                style={{ ...inputStyle, resize:'vertical', lineHeight:1.7, fontFamily:'inherit' }}
              />
              <p style={{ color:'#9CA3AF', fontSize:11, marginTop:6 }}>
                Use <code style={{ background:'#F3F4F6', padding:'1px 4px', borderRadius:4 }}>{'{name}'}</code> and{' '}
                <code style={{ background:'#F3F4F6', padding:'1px 4px', borderRadius:4 }}>{'{link}'}</code> as placeholders.
              </p>
            </div>

            {/* Per-guest overrides */}
            <div style={{ ...card, padding:'20px 24px' }}>
              <h3 style={{ color:'#1F2937', fontSize:14, fontWeight:700, margin:'0 0 10px' }}>🎯 Customise Individual Guests</h3>
              <p style={{ color:'#9CA3AF', fontSize:12, margin:'0 0 12px' }}>
                Override the default template for specific guests. Others use the default.
              </p>
              <div style={{ position:'relative', marginBottom:12 }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:13 }}>🔍</span>
                <input
                  value={custSearch} onChange={e => setCustSearch(e.target.value)}
                  placeholder="Search guest to customise…"
                  style={{ ...inputStyle, paddingLeft:30, fontSize:12 }}
                />
              </div>
              <div style={{ maxHeight:240, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                {selectedGuests
                  .filter(g => !custSearch || g.name.toLowerCase().includes(custSearch.toLowerCase()))
                  .map(g => {
                    const hasOverride = !!overrides[g.id]
                    const isOpen = custOpenId === g.id
                    return (
                      <div key={g.id} style={{ border:'1.5px solid', borderRadius:10, transition:'all 0.2s',
                        borderColor: hasOverride ? '#C7D2FE' : '#F3F4F6',
                        background: hasOverride ? '#F5F3FF' : '#FAFAFA',
                      }}>
                        <div
                          onClick={() => setCustOpenId(isOpen ? null : g.id)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer' }}
                        >
                          <div style={{
                            width:28, height:28, borderRadius:'50%', flexShrink:0,
                            background: hasOverride ? 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' : 'linear-gradient(135deg, #F4E7EC, #FDE7EF)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:11, fontWeight:800, color: hasOverride ? '#4F46E5' : '#D72660',
                          }}>
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#1F2937' }}>{g.name}</span>
                          {hasOverride && (
                            <span style={{ background:'#EEF2FF', color:'#4F46E5', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>
                              Custom
                            </span>
                          )}
                          <span style={{ color:'#9CA3AF', fontSize:14 }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                        {isOpen && (
                          <div style={{ padding:'0 14px 12px', borderTop:'1px solid #F3F4F6' }}>
                            <textarea
                              value={overrides[g.id] ?? defaultTemplate}
                              onChange={e => setOverrides(prev => ({ ...prev, [g.id]: e.target.value }))}
                              rows={5}
                              style={{ ...inputStyle, marginTop:10, resize:'none', fontSize:12, lineHeight:1.6 }}
                            />
                            {overrides[g.id] && (
                              <button onClick={() => {
                                const next = { ...overrides }; delete next[g.id]; setOverrides(next)
                              }} style={{ marginTop:6, background:'none', border:'none', color:'#9CA3AF', fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
                                Reset to default
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div style={{ position:'sticky', top:80 }}>
            <div style={{ ...card, padding:'20px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <h3 style={{ color:'#1F2937', fontSize:14, fontWeight:700, margin:0 }}>👁️ Live Preview</h3>
                <span style={{ background: ch.bg, color: ch.color, fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:999, border:`1px solid ${ch.border}` }}>
                  {ch.icon} {ch.label}
                </span>
              </div>
              {/* Guest selector */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                {selectedGuests.slice(0, 8).map(g => (
                  <button key={g.id} onClick={() => setPreviewGuestId(g.id)} style={{
                    padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                    cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
                    background: previewGuestId === g.id ? ch.color : '#F3F4F6',
                    color: previewGuestId === g.id ? '#fff' : '#6B7280',
                    borderColor: previewGuestId === g.id ? ch.color : '#E5E7EB',
                  }}>
                    {g.name.split(' ')[0]}
                  </button>
                ))}
                {selectedGuests.length > 8 && (
                  <span style={{ padding:'5px 10px', color:'#9CA3AF', fontSize:12 }}>+{selectedGuests.length - 8} more</span>
                )}
              </div>
              {previewGuest ? (
                <>
                  {/* Phone/message mockup */}
                  <div style={{
                    background:'#075E54', borderRadius:16, padding:'12px',
                    boxShadow:'0 8px 32px rgba(7,94,84,0.25)', marginBottom:14,
                  }}>
                    <div style={{
                      background:'#DCF8C6', borderRadius:'12px 12px 4px 12px',
                      padding:'12px 14px', maxWidth:'90%', marginLeft:'auto',
                    }}>
                      <pre style={{
                        margin:0, fontSize:12.5, lineHeight:1.65, color:'#1F2937',
                        whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'inherit',
                      }}>
                        {buildMsg(previewGuest)}
                      </pre>
                      <p style={{ color:'#9CA3AF', fontSize:10, textAlign:'right', margin:'6px 0 0' }}>
                        {new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} ✓✓
                      </p>
                    </div>
                  </div>
                  {/* Guest chip */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F9FAFB', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{
                      width:32, height:32, borderRadius:'50%', flexShrink:0,
                      background:'linear-gradient(135deg, #F4E7EC, #FDE7EF)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:13, fontWeight:700, color:'#D72660',
                    }}>
                      {previewGuest.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'#1F2937', margin:0 }}>{previewGuest.name}</p>
                      <p style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>
                        {overrides[previewGuest.id] ? '🎯 Custom message' : '📄 Default template'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#9CA3AF' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>👆</div>
                  <p style={{ fontSize:13 }}>Select a guest above to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
          <button onClick={() => setStep('select')} style={btnSecondary}>← Back</button>
          <button onClick={() => { setReviewIdx(0); setStep('review') }} disabled={selectedIds.size === 0} style={{ ...btnPrimary, opacity: selectedIds.size === 0 ? 0.5 : 1 }}>
            Review & Send →
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 3 – REVIEW & SEND (Carousel / instant switch)
  // ════════════════════════════════════════════════════════════════════
  const reviewGuest = reviewGuests[reviewIdx] ?? null
  const sentCount = sentIds.size
  const allSent = sentCount >= selectedGuests.length && selectedGuests.length > 0

  return (
    <div style={{ fontFamily:'inherit' }}>
      <Header />
      <OpenInviteLinkBar />
      <EditDrawer />
      <SummaryBar />

      {/* Progress */}
      <div style={{ ...card, padding:'20px 24px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>{ch.icon}</span>
            <div>
              <p style={{ color:'#1F2937', fontWeight:700, fontSize:14, margin:0 }}>
                Sending via {ch.label}
              </p>
              <p style={{ color:'#9CA3AF', fontSize:12, marginTop:2 }}>{sentCount} of {selectedGuests.length} sent</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{
              background: allSent ? '#DCFCE7' : '#F4E7EC', color: allSent ? '#15803D' : '#D72660',
              fontSize:13, fontWeight:700, padding:'5px 14px', borderRadius:999,
              border: `1px solid ${allSent ? '#BBF7D0' : '#F9D0DC'}`,
            }}>
              {allSent ? '🎉 All sent!' : `${selectedGuests.length - sentCount} remaining`}
            </span>
            {allSent && (
              <button onClick={() => {
                setSentIds(new Set()); setReviewIdx(0); setSelectedIds(new Set())
                setOverrides({}); setStep('select')
              }} style={btnPrimary}>
                New Campaign
              </button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height:8, background:'#F3F4F6', borderRadius:999, overflow:'hidden' }}>
          <div style={{
            height:'100%', background:`linear-gradient(90deg, ${ch.color}, #D72660)`,
            borderRadius:999, transition:'width 0.5s ease',
            width: selectedGuests.length > 0 ? `${(sentCount / selectedGuests.length) * 100}%` : '0%',
          }} />
        </div>
      </div>

      {/* Two-column: guest list + preview */}
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20, alignItems:'start' }}>

        {/* ── Left: Guest carousel list ── */}
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F3F4F6' }}>
            <p style={{ color:'#1F2937', fontSize:13, fontWeight:700, margin:0 }}>Guest Queue</p>
            <p style={{ color:'#9CA3AF', fontSize:11, marginTop:2 }}>{selectedGuests.length} guests</p>
          </div>
          <div style={{ maxHeight:480, overflowY:'auto' }}>
            {reviewGuests.map((g, idx) => {
              const isSent = sentIds.has(g.id)
              const isActive = idx === reviewIdx
              return (
                <div
                  key={g.id}
                  onClick={() => setReviewIdx(idx)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, padding:'11px 16px',
                    cursor:'pointer', transition:'all 0.15s',
                    background: isActive ? '#FFF0F5' : 'transparent',
                    borderLeft: isActive ? `3px solid #D72660` : '3px solid transparent',
                    borderBottom:'1px solid #F9FAFB',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F9FAFB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? '#FFF0F5' : 'transparent' }}
                >
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{
                      width:32, height:32, borderRadius:'50%',
                      background: isSent ? 'linear-gradient(135deg, #DCFCE7, #BBF7D0)' : 'linear-gradient(135deg, #F4E7EC, #FDE7EF)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, color: isSent ? '#15803D' : '#D72660',
                    }}>
                      {isSent ? '✓' : g.name.charAt(0).toUpperCase()}
                    </div>
                    {overrides[g.id] && (
                      <div style={{
                        position:'absolute', top:-2, right:-2, width:10, height:10,
                        borderRadius:'50%', background:'#6366F1', border:'2px solid #fff',
                      }} />
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color: isSent ? '#6B7280' : '#1F2937', fontSize:12, fontWeight:600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: isSent ? 'line-through' : 'none' }}>
                      {g.name}
                    </p>
                    <p style={{ color:'#9CA3AF', fontSize:10, marginTop:1 }}>{g.guest_category || 'Other'}</p>
                  </div>
                  {isSent && <span style={{ color:'#16A34A', fontSize:14, flexShrink:0 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: Preview + Send ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {reviewGuest ? (
            <>
              {/* Guest info card */}
              <div style={{ ...card, padding:'18px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{
                    width:52, height:52, borderRadius:'50%', flexShrink:0,
                    background:`linear-gradient(135deg, ${ch.color}20, ${ch.color}10)`,
                    border:`2px solid ${ch.color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:20, fontWeight:800, color:ch.color,
                  }}>
                    {reviewGuest.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <p style={{ color:'#1F2937', fontWeight:800, fontSize:16, margin:0 }}>{reviewGuest.name}</p>
                      {overrides[reviewGuest.id] && (
                        <span style={{ background:'#EEF2FF', color:'#4F46E5', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>Custom</span>
                      )}
                      {sentIds.has(reviewGuest.id) && (
                        <span style={{ background:'#DCFCE7', color:'#15803D', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>✓ Sent</span>
                      )}
                    </div>
                    <p style={{ color:'#9CA3AF', fontSize:13, marginTop:3 }}>
                      {reviewGuest.guest_category || 'Other'}
                      {reviewGuest.phone ? ` · ${reviewGuest.phone}` : ''}
                      {reviewGuest.email ? ` · ${reviewGuest.email}` : ''}
                      {` · Guest ${reviewIdx + 1} of ${selectedGuests.length}`}
                    </p>
                  </div>
                  {/* Prev/next */}
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))} disabled={reviewIdx === 0}
                      style={{ ...btnSecondary, padding:'8px 14px', opacity: reviewIdx === 0 ? 0.4 : 1 }}>←</button>
                    <button onClick={() => setReviewIdx(Math.min(reviewGuests.length - 1, reviewIdx + 1))} disabled={reviewIdx >= reviewGuests.length - 1}
                      style={{ ...btnSecondary, padding:'8px 14px', opacity: reviewIdx >= reviewGuests.length - 1 ? 0.4 : 1 }}>→</button>
                  </div>
                </div>
              </div>

              {/* Message preview – WhatsApp mockup */}
              <div style={{ ...card, padding:'20px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <h3 style={{ color:'#1F2937', fontSize:13, fontWeight:700, margin:0 }}>Message Preview</h3>
                  <span style={{ background:ch.bg, color:ch.color, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, border:`1px solid ${ch.border}` }}>
                    {ch.icon} {ch.label}
                  </span>
                </div>
                <div style={{
                  background:'#ECE5DD', borderRadius:14, padding:'16px',
                  boxShadow:'inset 0 2px 8px rgba(0,0,0,0.05)', marginBottom:14,
                }}>
                  <div style={{
                    background:'#fff', borderRadius:'12px 12px 4px 12px', padding:'12px 16px',
                    maxWidth:'85%', marginLeft:'auto', boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    <pre style={{
                      margin:0, fontSize:13, lineHeight:1.7, color:'#1F2937',
                      whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'inherit',
                    }}>
                      {buildMsg(reviewGuest)}
                    </pre>
                    <p style={{ color:'#9CA3AF', fontSize:10, textAlign:'right', margin:'8px 0 0', display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end' }}>
                      {new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      <span style={{ color: sentIds.has(reviewGuest.id) ? '#34B7F1' : '#9CA3AF', fontSize:13 }}>✓✓</span>
                    </p>
                  </div>
                </div>

                {/* Send button */}
                <button
                  onClick={() => {
                    doSend(reviewGuest)
                    // Auto-advance to next unsent guest
                    const nextUnsent = reviewGuests.findIndex((g, i) => i > reviewIdx && !sentIds.has(g.id))
                    if (nextUnsent !== -1) setTimeout(() => setReviewIdx(nextUnsent), 400)
                  }}
                  style={{
                    width:'100%', padding:'13px', border:'none', borderRadius:12,
                    background: sentIds.has(reviewGuest.id) ? '#F3F4F6' : ch.color,
                    color: sentIds.has(reviewGuest.id) ? '#9CA3AF' : '#fff',
                    fontWeight:700, fontSize:15, cursor:'pointer',
                    boxShadow: sentIds.has(reviewGuest.id) ? 'none' : `0 4px 16px ${ch.color}40`,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!sentIds.has(reviewGuest.id)) e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  {sentIds.has(reviewGuest.id) ? (
                    <><span>✓</span> Sent – Send Again</>
                  ) : (
                    <><span>{ch.icon}</span> Send via {ch.label}</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={{ ...card, padding:'60px 24px', textAlign:'center', color:'#9CA3AF' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
              <p style={{ fontSize:15, fontWeight:700, color:'#1F2937' }}>All done!</p>
              <p style={{ fontSize:13 }}>All selected guests have been sent invitations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
        <button onClick={() => setStep('compose')} style={btnSecondary}>← Back to Compose</button>
        {!allSent && (
          <button
            onClick={() => {
              // Send all remaining in sequence
              reviewGuests.filter(g => !sentIds.has(g.id)).forEach((g, i) => {
                setTimeout(() => doSend(g), i * 800)
              })
            }}
            style={{ ...btnPrimary, background:'#7C3AED', boxShadow:'0 4px 14px rgba(124,58,237,0.35)' }}
          >
            ⚡ Send All Remaining ({selectedGuests.length - sentCount})
          </button>
        )}
      </div>
    </div>
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
  const prevGuestsRef = useRef<Record<string, string>>({})
  const projectNameRef = useRef<string>('')
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
  const [galleryImages, setGalleryImages] = useState<MediaItem[]>([])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError, setGalleryError] = useState('')
  const [lastAddedGuest, setLastAddedGuest] = useState<Guest | null>(null)
  const [lastAddedMoments, setLastAddedMoments] = useState<MediaItem[]>([])
  const [momentsUploading, setMomentsUploading] = useState(false)
  const [momentsError, setMomentsError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [momentsGuest, setMomentsGuest] = useState<Guest | null>(null)
  const [inviteGuest, setInviteGuest] = useState<Guest | null>(null)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCategory, setEditCategory] = useState('Friends')
  const [editPhoneError, setEditPhoneError] = useState('')
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const tabsListRef = useRef<HTMLDivElement>(null)

  // Keep the active navbar tab in view when switching on narrow screens
  useEffect(() => {
    const list = tabsListRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[data-state="active"]')
    if (!active) return
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeTab])

  // ── Send Invitations: all state now lives inside SendInvitationsPanel ─────────

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    const [guestRes, projectRes, galleryRes] = await Promise.all([
      fetch(`/api/projects/${projectId}/guests`),
      fetch(`/api/projects/${projectId}/event`),
      fetch(`/api/projects/${projectId}/gallery`),
    ])

    if (guestRes.ok) {
      const newGuests: Guest[] = await guestRes.json()

      // ── Detect RSVP status changes since last poll ──────────────────────
      const prev = prevGuestsRef.current
      if (Object.keys(prev).length > 0) {
        newGuests.forEach((g) => {
          if (prev[g.id] === 'pending' && g.rsvp_status !== 'pending') {
            const isYes = g.rsvp_status === 'yes'
            addNotification({
              type: isYes ? 'rsvp_yes' : 'rsvp_no',
              title: isYes ? 'Guest Confirmed! 🎉' : 'Guest Declined',
              message: `${g.name} has ${isYes ? 'confirmed attendance' : 'declined the invitation'}${
                projectNameRef.current ? ` for ${projectNameRef.current}` : ''
              }.`,
              projectName: projectNameRef.current || undefined,
              guestName: g.name,
              projectId,
            })
            playNotificationSound(isYes ? 'success' : 'warning')
          }
        })
      }
      // Update snapshot for next comparison
      const snap: Record<string, string> = {}
      newGuests.forEach((g) => { snap[g.id] = g.rsvp_status })
      prevGuestsRef.current = snap

      setGuests(newGuests)
    }

    if (projectRes.ok) {
      const proj = await projectRes.json()
      projectNameRef.current = proj.name || ''
      setProject(proj)
    }

    if (galleryRes.ok) {
      const gallery = await galleryRes.json()
      setGalleryImages(parseMediaList(gallery.images))
    }

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
      // Update snapshot so this guest isn't treated as new on next poll
      prevGuestsRef.current[data.id] = 'pending'
      setLastAddedGuest(data)
      setLastAddedMoments(parseMediaList(data.moments))
      setMomentsError('')
      addNotification({
        type: 'guest_added',
        title: 'Guest Added ✓',
        message: `${newGuestName} has been added to the guest list.`,
        projectName: projectNameRef.current || undefined,
        guestName: newGuestName,
        projectId,
      })
      playNotificationSound('success')
      setNewGuestName('')
      setNewGuestPhone('')
      setAddGuestError('')
    }
    setAdding(false)
  }

  const uploadGalleryFiles = async (files: File[]) => {
    setGalleryUploading(true)
    setGalleryError('')
    try {
      let next = galleryImages
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch(`/api/projects/${projectId}/gallery`, { method: 'POST', body: form })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        next = parseMediaList(data.images)
        setGalleryImages(next)
      }
    } catch (e) {
      setGalleryError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setGalleryUploading(false)
    }
  }

  const removeGalleryImage = async (imageId: string) => {
    setGalleryError('')
    const res = await fetch(
      `/api/projects/${projectId}/gallery?imageId=${encodeURIComponent(imageId)}`,
      { method: 'DELETE' },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setGalleryError(data.error || 'Delete failed')
      return
    }
    setGalleryImages(parseMediaList(data.images))
  }

  const uploadLastAddedMoments = async (files: File[]) => {
    if (!lastAddedGuest) return
    setMomentsUploading(true)
    setMomentsError('')
    try {
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch(
          `/api/projects/${projectId}/guests/${lastAddedGuest.id}/moments`,
          { method: 'POST', body: form },
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        const next = parseMediaList(data.moments)
        setLastAddedMoments(next)
        setGuests((prev) =>
          prev.map((g) =>
            g.id === lastAddedGuest.id
              ? { ...g, moments: next, moments_count: next.length }
              : g,
          ),
        )
      }
    } catch (e) {
      setMomentsError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setMomentsUploading(false)
    }
  }

  const removeLastAddedMoment = async (imageId: string) => {
    if (!lastAddedGuest) return
    setMomentsError('')
    const res = await fetch(
      `/api/projects/${projectId}/guests/${lastAddedGuest.id}/moments?imageId=${encodeURIComponent(imageId)}`,
      { method: 'DELETE' },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMomentsError(data.error || 'Delete failed')
      return
    }
    const next = parseMediaList(data.moments)
    setLastAddedMoments(next)
    setGuests((prev) =>
      prev.map((g) =>
        g.id === lastAddedGuest.id
          ? { ...g, moments: next, moments_count: next.length }
          : g,
      ),
    )
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

  const openEditGuest = (guest: Guest) => {
    setEditGuest(guest)
    setEditName(guest.name)
    setEditPhone((guest.phone || '').replace(/\D/g, '').slice(0, 10))
    setEditCategory(guest.guest_category || 'Other')
    setEditPhoneError('')
    setEditError('')
  }

  const saveEditGuest = async () => {
    if (!editGuest) return
    const name = editName.trim()
    if (!name) {
      setEditError('Guest name is required')
      return
    }
    if (editPhone.length > 0 && editPhone.length < 10) {
      setEditPhoneError('Phone number must be exactly 10 digits')
      return
    }

    setSavingEdit(true)
    setEditError('')
    const res = await fetch(`/api/projects/${projectId}/guests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editGuest.id,
        name,
        phone: editPhone,
        guest_category: editCategory,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSavingEdit(false)

    if (!res.ok) {
      setEditError(data.error || 'Failed to update guest')
      return
    }

    const updated: Guest = { ...editGuest, ...data, name, phone: editPhone || undefined, guest_category: editCategory }
    setGuests((prev) => prev.map((g) => (g.id === editGuest.id ? { ...g, ...updated } : g)))
    if (lastAddedGuest?.id === editGuest.id) setLastAddedGuest((prev) => (prev ? { ...prev, ...updated } : prev))
    if (momentsGuest?.id === editGuest.id) setMomentsGuest((prev) => (prev ? { ...prev, ...updated } : prev))
    if (inviteGuest?.id === editGuest.id) setInviteGuest((prev) => (prev ? { ...prev, ...updated } : prev))
    setEditGuest(null)
  }

  const updateProject = async (updates: Partial<Project>) => {
    const res = await fetch(`/api/projects/${projectId}/event`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Failed to update project')
      return
    }
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
          addNotification({
            type: 'bulk_import',
            title: `Import Complete 📥`,
            message: result.message || `Successfully imported ${result.count} guest${result.count !== 1 ? 's' : ''}.`,
            projectName: projectNameRef.current || undefined,
            projectId,
          })
          playNotificationSound('info')
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
    if (!project) return
    const origin = window.location.origin
    const columns = guestExportColumnOrder(project)
    const rows = buildGuestExportRows(guests, project, origin).map((row) => {
      const ordered: Record<string, string | number> = {}
      for (const col of columns) ordered[col] = row[col] ?? ''
      return ordered
    })
    const ws = XLSX.utils.json_to_sheet(rows, { header: columns })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Guests')
    XLSX.writeFile(wb, `${project?.name ?? 'guests'}-links.xlsx`)
  }

  const handleExportCSV = () => {
    if (!project) return
    const origin = window.location.origin
    const columns = guestExportColumnOrder(project)
    const rows = buildGuestExportRows(guests, project, origin)
    const escape = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const header = columns.join(',')
    const body = rows.map((row) => columns.map((col) => escape(row[col] ?? '')).join(','))
    const csv = [header, ...body].join('\n')
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

  const theme = getDashboardTheme(project?.event_template)

  if (loading) {
    return (
      <main className={`${theme.pageBg} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-10 h-10 rounded-full border-4 animate-spin ${theme.loadingSpinner}`} />
          <p className="text-sm text-gray-400">Loading project…</p>
        </div>
      </main>
    )
  }

  return (
    <main className={theme.pageBg}>

      {/* ── Sticky header ── */}
      <div className={`bg-white/60 backdrop-blur-2xl border-b sticky top-0 z-20 ${theme.headerBorder}`}
        style={{ boxShadow: '0 8px 32px rgba(31,41,55,0.06), inset 0 1px 0 rgba(255,255,255,0.7)' }}>

        {/* Top accent line */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, #D72660 0%, #9B1C4C 40%, #7C3AED 100%)`,
        }} />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

            {/* ── Left: Back + Brand ── */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">

              {/* Back button */}
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-1.5 sm:gap-2 transition-all shrink-0"
                style={{
                  padding: '8px 10px', borderRadius: 10,
                  border: '1.5px solid #E5E7EB', background: '#FAFAFA',
                  color: '#6B7280', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#374151' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                aria-label="Back to projects"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span className="hidden sm:inline">Projects</span>
              </button>

              {/* Divider */}
              <div className="hidden sm:block" style={{ width: 1, height: 36, background: '#E5E7EB', flexShrink: 0 }} />

              {/* Event icon */}
              <div
                className={`shrink-0 hidden sm:flex ${theme.iconGradient}`}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  boxShadow: '0 4px 14px rgba(215,38,96,0.25)',
                }}
              >
                {({
                  'Wedding': '💍', 'Engagement': '💑', 'Reception': '🥂',
                  'Mehendi': '🌿', 'Haldi': '🌼', 'Save The Date': '📅',
                  'Birthday': '🎂', 'Housewarming': '🏡',
                  'Corporate Event': '🏢', 'Custom Event': '✨',
                } as Record<string, string>)[project?.event_template ?? 'Wedding'] ?? '💍'}
              </div>

              {/* Title block */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 style={{ color: '#111827', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2 }} className="truncate text-[15px] sm:text-[17px]">
                    {project?.name || 'Project Dashboard'}
                  </h1>
                  {/* Event type badge */}
                  <span style={{
                    background: '#F4E7EC', color: '#D72660',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 999, letterSpacing: '0.04em', flexShrink: 0,
                    border: '1px solid #F9D0DC',
                  }}>
                    {project?.event_template?.toUpperCase() ?? 'WEDDING'}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px] sm:text-xs mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
                  <span className="truncate max-w-full">
                    {project?.event_template === 'Birthday' && project?.couple_1
                      ? formatBirthdayPersonsDisplay(project.couple_1, project.couple_2)
                      : project?.couple_1 && project?.couple_2
                        ? `${project.couple_1} & ${project.couple_2}`
                        : project?.couple_1 || 'Invitation & RSVP Management'}
                  </span>
                  {projectDateStr && (
                    <>
                      <span className="text-gray-300 hidden sm:inline">·</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="truncate max-w-[180px] sm:max-w-none">{projectDateStr}</span>
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">

              {/* Live indicator */}
              <div className="hidden lg:flex items-center gap-2" style={{
                padding: '6px 12px', borderRadius: 999,
                background: '#F0FDF4', border: '1px solid #BBF7D0',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#16A34A',
                  boxShadow: '0 0 0 2px rgba(22,163,74,0.25)',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#15803D' }}>
                  {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live'}
                </span>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-gray-200 bg-[#FAFAFA] text-gray-500 text-[13px] font-semibold h-9 w-9 sm:w-auto sm:px-3.5"
                style={{ opacity: refreshing ? 0.6 : 1 }}
                aria-label={refreshing ? 'Refreshing' : 'Refresh'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>

              {/* Notification bell */}
              <NotificationSystem />

              {/* Divider */}
              <div className="hidden sm:block" style={{ width: 1, height: 28, background: '#E5E7EB' }} />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-gray-200 bg-[#FAFAFA] text-gray-500 text-[13px] font-semibold h-9 w-9 sm:w-auto sm:px-3.5"
                aria-label="Sign out"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>

          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>


      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <style>{`
          .admin-tabs-scroll,
          .admin-table-scroll,
          .admin-table-scroll [data-slot='table-container'] {
            scrollbar-width: thin;
            scrollbar-color: #D1D5DB #F3F4F6;
          }
          .admin-tabs-scroll::-webkit-scrollbar,
          .admin-table-scroll::-webkit-scrollbar,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          .admin-tabs-scroll::-webkit-scrollbar-track,
          .admin-table-scroll::-webkit-scrollbar-track,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 999px;
          }
          .admin-tabs-scroll::-webkit-scrollbar-thumb,
          .admin-table-scroll::-webkit-scrollbar-thumb,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 999px;
            border: 2px solid #F3F4F6;
          }
          .admin-tabs-scroll::-webkit-scrollbar-thumb:hover,
          .admin-table-scroll::-webkit-scrollbar-thumb:hover,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
          .admin-table-scroll [data-slot='table-container'] {
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
          }
        `}</style>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab bar — scrolls; active tab centers into view */}
          <TabsList
            ref={tabsListRef}
            className={`admin-tabs-scroll flex w-full max-w-full overflow-x-auto justify-start bg-white/45 backdrop-blur-xl shadow-[0_8px_28px_rgba(31,41,55,0.06)] border rounded-2xl p-1.5 mb-2 gap-0.5 h-auto min-h-11 ${theme.tabsListBorder}`}
          >
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'guests', label: `Guest List${stats.total > 0 ? ` (${stats.total})` : ''}` },
              { value: 'add-guest', label: 'Add Guest' },
              { value: 'import-export', label: 'Import / Export' },
              { value: 'send', label: '📨 Send Invitations' },
              { value: 'event', label: 'Event Details' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`flex-shrink-0 px-4 rounded-xl text-sm transition-all duration-300 data-[state=inactive]:hover:bg-white/50 ${theme.tabActive}`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="mb-5 text-[11px] text-gray-400 sm:hidden">Swipe or scroll the tabs for more sections</p>

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="overview" className="space-y-6">

            {/* Hero — Response Rate */}
            <div className={theme.heroClassName} style={theme.heroStyle}>
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <p className={`${theme.heroMutedText} text-xs font-semibold uppercase tracking-widest mb-1`}>Overall Response Rate</p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl font-bold tabular-nums">{stats.responseRate}%</span>
                    <span className={`${theme.heroMutedText} text-sm mb-2`}>{responded} of {stats.total} guests responded</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                    {stats.confirmed > 0 && <div className="bg-emerald-400 rounded-l-full transition-all duration-700" style={{ width: `${stats.confirmedRate}%` }} />}
                    {stats.declined > 0 && <div className="bg-red-400 transition-all duration-700" style={{ width: `${stats.declinedRate}%` }} />}
                    {stats.pending > 0 && <div className="bg-amber-300 rounded-r-full transition-all duration-700" style={{ width: `${stats.pendingRate}%` }} />}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className={`text-xs ${theme.heroMutedText} flex items-center gap-1`}><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Confirmed</span>
                    <span className={`text-xs ${theme.heroMutedText} flex items-center gap-1`}><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Declined</span>
                    <span className={`text-xs ${theme.heroMutedText} flex items-center gap-1`}><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" /> Pending</span>
                  </div>
                </div>
                <div className="flex gap-0 md:flex-col md:gap-0 border border-white/25 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  {[
                    { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-300', bg: 'bg-white/5' },
                    { label: 'Declined', value: stats.declined, color: 'text-red-300', bg: 'bg-white/10' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-300', bg: 'bg-white/5' },
                    { label: 'Attendees', value: stats.totalPax, color: 'text-white', bg: 'bg-white/10' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} px-6 py-3 text-center flex md:flex-row items-center gap-3`}>
                      <span className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</span>
                      <span className={`${theme.heroMutedText} text-xs`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6 Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
              <StatCard label="Total Invited" value={stats.total} sub="Unique invitations sent" icon="💌" accent="border-violet-400" textColor="text-violet-700" iconBg="bg-violet-50" />
              <StatCard label="Invite Opened" value={stats.opened} sub={`${stats.openRate}% open rate`} icon="👁️" accent="border-blue-400" textColor="text-blue-700" iconBg="bg-blue-50" />
              <StatCard label="Confirmed" value={stats.confirmed} sub={`${stats.confirmedRate}% acceptance`} icon="✅" accent="border-emerald-400" textColor="text-emerald-700" iconBg="bg-emerald-50" />
              <StatCard label="Declined" value={stats.declined} sub="Sent their regrets" icon="❌" accent="border-red-400" textColor="text-red-600" iconBg="bg-red-50" />
              <StatCard label="Awaiting Reply" value={stats.pending} sub="Haven't responded yet" icon="⏳" accent="border-amber-400" textColor="text-amber-600" iconBg="bg-amber-50" />
              <StatCard label="Total Attendees" value={stats.totalPax} sub="Confirmed headcount" icon="👥" accent={theme.attendeesAccent} textColor={theme.attendeesText} iconBg={theme.attendeesIconBg} />
            </div>

            {/* Category breakdown + Recent activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={theme.glassCard}>
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

              <Card className={theme.glassCard}>
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
              <Card className="bg-amber-50/70 backdrop-blur-xl border border-amber-200/80 rounded-2xl shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
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
          </AnimatedTabsContent>

          {/* ══ GUEST LIST ════════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="guests" className="space-y-4">
            <Card className={theme.glassCard}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Guest List</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Showing <span className="font-semibold text-gray-700">{filteredGuests.length}</span> of <span className="font-semibold text-gray-700">{guests.length}</span> guests
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none">🔍</span>
                    <Input
                      placeholder="Search name, phone, category…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`pl-8 w-full sm:w-64 h-9 text-sm border-gray-200 rounded-xl ${theme.searchFocus}`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter pills */}
                <div className="admin-tabs-scroll -mx-1 px-1 overflow-x-auto pb-1">
                  <div className="flex gap-2 w-max min-w-full">
                  {([
                    { key: 'all', label: 'All', count: guests.length },
                    { key: 'pending', label: 'Pending', count: stats.pending },
                    { key: 'yes', label: 'Confirmed', count: stats.confirmed },
                    { key: 'no', label: 'Declined', count: stats.declined },
                  ] as const).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 ${
                        filter === f.key ? theme.filterActive : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        filter === f.key ? theme.filterActiveBadge : 'bg-gray-200 text-gray-500'
                      }`}>{f.count}</span>
                    </button>
                  ))}
                  </div>
                </div>

                {/* Table — min-width forces horizontal scroll on mobile so the bar is visible */}
                <div className="admin-table-scroll rounded-xl border border-gray-100 bg-white/40">
                  <Table className="min-w-[880px]">
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[160px]">Guest</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[100px]">Category</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[120px]">Invited to</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[100px]">Status</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[64px]">Pax</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[90px]">Opened</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[100px]">Responded</TableHead>
                        <TableHead className="min-w-[280px] text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16 text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl">🔍</span>
                              <p className="text-sm">{search ? 'No guests match your search.' : 'No guests in this category.'}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredGuests.map((guest) => {
                        const momentCount =
                          typeof guest.moments_count === 'number'
                            ? guest.moments_count
                            : parseMediaList(guest.moments).length
                        const invitedLabels = project
                          ? invitedToLabels(guest.invited_to, project)
                          : []
                        return (
                        <TableRow
                          key={guest.id}
                          className={`transition-colors group border-gray-50 cursor-pointer ${theme.tableRowHover}`}
                          onClick={() => setInviteGuest(guest)}
                        >
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
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {invitedLabels.map((label) => (
                                <span
                                  key={label}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
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
                          <TableCell className="text-right">
                            <div
                              className="ml-auto grid w-max grid-cols-[7.25rem_7.5rem_2rem_2rem] items-center justify-items-stretch gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 w-full justify-center rounded-lg px-2 text-xs transition-all ${
                                  copiedId === guest.id
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : theme.copyLinkBtn
                                }`}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/invite/${guest.unique_token}`,
                                  )
                                  setCopiedId(guest.id)
                                  setTimeout(() => setCopiedId(null), 2000)
                                }}
                              >
                                {copiedId === guest.id ? (
                                  '✓ Copied!'
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                                    Copy
                                  </span>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-full justify-center rounded-lg border-amber-200 px-2 text-xs text-amber-800 hover:bg-amber-50"
                                onClick={() => setMomentsGuest(guest)}
                              >
                                Moments{momentCount > 0 ? ` (${momentCount})` : ''}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Edit ${guest.name}`}
                                title="Edit guest"
                                className="h-8 w-8 justify-self-center rounded-lg border-gray-200 p-0 text-gray-600 hover:bg-gray-50"
                                onClick={() => openEditGuest(guest)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`Delete ${guest.name}`}
                                title="Delete guest"
                                className="h-8 w-8 justify-self-center rounded-lg p-0 text-red-400 hover:bg-red-50 hover:text-red-700"
                                disabled={deletingId === guest.id}
                                onClick={() => deleteGuest(guest.id, guest.name)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[11px] text-gray-400 sm:hidden pt-1">
                  Scroll sideways in the list for status, pax, and actions
                </p>
              </CardContent>
            </Card>
          </AnimatedTabsContent>

          {/* Delete error toast */}
          {deleteError && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
              <span>⚠</span> {deleteError}
            </div>
          )}

          {/* ══ ADD GUEST ═════════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="add-guest" className="mt-0">
            <div className="max-w-md space-y-4">
              <Card className={theme.glassCard}>
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
                      className={`w-full rounded-xl ${theme.primaryBtn}`}
                    >
                      {adding ? 'Adding…' : '+ Add Guest'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {lastAddedGuest && (
                <Card className={theme.glassCard}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Moments with {lastAddedGuest.name}</CardTitle>
                    <CardDescription>
                      Optional — up to {MAX_GUEST_MOMENTS} photos on their personal invite only.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {momentsError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {momentsError}
                      </div>
                    )}
                    <MediaUploader
                      title="Add images"
                      images={lastAddedMoments}
                      max={MAX_GUEST_MOMENTS}
                      uploading={momentsUploading}
                      onUpload={uploadLastAddedMoments}
                      onRemove={removeLastAddedMoment}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </AnimatedTabsContent>

          {/* ══ IMPORT / EXPORT ═══════════════════════════════════════════════ */}
          <AnimatedTabsContent value="import-export" className="mt-0 space-y-6">
            <Card className={`${theme.glassCard} max-w-2xl`}>
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
                <label htmlFor="import-file" className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-colors ${theme.importDropzone}`}>
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
                <Button onClick={handleBulkImport} disabled={!importFile || importing} className={`w-full rounded-xl ${theme.primaryBtn}`}>
                  {importing ? 'Importing…' : importFile ? `Import "${importFile.name}"` : 'Select a file first'}
                </Button>
              </CardContent>
            </Card>

            <Card className={`${theme.glassCard} max-w-2xl`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📤</span>
                  <div>
                    <CardTitle>Export Guest Links</CardTitle>
                    <CardDescription>
                      Download the full guest list with invite links and per-event RSVP status.
                    </CardDescription>
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
          </AnimatedTabsContent>

          {/* ══ SEND INVITATIONS ══════════════════════════════════════════════ */}
          <AnimatedTabsContent value="send" className="mt-0">
            <SendInvitationsPanel
              guests={guests}
              project={project}
              theme={theme}
            />
          </AnimatedTabsContent>

          {/* ══ EVENT DETAILS ═════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="event" className="mt-0 space-y-6">
            {project && (
              <Card className={`${theme.glassCard} max-w-2xl`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎊</span>
                    <div>
                      <CardTitle>Event Details</CardTitle>
                      <CardDescription>
                        Update your {project.event_template ?? 'event'} information
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
                      onValueChange={(val) => {
                        const nextTemplate = val as Project['event_template']
                        // Reset Events included to ONLY the new primary (drop previous extras)
                        const nextEvents = resetEventsToPrimary(project, nextTemplate || 'Wedding')
                        updateProject({ event_template: nextTemplate, events: nextEvents })
                      }}
                    >
                      <SelectTrigger id="event-type" className="mt-2 rounded-xl">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wedding">💍 Wedding</SelectItem>
                        <SelectItem value="Engagement">💑 Engagement</SelectItem>
                        <SelectItem value="Reception">🥂 Reception</SelectItem>
                        <SelectItem value="Mehendi">🌿 Mehendi</SelectItem>
                        <SelectItem value="Haldi">🌼 Haldi</SelectItem>
                        <SelectItem value="Save The Date">📅 Save The Date</SelectItem>
                        <SelectItem value="Birthday">🎂 Birthday</SelectItem>
                        <SelectItem value="Housewarming">🏡 Housewarming</SelectItem>
                        <SelectItem value="Corporate Event">🏢 Corporate Event</SelectItem>
                        <SelectItem value="Custom Event">✨ Custom Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Theme/wording preset. Use &quot;Events included&quot; below to invite for Engagement and Wedding together.
                    </p>
                  </div>

                  {project.event_template === 'Birthday' ? (
                    <BirthdayPersonsFields
                      couple1={project.couple_1}
                      couple2={project.couple_2}
                      onUpdatePrimary={(name) => updateProject({ couple_1: name })}
                      onUpdateAdditional={(names) => updateProject({ couple_2: serializeAdditionalBirthdayPersons(names) })}
                    />
                  ) : (
                    /* ── Wedding / all other events: Partner 1 + Partner 2 ── */
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
                  )}

                  {project.event_template !== 'Birthday' ? (
                    <EventsIncludedEditor
                      project={project}
                      onChange={(events) => updateProject({ events })}
                    />
                  ) : (
                    <>
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
                    </>
                  )}
                  <div>
                    <Label>Contact Number</Label>
                    <Input defaultValue={project.contact} onChange={(e) => updateProject({ contact: e.target.value })} className="mt-2 rounded-xl" />
                  </div>
                  {project.event_template === 'Birthday' ? (
                  <div>
                    <Label>Maps Link or Address</Label>
                    <Input defaultValue={project.maps_url || ''} onChange={(e) => updateProject({ maps_url: e.target.value })}
                      placeholder="Paste a Google Maps URL, address, or Plus Code" className="mt-2 rounded-xl" />
                    <p className="text-xs text-gray-400 mt-1">You can paste a full Google Maps link, a plain address, or a Plus Code — it will always open the correct location.</p>
                  </div>
                  ) : null}

                  <div className="border-t border-gray-100 pt-5">
                    <MediaUploader
                      title="Invite gallery"
                      description="Shared photos shown on every invite link (open + personal)."
                      images={galleryImages}
                      max={MAX_GALLERY_IMAGES}
                      uploading={galleryUploading}
                      onUpload={uploadGalleryFiles}
                      onRemove={removeGalleryImage}
                    />
                    {galleryError && (
                      <p className="text-xs text-red-600 mt-2">{galleryError}</p>
                    )}
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
          </AnimatedTabsContent>

        </Tabs>
      </div>

      <GuestMomentsEditor
        open={!!momentsGuest}
        onClose={() => setMomentsGuest(null)}
        projectId={projectId}
        guestId={momentsGuest?.id || ''}
        guestName={momentsGuest?.name || ''}
        initialMoments={momentsGuest?.moments}
        onUpdated={(moments) => {
          if (!momentsGuest) return
          const moments_count = moments.length
          setGuests((prev) =>
            prev.map((g) =>
              g.id === momentsGuest.id ? { ...g, moments, moments_count } : g,
            ),
          )
          setMomentsGuest((prev) =>
            prev ? { ...prev, moments, moments_count } : prev,
          )
          if (lastAddedGuest?.id === momentsGuest.id) setLastAddedMoments(moments)
        }}
      />

      <Dialog
        open={!!editGuest}
        onOpenChange={(open) => {
          if (!open && !savingEdit) setEditGuest(null)
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
            <DialogDescription>
              Update name, phone, or category. The invite link stays the same.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label htmlFor="edit-name">Guest Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
                className="mt-2 rounded-xl"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editPhone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setEditPhone(digits)
                  setEditPhoneError(
                    digits.length > 0 && digits.length < 10
                      ? 'Phone number must be exactly 10 digits'
                      : '',
                  )
                }}
                placeholder="10-digit number"
                maxLength={10}
                inputMode="numeric"
                className={`mt-2 rounded-xl font-mono ${
                  editPhoneError ? 'border-red-400 focus-visible:ring-red-300' : ''
                }`}
              />
              {editPhoneError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span> {editPhoneError}
                </p>
              )}
              {editPhone.length === 10 && !editPhoneError && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <span>✓</span> Valid number
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger id="edit-category" className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Family', 'Friends', 'Bride Side', 'Groom Side', 'Neighbours', 'Office', 'Other'].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            {editError && (
              <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{editError}</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={savingEdit}
              onClick={() => setEditGuest(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={`rounded-xl ${theme.primaryBtn}`}
              disabled={
                savingEdit ||
                !editName.trim() ||
                !!editPhoneError ||
                (editPhone.length > 0 && editPhone.length < 10)
              }
              onClick={saveEditGuest}
            >
              {savingEdit ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {project ? (
        <GuestInvitePanel
          open={!!inviteGuest}
          guest={inviteGuest}
          project={project}
          projectId={projectId}
          onClose={() => setInviteGuest(null)}
          onSaved={(updated) => {
            setGuests((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)))
            setInviteGuest(null)
          }}
        />
      ) : null}
    </main>
  )
}
