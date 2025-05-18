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
  Heart,
  Share2,
  Calendar,
  Building,
  Home,
  Landmark,
  CheckCircle2,
  UserRound,
  Banknote,
  Hourglass,
  FileText,
  Download,
  Eye,
  Clock,
  Play,
  Pause,
  ArrowRight,
  Bed,
  LayoutGrid,
  Ruler,
  Warehouse,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"

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

// Update the PlotData interface to match all possible fields
interface PlotData {
  buaAreaSqFt?: string
  plotBUASqFt?: string | number
  plotHeight?: string | number
  plotNumber?: string | number
  plotPermission?: string[]
  plotSizeSqFt?: string | number
  plotStatus?: string
}

interface MediaItem {
  type: "image" | "video"
  url: string
  title: string
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
  const [plotData, setPlotData] = useState<PlotData | null>(null)

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

        // Check for plot data in multiple places
        // First check if plot data exists directly in the property response
        if (property.plot) {
          console.log("Plot data found in property:", property.plot)
          setPlotData(property.plot)
        }
        // Then check if plot data exists in the subDevelopment object
        else if (
          property.subDevelopment &&
          (property.subDevelopment.plotNumber ||
            property.subDevelopment.plotHeight ||
            property.subDevelopment.plotSizeSqFt ||
            property.subDevelopment.plotBUASqFt ||
            property.subDevelopment.plotStatus ||
            property.subDevelopment.plotPermission)
        ) {
          console.log("Plot data found in subDevelopment:", property.subDevelopment)
          // Extract plot-related fields from subDevelopment
          const subDevPlotData: PlotData = {
            plotNumber: property.subDevelopment.plotNumber,
            plotHeight: property.subDevelopment.plotHeight,
            plotPermission: property.subDevelopment.plotPermission,
            plotSizeSqFt: property.subDevelopment.plotSizeSqFt,
            plotBUASqFt: property.subDevelopment.plotBUASqFt,
            plotStatus: property.subDevelopment.plotStatus,
            // buaAreaSqFt might not be available in subDevelopment
            buaAreaSqFt: property.subDevelopment.buaAreaSqFt || property.subDevelopment.plotBUASqFt?.toString(),
          }
          setPlotData(subDevPlotData)
        } else {
          console.log("No plot data found in property or subDevelopment")
          setPlotData(null)
        }

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

  const currentMedia = mediaItems[currentMediaIndex] || {
    type: "image",
    url: DEFAULT_IMAGE,
    title: "Default Property Image",
  }

  const masterDevelopment = propertyData.masterDevelopment || {}
  const subDevelopment = propertyData.subDevelopment || {}

