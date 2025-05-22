"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import axios from "axios"
import {
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Tag,
  Calendar,
  Building,
  Home,
  Landmark,
  UserRound,
  Banknote,
  FileText,
  Download,
  Eye,
  Clock,
  ArrowRight,
  Bed,
  Ruler,
  SeparatorVerticalIcon as Separator,
  LayoutGrid,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import Head from "next/head"

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
  type: "image" | "video"
  url: string
  title: string
}

interface TooltipPosition {
  x: number
  y: number
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
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [unitDetails, setUnitDetails] = useState<any[]>([])
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 })

  // Modify the useEffect that fetches data to check for plot data in multiple places
  useEffect(() => {
    const fetchData = async () => {
      if (!params.preview) return

      try {
        setLoading(true)

        // Fetch property data with populated fields, documents, and unit details in parallel
        const [propertyResponse, documentsResponse, unitResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_CMS_SERVER}/project/${params.preview}?populate=subDevelopment,masterDevelopment`,
          ),
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
      } else if (type.includes("video") || type.includes("mp4") || type.includes("mov") || type.includes("avi")) {
        media.push({
          type: "video",
          url: doc.documentUrl,
          title: doc.title,
        })
      }
    })

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

  // Auto-advance slider
  useEffect(() => {
    if (isAutoPlaying && mediaItems.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        nextMedia()
      }, 3000)
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isAutoPlaying, mediaItems.length, currentMediaIndex])

  // Reset auto-play when media changes
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
    }

    if (isAutoPlaying && mediaItems.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        nextMedia()
      }, 3000)
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [currentMediaIndex, mediaItems.length])

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

  const handleGmail = () => {
    const recipient = "agent@example.com"
    const subject = `Inquiry about ${propertyData.projectName}`
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}`
    window.open(url, "_blank")
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
            className={`relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full transition-transform duration-300 ease-in-out ${isSliding ? "opacity-90" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Media Content */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {currentMedia.type === "image" ? (
                <Image
                  src={currentMedia.url || "/placeholder.svg"}
                  alt="Property image"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls={false}
                  autoPlay
                  muted
                  loop
                />
              )}
            </div>

            {/* Media counter */}
            <div className="absolute top-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
              {currentMediaIndex + 1} / {mediaItems.length}
            </div>

            {/* Media navigation controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm"
                onClick={prevMedia}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm"
                onClick={nextMedia}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Project Overview Section */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white dark:bg-black">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Main Project Details */}
            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Master Development
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Sub Development
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Project
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Project Quality
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Construction Status
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Sales Category
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {masterDevelopment?.developmentName || "N/A"}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800 font-medium text-primary">
                        {subDevelopment?.subDevelopment || "N/A"}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">{propertyData.projectName}</td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          {propertyData.projectQuality}
                        </Badge>
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800 font-medium">
                        {propertyData.constructionStatus}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        >
                          {propertyData.salesStatus}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plot Details */}
            <div className="px-4 sm:px-6 pb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Plot Information
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Plot Permission
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Height
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Plot Size
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        BUA
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Launch Date
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b">
                        Completion Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {subDevelopment?.plotPermission ? (
                          <Badge variant="secondary" className="cursor-help" onClick={handleShowPermissions}>
                            {Array.isArray(subDevelopment.plotPermission)
                              ? `${subDevelopment.plotPermission.length} Permissions`
                              : "1 Permission"}
                          </Badge>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {subDevelopment?.plotHeight || "N/A"}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {subDevelopment?.plotSizeSqFt ? `${subDevelopment.plotSizeSqFt} sq ft` : "N/A"}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {subDevelopment?.plotBUASqFt ? `${subDevelopment.plotBUASqFt} sq ft` : "N/A"}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {formatDate(propertyData.launchDate)}
                      </td>
                      <td className="p-3 border-b border-gray-100 dark:border-gray-800">
                        {formatDate(propertyData.completionDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Project Information */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building className="h-5 w-5 text-primary" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard
                    icon={<Home className="h-5 w-5 text-primary" />}
                    label="Project Name"
                    value={propertyData.projectName}
                  />
                  <InfoCard
                    icon={<MapPin className="h-5 w-5 text-primary" />}
                    label="Road Location"
                    value={masterDevelopment?.roadLocation || "N/A"}
                  />
                  <InfoCard
                    icon={<Landmark className="h-5 w-5 text-primary" />}
                    label="Master Development"
                    value={masterDevelopment?.developmentName || "N/A"}
                  />
                  <InfoCard
                    icon={<Landmark className="h-5 w-5 text-primary" />}
                    label="Sub Development"
                    value={subDevelopment?.subDevelopment || "N/A"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Banknote className="h-5 w-5 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-6 w-6 text-primary" />
                      <span className="font-medium">Down Payment</span>
                    </div>
                    <span className="text-xl font-bold">{propertyData.downPayment}%</span>
                  </div>

                  <h3 className="font-semibold text-lg mt-6">Payment Timeline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <TimelineItem date={formatDate(propertyData.installmentDate)} label="Installment Date" />
                    <TimelineItem date={formatDate(propertyData.uponCompletion)} label="Upon Completion" />
                    <TimelineItem date={formatDate(propertyData.postHandOver)} label="Post Handover" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Tag className="h-5 w-5 text-primary" />
                  Features & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {propertyData.amenitiesCategories && propertyData.amenitiesCategories.length > 0 ? (
                        propertyData.amenitiesCategories.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm capitalize">
                            {amenity}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No amenities listed</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {propertyData.facilityCategories && propertyData.facilityCategories.length > 0 ? (
                        propertyData.facilityCategories.map((facility, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm capitalize">
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

            {/* Unit Details Section */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Home className="h-5 w-5 text-primary" />
                  Available Units
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {unitDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-center p-2">Unit Number</th>
                          <th className="text-center p-2">Unit Height</th>
                          <th className="text-center p-2">Bedrooms</th>
                          <th className="text-center p-2">Original Price </th>
                          <th className="text-center p-2">Unit Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unitDetails.map((unit) => (
                          <tr
                            key={unit._id}
                            className="border-b hover:bg-gray-50 dark:hover:bg-black/80 cursor-pointer"
                            onClick={() => window.open(`/dashboard/properties/inventory-details/${unit._id}`, "_blank")}
                          >
                            <td className="p-2 font-medium text-center">{unit.unitNumber}</td>
                            <td className="p-2 text-center">{unit.unitHeight || "N/A"}</td>
                            <td className="p-2 text-center">{unit.noOfBedRooms || "N/A"}</td>
                            <td className="p-2 text-center">
                              {unit.originalPrice ? `${unit.originalPrice.toLocaleString()} AED` : "N/A"}
                            </td>
                            <td className="p-2 text-center">{unit.unitPurpose || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-gray-50/50 dark:bg-black/20 rounded-lg border border-dashed">
                    <Home className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No units available for this property</p>
                    <p className="text-sm mt-1">Contact the agent for more information</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unit Summary */}
            {unitDetails.length > 0 ? (
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
                <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-black pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bed className="h-5 w-5 text-primary" />
                    Unit Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Total Units with visual indicator */}
                    <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/20 p-2 rounded-full">
                            <Home className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Units</div>
                            <div className="text-2xl font-bold">{unitDetails.length}</div>
                          </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                          <span className="font-bold">{unitDetails.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Unit Purposes Summary */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Unit Purposes
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(countUnitPurposes())
                          .filter(([_, count]) => count > 0)
                          .map(([purpose, count]) => (
                            <div
                              key={purpose}
                              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-black/40 rounded-md"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="text-xs">{purpose}</span>
                              <span className="text-xs font-bold ml-auto">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Bedroom Options */}
                    {unitDetails.some((unit) => unit.noOfBedRooms) && (
                      <div className="space-y-2 border-t pt-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Bed className="h-4 w-4 text-primary" />
                          Bedroom Options
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(unitDetails.map((unit) => unit.noOfBedRooms).filter(Boolean)))
                            .sort()
                            .map((bedrooms) => (
                              <Badge key={bedrooms} variant="outline" className="px-3 py-1.5">
                                {bedrooms} {Number.parseInt(bedrooms) === 1 ? "Bedroom" : "Bedrooms"}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Size Range */}
                    {unitDetails.some((unit) => unit.BuaSqFt > 0) && (
                      <div className="space-y-2 border-t pt-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-primary" />
                          Size Range
                        </h3>
                        <div className="bg-gray-50 dark:bg-black/40 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-muted-foreground">Minimum</div>
                              <div className="font-bold">
                                {Math.min(...unitDetails.map((unit) => unit.BuaSqFt || 0).filter(Boolean))} sq ft
                              </div>
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                            <div>
                              <div className="text-xs text-muted-foreground">Maximum</div>
                              <div className="font-bold">
                                {Math.max(...unitDetails.map((unit) => unit.BuaSqFt || 0))} sq ft
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Range */}
                    {unitDetails.some((unit) => unit.originalPrice > 0) && (
                      <div className="space-y-2 border-t pt-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-primary" />
                          Price Range
                        </h3>
                        <div className="bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-muted-foreground">Starting From</div>
                              <div className="font-bold">
                                {Math.min(
                                  ...unitDetails
                                    .map((unit) => unit.originalPrice || Number.POSITIVE_INFINITY)
                                    .filter(Boolean),
                                ).toLocaleString()}{" "}
                                AED
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Up To</div>
                              <div className="font-bold">
                                {Math.max(...unitDetails.map((unit) => unit.originalPrice || 0)).toLocaleString()} AED
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t p-4">
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View All Units
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
                <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-black pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bed className="h-5 w-5 text-primary" />
                    Unit Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center py-8 text-muted-foreground bg-gray-50/50 dark:bg-black/20 rounded-lg border border-dashed">
                    <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bed className="h-8 w-8 text-primary opacity-70" />
                    </div>
                    <p className="font-medium">No units available</p>
                    <p className="text-sm mt-1">Contact the agent for more information</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {documents && documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Construction Status Card */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="text-xl">Construction Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{propertyData.percentOfConstruction}%</span>
                    </div>
                    <Progress value={propertyData.percentOfConstruction} className="h-3" />
                  </div>
                  <div className="text-center font-medium text-lg mt-2">
                    {propertyData.percentOfConstruction}% Complete
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Property ID</div>
                      <div className="font-medium">{propertyData._id}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="text-xl">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <DateItem label="Launch Date" date={formatDate(propertyData.launchDate)} />
                  <DateItem label="Completion Date" date={formatDate(propertyData.completionDate)} />
                </div>
              </CardContent>
            </Card>

            {/* Contact Agent */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Agent</h3>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <UserRound className="h-6 w-6 text-primary" />
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
                    <Button onClick={handleGmail} variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Agent
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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

// Helper Components
const StatsCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
    <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2">
      {icon}
      <span className="text-base sm:text-lg font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </CardContent>
  </Card>
)

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-black/80 transition-colors">
    {icon}
    <div>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  </div>
)

const DateItem = ({ label, date }: { label: string; date: string }) => (
  <div className="flex justify-between items-center">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-md font-medium">{date}</div>
  </div>
)

const TimelineItem = ({ date, label }: { date: string; label: string }) => (
  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-black/80 transition-colors">
    <Calendar className="h-5 w-5 text-primary" />
    <div>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="font-medium">{date}</span>
    </div>
  </div>
)

const UnitPurposeItem = ({ purpose, count }: { purpose: string; count: number }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <span className="text-sm font-medium">{purpose}</span>
    <Badge variant={count > 0 ? "default" : "outline"} className={count > 0 ? "bg-primary" : "bg-muted"}>
      {count}
    </Badge>
  </div>
)

// Loading Skeleton
const PropertyDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <Skeleton className="h-[40vh] sm:h-[50vh] md:h-[60vh] w-full rounded-xl" />

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6 lg:space-y-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
      <div className="space-y-6 lg:space-y-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>

    <Skeleton className="h-32 w-full rounded-lg mt-8" />
  </div>
)
