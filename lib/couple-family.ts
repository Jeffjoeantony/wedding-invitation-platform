/** Flat couple/family columns on `projects` (traditional invite details). */

export const COUPLE_ROLES = ['bride', 'groom', 'partner'] as const
export type CoupleRole = (typeof COUPLE_ROLES)[number]

export const COUPLE_FAMILY_FIELDS = [
  // Legacy freeform parents line (kept for backwards compatibility)
  'couple_1_parents',
  'couple_2_parents',
  'couple_1_house',
  'couple_2_house',
  'couple_1_place',
  'couple_2_place',
  // Structured fields
  'couple_1_role',
  'couple_2_role',
  'couple_1_father',
  'couple_1_mother',
  'couple_2_father',
  'couple_2_mother',
] as const

export type CoupleFamilyField = (typeof COUPLE_FAMILY_FIELDS)[number]

export type CoupleFamilyDetails = {
  couple_1_parents?: string | null
  couple_1_house?: string | null
  couple_2_parents?: string | null
  couple_2_house?: string | null
  couple_1_place?: string | null
  couple_2_place?: string | null
  couple_1_role?: string | null
  couple_2_role?: string | null
  couple_1_father?: string | null
  couple_1_mother?: string | null
  couple_2_father?: string | null
  couple_2_mother?: string | null
}

const FAMILY_COL_RE = /couple_[12]_(parents|house|place|role|father|mother)/i

export function isMissingCoupleFamilyColumn(message?: string | null) {
  return FAMILY_COL_RE.test(message || '')
}

/** Event templates that show bride/groom family fields in admin + invite. */
export function showsCoupleFamilyDetails(template?: string | null) {
  switch (template) {
    case 'Wedding':
    case 'Engagement':
    case 'Reception':
    case 'Mehendi':
    case 'Haldi':
    case 'Save The Date':
      return true
    default:
      return false
  }
}

export function parseCoupleRole(value?: string | null): CoupleRole | null {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'bride' || v === 'groom' || v === 'partner') return v
  return null
}

export function coupleRoleLabel(role?: string | null): string {
  switch (parseCoupleRole(role)) {
    case 'bride':
      return 'Bride'
    case 'groom':
      return 'Groom'
    case 'partner':
      return 'Partner'
    default:
      return 'Role'
  }
}

/** Bride → D/o · Groom → S/o */
export function formatRelationAbbrev(role?: string | null): string | undefined {
  const r = parseCoupleRole(role)
  if (r === 'bride') return 'D/o'
  if (r === 'groom') return 'S/o'
  return undefined
}

/** Strip leading Mr/Mrs/Ms titles so we can re-apply consistently. */
function stripHonorific(name: string): string {
  return name.replace(/^(mr\.?|mrs\.?|ms\.?|miss)\s+/i, '').trim()
}

/** Join father & mother into "Mr. A & Mrs. B". */
export function formatParentNames(father?: string | null, mother?: string | null): string {
  return formatParentNameParts(father, mother).join(' & ')
}

/** Titled parent segments for invite layout (wrap only between parts). */
export function formatParentNameParts(
  father?: string | null,
  mother?: string | null,
): string[] {
  const fatherName = stripHonorific(String(father ?? '').trim())
  const motherName = stripHonorific(String(mother ?? '').trim())
  const parts: string[] = []
  if (fatherName) parts.push(`Mr. ${fatherName}`)
  if (motherName) parts.push(`Mrs. ${motherName}`)
  return parts
}

/**
 * Split a parents display string into wrap-safe segments.
 * Prefers structured "A & B"; otherwise returns a single segment.
 */
export function splitParentsForDisplay(parents?: string | null): string[] {
  const trimmed = String(parents ?? '').trim()
  if (!trimmed) return []
  const parts = trimmed
    .split(/\s+&\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [trimmed]
}

/**
 * Build invite line from role + parent names.
 * Bride → Daughter of … · Groom → Son of … · else → of …
 * @deprecated Prefer formatRelationAbbrev + formatParentNames for invite display.
 */
export function formatParentsLine(
  role: CoupleRole | string | null | undefined,
  father?: string | null,
  mother?: string | null,
): string | undefined {
  const parents = formatParentNames(father, mother)
  if (!parents) return undefined
  const r = parseCoupleRole(role)
  if (r === 'bride') return `Daughter of ${parents}`
  if (r === 'groom') return `Son of ${parents}`
  return `of ${parents}`
}

/** First token of a full name — used for the hero name card / monogram. */
export function extractFirstName(fullName?: string | null): string {
  const trimmed = String(fullName ?? '').trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0] || trimmed
}

