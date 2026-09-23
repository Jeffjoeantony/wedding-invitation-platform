'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenueMetric, RevenuePoint } from '@/lib/dashboard/types'

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function RevenueAnalytics({
  series,
  metrics,
}: {
  series: RevenuePoint[]
  metrics: RevenueMetric[]
}) {
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_1px_3px_rgba(23,35,63,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold text-[#17233F]">Revenue Analytics</h3>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">Demo data — payments API not connected</p>
        </div>
        <span className="rounded-lg border border-[#E6EAF0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#64748B]">
          Monthly — This Year
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-xl border px-2.5 py-2 ${
              m.highlight
                ? 'border-[#86EFAC] bg-[#F0FDF4]'
                : 'border-[#EEF2F7] bg-[#F8FAFC]'
            }`}
          >
            <p className="text-[10px] font-medium text-[#94A3B8]">{m.label}</p>
            <p
              className={`mt-0.5 text-[13px] font-bold tabular-nums ${
                m.highlight ? 'text-[#15803D]' : 'text-[#17233F]'
              }`}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 min-h-[200px] flex-1">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C58B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22C58B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Revenue']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E6EAF0',
                boxShadow: '0 8px 24px rgba(23,35,63,0.1)',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22C58B"
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              activeDot={{ r: 5, fill: '#22C58B', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
