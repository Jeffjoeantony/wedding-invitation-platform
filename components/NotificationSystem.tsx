'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AppNotification } from '@/lib/notifications'
import {
  clearNotifications,
  getNotifications,
  markAllRead,
} from '@/lib/notifications'

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const CFG: Record<string, { icon: string; accent: string; bg: string; border: string }> = {
  guest_added:     { icon: '👤', accent: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  rsvp_yes:        { icon: '✅', accent: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  rsvp_no:         { icon: '❌', accent: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  bulk_import:     { icon: '📥', accent: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  project_created: { icon: '🎉', accent: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  system:          { icon: '🔔', accent: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
}
const DEFAULT_CFG = { icon: '🔔', accent: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }

// ── Individual Toast ──────────────────────────────────────────────────────────
function Toast({ notif, onDismiss }: { notif: AppNotification; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)
  const cfg = CFG[notif.type] ?? DEFAULT_CFG

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 16)
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 360) }, 4800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDismiss])

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(onDismiss, 360) }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.accent}`,
        borderRadius: 14,
        padding: '13px 16px 13px 13px',
        width: 340,
        boxShadow: '0 10px 40px rgba(0,0,0,0.14), 0 2px 10px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: '0 0 3px', lineHeight: 1.3 }}>
          {notif.title}
        </p>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px', lineHeight: 1.45 }}>
          {notif.message}
        </p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontWeight: 500 }}>
          just now
        </p>
      </div>
      <span style={{ color: '#D1D5DB', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</span>
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 3, background: cfg.accent, opacity: 0.35,
        animation: 'notif-shrink 4.8s linear forwards',
      }} />
    </div>
  )
}

// ── Notification Dropdown ─────────────────────────────────────────────────────
function NotificationDropdown({
  notifications,
  onMarkAllRead,
  onClear,
}: {
  notifications: AppNotification[]
  onMarkAllRead: () => void
  onClear: () => void
}) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div
      style={{
        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
        width: 390, maxHeight: '72vh',
        background: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        borderRadius: 18,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        zIndex: 9000,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, sans-serif",
        animation: 'notif-dropdown-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: '#111827', margin: 0 }}>Notifications</p>
          {unread > 0 && (
            <span style={{
              background: '#D72660', color: '#fff',
              fontSize: 10, fontWeight: 800,
              padding: '2px 7px', borderRadius: 999,
              letterSpacing: '0.02em',
            }}>{unread} new</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                fontSize: 11, fontWeight: 600, color: '#D72660',
                background: '#FEF2F2', border: 'none',
                padding: '4px 10px', borderRadius: 8,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FCE7F3' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClear}
              style={{
                fontSize: 11, fontWeight: 600, color: '#6B7280',
                background: '#F3F4F6', border: 'none',
                padding: '4px 10px', borderRadius: 8,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6' }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '44px 24px' }}>
            <p style={{ fontSize: 36, margin: '0 0 12px' }}>🔔</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>All caught up!</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              New notifications will appear here automatically.
            </p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const cfg = CFG[n.type] ?? DEFAULT_CFG
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '13px 20px',
                  borderBottom: i < notifications.length - 1 ? '1px solid #F9FAFB' : 'none',
                  background: n.read ? 'transparent' : `${cfg.bg}80`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : `${cfg.bg}80` }}
              >
                {/* Icon + unread dot */}
                <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{cfg.icon}</span>
                  {!n.read && (
                    <span style={{
                      position: 'absolute', top: -3, right: -5,
                      width: 8, height: 8,
                      background: '#D72660', borderRadius: '50%',
                      border: '2px solid #fff',
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: n.read ? 500 : 700, fontSize: 13,
                    color: '#111827', margin: '0 0 3px', lineHeight: 1.35,
                  }}>
                    {n.title}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 5px', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {timeAgo(n.timestamp)}
                    {n.projectName && (
                      <span style={{
                        color: '#D72660', background: '#FEF2F2',
                        padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      }}>
                        {n.projectName}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid #F3F4F6',
        flexShrink: 0,
        background: '#FAFAFA',
      }}>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
          Notifications are stored locally in your browser
        </p>
      </div>
    </div>
  )
}

// ── Main exported component ───────────────────────────────────────────────────
/**
 * Drop-in component that renders:
 *  1. A bell icon with unread badge (inline, place it in your topbar)
 *  2. A notification dropdown (appears below the bell)
 *  3. Toast popups (bottom-right corner, via React portal)
 *
 * Usage: <NotificationSystem />
 */
export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [toasts, setToasts] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    setNotifications(getNotifications())
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()

    const onNew = (e: Event) => {
      const notif = (e as CustomEvent<AppNotification>).detail
      setToasts((prev) => [...prev, notif])
      refresh()
    }
    const onChange = () => refresh()

    window.addEventListener('inviteos_notification', onNew)
    window.addEventListener('inviteos_notifications_changed', onChange)
    // Sync across tabs
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('inviteos_notification', onNew)
      window.removeEventListener('inviteos_notifications_changed', onChange)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleOpen = () => {
    setOpen((v) => !v)
    // Mark all read when opening
    if (!open && unreadCount > 0) {
      setTimeout(() => {
        markAllRead()
        refresh()
      }, 600)
    }
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <>
      {/* ── Bell button ── */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={handleOpen}
          title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
          style={{
            position: 'relative',
            width: 36, height: 36,
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: open ? '#D72660' : '#6B7280',
            background: open ? '#F4E7EC' : 'transparent',
            border: open ? '1.5px solid #F9D0DC' : '1.5px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            if (!open) {
              e.currentTarget.style.background = '#F3F4F6'
              e.currentTarget.style.color = '#1F2937'
              e.currentTarget.style.borderColor = '#E5E7EB'
            }
          }}
          onMouseLeave={(e) => {
            if (!open) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#6B7280'
              e.currentTarget.style.borderColor = 'transparent'
            }
          }}
        >
          {/* Bell icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 17, height: 17,
              background: '#D72660', color: '#fff',
              borderRadius: 999, border: '2px solid #fff',
              fontSize: 9, fontWeight: 800, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: unreadCount > 9 ? '0 3px' : 0,
              animation: 'notif-badge-pulse 2.2s ease-in-out infinite',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <NotificationDropdown
            notifications={notifications}
            onMarkAllRead={() => { markAllRead(); refresh() }}
            onClear={() => { clearNotifications(); setNotifications([]) }}
          />
        )}
      </div>

      {/* ── Toast Container (portal to document.body) ── */}
      {mounted && createPortal(
        <>
          <style>{`
            @keyframes notif-shrink {
              from { width: 100%; }
              to   { width: 0%; }
            }
            @keyframes notif-badge-pulse {
              0%, 100% { transform: scale(1); }
              50%       { transform: scale(1.2); }
            }
            @keyframes notif-dropdown-in {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)   scale(1); }
            }
          `}</style>
          <div style={{
            position: 'fixed', top: 80, right: 24,
            zIndex: 99999,
            display: 'flex', flexDirection: 'column', gap: 10,
            pointerEvents: 'none',
          }}>
            {toasts.map((t) => (
              <div key={t.id} style={{ pointerEvents: 'all' }}>
                <Toast notif={t} onDismiss={() => dismissToast(t.id)} />
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  )
}
