"use client"
import React, { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Building2,
  BarChart3,
  Warehouse,
  Home,
  Castle,
  Building,
  Hotel,
  Users,
  MapPin,
  Award,
  Clock,
  Tag,
  Grid,
  Layers,
  Activity,
} from "lucide-react"
import { useDevelopmentReport } from "../hooks/useDevelopmentReport"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Download } from "lucide-react"

interface MediaItem {
  type: "image" | "video" | "youtube" | "youtube-short"
  url: string
  title?: string
}

const formatDisplayValue = (value: any): string => {
  if (value === 0) return "0"
  if (value === null || value === undefined || value === "") return "N/A"
  return value.toString()
}

const formatDisplayNumber = (value: any): string => {
  if (value === 0) return "0"
  if (value === null || value === undefined || value === "") return "N/A"
  return value.toString()
}

const formatDisplayArea = (value: any): string => {
  if (value === 0) return "0 sq ft"
  if (value === null || value === undefined || value === "") return "N/A"
  return `${value.toLocaleString()} sq ft`
}

const formatDisplayFloors = (value: any): string => {
  if (value === 0) return "0 floors"
  if (value === null || value === undefined || value === "") return "N/A"
  return `${value} floors`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getDocumentIcon = (type: string) => {
  const iconType = type.toLowerCase()
  if (iconType.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />
  } else if (iconType.includes("image") || iconType.includes("jpg") || iconType.includes("png")) {
    return <FileText className="h-5 w-5 text-blue-500" />
  } else if (iconType.includes("video") || iconType.includes("mp4") || iconType.includes("youtube")) {
    return <Play className="h-5 w-5 text-green-500" />
  } else if (iconType.includes("doc")) {
    return <FileText className="h-5 w-5 text-blue-600" />
  }
  return <FileText className="h-5 w-5 text-gray-500" />
}

type Props = {
  params: {
    preview: string
  }
}

function App({ params }: Props) {
  const [developmentId, setDevelopmentId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<any[]>([])

  const urlParams = params.preview
  useEffect(() => {
    setDevelopmentId(urlParams)
  }, [])

 

  const { data, isLoading, error, refetch } = useDevelopmentReport(developmentId)
  console.log("data", data) 
   useEffect(() => {
    const fetchDocuments = async () => {
      if (!developmentId) return

      try {
        const documentsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/document/byRefId/${params.preview}`,
        )
        setDocuments(documentsResponse.data.data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
        setDocuments([])
      }
    }

    fetchDocuments()
  }, [developmentId, params.preview])

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0) 
  
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isSliding, setIsSliding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const sliderRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const youtubeIframeRef = React.useRef<HTMLIFrameElement>(null)
  const autoPlayIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

  const DEFAULT_IMAGE = "/placeholder.svg?height=600&width=800"

  useEffect(() => {
    if (!documents) return

    const media: MediaItem[] = []

    // Add media from documents
    documents.forEach((doc) => {
      const type = doc.type.toLowerCase()
      const url = doc.documentUrl

      if (
        type.includes("image") ||
        type.includes("jpg") ||
        type.includes("jpeg") ||
        type.includes("png") ||
        type.includes("gif")
      ) {
        media.push({
          type: "image",
          url: doc.documentUrl,
          title: doc.title || "Document Image",
        })
      } else if (type.includes("video") || type.includes("mp4") || type.includes("mov") || type.includes("avi")) {
        // Check if it's a YouTube URL
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          media.push({
            type: "youtube",
            url: doc.documentUrl,
            title: doc.title || "Document Video",
          })
        } else {
          media.push({
            type: "video",
            url: doc.documentUrl,
            title: doc.title || "Document Video",
          })
        }
      }
    })

    // If no media found, add default images
    if (media.length === 0) {
      media.push(
        {
          type: "image",
          url: "/placeholder.svg?height=600&width=1000",
          title: "Amenities Overview",
        },
      )
    }

    setMediaItems(media)
  }, [documents])

  const currentMedia = mediaItems[currentMediaIndex]

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && currentMedia?.type === "image") {
      autoPlayIntervalRef.current = setInterval(() => {
        nextMedia()
      }, 4000)
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
  }, [isAutoPlaying, currentMediaIndex, currentMedia?.type])

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

  // Calculate how many development info items we have to decide on layout
  const developmentInfoCount = data
    ? Object.keys(data).filter(
        (key) => !["projectHeight", "projectBUA", "PropertyTypes", "InventoryType", "result"].includes(key),
      ).length
    : 0

  // Determine if we need two rows for development info
  const needsTwoRows = developmentInfoCount > 6

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading development report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
                {currentMedia?.type === "image" ? (
                  <img
                    src={currentMedia?.url || "/placeholder.svg"}
                    alt="Property image"
                    className="w-full h-full object-cover"
                  />
                ) : currentMedia?.type === "youtube" || currentMedia?.type === "youtube-short" ? (
                  <div className="relative w-full h-full">
                    <iframe
                      ref={youtubeIframeRef}
                      src={getYouTubeEmbedUrl(currentMedia?.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title="YouTube video"
                      style={{ pointerEvents: "auto", zIndex: 10 }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      src={currentMedia?.url}
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
                          <button className="p-1 text-white hover:bg-white/20 rounded-full" onClick={togglePlayPause}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </button>
                          <span className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        <button className="p-1 text-white hover:bg-white/20 rounded-full" onClick={toggleFullscreen}>
                          <Maximize2 className="h-5 w-5" />
                        </button>
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
              <button
                className="rounded-full opacity-80 hover:opacity-100 bg-white backdrop-blur-sm pointer-events-auto h-10 w-10 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                  prevMedia()
                }}
              >
                <ChevronLeft className="h-6 w-6 text-black" />
              </button>
              <button
                className="rounded-full opacity-80 hover:opacity-100 bg-white backdrop-blur-sm pointer-events-auto h-10 w-10 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                  nextMedia()
                }}
              >
                <ChevronRight className="h-6 w-6 text-black" />
              </button>
            </div>

            {/* Auto-play toggle */}
            <div className="absolute top-4 left-4 z-50">
              <button
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm pointer-events-auto flex items-center px-3 py-1 text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleAutoPlay()
                }}
              >
                {isAutoPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                <span className="ml-1 text-xs">Auto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Development Info Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-transparent dark:bg-gray-700 px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              <Building2 className="h-5 w-5" />
              Development Information
            </h2>
          </div>
          <div className="p-0">
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-gray-200 dark:divide-gray-700`}
            >
              <div className="p-4 flex flex-col items-center text-center">
                <MapPin className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayValue(data?.roadLocation)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Development Name</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayValue(data?.developmentName)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Award className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Development Ranking</div>
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {formatDisplayValue(data?.developmentRanking)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Facilities</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.noOfFacilities)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Grid className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amenities</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.noOfAmenities)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Layers className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Plots</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.noOfPlots)}
                </div>
              </div>
            </div>

            {/* Second row for development info if needed */}
            {needsTwoRows && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-gray-200 dark:divide-gray-700">
                <div className="p-4 flex flex-col items-center text-center">
                  <Building className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Developed Plots</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDisplayNumber(data?.noOfDevelopedPlots)}
                  </div>
                </div>

                <div className="p-4 flex flex-col items-center text-center">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Under Construction</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDisplayNumber(data?.noOfUnderConstructionPlots)}
                  </div>
                </div>

                <div className="p-4 flex flex-col items-center text-center">
                  <Tag className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vacant Plots</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDisplayNumber(data?.noOfVacantPlots)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-transparent dark:bg-gray-700 px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              <Warehouse className="h-5 w-5" />
              Inventory Type
            </h2>
          </div>
          <div className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x divide-y divide-gray-200 dark:divide-gray-700">
              <div className="p-4 flex flex-col items-center text-center">
                <Home className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Apartments</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.InventoryType?.apartmentCountType)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Castle className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Villas</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.InventoryType?.villasCountType)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Building className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Townhouses</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.InventoryType?.townhouseCountType)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Hotel className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hotel Apartments</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.InventoryType?.hotelCountType)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Labour Camp</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDisplayNumber(data?.InventoryType?.labourCampCountType)}
                </div>
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total</div>
                <div className="font-semibold text-blue-800 dark:text-blue-300">
                  {formatDisplayNumber(
                    (data?.InventoryType?.apartmentCountType || 0) +
                      (data?.InventoryType?.villasCountType || 0) +
                      (data?.InventoryType?.townhouseCountType || 0) +
                      (data?.InventoryType?.hotelCountType || 0) +
                      (data?.InventoryType?.labourCampCountType || 0),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Types Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-transparent dark:bg-gray-700 px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Project Types
            </h2>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      colSpan={2}
                      className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Project Heights
                      </div>
                    </th>
                    <th
                      colSpan={2}
                      className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Project BUA Sq. Ft.
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Apartments</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hotel Apartments
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Villas</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Townhouses</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                  </tr>
                  <tr className="bg-gray-100 dark:bg-gray-600">
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      Minimum
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      Maximum
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
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-600">
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      {formatDisplayFloors(data?.projectHeight?.projectMinHeight)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      {formatDisplayFloors(data?.projectHeight?.projectMaxHeight)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      {formatDisplayArea(data?.projectBUA?.projectMinBUA)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      {formatDisplayArea(data?.projectBUA?.projectMaxBUA)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.PropertyTypes?.Apartments)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.PropertyTypes?.Hotels)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.PropertyTypes?.Villas)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.PropertyTypes?.Townhouse)}
                    </td>
                    <td className="p-3 text-center text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20">
                      {formatDisplayNumber(data?.PropertyTypes?.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg pb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-transparent dark:bg-gray-700 px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Availability
            </h2>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Apartment</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Villas</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Townhouses</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-600">
                    <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">Sell</div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.Availability?.Apartment?.Sell)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.Availability?.Villas?.Sell)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.Availability?.Townhouses?.Sell)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50">
                    <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">Rent</div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.Availability?.Apartment?.Rent)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.Availability?.Villas?.Rent)}
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                      {formatDisplayNumber(data?.Availability?.Townhouses?.Rent)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-border"
                  >
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(doc.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            <span>Type: {doc.typeAttachment || doc.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={doc.documentUrl} download={doc.title}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No documents available for this property</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
