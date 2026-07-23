'use client'

import { useCallback, useEffect, useState } from 'react'
import { MediaUploader } from '@/components/admin/media-uploader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  // Keep labels visible while the dialog exit animation runs
  const [panelGuestId, setPanelGuestId] = useState(guestId)
  const [panelGuestName, setPanelGuestName] = useState(guestName)

  useEffect(() => {
    if (!open || !guestId) return
    setPanelGuestId(guestId)
    setPanelGuestName(guestName)
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
    const id = panelGuestId || guestId
    if (!id) return
    const res = await fetch(`/api/projects/${projectId}/guests/${id}/moments`)
    if (!res.ok) return
    const data = await res.json()
    const next = parseMediaList(data.moments)
    setMoments(next)
    onUpdated?.(next)
  }, [projectId, guestId, panelGuestId, onUpdated])

  const activeGuestId = panelGuestId || guestId

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !uploading) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
            Moments with you
          </p>
          <DialogTitle className="mt-0.5">{panelGuestName || guestName}</DialogTitle>
          <DialogDescription>
            Up to {MAX_GUEST_MOMENTS} favourite photos — shown only on their personal invite link.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
            if (!activeGuestId) return
            setUploading(true)
            setError('')
            try {
              for (const file of files) {
                const form = new FormData()
                form.append('file', file)
                const res = await fetch(
                  `/api/projects/${projectId}/guests/${activeGuestId}/moments`,
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
            if (!activeGuestId) return
            setError('')
            const res = await fetch(
              `/api/projects/${projectId}/guests/${activeGuestId}/moments?imageId=${encodeURIComponent(imageId)}`,
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
      </DialogContent>
    </Dialog>
  )
}
