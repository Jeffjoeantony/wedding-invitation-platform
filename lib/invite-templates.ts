import type { CSSProperties } from 'react'

export const DEFAULT_DESIGN_TEMPLATE = 'eternal-vows'

export type InviteThemeTokens = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
  gold: string
  goldSoft: string
}

export type InviteDesignTemplate = {
  id: string
  name: string
  description: string
  eventTypes: readonly string[]
  /** Admin picker swatches (background, accent, gold). */
  preview: readonly [string, string, string]
  tokens: InviteThemeTokens
}

/** Current luxury ivory / champagne — matches `.invite-root` defaults. */
const eternalVows: InviteDesignTemplate = {
  id: 'eternal-vows',
  name: 'Eternal Vows',
  description: 'Ivory paper, champagne gold, classic stationery.',
  eventTypes: ['Wedding'],
  preview: ['#FAF7F2', '#EDE6DA', '#C4A46A'],
  tokens: {
    background: 'oklch(0.965 0.011 85)',
    foreground: 'oklch(0.235 0.012 60)',
    card: 'oklch(0.988 0.008 88)',
    cardForeground: 'oklch(0.235 0.012 60)',
    primary: 'oklch(0.2 0.008 60)',
    primaryForeground: 'oklch(0.97 0.01 85)',
    secondary: 'oklch(0.93 0.012 84)',
    secondaryForeground: 'oklch(0.28 0.012 60)',
    muted: 'oklch(0.93 0.012 84)',
    mutedForeground: 'oklch(0.52 0.014 68)',
    accent: 'oklch(0.9 0.03 82)',
    accentForeground: 'oklch(0.28 0.012 60)',
    border: 'oklch(0.86 0.016 82)',
    input: 'oklch(0.86 0.016 82)',
    ring: 'oklch(0.72 0.09 78)',
    gold: 'oklch(0.68 0.095 76)',
    goldSoft: 'oklch(0.82 0.06 82)',
  },
}

const blushGarden: InviteDesignTemplate = {
  id: 'blush-garden',
  name: 'Blush Garden',
  description: 'Rose-gold ink on warm blush paper.',
  eventTypes: ['Wedding'],
  preview: ['#FBF4F2', '#F3D6D4', '#C4787A'],
  tokens: {
    background: 'oklch(0.97 0.016 18)',
    foreground: 'oklch(0.28 0.04 18)',
    card: 'oklch(0.99 0.008 18)',
    cardForeground: 'oklch(0.28 0.04 18)',
    primary: 'oklch(0.36 0.09 18)',
    primaryForeground: 'oklch(0.98 0.01 18)',
    secondary: 'oklch(0.94 0.02 18)',
    secondaryForeground: 'oklch(0.32 0.05 18)',
    muted: 'oklch(0.94 0.02 18)',
    mutedForeground: 'oklch(0.52 0.04 18)',
    accent: 'oklch(0.9 0.05 18)',
    accentForeground: 'oklch(0.32 0.05 18)',
    border: 'oklch(0.88 0.03 18)',
    input: 'oklch(0.88 0.03 18)',
    ring: 'oklch(0.68 0.1 18)',
    gold: 'oklch(0.62 0.12 18)',
    goldSoft: 'oklch(0.84 0.06 18)',
  },
}

const midnightFormal: InviteDesignTemplate = {
  id: 'midnight-formal',
  name: 'Midnight Formal',
  description: 'Deep ink and champagne for an evening look.',
  eventTypes: ['Wedding'],
  preview: ['#1A1612', '#3D3428', '#D4C09A'],
  tokens: {
    background: 'oklch(0.2 0.018 70)',
    foreground: 'oklch(0.93 0.02 85)',
    card: 'oklch(0.24 0.02 70)',
    cardForeground: 'oklch(0.93 0.02 85)',
    primary: 'oklch(0.88 0.04 85)',
    primaryForeground: 'oklch(0.18 0.02 70)',
    secondary: 'oklch(0.28 0.02 72)',
    secondaryForeground: 'oklch(0.9 0.02 85)',
    muted: 'oklch(0.28 0.02 72)',
    mutedForeground: 'oklch(0.72 0.03 80)',
    accent: 'oklch(0.32 0.03 75)',
    accentForeground: 'oklch(0.92 0.02 85)',
    border: 'oklch(0.36 0.025 75)',
    input: 'oklch(0.36 0.025 75)',
    ring: 'oklch(0.78 0.08 85)',
    gold: 'oklch(0.78 0.09 85)',
    goldSoft: 'oklch(0.72 0.06 80)',
  },
}

