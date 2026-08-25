'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MediaUploader } from '@/components/admin/media-uploader'
import { EventsIncludedEditor } from '@/components/admin/events-included-editor'
import {
  buildCoupleFamilySide,
  extractFirstName,
  showsCoupleFamilyDetails,
} from '@/lib/couple-family'
import {
  formatEventDateLabel,
  formatEventTime,
  fullEventAddress,
  getMapsUrl,
  resolveProjectEvents,
  resetEventsToPrimary,
} from '@/lib/project-events'
import type { MediaItem } from '@/lib/invite-media'
import { MAX_GALLERY_IMAGES } from '@/lib/invite-media'
import {
  getInviteTemplates,
  inviteThemeStyle,
  resolveDesignTemplate,
} from '@/lib/invite-templates'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ExternalLink,
  MapPin,
  Palette,
  Phone,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'

export type EventDetailsProject = {
  name: string
  couple_1: string
  couple_2: string
  couple_1_parents?: string | null
  couple_1_house?: string | null
  couple_1_place?: string | null
  couple_2_parents?: string | null
  couple_2_house?: string | null
  couple_2_place?: string | null
  couple_1_role?: string | null
  couple_2_role?: string | null
  couple_1_father?: string | null
  couple_1_mother?: string | null
  couple_2_father?: string | null
  couple_2_mother?: string | null
  date: string
  time: string
  venue: string
  location: string
  maps_url?: string
  contact: string
  event_template?: string | null
  design_template?: string | null
  events?: unknown
}

type UpdateProject = (
  updates: Record<string, unknown>,
  options?: { immediate?: boolean },
) => void

const EVENT_TYPES = ['Engagement', 'Wedding', 'Reception', 'Mehendi', 'Haldi'] as const

