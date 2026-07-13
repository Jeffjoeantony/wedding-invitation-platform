'use client'

import { useSyncExternalStore } from 'react'

/** Real phones / tablets — not narrowed laptop windows. */
const QUERY = '(hover: none) and (pointer: coarse)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

/** True on touch-first devices — keeps laptop / trackpad on the desktop path. */
export function useMobileMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
