"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import {
  Mail,
  Phone,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Car,
  ChevronLeft,
  ChevronRight,
  Tag,
  Heart,
  Share2,
  Calendar,
  Building,
  Home,
  Landmark,
  DollarSign,
  CheckCircle2,
  Pickaxe, 
  UserRound, 
  HousePlus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@apollo/client" 
import { formatDate } from "@/lib/method"
import { GET_PROPERTY } from "@/lib/query"

// Default image to use when images array is empty
const DEFAULT_IMAGE = "/placeholder.svg?height=600&width=800"

type Props = {
  params: {
    preview: string
  }
}

export default function PropertyDetail({ params }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [propertyData, setPropertyData] = useState<any>({})
  const [isSliding, setIsSliding] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const { loading, error, data } = useQuery(GET_PROPERTY, {
    variables: { docId: params.preview || "" },
    skip: !params.preview,
  })

  useEffect(() => {
    if (data) {
      console.log("Query result:", data)
      setPropertyData(data?.getProperty)
    }
  }, [data])

  if (!params.preview) {
    return (
      <div className="container mx-auto p-8 text-center">
        No preview ID provided. Please provide a valid document ID.
      </div>
    )
  }

  if (loading)
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-xl">Loading property details...</div>
      </div>
    )

  if (error) return <div className="container mx-auto p-8 text-center text-red-500">Error: {error.message}</div>

  const images = propertyData?.images?.length ? propertyData.images : [DEFAULT_IMAGE]
  const unitView = Array.isArray(propertyData?.unitView) ? propertyData.unitView : []

  if (!propertyData || Object.keys(propertyData).length === 0) {
    return <div className="container mx-auto p-8 text-center">No property data found for the given preview ID.</div>
  }

  const nextImage = () => {
    setIsSliding(true)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setTimeout(() => setIsSliding(false), 300)
  }

  const prevImage = () => {
    setIsSliding(true)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
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
      nextImage()
    } else if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right
      prevImage()
    }
  }

  const getIconForKey = (key: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "property id": <Building className="h-5 w-5 text-primary" />,
      "Road Location": <MapPin className="h-5 w-5 text-primary" />,
      "Development Name": <Landmark className="h-5 w-5 text-primary" />,
      "Project Name": <Home className="h-5 w-5 text-primary" />,
      "Primary Price": <DollarSign className="h-5 w-5 text-primary" />,
      "Created At": <Calendar className="h-5 w-5 text-primary" />,
    }

    return iconMap[key] || <CheckCircle2 className="h-5 w-5 text-primary" />
  }  
  const handleGmail = () => { 
      const recipient = "recipient@example.com";
      const subject = "Your Subject";
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}`;
      window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Property Title Section */}
       

        {/* Image Slider Section */}
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg">
          <div
            ref={sliderRef}
            className={`relative h-[60vh] w-full transition-transform duration-300 ease-in-out ${isSliding ? "opacity-90" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={images[currentImageIndex] || DEFAULT_IMAGE}
              alt={propertyData["Project Name"] || "Property image"}
              fill
              className="object-cover"
              priority
            />

            {/* Thumbnail navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background/70 p-2 rounded-full">
              {images.map((_:string, index:number) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsSliding(true)
                    setCurrentImageIndex(index)
                    setTimeout(() => setIsSliding(false), 300)
                  }}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-muted"}`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>

            {/* Image navigation controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 hover:opacity-100 bg-background/50 backdrop-blur-sm"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Image counter */}
            <div className="absolute top-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column - Key Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Key Stats */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 sm:grid-cols-4">
                  <div className="flex flex-col items-center justify-center gap-2 p-6 border-r border-b">
                    <BedDouble className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">{propertyData["Bedrooms"] || "N/A"}</span>
                    <span className="text-xs text-muted-foreground">Bedrooms</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 p-6 border-b sm:border-r">
                    <HousePlus className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">{propertyData["unitNumber"] ?? 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">unitNumber</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 p-6 border-r">
                    <Building className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">{propertyData["propertyHeight"] || "N/A"}</span>
                    <span className="text-xs text-muted-foreground">Property Height</span>
                    {/* 67bcb259fe5b650fcb1b1a13 */}
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 p-6">
                    <Pickaxe  className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">{propertyData["developmentName"] || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">Developer</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Features & Amenities</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {unitView.length > 0 ? (
                  unitView.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm capitalize">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No features listed for this property</p>
                )}
              </div>
            </div>

            {/* Property Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Property Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {propertyData["Description"] ||
                  `This stunning ${propertyData["Property Type"] || "property"} located in ${propertyData["Project Location"] || "a prime location"} 
                  offers modern living with ${propertyData["Bedrooms"] || "multiple"} bedrooms and a spacious layout. 
                  The property features ${unitView.join(", ") || "various amenities"} for a comfortable lifestyle.`}
              </p>
            </div>

            {/* Detailed Property Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Property Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                
{Object.entries(propertyData)
  .filter(
    ([key, value]) =>
      !["_id", "propertyImages", "listed","bedrooms", "unitView","unitNumber", "__typename", "primaryPrice", "resalePrice", "Rental", "premiumAndLoss", "propertyHeight", "developmentName"].includes(key)
  )
  .map(([key, value]) => (
    <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
      {getIconForKey(key)}
      <div>
        <span className="text-xs text-muted-foreground capitalize block">{key}</span>
        <span className="font-medium">
          {key === "createdAt" ? value.slice(0,10) : value ?? "N/A"}
        </span>
      </div>
    </div>
  ))}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="text-md font-normal text-primary">{propertyData["Primary Price"] ?? "N/A"}</div>
                  </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Resale Price</div>
                      <div className="text-md font-normal">{propertyData["Resale Price"] ?? "N/A"}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Rental</div>
                      <div className="text-md font-normal">{propertyData["Rent"] ?? "N/A"}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Premium&Loss</div>
                      <div className="text-md font-normal">{propertyData["premiumAndLoss"] ?? "N/A"}</div>
                    </div>
                    
                  <Separator />

                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Property ID</div>
                      <div className="font-medium">{propertyData["_id"]}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Listed</div>
                      <div className="font-medium">{propertyData["Listed"] ? "Yes" : "No"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Agent */}
            <Card>
  <CardContent className="p-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Agent</h3>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-200 rounded-full">
          <UserRound className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <div className="font-semibold">Jane Smith</div>
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


            {/* Schedule Viewing */}
            <Card>
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
      </div>
    </div>
  )
}