function mapsEmbedSrc(raw: string | undefined, fallbackAddress: string): string | null {
  if (!raw?.trim() && !fallbackAddress.trim()) return null
  const query =
    raw && !/^https?:\/\//i.test(raw.trim())
      ? raw.trim()
      : fallbackAddress.trim() || raw?.trim() || ''
  if (!query) return null
  // Prefer search embed — works for addresses and most pasted Maps links via query
  const searchQuery =
    raw && /^https?:\/\//i.test(raw.trim()) && !fallbackAddress.trim()
      ? raw.trim()
      : query
  return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&z=14&output=embed`
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description?: string
}) {
  return (
    <div>
      <p className="text-lg font-semibold tracking-tight text-gray-900">
        <span className="mr-2 text-rose-700">{number}.</span>
        {title}
      </p>
      {description ? <p className="mt-1 text-xs text-gray-500">{description}</p> : null}
    </div>
  )
}

export function EventDetailsPanel({
  project,
  projectFormKey,
  projectSaveStatus,
  projectSaveError,
  galleryImages,
  galleryUploading,
  galleryError,
  deletingProject,
  birthdayFields,
  onUpdateProject,
  onUploadGallery,
  onRemoveGalleryImage,
  onDeleteProject,
}: {
  project: EventDetailsProject
  projectFormKey: number
  projectSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  projectSaveError: string
  galleryImages: MediaItem[]
  galleryUploading: boolean
  galleryError: string
  deletingProject: boolean
  birthdayFields: ReactNode
  onUpdateProject: UpdateProject
  onUploadGallery: (files: File[]) => Promise<void>
  onRemoveGalleryImage: (imageId: string) => Promise<void>
  onDeleteProject: () => void
}) {
  const isBirthday = project.event_template === 'Birthday'
  const showFamily = showsCoupleFamilyDetails(project.event_template)
  const templateOptions = getInviteTemplates(project.event_template)
  const selectedDesign = resolveDesignTemplate(project.design_template)
  const events = resolveProjectEvents(project)
  const primaryEvent = events[0]
  const venueAddress = isBirthday
    ? fullEventAddress(project.venue || '', project.location || '')
    : fullEventAddress(primaryEvent?.venue || '', primaryEvent?.location || '')
  const mapsRaw = isBirthday ? project.maps_url : primaryEvent?.maps_url
  const embedSrc = mapsEmbedSrc(mapsRaw || undefined, venueAddress)
  const mapsOpenUrl = getMapsUrl(mapsRaw || undefined, venueAddress)

  const monogram = [
    extractFirstName(project.couple_1).charAt(0),
    extractFirstName(project.couple_2).charAt(0),
  ]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '♥'

  const previewDate = isBirthday
    ? [formatEventDateLabel(project.date), formatEventTime(project.time)].filter(Boolean).join(' · ')
    : [formatEventDateLabel(primaryEvent?.date), formatEventTime(primaryEvent?.time)]
        .filter(Boolean)
        .join(' · ')

  const familySides = showFamily
    ? (
        [
          {
            key: '1' as const,
            name: project.couple_1?.trim() || 'Partner 1',
            role: project.couple_1_role,
            father: project.couple_1_father,
            mother: project.couple_1_mother,
            house: project.couple_1_house,
            place: project.couple_1_place,
            defaultRole: 'bride' as const,
            roleKey: 'couple_1_role' as const,
            fatherKey: 'couple_1_father' as const,
            motherKey: 'couple_1_mother' as const,
            houseKey: 'couple_1_house' as const,
            placeKey: 'couple_1_place' as const,
          },
          {
            key: '2' as const,
            name: project.couple_2?.trim() || 'Partner 2',
            role: project.couple_2_role,
            father: project.couple_2_father,
            mother: project.couple_2_mother,
            house: project.couple_2_house,
            place: project.couple_2_place,
            defaultRole: 'groom' as const,
            roleKey: 'couple_2_role' as const,
            fatherKey: 'couple_2_father' as const,
            motherKey: 'couple_2_mother' as const,
            houseKey: 'couple_2_house' as const,
            placeKey: 'couple_2_place' as const,
          },
        ] as const
      )
    : []

  const hasName = Boolean(project.name?.trim())
  const hasPartners = isBirthday
    ? Boolean(project.couple_1?.trim())
    : Boolean(project.couple_1?.trim() && project.couple_2?.trim())
  const hasFamily = !showFamily
    ? true
    : familySides.some((side) =>
        Boolean(
          side.father?.trim() ||
            side.mother?.trim() ||
            side.house?.trim() ||
            side.place?.trim(),
        ),
      )
  const hasEvents = isBirthday
    ? Boolean(project.date?.trim() && project.venue?.trim())
    : events.some((ev) => Boolean(ev.date?.trim() && ev.venue?.trim()))
  const hasGallery = galleryImages.length > 0

  const completeness = [
    { id: 'name', label: 'Project name', done: hasName },
    { id: 'partners', label: 'Partners', done: hasPartners },
    ...(showFamily ? [{ id: 'family', label: 'Family', done: hasFamily }] : []),
    { id: 'events', label: 'Events', done: hasEvents },
    { id: 'gallery', label: 'Gallery', done: hasGallery },
  ]
  const completedCount = completeness.filter((c) => c.done).length
  const completenessPct = Math.round((completedCount / completeness.length) * 100)

  const setEventType = (val: string) => {
    const nextTemplate = val as EventDetailsProject['event_template']
    const nextEvents = resetEventsToPrimary(project, nextTemplate || 'Wedding')
    onUpdateProject(
      { event_template: nextTemplate, events: nextEvents },
      { immediate: true },
    )
  }

  return (
    <div
      key={projectFormKey}
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]"
    >
      <div className="min-w-0 space-y-5">
        {/* Project basics */}
        <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_10px_35px_rgba(31,41,55,0.07)]">
          <CardHeader className="border-b border-gray-100 px-5 py-4 sm:px-7">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-gray-900">
                  Project basics
                </CardTitle>
                <CardDescription className="mt-1">
                  Name, event type, and who this celebration is for.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-5 sm:px-7">
            <div>
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                defaultValue={project.name}
                onChange={(e) => onUpdateProject({ name: e.target.value })}
                className="mt-2 h-11 rounded-xl border-gray-200"
              />
            </div>

            <div>
              <Label>Event type</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => {
                  const selected = (project.event_template ?? 'Wedding') === type
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setEventType(type)}
                      className={`min-h-10 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
                        selected
                          ? 'border-[#9D022C] bg-[#9D022C] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50/40'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Theme preset. Use Events included below to invite for Engagement and Wedding together.
              </p>
            </div>

            {isBirthday ? (
              birthdayFields
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Partner 1 full name</Label>
                  <Input
                    defaultValue={project.couple_1}
                    placeholder="e.g. Rita Maria Chacko"
                    onChange={(e) => onUpdateProject({ couple_1: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-gray-200"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Invite name card shows the first name only; family section shows the full name.
                  </p>
                </div>
                <div>
                  <Label>Partner 2 full name</Label>
                  <Input
                    defaultValue={project.couple_2}
                    placeholder="e.g. Alan Joseph"
                    onChange={(e) => onUpdateProject({ couple_2: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-gray-200"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family details */}
        {showFamily ? (
          <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_10px_35px_rgba(31,41,55,0.07)]">
            <CardHeader className="border-b border-gray-100 px-5 py-4 sm:px-7">
              <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-gray-900">
                Family details
              </CardTitle>
              <CardDescription className="mt-1">
                Role drives D/o or S/o. Invite shows name, relation, parents, house, then place.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-5 sm:px-7">
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                {familySides.map((side, index) => {
                  const roleValue = side.role || side.defaultRole
                  const sideCard = (
                      <div className="space-y-4 rounded-2xl border border-rose-100/80 bg-rose-50/30 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700/80">
                          {side.name}
                        </p>
                        <div className="space-y-3">
                            <div>
                              <Label htmlFor={`couple-${side.key}-role`}>Role</Label>
                              <Select
                                value={roleValue}
                                onValueChange={(val) =>
                                  onUpdateProject({ [side.roleKey]: val }, { immediate: true })
                                }
                              >
                                <SelectTrigger
                                  id={`couple-${side.key}-role`}
                                  className="mt-2 rounded-xl"
                                >
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bride">Bride</SelectItem>
                                  <SelectItem value="groom">Groom</SelectItem>
                                  <SelectItem value="partner">Partner</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`couple-${side.key}-father`}>Father&apos;s name</Label>
                              <Input
                                id={`couple-${side.key}-father`}
                                defaultValue={side.father || ''}
                                placeholder="Father's full name"
                                onChange={(e) =>
                                  onUpdateProject({
                                    [side.fatherKey]: e.target.value,
                                    ...(!side.role ? { [side.roleKey]: side.defaultRole } : {}),
                                  })
                                }
                                className="mt-2 rounded-xl border-gray-200"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`couple-${side.key}-mother`}>Mother&apos;s name</Label>
                              <Input
                                id={`couple-${side.key}-mother`}
                                defaultValue={side.mother || ''}
                                placeholder="Mother's full name"
                                onChange={(e) =>
                                  onUpdateProject({
                                    [side.motherKey]: e.target.value,
                                    ...(!side.role ? { [side.roleKey]: side.defaultRole } : {}),
                                  })
                                }
                                className="mt-2 rounded-xl border-gray-200"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`couple-${side.key}-house`}>House name</Label>
                              <Input
                                id={`couple-${side.key}-house`}
                                defaultValue={side.house || ''}
                                placeholder="House or family name"
                                onChange={(e) =>
                                  onUpdateProject({ [side.houseKey]: e.target.value })
                                }
                                className="mt-2 rounded-xl border-gray-200"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`couple-${side.key}-place`}>Place</Label>
                              <Input
                                id={`couple-${side.key}-place`}
                                defaultValue={side.place || ''}
                                placeholder="Place or locality"
                                onChange={(e) =>
                                  onUpdateProject({ [side.placeKey]: e.target.value })
                                }
                                className="mt-2 rounded-xl border-gray-200"
                              />
                            </div>
                        </div>
                      </div>
                  )

                  if (index === 0) {
                    return (
                      <div key={side.key} className="min-w-0 space-y-4">
                        {sideCard}
                      </div>
                    )
                  }

                  return (
                    <div key={side.key} className="contents">
                      <div className="hidden items-center justify-center self-center lg:flex">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 font-serif text-sm font-semibold tracking-wide text-rose-800 ring-1 ring-inset ring-rose-100">
                          {monogram}
                        </span>
                      </div>
                      <div className="min-w-0 space-y-4">{sideCard}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Events / schedule */}
        <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_10px_35px_rgba(31,41,55,0.07)]">
          <CardContent className="space-y-6 px-5 py-5 sm:px-7">
            {!isBirthday ? (
              <EventsIncludedEditor
                project={project}
                onChange={(nextEvents) =>
                  onUpdateProject({ events: nextEvents }, { immediate: true })
                }
              />
            ) : (
              <div className="space-y-4">
                <SectionHeading
                  number={1}
                  title="Event details"
                  description="Date, time, and venue for the birthday celebration."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      defaultValue={project.date}
                      onChange={(e) => onUpdateProject({ date: e.target.value })}
                      className="mt-2 h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      defaultValue={project.time}
                      onChange={(e) => onUpdateProject({ time: e.target.value })}
                      className="mt-2 h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <Input
                      defaultValue={project.venue}
                      onChange={(e) => onUpdateProject({ venue: e.target.value })}
                      className="mt-2 h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <Label>Location / City</Label>
                    <Input
                      defaultValue={project.location}
                      onChange={(e) => onUpdateProject({ location: e.target.value })}
                      className="mt-2 h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Maps link or address</Label>
                    <Input
                      defaultValue={project.maps_url || ''}
                      onChange={(e) => onUpdateProject({ maps_url: e.target.value })}
                      placeholder="Paste a Google Maps URL, address, or Plus Code"
                      className="mt-2 h-11 rounded-xl border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-gray-100 pt-5">
              <SectionHeading number={isBirthday ? 2 : 3} title="Contact" />
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <Label htmlFor="project-contact" className="text-xs text-gray-500">
                    Contact number
                  </Label>
                  <Input
                    id="project-contact"
                    defaultValue={project.contact}
                    onChange={(e) => onUpdateProject({ contact: e.target.value })}
                    className="mt-1 h-10 rounded-xl border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-5">
              <SectionHeading
                number={isBirthday ? 3 : 4}
                title="Invite gallery"
                description="Shared photos shown on every invite link."
              />
              <MediaUploader
                title=""
                description=""
                images={galleryImages}
                max={MAX_GALLERY_IMAGES}
                uploading={galleryUploading}
                onUpload={onUploadGallery}
                onRemove={onRemoveGalleryImage}
              />
              {galleryError ? <p className="text-xs text-red-600">{galleryError}</p> : null}
            </div>

            <p
              className={`text-xs flex items-center gap-1.5 ${
                projectSaveStatus === 'error'
                  ? 'text-red-600'
                  : projectSaveStatus === 'saving'
                    ? 'text-amber-600'
                    : 'text-gray-400 italic'
              }`}
            >
              {projectSaveStatus === 'saving' ? (
                <>Saving…</>
              ) : projectSaveStatus === 'error' ? (
                <>
                  <span>⚠</span> {projectSaveError || 'Couldn’t save changes'}
                </>
              ) : projectSaveStatus === 'saved' ? (
                <>
                  <span>✓</span> All changes saved
                </>
              ) : (
                <>
                  <span>✓</span> Changes are saved automatically
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Invitation templates */}
        {templateOptions.length > 0 ? (
          <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_10px_35px_rgba(31,41,55,0.07)]">
            <CardHeader className="border-b border-gray-100 px-5 py-4 sm:px-7">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
                  <Palette className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-gray-900">
                    Templates
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select a skin for your wedding invitation. Applies to every guest and open invite link.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-5 sm:px-7">
              <div className="grid gap-3 sm:grid-cols-2">
                {templateOptions.map((tpl) => {
                  const selected = selectedDesign.id === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onUpdateProject({ design_template: tpl.id }, { immediate: true })
                      }
                      className={`group relative overflow-hidden rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                        selected
                          ? 'border-violet-400 bg-violet-50/40 shadow-[0_8px_24px_rgba(91,33,182,0.12)] ring-2 ring-violet-300/70'
                          : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/20'
                      }`}
                    >
                      <div className="flex h-14 border-b border-black/[0.06]">
                        <div className="flex-[3]" style={{ background: tpl.preview[0] }} />
                        <div className="flex-[2]" style={{ background: tpl.preview[1] }} />
                        <div className="w-10 shrink-0" style={{ background: tpl.preview[2] }} />
                      </div>
                      <div className="px-4 py-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                            <p className="mt-1 text-xs leading-snug text-gray-500">{tpl.description}</p>
                          </div>
                          {selected ? (
                            <CheckCircle2
                              className="h-5 w-5 shrink-0 text-violet-600"
                              aria-label="Selected"
                            />
                          ) : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Currently selected: <span className="font-medium text-gray-600">{selectedDesign.name}</span>
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Danger zone */}
        <Card className="gap-0 overflow-hidden rounded-2xl border border-red-200 bg-red-50/80 py-0 shadow-none">
          <CardContent className="px-5 py-5 sm:px-7">
            <SectionHeading
              number={isBirthday ? 4 : 5}
              title="Danger zone"
              description="Irreversible actions — proceed with caution."
            />
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-red-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-red-800">Delete this project</p>
                  <p className="mt-0.5 text-xs text-red-600">
                    Permanently deletes all guests, RSVP data, and invitation links.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingProject}
                onClick={onDeleteProject}
                className="shrink-0 rounded-xl"
              >
                {deletingProject ? 'Deleting…' : 'Delete project'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="min-w-0 self-start space-y-5 lg:sticky lg:top-24">
        <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
          <CardHeader className="border-b border-gray-100 px-5 py-3">
            <CardTitle className="font-serif text-base">Invite preview</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-5">
            <div
              className="relative overflow-hidden rounded-2xl border px-5 py-6 text-center shadow-inner"
              style={{
                ...inviteThemeStyle(selectedDesign.id),
                borderColor: 'color-mix(in oklab, var(--border) 80%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in oklab, var(--gold-soft) 25%, var(--background)), var(--background))',
                color: 'var(--foreground)',
              }}
            >
              <p className="relative font-serif text-xl font-semibold tracking-tight">
                {project.name || 'Your celebration'}
              </p>
              {previewDate ? (
                <p
                  className="relative mt-2 text-xs font-medium"
                  style={{ color: 'color-mix(in oklab, var(--foreground) 75%, transparent)' }}
                >
                  {previewDate}
                </p>
              ) : (
                <p className="relative mt-2 text-xs opacity-50">Add a date to preview timing</p>
              )}
              {templateOptions.length > 0 ? (
                <p
                  className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: 'var(--gold)' }}
                >
                  {selectedDesign.name}
                </p>
              ) : null}
              {showFamily ? (
                <div className="relative mt-5 grid gap-4 text-left sm:grid-cols-2">
                  {familySides.map((side) => {
                    const roleValue = side.role || side.defaultRole
                    const preview = buildCoupleFamilySide({
                      name: side.name,
                      role: roleValue,
                      father: side.father,
                      mother: side.mother,
                      house: side.house,
                      place: side.place,
                    })
                    return (
                      <div
                        key={side.key}
                        className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 text-xs leading-snug text-gray-600"
                      >
                        <p className="font-serif text-sm font-semibold text-gray-900">
                          {preview.name}
                        </p>
                        {preview.relation ? <p className="mt-1">{preview.relation}</p> : null}
                        {preview.parents ? <p>{preview.parents}</p> : null}
                        {preview.house ? <p>{preview.house}</p> : null}
                        {preview.place ? <p>{preview.place}</p> : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="relative mt-4 text-sm text-gray-600">
                  {[project.couple_1, project.couple_2].filter(Boolean).join(' & ') ||
                    'Add names to preview'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
          <CardHeader className="border-b border-gray-100 px-5 py-4">
            <CardTitle className="font-serif text-base">Completeness</CardTitle>
            <CardDescription>Checklist before you send invites.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <ul className="space-y-2.5">
              {completeness.map((item) => (
                <li key={item.id} className="flex items-center gap-2.5 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : item.id === 'gallery' || item.id === 'family' ? (
                    <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
                  )}
                  <span className={item.done ? 'text-gray-800' : 'text-gray-500'}>{item.label}</span>
                </li>
              ))}
            </ul>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>
                  {completedCount} of {completeness.length} completed
                </span>
                <span>{completenessPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#9D022C] transition-all duration-500"
                  style={{ width: `${completenessPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-0 shadow-[0_8px_28px_rgba(31,41,55,0.06)]">
          <CardHeader className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-600" aria-hidden />
              <CardTitle className="font-serif text-base">Live venue preview</CardTitle>
            </div>
            <CardDescription>
              {venueAddress || 'Add a venue or maps link to preview the location.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            {embedSrc ? (
              <div className="aspect-[4/3] w-full bg-gray-100">
                <iframe
                  title="Venue map preview"
                  src={embedSrc}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-gray-50 px-6 text-center text-xs text-gray-400">
                Map preview appears once venue or maps details are added.
              </div>
            )}
            {embedSrc ? (
              <div className="border-t border-gray-100 px-5 py-3">
                <a
                  href={mapsOpenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:underline"
                >
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
