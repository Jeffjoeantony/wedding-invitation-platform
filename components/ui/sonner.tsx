'use client'

import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** Admin dashboard toast host — light theme to match the dashboard chrome. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      // Just below the sticky top bar (notification / sign out)
      offset={{ top: '5rem', right: '1rem' }}
      mobileOffset={{ top: '6.25rem', right: '0.75rem' }}
      richColors
      closeButton
      duration={4200}
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: 'font-semibold',
          description: 'text-sm opacity-90',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
