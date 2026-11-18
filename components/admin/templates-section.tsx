'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { POPULAR_WEBSITES } from '@/components/landing/constants'
import { cn } from '@/lib/utils'

type TemplateCard = {
  slug: string
  title: string
  price: string
  image: string
  category: string
  description: string
  tone: string
  hasPreview: boolean
}

const DESCRIPTIONS: Record<string, string> = {
  'classic-romance':
    'Deep burgundy florals, cream paper, script names, venue map, dress-code palette, and RSVP.',
  'nikah-arch':
    'Elegant arch framing with calm typography — ideal for Nikah and sacred gatherings.',
  'wine-gold':
    'Luxury burgundy overlays, champagne paper, gold names, and a torn-edge invitation layout.',
  'royal-heritage':
    'Deep heritage styling with classic hierarchy for grand wedding invitations.',
  'eternal-vows':
    'Portrait-led layout with timeless serif accents for classic wedding stories.',
  'promise-evening':
    'Warm evening tones for engagements and promise dinners with close family.',
  'golden-portrait':
    'Editorial couple photography with generous space for names and date.',
  'bridal-bloom':
    'Romantic bridal imagery with soft blooms for feminine, floral-forward invites.',
}

const CATEGORIES: Record<string, string> = {
  'classic-romance': 'Wedding',
  'nikah-arch': 'Nikah',
  'wine-gold': 'Wedding',
  'royal-heritage': 'Wedding',
  'eternal-vows': 'Wedding',
  'promise-evening': 'Engagement',
  'golden-portrait': 'Portrait',
  'bridal-bloom': 'Bridal',
}

/** Soft card washes — same structure as the reference card, wedding imagery instead of abstract art */
const TONES = [
  'linear-gradient(180deg, #EEF4FF 0%, #F8FBFF 55%, #FFFFFF 100%)',
  'linear-gradient(180deg, #F7F0EA 0%, #FCFAF7 55%, #FFFFFF 100%)',
  'linear-gradient(180deg, #F3EEE8 0%, #FAF8F5 55%, #FFFFFF 100%)',
  'linear-gradient(180deg, #F0F4F1 0%, #F7FAF8 55%, #FFFFFF 100%)',
  'linear-gradient(180deg, #F6EFF2 0%, #FBF7F9 55%, #FFFFFF 100%)',
  'linear-gradient(180deg, #F1F0F6 0%, #F8F7FB 55%, #FFFFFF 100%)',
]

const FILTERS = ['All', 'Wedding', 'Engagement', 'Nikah', 'Bridal', 'Portrait'] as const

/** Templates with a live invitation preview route under /templates/[slug]/preview */
const PREVIEW_SLUGS = new Set(['classic-romance', 'wine-gold'])

function buildTemplates(): TemplateCard[] {
  return POPULAR_WEBSITES.map((item, index) => ({
    slug: item.slug,
    title: item.title,
    price: item.price,
    image: item.image,
    category: CATEGORIES[item.slug] ?? 'Wedding',
    description:
      DESCRIPTIONS[item.slug] ??
      'A polished invitation layout ready to preview, customize, and share with guests.',
    tone: TONES[index % TONES.length],
    hasPreview: PREVIEW_SLUGS.has(item.slug),
  }))
}

function adminTemplateHref(slug: string) {
  return `/admin/templates/${slug}`
}

