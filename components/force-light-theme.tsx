'use client'

import { ThemeProvider } from '@/components/theme-provider'

/**
 * Locks invitation (and other public) surfaces to light mode so dashboard
 * theme preference never restyles guest invite links.
 */
export function ForceLightTheme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
