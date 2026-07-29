/** Shared guest category options for admin add/edit UI. */
export const GUEST_CATEGORIES = [
  'Family',
  'Friends',
  'Bride Side',
  'Groom Side',
  'Neighbours',
  'Office',
  'Other',
] as const

export type GuestCategory = (typeof GUEST_CATEGORIES)[number]

export const DEFAULT_GUEST_CATEGORY: GuestCategory = 'Other'
