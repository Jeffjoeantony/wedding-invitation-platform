import type { ReactNode } from 'react'

/**
 * Admin shell marker — theme toggle lives in dashboard UI.
 * ThemeProvider is at the root; invite routes force light separately.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-app min-h-screen">{children}</div>
}
