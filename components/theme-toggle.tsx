'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
  /** Compact icon button for dense headers */
  size?: 'sm' | 'md'
}

/**
 * Light/dark toggle for the admin dashboard.
 * Icons are CSS-driven (`dark:hidden` / `hidden dark:block`) to avoid hydration flash.
 */
export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const dim = size === 'sm' ? 'h-9 w-9' : 'h-9 w-9 sm:w-auto sm:px-3.5'
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-[14px] w-[14px]'

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-gray-200 bg-[#FAFAFA] text-gray-500 text-[13px] font-semibold transition-colors',
        'hover:bg-gray-100 hover:text-gray-700',
        'dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100',
        dim,
        className,
      )}
      aria-label="Toggle light and dark mode"
      title="Toggle theme"
    >
      <Sun className={cn(icon, 'dark:hidden')} strokeWidth={2} aria-hidden />
      <Moon className={cn(icon, 'hidden dark:block')} strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline dark:hidden">Light</span>
      <span className="hidden sm:inline dark:inline">Dark</span>
    </button>
  )
}
