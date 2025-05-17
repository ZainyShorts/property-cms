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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
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
  masterDevelopment: string
  subDevelopment: string
  __v: number
}

interface MasterDevelopment {
  _id: string
  roadLocation: string
  developmentName: string
}

interface SubDevelopment {
  _id: string
  subDevelopment: string
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
  type: "image" | "video"
  url: string
  title: string
}

export default function PropertyDetail({ params }: Props) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0)
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
  const [masterDevelopment, setMasterDevelopment] = useState<MasterDevelopment | null>(null)
  const [subDevelopment, setSubDevelopment] = useState<SubDevelopment | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isSliding, setIsSliding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.preview) return

      try {
        setLoading(true)

        // Fetch property data, documents, master development and sub development in parallel
        const [propertyResponse, documentsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/project/${params.preview}`),
          axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/document/byRefId/${params.preview}`),
        ])

        console.log("Property API response:", propertyResponse.data)
        console.log("Documents API response:", documentsResponse.data)

        const property = propertyResponse.data
        setPropertyData(property)

        // Fetch master development if available
        if (property.masterDevelopment) {
          try {
            const masterDevResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment/${property.masterDevelopment}`,
            )
            setMasterDevelopment(masterDevResponse.data)
          } catch (err) {
            console.error("Error fetching master development:", err)
          }
        }

        // Fetch sub development if available
        if (property.subDevelopment) {
          try {
            const subDevResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment/${property.subDevelopment}`,
            )
            setSubDevelopment(subDevResponse.data)
          } catch (err) {
            console.error("Error fetching sub development:", err)
          }
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

  if (loading) return <Skeleton />

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Media Slider Section */}
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg bg-background">
          <div
            ref={sliderRef}
            className={`relative h-[60vh] w-full transition-transform duration-300 ease-in-out ${isSliding ? "opacity-90" : ""}`}
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
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/20 text-white border-primary/30">
                  {propertyData.salesStatus}
                </Badge>
                <Badge variant="outline" className="bg-primary/20 text-white border-primary/30">
                  {propertyData.propertyType}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{propertyData.projectName}</h1>
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
                  <Image className="h-4 w-4" /> Image
                </>
              )}
            </div>
          </div>
        </div>

        {/* Property Details Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
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
                        <Building className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.propertyType}</span>
                        <span className="text-xs text-muted-foreground">Property Type</span>
                      </div>
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6 border-b sm:border-r dark:border-border">
                        <Tag className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.salesStatus}</span>
                        <span className="text-xs text-muted-foreground">Sales Status</span>
                      </div>
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6 border-r dark:border-border">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.projectQuality}</span>
                        <span className="text-xs text-muted-foreground">Project Quality</span>
                      </div>
                      <div className="flex flex-col items-center bg-transparent justify-center gap-2 p-6">
                        <Hourglass className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">{propertyData.percentOfConstruction}%</span>
                        <span className="text-xs text-muted-foreground">Construction</span>
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
                          <span className="font-medium">{propertyData.projectName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Property Type</span>
                          <span className="font-medium">{propertyData.propertyType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Landmark className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Master Development</span>
                          <span className="font-medium">{masterDevelopment?.developmentName || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Road Location</span>
                          <span className="font-medium">{masterDevelopment?.roadLocation || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Landmark className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Sub Development</span>
                          <span className="font-medium">{subDevelopment?.subDevelopment || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Project Quality</span>
                          <span className="font-medium">{propertyData.projectQuality}</span>
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
                          {propertyData.amenitiesCategories && propertyData.amenitiesCategories.length > 0 ? (
                            propertyData.amenitiesCategories.map((amenity, index) => (
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
                          {propertyData.facilityCategories && propertyData.facilityCategories.length > 0 ? (
                            propertyData.facilityCategories.map((facility, index) => (
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

                {/* Documents Section - Keep as is */}
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
            </div>

            {/* Right Column - Construction & Contact */}
            <div className="space-y-6">
              {/* Construction Status Card */}
              <Card className="overflow-hidden border dark:border-border bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Construction Status</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="w-full bg-muted rounded-full h-4 dark:bg-muted/30">
                      <div
                        className="bg-primary h-4 rounded-full"
                        style={{ width: `${propertyData.percentOfConstruction}%` }}
                      ></div>
                    </div>
                    <div className="text-center font-medium">{propertyData.percentOfConstruction}% Complete</div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Construction Status</div>
                      <div className="text-md font-normal">{propertyData.constructionStatus}</div>
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

              {/* Important Dates */}
              <Card className="border dark:border-border bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Launch Date</div>
                      <div className="text-md font-normal">{formatDate(propertyData.launchDate)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Completion Date</div>
                      <div className="text-md font-normal">{formatDate(propertyData.completionDate)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Installment Date</div>
                      <div className="text-md font-normal">{formatDate(propertyData.installmentDate)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Upon Completion</div>
                      <div className="text-md font-normal">{formatDate(propertyData.uponCompletion)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Post Handover</div>
                      <div className="text-md font-normal">{formatDate(propertyData.postHandOver)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Agent - Keep as is */}
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
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                        <span>Down Payment</span>
                      </div>
                      <span className="font-semibold text-lg">{propertyData.downPayment}%</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Timeline</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Installment Date</span>
                          <span className="font-medium">{formatDate(propertyData.installmentDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Upon Completion</span>
                          <span className="font-medium">{formatDate(propertyData.uponCompletion)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Post Handover</span>
                          <span className="font-medium">{formatDate(propertyData.postHandOver)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Construction Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{propertyData.percentOfConstruction}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 dark:bg-muted/30">
                      <div
                        className="bg-primary h-4 rounded-full"
                        style={{ width: `${propertyData.percentOfConstruction}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Construction Status</span>
                        <span className="font-medium">{propertyData.constructionStatus}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Launch Date</span>
                        <span className="font-medium">{formatDate(propertyData.launchDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-border">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Completion Date</span>
                        <span className="font-medium">{formatDate(propertyData.completionDate)}</span>
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
