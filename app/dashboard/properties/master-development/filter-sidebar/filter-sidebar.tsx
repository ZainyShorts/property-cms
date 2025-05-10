"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  setCity,
  setCountry,
  setDevelopmentName,
  setRoadLocation,
  setLocationQuality,
  setFacilitiesCategories,
  setAmentiesCategories,
} from "@/lib/store/slices/masterFilterSlice"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { countries } from "../data/data"
import { getCitiesByCountry } from "../data/data"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

interface FilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface FilterValues {
  developmentName?: string
  roadLocation?: string
  locationQuality?: string
  buaAreaSqFtRange?: { min?: number; max?: number }
  totalAreaSqFtRange?: { min?: number; max?: number }
  facilitiesCategories?: string[]
  amentiesCategories?: string[]
}

interface MasterDevelopment {
  _id: string
  developmentName: string
}

const facilitiesCategoriesOptions = [
  "Shops",
  "School",
  "Petrol Pump",
  "Hospitals",
  "Clinics",
  "Malls",
  "Public Transport",
]

const amenitiesCategoriesOptions = [
  "Gym",
  "Swimming Pool",
  "Sauna",
  "Steam Room",
  "Yoga Room",
  "Aerobics Studio",
  "Jogging / walking tracks",
  "Tennis Court",
  "Badminton Court",
  "Basketball Court",
  "Cricket Ground",
  "Table Tennis",
  "Billiards",
  "Clubhouse",
  "Dance Studio",
  "Mini Golf",
  "Padel Tennis",
  "Landscaped Garden",
  "Park",
  "Playground",
  "Picnic Area",
  "Barbecue / grill stations",
  "Pet Park",
  "Water Park",
  "Roof gardens, Sky Decks",
  "Community farming, Garden plots",
  "Children Play Area",
  "Daycare / Nursery",
  "Kids Pool",
  "Teen lounge / Game zone",
  "Education center / Library",
  "Grocery",
  "ATM / Bank Kios",
  "Café / Restaurant/ Food Court",
  "Laundry",
  "Business Center",
  "Lockers",
  "Concierge / Help Desk",
  "Covered Parking",
  "Visitor Parking",
  "EV Charging Station",
  "Bicycle racks / storage",
  "Shuttle Service / Transport access",
  "24/7 Security",
  "CCTV Surveillance",
  "Gated Access",
  "Intercom system",
  "Fire Safety Systems",
  "Rainwater Harvesting",
  "Solar Panels",
  "Smart Home Features",
  "Banquet Hall",
  "Private theater / Mini cinema",
  "Amphitheater",
  "Music Room / Jamming studio",
  "Karaoke Room",
  "Lounge / Rooftop Bar",
  "Hobby Room",
  "Community Kitchen",
  "Book café or Reading Lounge",
  "On-call medical services / Nurse station",
  "Prayer Hall",
  "Handyman on-call services",
  "Pest control & Fumigation Support",
  "Green Building Certification",
  "Community Recycling Points",
]

const locationQualityOptions = ["A", "B", "C"]

