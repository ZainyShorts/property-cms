import { X } from 'lucide-react'
import Image from "next/image"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface MediaLightboxProps {
  media: {
    type: "image" | "video"
    url: string
    title: string
  }
  onClose: () => void
}

export default function MediaLightbox({ media, onClose }: MediaLightboxProps) {
  // Close on escape key press
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    // Prevent scrolling when lightbox is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
        {media.type === "image" ? (
          <div className="relative w-full h-full">
            <Image
              src={media.url || "/placeholder.svg"}
              alt={media.title || "Media"}
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <video
            src={media.url}
            className="max-w-full max-h-full object-contain"
            controls
            autoPlay
          />
        )}
      </div>
    </div>
  )
}
