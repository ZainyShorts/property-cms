"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  Mail,
  Phone,
  MapPin,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Tag,
  Calendar,
  Building,
  Home,
  Landmark,
  DollarSign,
  CheckCircle2,
  UserRound,
  PlusIcon as HousePlus,
  Ruler,
  Paintbrush,
  LayoutGrid,
  CalendarRange,
  Banknote,
  FileText,
  Download,
  Eye,
  Clock,
  Play,
  Pause,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_IMAGE = "/placeholder.svg?height=600&width=800"

type Props = {
  params: {
    preview: string
  }
}

interface PropertyData {
  _id: string
  project: {
    _id: string
    masterDevelopment: {
      _id: string
      roadLocation: string
      developmentName: string
    }
    subDevelopment: {
      _id: string
      subDevelopment: string
    }
    propertyType: string
    projectName: string
    facilityCategories: string[]
    amenitiesCategories: string[]
    projectQuality: string
    constructionStatus: number
    launchDate: string
    completionDate: string
    salesStatus: string
    downPayment: number
    percentOfConstruction: number
    installmentDate: string
    uponCompletion: string
    postHandOver: string
    pictures: string[]
    createdAt: string
    updatedAt: string
  }
  unitNumber: string
  unitHeight: string
  unitInternalDesign: string
  unitExternalDesign: string
  plotSizeSqFt: number
  BuaSqFt: number
  noOfBedRooms: number
  unitView: string[]
  pictures: string[]
  unitPurpose: string
  listingDate: string
  unitType: string
  marketPrice: number
  askingPrice: number
  askingRent: number
  marketRent: number
  rentedAt: string
  rentedTill: string
  paidTODevelopers: number
  payableTODevelopers: number
  premiumAndLoss: number
  purchasePrice: number
  createdAt: string
  updatedAt: string
}

interface Document {
  _id: string
  title: string
  type: string
  documentUrl: string
  refId: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface MediaItem {
  type: "image" | "video" | "youtube"
  url: string
  title: string
}

function PropertySkeleton() {
  const [darkMode, setDarkMode] = useState(false)

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

  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg bg-gray-300 dark:bg-muted h-[60vh]">
          <div className="absolute top-0 left-0 right-0 p-6">
            <Skeleton className="h-8 w-48 mb-2 bg-gray-400 dark:bg-muted-foreground/20" />
            <Skeleton className="h-4 w-64 bg-gray-400 dark:bg-muted-foreground/20" />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background/70 p-2 rounded-full">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-2 h-2 rounded-full bg-gray-400 dark:bg-muted-foreground/20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertyDetail({ params }: Props) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0)
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isSliding, setIsSliding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Navigation functions
  const nextMedia = () => {
    if (mediaItems.length === 0) return
    setIsSliding(true)
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
    setTimeout(() => setIsSliding(false), 300)
  }

  const prevMedia = () => {
    if (mediaItems.length === 0) return
    setIsSliding(true)
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
    setTimeout(() => setIsSliding(false), 300)
  }

  // Get current media item safely
  const currentMedia =
    mediaItems.length > 0
      ? mediaItems[currentMediaIndex]
      : {
          type: "image" as const,
          url: DEFAULT_IMAGE,
          title: "Default Property Image",
        }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!params.preview) return

