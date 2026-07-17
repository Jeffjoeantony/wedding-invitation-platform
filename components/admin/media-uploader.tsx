'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { MediaItem } from '@/lib/invite-media'
import { ImagePlus, Trash2, Loader2 } from 'lucide-react'

type Props = {
  title?: string
  description?: string
  images: MediaItem[]
  max: number
  uploading?: boolean
  onUpload: (files: File[]) => Promise<void>
  onRemove: (imageId: string) => Promise<void>
}

export function MediaUploader({
  title = 'Images',
  description,
  images,
  max,
  uploading = false,
  onUpload,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const remaining = Math.max(0, max - images.length)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || remaining <= 0) return
    const files = Array.from(fileList).slice(0, remaining)
    await onUpload(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        <p className="text-[11px] text-gray-400 mt-1">
          {images.length}/{max} uploaded · JPEG, PNG, WebP · max 5 MB each
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0.35'
                }}
              />
              <button
                type="button"
                disabled={busyId === img.id}
                onClick={async () => {
                  setBusyId(img.id)
                  try {
                    await onRemove(img.id)
                  } finally {
                    setBusyId(null)
                  }
                }}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
              >
                {busyId === img.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        disabled={remaining <= 0 || uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl w-full sm:w-auto"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4 mr-2" />
            {remaining <= 0 ? 'Limit reached' : `Add images (${remaining} left)`}
          </>
        )}
      </Button>
    </div>
  )
}
