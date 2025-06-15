"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import axios from "axios"
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Calendar,
  Banknote,
  FileText,
  Download,
  Eye,
  Clock,
  ArrowRight,
  LayoutGrid,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Maximize2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import Head from "next/head"

// Add these imports at the top of the file
import { Bed, Building, Store, Building2, Palette } from "lucide-react"

const DEFAULT_IMAGE =
  "https://formbuilder.ccavenue.com/live/uploads/company_image/488/17316704336156_Event-Image-Not-Found.jpg"

type Props = {
  params: {
    preview: string
  }
}

interface PropertyData {
  _id: string
  projectName: string
  propertyType: string
  salesStatus: string
  downPayment: number
  constructionStatus: number
  launchDate: string
  completionDate: string
  percentOfConstruction: number
  installmentDate: string
  uponCompletion: string
  postHandOver: string
  facilityCategories: string[]
  amenitiesCategories: string[]
  projectQuality: string
  pictures: string[]
  createdAt: string
  updatedAt: string
  masterDevelopment: any
  subDevelopment: any
  __v: number
}

interface MediaItem {
  type: "image" | "video" | "youtube" | "youtube-short"
  url: string
  title: string
}

interface TooltipPosition {
  x: number
  y: number
}

interface PriceRange {
  originalMin: number
  originalMax: number
  sellingMin: number
  sellingMax: number
  premiumMin: number
  premiumMax: number
}

interface APIResponse {
  success: boolean
  masterDevelopment: string
  subDevelopment: string
  project: string
  projectQuality: string
  constructionStatus: number
  salesStatus: string
  plotPermission: string[]
  plotHeight: string
  plotSizeSqFt: string
  plotBUASqFt: string
  launchDate: string
  completionDate: string
  downPayment: number
  installmentDate: string
  uponCompletion: string
  postHandOver: string
  facilityCategories: string[]
  amenitiesCategories: string[]
  inventory: Record<string, number>
  availability: Record<string, number>
  priceRange: Record<
    string,
    {
      marketPrice: { min: number; max: number }
      askingPrice: { min: number; max: number }
      premium: { min: number; max: number }
    }
  >
}

