"use client"

import type React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useDispatch, useSelector } from "react-redux"
import {
  setSubDevelopment,
  setPlotNumber,
  setPlotPermission,
  setPlotStatus,
  setFacilitiesCategories,
  setAmentiesCategories,
  resetSubDevFilter,
} from "@/lib/store/slices/subDevFilterSlice"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SubDevFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface SubDevFilterValues {
  subDevelopment?: string
  plotNumber?: number
  plotPermission?: string[]
  plotStatus?: string
  facilitiesCategories?: string[]
  amentiesCategories?: string[]
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

const plotPermissionOptions = [
  "Apartment",
  "Shops",
  "Offices",
  "Hotel",
  "Townhouse",
  "Villas",
  "Mansions",
  "Showroom",
  "Warehouse",
  "Labour Camp",
  "Hospital",
  "School",
  "Bungalow",
]

const plotStatusOptions = ["Available", "Sold", "Reserved", "Under Construction"]

export function SubDevFilterSidebar({ open, onOpenChange }: SubDevFilterSidebarProps) {
  const dispatch = useDispatch()
  const filters = useSelector((state: RootState) => state.subDevFilter)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    switch (name) {
      case "subDevelopment":
        dispatch(setSubDevelopment(value))
        break
      case "plotNumber":
        const plotNum = value ? Number.parseInt(value, 10) : undefined
        if (!isNaN(plotNum as number)) {
          dispatch(setPlotNumber(plotNum as number))
        }
        break
    }
  }

  const handlePlotPermissionChange = (value: string, checked: boolean) => {
    const currentValues = filters.plotPermission || []
    const updated = checked 
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value)
    dispatch(setPlotPermission(updated))
  }

  const handlePlotStatusChange = (value: string) => {
    dispatch(setPlotStatus(value))
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

  const handleReset = () => {
    dispatch(resetSubDevFilter())
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Sub-Development Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect plot.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Sub Development */}
          <div className="space-y-2">
            <Label htmlFor="subDevelopment">Sub Development</Label>
            <Input
              id="subDevelopment"
              name="subDevelopment"
              placeholder="Enter sub development name"
              value={filters.subDevelopment || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Plot Number */}
          <div className="space-y-2">
            <Label htmlFor="plotNumber">Plot Number</Label>
            <Input
              id="plotNumber"
              name="plotNumber"
              type="number"
              placeholder="Enter plot number"
              value={filters.plotNumber || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Plot Permission */}
          <div className="space-y-3">
            <Label className="text-base">Plot Permission</Label>
            <div className="grid grid-cols-2 gap-2">
              {plotPermissionOptions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission}`}
                    checked={filters.plotPermission?.includes(permission) || false}
                    onCheckedChange={(checked) =>
                      handlePlotPermissionChange(permission, checked as boolean)
                    }
                  />
                  <Label htmlFor={`permission-${permission}`} className="text-sm font-normal">
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Plot Status */}
          <div className="space-y-2">
            <Label>Plot Status</Label>
            <Select value={filters.plotStatus || ""} onValueChange={handlePlotStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select plot status" />
              </SelectTrigger>
              <SelectContent>
                {plotStatusOptions.map((option) => (
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

          {/* Reset Button */}
          <div className="pt-4">
            <Button variant="outline" onClick={handleReset} className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}