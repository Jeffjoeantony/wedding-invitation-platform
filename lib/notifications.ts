// ── Notification types ────────────────────────────────────────────────────────
export type NotificationType =
  | 'guest_added'
  | 'rsvp_yes'
  | 'rsvp_no'
  | 'bulk_import'
  | 'project_created'
  | 'system'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  projectName?: string
  guestName?: string
  projectId?: string
}

const STORAGE_KEY = 'inviteos_notifications'
const MAX_NOTIFICATIONS = 60

// ── Storage helpers ───────────────────────────────────────────────────────────
export function getNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function addNotification(
  notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
): AppNotification {
  const newNotif: AppNotification = {
    ...notif,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  }
  const updated = [newNotif, ...getNotifications()].slice(0, MAX_NOTIFICATIONS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

  // Broadcast so any open tab / component can react
  window.dispatchEvent(new CustomEvent('inviteos_notification', { detail: newNotif }))
  return newNotif
}

export function markAllRead(): void {
  const updated = getNotifications().map((n) => ({ ...n, read: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('inviteos_notifications_changed'))
}

export function clearNotifications(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  window.dispatchEvent(new CustomEvent('inviteos_notifications_changed'))
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length
}

// ── Web Audio notification sound ──────────────────────────────────────────────
/**
 * Plays a short chime using the Web Audio API — no audio file required.
 * Frequencies and timing are tuned for each event type.
 */
export function playNotificationSound(type: 'success' | 'info' | 'warning' = 'info'): void {
  try {
    const AudioCtxClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtxClass) return

    const ctx = new AudioCtxClass()

    interface Note { freq: number; delay: number; duration: number }
    const notes: Note[] =
      type === 'success'
        ? [
            { freq: 523.25, delay: 0,    duration: 0.22 }, // C5
            { freq: 659.25, delay: 0.12, duration: 0.22 }, // E5
            { freq: 783.99, delay: 0.24, duration: 0.32 }, // G5
          ]
        : type === 'warning'
        ? [
            { freq: 587.33, delay: 0,    duration: 0.22 }, // D5
            { freq: 440.00, delay: 0.14, duration: 0.3  }, // A4
          ]
        : [
            { freq: 440.00, delay: 0,    duration: 0.22 }, // A4
            { freq: 554.37, delay: 0.14, duration: 0.3  }, // C#5
          ]

    notes.forEach(({ freq, delay, duration }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)

      gain.gain.setValueAtTime(0, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + duration + 0.05)
    })
  } catch {
    // Silently ignore — AudioContext may not be available or blocked
  }
}
