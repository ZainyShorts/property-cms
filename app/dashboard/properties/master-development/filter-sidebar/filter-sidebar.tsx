import { useState } from "react"
import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox" 
import { useDispatch, useSelector } from "react-redux"
import { setDevelopmentName , 
  setRoadLocation,
  setLocationQuality,
  setBuaAreaSqFtRange,
  setTotalAreaSqFtRange,
  setFacilitiesCategories,
  setAmentiesCategories,
 } from "@/lib/store/slices/masterFilterSlice"
import { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const facilitiesCategoriesOptions = ["Shops", "Hospitals", "Public Transport"]

const amenitiesCategoriesOptions = [
  "Gym",
  "Swimming Pool",
  "Clubhouse",
  "Children Play Area",
  "Banquet Hall",
  "CCTV Surveillance",
  "Rainwater Harvesting",
  "Spa",
  "Tennis Court",
  "Yoga Deck",
]

const locationQualityOptions = ["A", "B", "C"]

export function FilterSidebar({ open, onOpenChange }: FilterSidebarProps) { 
  const dispatch = useDispatch()
  const filters = useSelector((state: RootState) => state.masterFilter)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    switch (name) {
      case "developmentName":
        dispatch(setDevelopmentName(value))
        break
      case "roadLocation":
        dispatch(setRoadLocation(value))
        break
    }
  }

  const handleLocationQualityChange = (value: string) => {
    dispatch(setLocationQuality(value))
  }

  const handleCheckboxChange = (
    category: "facilitiesCategories" | "amentiesCategories",
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[category] || []
    const updated = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value)

    if (category === "facilitiesCategories") {
      dispatch(setFacilitiesCategories(updated))
    } else {
      dispatch(setAmentiesCategories(updated))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Property Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect property.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
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

          {/* Development Name */}
          <div className="space-y-2">
            <Label htmlFor="developmentName">Development Name</Label>
            <Input
              id="developmentName"
              name="developmentName"
              placeholder="Enter development name"
              value={filters.developmentName}
              onChange={handleInputChange}
            />
          </div>

          {/* Location Quality - Now a dropdown */}
          <div className="space-y-2">
            <Label>Location Quality</Label>
            <Select 
              value={filters.locationQuality || ""}
              onValueChange={handleLocationQualityChange}
            >
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