export default function PropertyDetail({ params }: Props) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0)
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isSliding, setIsSliding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [sliderRef] = useState(useRef<HTMLDivElement>(null))
  const [touchStartX] = useState(useRef<number>(0))
  const [touchEndX] = useState(useRef<number>(0))
  const [autoPlayTimerRef] = useState(useRef<NodeJS.Timeout | null>(null))
  const [unitDetails, setUnitDetails] = useState<any[]>([])
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoRef] = useState(useRef<HTMLVideoElement>(null))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null)
  const [youtubeIframeRef] = useState(useRef<HTMLIFrameElement>(null))
  const [darkMode, setDarkMode] = useState(false) // defaults to light mode

  // On mount, check for stored theme preference (default to light)
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") {
      setDarkMode(true)
    }
  }, [])
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  // Initialize YouTube API


  // Modify the useEffect that fetches data to check for plot data in multiple places
  useEffect(() => {
    const fetchData = async () => {
      if (!params.preview) return

      try {
        setLoading(true)

        // Fetch property data with populated fields, documents, and unit details in parallel
        const [propertyResponse, documentsResponse, unitResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/project/report/${params.preview}`),
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/document/byRefId/${params.preview}`),
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory?projectID=${params.preview}`),
        ])

        console.log("Property API response:", propertyResponse.data)
        console.log("Documents API response:", documentsResponse.data)
        console.log("Unit details API response:", unitResponse.data)

        const property = propertyResponse.data
        setPropertyData(property)

        // Set unit details
        if (unitResponse.data && unitResponse.data.data) {
          setUnitDetails(unitResponse.data.data)
        }

        setDocuments(documentsResponse.data.data || [])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [params.preview])

  // Process documents to extract media (images and videos)
  useEffect(() => {
    if (!documents || !propertyData) return

    const media: MediaItem[] = []

    // Add property images first
    if (propertyData.pictures && propertyData.pictures.length > 0) {
      propertyData.pictures.forEach((url) => {
        media.push({
          type: "image",
          url,
          title: "Property Image",
        })
      })
    }

    // Add media from documents
    documents.forEach((doc) => {
      const type = doc.type.toLowerCase()
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
          title: doc.title,
        })
      } 
    })

    // Add the YouTube videos
  

    // If no media found, add default image
    if (media.length === 0) {
      media.push({
        type: "image",
        url: DEFAULT_IMAGE,
        title: "Default Property Image",
      })
    }

    setMediaItems(media)
  }, [documents, propertyData]) 
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

  // Auto-advance slider - pause when on video content
  useEffect(() => {
    // Clear any existing timer
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
    }

    if (isAutoPlaying && mediaItems.length > 1) {
      // Don't auto-advance if current media is a video
      const currentItem = mediaItems[currentMediaIndex]
      if (
        currentItem &&
        (currentItem.type === "video" || currentItem.type === "youtube" || currentItem.type === "youtube-short")
      ) {
        return // Don't set a timer for videos
      }

      // Set timer for images
      autoPlayTimerRef.current = setInterval(() => {
        nextMedia()
      }, 1500) // 1.5 seconds
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isAutoPlaying, currentMediaIndex, mediaItems])

  // Reset auto-play when media changes
  // useEffect(() => {
  //   if (autoPlayTimerRef.current) {
  //     clearInterval(autoPlayTimerRef.current)
  //   }

  //   // if (isAutoPlaying && mediaItems.length > 1) {
  //   //   autoPlayTimerRef.current = setInterval(() => {
  //   //     nextMedia()
  //   //   }, 100000)
  //   // }

  //   return () => {
  //     if (autoPlayTimerRef.current) {
  //       clearInterval(autoPlayTimerRef.current)
  //     }
  //   }
  // }, [currentMediaIndex, mediaItems.length])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPermissionsTooltip) {
        setShowPermissionsTooltip(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPermissionsTooltip])

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showPermissionsTooltip) {
        setShowPermissionsTooltip(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [showPermissionsTooltip])

  // Pause video when changing slides
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [currentMediaIndex])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Function to play YouTube video
  const playYouTubeVideo = () => {
    const iframe = youtubeIframeRef.current
    if (iframe) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
    }
  }

  // Function to pause YouTube video
  const pauseYouTubeVideo = () => {
    const iframe = youtubeIframeRef.current
    if (iframe) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
    }
  }

  // Function to toggle YouTube video play/pause
  const toggleYouTubePlayPause = () => {
    const iframe = youtubeIframeRef.current
    if (!iframe) return

    try {
      // Use postMessage with proper JSON format
      if (isPlaying) {
        iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: "" }), "*")
      } else {
        iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: "" }), "*")
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error("Error controlling YouTube video:", error)
    }
  }

  // Pause YouTube video when changing slides
  useEffect(() => {
    if (
      youtubeIframeRef.current &&
      (mediaItems[currentMediaIndex]?.type === "youtube" || mediaItems[currentMediaIndex]?.type === "youtube-short")
    ) {
      pauseYouTubeVideo()
      setIsPlaying(false)
    }
  }, [currentMediaIndex, isPlaying, mediaItems])

  if (!params.preview) {
    return (
      <div className="container mx-auto p-8 text-center">
        No preview ID provided. Please provide a valid document ID.
      </div>
    )
  }

  if (loading) return <PropertyDetailSkeleton />

  if (error) return <div className="container mx-auto p-8 text-center text-red-500">Error: {error}</div>

  if (!propertyData) {
    return <div className="container mx-auto p-8 text-center">No property data found for the given preview ID.</div>
  }

  const nextMedia = () => {
    setIsSliding(true)
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
    setTimeout(() => setIsSliding(false), 300)
  }

  const prevMedia = () => {
    setIsSliding(true)
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
    setTimeout(() => setIsSliding(false), 300)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      nextMedia()
    } else if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right
      prevMedia()
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  const countUnitPurposes = () => {
    const purposes = {
      Rent: 0,
      Sell: 0,
      Manage: 0,
      Develop: 0,
      Valuation: 0,
      Hold: 0,
      Pending: 0,
    }

    if (unitDetails && unitDetails.length > 0) {
      unitDetails.forEach((unit) => {
        if (unit.unitPurpose && purposes.hasOwnProperty(unit.unitPurpose)) {
          purposes[unit.unitPurpose]++
        }
      })
    }

    return purposes
  }

  const countAmenities = () => {
    const amenitiesCount: Record<string, number> = {}

    if (unitDetails && unitDetails.length > 0) {
      unitDetails.forEach((unit) => {
        if (unit.amenities && Array.isArray(unit.amenities)) {
          unit.amenities.forEach((amenity: string) => {
            if (!amenitiesCount[amenity]) {
              amenitiesCount[amenity] = 0
            }
            amenitiesCount[amenity]++
          })
        }
      })
    }

    return amenitiesCount
  }

  const getDocumentIcon = (type: string) => {
    const fileType = type.toLowerCase()
    if (fileType.includes("pdf")) return <FileText className="h-10 w-10 text-red-500" />
    if (fileType.includes("doc") || fileType.includes("word")) return <FileText className="h-10 w-10 text-blue-500" />
    if (fileType.includes("xls") || fileType.includes("sheet")) return <FileText className="h-10 w-10 text-green-500" />
    if (fileType.includes("ppt") || fileType.includes("presentation"))
      return <FileText className="h-10 w-10 text-orange-500" />
    if (fileType.includes("jpg") || fileType.includes("jpeg") || fileType.includes("png") || fileType.includes("image"))
      return <FileText className="h-10 w-10 text-purple-500" />
    if (fileType.includes("video") || fileType.includes("mp4") || fileType.includes("mov"))
      return <FileText className="h-10 w-10 text-green-600" />
    return <FileText className="h-10 w-10 text-gray-500" />
  }

  const handleShowPermissions = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 10, // 10px below the element
    })
    setShowPermissionsTooltip(true)
  }

  const currentMedia = mediaItems[currentMediaIndex] || {
    type: "image",
    url: DEFAULT_IMAGE,
    title: "Default Property Image",
  }

  const masterDevelopment = propertyData.masterDevelopment || {}
  const subDevelopment = propertyData.subDevelopment || {}
  const getPriceRangesFromAPI = () => {
    // If we have API response with priceRange, use it directly
    if (propertyData?.priceRange) {
      return propertyData.priceRange
    }

    // Fallback to empty structure if no API data
    const emptyRange = {
      marketPrice: { min: 0, max: 0 },
      askingPrice: { min: 0, max: 0 },
      premium: { min: 0, max: 0 },
    }

    return {
      Studio: emptyRange,
      "1 BR": emptyRange,
      "2 BR": emptyRange,
      "3 BR": emptyRange,
      "4 BR": emptyRange,
      "5 BR": emptyRange,
      "6 BR": emptyRange,
      "7 BR": emptyRange,
      "8 BR": emptyRange,
    }
  }
  const priceRanges = getPriceRangesFromAPI()
  const amenitiesCount = countAmenities()
  const inventory = propertyData?.inventory || {}
  const availability = propertyData?.availability || {}

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const updateProgress = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const setVideoDuration = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const seekVideo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return

    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const percentClicked = clickPosition / progressBar.offsetWidth

    videoRef.current.currentTime = percentClicked * duration
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  } 
  

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container")
    if (!videoContainer) return

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop()
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`
  }

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{propertyData?.projectName || "Property Details"} | Real Estate Property</title>
        <meta
          name="description"
          content={`View details of ${propertyData?.projectName || "this property"} including project information, payment details, and available units.`}
        />
        <meta
          name="keywords"
          content={`real estate, property, ${propertyData?.propertyType || ""}, ${masterDevelopment?.developmentName || ""}, ${subDevelopment?.subDevelopment || ""}`}
        />
        <meta
          property="og:title"
          content={`${propertyData?.projectName || "Property Details"} | Real Estate Property`}
        />
        <meta
          property="og:description"
          content={`View details of ${propertyData?.projectName || "this property"} including project information, payment details, and available units.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={mediaItems[0]?.url || DEFAULT_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${propertyData?.projectName || "Property Details"} | Real Estate Property`}
        />
        <meta
          name="twitter:description"
          content={`View details of ${propertyData?.projectName || "this property"} including project information, payment details, and available units.`}
        />
        <meta name="twitter:image" content={mediaItems[0]?.url || DEFAULT_IMAGE} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/properties/${params.preview}`} />
      </Head>

      {/* Permissions Tooltip */}
      {showPermissionsTooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-900 shadow-lg rounded-md p-3 border border-gray-200 dark:border-gray-700 max-w-xs"
          style={{
            position: "absolute",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-sm font-medium mb-2">Plot Permissions:</div>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(subDevelopment.plotPermission) ? (
              subDevelopment.plotPermission.map((permission, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs">
                {subDevelopment.plotPermission}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Media Slider Section */}
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
        {/* Development Information */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Development Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              <div className="w-full overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-0">
                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Building className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Master Development</div>
                    <div className="font-medium">{propertyData.masterDevelopment || "N/A"}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sub Development</div>
                    <div className="font-medium">{propertyData.subDevelopment || "N/A"}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Project</div>
                    <div className="font-medium">{propertyData.project}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Palette className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Project Quality</div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    >
                      {propertyData.projectQuality}
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Construction Status</div>
                    <div className="font-medium">{propertyData.constructionStatus}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Tag className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sales Category</div>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                    >
                      {propertyData.salesStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plot Information */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              Plot Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              <div className="w-full overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-0">
                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Plot Permission</div>
                    <div className="font-medium">
                      {propertyData?.plotPermission ? (
                        <Badge variant="secondary" className="cursor-help" onClick={handleShowPermissions}>
                          {Array.isArray(propertyData.plotPermission)
                            ? `${propertyData.plotPermission.length} Permissions`
                            : "1 Permission"}
                        </Badge>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <ArrowRight className="h-6 w-6 rotate-90" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Height</div>
                    {propertyData?.plotHeight ? `${propertyData.plotHeight} sq ft` : "N/A"}
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Plot Size</div>
                    <div className="font-medium">
                      {propertyData?.plotSizeSqFt ? `${propertyData.plotSizeSqFt} sq ft` : "N/A"}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Building className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">BUA</div>
                    <div className="font-medium">
                      {propertyData?.plotBUASqFt ? `${propertyData.plotBUASqFt} sq ft` : "N/A"}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Launch Date</div>
                    <div className="font-medium">{formatDate(propertyData.launchDate)}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 px-2 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0">
                    <div className="mb-2 text-primary">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Completion Date</div>
                    <div className="font-medium">{formatDate(propertyData.completionDate)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Overview Section */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 xl:grid-cols-11">
                {Object.entries(inventory).map(([type, count], index) => {
                  // Determine which icon to use based on the type
                  let Icon
                  switch (type) {
                    case "Shop":
                      Icon = <Store className="h-6 w-6" />
                      break
                    case "Offices":
                      Icon = <Building2 className="h-6 w-6" />
                      break
                    case "Studios":
                      Icon = <Palette className="h-6 w-6" />
                      break
                    case "1 BR":
                    case "2 BR":
                    case "3 BR":
                    case "4 BR":
                    case "5 BR":
                    case "6 BR":
                    case "7 BR":
                    case "8 BR":
                      Icon = <Bed className="h-6 w-6" />
                      break
                    default:
                      Icon = <Building className="h-6 w-6" />
                  }

                  return (
                    <div
                      key={type}
                      className="flex flex-col items-center justify-center py-4 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0"
                    >
                      <div className="mb-2 text-primary">{Icon}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{type}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Section */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 xl:grid-cols-11">
                {Object.entries(availability).map(([type, count], index) => {
                  // Determine which icon to use based on the type
                  let Icon
                  switch (type) {
                    case "Shop":
                      Icon = <Store className="h-6 w-6" />
                      break
                    case "Offices":
                      Icon = <Building2 className="h-6 w-6" />
                      break
                    case "Studios":
                      Icon = <Palette className="h-6 w-6" />
                      break
                    case "1 BR":
                    case "2 BR":
                    case "3 BR":
                    case "4 BR":
                    case "5 BR":
                    case "6 BR":
                    case "7 BR":
                    case "8 BR":
                      Icon = <Bed className="h-6 w-6" />
                      break
                    default:
                      Icon = <Building className="h-6 w-6" />
                  }

                  return (
                    <div
                      key={type}
                      className="flex flex-col items-center justify-center py-4 text-center border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0"
                    >
                      <div className={`mb-2 ${count > 0 ? "text-primary" : "text-primary dark:text-gray-500"}`}>
                        {Icon}
                      </div>
                      <div
                        className={`text-2xl font-bold ${count > 0 ? "text-primary" : "text-primary dark:text-gray-500"}`}
                      >
                        {count}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{type}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Range Section */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="h-6 w-6 text-primary" />
              Price Range
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th
                        className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b"
                        rowSpan={2}
                      >
                        Type
                      </th>
                      <th
                        className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b"
                        colSpan={2}
                      >
                        Asking Price
                      </th>
                      <th
                        className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b"
                        colSpan={2}
                      >
                        Market Price
                      </th>
                      <th
                        className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b"
                        colSpan={2}
                      >
                        Premium / Loss
                      </th>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Min
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Max
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Min
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Max
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Min
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Max
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(priceRanges).map(([type, range]) => (
                      <tr key={type} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 font-medium">{type}</td>
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center">
                          {range.askingPrice?.min > 0 ? range.askingPrice.min.toLocaleString() : "0"}
                        </td>
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center">
                          {range.askingPrice?.max > 0 ? range.askingPrice.max.toLocaleString() : "0"}
                        </td>
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center">
                          {range.marketPrice?.min > 0 ? range.marketPrice.min.toLocaleString() : "0"}
                        </td>
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center">
                          {range.marketPrice?.max > 0 ? range.marketPrice.max.toLocaleString() : "0"}
                        </td>
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center">
                          {range.premium?.min !== 0 ? range.premium.min.toLocaleString() : "0"}
                        </td>
                        <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center">
                          {range.premium?.max !== 0 ? range.premium.max.toLocaleString() : "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="h-6 w-6 text-primary" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-3">
                  <Banknote className="h-6 w-6 text-primary" />
                  <span className="font-medium">Down Payment</span>
                </div>
                <span className="text-xl font-bold">{propertyData.downPayment}%</span>
              </div>

              <h3 className="font-semibold text-xl mt-6">Payment Timeline</h3>
              <div className="bg-gray-50 dark:bg-gray-900/10 rounded-lg p-6">
                <div className="relative pl-8 pb-6 border-l-2 border-primary/30">
                  <div className="absolute -left-3 top-0">
                    <div
                      className={`${new Date(propertyData.installmentDate) < new Date() ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 border-2 border-primary"} rounded-full p-1`}
                    >
                      {new Date(propertyData.installmentDate) < new Date() ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">Installment Date</h4>
                    <p className="text-amber-600 dark:text-amber-500 font-medium mt-1">
                      {formatDate(propertyData.installmentDate)}
                    </p>
                  </div>
                </div>

                <div className="relative pl-8 pb-6 border-l-2 border-primary/30">
                  <div className="absolute -left-3 top-0">
                    <div
                      className={`${new Date(propertyData.uponCompletion) < new Date() ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 border-2 border-primary"} rounded-full p-1`}
                    >
                      {new Date(propertyData.uponCompletion) < new Date() ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">Upon Completion</h4>
                    <p className="text-amber-600 dark:text-amber-500 font-medium mt-1">
                      {formatDate(propertyData.uponCompletion)}
                    </p>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-3 top-0">
                    <div
                      className={`${new Date(propertyData.postHandOver) < new Date() ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 border-2 border-primary"} rounded-full p-1`}
                    >
                      {new Date(propertyData.postHandOver) < new Date() ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">Post Handover</h4>
                    <p className="text-amber-600 dark:text-amber-500 font-medium mt-1">
                      {formatDate(propertyData.postHandOver)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Timeline */}

        {/* Features & Amenities */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              Features & Amenities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  {" "}
                  <h3 className="font-semibold text-xl">Amenities</h3>
                  <span className="inline-flex items-center justify-center bg-primary/20 text-primary rounded-full h-5 w-5 text-xs font-medium">
                    {propertyData.amenitiesCategories?.length}
                  </span>
                </div>{" "}
                <div className="flex flex-wrap gap-3">
                  {propertyData.amenitiesCategories && propertyData.amenitiesCategories.length > 0 ? (
                    propertyData.amenitiesCategories.map((amenity, index) => {
                      const count = amenitiesCount[amenity] || 0
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1.5 text-sm capitalize flex items-center gap-2"
                        >
                          {amenity}
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground">No amenities listed</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  {" "}
                  <h3 className="font-semibold text-xl">Facilities</h3>
                  <span className="inline-flex items-center justify-center bg-primary/20 text-primary rounded-full h-5 w-5 text-xs font-medium">
                    {propertyData?.facilityCategories?.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {propertyData.facilityCategories && propertyData.facilityCategories.length > 0 ? (
                    propertyData.facilityCategories.map((facility, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm capitalize flex items-center gap-2"
                      >
                        {facility}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No facilities listed</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-black/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(doc.createdAt)}</span>
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
              <div className="text-center py-8 text-muted-foreground bg-gray-50/50 dark:bg-black/20 rounded-lg border border-dashed">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No documents available for this property</p>
                <p className="text-sm mt-1">Contact the agent for more information</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Viewing */}
        <Card className="mt-8 border-none shadow-md bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Schedule a Viewing</h3>
                <p className="text-sm text-muted-foreground">
                  Interested in this property? Schedule a viewing at your convenience.
                </p>
              </div>
              <Button size="lg" className="md:w-auto w-full group">
                <Calendar className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                Book Appointment
                <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading Skeleton
const PropertyDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <Skeleton className="h-[40vh] sm:h-[50vh] md:h-[60vh] w-full rounded-xl" />

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>

    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>

    <Skeleton className="h-32 w-full rounded-lg mt-8" />
  </div>
)