export function TemplatesSection() {
  const pathname = usePathname()
  const templates = useMemo(() => buildTemplates(), [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [selected, setSelected] = useState<string | null>(null)

  const detailSlug = pathname.startsWith('/admin/templates/')
    ? pathname.replace('/admin/templates/', '').split('/')[0] || null
    : null
  const detail = detailSlug ? templates.find((t) => t.slug === detailSlug) ?? null : null

  const visible = templates.filter((t) => {
    const matchesFilter = filter === 'All' || t.category === filter
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    return matchesFilter && matchesQuery
  })

  if (detailSlug && !detail) {
    return (
      <div className="mx-auto w-full max-w-[720px] rounded-2xl border border-dashed border-[#E6EAF0] bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-[#17233F]">Template not found</p>
        <Link
          href="/admin/templates"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#17233F]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to templates
        </Link>
      </div>
    )
  }

  if (detail) {
    return (
      <div className="mx-auto w-full max-w-[720px]">
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#94A3B8] transition hover:text-[#17233F]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All templates
        </Link>

        <div
          className="mt-5 overflow-hidden rounded-[28px] border border-[#E6EAF0] shadow-[0_8px_28px_rgba(23,35,63,0.06)]"
          style={{ background: detail.tone }}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={detail.image}
              alt={detail.title}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
              priority
            />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#17233F] backdrop-blur-sm">
              {detail.category}
            </span>
            <span className="absolute right-4 top-4 rounded-full bg-[#17233F]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              {detail.price}
            </span>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <h1 className="text-[28px] font-bold tracking-tight text-[#17233F]">{detail.title}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#64748B]">{detail.description}</p>
            <p className="mt-4 text-lg font-semibold text-[#17233F]">{detail.price}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {detail.hasPreview ? (
                <Link
                  href={`/templates/${detail.slug}/preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[#17233F] px-6 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0F172A]"
                >
                  Preview invitation
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-full bg-[#17233F] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white opacity-45"
                >
                  Preview coming soon
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelected(detail.slug)}
                className={cn(
                  'inline-flex flex-1 items-center justify-center rounded-full border px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition',
                  selected === detail.slug
                    ? 'border-[#17233F] bg-[#17233F] text-white'
                    : 'border-[#E6EAF0] bg-white text-[#17233F] hover:border-[#CBD5E1]',
                )}
              >
                {selected === detail.slug ? 'Selected' : 'Select template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#94A3B8]">Manage › Templates</p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#17233F]">Templates</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
            Browse invitation layouts for selection and reference. Explore a design to preview it.
          </p>
        </div>
        {selected ? (
          <p className="rounded-full border border-[#E6EAF0] bg-white px-3 py-1.5 text-xs font-semibold text-[#17233F]">
            Selected: {templates.find((t) => t.slug === selected)?.title}
          </p>
        ) : null}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative min-w-0 flex-1 sm:max-w-[280px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="h-10 w-full rounded-xl border border-[#E6EAF0] bg-white pl-9 pr-3 text-sm text-[#17233F] outline-none placeholder:text-[#94A3B8] focus:border-[#CBD5E1] focus:ring-2 focus:ring-[#17233F]/10"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                filter === item
                  ? 'bg-[#17233F] text-white'
                  : 'border border-[#E6EAF0] bg-white text-[#64748B] hover:bg-[#F8FAFC]',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6EAF0] bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-[#17233F]">No templates match</p>
          <p className="mt-1 text-sm text-[#94A3B8]">Try another search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((template) => {
            const isSelected = selected === template.slug
            return (
              <article
                key={template.slug}
                className={cn(
                  'group flex flex-col overflow-hidden rounded-[28px] border shadow-[0_8px_28px_rgba(23,35,63,0.06)] transition',
                  isSelected
                    ? 'border-[#17233F] ring-2 ring-[#17233F]/15'
                    : 'border-[#E6EAF0] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(23,35,63,0.1)]',
                )}
                style={{ background: template.tone }}
              >
                <Link
                  href={adminTemplateHref(template.slug)}
                  className="relative block aspect-[4/3] w-full overflow-hidden text-left"
                  aria-label={`Explore ${template.title}`}
                >
                  <Image
                    src={template.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#17233F] backdrop-blur-sm">
                    {template.category}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-[#17233F]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                    {template.price}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <h3 className="text-[20px] font-bold leading-snug tracking-tight text-[#17233F]">
                    {template.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">
                    {template.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Link
                      href={adminTemplateHref(template.slug)}
                      className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#17233F] transition hover:gap-2"
                    >
                      Explore
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(template.slug)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-[12px] font-semibold transition',
                        isSelected
                          ? 'bg-[#17233F] text-white'
                          : 'border border-[#E6EAF0] bg-white/80 text-[#64748B] hover:text-[#17233F]',
                      )}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
