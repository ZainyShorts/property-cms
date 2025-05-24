"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import {
  Building2,
  MapPin,
  Star,
  Users,
  Sparkles,
  BarChart3,
  Home,
  Building,
  Castle,
  Hotel,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Calendar,
  Ruler,
  Square,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
} from "lucide-react"

interface MediaItem {
  type: "image" | "video" | "youtube" | "youtube-short"
  url: string
  title?: string
}

export default function Component() {
  // Media slider state
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isSliding, setIsSliding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Refs
  const sliderRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null)
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Touch handling
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Sample media data
  const mediaItems: MediaItem[] = [
    {
      type: "image",
      url: "/placeholder.svg?height=600&width=800",
      title: "Property Exterior View",
    },
    {
      type: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Property Tour Video",
    },
    {
      type: "image",
      url: "/placeholder.svg?height=600&width=900",
      title: "Interior Design",
    },
    {
      type: "video",
      url: "/placeholder.mp4",
      title: "Development Progress",
    },
    {
      type: "image",
      url: "/placeholder.svg?height=600&width=1000",
      title: "Amenities Overview",
    },
  ]

  const currentMedia = mediaItems[currentMediaIndex]

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && currentMedia.type === "image") {
      autoPlayIntervalRef.current = setInterval(() => {
        nextMedia()
      }, 4000) // Change slide every 4 seconds for images
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
        autoPlayIntervalRef.current = null
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [isAutoPlaying, currentMediaIndex, currentMedia.type])

  // Navigation functions
  const nextMedia = () => {
    setIsSliding(true)
    setTimeout(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
      setIsSliding(false)
    }, 150)
  }

  const prevMedia = () => {
    setIsSliding(true)
    setTimeout(() => {
      setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
      setIsSliding(false)
    }, 150)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextMedia()
    } else if (isRightSwipe) {
      prevMedia()
    }
  }

  // Video controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const updateProgress = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const setVideoDuration = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const seekVideo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop()
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Media Slider */}
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg bg-background">
          <div
            ref={sliderRef}
            className={`relative h-[50vh] sm:h-[60vh] md:h-[75vh] w-full transition-transform duration-300 ease-in-out ${isSliding ? "opacity-90" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Media Content */}
            <div className="absolute inset-0">
              <div id="video-container" className="w-full h-full flex items-center justify-center bg-black">
                {currentMedia.type === "image" ? (
                  <Image
                    src={currentMedia.url || "/placeholder.svg"}
                    alt="Property image"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : currentMedia.type === "youtube" || currentMedia.type === "youtube-short" ? (
                  <div className="relative w-full h-full">
                    <iframe
                      ref={youtubeIframeRef}
                      src={getYouTubeEmbedUrl(currentMedia.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      frameBorder="0"
                      title="YouTube video"
                      style={{ pointerEvents: "auto", zIndex: 10 }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      src={currentMedia.url}
                      className="w-full h-full object-contain"
                      onClick={togglePlayPause}
                      onTimeUpdate={updateProgress}
                      onLoadedMetadata={setVideoDuration}
                    />
                    {/* Video controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 flex flex-col gap-2">
                      <div className="w-full bg-gray-600 h-1 rounded cursor-pointer" onClick={seekVideo}>
                        <div
                          className="bg-red-500 h-full rounded"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={togglePlayPause}
                          >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                          <span className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                          onClick={toggleFullscreen}
                        >
                          <Maximize2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media counter */}
            <div className="absolute top-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium z-50 pointer-events-none">
              {currentMediaIndex + 1} / {mediaItems.length}
            </div>

            {/* Media navigation controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4 z-40 pointer-events-none">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  prevMedia()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  nextMedia()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Auto-play toggle - positioned away from YouTube controls */}
            <div className="absolute top-4 left-4 z-50">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleAutoPlay()
                }}
              >
                {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="ml-1 text-xs">Auto</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Development Info Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Building2 className="h-5 w-5" />
              Development Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Road Location</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Downtown Main St</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Development Name</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Burj Khalifa District</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Development Ranking</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    A+
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Facilities</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">15</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Amenities</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">25</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Total</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">500</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Developed</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">350</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Under Construction</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">100</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Square className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Vacant</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">50</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Types Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Project Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      colSpan={2}
                      className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Project Heights
                      </div>
                    </th>
                    <th
                      colSpan={2}
                      className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Project BUA Sq. Ft.
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-4 w-4" />
                        Apartments
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Hotel className="h-4 w-4" />
                        Hotel Apartments
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Castle className="h-4 w-4" />
                        Villas
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Building className="h-4 w-4" />
                        Townhouses
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Total
                      </div>
                    </th>
                  </tr>
                  <tr className="bg-gray-100 dark:bg-gray-600">
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        Minimum
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Maximum
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      Min
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      Max
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-600">
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      5 floors
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      50 floors
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      500 sq ft
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      5000 sq ft
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">150</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">75</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">100</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">175</td>
                    <td className="p-3 text-center text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20">
                      500
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Type Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Warehouse className="h-5 w-5" />
              Inventory Type
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Apartments</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">150</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Castle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Villas</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">100</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Townhouses</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">175</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hotel className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hotel</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">75</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Labour Camp</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">25</div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">Total</span>
                </div>
                <div className="font-semibold text-blue-800 dark:text-blue-300">525</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Castle className="h-4 w-4" />
                        Villas
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Building className="h-4 w-4" />
                        Townhouses
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-4 w-4" />
                        Apartment
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Warehouse className="h-4 w-4" />
                        Warehouse
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        School
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4" />
                        Hospital
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-600">
                    <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        Sell
                      </div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">1</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">2</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">3</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">1</td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50">
                    <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Rent
                      </div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">5</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">1</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">3</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">2</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