  return (
    <div className="min-h-screen bg-background">
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
                  alt={currentMedia.title || "Property image"}
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

            {/* Property Title Overlay */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 sm:p-6 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/20 text-white border-primary/30">
                  {propertyData.salesStatus}
                </Badge>
                <Badge variant="outline" className="bg-primary/20 text-white border-primary/30">
                  {propertyData.propertyType}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{propertyData.projectName}</h1>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {masterDevelopment?.roadLocation || "Location"}, {masterDevelopment?.developmentName || "Development"}
                </span>
              </div>
              {subDevelopment && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Landmark className="h-4 w-4" />
                  <span>{subDevelopment.subDevelopment}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={toggleAutoPlay}
                title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isAutoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Thumbnail navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background/70 p-2 rounded-full">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsSliding(true)
                    setCurrentMediaIndex(index)
                    setTimeout(() => setIsSliding(false), 300)
                  }}
                  className={`w-2 h-2 rounded-full ${index === currentMediaIndex ? "bg-primary" : "bg-muted"}`}
                  aria-label={`View media ${index + 1}`}
                />
              ))}
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

            {/* Media counter */}
            <div className="absolute top-4 right-36 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
              {currentMediaIndex + 1} / {mediaItems.length}
            </div>

            {/* Media type indicator */}
            <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              {currentMedia.type === "video" ? (
                <>
                  <Play className="h-4 w-4" /> Video
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Image
                </>
              )}
            </div>
          </div>
        </div>

        {/* Property Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <StatsCard
            icon={<Building className="h-6 w-6 text-primary" />}
            value={propertyData.propertyType}
            label="Property Type"
          />
          <StatsCard
            icon={<Tag className="h-6 w-6 text-primary" />}
            value={propertyData.salesStatus}
            label="Sales Status"
          />
          <StatsCard
            icon={<CheckCircle2 className="h-6 w-6 text-primary" />}
            value={propertyData.projectQuality}
            label="Project Quality"
          />
          <StatsCard
            icon={<Hourglass className="h-6 w-6 text-primary" />}
            value={`${propertyData.constructionStatus}%`}
            label="Construction"
          />
        </div>

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
                          <th className="text-left p-2">Unit Number</th>
                          <th className="text-left p-2">Unit Height</th>
                          <th className="text-left p-2">Bedrooms</th>
                          <th className="text-left p-2">Original Price (AED)</th>
                          <th className="text-left p-2">Unit Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unitDetails.map((unit) => (
                          <tr
                            key={unit._id}
                            className="border-b hover:bg-gray-50 dark:hover:bg-black/80 cursor-pointer"
                            onClick={() => window.open(`/dashboard/properties/inventory-details/${unit._id}`, "_blank")}
                          >
                            <td className="p-2 font-medium">{unit.unitNumber}</td>
                            <td className="p-2">{unit.unitHeight || "N/A"}</td>
                            <td className="p-2">{unit.noOfBedRooms || "N/A"}</td>
                            <td className="p-2">
                              {unit.originalPrice ? `${unit.originalPrice.toLocaleString()} AED` : "N/A"}
                            </td>
                            <td className="p-2">{unit.unitPurpose || "N/A"}</td>
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

            {/* Plot Details */}
            <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
              <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Plot Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {plotData ? (
                  <div className="space-y-4">
                    <InfoCard
                      icon={<Warehouse className="h-5 w-5 text-primary" />}
                      label="Plot Number"
                      value={plotData.plotNumber ? plotData.plotNumber.toString() : "N/A"}
                    />
                    <InfoCard
                      icon={<Ruler className="h-5 w-5 text-primary" />}
                      label="Plot Size"
                      value={plotData.plotSizeSqFt ? `${plotData.plotSizeSqFt} sq ft` : "N/A"}
                    />
                    <InfoCard
                      icon={<Ruler className="h-5 w-5 text-primary" />}
                      label="BUA Area"
                      value={plotData.buaAreaSqFt ? `${plotData.buaAreaSqFt} sq ft` : "N/A"}
                    />
                    <InfoCard
                      icon={<Ruler className="h-5 w-5 text-primary" />}
                      label="Plot BUA"
                      value={plotData.plotBUASqFt ? `${plotData.plotBUASqFt} sq ft` : "N/A"}
                    />
                    <InfoCard
                      icon={<Ruler className="h-5 w-5 text-primary" />}
                      label="Plot Height"
                      value={plotData.plotHeight ? plotData.plotHeight.toString() : "N/A"}
                    />
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Plot Status</div>
                      <Badge variant="outline" className="bg-primary/10 border-primary/30">
                        {plotData.plotStatus || "N/A"}
                      </Badge>
                    </div>
                    {plotData.plotPermission && plotData.plotPermission.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Plot Permission</div>
                        <div className="flex flex-wrap gap-2">
                          {plotData.plotPermission.map((permission, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm capitalize">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-gray-50/50 dark:bg-black/20 rounded-lg border border-dashed">
                    <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No Plot Details Available</p>
                    <p className="text-sm mt-1">This property doesn't have plot information</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unit Summary */}
            {unitDetails.length > 0 ? (
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
                <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                  <CardTitle className="text-xl">Unit Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Total Units</div>
                      <div className="text-md font-medium">{unitDetails.length}</div>
                    </div>

                    {unitDetails.some((unit) => unit.noOfBedRooms) && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Bedroom Options</div>
                        <div className="text-md font-medium">
                          {Array.from(new Set(unitDetails.map((unit) => unit.noOfBedRooms).filter(Boolean)))
                            .sort()
                            .join(", ")}
                        </div>
                      </div>
                    )}

                    {unitDetails.some((unit) => unit.BuaSqFt > 0) && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Size Range</div>
                        <div className="text-md font-medium">
                          {Math.min(...unitDetails.map((unit) => unit.BuaSqFt || 0).filter(Boolean))} -
                          {Math.max(...unitDetails.map((unit) => unit.BuaSqFt || 0))} sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-black">
                <CardHeader className="bg-gray-50 dark:bg-black/90 pb-2">
                  <CardTitle className="text-xl">Unit Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center py-4 text-muted-foreground bg-gray-50/50 dark:bg-black/20 rounded-lg border border-dashed">
                    <Bed className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No units available</p>
                  </div>
                </CardContent>
              </Card>
            )}

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
