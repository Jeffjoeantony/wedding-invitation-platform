'use client'

import { useCallback, useEffect, useState } from 'react'
import { MediaUploader } from '@/components/admin/media-uploader'
import { Button } from '@/components/ui/button'
import {
  MAX_GUEST_MOMENTS,
  parseMediaList,
  type MediaItem,
} from '@/lib/invite-media'

type Props = {
  open: boolean
  onClose: () => void
  projectId: string
  guestId: string
  guestName: string
  initialMoments?: unknown
  onUpdated?: (moments: MediaItem[]) => void
}

export function GuestMomentsEditor({
  open,
  onClose,
  projectId,
  guestId,
  guestName,
  initialMoments,
  onUpdated,
}: Props) {
  const [moments, setMoments] = useState<MediaItem[]>(() => parseMediaList(initialMoments))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !guestId) return
    setMoments(parseMediaList(initialMoments))
    setError('')
    // Always load from storage so counts stay accurate without DB columns
    void (async () => {
      const res = await fetch(`/api/projects/${projectId}/guests/${guestId}/moments`)
      if (!res.ok) return
      const data = await res.json()
      const next = parseMediaList(data.moments)
      setMoments(next)
      onUpdated?.(next)
    })()
  }, [open, guestId, projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/guests/${guestId}/moments`)
    if (!res.ok) return
    const data = await res.json()
    const next = parseMediaList(data.moments)
    setMoments(next)
    onUpdated?.(next)
  }, [projectId, guestId, onUpdated])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Moments with you</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{guestName}</h3>
            <p className="text-xs text-gray-400 mt-1">
              Up to {MAX_GUEST_MOMENTS} favourite photos — shown only on their personal invite link.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-lg">
            Close
          </Button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <MediaUploader
          title="Favourite moments"
          description="These appear after the greeting on their invite."
          images={moments}
          max={MAX_GUEST_MOMENTS}
          uploading={uploading}
          onUpload={async (files) => {
            setUploading(true)
            setError('')
            try {
              for (const file of files) {
                const form = new FormData()
                form.append('file', file)
                const res = await fetch(
                  `/api/projects/${projectId}/guests/${guestId}/moments`,
                  { method: 'POST', body: form },
                )
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.error || 'Upload failed')
                setMoments(parseMediaList(data.moments))
                onUpdated?.(parseMediaList(data.moments))
              }
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Upload failed')
              await refresh()
            } finally {
              setUploading(false)
            }
          }}
          onRemove={async (imageId) => {
            setError('')
            const res = await fetch(
              `/api/projects/${projectId}/guests/${guestId}/moments?imageId=${encodeURIComponent(imageId)}`,
              { method: 'DELETE' },
            )
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
              setError(data.error || 'Delete failed')
              return
            }
            const next = parseMediaList(data.moments)
            setMoments(next)
            onUpdated?.(next)
          }}
        />
      </div>
    </div>
  )
}
