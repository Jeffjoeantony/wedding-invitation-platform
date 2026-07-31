import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

/**
 * Admin shell — toast host for dashboard feedback.
 * ThemeProvider is at the root when present; invite routes force light separately.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-app min-h-screen">
      {children}
      <Toaster />
    </div>
  )
}