/**
 * Parent names only (no Daughter/Son of). Structured first; legacy freeform stripped.
 */
export function resolveParentNamesOnly(input: {
  father?: string | null
  mother?: string | null
  legacyParents?: string | null
}): string | undefined {
  const structured = formatParentNames(input.father, input.mother)
  if (structured) return structured
  const legacy = input.legacyParents?.trim()
  if (!legacy) return undefined
  return legacy.replace(/^(Daughter of|Son of|of)\s+/i, '').trim() || legacy
}

/**
 * Prefer structured father/mother; fall back to legacy freeform parents text.
 */
export function resolveParentsDisplayLine(input: {
  role?: string | null
  father?: string | null
  mother?: string | null
  legacyParents?: string | null
}): string | undefined {
  const structured = formatParentsLine(input.role, input.father, input.mother)
  if (structured) return structured
  const legacy = input.legacyParents?.trim()
  return legacy || undefined
}

/**
 * House + place. If place is empty and house contains a comma
 * ("Kayamkulathusserry, Koothrappally"), split for display.
 */
export function resolveHouseAndPlace(
  house?: string | null,
  place?: string | null,
): { house?: string; place?: string } {
  const placeTrim = String(place ?? '').trim()
  const houseTrim = String(house ?? '').trim()
  if (placeTrim) {
    let houseOut = houseTrim
    const suffix = `, ${placeTrim}`
    if (houseOut.toLowerCase().endsWith(suffix.toLowerCase())) {
      houseOut = houseOut.slice(0, -suffix.length).trim()
    }
    return {
      house: houseOut || undefined,
      place: placeTrim,
    }
  }
  const comma = houseTrim.indexOf(',')
  if (comma > 0) {
    const left = houseTrim.slice(0, comma).trim()
    const right = houseTrim.slice(comma + 1).trim()
    return {
      house: left || undefined,
      place: right || undefined,
    }
  }
  return { house: houseTrim || undefined, place: undefined }
}

export type CoupleFamilySideDisplay = {
  name: string
  relation?: string
  parents?: string
  house?: string
  place?: string
}

export function buildCoupleFamilySide(input: {
  name: string
  role?: string | null
  father?: string | null
  mother?: string | null
  legacyParents?: string | null
  house?: string | null
  place?: string | null
}): CoupleFamilySideDisplay {
  const { house, place } = resolveHouseAndPlace(input.house, input.place)
  const parents = resolveParentNamesOnly({
    father: input.father,
    mother: input.mother,
    legacyParents: input.legacyParents,
  })
  return {
    name: input.name,
    relation: parents ? formatRelationAbbrev(input.role) : undefined,
    parents,
    house,
    place,
  }
}

export function coupleFamilySideHasDetails(side: CoupleFamilySideDisplay) {
  return Boolean(side.parents || side.house || side.place)
}

export const EMPTY_COUPLE_FAMILY: Required<CoupleFamilyDetails> = {
  couple_1_parents: null,
  couple_1_house: null,
  couple_2_parents: null,
  couple_2_house: null,
  couple_1_place: null,
  couple_2_place: null,
  couple_1_role: null,
  couple_2_role: null,
  couple_1_father: null,
  couple_1_mother: null,
  couple_2_father: null,
  couple_2_mother: null,
}

const FAMILY_SELECT_WITHOUT_PLACE =
  'couple_1_parents,couple_1_house,couple_2_parents,couple_2_house,couple_1_role,couple_2_role,couple_1_father,couple_1_mother,couple_2_father,couple_2_mother'

const FAMILY_SELECT = `${FAMILY_SELECT_WITHOUT_PLACE},couple_1_place,couple_2_place`

/** When only place columns are missing, keep other family fields. */
export const PROJECT_EVENT_FAMILY_SELECT_WITHOUT_PLACE = FAMILY_SELECT_WITHOUT_PLACE

export const EMPTY_PLACE_FIELDS = {
  couple_1_place: null as string | null,
  couple_2_place: null as string | null,
}

/** Core project event columns (no events JSONB, no family). */
export const PROJECT_EVENT_CORE_SELECT =
  'id,couple_1,couple_2,date,time,venue,location,contact,maps_url,event_template'

/** Admin event GET: core + status/name + events + family. */
export const PROJECT_EVENT_ADMIN_SELECT = `${PROJECT_EVENT_CORE_SELECT},status,name,events,${FAMILY_SELECT}`

/** Invite / public project GET. */
export const PROJECT_EVENT_INVITE_SELECT = `${PROJECT_EVENT_CORE_SELECT},events,${FAMILY_SELECT}`
