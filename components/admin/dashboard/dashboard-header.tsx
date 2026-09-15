'use client'

import { CalendarRange, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import type { ReactNode } from 'react'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) return 'Select dates'
  if (!range.to) return format(range.from, 'MMM d, yyyy')
  return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`
}

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
  search,
  onSearchChange,
  onRefresh,
  refreshing,
  notifications,
}: {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  search: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  refreshing?: boolean
  notifications?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#17233F] sm:text-[24px]">
            Wedding Admin Dashboard
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#15803D]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" />
            Live
          </span>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage your invitations, clients and grow your business
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1 sm:min-w-[240px] sm:flex-none">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients, invitations, events..."
            className="h-10 w-full rounded-xl border border-[#E6EAF0] bg-white pl-9 pr-12 text-sm text-[#17233F] outline-none ring-[#4D91FF]/30 placeholder:text-[#94A3B8] focus:ring-2"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#E6EAF0] bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-medium text-[#94A3B8] sm:inline">
            ⌘K
          </kbd>
        </label>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E6EAF0] bg-white px-3 text-xs font-medium text-[#64748B] transition hover:bg-[#F8FAFC]"
              aria-label="Date range"
            >
              <CalendarRange className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden />
              <span className="hidden whitespace-nowrap sm:inline">
                {formatRangeLabel(dateRange)}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-[#E6EAF0] p-0 shadow-lg" align="end">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>

        {notifications}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6EAF0] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )
}
