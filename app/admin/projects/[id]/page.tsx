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
import NotificationSystem from '@/components/NotificationSystem'
import { addNotification, playNotificationSound } from '@/lib/notifications'
import { getDashboardTheme } from '@/lib/dashboardTheme'
import {
  formatBirthdayPersonsDisplay,
  parseAdditionalBirthdayPersons,
  serializeAdditionalBirthdayPersons,
} from '@/lib/birthdayPersons'

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
  event_template?: 'Wedding' | 'Engagement' | 'Reception' | 'Mehendi' | 'Haldi' |
    'Save The Date' | 'Birthday' | 'Housewarming' | 'Corporate Event' | 'Custom Event'
  status: string
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

// ── Send Invitations Panel ────────────────────────────────────────────────────
function SendInvitationsPanel({
  guests, project,
  step, setStep,
  selectedCategories, setSelectedCategories,
  sendChannel, setSendChannel,
  sendPreviewGuest, setSendPreviewGuest,
  sendingIndex, setSendingIndex,
  sendSessionActive, setSendSessionActive,
  theme,
}: {
  guests: Guest[]
  project: Project | null
  step: 1 | 2 | 3
  setStep: (s: 1 | 2 | 3) => void
  selectedCategories: Set<string>
  setSelectedCategories: (s: Set<string>) => void
  sendChannel: 'whatsapp' | 'sms' | 'email'
  setSendChannel: (c: 'whatsapp' | 'sms' | 'email') => void
  sendPreviewGuest: Guest | null
  setSendPreviewGuest: (g: Guest | null) => void
  sendingIndex: number
  setSendingIndex: (i: number) => void
  sendSessionActive: boolean
  setSendSessionActive: (b: boolean) => void
  theme: any
}) {
  // Build category → guests map
  const categoryMap: Record<string, Guest[]> = {}
  guests.forEach((g) => {
    const cat = g.guest_category || 'Other'
    if (!categoryMap[cat]) categoryMap[cat] = []
    categoryMap[cat].push(g)
  })
  const allCategories = Object.keys(categoryMap).sort()

  const selectedGuests = guests.filter((g) => {
    const cat = g.guest_category || 'Other'
    return selectedCategories.has(cat)
  })
  const totalSelected = selectedGuests.length

  // Build personalised message for a guest
  const buildMessage = (guest: Guest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/invite/${guest.unique_token}`
    return `Hi ${guest.name},\n\nYou're warmly invited to our ${project?.event_template ?? 'Wedding'}.\n\nView Invitation:\n${link}\n\nWe look forward to celebrating with you.`
  }

  const handleSend = (guest: Guest) => {
    const msg = buildMessage(guest)
    const encoded = encodeURIComponent(msg)
    if (sendChannel === 'whatsapp') {
      const phone = guest.phone ? guest.phone.replace(/\D/g, '') : ''
      const url = phone
        ? `https://wa.me/${phone.startsWith('91') ? '' : '91'}${phone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`
      window.open(url, '_blank')
    } else if (sendChannel === 'sms') {
      const phone = guest.phone ? guest.phone.replace(/\D/g, '') : ''
      window.open(`sms:${phone}?&body=${encoded}`, '_blank')
    } else if (sendChannel === 'email') {
      const email = guest.email || ''
      const subject = encodeURIComponent(`You're invited to our ${project?.event_template ?? 'Wedding'}!`)
      window.open(`mailto:${email}?subject=${subject}&body=${encoded}`, '_blank')
    }
  }

  const channelIcon = { whatsapp: '💬', sms: '📱', email: '📧' }
  const channelLabel = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' }
  const channelColor = { whatsapp: '#25D366', sms: '#3B82F6', email: '#D72660' }

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #D72660 0%, #9B1C4C 100%)',
        borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -24, right: -24, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>📨</span>
            <div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Send Invitations</h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, margin: '2px 0 0' }}>
                Bulk queue — send personalised invites via WhatsApp, SMS, or Email
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
            {([1, 2, 3] as const).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= s ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: step >= s ? '#D72660' : 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, transition: 'all 0.25s',
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ color: step >= s ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: step >= s ? 600 : 400 }}>
                  {s === 1 ? 'Select Guests' : s === 2 ? 'Choose Channel' : 'Preview & Send'}
                </span>
                {s < 3 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STEP 1: Select Categories ── */}
      {step === 1 && (
        <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(31,41,55,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4E7EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
            <div>
              <h3 style={{ color: '#1F2937', fontSize: 15, fontWeight: 700, margin: 0 }}>Select Guest Groups</h3>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>Choose which categories to include in this send</p>
            </div>
          </div>

          {guests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              <p style={{ fontSize: 14 }}>No guests yet. Add guests first to send invitations.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allCategories.map((cat) => {
                const catGuests = categoryMap[cat]
                const isSelected = selectedCategories.has(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const next = new Set(selectedCategories)
                      if (isSelected) next.delete(cat)
                      else next.add(cat)
                      setSelectedCategories(next)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 14,
                      border: isSelected ? '2px solid #D72660' : '1.5px solid #E5E7EB',
                      background: isSelected ? '#FFF0F5' : '#FAFAFA',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      boxShadow: isSelected ? '0 2px 12px rgba(215,38,96,0.12)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: isSelected ? '2px solid #D72660' : '2px solid #D1D5DB',
                      background: isSelected ? '#D72660' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#1F2937', fontSize: 14, fontWeight: 600, margin: 0 }}>{cat}</p>
                      <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{catGuests.length} guest{catGuests.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span style={{
                      background: isSelected ? '#D72660' : '#F3F4F6',
                      color: isSelected ? '#fff' : '#6B7280',
                      fontSize: 13, fontWeight: 700,
                      padding: '4px 12px', borderRadius: 999,
                      transition: 'all 0.2s',
                    }}>
                      {catGuests.length}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Total + Continue */}
          {totalSelected > 0 && (
            <div style={{
              marginTop: 20, padding: '16px 20px',
              background: 'linear-gradient(135deg, #FFF0F5 0%, #FDE7EF 100%)',
              borderRadius: 14, border: '1px solid #F9D0DC',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ color: '#9B1C4C', fontWeight: 700, fontSize: 15, margin: 0 }}>
                  {totalSelected} Guest{totalSelected !== 1 ? 's' : ''} Selected
                </p>
                <p style={{ color: '#D72660', fontSize: 12, marginTop: 2 }}>
                  from {selectedCategories.size} group{selectedCategories.size !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '10px 24px', background: '#D72660', border: 'none',
                  borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 14px rgba(215,38,96,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#B91C4C'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#D72660'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Choose Channel ── */}
      {step === 2 && (
        <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(31,41,55,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📡</div>
            <div>
              <h3 style={{ color: '#1F2937', fontSize: 15, fontWeight: 700, margin: 0 }}>Send via</h3>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                {totalSelected} guest{totalSelected !== 1 ? 's' : ''} will be notified
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['whatsapp', 'sms', 'email'] as const).map((ch) => {
              const isSelected = sendChannel === ch
              const icons = { whatsapp: '💬', sms: '📱', email: '📧' }
              const labels = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' }
              const descs = {
                whatsapp: 'Opens WhatsApp with a personalised message for each guest',
                sms: 'Opens your SMS app with a pre-filled message',
                email: 'Opens your email client with personalised subject & body',
              }
              const colors = { whatsapp: '#25D366', sms: '#3B82F6', email: '#D72660' }
              return (
                <button
                  key={ch}
                  onClick={() => setSendChannel(ch)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px', borderRadius: 14,
                    border: isSelected ? `2px solid ${colors[ch]}` : '1.5px solid #E5E7EB',
                    background: isSelected ? `${colors[ch]}08` : '#FAFAFA',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    boxShadow: isSelected ? `0 2px 12px ${colors[ch]}20` : 'none',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: isSelected ? `${colors[ch]}15` : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    transition: 'all 0.2s',
                  }}>
                    {icons[ch]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#1F2937', fontSize: 14, fontWeight: 600, margin: 0 }}>{labels[ch]}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{descs[ch]}</p>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: isSelected ? `6px solid ${colors[ch]}` : '2px solid #D1D5DB',
                    background: isSelected ? '#fff' : 'transparent',
                    transition: 'all 0.2s', flexShrink: 0,
                  }} />
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1, padding: '11px', background: '#F3F4F6',
                border: '1.5px solid #E5E7EB', borderRadius: 12, color: '#6B7280',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6' }}
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setSendingIndex(0)
                setSendPreviewGuest(selectedGuests[0] || null)
                setSendSessionActive(true)
                setStep(3)
              }}
              style={{
                flex: 2, padding: '11px', background: '#D72660', border: 'none',
                borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(215,38,96,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#B91C4C' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#D72660' }}
            >
              Preview Messages →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Preview & Send ── */}
      {step === 3 && sendSessionActive && (
        <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(31,41,55,0.06)' }}>
          {/* Progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{channelIcon[sendChannel]}</span>
                <div>
                  <h3 style={{ color: '#1F2937', fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Sending via {channelLabel[sendChannel]}
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                    Guest {sendingIndex + 1} of {selectedGuests.length}
                  </p>
                </div>
              </div>
              <span style={{
                background: '#F4E7EC', color: '#D72660',
                fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
              }}>
                {selectedGuests.length - sendingIndex} remaining
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #D72660, #9B1C4C)',
                borderRadius: 999, transition: 'width 0.4s ease',
                width: `${(sendingIndex / selectedGuests.length) * 100}%`,
              }} />
            </div>
          </div>

          {sendingIndex < selectedGuests.length ? (() => {
            const guest = selectedGuests[sendingIndex]
            const msg = buildMessage(guest)
            return (
              <div>
                {/* Guest info */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', background: '#FAFAFA', borderRadius: 14,
                  border: '1px solid #F3F4F6', marginBottom: 16,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${channelColor[sendChannel]}20, ${channelColor[sendChannel]}10)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: channelColor[sendChannel],
                    border: `2px solid ${channelColor[sendChannel]}30`,
                  }}>
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1F2937', fontWeight: 700, fontSize: 15, margin: 0 }}>{guest.name}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                      {guest.guest_category || 'Other'}
                      {guest.phone ? ` · ${guest.phone}` : ''}
                      {guest.email ? ` · ${guest.email}` : ''}
                    </p>
                  </div>
                  <span style={{
                    background: '#F3F4F6', color: '#6B7280',
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                  }}>
                    #{sendingIndex + 1}
                  </span>
                </div>

                {/* Message preview */}
                <div style={{
                  background: 'linear-gradient(135deg, #F8F9FF 0%, #F0F4FF 100%)',
                  border: '1px solid #E0E7FF', borderRadius: 14, padding: '16px 20px',
                  marginBottom: 20, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 12, right: 14,
                    background: '#EEF2FF', color: '#6366F1',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    letterSpacing: '0.04em',
                  }}>
                    MESSAGE PREVIEW
                  </div>
                  <pre style={{
                    margin: 0, fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7,
                    color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    paddingTop: 4,
                  }}>
                    {msg}
                  </pre>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      if (sendingIndex > 0) setSendingIndex(sendingIndex - 1)
                    }}
                    disabled={sendingIndex === 0}
                    style={{
                      padding: '11px 20px', background: '#F3F4F6',
                      border: '1.5px solid #E5E7EB', borderRadius: 12, color: '#6B7280',
                      fontWeight: 600, fontSize: 13, cursor: sendingIndex === 0 ? 'not-allowed' : 'pointer',
                      opacity: sendingIndex === 0 ? 0.4 : 1, transition: 'all 0.15s',
                    }}
                  >
                    ← Prev
                  </button>

                  <button
                    onClick={() => {
                      handleSend(guest)
                      if (sendingIndex < selectedGuests.length - 1) {
                        setTimeout(() => setSendingIndex(sendingIndex + 1), 600)
                      } else {
                        // Done!
                        setTimeout(() => {
                          setSendSessionActive(false)
                          setSendingIndex(selectedGuests.length)
                        }, 400)
                      }
                    }}
                    style={{
                      flex: 1, padding: '11px',
                      background: channelColor[sendChannel],
                      border: 'none', borderRadius: 12, color: '#fff',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      boxShadow: `0 4px 14px ${channelColor[sendChannel]}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <span>{channelIcon[sendChannel]}</span>
                    Send via {channelLabel[sendChannel]}
                    {sendingIndex < selectedGuests.length - 1 ? ' & Next →' : ' ✓'}
                  </button>

                  <button
                    onClick={() => {
                      if (sendingIndex < selectedGuests.length - 1) {
                        setSendingIndex(sendingIndex + 1)
                      }
                    }}
                    disabled={sendingIndex >= selectedGuests.length - 1}
                    style={{
                      padding: '11px 20px', background: '#F3F4F6',
                      border: '1.5px solid #E5E7EB', borderRadius: 12, color: '#6B7280',
                      fontWeight: 600, fontSize: 13,
                      cursor: sendingIndex >= selectedGuests.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: sendingIndex >= selectedGuests.length - 1 ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    Skip →
                  </button>
                </div>
              </div>
            )
          })() : (
            /* All done! */
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h3 style={{ color: '#1F2937', fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
                All invitations sent!
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 24 }}>
                {selectedGuests.length} personalised invitation{selectedGuests.length !== 1 ? 's' : ''} sent via {channelLabel[sendChannel]}
              </p>
              <button
                onClick={() => {
                  setSelectedCategories(new Set())
                  setSendingIndex(0)
                  setSendSessionActive(false)
                  setStep(1)
                }}
                style={{
                  padding: '12px 28px', background: '#D72660', border: 'none',
                  borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(215,38,96,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#B91C4C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#D72660' }}
              >
                Send Another Batch
              </button>
            </div>
          )}

          {/* Back button */}
          {sendingIndex < selectedGuests.length && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => { setSendSessionActive(false); setStep(2) }}
                style={{
                  background: 'none', border: 'none', color: '#9CA3AF',
                  fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                ← Change channel
              </button>
            </div>
          )}
        </div>
      )}
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

  // ── Send Invitations state ───────────────────────────────────────────────────
  const [sendStep, setSendStep] = useState<1 | 2 | 3>(1)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp')
  const [sendPreviewGuest, setSendPreviewGuest] = useState<Guest | null>(null)
  const [sendingIndex, setSendingIndex] = useState<number>(0)
  const [sendSessionActive, setSendSessionActive] = useState(false)

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    const [guestRes, projectRes] = await Promise.all([
      fetch(`/api/projects/${projectId}/guests`),
      fetch(`/api/projects/${projectId}/event`),
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
      <div className={`bg-white/95 backdrop-blur-xl border-b-2 sticky top-0 z-20 ${theme.headerBorder}`}
        style={{ boxShadow: '0 4px 24px rgba(31,41,55,0.08), 0 1px 4px rgba(31,41,55,0.04)' }}>

        {/* Top accent line */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, #D72660 0%, #9B1C4C 40%, #7C3AED 100%)`,
        }} />

        <div className="max-w-7xl mx-auto px-6 md:px-8" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="flex items-center justify-between gap-6">

            {/* ── Left: Back + Brand ── */}
            <div className="flex items-center gap-4 min-w-0">

              {/* Back button */}
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 transition-all shrink-0"
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px solid #E5E7EB', background: '#FAFAFA',
                  color: '#6B7280', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#374151' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Projects
              </button>

              {/* Divider */}
              <div style={{ width: 1, height: 36, background: '#E5E7EB', flexShrink: 0 }} />

              {/* Event icon */}
              <div
                className={`shrink-0 ${theme.iconGradient}`}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 style={{ color: '#111827', fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2 }} className="truncate">
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
                <p style={{ color: '#9CA3AF', fontSize: 12, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>
                    {project?.event_template === 'Birthday' && project?.couple_1
                      ? formatBirthdayPersonsDisplay(project.couple_1, project.couple_2)
                      : project?.couple_1 && project?.couple_2
                        ? `${project.couple_1} & ${project.couple_2}`
                        : project?.couple_1 || 'Invitation & RSVP Management'}
                  </span>
                  {projectDateStr && (
                    <>
                      <span style={{ color: '#D1D5DB' }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {projectDateStr}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2.5 shrink-0">

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
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px solid #E5E7EB', background: '#FAFAFA',
                  color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  opacity: refreshing ? 0.6 : 1, transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!refreshing) { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB' } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#E5E7EB' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s linear', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>

              {/* Notification bell */}
              <NotificationSystem />

              {/* Divider */}
              <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px solid #E5E7EB', background: '#FAFAFA',
                  color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.color = '#DC2626' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">

          {/* Tab bar */}
          <TabsList className={`flex w-full overflow-x-auto justify-start sm:justify-center bg-white/90 shadow-sm border rounded-2xl p-1 mb-6 ${theme.tabsListBorder}`}>
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
                className={`flex-shrink-0 px-4 rounded-xl text-sm transition-all ${theme.tabActive}`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">

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
                <div className="flex gap-0 md:flex-col md:gap-0 border border-white/20 rounded-2xl overflow-hidden shrink-0">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Invited" value={stats.total} sub="Unique invitations sent" icon="💌" accent="border-violet-400" textColor="text-violet-700" iconBg="bg-violet-50" />
              <StatCard label="Invite Opened" value={stats.opened} sub={`${stats.openRate}% open rate`} icon="👁️" accent="border-blue-400" textColor="text-blue-700" iconBg="bg-blue-50" />
              <StatCard label="Confirmed" value={stats.confirmed} sub={`${stats.confirmedRate}% acceptance`} icon="✅" accent="border-emerald-400" textColor="text-emerald-700" iconBg="bg-emerald-50" />
              <StatCard label="Declined" value={stats.declined} sub="Sent their regrets" icon="❌" accent="border-red-400" textColor="text-red-600" iconBg="bg-red-50" />
              <StatCard label="Awaiting Reply" value={stats.pending} sub="Haven't responded yet" icon="⏳" accent="border-amber-400" textColor="text-amber-600" iconBg="bg-amber-50" />
              <StatCard label="Total Attendees" value={stats.totalPax} sub="Confirmed headcount" icon="👥" accent={theme.attendeesAccent} textColor={theme.attendeesText} iconBg={theme.attendeesIconBg} />
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
                      className={`pl-8 w-64 h-9 text-sm border-gray-200 rounded-xl ${theme.searchFocus}`}
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
                        <TableRow key={guest.id} className={`transition-colors group border-gray-50 ${theme.tableRowHover}`}>
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
                                  copiedId === guest.id ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : theme.copyLinkBtn
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
                      className={`w-full rounded-xl ${theme.primaryBtn}`}
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

          {/* ══ SEND INVITATIONS ══════════════════════════════════════════════ */}
          <TabsContent value="send" className="mt-0">
            <SendInvitationsPanel
              guests={guests}
              project={project}
              step={sendStep}
              setStep={setSendStep}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              sendChannel={sendChannel}
              setSendChannel={setSendChannel}
              sendPreviewGuest={sendPreviewGuest}
              setSendPreviewGuest={setSendPreviewGuest}
              sendingIndex={sendingIndex}
              setSendingIndex={setSendingIndex}
              sendSessionActive={sendSessionActive}
              setSendSessionActive={setSendSessionActive}
              theme={theme}
            />
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
                      onValueChange={(val) => updateProject({ event_template: val as Project['event_template'] })}
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
                    <p className="text-xs text-gray-400 mt-1.5">Changes all wording on the invitation cards automatically.</p>
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