export function FilterSidebar({ open, onOpenChange }: FilterSidebarProps) {
  const dispatch = useDispatch()
  const filters = useSelector((state: RootState) => state.masterFilter)
  const [availableCities, setAvailableCities] = useState<{ id: string; name: string }[]>([])

  // Development name search states
  const [devNameSearchTerm, setDevNameSearchTerm] = useState("")
  const [isSearchingDevName, setIsSearchingDevName] = useState(false)
  const [devNameResults, setDevNameResults] = useState<MasterDevelopment[]>([])
  const devNameSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle country change
  const handleCountryChange = (country: string) => {
    dispatch(setCountry(country))
    dispatch(setCity("")) // Reset city when country changes
  }

  // Handle city change
  const handleCityChange = (city: string) => {
    dispatch(setCity(city))
  }

  // Update available cities when country changes
  useEffect(() => {
    if (filters.country) {
      const cities = getCitiesByCountry(filters.country)
      setAvailableCities(cities)
    } else {
      setAvailableCities([])
    }
  }, [filters.country])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "developmentNameQuery") {
      setDevNameSearchTerm(value)

      // Clear previous timeout
      if (devNameSearchTimeoutRef.current) {
        clearTimeout(devNameSearchTimeoutRef.current)
      }

      // Set searching state
      setIsSearchingDevName(true)

      // Set a new timeout for debouncing
      devNameSearchTimeoutRef.current = setTimeout(() => {
        fetchDevelopmentNames(value)
      }, 300) // 300ms debounce time
    } else if (name === "roadLocation") {
      dispatch(setRoadLocation(value))
    }
  }

  const handleLocationQualityChange = (value: string) => {
    dispatch(setLocationQuality(value))
  }

  const handleCheckboxChange = (
    category: "facilitiesCategories" | "amentiesCategories",
    value: string,
    checked: boolean,
  ) => {
    const currentValues = filters[category] || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)

    if (category === "facilitiesCategories") {
      dispatch(setFacilitiesCategories(updated))
    } else {
      dispatch(setAmentiesCategories(updated))
    }
  }

  // Fetch development names
  const fetchDevelopmentNames = async (searchTerm = "") => {
    setIsSearchingDevName(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment`

      // Add search parameter if provided
      if (searchTerm) {
        url += `?developmentName=${encodeURIComponent(searchTerm)}`
      }

      const response = await axios.get(url)

      if (response.data && Array.isArray(response.data.data)) {
        setDevNameResults(response.data.data)
      } else {
        setDevNameResults([])
        console.error("Invalid response format for development names:", response.data)
      }
    } catch (error) {
      console.error("Error fetching development names:", error)
      setDevNameResults([])
    } finally {
      setIsSearchingDevName(false)
    }
  }

  // Fetch all development names on component mount
  useEffect(() => {
    if (open) {
      fetchDevelopmentNames(devNameSearchTerm)
    }
  }, [open, devNameSearchTerm])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (devNameSearchTimeoutRef.current) {
        clearTimeout(devNameSearchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Property Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect property.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Country Dropdown */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={filters.country || ""} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-2">
            <Label>City</Label>
            <Select value={filters.city || ""} onValueChange={handleCityChange} disabled={!filters.country}>
              <SelectTrigger>
                <SelectValue placeholder={filters.country ? "Select city" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Road Location */}
          <div className="space-y-2">
            <Label htmlFor="roadLocation">Road Location</Label>
            <Input
              id="roadLocation"
              name="roadLocation"
              placeholder="Enter road location"
              value={filters.roadLocation}
              onChange={handleInputChange}
            />
          </div>

          {/* Development Name Dropdown */} 
            <div className="space-y-2"> 
                          <Label htmlFor="developmentName">Development Name</Label>

            <div className="relative">
              <Input
                id="developmentNameQuery"
                name="developmentNameQuery"
                placeholder="Search development names..."
                value={devNameSearchTerm}
                onChange={handleInputChange}
                className="pr-10"
              />
              {isSearchingDevName ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Select
                value={filters.developmentName || ""}
                onValueChange={(value) => dispatch(setDevelopmentName(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select development" />
                </SelectTrigger>
                <SelectContent>
                  {isSearchingDevName ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    devNameResults.map((dev) => (
                      <SelectItem key={dev._id} value={dev.developmentName}>
                        {dev.developmentName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Development Name Search Query */}
        

          {/* Location Quality - Now a dropdown */}
          <div className="space-y-2">
            <Label>Location Quality</Label>
            <Select value={filters.locationQuality || ""} onValueChange={handleLocationQualityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select location quality" />
              </SelectTrigger>
              <SelectContent>
                {locationQualityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Facilities Categories */}
          <div className="space-y-3">
            <Label className="text-base">Facilities Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {facilitiesCategoriesOptions.map((facility) => (
                <div key={facility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={filters.facilitiesCategories?.includes(facility) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("facilitiesCategories", facility, checked as boolean)
                    }
                  />
                  <Label htmlFor={`facility-${facility}`} className="text-sm font-normal">
                    {facility}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Categories */}
          <div className="space-y-3">
            <Label className="text-base">Amenities Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesCategoriesOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amentiesCategories?.includes(amenity) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("amentiesCategories", amenity, checked as boolean)
                    }
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