      try {
        setLoading(true)

        const [propertyResponse, documentsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory/${params.preview}`),
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/document/byRefId/${params.preview}`),
        ])

        console.log("Property API response:", propertyResponse.data)
        console.log("Documents API response:", documentsResponse.data)

        setPropertyData(propertyResponse.data)
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

  // Process media items
  useEffect(() => {
    if (!propertyData && (!documents || documents.length === 0)) return

    const media: MediaItem[] = []

    // Add property images first
    if (propertyData?.pictures && propertyData.pictures.length > 0) {
      propertyData.pictures.forEach((url) => {
        media.push({
          type: "image",
          url,
          title: "Property Image",
        })
      })
    }

    // Add media from documents
    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        const type = doc.type.toLowerCase()
        const url = doc.documentUrl

        // Check for YouTube URLs first
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          media.push({
            type: "youtube",
            url: doc.documentUrl,
            title: doc.title || "YouTube Video",
          })
        }
        // Check for images
        else if (
          type.includes("image") ||
          type.includes("jpg") ||
          type.includes("jpeg") ||
          type.includes("png") ||
          type.includes("gif") ||
          url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ) {
          media.push({
            type: "image",
            url: doc.documentUrl,
            title: doc.title || "Document Image",
          })
        }
        // Check for videos
        else if (
          type.includes("video") ||
          type.includes("mp4") ||
          type.includes("mov") ||
          type.includes("avi") ||
          url.match(/\.(mp4|mov|avi|webm)$/i)
        ) {
          media.push({
            type: "video",
            url: doc.documentUrl,
            title: doc.title || "Document Video",
          })
        }
      })
    }

    // If no media found, add default image
  

    console.log("Processed media items:", media)
    setMediaItems(media)
    setCurrentMediaIndex(0) // Reset to first item
  }, [documents, propertyData])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
    }

    if (isAutoPlaying && mediaItems.length > 1 && currentMedia?.type === "image") {
      autoPlayTimerRef.current = setInterval(() => {
        nextMedia()
      }, 4000)
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isAutoPlaying, currentMediaIndex, mediaItems.length, currentMedia?.type])

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
    let videoId = ""

    if (url.includes("youtube.com/watch")) {
      videoId = url.split("v=")[1]?.split("&")[0]
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0]
    }

    if (!videoId) {
      const match = url.match(/[a-zA-Z0-9_-]{11}/)
      videoId = match ? match[0] : ""
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&controls=1` : url
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextMedia()
    } else if (touchEndX.current - touchStartX.current > 50) {
      prevMedia()
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Utility functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const formatCurrency = (value: number | string) => {
    if (!value || value === 0) return "N/A"
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(numValue)) return "N/A"
    return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(numValue)
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

  const handleGmail = () => {
    const recipient = "agent@example.com"
    const subject = `Inquiry about ${propertyData?.project?.projectName} - Unit ${propertyData?.unitNumber}`
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}`
    window.open(url, "_blank")
  }

  if (!params.preview) {
    return (
      <div className="container mx-auto p-8 text-center">
        No preview ID provided. Please provide a valid document ID.
      </div>
    )
  }

  if (loading) return <PropertySkeleton />

  if (error) return <div className="container mx-auto p-8 text-center text-red-500">Error: {error}</div>

  if (!propertyData) {
    return <div className="container mx-auto p-8 text-center">No property data found for the given preview ID.</div>
  }

  return (
    <div className="min-h-screen bg-background">
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
              <div className="w-full h-full flex items-center justify-center bg-black">
                {currentMedia?.type === "image" ? (
                  <img
                    src={currentMedia?.url}
                    alt={currentMedia?.title || "Property image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = DEFAULT_IMAGE
                    }}
                  />
                ) : currentMedia?.type === "youtube" ? (
                  <div className="relative w-full h-full">
                    <iframe
                      ref={youtubeIframeRef}
                      src={getYouTubeEmbedUrl(currentMedia?.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={currentMedia?.title || "YouTube video"}
                    />
                  </div>
                ) : currentMedia?.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      src={currentMedia?.url}
                      className="w-full h-full object-contain"
                      onClick={togglePlayPause}
                      onTimeUpdate={updateProgress}
                      onLoadedMetadata={setVideoDuration}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
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
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                   
                  </div>
                )}
              </div>
            </div>

            {/* Media counter */}
            <div className="absolute top-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium z-50 pointer-events-none">
              {mediaItems.length > 0 ? `${currentMediaIndex + 1} / ${mediaItems.length}` : "0 / 0"}
            </div>

            {/* Media navigation controls */}
            {mediaItems.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4 z-40 pointer-events-none">
                <button
                  className="rounded-full opacity-80 hover:opacity-100 bg-white backdrop-blur-sm pointer-events-auto h-10 w-10 flex items-center justify-center transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevMedia()
                  }}
                  disabled={mediaItems.length <= 1}
                >
                  <ChevronLeft className="h-6 w-6 text-black" />
                </button>
                <button
                  className="rounded-full opacity-80 hover:opacity-100 bg-white backdrop-blur-sm pointer-events-auto h-10 w-10 flex items-center justify-center transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextMedia()
                  }}
                  disabled={mediaItems.length <= 1}
                >
                  <ChevronRight className="h-6 w-6 text-black" />
                </button>
              </div>
            )}

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

        {/* Property Details Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Unit Details</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Left Column - Key Details */}
              <div className="md:col-span-2 space-y-8">
                {/* Key Stats */}
                <Card className="overflow-hidden border dark:border-border">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 bg-transparent">
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6 border-r border-b dark:border-border">
                        <BedDouble className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">
                          {propertyData.unitType === "BedRoom"
                            ? propertyData.noOfBedRooms || "N/A"
                            : propertyData.unitType || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {propertyData.unitType === "BedRoom" ? "Bed Rooms" : "Unit Type"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6 border-b sm:border-r dark:border-border">
                        <HousePlus className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.unitNumber}</span>
                        <span className="text-xs text-muted-foreground">Unit Number</span>
                      </div>
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6 border-r dark:border-border">
                        <Ruler className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.BuaSqFt} sqft</span>
                        <span className="text-xs text-muted-foreground">Built-up Area</span>
                      </div>
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6">
                        <Landmark className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.unitHeight}</span>
                        <span className="text-xs text-muted-foreground">Unit Height</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Project Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Home className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Project Name</span>
                          <span className="font-medium">{propertyData.project?.projectName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Property Type</span>
                          <span className="font-medium">{propertyData.project?.propertyType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Landmark className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Master Development</span>
                          <span className="font-medium">{propertyData.project?.masterDevelopment.developmentName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Road Location</span>
                          <span className="font-medium">{propertyData.project?.masterDevelopment.roadLocation}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Landmark className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Sub Development</span>
                          <span className="font-medium">
                            {propertyData.project?.subDevelopment?.subDevelopment || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Project Quality</span>
                          <span className="font-medium">{propertyData.project?.projectQuality}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features & Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Features & Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {propertyData.project?.amenitiesCategories.length > 0 ? (
                            propertyData.project?.amenitiesCategories.map((amenity, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm capitalize">
                                {amenity}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No amenities listed</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold">Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {propertyData.project?.facilityCategories.length > 0 ? (
                            propertyData.project?.facilityCategories.map((facility, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm capitalize">
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

                {/* Unit View Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Unit View
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">This property offers the following views:</p>
                      <div className="flex flex-wrap gap-2">
                        {propertyData.unitView && propertyData.unitView.length > 0 ? (
                          propertyData.unitView.map((view, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm capitalize">
                              {view}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No view information available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No documents available for this property</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Price & Contact */}
              <div className="space-y-6">
                {/* Price Card */}
                <Card className="overflow-hidden border dark:border-border bg-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Pricing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Market Price</div>
                        <div className="text-md font-normal text-primary">
                          {propertyData.marketPrice ? formatCurrency(propertyData.marketPrice) : "N/A"}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Asking Price</div>
                        <div className="text-md font-normal">
                          {propertyData.askingPrice ? formatCurrency(propertyData.askingPrice) : "N/A"}
                        </div>
                      </div>

                      <Separator className="dark:bg-border" />

                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Property ID</div>
                          <div className="font-medium">{propertyData._id}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Agent */}
                <Card className="border dark:border-border bg-transparent">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contact Agent</h3>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-full">
                          <UserRound className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">Property Specialist</div>
                          <div className="text-sm text-muted-foreground">Agent ID: AG002</div>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <Button className="w-full">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Agent
                        </Button>
                        <Button onClick={handleGmail} variant="outline" className="w-full border dark:border-border">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Agent
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule Viewing */}
                <Card className="border dark:border-border bg-transparent">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Schedule a Viewing</h3>
                      <p className="text-sm text-muted-foreground">
                        Interested in this property? Schedule a viewing at your convenience.
                      </p>
                      <Button variant="secondary" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Unit Details Tab */}
          <TabsContent value="details" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Unit Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Unit Height</span>
                        <span className="font-medium">{propertyData.unitHeight}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Plot Size</span>
                        <span className="font-medium">{propertyData.plotSizeSqFt} sqft</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Built-up Area</span>
                        <span className="font-medium">{propertyData.BuaSqFt} sqft</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <HousePlus className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Unit Number</span>
                        <span className="font-medium">{propertyData.unitNumber}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Design Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Paintbrush className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Internal Design</span>
                          <span className="font-medium">{propertyData.unitInternalDesign || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Paintbrush className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">External Design</span>
                          <span className="font-medium">{propertyData.unitExternalDesign || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarRange className="h-5 w-5 text-primary" />
                    Rental Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Tag className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Unit Purpose</span>
                        <span className="font-medium">{propertyData.unitPurpose}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Listing Date</span>
                        <span className="font-medium">{formatDate(propertyData.listingDate)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Rental Timeline</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Rented From</span>
                          <span className="font-medium">{formatDate(propertyData.rentedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Rented Till</span>
                          <span className="font-medium">{formatDate(propertyData.rentedTill)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Pricing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Market Price</span>
                      </div>
                      <span className="font-semibold text-lg">
                        {propertyData.marketPrice ? formatCurrency(propertyData.marketPrice) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Asking Price</span>
                      </div>
                      <span className="font-semibold text-lg">
                        {propertyData.askingPrice ? formatCurrency(propertyData.askingPrice) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Market Rent</span>
                      </div>
                      <span className="font-semibold text-lg">
                        {propertyData.marketRent ? formatCurrency(propertyData.marketRent) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Asking Rent</span>
                      </div>
                      <span className="font-semibold text-lg">
                        {propertyData.askingRent ? formatCurrency(propertyData.askingRent) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Purchase Price</span>
                      </div>
                      <span className="font-semibold text-lg">
                        {propertyData.purchasePrice ? formatCurrency(propertyData.purchasePrice) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Premium/Loss</span>
                      </div>
                      <span className="font-semibold text-lg">{formatCurrency(propertyData.premiumAndLoss)}</span>
                    </div>
                  </div>

                  <Separator />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-primary" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-primary" />
                        <span>Paid to Developers</span>
                      </div>
                      <span className="font-semibold text-lg">{formatCurrency(propertyData.paidTODevelopers)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-primary" />
                        <span>Payable to Developers</span>
                      </div>
                      <span className="font-semibold text-lg">{formatCurrency(propertyData.payableTODevelopers)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Rental Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Tag className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Unit Purpose</span>
                          <span className="font-medium">{propertyData.unitPurpose}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Schedule Viewing */}
        <Card className="border dark:border-border bg-transparent mt-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Schedule a Viewing</h3>
                <p className="text-sm text-muted-foreground">
                  Interested in this property? Schedule a viewing at your convenience.
                </p>
              </div>
              <Button size="lg" className="md:w-auto w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