const royalMaroon: InviteDesignTemplate = {
  id: 'royal-maroon',
  name: 'Royal Maroon',
  description: 'Deep maroon and gold, ceremonial and warm.',
  eventTypes: ['Wedding'],
  preview: ['#F7F1E8', '#6B1C2A', '#C4A46A'],
  tokens: {
    background: 'oklch(0.96 0.014 70)',
    foreground: 'oklch(0.26 0.06 25)',
    card: 'oklch(0.985 0.01 72)',
    cardForeground: 'oklch(0.26 0.06 25)',
    primary: 'oklch(0.35 0.1 25)',
    primaryForeground: 'oklch(0.97 0.01 75)',
    secondary: 'oklch(0.93 0.02 70)',
    secondaryForeground: 'oklch(0.32 0.07 25)',
    muted: 'oklch(0.93 0.02 70)',
    mutedForeground: 'oklch(0.48 0.04 30)',
    accent: 'oklch(0.45 0.12 25)',
    accentForeground: 'oklch(0.97 0.01 75)',
    border: 'oklch(0.84 0.03 55)',
    input: 'oklch(0.84 0.03 55)',
    ring: 'oklch(0.65 0.1 75)',
    gold: 'oklch(0.65 0.12 75)',
    goldSoft: 'oklch(0.8 0.07 70)',
  },
}

export const INVITE_DESIGN_TEMPLATES: readonly InviteDesignTemplate[] = [
  eternalVows,
  blushGarden,
  midnightFormal,
  royalMaroon,
]

const BY_ID = new Map(INVITE_DESIGN_TEMPLATES.map((t) => [t.id, t]))

export function isInviteTemplateId(id: string): boolean {
  return BY_ID.has(id)
}

export function getInviteTemplate(id?: string | null): InviteDesignTemplate | undefined {
  if (!id) return undefined
  return BY_ID.get(id)
}

export function resolveDesignTemplate(id?: string | null): InviteDesignTemplate {
  return getInviteTemplate(id) ?? eternalVows
}

/** Ceremony types that can pick a wedding-style invitation skin. */
const SKIN_EVENT_TYPES = new Set([
  'Wedding',
  'Engagement',
  'Reception',
  'Mehendi',
  'Haldi',
])

export function getInviteTemplates(eventType?: string | null): InviteDesignTemplate[] {
  if (!eventType || !SKIN_EVENT_TYPES.has(eventType)) return []
  return [...INVITE_DESIGN_TEMPLATES]
}

export function withDefaultDesignTemplate<T extends { design_template?: unknown }>(
  row: T,
): T & { design_template: string } {
  const raw = typeof row.design_template === 'string' ? row.design_template.trim() : ''
  return {
    ...row,
    design_template: isInviteTemplateId(raw) ? raw : DEFAULT_DESIGN_TEMPLATE,
  }
}

export function inviteThemeStyle(id?: string | null): CSSProperties {
  const { tokens } = resolveDesignTemplate(id)
  return {
    '--background': tokens.background,
    '--foreground': tokens.foreground,
    '--card': tokens.card,
    '--card-foreground': tokens.cardForeground,
    '--primary': tokens.primary,
    '--primary-foreground': tokens.primaryForeground,
    '--secondary': tokens.secondary,
    '--secondary-foreground': tokens.secondaryForeground,
    '--muted': tokens.muted,
    '--muted-foreground': tokens.mutedForeground,
    '--accent': tokens.accent,
    '--accent-foreground': tokens.accentForeground,
    '--border': tokens.border,
    '--input': tokens.input,
    '--ring': tokens.ring,
    '--gold': tokens.gold,
    '--gold-soft': tokens.goldSoft,
  } as CSSProperties
}
