import { useState } from "react"
import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface FilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilters: (filters: FilterValues) => void
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

export function FilterSidebar({ open, onOpenChange, onApplyFilters }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    developmentName: "",
    roadLocation: "",
    locationQuality: "",
    buaAreaSqFtRange: { min: undefined, max: undefined },
    totalAreaSqFtRange: { min: undefined, max: undefined },
    facilitiesCategories: [],
    amentiesCategories: [],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleRangeChange = (
    rangeType: "buaAreaSqFtRange" | "totalAreaSqFtRange",
    field: "min" | "max",
    value: string
  ) => {
    const numValue = value === "" ? undefined : Number(value)
    setFilters((prev) => ({
      ...prev,
      [rangeType]: {
        ...prev[rangeType],
        [field]: numValue,
      },
    }))
  }

  const handleCheckboxChange = (
    category: "facilitiesCategories" | "amentiesCategories",
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const currentValues = prev[category] || []
      return {
        ...prev,
        [category]: checked
          ? [...currentValues, value]
          : currentValues.filter((item) => item !== value),
      }
    })
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onOpenChange(false)
  }

  const handleResetFilters = () => {
    setFilters({
      developmentName: "",
      roadLocation: "",
      locationQuality: "",
      buaAreaSqFtRange: { min: undefined, max: undefined },
      totalAreaSqFtRange: { min: undefined, max: undefined },
      facilitiesCategories: [],
      amentiesCategories: [],
    })
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

          {/* Location Quality */}
          <div className="space-y-2">
            <Label htmlFor="locationQuality">Location Quality</Label>
            <Input
              id="locationQuality"
              name="locationQuality"
              placeholder="Enter location quality"
              value={filters.locationQuality}
              onChange={handleInputChange}
            />
          </div>

          <Separator />

          {/* BUA Area Range */}
          <div className="space-y-2">
            <Label>BUA Area (Sq Ft) Range</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.buaAreaSqFtRange?.min || ""}
                  onChange={(e) => handleRangeChange("buaAreaSqFtRange", "min", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.buaAreaSqFtRange?.max || ""}
                  onChange={(e) => handleRangeChange("buaAreaSqFtRange", "max", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Total Area Range */}
          <div className="space-y-2">
            <Label>Total Area (Sq Ft) Range</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.totalAreaSqFtRange?.min || ""}
                  onChange={(e) => handleRangeChange("totalAreaSqFtRange", "min", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.totalAreaSqFtRange?.max || ""}
                  onChange={(e) => handleRangeChange("totalAreaSqFtRange", "max", e.target.value)}
                />
              </div>
            </div>
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

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
