'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import * as XLSX from 'xlsx'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Link2,
  Trash2,
  Mail,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  BarChart3,
  Bell,
  Inbox,
  Heart,
  HeartHandshake,
  GlassWater,
  Leaf,
  Flower2,
  CalendarHeart,
  Cake,
  Home,
  Building2,
  Sparkles,
  UserPlus,
  Copy,
  Lightbulb,
  PhoneCall,
  ShieldCheck,
  Download,
  Upload,
  FileSpreadsheet,
  BookOpen,
  History,
  X,
  ArrowDownAZ,
  ArrowUpZA,
  type LucideIcon,
} from 'lucide-react'
import NotificationSystem from '@/components/NotificationSystem'
import { addNotification, notifyError, notifyInfo, notifySuccess, playNotificationSound } from '@/lib/notifications'
import { toast } from 'sonner'
import { getDashboardTheme } from '@/lib/dashboardTheme'
import {
  formatBirthdayPersonsDisplay,
  parseAdditionalBirthdayPersons,
  serializeAdditionalBirthdayPersons,
} from '@/lib/birthdayPersons'
import { buildOpenInviteUrl } from '@/lib/inviteLinks'
import { MediaUploader } from '@/components/admin/media-uploader'
import { GuestMomentsEditor } from '@/components/admin/guest-moments-editor'
import { EventDetailsPanel } from '@/components/admin/event-details-panel'
import { GuestInvitePanel } from '@/components/admin/guest-invite-panel'
import { GuestPhoneInput } from '@/components/admin/guest-phone-input'
import { formatGuestPhoneDisplay, guestPhonesEqual, toWhatsAppDigits } from '@/lib/guest-phone'
import { DEFAULT_GUEST_CATEGORY, GUEST_CATEGORIES } from '@/lib/guest-categories'
import {
  MAX_GALLERY_IMAGES,
  MAX_GUEST_MOMENTS,
  parseMediaList,
  type MediaItem,
} from '@/lib/invite-media'
import {
  buildGuestExportRows,
  effectiveInvitedTo,
  eventLabel,
  guestExportColumnOrder,
  invitedToLabels,
  parseRsvpByEvent,
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
  guest_category?: string | null
  opened_at?: string
  responded_at?: string
  created_at?: string
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
  couple_1_parents?: string | null
  couple_1_house?: string | null
  couple_1_place?: string | null
  couple_2_parents?: string | null
  couple_2_house?: string | null
  couple_2_place?: string | null
  couple_1_role?: string | null
  couple_2_role?: string | null
  couple_1_father?: string | null
  couple_1_mother?: string | null
  couple_2_father?: string | null
  couple_2_mother?: string | null
  date: string
  time: string
  venue: string
  location: string
  contact: string
  maps_url?: string
  event_template?: 'Wedding' | 'Engagement' | 'Reception' | 'Mehendi' | 'Haldi' | string
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


// ── Header event icon (Lucide) ───────────────────────────────────────────────
const EVENT_HEADER_ICONS: Record<string, LucideIcon> = {
  Wedding: Heart,
  Engagement: HeartHandshake,
  Reception: GlassWater,
  Mehendi: Leaf,
  Haldi: Flower2,
  'Save The Date': CalendarHeart,
  Birthday: Cake,
  Housewarming: Home,
  'Corporate Event': Building2,
  'Custom Event': Sparkles,
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.47-4.435 9.89-9.885 9.89m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
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
function StatCard({ label, value, sub, icon: Icon, accent, textColor, iconBg, iconColor }: {
  label: string; value: number | string; sub: string; icon: LucideIcon
  accent: string; textColor: string; iconBg: string; iconColor: string
}) {
  return (
    <Card
      className="group relative min-h-[148px] gap-0 overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 py-0 shadow-[0_4px_18px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300/80 hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]"
    >
      <div className={`absolute inset-x-0 top-0 border-t-[3px] ${accent}`} aria-hidden />
      <div
        className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full ${iconBg} opacity-45 blur-2xl transition-transform duration-500 group-hover:scale-125`}
        aria-hidden
      />

      <CardContent className="relative flex h-full min-h-[148px] flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-500 sm:text-[11px]">
              {label}
            </p>
            <p className={`mt-2 text-3xl font-bold tracking-[-0.04em] tabular-nums sm:text-[2rem] ${textColor}`}>
              {value}
            </p>
          </div>
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} ring-1 ring-inset ring-black/[0.025] transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${iconBg} ring-2 ring-current ${iconColor}`} aria-hidden />
          <p className="line-clamp-1 text-[11px] font-medium leading-snug text-slate-500 sm:text-xs">
            {sub}
          </p>
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
    <TabsContent value={value} className="mt-0 outline-none">
      <motion.div
        key={value}
        className={className}
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
      // E.164 / legacy phones → international digits (no forced +91)
      const phone = toWhatsAppDigits(guest.phone)
      const url = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${enc}`
        : `https://api.whatsapp.com/send?text=${enc}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } else if (channel === 'sms') {
      window.open(`sms:${toWhatsAppDigits(guest.phone)}?&body=${enc}`, '_blank')
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
    notifySuccess('Open invite link copied', 'Anyone with this link can open the invite.')
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'yes' | 'no'>('all')
  const [openedFilter, setOpenedFilter] = useState<'all' | 'not_opened' | 'opened'>('all')
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'no_phone' | 'has_phone'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [invitedToFilter, setInvitedToFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'opened' | 'responded' | 'category' | 'status' | 'added'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestPhone, setNewGuestPhone] = useState('')
  const [newGuestEmail, setNewGuestEmail] = useState('')
  const [newGuestCategory, setNewGuestCategory] = useState<string>(DEFAULT_GUEST_CATEGORY)
  const [adding, setAdding] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [guestPendingDelete, setGuestPendingDelete] = useState<{ id: string; name: string } | null>(null)
  // Keep name visible while the dialog close animation runs
  const [deleteDialogGuest, setDeleteDialogGuest] = useState<{ id: string; name: string } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevGuestsRef = useRef<Record<string, string>>({})
  const projectNameRef = useRef<string>('')
  const projectUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingProjectUpdatesRef = useRef<Partial<Project>>({})
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importPreviewCols, setImportPreviewCols] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState('')
  const [importDragOver, setImportDragOver] = useState(false)
  const [lastImportSummary, setLastImportSummary] = useState<{
    fileName: string
    count: number
    at: Date
  } | null>(null)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [addGuestError, setAddGuestError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
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
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set())
  const [bulkCopyDone, setBulkCopyDone] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkPendingDelete, setBulkPendingDelete] = useState<Guest[] | null>(null)
  const [waQueue, setWaQueue] = useState<Guest[] | null>(null)
  const [waQueueIndex, setWaQueueIndex] = useState(0)
  const [waQueueSentIds, setWaQueueSentIds] = useState<Set<string>>(new Set())
  const [momentsGuest, setMomentsGuest] = useState<Guest | null>(null)
  const [inviteGuest, setInviteGuest] = useState<Guest | null>(null)
  const [projectSaveStatus, setProjectSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [projectSaveError, setProjectSaveError] = useState('')
  const [projectFormKey, setProjectFormKey] = useState(0)
  const tabsListRef = useRef<HTMLDivElement>(null)
  const addGuestNameRef = useRef<HTMLInputElement>(null)
  const lastAddedMomentsRef = useRef<HTMLDivElement>(null)
  const shouldScrollToMomentsRef = useRef(false)

  // Keep the active navbar tab in view when switching on narrow screens
  useEffect(() => {
    const list = tabsListRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[data-state="active"]')
    if (!active) return
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    if (activeTab === 'add-guest' || activeTab === 'import-export') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [activeTab])

  // After adding a guest, scroll so the Moments section is reachable
  useEffect(() => {
    if (!lastAddedGuest || !shouldScrollToMomentsRef.current) return
    shouldScrollToMomentsRef.current = false
    const id = window.requestAnimationFrame(() => {
      lastAddedMomentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [lastAddedGuest])
  // Leave guest selection behind when navigating away from the list
  useEffect(() => {
    if (activeTab !== 'guests') {
      setSelectedGuestIds(new Set())
      setBulkCopyDone(false)
    }
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
    setPhoneError('')
    setEmailError('')
    const name = newGuestName.trim()
    if (!name) {
      setAddGuestError('Guest name is required')
      notifyError('Guest name required', 'Enter the guest’s full name to continue.')
      return
    }
    if (!phoneValid) {
      setPhoneError('Enter a valid phone number')
      notifyError('Invalid phone number', 'Enter a valid phone number to continue.')
      return
    }
    // Same name OK; phone must be unique in this project
    if (newGuestPhone.trim()) {
      const dup = guests.find((g) => guestPhonesEqual(g.phone, newGuestPhone))
      if (dup) {
        setPhoneError(`This phone number is already used by "${dup.name}"`)
        notifyError('Phone already used', `This number belongs to "${dup.name}".`)
        return
      }
    }
    const email = newGuestEmail.trim()
    if (email) {
      const emailNorm = email.toLowerCase()
      const dupEmail = guests.find(
        (g) => String(g.email || '').trim().toLowerCase() === emailNorm,
      )
      if (dupEmail) {
        setEmailError(`This email is already used by "${dupEmail.name}"`)
        notifyError('Email already used', `This email belongs to "${dupEmail.name}".`)
        return
      }
    }
    setAdding(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: newGuestPhone || null,
          email: email || null,
          guest_category: newGuestCategory,
          pax_count: 1,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const message = err.error || 'Failed to add guest. Please try again.'
        const field = typeof err.field === 'string' ? err.field : ''
        if (field === 'email' || (!field && /email/i.test(message))) {
          setEmailError(message)
          notifyError('Could not add guest', message)
        } else if (field === 'phone' || err.blankPhoneConflict) {
          if (err.blankPhoneConflict || !newGuestPhone.trim()) setAddGuestError(message)
          else setPhoneError(message)
          notifyError('Could not add guest', message)
        } else if (field === 'name' || field === 'unknown' || field === 'token') {
          setAddGuestError(message)
          notifyError('Could not add guest', message)
        } else if (err.duplicate && /phone/i.test(message)) {
          setPhoneError(message)
          notifyError('Could not add guest', message)
        } else {
          setAddGuestError(message)
          notifyError('Could not add guest', message)
        }
        return
      }

      const data = await res.json()
      setGuests((prev) => [data, ...prev])
      // Update snapshot so this guest isn't treated as new on next poll
      prevGuestsRef.current[data.id] = 'pending'
      setLastAddedGuest(data)
      setLastAddedMoments(parseMediaList(data.moments))
      setMomentsError('')
      addNotification({
        type: 'guest_added',
        title: 'Guest Added ✓',
        message: `${name} has been added to the guest list.`,
        projectName: projectNameRef.current || undefined,
        guestName: name,
        projectId,
      })
      playNotificationSound('success')
      setNewGuestName('')
      setNewGuestPhone('')
      setNewGuestEmail('')
      setNewGuestCategory(DEFAULT_GUEST_CATEGORY)
      setPhoneError('')
      setEmailError('')
      setPhoneValid(true)
      setAddGuestError('')
      shouldScrollToMomentsRef.current = true
      requestAnimationFrame(() => addGuestNameRef.current?.focus())
    } catch {
      setAddGuestError('Could not add the guest. Check your connection and try again.')
      notifyError('Could not add guest', 'Check your connection and try again.')
    } finally {
      setAdding(false)
    }
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
      notifySuccess('Gallery updated', `${files.length} image${files.length === 1 ? '' : 's'} uploaded.`)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed'
      setGalleryError(message)
      notifyError('Gallery upload failed', message)
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
      const message = data.error || 'Delete failed'
      setGalleryError(message)
      notifyError('Could not remove image', message)
      return
    }
    setGalleryImages(parseMediaList(data.images))
    notifyInfo('Image removed', 'Gallery photo deleted.')
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
      notifySuccess('Moments updated', `Photos added for ${lastAddedGuest.name}.`)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed'
      setMomentsError(message)
      notifyError('Moments upload failed', message)
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
      notifyError('Could not remove moment', data.error || 'Delete failed')
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
    notifyInfo('Moment removed', `Photo removed from ${lastAddedGuest.name}'s invite.`)
  }

  const requestDeleteGuest = (id: string, name: string) => {
    const pending = { id, name }
    setDeleteDialogGuest(pending)
    setGuestPendingDelete(pending)
  }

  const confirmDeleteGuest = async () => {
    if (!guestPendingDelete) return
    const { id, name } = guestPendingDelete
    setDeletingId(id)
    const res = await fetch(`/api/projects/${projectId}/guests?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setGuests((prev) => prev.filter((g) => g.id !== id))
      setSelectedGuestIds((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (inviteGuest?.id === id) setInviteGuest(null)
      if (momentsGuest?.id === id) setMomentsGuest(null)
      if (lastAddedGuest?.id === id) setLastAddedGuest(null)
      delete prevGuestsRef.current[id]
      addNotification({
        type: 'guest_deleted',
        title: 'Guest Deleted',
        message: `${name} has been removed from the guest list.`,
        projectName: projectNameRef.current || undefined,
        guestName: name,
        projectId,
      })
      playNotificationSound('warning')
    } else {
      setDeleteError(`Failed to delete "${name}". Please try again.`)
      notifyError('Could not delete guest', `Failed to remove "${name}". Please try again.`)
      setTimeout(() => setDeleteError(''), 4000)
    }
    setDeletingId(null)
    setGuestPendingDelete(null)
  }

  const confirmBulkDeleteGuests = async () => {
    if (!bulkPendingDelete?.length) return
    setBulkDeleting(true)
    const failed: string[] = []
    const deletedIds = new Set<string>()

    for (const guest of bulkPendingDelete) {
      const res = await fetch(`/api/projects/${projectId}/guests?id=${guest.id}`, { method: 'DELETE' })
      if (res.ok) {
        deletedIds.add(guest.id)
      } else {
        failed.push(guest.name)
      }
    }

    if (deletedIds.size > 0) {
      setGuests((prev) => prev.filter((g) => !deletedIds.has(g.id)))
      setSelectedGuestIds((prev) => {
        const next = new Set(prev)
        deletedIds.forEach((id) => next.delete(id))
        return next
      })
      if (inviteGuest && deletedIds.has(inviteGuest.id)) setInviteGuest(null)
      if (momentsGuest && deletedIds.has(momentsGuest.id)) setMomentsGuest(null)
      if (lastAddedGuest && deletedIds.has(lastAddedGuest.id)) setLastAddedGuest(null)
    }

    setBulkDeleting(false)
    setBulkPendingDelete(null)

    if (failed.length > 0) {
      setDeleteError(
        failed.length === 1
          ? `Failed to delete "${failed[0]}". Please try again.`
          : `Failed to delete ${failed.length} guests. Please try again.`,
      )
      setTimeout(() => setDeleteError(''), 4000)
    }
  }

  const updateProject = useCallback((updates: Partial<Project>, options?: { immediate?: boolean }) => {
    // Block blank project name from being queued
    if ('name' in updates) {
      const trimmed = String(updates.name ?? '').trim()
      if (!trimmed) {
        setProjectSaveStatus('error')
        setProjectSaveError('Project name is required')
        toast.error('Project name required', {
          id: 'project-name',
          description: 'Enter a project name before saving.',
        })
        return
      }
      updates = { ...updates, name: trimmed }
    }

    // Optimistic local merge so typing stays smooth
    setProject((prev) => {
      if (!prev) return prev
      return { ...prev, ...updates }
    })
    setProjectSaveError('')
    setProjectSaveStatus('saving')

    pendingProjectUpdatesRef.current = { ...pendingProjectUpdatesRef.current, ...updates }

    const flush = async () => {
      const batch = { ...pendingProjectUpdatesRef.current }
      pendingProjectUpdatesRef.current = {}
      if (Object.keys(batch).length === 0) return

      if ('name' in batch && !String(batch.name ?? '').trim()) {
        delete batch.name
        if (Object.keys(batch).length === 0) {
          setProjectSaveStatus('error')
          setProjectSaveError('Project name is required')
          toast.error('Project name required', {
            id: 'project-name',
            description: 'Enter a project name before saving.',
          })
          return
        }
      }

      setProjectSaveStatus('saving')
      const res = await fetch(`/api/projects/${projectId}/event`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          res.status === 429
            ? 'Too many saves — wait a moment and try again'
            : data.error || 'Failed to update project'
        setProjectSaveStatus('error')
        setProjectSaveError(message)
        toast.error('Could not save project', { id: 'project-save', description: message })
        // Re-sync from server so UI matches persisted data
        try {
          const refresh = await fetch(`/api/projects/${projectId}/event`)
          if (refresh.ok) {
            const proj = await refresh.json()
            projectNameRef.current = proj.name || ''
            setProject(proj)
            setProjectFormKey((k) => k + 1)
          }
        } catch {
          /* ignore refetch errors */
        }
        return
      }
      setProjectSaveStatus('saved')
      setProjectSaveError('')
      toast.success('Changes saved', { id: 'project-save', duration: 1800 })
    }

    if (projectUpdateTimerRef.current) clearTimeout(projectUpdateTimerRef.current)

    if (options?.immediate) {
      projectUpdateTimerRef.current = null
      void flush()
      return
    }

    // Debounce text-field saves — avoids rate-limit 429s on every keystroke
    projectUpdateTimerRef.current = setTimeout(() => {
      projectUpdateTimerRef.current = null
      void flush()
    }, 600)
  }, [projectId])

  // Flush any pending project edits when leaving the page
  useEffect(() => {
    return () => {
      if (projectUpdateTimerRef.current) clearTimeout(projectUpdateTimerRef.current)
      const batch = pendingProjectUpdatesRef.current
      if (Object.keys(batch).length === 0) return
      pendingProjectUpdatesRef.current = {}
      // keepalive so the tab close still delivers the last typed values
      void fetch(`/api/projects/${projectId}/event`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
        keepalive: true,
      })
    }
  }, [projectId])

  const handleDeleteProject = async () => {
    if (!confirm(`Permanently delete "${project?.name}"? All guests and data will be lost. This cannot be undone.`)) return
    setDeletingProject(true)
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    if (res.ok) {
      notifySuccess('Project deleted', `"${project?.name}" has been permanently removed.`)
      router.push('/admin')
    } else {
      notifyError('Could not delete project', 'Please try again.')
      setDeletingProject(false)
    }
  }

  const processImportFile = (file: File) => {
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls') && !lower.endsWith('.csv')) {
      setImportResult('✗ Please upload an XLSX, XLS, or CSV file.')
      notifyError('Invalid file', 'Please upload an XLSX, XLS, or CSV file.')
      return
    }
    setImportFile(file)
    setImportResult('')
    setImportPreview([])
    setImportPreviewCols([])
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
        const preview = rows.slice(0, 5)
        setImportPreview(preview)
        setImportPreviewCols(preview.length > 0 ? Object.keys(preview[0]) : [])
      } catch {
        setImportResult('✗ Could not read file. Make sure it is a valid Excel or CSV.')
        setImportFile(null)
        notifyError('Could not read file', 'Make sure it is a valid Excel or CSV.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImportFile(file)
    // Allow re-selecting the same file
    e.target.value = ''
  }

  const downloadImportTemplate = () => {
    const rows = [
      {
        Name: 'Priya Sharma',
        Phone: '+91 98765 43210',
        Email: 'priya@example.com',
        Category: 'Family',
      },
      {
        Name: 'Arjun Mehta',
        Phone: '+91 91234 56789',
        Email: '',
        Category: 'Friends',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(rows, { header: ['Name', 'Phone', 'Email', 'Category'] })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Guests')
    XLSX.writeFile(wb, 'guest-import-template.xlsx')
  }

  const handleBulkImport = () => {
    if (!importFile) return
    const fileName = importFile.name
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
          const parts: string[] = []
          if (result.count > 0) parts.push(`Imported ${result.count}`)
          if (result.skippedDuplicatePhone > 0) {
            parts.push(`${result.skippedDuplicatePhone} duplicate phone(s) skipped`)
          }
          if (result.skippedInvalidPhone > 0) {
            parts.push(`${result.skippedInvalidPhone} invalid phone row(s) skipped`)
          }
          setImportResult(
            parts.length > 0
              ? `✓ ${result.message || parts.join('. ')}`
              : `✓ ${result.message || 'Import complete'}`,
          )
          setLastImportSummary({
            fileName,
            count: typeof result.count === 'number' ? result.count : 0,
            at: new Date(),
          })
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
          const detail = [
            err.skippedInvalidPhone > 0 ? `${err.skippedInvalidPhone} invalid phone(s)` : '',
            err.skippedDuplicatePhone > 0 ? `${err.skippedDuplicatePhone} duplicate phone(s)` : '',
          ]
            .filter(Boolean)
            .join(', ')
          setImportResult(
            `✗ Import failed: ${err.error}${detail ? ` (${detail})` : ''}`,
          )
          notifyError(
            'Import failed',
            `${err.error || 'Could not import guests'}${detail ? ` (${detail})` : ''}`,
          )
        }
      } catch {
        setImportResult('✗ Could not read file. Make sure it is a valid Excel or CSV.')
        notifyError('Could not read file', 'Make sure it is a valid Excel or CSV.')
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
    notifySuccess('Excel exported', 'Guest list downloaded as XLSX.')
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
    notifySuccess('CSV exported', 'Guest list downloaded as CSV.')
  }

  /** Quick WhatsApp: link-only message (opens WhatsApp; user taps Send). */
  const sendGuestInviteWhatsApp = (guest: Guest) => {
    const phone = toWhatsAppDigits(guest.phone)
    if (!phone) return
    const origin =
      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) ||
      window.location.origin
    const link = `${origin}/invite/${guest.unique_token}`
    const text = link
    // api.whatsapp.com — wa.me can corrupt some characters in redirects
    window.open(
      `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const toggleGuestSelected = (id: string) => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setBulkCopyDone(false)
  }

  const clearGuestSelection = () => {
    setSelectedGuestIds(new Set())
    setBulkCopyDone(false)
  }

  const startWaQueueFromSelection = (queueGuests: Guest[]) => {
    const withPhone = queueGuests.filter((g) => toWhatsAppDigits(g.phone))
    if (withPhone.length === 0) {
      setDeleteError('None of the selected guests have a WhatsApp-ready phone number.')
      setTimeout(() => setDeleteError(''), 4000)
      return
    }
    setWaQueue(withPhone)
    setWaQueueIndex(0)
    setWaQueueSentIds(new Set())
  }

  const copySelectedInviteLinks = async (selected: Guest[]) => {
    if (selected.length === 0) return
    const origin =
      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) ||
      window.location.origin
    const text = selected.map((g) => `${origin}/invite/${g.unique_token}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setBulkCopyDone(true)
      setTimeout(() => setBulkCopyDone(false), 2200)
    } catch {
      setDeleteError('Could not copy links. Please try again.')
      setTimeout(() => setDeleteError(''), 4000)
    }
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

  const projectEvents = project ? resolveProjectEvents(project) : []
  const invitedToOptions = projectEvents.map((e) => ({
    id: e.id,
    label: eventLabel(e),
  }))

  const recentActivity = [...guests]
    .filter((g) => g.responded_at)
    .sort((a, b) => new Date(b.responded_at!).getTime() - new Date(a.responded_at!).getTime())
    .slice(0, 4)

  const statusSortOrder: Record<string, number> = { pending: 0, yes: 1, no: 2 }

  const filteredGuests = guests
    .filter((g) => {
      const matchStatus = statusFilter === 'all' || g.rsvp_status === statusFilter
      const matchOpened =
        openedFilter === 'all' ||
        (openedFilter === 'opened' ? !!g.opened_at : !g.opened_at)
      const hasPhone = !!toWhatsAppDigits(g.phone)
      const matchPhone =
        phoneFilter === 'all' ||
        (phoneFilter === 'has_phone' ? hasPhone : !hasPhone)

      const guestCategory = g.guest_category || 'Other'
      const matchCategory = categoryFilter === 'all' || guestCategory === categoryFilter

      const matchInvitedTo =
        invitedToFilter === 'all' ||
        (project
          ? effectiveInvitedTo(project, g.invited_to).includes(invitedToFilter)
          : false)

      const term = search.toLowerCase()
      const matchSearch =
        !term ||
        g.name.toLowerCase().includes(term) ||
        (g.phone || '').includes(term) ||
        (g.guest_category || '').toLowerCase().includes(term)

      return matchStatus && matchOpened && matchPhone && matchCategory && matchInvitedTo && matchSearch
    })
    .slice()
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1

      const compareText = (left: string, right: string) =>
        left.localeCompare(right, undefined, { sensitivity: 'base' }) * dir

      const compareDate = (left?: string | null, right?: string | null) => {
        const leftTime = left ? new Date(left).getTime() : null
        const rightTime = right ? new Date(right).getTime() : null
        if (leftTime == null && rightTime == null) return 0
        // Empty dates always sink to the bottom, regardless of direction
        if (leftTime == null) return 1
        if (rightTime == null) return -1
        return (leftTime - rightTime) * dir
      }

      switch (sortBy) {
        case 'added':
          return compareDate(a.created_at, b.created_at) || compareText(a.name, b.name)
        case 'opened':
          return compareDate(a.opened_at, b.opened_at) || compareText(a.name, b.name)
        case 'responded':
          return compareDate(a.responded_at, b.responded_at) || compareText(a.name, b.name)
        case 'category':
          return (
            compareText(a.guest_category || 'Other', b.guest_category || 'Other') ||
            compareText(a.name, b.name)
          )
        case 'status': {
          const statusDiff =
            ((statusSortOrder[a.rsvp_status] ?? 99) - (statusSortOrder[b.rsvp_status] ?? 99)) * dir
          return statusDiff || compareText(a.name, b.name)
        }
        case 'name':
        default:
          return compareText(a.name, b.name)
      }
    })

  const hasActiveFilters =
    statusFilter !== 'all' ||
    openedFilter !== 'all' ||
    phoneFilter !== 'all' ||
    categoryFilter !== 'all' ||
    invitedToFilter !== 'all'

  const hasCustomSort = sortBy !== 'name' || sortDir !== 'asc'

  const selectedGuests = guests.filter((g) => selectedGuestIds.has(g.id))
  const selectedCount = selectedGuests.length
  const filteredSelectedCount = filteredGuests.filter((g) => selectedGuestIds.has(g.id)).length
  const allFilteredSelected =
    filteredGuests.length > 0 && filteredSelectedCount === filteredGuests.length
  const someFilteredSelected =
    filteredSelectedCount > 0 && filteredSelectedCount < filteredGuests.length
  const selectedWithPhoneCount = selectedGuests.filter((g) => toWhatsAppDigits(g.phone)).length

  const setAllFilteredSelected = (checked: boolean) => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        filteredGuests.forEach((g) => next.add(g.id))
      } else {
        filteredGuests.forEach((g) => next.delete(g.id))
      }
      return next
    })
    setBulkCopyDone(false)
  }

  const clearAllFilters = () => {
    setStatusFilter('all')
    setOpenedFilter('all')
    setPhoneFilter('all')
    setCategoryFilter('all')
    setInvitedToFilter('all')
    setSortBy('name')
    setSortDir('asc')
  }

  const projectDateStr = project?.date
    ? new Date(project.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''
  const importStep: 1 | 2 | 3 =
    importing || (Boolean(importResult.startsWith('✓')) && !importFile)
      ? 3
      : importFile
        ? 2
        : 1
  const importPrimaryLabel = importing
    ? 'Importing…'
    : importFile
      ? `Import "${importFile.name}"`
      : 'Select a file to continue'

  const theme = getDashboardTheme(project?.event_template)
  const HeaderIcon =
    EVENT_HEADER_ICONS[project?.event_template ?? 'Wedding'] ?? Sparkles

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

              {/* Event icon — visible on all breakpoints */}
              <div
                className={`shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-[12px] sm:rounded-[14px] ${theme.iconGradient}`}
                style={{
                  boxShadow: '0 4px 14px rgba(215,38,96,0.25)',
                }}
                aria-hidden
              >
                <HeaderIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={1.75} />
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
                onClick={async () => {
                  await fetchData()
                  notifySuccess('Dashboard refreshed', 'Guest list and project data are up to date.')
                }}
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
          .overview-panel-scroll,
          .admin-table-scroll,
          .admin-table-scroll [data-slot='table-container'] {
            scrollbar-width: thin;
            scrollbar-color: #D1D5DB #F3F4F6;
          }
          .admin-tabs-scroll::-webkit-scrollbar,
          .overview-panel-scroll::-webkit-scrollbar,
          .admin-table-scroll::-webkit-scrollbar,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          .admin-tabs-scroll::-webkit-scrollbar-track,
          .overview-panel-scroll::-webkit-scrollbar-track,
          .admin-table-scroll::-webkit-scrollbar-track,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 999px;
          }
          .admin-tabs-scroll::-webkit-scrollbar-thumb,
          .overview-panel-scroll::-webkit-scrollbar-thumb,
          .admin-table-scroll::-webkit-scrollbar-thumb,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 999px;
            border: 2px solid #F3F4F6;
          }
          .admin-tabs-scroll::-webkit-scrollbar-thumb:hover,
          .overview-panel-scroll::-webkit-scrollbar-thumb:hover,
          .admin-table-scroll::-webkit-scrollbar-thumb:hover,
          .admin-table-scroll [data-slot='table-container']::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
          .admin-table-scroll [data-slot='table-container'] {
            overflow-x: hidden;
            overflow-y: auto;
            max-height: calc(2.5rem + 10 * 3.85rem); /* header + 10 guest rows */
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
            overscroll-behavior: contain;
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
              { value: 'send', label: 'Send Invitations', icon: Mail },
              { value: 'event', label: 'Event Details' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`flex-shrink-0 px-4 rounded-xl text-sm transition-all duration-300 data-[state=inactive]:hover:bg-white/50 ${theme.tabActive}`}
              >
                {'icon' in tab && tab.icon ? (
                  <span className="inline-flex items-center gap-1.5">
                    <tab.icon className="h-3.5 w-3.5 opacity-80" strokeWidth={2} aria-hidden />
                    {tab.label}
                  </span>
                ) : (
                  tab.label
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="mb-5 text-[11px] text-gray-400 sm:hidden">Swipe or scroll the tabs for more sections</p>

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="overview" className="space-y-8 sm:space-y-10">

            {/* Hero — Response Rate */}
            <div className={`${theme.heroClassName} !p-7 sm:!p-8 md:!p-9`} style={theme.heroStyle}>
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="relative flex flex-col md:flex-row md:items-stretch gap-7 md:gap-10">
                <div className="flex-1 min-w-0">
                  <p className={`${theme.heroMutedText} text-[11px] font-medium uppercase tracking-[0.14em] mb-3`}>
                    Overall Response Rate
                  </p>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums leading-none">
                      {stats.responseRate}%
                    </span>
                    <span className={`${theme.heroMutedText} text-sm mb-1.5`}>
                      {responded} of {stats.total} guests responded
                    </span>
                  </div>
                  <div className="h-2 bg-white/15 rounded-full overflow-hidden flex">
                    {stats.confirmed > 0 && (
                      <div
                        className="bg-emerald-400 transition-all duration-700"
                        style={{ width: `${stats.confirmedRate}%` }}
                      />
                    )}
                    {stats.declined > 0 && (
                      <div
                        className="bg-red-400 transition-all duration-700"
                        style={{ width: `${stats.declinedRate}%` }}
                      />
                    )}
                    {stats.pending > 0 && (
                      <div
                        className="bg-amber-300 transition-all duration-700"
                        style={{ width: `${stats.pendingRate}%` }}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
                    <span className={`text-xs ${theme.heroMutedText} inline-flex items-center gap-1.5`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Confirmed
                    </span>
                    <span className={`text-xs ${theme.heroMutedText} inline-flex items-center gap-1.5`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Declined
                    </span>
                    <span className={`text-xs ${theme.heroMutedText} inline-flex items-center gap-1.5`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      Pending
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 md:w-[12.5rem] border border-white/20 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shrink-0 divide-x md:divide-x-0 md:divide-y divide-white/15">
                  {[
                    { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-300' },
                    { label: 'Declined', value: stats.declined, color: 'text-red-300' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-300' },
                    { label: 'Attendees', value: stats.totalPax, color: 'text-white' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="px-5 py-3.5 flex md:flex-row items-baseline md:items-center justify-between gap-2"
                    >
                      <span className={`${theme.heroMutedText} text-[11px] uppercase tracking-wide`}>
                        {item.label}
                      </span>
                      <span className={`text-xl font-semibold tabular-nums ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6 Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              <StatCard
                label="Total Invited"
                value={stats.total}
                sub="Unique invitations sent"
                icon={Mail}
                accent="border-violet-400"
                textColor="text-violet-700"
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />
              <StatCard
                label="Invite Opened"
                value={stats.opened}
                sub={`${stats.openRate}% open rate`}
                icon={Eye}
                accent="border-blue-400"
                textColor="text-blue-700"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                label="Confirmed"
                value={stats.confirmed}
                sub={`${stats.confirmedRate}% acceptance`}
                icon={CheckCircle2}
                accent="border-emerald-400"
                textColor="text-emerald-700"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                label="Declined"
                value={stats.declined}
                sub="Sent their regrets"
                icon={XCircle}
                accent="border-red-400"
                textColor="text-red-600"
                iconBg="bg-red-50"
                iconColor="text-red-500"
              />
              <StatCard
                label="Awaiting Reply"
                value={stats.pending}
                sub="Haven't responded yet"
                icon={Clock}
                accent="border-amber-400"
                textColor="text-amber-600"
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />
              <StatCard
                label="Total Attendees"
                value={stats.totalPax}
                sub="Confirmed headcount"
                icon={Users}
                accent={theme.attendeesAccent}
                textColor={theme.attendeesText}
                iconBg={theme.attendeesIconBg}
                iconColor={theme.attendeesText}
              />
            </div>

            {/* Category breakdown + Recent activity */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <Card className="flex h-[430px] min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 py-0 shadow-[0_8px_28px_rgba(15,23,42,0.055)]">
                <CardHeader className="shrink-0 border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold tracking-tight text-slate-900">Guests by Category</CardTitle>
                      <CardDescription className="mt-1 text-xs font-medium">
                        {categories.length} group{categories.length !== 1 ? 's' : ''} · {stats.total} guests
                      </CardDescription>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
                      <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="overview-panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable] sm:px-5 sm:py-5">
                  {categories.length === 0 && (
                    <p className="py-10 text-center text-sm font-medium text-slate-400">No guests added yet</p>
                  )}
                  {categories.map(([cat, data]) => (
                    <div
                      key={cat}
                      className="rounded-xl border border-slate-100 bg-slate-50/65 px-4 py-3.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-800">{cat}</span>
                        <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-bold tabular-nums text-slate-500 ring-1 ring-inset ring-slate-200">
                          {data.total} total
                        </span>
                      </div>
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] tabular-nums">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
                            {data.yes} confirmed
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 font-semibold text-red-600">
                            <XCircle className="h-3 w-3" strokeWidth={2} aria-hidden />
                            {data.no} declined
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                            <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
                            {data.pending} pending
                          </span>
                      </div>
                      <div
                        className="flex h-2 overflow-hidden rounded-full bg-slate-200/80"
                        aria-label={`${cat}: ${data.yes} confirmed, ${data.no} declined, ${data.pending} pending`}
                      >
                        {data.yes > 0 && (
                          <div
                            className="bg-emerald-500 transition-all"
                            style={{ width: `${(data.yes / data.total) * 100}%` }}
                          />
                        )}
                        {data.no > 0 && (
                          <div
                            className="bg-red-400 transition-all"
                            style={{ width: `${(data.no / data.total) * 100}%` }}
                          />
                        )}
                        {data.pending > 0 && (
                          <div
                            className="bg-amber-300 transition-all"
                            style={{ width: `${(data.pending / data.total) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="flex h-[430px] min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 py-0 shadow-[0_8px_28px_rgba(15,23,42,0.055)]">
                <CardHeader className="shrink-0 border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold tracking-tight text-slate-900">Recent Responses</CardTitle>
                      <CardDescription className="mt-1 text-xs font-medium">
                        {recentActivity.length > 0 ? `${recentActivity.length} latest guest replies` : 'Latest guest replies'}
                      </CardDescription>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                      <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="overview-panel-scroll min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain px-4 py-2 [scrollbar-gutter:stable] sm:px-5">
                  {recentActivity.length === 0 && (
                    <p className="py-10 text-center text-sm font-medium text-slate-400">No responses yet</p>
                  )}
                  {recentActivity.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 px-1 py-3.5 transition-colors hover:bg-slate-50/80 sm:px-2"
                    >
                      <GuestAvatar name={g.name} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{g.name}</p>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                          {g.guest_category || 'Other'}
                          {g.responded_at
                            ? ` · ${new Date(g.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : ''}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ring-1 ring-inset ${
                          g.rsvp_status === 'yes'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                            : g.rsvp_status === 'no'
                              ? 'bg-red-50 text-red-600 ring-red-100'
                              : 'bg-amber-50 text-amber-700 ring-amber-100'
                        }`}
                      >
                        {g.rsvp_status === 'yes' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
                            Attending
                          </>
                        ) : g.rsvp_status === 'no' ? (
                          <>
                            <XCircle className="h-3 w-3" strokeWidth={2} aria-hidden />
                            Declined
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Not-opened banner */}
            {guests.filter((g) => !g.opened_at).length > 0 && (
              <Card className="gap-0 py-0 overflow-hidden bg-amber-50/45 backdrop-blur-2xl border border-amber-200/60 rounded-2xl shadow-[0_8px_28px_rgba(31,41,55,0.06),inset_0_1px_0_rgba(255,255,255,0.7)]">
                <CardContent className="relative px-5 py-5 sm:px-6 sm:py-6 flex items-center gap-4">
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"
                    aria-hidden
                  />
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/70 shrink-0 ring-1 ring-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm">
                    <Inbox className="h-5 w-5 text-amber-700" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="relative">
                    <p className="text-sm font-semibold text-amber-800">
                      {guests.filter((g) => !g.opened_at).length} guest
                      {guests.filter((g) => !g.opened_at).length !== 1 ? 's' : ''} haven&apos;t opened their
                      invite yet
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Consider sending a reminder via WhatsApp or SMS.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </AnimatedTabsContent>

          {/* ══ GUEST LIST ════════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="guests" className="space-y-4">
            <Card className={`${theme.glassCard} gap-2 py-5`}>
              <CardHeader className="pb-0">
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
              <CardContent className="space-y-4 pt-1">
                {/* Single unified filter + sort bar */}
                <div className="rounded-xl border border-gray-100 bg-white/60 px-3 py-2.5">
                  <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-wrap gap-1.5">
                      <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                      >
                        <SelectTrigger className="h-9 w-[calc(50%_-_3px)] rounded-lg border-gray-200 bg-white text-xs sm:w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Status: All</SelectItem>
                          <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
                          <SelectItem value="yes">Confirmed ({stats.confirmed})</SelectItem>
                          <SelectItem value="no">Declined ({stats.declined})</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={openedFilter}
                        onValueChange={(v) => setOpenedFilter(v as typeof openedFilter)}
                      >
                        <SelectTrigger className="h-9 w-[calc(50%_-_3px)] rounded-lg border-gray-200 bg-white text-xs sm:w-[140px]">
                          <SelectValue placeholder="Opened" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Opened: Any</SelectItem>
                          <SelectItem value="not_opened">
                            Not opened ({guests.filter((g) => !g.opened_at).length})
                          </SelectItem>
                          <SelectItem value="opened">
                            Opened ({guests.filter((g) => !!g.opened_at).length})
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={phoneFilter}
                        onValueChange={(v) => setPhoneFilter(v as typeof phoneFilter)}
                      >
                        <SelectTrigger className="h-9 w-[calc(50%_-_3px)] rounded-lg border-gray-200 bg-white text-xs sm:w-[140px]">
                          <SelectValue placeholder="Phone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Phone: Any</SelectItem>
                          <SelectItem value="has_phone">
                            Has phone ({guests.filter((g) => !!toWhatsAppDigits(g.phone)).length})
                          </SelectItem>
                          <SelectItem value="no_phone">
                            No / invalid ({guests.filter((g) => !toWhatsAppDigits(g.phone)).length})
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-9 w-[calc(50%_-_3px)] rounded-lg border-gray-200 bg-white text-xs sm:w-[145px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Category: All</SelectItem>
                          {categories.map(([cat, data]) => (
                            <SelectItem key={cat} value={cat}>
                              {cat} ({data.total})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={invitedToFilter} onValueChange={setInvitedToFilter}>
                        <SelectTrigger className="h-9 w-[calc(50%_-_3px)] rounded-lg border-gray-200 bg-white text-xs sm:w-[150px]">
                          <SelectValue placeholder="Invited to" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Invited to: All</SelectItem>
                          {invitedToOptions.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex w-[calc(50%_-_3px)] items-center gap-1 sm:w-auto">
                        <Select
                          value={sortBy}
                          onValueChange={(v) => {
                            const next = v as typeof sortBy
                            setSortBy(next)
                            // Dates default to newest-first; text/status to A→Z / pending→yes→no
                            setSortDir(
                              next === 'opened' || next === 'responded' || next === 'added'
                                ? 'desc'
                                : 'asc',
                            )
                          }}
                        >
                          <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-xs sm:w-[150px]">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Sort: Name</SelectItem>
                            <SelectItem value="added">Sort: Recently added</SelectItem>
                            <SelectItem value="opened">Sort: Opened</SelectItem>
                            <SelectItem value="responded">Sort: Responded</SelectItem>
                            <SelectItem value="category">Sort: Category</SelectItem>
                            <SelectItem value="status">Sort: Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          aria-label={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
                          title={
                            sortBy === 'opened' || sortBy === 'responded' || sortBy === 'added'
                              ? sortDir === 'desc'
                                ? 'Newest first'
                                : 'Oldest first'
                              : sortDir === 'asc'
                                ? 'A → Z'
                                : 'Z → A'
                          }
                          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                        >
                          {sortDir === 'asc' ? (
                            <ArrowDownAZ className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpZA className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {(hasActiveFilters || hasCustomSort) && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 self-start lg:self-center"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact fixed layout keeps every column and action visible without horizontal scrolling. */}
                <div className={`admin-table-scroll rounded-xl border bg-white/40 ${selectedCount > 0 ? 'border-rose-200/80' : 'border-gray-100'}`}>
                  <Table className="w-full table-fixed">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm [&_tr]:border-b">
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="w-[4%] pl-2 pr-0">
                          <Checkbox
                            aria-label={allFilteredSelected ? 'Deselect all visible guests' : 'Select all visible guests'}
                            checked={
                              allFilteredSelected
                                ? true
                                : someFilteredSelected
                                  ? 'indeterminate'
                                  : false
                            }
                            disabled={filteredGuests.length === 0}
                            onCheckedChange={(value) => setAllFilteredSelected(value === true)}
                            className="border-gray-300 data-[state=checked]:border-rose-700 data-[state=checked]:bg-rose-700 data-[state=indeterminate]:border-rose-700 data-[state=indeterminate]:bg-rose-700"
                          />
                        </TableHead>
                        <TableHead className="w-[19%] px-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Guest</TableHead>
                        <TableHead className="w-[9%] px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Category</TableHead>
                        <TableHead className="w-[10%] px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Invited to</TableHead>
                        <TableHead className="w-[10%] px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Status</TableHead>
                        <TableHead className="w-[5%] px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Pax</TableHead>
                        <TableHead className="w-[10%] px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Opened</TableHead>
                        <TableHead className="w-[11%] px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Responded</TableHead>
                        <TableHead className="w-[22%] px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-16 text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl">🔍</span>
                              <p className="text-sm">
                                {search || hasActiveFilters
                                  ? 'No guests match your filters.'
                                  : 'No guests yet.'}
                              </p>
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
                        const isSelected = selectedGuestIds.has(guest.id)
                        return (
                        <TableRow
                          key={guest.id}
                          data-state={isSelected ? 'selected' : undefined}
                          className={`transition-colors group border-gray-50 cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50/70 hover:bg-rose-50/90'
                              : theme.tableRowHover
                          }`}
                          onClick={() => setInviteGuest(guest)}
                        >
                          <TableCell
                            className="pl-2 pr-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              aria-label={`Select ${guest.name}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleGuestSelected(guest.id)}
                              className="border-gray-300 data-[state=checked]:border-rose-700 data-[state=checked]:bg-rose-700"
                            />
                          </TableCell>
                          <TableCell className="overflow-hidden px-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <GuestAvatar name={guest.name} />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{guest.name}</p>
                                {guest.phone && (
                                  <p className="truncate text-[10px] text-gray-400 font-mono">
                                    {formatGuestPhoneDisplay(guest.phone) || guest.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="overflow-hidden px-1">
                            <span className="block truncate rounded-sm bg-gray-100 px-1.5 py-1 text-center text-[10px] font-medium text-gray-600">
                              {guest.guest_category || 'Other'}
                            </span>
                          </TableCell>
                          <TableCell className="overflow-hidden px-1">
                            <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
                              {invitedLabels.map((label) => (
                                <span
                                  key={label}
                                  className="block truncate rounded-sm bg-rose-50 px-1.5 py-1 text-center text-[10px] font-semibold text-rose-700"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="px-1">
                            <span className={`block truncate rounded-sm px-1.5 py-1 text-center text-[10px] font-semibold ${
                              guest.rsvp_status === 'yes' ? 'bg-emerald-100 text-emerald-700' :
                              guest.rsvp_status === 'no' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {guest.rsvp_status === 'yes' ? '✓ Yes' : guest.rsvp_status === 'no' ? '✗ No' : '⏳ Pending'}
                            </span>
                          </TableCell>
                          <TableCell className="px-1">
                            {guest.rsvp_status === 'yes' ? (
                              <span className="text-xs font-semibold text-emerald-700">{guest.pax_count}</span>
                            ) : <span className="text-gray-300 text-sm">—</span>}
                          </TableCell>
                          <TableCell className="px-1">
                            {guest.opened_at ? (
                              <div className="text-[10px]">
                                <p className="truncate font-medium text-gray-700">{new Date(guest.opened_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                <p className="truncate text-gray-400">{new Date(guest.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            ) : <span className="text-[10px] text-gray-300 italic">Not yet</span>}
                          </TableCell>
                          <TableCell className="px-1">
                            {guest.responded_at ? (
                              <div className="text-[10px]">
                                <p className="truncate font-medium text-gray-700">{new Date(guest.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                <p className="truncate text-gray-400">{new Date(guest.responded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </TableCell>
                          <TableCell className="px-1 text-center">
                            <div
                              className="flex items-center justify-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Copy invite link for ${guest.name}`}
                                title={copiedId === guest.id ? 'Invite link copied' : 'Copy invite link'}
                                className={`h-8 w-8 rounded-lg p-0 transition-all ${
                                  copiedId === guest.id
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : theme.copyLinkBtn
                                }`}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/invite/${guest.unique_token}`,
                                  )
                                  setCopiedId(guest.id)
                                  notifySuccess('Link copied', `Invite link for ${guest.name} copied.`)
                                  setTimeout(() => setCopiedId(null), 2000)
                                }}
                              >
                                {copiedId === guest.id ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Link2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={
                                  guest.phone
                                    ? `Send invite link to ${guest.name} on WhatsApp`
                                    : `${guest.name} has no phone number`
                                }
                                title={
                                  guest.phone
                                    ? 'Send invite link via WhatsApp'
                                    : 'Add a phone number to enable WhatsApp'
                                }
                                className="h-8 w-8 justify-self-center rounded-lg border-[#25D366]/40 bg-[#25D366]/10 p-0 text-[#25D366] hover:bg-[#25D366]/20 disabled:opacity-40 disabled:pointer-events-none"
                                disabled={!toWhatsAppDigits(guest.phone)}
                                onClick={() => sendGuestInviteWhatsApp(guest)}
                              >
                                <WhatsAppIcon className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg border-amber-200 px-2 text-xs text-amber-800 hover:bg-amber-50"
                                onClick={() => setMomentsGuest(guest)}
                              >
                                Moments{momentCount > 0 ? ` (${momentCount})` : ''}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`Delete ${guest.name}`}
                                title="Delete guest"
                                className="h-8 w-8 justify-self-center rounded-lg p-0 text-red-400 hover:bg-red-50 hover:text-red-700"
                                disabled={deletingId === guest.id}
                                onClick={() => requestDeleteGuest(guest.id, guest.name)}
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
              </CardContent>
            </Card>

            {/* Bulk selection bar */}
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  key="guest-selection-bar"
                  className="sticky bottom-4 z-30 mx-auto max-w-4xl"
                  role="toolbar"
                  aria-label="Guest selection actions"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-gray-950/95 px-4 py-3 text-white shadow-[0_16px_48px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/15 px-2.5 text-sm font-bold tabular-nums">
                      {selectedCount}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">
                        {selectedCount === 1 ? '1 guest selected' : `${selectedCount} guests selected`}
                      </p>
                      {!allFilteredSelected && filteredGuests.length > filteredSelectedCount && (
                        <button
                          type="button"
                          className="mt-0.5 text-xs font-medium text-rose-200 hover:text-white underline-offset-2 hover:underline"
                          onClick={() => setAllFilteredSelected(true)}
                        >
                          Select all {filteredGuests.length} visible
                        </button>
                      )}
                      {selectedCount > selectedWithPhoneCount && (
                        <p className="mt-0.5 text-[11px] text-white/55">
                          {selectedWithPhoneCount} with WhatsApp number
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20 hover:text-white"
                      onClick={() => copySelectedInviteLinks(selectedGuests)}
                    >
                      <Link2 className="mr-1.5 h-3.5 w-3.5" />
                      {bulkCopyDone ? 'Copied!' : 'Copy links'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 rounded-xl bg-[#25D366] px-3 text-xs font-semibold text-white hover:bg-[#1da851] disabled:opacity-40"
                      disabled={selectedWithPhoneCount === 0}
                      title={
                        selectedWithPhoneCount === 0
                          ? 'No selected guests have a phone number'
                          : 'Open WhatsApp one guest at a time'
                      }
                      onClick={() => startWaQueueFromSelection(selectedGuests)}
                    >
                      <WhatsAppIcon className="mr-1.5 h-3.5 w-3.5" />
                      WhatsApp ({selectedWithPhoneCount})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl border-red-400/40 bg-red-500/15 px-3 text-xs text-red-100 hover:bg-red-500/25 hover:text-white"
                      onClick={() => setBulkPendingDelete(selectedGuests)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <button
                      type="button"
                      aria-label="Clear selection"
                      className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
                      onClick={clearGuestSelection}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedTabsContent>

          {/* Delete error toast */}
          {deleteError && (
            <div
              className={`fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 shadow-xl ${
                selectedCount > 0 ? 'bottom-24' : 'bottom-6'
              }`}
            >
              <span>⚠</span> {deleteError}
            </div>
          )}

          {/* ══ ADD GUEST ═════════════════════════════════════════════════════ */}
          <AnimatedTabsContent value="add-guest" className="mt-0 pb-8">
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
              <div className="min-w-0 space-y-4">
                <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_10px_35px_rgba(31,41,55,0.07)]">
                  <CardHeader className="border-b border-gray-100 px-5 py-4 sm:px-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
                          <UserPlus className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-gray-900">
                            Add a new guest
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Create a personalised invitation for this guest.
                          </CardDescription>
                        </div>
                      </div>
                      <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-100">
                        <Users className="h-3.5 w-3.5" aria-hidden />
                        {guests.length} guests added
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 py-4 sm:px-7">
                    <form onSubmit={addGuest} className="space-y-4">
                      <div>
                        <Label htmlFor="add-guest-name">
                          Full name <span className="text-rose-600">*</span>
                        </Label>
                        <Input
                          ref={addGuestNameRef}
                          id="add-guest-name"
                          value={newGuestName}
                          onChange={(e) => {
                            setNewGuestName(e.target.value)
                            setAddGuestError('')
                          }}
                          placeholder="e.g., Priya Sharma"
                          autoComplete="name"
                          className="mt-2 h-11 rounded-xl border-gray-200 bg-white"
                          required
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <GuestPhoneInput
                          id="add-guest-phone"
                          label="Phone"
                          value={newGuestPhone}
                          onChange={(e164) => {
                            setNewGuestPhone(e164)
                            setPhoneError('')
                          }}
                          onValidityChange={setPhoneValid}
                          error={phoneError}
                        />
                        <div>
                          <Label htmlFor="add-guest-email">
                            Email <span className="font-normal text-gray-400">(optional)</span>
                          </Label>
                          <div className="relative mt-2">
                            <Mail
                              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                              aria-hidden
                            />
                            <Input
                              id="add-guest-email"
                              type="email"
                              value={newGuestEmail}
                              onChange={(e) => {
                                setNewGuestEmail(e.target.value)
                                setEmailError('')
                              }}
                              placeholder="optional@email.com"
                              autoComplete="email"
                              className={`h-9 rounded-xl border-gray-200 bg-white pl-10 ${
                                emailError ? 'border-red-400 focus-visible:ring-red-300' : ''
                              }`}
                            />
                          </div>
                          {emailError ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                              <span>⚠</span> {emailError}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <fieldset>
                        <legend className="text-sm font-medium text-gray-700">Guest category</legend>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {GUEST_CATEGORIES.map((category) => {
                            const selected = newGuestCategory === category
                            return (
                              <button
                                key={category}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setNewGuestCategory(category)}
                                className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 ${
                                  selected
                                    ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50/40'
                                }`}
                              >
                                {category}
                              </button>
                            )
                          })}
                        </div>
                      </fieldset>

                      {addGuestError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                          <span>{addGuestError}</span>
                        </div>
                      )}

                      <div className="border-t border-gray-100 pt-4">
                        <Button
                          type="submit"
                          disabled={!newGuestName.trim() || adding || !phoneValid || !!phoneError || !!emailError}
                          className={`h-11 w-full rounded-xl ${theme.primaryBtn}`}
                        >
                          <UserPlus className="h-4 w-4" aria-hidden />
                          {adding ? 'Adding guest…' : 'Add guest'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {lastAddedGuest && (
                  <Card
                    ref={lastAddedMomentsRef}
                    className="rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_8px_28px_rgba(31,41,55,0.06)]"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-lg">
                        Moments with {lastAddedGuest.name}
                      </CardTitle>
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

              <aside className="min-w-0 self-start space-y-5 lg:sticky lg:top-24">
                <Card className="gap-0 rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
                  <CardHeader className="border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-rose-600" aria-hidden />
                      <CardTitle className="font-serif text-base">Quick tips</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 py-5">
                    {[
                      {
                        icon: PhoneCall,
                        title: 'Use an accurate phone number',
                        text: 'A valid number makes opening the invite in WhatsApp quick and reliable.',
                      },
                      {
                        icon: UserPlus,
                        title: 'Personalisation makes it special',
                        text: 'Use the guest’s preferred full name and the right category.',
                      },
                      {
                        icon: ShieldCheck,
                        title: 'Every invite link is unique',
                        text: 'The secure personal link is generated after the guest is added.',
                      },
                    ].map((tip) => {
                      const TipIcon = tip.icon
                      return (
                        <div key={tip.title} className="flex gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                            <TipIcon className="h-4 w-4" aria-hidden />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{tip.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{tip.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </aside>
            </div>
          </AnimatedTabsContent>

          {/* ══ IMPORT / EXPORT ═══════════════════════════════════════════════ */}
          <AnimatedTabsContent value="import-export" className="mt-0 space-y-5">
            {/* First viewport: import + export + tips */}
            <div className="grid items-stretch gap-4 lg:min-h-[calc(100dvh-12.5rem)] lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
              {/* ── Import card ── */}
              <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_10px_35px_rgba(31,41,55,0.07)]">
                <CardHeader className="shrink-0 border-b border-gray-100 px-5 py-3 sm:px-6">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="font-serif text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                        Import guest list
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs sm:text-sm">
                        Upload a spreadsheet — invite links are generated automatically.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadImportTemplate}
                      className="h-9 shrink-0 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Download template
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4 sm:px-6">
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        importFileInputRef.current?.click()
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setImportDragOver(true)
                    }}
                    onDragLeave={() => setImportDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setImportDragOver(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) processImportFile(file)
                    }}
                    onClick={() => importFileInputRef.current?.click()}
                    className={`flex min-h-[8.5rem] flex-1 flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed px-5 py-5 text-center transition-colors ${
                      importDragOver
                        ? 'border-rose-400 bg-rose-50/80'
                        : importFile
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'border-rose-200/80 bg-rose-50/30 hover:border-rose-300 hover:bg-rose-50/50'
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                      <Upload className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {importFile ? importFile.name : 'Drop your file here or choose a file'}
                      </p>

                    </div>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        importFileInputRef.current?.click()
                      }}
                      className={`h-9 rounded-xl ${theme.primaryBtn}`}
                    >
                      Choose file
                    </Button>
                    <input
                      ref={importFileInputRef}
                      id="import-file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <p>
                      Accepted formats:{' '}
                      <span className="font-medium text-gray-700">XLSX, XLS, CSV</span>
                    </p>
                    <p>
                      Maximum <span className="font-medium text-gray-700">500 guests</span>
                    </p>
                  </div>

                  <div
                    id="import-file-structure"
                    className="shrink-0 rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                  >
                    <p className="text-sm font-semibold text-gray-800">Required file structure</p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Column headers are matched case-insensitively.
                    </p>
                    <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                      <table className="w-full min-w-[420px] text-left text-xs">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            {[
                              { label: 'Name', badge: 'Required', required: true },
                              { label: 'Phone', badge: 'Optional', required: false },
                              { label: 'Email', badge: 'Optional', required: false },
                              { label: 'Category', badge: 'Optional', required: false },
                            ].map((col) => (
                              <th key={col.label} className="px-3 py-2 font-semibold">
                                <span className="inline-flex flex-wrap items-center gap-1.5">
                                  {col.label}
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                      col.required
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                    {col.badge}
                                  </span>
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-gray-700">
                            <td className="px-3 py-2">Priya Sharma</td>
                            <td className="px-3 py-2">+91 98765 43210</td>
                            <td className="px-3 py-2">priya@example.com</td>
                            <td className="px-3 py-2">Family</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {(importPreview.length > 0 || importResult) && (
                    <div className="min-h-0 max-h-28 shrink space-y-2 overflow-y-auto">
                      {importPreview.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-gray-700">
                            Preview — first {importPreview.length} row
                            {importPreview.length === 1 ? '' : 's'}
                          </p>
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  {importPreviewCols.map((col) => (
                                    <th
                                      key={col}
                                      className="border-b border-gray-200 px-3 py-1.5 text-left font-semibold text-gray-700"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.map((row, i) => (
                                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                                    {importPreviewCols.map((col) => (
                                      <td key={col} className="px-3 py-1.5 text-gray-700">
                                        {String(row[col] ?? '')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {importResult && (
                        <p
                          role="status"
                          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            importResult.startsWith('✓')
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {importResult}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex shrink-0 flex-col gap-2.5 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {[
                        { step: 1 as const, label: 'Upload file' },
                        { step: 2 as const, label: 'Review guests' },
                        { step: 3 as const, label: 'Import' },
                      ].map((item, index) => {
                        const active = importStep === item.step
                        const done = importStep > item.step
                        return (
                          <div key={item.step} className="flex items-center gap-2 sm:gap-3">
                            {index > 0 && (
                              <span
                                className={`hidden h-px w-5 sm:block ${
                                  done || active ? 'bg-rose-300' : 'bg-gray-200'
                                }`}
                                aria-hidden
                              />
                            )}
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                                  active
                                    ? 'bg-rose-600 text-white'
                                    : done
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {done ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : item.step}
                              </span>
                              <span
                                className={`text-[11px] font-medium sm:text-xs ${
                                  active ? 'text-gray-900' : done ? 'text-rose-700' : 'text-gray-400'
                                }`}
                              >
                                {item.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <Button
                      type="button"
                      onClick={handleBulkImport}
                      disabled={!importFile || importing}
                      className={`h-10 w-full rounded-xl text-sm font-semibold ${
                        !importFile || importing
                          ? 'bg-gray-200 text-gray-500 hover:bg-gray-200'
                          : theme.primaryBtn
                      }`}
                    >
                      <Upload className="h-4 w-4" aria-hidden />
                      {importPrimaryLabel}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ── Sidebar ── */}
              <aside className="flex min-h-0 flex-col gap-4">
                <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
                  <CardHeader className="shrink-0 border-b border-gray-100 px-4 py-3 sm:px-5">
                    <CardTitle className="font-serif text-lg font-semibold text-gray-900">
                      Export guest data
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Download the full list with invite links and RSVP status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 px-4 py-3.5 sm:px-5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Total guests', value: stats.total, icon: Users },
                        { label: 'Responded', value: responded, icon: CheckCircle2 },
                        { label: 'Pending', value: stats.pending, icon: Clock },
                      ].map((stat) => {
                        const StatIcon = stat.icon
                        return (
                          <div
                            key={stat.label}
                            className="rounded-xl bg-gray-50 px-2 py-2.5 text-center ring-1 ring-inset ring-gray-100"
                          >
                            <StatIcon className="mx-auto h-3.5 w-3.5 text-rose-600" aria-hidden />
                            <p className="mt-1 text-base font-semibold tabular-nums text-gray-900">
                              {stat.value}
                            </p>
                            <p className="text-[10px] font-medium leading-tight text-gray-500">
                              {stat.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={guests.length === 0}
                        className={`h-10 w-full rounded-xl ${theme.primaryBtn}`}
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Export Excel (.xlsx)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={guests.length === 0}
                        className="h-10 w-full rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Export CSV
                      </Button>
                    </div>

                    <div className="mt-auto">
                      {guests.length === 0 && (
                        <p className="mt-2 text-xs text-gray-400">
                          Add or import guests first to enable export.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shrink-0 gap-0 rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
                  <CardHeader className="border-b border-gray-100 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-rose-600" aria-hidden />
                      <CardTitle className="font-serif text-base">Before you import</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 py-3.5 sm:px-5">
                    {[
                      {
                        n: '1',
                        title: 'Download the template',
                        text: 'Use the provided columns so names and phones map correctly.',
                      },
                      {
                        n: '2',
                        title: 'Check phone country codes',
                        text: 'Include the country code (e.g. +91) for reliable WhatsApp invites.',
                      },
                      {
                        n: '3',
                        title: 'Review duplicates',
                        text: 'Rows with phones already on the list are skipped during import.',
                      },
                    ].map((tip) => (
                      <div key={tip.n} className="flex gap-2.5">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[11px] font-bold text-rose-700">
                          {tip.n}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{tip.title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{tip.text}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </aside>
            </div>

            {/* Below the fold — scroll to see */}
            <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
              <CardHeader className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-rose-600" aria-hidden />
                  <CardTitle className="font-serif text-lg">Recent imports</CardTitle>
                </div>
                <CardDescription>
                  Shown for this browser session after a successful import.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 py-0">
                {lastImportSummary ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="border-b border-gray-100 bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-3 font-semibold sm:px-6">File name</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Guests</th>
                          <th className="px-5 py-3 font-semibold sm:px-6">Imported on</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-50">
                          <td className="px-5 py-3.5 sm:px-6">
                            <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                              <FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden />
                              {lastImportSummary.fileName}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                              Completed
                            </span>
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-gray-700">
                            {lastImportSummary.count}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 sm:px-6">
                            {lastImportSummary.at.toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center sm:px-6">
                    <p className="text-sm font-medium text-gray-700">No imports yet this session</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Successful uploads will appear here until you leave this page.
                    </p>
                  </div>
                )}
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
          <AnimatedTabsContent value="event" className="mt-0 pb-8">
            {project && (
              <EventDetailsPanel
                project={project}
                projectFormKey={projectFormKey}
                projectSaveStatus={projectSaveStatus}
                projectSaveError={projectSaveError}
                galleryImages={galleryImages}
                galleryUploading={galleryUploading}
                galleryError={galleryError}
                deletingProject={deletingProject}
                birthdayFields={
                  <BirthdayPersonsFields
                    couple1={project.couple_1}
                    couple2={project.couple_2}
                    onUpdatePrimary={(name) => updateProject({ couple_1: name })}
                    onUpdateAdditional={(names) =>
                      updateProject({ couple_2: serializeAdditionalBirthdayPersons(names) })
                    }
                  />
                }
                onUpdateProject={updateProject}
                onUploadGallery={uploadGalleryFiles}
                onRemoveGalleryImage={removeGalleryImage}
                onDeleteProject={handleDeleteProject}
              />
            )}
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
        open={!!guestPendingDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) setGuestPendingDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete guest?</DialogTitle>
            <DialogDescription>
              Remove{' '}
              <span className="font-semibold text-gray-800">
                {deleteDialogGuest?.name}
              </span>{' '}
              from this guest list. Their invite link will stop working. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={!!deletingId}
              onClick={() => setGuestPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              disabled={!!deletingId}
              onClick={confirmDeleteGuest}
            >
              {deletingId ? 'Deleting…' : 'Yes, delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bulkPendingDelete}
        onOpenChange={(open) => {
          if (!open && !bulkDeleting) setBulkPendingDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Delete {bulkPendingDelete?.length ?? 0} guest
              {(bulkPendingDelete?.length ?? 0) === 1 ? '' : 's'}?
            </DialogTitle>
            <DialogDescription>
              Remove the selected guests from this list. Their invite links will stop working.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {bulkPendingDelete && bulkPendingDelete.length > 0 && (
            <ul className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 text-sm text-gray-700">
              {bulkPendingDelete.slice(0, 8).map((g) => (
                <li key={g.id} className="truncate py-0.5 font-medium">
                  {g.name}
                </li>
              ))}
              {bulkPendingDelete.length > 8 && (
                <li className="py-0.5 text-xs text-gray-400">
                  +{bulkPendingDelete.length - 8} more
                </li>
              )}
            </ul>
          )}
          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={bulkDeleting}
              onClick={() => setBulkPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              disabled={bulkDeleting}
              onClick={confirmBulkDeleteGuests}
            >
              {bulkDeleting ? 'Deleting…' : 'Yes, delete selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!waQueue}
        onOpenChange={(open) => {
          if (!open) {
            setWaQueue(null)
            setWaQueueIndex(0)
            setWaQueueSentIds(new Set())
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          {waQueue && waQueue.length > 0 && (() => {
            const current = waQueue[Math.min(waQueueIndex, waQueue.length - 1)]
            const sentCount = waQueueSentIds.size
            const allDone = sentCount >= waQueue.length
            const isCurrentSent = waQueueSentIds.has(current.id)
            const progressPct = Math.round((sentCount / waQueue.length) * 100)

            const markSentAndAdvance = () => {
              setWaQueueSentIds((prev) => new Set([...prev, current.id]))
              if (waQueueIndex < waQueue.length - 1) {
                setTimeout(() => setWaQueueIndex((i) => i + 1), 280)
              }
            }

            return (
              <>
                <DialogHeader>
                  <DialogTitle>WhatsApp send queue</DialogTitle>
                  <DialogDescription>
                    Opens one chat at a time. Tap Send in WhatsApp, then continue here for the next guest.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {sentCount} of {waQueue.length} opened
                      </span>
                      <span className="font-semibold text-gray-700">{progressPct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#25D366] transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {!allDone ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Guest {waQueueIndex + 1} of {waQueue.length}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{current.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-gray-500">
                        {formatGuestPhoneDisplay(current.phone) || current.phone}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-6 text-center">
                      <p className="text-base font-semibold text-emerald-800">Queue complete</p>
                      <p className="mt-1 text-sm text-emerald-700/80">
                        WhatsApp was opened for all {waQueue.length} guests with a phone number.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setWaQueue(null)
                      setWaQueueIndex(0)
                      setWaQueueSentIds(new Set())
                    }}
                  >
                    {allDone ? 'Done' : 'Close'}
                  </Button>
                  {!allDone && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          markSentAndAdvance()
                        }}
                      >
                        Skip
                      </Button>
                      <Button
                        type="button"
                        className="rounded-xl bg-[#25D366] text-white hover:bg-[#1da851]"
                        onClick={() => {
                          sendGuestInviteWhatsApp(current)
                          markSentAndAdvance()
                        }}
                      >
                        <WhatsAppIcon className="mr-1.5 h-3.5 w-3.5" />
                        {isCurrentSent ? 'Send again' : 'Send via WhatsApp'}
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {project ? (
        <GuestInvitePanel
          open={!!inviteGuest}
          guest={inviteGuest}
          project={project}
          projectId={projectId}
          existingGuests={guests}
          onClose={() => setInviteGuest(null)}
          onSaved={(updated) => {
            setGuests((prev) =>
              prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)),
            )
            if (lastAddedGuest?.id === updated.id) {
              setLastAddedGuest((prev) => (prev ? { ...prev, ...updated } : prev))
            }
            if (momentsGuest?.id === updated.id) {
              setMomentsGuest((prev) => (prev ? { ...prev, ...updated } : prev))
            }
            setInviteGuest(null)
          }}
        />
      ) : null}
    </main>
  )
}
