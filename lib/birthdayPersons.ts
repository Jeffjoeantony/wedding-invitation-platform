const SEP = '|'

/** Parse additional birthday honorees from couple_2 (pipe-separated; legacy single name supported). */
export function parseAdditionalBirthdayPersons(couple2?: string | null): string[] {
  if (!couple2?.trim()) return []
  if (couple2.includes(SEP)) {
    return couple2.split(SEP).map((n) => n.trim()).filter(Boolean)
  }
  return [couple2.trim()]
}

export function serializeAdditionalBirthdayPersons(names: string[]): string {
  return names.map((n) => n.trim()).filter(Boolean).join(SEP)
}

/** e.g. "Anna & Alan & Bob" */
export function formatBirthdayPersonsDisplay(couple1?: string | null, couple2?: string | null): string {
  const parts = [couple1?.trim(), ...parseAdditionalBirthdayPersons(couple2)].filter(Boolean)
  return parts.join(' & ')
}

export function allBirthdayPersons(couple1?: string | null, couple2?: string | null): string[] {
  return [couple1?.trim(), ...parseAdditionalBirthdayPersons(couple2)].filter(Boolean) as string[]
}
